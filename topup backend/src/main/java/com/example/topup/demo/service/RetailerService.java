package com.example.topup.demo.service;

import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.Order.OrderStatus;
import com.example.topup.demo.repository.OrderRepository;
import com.example.topup.demo.repository.ProductRepository;
import com.example.topup.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
        
        // Calculate total revenue
        List<Order> completedOrders = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
            retailer, OrderStatus.COMPLETED);
        BigDecimal totalRevenue = completedOrders.stream()
            .map(Order::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.put("totalRevenue", totalRevenue);
        
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
        
        // Success rate calculation
        long completedOrdersCount = orderRepository.countByRetailerAndStatus(retailer, OrderStatus.COMPLETED);
        double successRate = totalOrders > 0 ? ((double) completedOrdersCount / totalOrders) * 100 : 0;
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
        List<Order> orders = orderRepository.findCompletedOrdersByRetailerAndDateRange(retailer, start, end);
        return orders.stream()
            .map(Order::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private List<Map<String, Object>> getTopProducts(User retailer) {
        List<Order> completedOrders = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
            retailer, OrderStatus.COMPLETED);
        
        Map<String, Integer> productSales = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();
        
        for (Order order : completedOrders) {
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
}