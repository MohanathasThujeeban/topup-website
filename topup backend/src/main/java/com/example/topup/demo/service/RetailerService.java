package com.example.topup.demo.service;

import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.RetailerProfit;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.Order.OrderStatus;
import com.example.topup.demo.repository.OrderRepository;
import com.example.topup.demo.repository.ProductRepository;
import com.example.topup.demo.repository.UserRepository;
import com.example.topup.demo.repository.RetailerProfitRepository;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.RetailerLimitRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class RetailerService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RetailerProfitRepository profitRepository;
    
    @Autowired
    private RetailerOrderRepository retailerOrderRepository;
    
    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    // Get all orders for a retailer
    public List<Order> getOrdersByRetailer(User retailer) {
        return orderRepository.findByRetailerOrderByCreatedDateDesc(retailer);
    }

    // Get orders by status for a retailer
    public List<Order> getOrdersByRetailerAndStatus(User retailer, OrderStatus status) {
        return orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(retailer, status);
    }

    // Get products available to retailers
    public List<Product> getAvailableProducts() {
        return productRepository.findByStatusAndIsVisible(Product.ProductStatus.ACTIVE, true);
    }

    // Get products with stock information
    public List<Product> getProductsWithStock() {
        return productRepository.findByStatusAndStockQuantityGreaterThan(Product.ProductStatus.ACTIVE, 0);
    }

    // Create a new order
    public Order createOrder(User retailer, String productId, String customerName, 
                           String customerEmail, String customerPhone, Integer quantity) {
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        BigDecimal totalAmount = product.getBasePrice().multiply(BigDecimal.valueOf(quantity));
        
        Order order = new Order(retailer, product, customerName, customerEmail, totalAmount, quantity);
        order.setCustomerPhone(customerPhone);
        
        // Update product stock
        product.setStockQuantity(product.getStockQuantity() - quantity);
        product.setSoldQuantity(product.getSoldQuantity() + quantity);
        productRepository.save(product);
        
        return orderRepository.save(order);
    }

    // Update order status
    public Order updateOrderStatus(String orderId, OrderStatus status, User retailer) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify the order belongs to this retailer
        if (!order.getRetailer().getId().equals(retailer.getId())) {
            throw new RuntimeException("Unauthorized access to order");
        }
        
        order.setStatus(status);
        return orderRepository.save(order);
    }

    // Get analytics for a retailer
    public Map<String, Object> getRetailerAnalytics(User retailer) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get current month data
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        
        // Total orders
        long totalOrders = orderRepository.countByRetailer(retailer);
        analytics.put("totalOrders", totalOrders);
        
        // Pending orders
        long pendingOrders = orderRepository.countByRetailerAndStatus(retailer, OrderStatus.PENDING);
        analytics.put("pendingOrders", pendingOrders);
        
        // Calculate total revenue from retailer's used credit (this is the actual lifetime revenue)
        // Every sale deducts from credit, so usedCredit = total earnings
        BigDecimal totalRevenue = BigDecimal.ZERO;
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer(retailer);
        if (limitOpt.isPresent()) {
            RetailerLimit limit = limitOpt.get();
            if (limit.getUsedCredit() != null) {
                totalRevenue = limit.getUsedCredit();
            }
        }
        analytics.put("totalRevenue", totalRevenue);
        
        // Get old orders for customer sales count
        List<Order> soldOrders = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
            retailer, OrderStatus.SOLD);
        
        // Get POS sales from RetailerOrder (new system)
        List<RetailerOrder> posSales = retailerOrderRepository.findByRetailerIdAndStatus(
            retailer.getId(), RetailerOrder.OrderStatus.COMPLETED);
        
        // Add customer sales count (POS transactions from both systems)
        long customerSales = soldOrders.size() + posSales.size();
        analytics.put("customerSales", customerSales);
        
        // Calculate eSIM and ePIN sales/earnings from RetailerOrder
        long esimCount = posSales.stream()
            .flatMap(order -> order.getItems().stream())
            .filter(item -> {
                String cat = item.getCategory() != null ? item.getCategory() : "";
                String type = item.getProductType() != null ? item.getProductType() : "";
                return cat.toLowerCase().contains("esim") || type.toLowerCase().contains("esim");
            })
            .mapToInt(RetailerOrder.OrderItem::getQuantity)
            .sum();
        
        long epinCount = posSales.stream()
            .flatMap(order -> order.getItems().stream())
            .filter(item -> {
                String cat = item.getCategory() != null ? item.getCategory() : "";
                String type = item.getProductType() != null ? item.getProductType() : "";
                return !cat.toLowerCase().contains("esim") && !type.toLowerCase().contains("esim");
            })
            .mapToInt(RetailerOrder.OrderItem::getQuantity)
            .sum();
        
        BigDecimal esimEarnings = posSales.stream()
            .flatMap(order -> order.getItems().stream())
            .filter(item -> {
                String cat = item.getCategory() != null ? item.getCategory() : "";
                String type = item.getProductType() != null ? item.getProductType() : "";
                return cat.toLowerCase().contains("esim") || type.toLowerCase().contains("esim");
            })
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal epinEarnings = posSales.stream()
            .flatMap(order -> order.getItems().stream())
            .filter(item -> {
                String cat = item.getCategory() != null ? item.getCategory() : "";
                String type = item.getProductType() != null ? item.getProductType() : "";
                return !cat.toLowerCase().contains("esim") && !type.toLowerCase().contains("esim");
            })
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        analytics.put("totalEsimSold", esimCount);
        analytics.put("totalEpinSold", epinCount);
        analytics.put("esimEarnings", esimEarnings);
        analytics.put("epinEarnings", epinEarnings);
        
        // Get profit from RetailerProfit records (all yearly records to calculate total)
        List<RetailerProfit> profits = profitRepository.findByRetailer_IdAndPeriod(retailer.getId(), "yearly");
        BigDecimal totalProfit = profits.stream()
            .map(RetailerProfit::getProfit)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.put("totalProfit", totalProfit);
        
        // Monthly growth calculation
        long currentMonthOrders = orderRepository.countByRetailerAndDateRange(
            retailer, startOfMonth, now);
        long lastMonthOrders = orderRepository.countByRetailerAndDateRange(
            retailer, startOfLastMonth, startOfMonth);
        
        double orderGrowth = 0.0;
        if (lastMonthOrders > 0) {
            orderGrowth = ((double) (currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
        }
        analytics.put("orderGrowth", Math.round(orderGrowth * 100.0) / 100.0);
        
        // Monthly revenue growth
        BigDecimal currentMonthRevenue = getCurrentMonthRevenue(retailer, startOfMonth, now);
        BigDecimal lastMonthRevenue = getCurrentMonthRevenue(retailer, startOfLastMonth, startOfMonth);
        
        double revenueGrowth = 0.0;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueGrowth = currentMonthRevenue.subtract(lastMonthRevenue)
                .divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }
        analytics.put("monthlyGrowth", Math.round(revenueGrowth * 100.0) / 100.0);
        
        // Success rate calculation (include both COMPLETED and SOLD orders as successful)
        long completedOrdersCount = orderRepository.countByRetailerAndStatus(retailer, OrderStatus.COMPLETED);
        long soldOrdersCount = orderRepository.countByRetailerAndStatus(retailer, OrderStatus.SOLD);
        long successfulOrders = completedOrdersCount + soldOrdersCount;
        double successRate = totalOrders > 0 ? ((double) successfulOrders / totalOrders) * 100 : 0;
        analytics.put("successRate", Math.round(successRate * 100.0) / 100.0);
        
        // Top products
        analytics.put("topProducts", getTopProducts(retailer));
        
        // Customer insights
        Map<String, Object> customerInsights = new HashMap<>();
        customerInsights.put("newCustomers", getNewCustomersCount(retailer, startOfMonth, now));
        customerInsights.put("repeatCustomers", getRepeatCustomersCount(retailer));
        customerInsights.put("retentionRate", calculateRetentionRate(retailer));
        analytics.put("customerInsights", customerInsights);
        
        // Sales performance
        Map<String, Object> salesPerformance = new HashMap<>();
        salesPerformance.put("daily", getDailySalesGrowth(retailer));
        salesPerformance.put("weekly", getWeeklySalesGrowth(retailer));
        salesPerformance.put("monthly", revenueGrowth);
        analytics.put("salesPerformance", salesPerformance);
        
        return analytics;
    }
    
    private BigDecimal getCurrentMonthRevenue(User retailer, LocalDateTime start, LocalDateTime end) {
        List<Order> completedOrders = orderRepository.findCompletedOrdersByRetailerAndDateRange(retailer, start, end);
        List<Order> soldOrders = orderRepository.findSoldOrdersByRetailerAndDateRange(retailer, start, end);
        
        BigDecimal completedRevenue = completedOrders.stream()
            .map(Order::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal soldRevenue = soldOrders.stream()
            .map(Order::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        return completedRevenue.add(soldRevenue);
    }
    
    private List<Map<String, Object>> getTopProducts(User retailer) {
        List<Order> completedOrders = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
            retailer, OrderStatus.COMPLETED);
        List<Order> soldOrders = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
            retailer, OrderStatus.SOLD);
        
        Map<String, Integer> productSales = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();
        
        // Process completed orders
        for (Order order : completedOrders) {
            String productName = order.getProductName();
            productSales.put(productName, productSales.getOrDefault(productName, 0) + order.getQuantity());
            productRevenue.put(productName, productRevenue.getOrDefault(productName, BigDecimal.ZERO).add(order.getAmount()));
        }
        
        // Process POS sales (SOLD orders)
        for (Order order : soldOrders) {
            String productName = order.getProductName();
            productSales.merge(productName, order.getQuantity(), Integer::sum);
            productRevenue.merge(productName, order.getAmount(), BigDecimal::add);
        }
        
        List<Map<String, Object>> topProducts = new ArrayList<>();
        productSales.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(5)
            .forEach(entry -> {
                Map<String, Object> product = new HashMap<>();
                product.put("name", entry.getKey());
                product.put("sales", entry.getValue());
                product.put("revenue", productRevenue.get(entry.getKey()));
                topProducts.add(product);
            });
        
        return topProducts;
    }
    
    private int getNewCustomersCount(User retailer, LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findByRetailerAndCreatedDateBetweenOrderByCreatedDateDesc(
            retailer, start, end);
        
        Set<String> customerEmails = new HashSet<>();
        for (Order order : orders) {
            customerEmails.add(order.getCustomerEmail());
        }
        
        return customerEmails.size();
    }
    
    private int getRepeatCustomersCount(User retailer) {
        List<Order> allOrders = orderRepository.findByRetailerOrderByCreatedDateDesc(retailer);
        
        Map<String, Integer> customerOrderCounts = new HashMap<>();
        for (Order order : allOrders) {
            customerOrderCounts.merge(order.getCustomerEmail(), 1, Integer::sum);
        }
        
        return (int) customerOrderCounts.values().stream()
            .filter(count -> count > 1)
            .count();
    }
    
    private double calculateRetentionRate(User retailer) {
        // Simple retention rate calculation based on repeat customers
        List<Order> allOrders = orderRepository.findByRetailerOrderByCreatedDateDesc(retailer);
        
        if (allOrders.isEmpty()) return 0.0;
        
        Set<String> allCustomers = new HashSet<>();
        Map<String, Integer> customerCounts = new HashMap<>();
        
        for (Order order : allOrders) {
            String email = order.getCustomerEmail();
            allCustomers.add(email);
            customerCounts.merge(email, 1, Integer::sum);
        }
        
        long repeatCustomers = customerCounts.values().stream()
            .filter(count -> count > 1)
            .count();
        
        return allCustomers.size() > 0 ? (double) repeatCustomers / allCustomers.size() * 100 : 0.0;
    }
    
    private double getDailySalesGrowth(User retailer) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime yesterday = today.minusDays(1);
        
        long todayOrders = orderRepository.countByRetailerAndDateRange(retailer, today, today.plusDays(1));
        long yesterdayOrders = orderRepository.countByRetailerAndDateRange(retailer, yesterday, today);
        
        if (yesterdayOrders == 0) return todayOrders > 0 ? 100.0 : 0.0;
        return ((double) (todayOrders - yesterdayOrders) / yesterdayOrders) * 100;
    }
    
    private double getWeeklySalesGrowth(User retailer) {
        LocalDateTime thisWeekStart = LocalDateTime.now().with(java.time.DayOfWeek.MONDAY)
            .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastWeekStart = thisWeekStart.minusWeeks(1);
        
        long thisWeekOrders = orderRepository.countByRetailerAndDateRange(
            retailer, thisWeekStart, thisWeekStart.plusWeeks(1));
        long lastWeekOrders = orderRepository.countByRetailerAndDateRange(
            retailer, lastWeekStart, thisWeekStart);
        
        if (lastWeekOrders == 0) return thisWeekOrders > 0 ? 100.0 : 0.0;
        return ((double) (thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100;
    }
    
    // Get retailer's margin rate from business details or default
    public Double getRetailerMarginRate(User retailer) {
        try {
            // Check if retailer has business details with margin rate
            if (retailer.getBusinessDetails() != null) {
                // First check if there's a specific margin rate set for this retailer
                Map<String, Object> metadata = retailer.getBusinessDetails().getMetadata();
                if (metadata != null && metadata.containsKey("marginRate")) {
                    Object marginRateObj = metadata.get("marginRate");
                    if (marginRateObj instanceof Number) {
                        return ((Number) marginRateObj).doubleValue();
                    }
                    if (marginRateObj instanceof String) {
                        try {
                            return Double.parseDouble((String) marginRateObj);
                        } catch (NumberFormatException e) {
                            // Fall through to default
                        }
                    }
                }
            }
            
            // Return null if no admin margin rate is set
            return null;
        } catch (Exception e) {
            // If any error occurs, return null
            return null;
        }
    }

    // Get all product-specific margin rates for a retailer
    public List<Map<String, Object>> getAllProductMarginRates(User retailer) {
        List<Map<String, Object>> productMarginRates = new ArrayList<>();
        
        try {
            if (retailer.getBusinessDetails() != null) {
                Map<String, Object> metadata = retailer.getBusinessDetails().getMetadata();
                
                if (metadata != null && metadata.containsKey("productMarginRates")) {
                    Object productRatesObj = metadata.get("productMarginRates");
                    
                    if (productRatesObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> productRatesMap = (Map<String, Object>) productRatesObj;
                        
                        for (Map.Entry<String, Object> entry : productRatesMap.entrySet()) {
                            String productId = entry.getKey();
                            
                            if (entry.getValue() instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> rateInfo = (Map<String, Object>) entry.getValue();
                                
                                Map<String, Object> productMargin = new HashMap<>();
                                productMargin.put("productId", productId);
                                productMargin.put("productName", rateInfo.get("productName"));
                                productMargin.put("poolName", rateInfo.get("poolName"));
                                productMargin.put("marginRate", rateInfo.get("marginRate"));
                                productMargin.put("setDate", rateInfo.get("setDate"));
                                productMargin.put("setBy", rateInfo.get("setBy"));
                                
                                productMarginRates.add(productMargin);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Return empty list on error
            System.err.println("Error fetching product margin rates: " + e.getMessage());
        }
        
        return productMarginRates;
    }
    
    /**
     * Record profit from a sale
     * Creates/updates daily, monthly, and yearly profit records
     */
    public void recordProfit(User retailer, BigDecimal saleAmount, BigDecimal costPrice, 
                            String bundleName, String bundleId, Double marginRate) {
        try {
            LocalDate today = LocalDate.now();
            int currentYear = today.getYear();
            int currentMonth = today.getMonthValue();
            
            BigDecimal profit = saleAmount.subtract(costPrice);
            
            // Log profit calculation details
            System.out.println("💰 Recording Profit:");
            System.out.println("  Product: " + bundleName);
            System.out.println("  Sale Amount: NOK " + saleAmount.toPlainString());
            System.out.println("  Cost Price: NOK " + costPrice.toPlainString());
            System.out.println("  Calculated Profit: NOK " + profit.toPlainString());
            System.out.println("  Profit %: " + (profit.doubleValue() / saleAmount.doubleValue() * 100) + "%");
            System.out.println("  Margin Rate from Frontend: " + marginRate + "%");
            System.out.println("  Retailer ID: " + retailer.getId());
            
            // Record daily profit
            updateProfitRecord(retailer, "daily", today, currentYear, currentMonth, 
                             saleAmount, costPrice, profit, bundleName, bundleId, marginRate);
            
            // Record monthly profit
            updateProfitRecord(retailer, "monthly", null, currentYear, currentMonth,
                             saleAmount, costPrice, profit, bundleName, bundleId, marginRate);
            
            // Record yearly profit
            updateProfitRecord(retailer, "yearly", null, currentYear, null,
                             saleAmount, costPrice, profit, bundleName, bundleId, marginRate);
            
            System.out.println("✅ Profit recorded: " + profit + " kr for " + bundleName);
        } catch (Exception e) {
            System.err.println("❌ Error recording profit: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Update or create profit record for a specific period
     */
    private void updateProfitRecord(User retailer, String period, LocalDate date, 
                                   Integer year, Integer month, BigDecimal revenue, 
                                   BigDecimal cost, BigDecimal profit, String bundleName,
                                   String bundleId, Double marginRate) {
        RetailerProfit profitRecord = null;
        
        // Find existing record
        if ("daily".equals(period) && date != null) {
            profitRecord = profitRepository.findByRetailer_IdAndDateAndPeriod(
                retailer.getId(), date, period).orElse(null);
        } else if ("monthly".equals(period) && year != null && month != null) {
            profitRecord = profitRepository.findByRetailer_IdAndYearAndMonthAndPeriod(
                retailer.getId(), year, month, period).orElse(null);
        } else if ("yearly".equals(period) && year != null) {
            profitRecord = profitRepository.findByRetailer_IdAndYearAndPeriod(
                retailer.getId(), year, period).orElse(null);
        }
        
        // Create new record if doesn't exist
        if (profitRecord == null) {
            profitRecord = new RetailerProfit();
            profitRecord.setRetailer(retailer);
            profitRecord.setPeriod(period);
            profitRecord.setDate(date);
            profitRecord.setYear(year);
            profitRecord.setMonth(month);
            profitRecord.setBundleName(bundleName);
            profitRecord.setProductId(bundleId);
        }
        
        // Add this sale's data
        profitRecord.addSale(revenue, cost, marginRate);
        
        // Save to database
        profitRepository.save(profitRecord);
    }
    
    /**
     * Get profit data for a retailer by time period
     */
    public List<Map<String, Object>> getProfitData(User retailer, String period) {
        List<Map<String, Object>> profitData = new ArrayList<>();
        
        try {
            List<RetailerProfit> profits;
            
            // Fetch profits by period for this retailer
            profits = profitRepository.findByRetailer_IdAndPeriod(retailer.getId(), period);
            
            System.out.println("📊 Retrieved " + profits.size() + " " + period + " profit records for retailer: " + retailer.getId());
            
            // Convert to Map format for JSON response
            for (RetailerProfit profit : profits) {
                Map<String, Object> data = new HashMap<>();
                
                if ("daily".equals(period) && profit.getDate() != null) {
                    data.put("date", profit.getDate().toString());
                } else if ("monthly".equals(period)) {
                    data.put("month", profit.getYear() + "-" + String.format("%02d", profit.getMonth()));
                    data.put("year", profit.getYear());
                    data.put("monthNumber", profit.getMonth());
                } else if ("yearly".equals(period)) {
                    data.put("year", profit.getYear());
                }
                
                data.put("profit", profit.getProfit().doubleValue());
                data.put("revenue", profit.getRevenue().doubleValue());
                data.put("sales", profit.getSalesCount());
                data.put("marginRate", profit.getMarginRate());
                
                profitData.add(data);
            }
            
            System.out.println("📊 Converted " + profitData.size() + " " + period + " profit records to response format");
        } catch (Exception e) {
            System.err.println("❌ Error fetching profit data: " + e.getMessage());
            e.printStackTrace();
        }
        
        return profitData;
    }
    
    /**
     * Get total profit summary for a retailer
     */
    public Map<String, Object> getProfitSummary(User retailer) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Get all yearly profits to calculate total
            List<RetailerProfit> yearlyProfits = profitRepository.findByRetailer_IdAndPeriod(retailer.getId(), "yearly");
            
            BigDecimal totalProfit = yearlyProfits.stream()
                .map(RetailerProfit::getProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalRevenue = yearlyProfits.stream()
                .map(RetailerProfit::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            int totalSales = yearlyProfits.stream()
                .mapToInt(RetailerProfit::getSalesCount)
                .sum();
            
            // Get today's profit
            LocalDate today = LocalDate.now();
            Optional<RetailerProfit> todayProfit = profitRepository.findByRetailer_IdAndDateAndPeriod(
                retailer.getId(), today, "daily");
            
            BigDecimal dailyProfit = todayProfit.map(RetailerProfit::getProfit).orElse(BigDecimal.ZERO);
            
            // Calculate average margin
            double avgMargin = yearlyProfits.stream()
                .filter(p -> p.getMarginRate() != null)
                .mapToDouble(RetailerProfit::getMarginRate)
                .average()
                .orElse(0.0);
            
            summary.put("totalProfit", totalProfit.doubleValue());
            summary.put("totalRevenue", totalRevenue.doubleValue());
            summary.put("totalSales", totalSales);
            summary.put("dailyProfit", dailyProfit.doubleValue());
            summary.put("averageMargin", Math.round(avgMargin * 100.0) / 100.0);
            
        } catch (Exception e) {
            System.err.println("❌ Error calculating profit summary: " + e.getMessage());
            summary.put("totalProfit", 0.0);
            summary.put("totalRevenue", 0.0);
            summary.put("totalSales", 0);
            summary.put("dailyProfit", 0.0);
            summary.put("averageMargin", 0.0);
        }
        
        return summary;
    }

    // Get sales summary: count of sold items and total earnings
    public Map<String, Object> getSalesSummary(User retailer) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Get all completed/sold orders for this retailer
            List<RetailerOrder> completedOrders = retailerOrderRepository.findByRetailerIdAndStatus(
                retailer.getId(), RetailerOrder.OrderStatus.COMPLETED);
            
            // Count total sales and sum total earnings
            int totalSalesCount = completedOrders.size();
            BigDecimal totalEarnings = completedOrders.stream()
                .map(RetailerOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            summary.put("success", true);
            summary.put("totalSalesCount", totalSalesCount);
            summary.put("totalEarnings", totalEarnings.doubleValue());
            
            System.out.println("✅ Sales Summary - Count: " + totalSalesCount + ", Earnings: " + totalEarnings);
            
        } catch (Exception e) {
            System.err.println("❌ Error calculating sales summary: " + e.getMessage());
            e.printStackTrace();
            summary.put("success", false);
            summary.put("totalSalesCount", 0);
            summary.put("totalEarnings", 0.0);
        }
        
        return summary;
    }
}
