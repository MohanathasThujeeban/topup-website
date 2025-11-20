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
        order.setProductName(product.getName()); // Set product name explicitly
        order.setProductType(product.getProductType().toString()); // Set product type explicitly
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
    
    // Method to decrypt PIN for receipt generation
    private String decryptPin(String encryptedPin) {
        // For demo purposes, generate a realistic PIN
        // In production, this would decrypt the actual stored PIN
        if (encryptedPin.startsWith("PIN:")) {
            // Generate a realistic 16-digit PIN
            return generateRealisticPin();
        }
        return encryptedPin;
    }
    
    private String generateRealisticPin() {
        // Generate realistic Lycamobile-style PIN
        StringBuilder pin = new StringBuilder();
        
        // Lycamobile PINs often start with specific patterns
        String[] prefixes = {"2345", "5432", "9876", "1357", "2468"};
        pin.append(prefixes[new java.util.Random().nextInt(prefixes.length)]);
        
        // Add 12 more digits
        for (int i = 0; i < 12; i++) {
            pin.append(new java.util.Random().nextInt(10));
        }
        
        return pin.toString();
    }
    
    // Public method for controller access
    public String decryptPinForReceipt(String encryptedPin) {
        return decryptPin(encryptedPin);
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
        System.out.println("📦 Fetching inventory for retailer: " + retailerId);
        long startTime = System.currentTimeMillis();
        
        // Find completed orders for this retailer (exclude depleted orders)
        List<Order> orders = orderRepository.findByRetailer_Id(retailerId).stream()
            .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
            .sorted((o1, o2) -> o2.getCreatedDate().compareTo(o1.getCreatedDate()))
            .collect(Collectors.toList());
            
        System.out.println("⏱️ Found " + orders.size() + " orders in " + (System.currentTimeMillis() - startTime) + "ms");

        // Group pins by bundle type
        Map<String, List<Map<String, Object>>> bundleGroups = new LinkedHashMap<>();
        Map<String, Map<String, Object>> bundleInfo = new HashMap<>();
        
        for (Order order : orders) {
            // Get product name safely
            String productName = order.getProduct() != null ? order.getProduct().getName() : "Unknown Product";
            
            // Get product type safely
            String productType = "EPIN"; // Default
            if (order.getProduct() != null && order.getProduct().getProductType() != null) {
                productType = order.getProduct().getProductType().toString();
            }
            
            // Create bundle key
            BigDecimal unitPrice = order.getAmount().divide(BigDecimal.valueOf(order.getQuantity()), 2, java.math.RoundingMode.HALF_UP);
            String bundleKey = productName + "_" + unitPrice;
            
            // Store bundle information
            if (!bundleInfo.containsKey(bundleKey)) {
                Map<String, Object> info = new HashMap<>();
                info.put("bundleName", productName);
                info.put("bundlePrice", unitPrice);
                info.put("productType", productType);
                bundleInfo.put(bundleKey, info);
            }
            
            // Get individual pins from this order
            List<Map<String, Object>> pins = new ArrayList<>();
            if (order.getMetadata() != null && order.getMetadata().containsKey("allocatedItems")) {
                String itemsStr = order.getMetadata().get("allocatedItems");
                String[] pinArray = itemsStr.split(",");
                
                for (String pin : pinArray) {
                    if (pin.trim().length() > 0) {
                        Map<String, Object> pinItem = new HashMap<>();
                        pinItem.put("pin", pin.trim());
                        pinItem.put("orderId", order.getId());
                        pinItem.put("purchaseDate", order.getCreatedDate());
                        pinItem.put("status", "AVAILABLE");
                        pins.add(pinItem);
                    }
                }
            }
            
            bundleGroups.computeIfAbsent(bundleKey, k -> new ArrayList<>()).addAll(pins);
        }

        // Convert to inventory format
        List<Map<String, Object>> inventory = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : bundleGroups.entrySet()) {
            String bundleKey = entry.getKey();
            List<Map<String, Object>> pins = entry.getValue();
            Map<String, Object> bundleData = bundleInfo.get(bundleKey);
            
            Map<String, Object> inventoryItem = new HashMap<>();
            inventoryItem.put("bundleId", bundleKey);
            inventoryItem.put("bundleName", bundleData.get("bundleName"));
            inventoryItem.put("bundlePrice", bundleData.get("bundlePrice"));
            inventoryItem.put("productType", bundleData.get("productType"));
            inventoryItem.put("availablePins", pins.size());
            inventoryItem.put("pins", pins);
            inventoryItem.put("status", "ACTIVE");
            
            inventory.add(inventoryItem);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("inventory", inventory);
        response.put("totalBundles", inventory.size());
        response.put("totalPins", bundleGroups.values().stream().mapToInt(List::size).sum());
        
        long totalTime = System.currentTimeMillis() - startTime;
        System.out.println("📦 Inventory response prepared in " + totalTime + "ms:");
        System.out.println("   - Total bundles: " + inventory.size());
        System.out.println("   - Total PINs: " + bundleGroups.values().stream().mapToInt(List::size).sum());
        for (Map<String, Object> item : inventory) {
            System.out.println("   - Bundle: " + item.get("bundleName") + " (" + item.get("availablePins") + " PINs)");
        }
        
        return response;
    }

    // Process direct sale by removing PINs from retailer inventory
    @Transactional
    public Map<String, Object> processDirectSale(String retailerId, String bundleName, int quantity, BigDecimal unitPrice) {
        System.out.println("🔍 Processing direct sale - Retailer: " + retailerId + ", Bundle: '" + bundleName + "', Quantity: " + quantity + ", Unit Price: " + unitPrice);
        System.out.println("    - Bundle name length: " + (bundleName != null ? bundleName.length() : "null"));
        System.out.println("    - Unit price type: " + unitPrice.getClass().getSimpleName());
        
        try {
            if (retailerId == null || bundleName == null || quantity <= 0 || unitPrice == null) {
                throw new IllegalArgumentException("Invalid parameters for direct sale");
            }
        
        // Find the retailer's orders that contain the specific bundle
        List<Order> retailerOrders = orderRepository.findByRetailer_Id(retailerId).stream()
            .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
            .collect(Collectors.toList());
            
        System.out.println("📦 Found " + retailerOrders.size() + " completed orders for retailer");
        
        if (retailerOrders.isEmpty()) {
            throw new RuntimeException("No inventory found. Please purchase bundles from admin first to build your inventory before making direct sales to customers.");
        }

        // Find orders with matching bundle and available PINs
        List<Map<String, Object>> availablePins = new ArrayList<>();
        List<Order> ordersToUpdate = new ArrayList<>();
        
        for (Order order : retailerOrders) {
            // Check if this order matches the bundle
            String productName = order.getProduct() != null ? order.getProduct().getName() : 
                (order.getProductName() != null ? order.getProductName() : "Unknown Product");
            BigDecimal orderUnitPrice = order.getAmount().divide(BigDecimal.valueOf(order.getQuantity()), 2, java.math.RoundingMode.HALF_UP);
            
            System.out.println("🔍 Checking order " + order.getId() + " - Product: '" + productName + "', Price: " + orderUnitPrice + ", Looking for: '" + bundleName + "', " + unitPrice);
            System.out.println("    - Product name match: " + productName.equals(bundleName));
            System.out.println("    - Price match: " + (orderUnitPrice.compareTo(unitPrice) == 0));
            
            if (productName.equals(bundleName) && orderUnitPrice.compareTo(unitPrice) == 0) {
                System.out.println("✅ Order " + order.getId() + " matches!");
                // Get PINs from this order
                if (order.getMetadata() != null && order.getMetadata().containsKey("allocatedItems")) {
                    String itemsStr = order.getMetadata().get("allocatedItems");
                    String[] pinArray = itemsStr.split(",");
                    
                    for (String pin : pinArray) {
                        if (pin.trim().length() > 0 && availablePins.size() < quantity) {
                            Map<String, Object> pinItem = new HashMap<>();
                            pinItem.put("pin", pin.trim());
                            pinItem.put("orderId", order.getId());
                            pinItem.put("orderQuantity", order.getQuantity());
                            availablePins.add(pinItem);
                        }
                    }
                    
                    if (!ordersToUpdate.contains(order)) {
                        ordersToUpdate.add(order);
                    }
                }
            }
        }
        
        if (availablePins.size() < quantity) {
            if (availablePins.isEmpty()) {
                throw new RuntimeException("No inventory available for bundle '" + bundleName + "'. Please purchase this bundle from admin first to build your inventory.");
            } else {
                throw new RuntimeException("Insufficient inventory for bundle '" + bundleName + "'. Required: " + quantity + " PINs, Available: " + availablePins.size() + " PINs. Please purchase more units from admin.");
            }
        }
        
        if (ordersToUpdate.isEmpty()) {
            throw new RuntimeException("No matching orders found for bundle: " + bundleName + " with price: " + unitPrice);
        }
        
        // Process the sale by updating orders
        List<Map<String, Object>> soldPins = new ArrayList<>();
        int pinsToSell = quantity;
        
        for (Order order : ordersToUpdate) {
            if (pinsToSell <= 0) break;
            
            String itemsStr = order.getMetadata().get("allocatedItems");
            String[] pinArray = itemsStr.split(",");
            List<String> remainingPins = new ArrayList<>();
            
            for (String pin : pinArray) {
                if (pin.trim().length() > 0) {
                    if (pinsToSell > 0) {
                        // This PIN is being sold
                        String decryptedPin = decryptPinForReceipt(pin.trim());
                        Map<String, Object> soldPin = new HashMap<>();
                        soldPin.put("pin", decryptedPin);
                        soldPin.put("bundleName", bundleName);
                        soldPin.put("value", unitPrice);
                        soldPin.put("serialNumber", "SN" + System.currentTimeMillis() + String.format("%03d", soldPins.size()));
                        soldPin.put("expiryDate", LocalDateTime.now().plusDays(365).toString());
                        soldPin.put("status", "SOLD");
                        soldPins.add(soldPin);
                        pinsToSell--;
                        
                        System.out.println("📤 Selling PIN from inventory: " + pin.trim() + " -> " + decryptedPin);
                    } else {
                        // This PIN remains in inventory
                        remainingPins.add(pin.trim());
                    }
                }
            }
            
            // Update the order metadata
            if (remainingPins.isEmpty()) {
                // No PINs left, mark order as depleted
                order.setStatus(Order.OrderStatus.DEPLETED);
                System.out.println("📦 Order " + order.getId() + " depleted - no PINs remaining");
            } else {
                // Update with remaining PINs
                if (order.getMetadata() == null) {
                    order.setMetadata(new HashMap<>());
                }
                order.getMetadata().put("allocatedItems", String.join(",", remainingPins));
                order.getMetadata().put("itemCount", String.valueOf(remainingPins.size()));
                System.out.println("📦 Order " + order.getId() + " updated - " + remainingPins.size() + " PINs remaining");
            }
            
            orderRepository.save(order);
        }
        
        // Create sale record (optional - for tracking)
        Order saleOrder = new Order();
        saleOrder.setRetailer(ordersToUpdate.get(0).getRetailer());
        saleOrder.setProductName(bundleName);
        saleOrder.setProductType("EPIN");
        saleOrder.setQuantity(quantity);
        saleOrder.setAmount(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        saleOrder.setStatus(Order.OrderStatus.SOLD);
        saleOrder.setPaymentMethod("DIRECT_SALE");
        saleOrder.setCreatedDate(LocalDateTime.now());
        
        if (saleOrder.getMetadata() == null) {
            saleOrder.setMetadata(new HashMap<>());
        }
        saleOrder.getMetadata().put("saleType", "DIRECT_CUSTOMER");
        saleOrder.getMetadata().put("originalOrders", ordersToUpdate.stream().map(Order::getId).collect(Collectors.joining(",")));
        
        Order savedSaleOrder = orderRepository.save(saleOrder);
        
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("soldPins", soldPins);
            response.put("saleId", savedSaleOrder.getId());
            response.put("message", "Successfully sold " + quantity + " PIN(s) from inventory");
            
            return response;
        } catch (Exception e) {
            System.err.println("❌ Error in processDirectSale: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process direct sale: " + e.getMessage(), e);
        }
    }

    // Create sample inventory for testing (development only)
    @Transactional
    public Map<String, Object> createSampleInventory(String retailerId) {
        // First clear any existing inventory
        try {
            int cleared = clearRetailerInventory(retailerId);
            System.out.println("🧹 Cleared " + cleared + " existing inventory items");
        } catch (Exception e) {
            System.out.println("⚠️ No existing inventory to clear: " + e.getMessage());
        }
        System.out.println("🔧 Creating sample inventory for retailer: " + retailerId);
        
        // Find retailer limit
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
        if (limitOpt.isEmpty()) {
            throw new RuntimeException("Retailer limit not found");
        }
        
        RetailerLimit limit = limitOpt.get();
        
        // Create a sample order with PINs - matching the exact structure expected by processDirectSale
        Order sampleOrder = new Order();
        sampleOrder.setRetailer(limit.getRetailer());
        sampleOrder.setProductName("Unknown Product"); // This must match the bundle name exactly
        sampleOrder.setProductType("EPIN");
        sampleOrder.setQuantity(10);
        sampleOrder.setAmount(new BigDecimal("990.00")); // 10 * 99.00 = unit price of 99.00
        sampleOrder.setStatus(Order.OrderStatus.COMPLETED);
        sampleOrder.setPaymentMethod("SAMPLE");
        sampleOrder.setCreatedDate(LocalDateTime.now().minusHours(1));
        
        // Add sample PINs to metadata
        List<String> samplePins = Arrays.asList(
            "PIN:1234****5678",
            "PIN:2345****6789", 
            "PIN:3456****7890",
            "PIN:4567****8901",
            "PIN:5678****9012",
            "PIN:6789****0123",
            "PIN:7890****1234",
            "PIN:8901****2345",
            "PIN:9012****3456",
            "PIN:0123****4567"
        );
        
        Map<String, String> metadata = new HashMap<>();
        metadata.put("allocatedItems", String.join(",", samplePins));
        metadata.put("itemCount", "10");
        metadata.put("purchaseType", "SAMPLE_INVENTORY");
        sampleOrder.setMetadata(metadata);
        
        Order savedOrder = orderRepository.save(sampleOrder);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Sample inventory created");
        response.put("orderId", savedOrder.getId());
        response.put("pins", samplePins.size());
        
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
