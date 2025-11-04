package com.example.topup.demo.service;

import com.example.topup.demo.dto.RetailerCreditLevel;
import com.example.topup.demo.dto.RetailerPurchaseRequest;
import com.example.topup.demo.entity.*;
import com.example.topup.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RetailerPurchaseService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private StockPoolRepository stockPoolRepository;

    // Credit level definitions (NOK)
    private static final List<BigDecimal> CREDIT_LEVELS = Arrays.asList(
        new BigDecimal("2000"),
        new BigDecimal("2500"),
        new BigDecimal("5000"),
        new BigDecimal("7500"),
        new BigDecimal("10000"),
        new BigDecimal("15000"),
        new BigDecimal("20000")
    );

    // Get available bundles for retailer
    public List<Product> getAvailableBundles() {
        // First try to get actual products
        List<Product> products = productRepository.findByStatusAndStockQuantityGreaterThan(
            Product.ProductStatus.ACTIVE, 0
        );
        
        // If no products found, create products from stock pools (temporary solution)
        if (products.isEmpty()) {
            List<StockPool> stockPools = stockPoolRepository.findByStatus(StockPool.StockStatus.ACTIVE);
            products = stockPools.stream()
                .filter(pool -> pool.getAvailableQuantity() != null && pool.getAvailableQuantity() > 0)
                .map(this::convertStockPoolToProduct)
                .collect(Collectors.toList());
        }
        
        return products;
    }
    
    // Helper method to convert StockPool to Product format
    private Product convertStockPoolToProduct(StockPool stockPool) {
        Product product = new Product();
        product.setId(stockPool.getId());
        product.setName(stockPool.getName());
        product.setDescription(stockPool.getDescription() != null ? stockPool.getDescription() : 
            "Available: " + stockPool.getAvailableQuantity() + " units");
        product.setProductType(stockPool.getStockType() == StockPool.StockType.EPIN ? 
            Product.ProductType.EPIN : Product.ProductType.ESIM);
        
        // Set pricing (you can adjust these)
        BigDecimal basePrice = new BigDecimal("99.00"); // Default price
        product.setBasePrice(basePrice);
        
        product.setStockQuantity(stockPool.getAvailableQuantity());
        product.setStatus(Product.ProductStatus.ACTIVE);
        
        return product;
    }

    // Get retailer's credit levels with availability status
    public List<RetailerCreditLevel> getRetailerCreditLevels(String retailerId) {
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
        
        BigDecimal currentLimit = limitOpt.map(RetailerLimit::getCreditLimit)
                                         .orElse(BigDecimal.ZERO);
        
        return CREDIT_LEVELS.stream()
            .map(level -> {
                RetailerCreditLevel creditLevel = new RetailerCreditLevel(
                    "LEVEL_" + level.intValue(),
                    level,
                    "NOK " + String.format("%,d", level.intValue())
                );
                
                creditLevel.setAvailable(limitOpt.isPresent() && 
                    limitOpt.get().getStatus() == RetailerLimit.LimitStatus.ACTIVE);
                creditLevel.setCurrentLevel(currentLimit.compareTo(level) == 0);
                creditLevel.setDescription(getLevelDescription(level));
                
                return creditLevel;
            })
            .collect(Collectors.toList());
    }

    private String getLevelDescription(BigDecimal level) {
        int levelInt = level.intValue();
        if (levelInt <= 2000) return "Entry Level - New retailer";
        if (levelInt <= 2500) return "Starter Level - Perfect for small retailers";
        if (levelInt <= 5000) return "Bronze Level - Growing business";
        if (levelInt <= 7500) return "Silver Level - Established retailer";
        if (levelInt <= 10000) return "Gold Level - Premium retailer";
        if (levelInt <= 15000) return "Platinum Level - High volume retailer";
        return "Diamond Level - Enterprise retailer";
    }

    // Get retailer's current credit status
    public Map<String, Object> getRetailerCreditStatus(String retailerId) {
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
        
        Map<String, Object> status = new HashMap<>();
        
        if (limitOpt.isPresent()) {
            RetailerLimit limit = limitOpt.get();
            BigDecimal usagePercent = calculateUsagePercentage(limit);
            
            status.put("creditLimit", limit.getCreditLimit());
            status.put("availableCredit", limit.getAvailableCredit());
            status.put("usedCredit", limit.getUsedCredit());
            status.put("outstandingAmount", limit.getOutstandingAmount());
            status.put("usagePercentage", usagePercent);
            status.put("status", limit.getStatus());
            status.put("nextDueDate", limit.getNextDueDate());
            status.put("needsWarning", usagePercent.compareTo(new BigDecimal("90")) >= 0);
            status.put("isBlocked", usagePercent.compareTo(new BigDecimal("100")) >= 0);
            
            // Get current level info
            BigDecimal currentLimit = limit.getCreditLimit();
            status.put("currentLevel", getLevelInfo(currentLimit));
        } else {
            status.put("creditLimit", BigDecimal.ZERO);
            status.put("availableCredit", BigDecimal.ZERO);
            status.put("usedCredit", BigDecimal.ZERO);
            status.put("outstandingAmount", BigDecimal.ZERO);
            status.put("usagePercentage", BigDecimal.ZERO);
            status.put("status", "NOT_CONFIGURED");
            status.put("needsWarning", false);
            status.put("isBlocked", true);
            status.put("currentLevel", null);
        }
        
        return status;
    }

    private Map<String, Object> getLevelInfo(BigDecimal limit) {
        Map<String, Object> levelInfo = new HashMap<>();
        
        // Find exact or closest matching level
        BigDecimal matchedLevel = null;
        
        // First try exact match
        for (BigDecimal level : CREDIT_LEVELS) {
            if (limit.compareTo(level) == 0) {
                matchedLevel = level;
                break;
            }
        }
        
        // If no exact match, find the closest level at or below the limit
        if (matchedLevel == null) {
            for (int i = CREDIT_LEVELS.size() - 1; i >= 0; i--) {
                BigDecimal level = CREDIT_LEVELS.get(i);
                if (limit.compareTo(level) >= 0) {
                    matchedLevel = level;
                    break;
                }
            }
            
            // If still no match (limit is below all levels), use the first level
            if (matchedLevel == null && !CREDIT_LEVELS.isEmpty()) {
                matchedLevel = CREDIT_LEVELS.get(0);
            }
        }
        
        // Build level info if we found a match
        if (matchedLevel != null) {
            levelInfo.put("amount", matchedLevel);
            levelInfo.put("name", "NOK " + String.format("%,d", matchedLevel.intValue()));
            levelInfo.put("description", getLevelDescription(matchedLevel));
            
            // Find next level
            int index = CREDIT_LEVELS.indexOf(matchedLevel);
            if (index < CREDIT_LEVELS.size() - 1) {
                BigDecimal nextLevel = CREDIT_LEVELS.get(index + 1);
                levelInfo.put("nextLevel", nextLevel);
                levelInfo.put("nextLevelName", "NOK " + String.format("%,d", nextLevel.intValue()));
            } else {
                levelInfo.put("nextLevel", null);
                levelInfo.put("isMaxLevel", true);
            }
        }
        
        return levelInfo;
    }

    private BigDecimal calculateUsagePercentage(RetailerLimit limit) {
        if (limit.getCreditLimit().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        // Calculate usage based on usedCredit only (consistent with admin dashboard)
        return limit.getUsedCredit()
                   .multiply(new BigDecimal("100"))
                   .divide(limit.getCreditLimit(), 2, RoundingMode.HALF_UP);
    }

    // Direct purchase - no payment required, instant allocation
    @Transactional
    public Map<String, Object> purchaseBundles(String retailerId, RetailerPurchaseRequest request) {
        // Get retailer limit (for tracking only, no credit check)
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
        
        if (limitOpt.isEmpty()) {
            throw new IllegalStateException("Retailer not found. Please contact admin.");
        }
        
        RetailerLimit limit = limitOpt.get();

        // Try to get product from Product table first
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        Product product;
        StockPool stockPool = null;
        boolean isFromStockPool = false;
        
        if (productOpt.isPresent()) {
            // Product exists in Product table
            product = productOpt.get();
            
            // Check if product is available
            if (product.getStatus() != Product.ProductStatus.ACTIVE) {
                throw new IllegalStateException("Product is not available for purchase");
            }
            
            // Check stock in admin inventory
            if (product.getStockQuantity() < request.getQuantity()) {
                throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
            }
        } else {
            // Product doesn't exist, try to find StockPool
            stockPool = stockPoolRepository.findById(request.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Product or Stock Pool not found with ID: " + request.getProductId()));
            
            // Check if stock pool is active
            if (stockPool.getStatus() != StockPool.StockStatus.ACTIVE) {
                throw new IllegalStateException("Stock pool is not available for purchase");
            }
            
            // Check stock availability
            if (stockPool.getAvailableQuantity() < request.getQuantity()) {
                throw new IllegalStateException("Insufficient stock. Available: " + stockPool.getAvailableQuantity());
            }
            
            // Convert StockPool to Product for processing
            product = convertStockPoolToProduct(stockPool);
            isFromStockPool = true;
        }

        // Calculate total amount (for tracking purposes)
        BigDecimal unitPrice = product.getBasePrice();
        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(request.getQuantity()));

        // Allocate PINs or eSIMs from admin stock
        List<String> allocatedItems = new ArrayList<>();
        if (isFromStockPool) {
            // Allocate from StockPool
            allocatedItems = allocateFromStockPool(stockPool, request.getQuantity(), retailerId);
        } else {
            // Allocate from Product
            if (product.getProductType() == Product.ProductType.EPIN) {
                allocatedItems = allocatePins(product, request.getQuantity(), retailerId);
            } else if (product.getProductType() == Product.ProductType.ESIM) {
                allocatedItems = allocateEsims(product, request.getQuantity(), retailerId);
            }
        }

        // Create order
        Order order = new Order();
        order.setRetailer(limit.getRetailer());
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setAmount(totalAmount);
        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setPaymentMethod("DIRECT"); // No payment required
        order.setCreatedDate(LocalDateTime.now());
        
        // Store allocated items in order metadata
        if (order.getMetadata() == null) {
            order.setMetadata(new HashMap<>());
        }
        order.getMetadata().put("allocatedItems", String.join(",", allocatedItems));
        order.getMetadata().put("itemCount", String.valueOf(allocatedItems.size()));
        order.getMetadata().put("purchaseType", "DIRECT_BUY");
        order.getMetadata().put("sourceType", isFromStockPool ? "STOCK_POOL" : "PRODUCT");
        if (isFromStockPool) {
            order.getMetadata().put("stockPoolId", stockPool.getId());
        }
        
        Order savedOrder = orderRepository.save(order);

        // Update credit usage (for level tracking)
        limit.useCredit(totalAmount, savedOrder.getId(), 
            String.format("Direct Purchase: %s (x%d)", product.getName(), request.getQuantity()));
        
        // Reduce stock from admin inventory
        if (isFromStockPool) {
            // Update StockPool quantities
            stockPool.setAvailableQuantity(stockPool.getAvailableQuantity() - request.getQuantity());
            stockPool.setUsedQuantity((stockPool.getUsedQuantity() != null ? stockPool.getUsedQuantity() : 0) + request.getQuantity());
            stockPoolRepository.save(stockPool);
        } else {
            // Update Product quantities
            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
            product.setSoldQuantity((product.getSoldQuantity() != null ? product.getSoldQuantity() : 0) + request.getQuantity());
            productRepository.save(product);
        }

        // Save updated limit (for level calculation)
        RetailerLimit savedLimit = retailerLimitRepository.save(limit);

        // Calculate usage percentage for level display
        BigDecimal usagePercent = calculateUsagePercentage(savedLimit);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orderId", savedOrder.getId());
        response.put("totalAmount", totalAmount);
        response.put("itemsAllocated", allocatedItems.size());
        response.put("allocatedItems", allocatedItems);
        response.put("remainingCredit", savedLimit.getAvailableCredit());
        response.put("usagePercentage", usagePercent);
        response.put("currentLevel", getLevelInfo(savedLimit.getCreditLimit()));
        response.put("message", "Purchase completed successfully! Items added to your inventory.");

        return response;
    }

    private List<String> allocatePins(Product product, int quantity, String retailerId) {
        List<String> allocated = new ArrayList<>();
        List<Product.PinData> availablePins = product.getAvailablePins();
        
        if (availablePins == null || availablePins.size() < quantity) {
            throw new IllegalStateException("Not enough PINs available");
        }

        int count = 0;
        for (Product.PinData pin : availablePins) {
            if (!pin.isUsed() && count < quantity) {
                pin.setUsed(true);
                pin.setUsedDate(LocalDateTime.now());
                pin.setUsedByUserId(retailerId);
                allocated.add(encryptPin(pin.getPinNumber()));
                count++;
            }
        }

        productRepository.save(product);
        return allocated;
    }
    
    private List<String> allocateFromStockPool(StockPool stockPool, int quantity, String retailerId) {
        List<String> allocated = new ArrayList<>();
        List<StockPool.StockItem> items = stockPool.getItems();
        
        if (items == null || items.isEmpty()) {
            throw new IllegalStateException("No items available in stock pool");
        }
        
        // Filter available items
        List<StockPool.StockItem> availableItems = items.stream()
            .filter(item -> item.getStatus() == StockPool.StockItem.ItemStatus.AVAILABLE)
            .limit(quantity)
            .collect(java.util.stream.Collectors.toList());
        
        if (availableItems.size() < quantity) {
            throw new IllegalStateException("Not enough items available in stock pool. Requested: " + quantity + ", Available: " + availableItems.size());
        }
        
        // Allocate items
        for (StockPool.StockItem item : availableItems) {
            item.setStatus(StockPool.StockItem.ItemStatus.ASSIGNED);
            item.setAssignedDate(LocalDateTime.now());
            item.setAssignedToUserId(retailerId);
            
            // Add encrypted data to allocated list
            if (stockPool.getStockType() == StockPool.StockType.EPIN) {
                allocated.add(encryptPin(item.getItemData()));
            } else if (stockPool.getStockType() == StockPool.StockType.ESIM) {
                String qrCode = item.getQrCodeUrl() != null ? item.getQrCodeUrl() : item.getItemData();
                allocated.add(encryptQrCode(qrCode));
            }
        }
        
        stockPoolRepository.save(stockPool);
        return allocated;
    }

    private List<String> allocateEsims(Product product, int quantity, String retailerId) {
        List<String> allocated = new ArrayList<>();
        List<Product.EsimData> availableEsims = product.getAvailableEsims();
        
        if (availableEsims == null || availableEsims.size() < quantity) {
            throw new IllegalStateException("Not enough eSIMs available");
        }

        int count = 0;
        for (Product.EsimData esim : availableEsims) {
            if (!esim.isActivated() && count < quantity) {
                esim.setActivated(true);
                esim.setActivatedDate(LocalDateTime.now()); // This method exists
                esim.setActivatedByUserId(retailerId);
                allocated.add(encryptQrCode(esim.getQrCodeUrl())); // Use getQrCodeUrl() instead
                count++;
            }
        }

        productRepository.save(product);
        return allocated;
    }

    private String encryptPin(String pin) {
        // Simple encryption - in production use proper encryption
        String masked = pin.substring(0, 4) + "****" + pin.substring(pin.length() - 4);
        return "PIN:" + masked;
    }

    private String encryptQrCode(String qrCode) {
        // Simple encryption - in production use proper encryption
        return "QR:" + Base64.getEncoder().encodeToString(qrCode.getBytes()).substring(0, 20) + "...";
    }

    private void checkAndSendCreditWarnings(RetailerLimit limit, BigDecimal usagePercent) {
        String retailerEmail = limit.getRetailer().getEmail();
        String retailerName = limit.getRetailer().getFullName(); // Use getFullName() method

        try {
            if (usagePercent.compareTo(new BigDecimal("100")) >= 0) {
                // 100% limit reached
                emailService.sendEmail(
                    retailerEmail,
                    "⚠️ Credit Limit Exceeded - Action Required",
                    String.format(
                        "Dear %s,\n\n" +
                        "Your credit limit has been reached (100%%).\n\n" +
                        "Credit Limit: NOK %.2f\n" +
                        "Used Credit: NOK %.2f\n" +
                        "Available Credit: NOK %.2f\n\n" +
                        "You cannot place new orders until you make a payment or contact admin to increase your limit.\n\n" +
                        "Please contact us immediately to resolve this.\n\n" +
                        "Best regards,\n" +
                        "EasyTopup.no Team",
                        retailerName,
                        limit.getCreditLimit(),
                        limit.getUsedCredit().add(limit.getOutstandingAmount()),
                        limit.getAvailableCredit()
                    )
                );
            } else if (usagePercent.compareTo(new BigDecimal("90")) >= 0) {
                // 90% warning
                emailService.sendEmail(
                    retailerEmail,
                    "⚠️ Credit Limit Warning - 90% Reached",
                    String.format(
                        "Dear %s,\n\n" +
                        "You have used 90%% of your credit limit.\n\n" +
                        "Credit Limit: NOK %.2f\n" +
                        "Used Credit: NOK %.2f\n" +
                        "Available Credit: NOK %.2f\n\n" +
                        "Please plan your payments or contact us to increase your limit.\n\n" +
                        "Best regards,\n" +
                        "EasyTopup.no Team",
                        retailerName,
                        limit.getCreditLimit(),
                        limit.getUsedCredit().add(limit.getOutstandingAmount()),
                        limit.getAvailableCredit()
                    )
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send credit warning email: " + e.getMessage());
        }
    }

    // Get retailer's purchase history with decrypted items
    public Map<String, Object> getRetailerInventory(String retailerId) {
        // Find completed orders for this retailer
        List<Order> orders = orderRepository.findByRetailer_Id(retailerId).stream()
            .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
            .sorted((o1, o2) -> o2.getCreatedDate().compareTo(o1.getCreatedDate()))
            .collect(Collectors.toList());

        List<Map<String, Object>> inventory = new ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> item = new HashMap<>();
            item.put("orderId", order.getId());
            
            // Use stored product information instead of accessing Product entity
            // to avoid null pointer or lazy loading issues
            item.put("productName", order.getProductName() != null ? order.getProductName() : 
                (order.getProduct() != null ? order.getProduct().getName() : "Unknown Product"));
            item.put("productType", order.getProductType() != null ? order.getProductType() : 
                (order.getProduct() != null ? order.getProduct().getProductType().toString() : "UNKNOWN"));
            
            item.put("quantity", order.getQuantity());
            item.put("totalAmount", order.getAmount()); // Use getAmount()
            item.put("purchaseDate", order.getCreatedDate());
            
            // Get allocated items
            if (order.getMetadata() != null && order.getMetadata().containsKey("allocatedItems")) {
                String itemsStr = order.getMetadata().get("allocatedItems");
                item.put("items", Arrays.asList(itemsStr.split(",")));
            }
            
            inventory.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("inventory", inventory);
        response.put("totalOrders", orders.size());
        
        return response;
    }

    // Clear retailer's completed inventory orders
    @Transactional
    public int clearRetailerInventory(String retailerId) {
        // Find completed orders for this retailer
        List<Order> ordersToDelete = orderRepository.findByRetailer_Id(retailerId).stream()
            .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
            .collect(Collectors.toList());

        int count = ordersToDelete.size();
        
        // Delete the orders
        orderRepository.deleteAll(ordersToDelete);
        
        return count;
    }
}
