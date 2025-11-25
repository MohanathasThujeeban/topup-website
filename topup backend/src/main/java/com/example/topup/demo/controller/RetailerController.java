package com.example.topup.demo.controller;

import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.Order.OrderStatus;
import com.example.topup.demo.service.RetailerService;
import com.example.topup.demo.service.UserService;
import com.example.topup.demo.service.BundleService;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/retailer")
@PreAuthorize("hasRole('BUSINESS')")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:5173", "https://topup.neirahtech", "https://topup-website-gmoj.vercel.app"})
public class RetailerController {

    @Autowired
    private RetailerService retailerService;
    
    @Autowired
    private BundleService bundleService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RetailerOrderRepository retailerOrderRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    // Get all orders for the authenticated retailer
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // First try to get RetailerOrder entities (new system)
            List<RetailerOrder> retailerOrders = retailerOrderRepository.findByRetailerId(retailer.getId());
            
            if (!retailerOrders.isEmpty()) {
                // Convert RetailerOrder to a format compatible with frontend
                List<Map<String, Object>> formattedOrders = retailerOrders.stream()
                    .map(order -> {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("id", order.getId());
                        orderMap.put("orderNumber", order.getOrderNumber());
                        orderMap.put("status", order.getStatus().toString());
                        orderMap.put("amount", order.getTotalAmount());
                        orderMap.put("currency", order.getCurrency());
                        orderMap.put("createdDate", order.getCreatedDate());
                        orderMap.put("paymentStatus", order.getPaymentStatus().toString());
                        
                        // Extract product/bundle info from first item
                        if (order.getItems() != null && !order.getItems().isEmpty()) {
                            RetailerOrder.OrderItem firstItem = order.getItems().get(0);
                            orderMap.put("productName", firstItem.getProductName());
                            orderMap.put("productType", firstItem.getProductType());
                        }
                        
                        // Extract customer info from billing
                        if (order.getBillingInfo() != null) {
                            orderMap.put("customerName", order.getBillingInfo().getContactName());
                            orderMap.put("customerEmail", order.getBillingInfo().getEmail());
                            orderMap.put("customerPhone", order.getBillingInfo().getPhone());
                        }
                        
                        return orderMap;
                    })
                    .collect(Collectors.toList());
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", formattedOrders);
                response.put("total", formattedOrders.size());
                
                return ResponseEntity.ok(response);
            }
            
            // Fallback to old Order entities if no RetailerOrders found
            // Fallback to old Order entities if no RetailerOrders found
            List<Order> orders = retailerService.getOrdersByRetailer(retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orders);
            response.put("total", orders.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    // Get orders by status
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status, Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = retailerService.getOrdersByRetailerAndStatus(retailer, orderStatus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", orders);
            response.put("status", status);
            response.put("total", orders.size());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    // Get available products for retailers
    @GetMapping("/products")
    public ResponseEntity<?> getProducts() {
        try {
            List<Product> products = retailerService.getAvailableProducts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("total", products.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch products: " + e.getMessage()));
        }
    }

    // Get products with stock information
    @GetMapping("/products/in-stock")
    public ResponseEntity<?> getProductsInStock() {
        try {
            List<Product> products = retailerService.getProductsWithStock();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("total", products.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch products: " + e.getMessage()));
        }
    }

    // Create a new order
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            Order order = retailerService.createOrder(
                retailer,
                request.getProductId(),
                request.getCustomerName(),
                request.getCustomerEmail(),
                request.getCustomerPhone(),
                request.getQuantity()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order created successfully");
            response.put("order", order);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Failed to create order: " + e.getMessage()));
        }
    }

    // Update order status
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, 
                                             @RequestBody UpdateOrderStatusRequest request,
                                             Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            OrderStatus status = OrderStatus.valueOf(request.getStatus().toUpperCase());
            
            Order updatedOrder = retailerService.updateOrderStatus(orderId, status, retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated successfully");
            response.put("order", updatedOrder);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Invalid status: " + request.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Failed to update order: " + e.getMessage()));
        }
    }

    // Get retailer analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            Map<String, Object> analytics = retailerService.getRetailerAnalytics(retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("analytics", analytics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch analytics: " + e.getMessage()));
        }
    }

    // Get dashboard summary
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // Get summary data
            List<Order> recentOrders = retailerService.getOrdersByRetailer(retailer);
            List<Product> availableProducts = retailerService.getAvailableProducts();
            Map<String, Object> analytics = retailerService.getRetailerAnalytics(retailer);
            
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("recentOrders", recentOrders.stream().limit(10).toList());
            dashboard.put("availableProducts", availableProducts.stream().limit(5).toList());
            dashboard.put("analytics", analytics);
            dashboard.put("retailerInfo", Map.of(
                "name", retailer.getFullName(),
                "email", retailer.getEmail(),
                "accountType", retailer.getAccountType()
            ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("dashboard", dashboard);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch dashboard: " + e.getMessage()));
        }
    }

    // Helper method to get user from authentication
    private User getUserFromAuthentication(Authentication authentication) {
        // Handle null authentication (development mode)
        if (authentication == null || authentication.getName() == null) {
            System.out.println("⚠️ Authentication is null, using development fallback");
            // For development: get first BUSINESS user
            return userService.findByAccountType(User.AccountType.BUSINESS).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No BUSINESS user found for development"));
        }
        
        String email = authentication.getName();
        System.out.println("✅ Authenticated user: " + email);
        return userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    // Request DTOs
    public static class CreateOrderRequest {
        private String productId;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private Integer quantity;

        // Getters and setters
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    // Bundle endpoints for retailers

    /**
     * Get available bundles catalog for retailers (legacy endpoint)
     * Use /api/retailer/bundles from RetailerBundlePurchaseController for new functionality
     */
    @GetMapping("/bundles/catalog")
    public ResponseEntity<?> getAvailableBundles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        try {
            List<Product> bundles;
            
            if (search != null && !search.trim().isEmpty()) {
                bundles = bundleService.searchBundles(search);
            } else if (category != null) {
                bundles = bundleService.getBundlesByCategory(Product.Category.valueOf(category.toUpperCase()));
            } else if (type != null) {
                bundles = bundleService.getBundlesByType(Product.ProductType.valueOf(type.toUpperCase()));
            } else {
                bundles = bundleService.getBundlesByStatus(Product.ProductStatus.ACTIVE);
            }

            // Filter only active and visible bundles for retailers
            List<Map<String, Object>> retailerBundles = bundles.stream()
                .filter(bundle -> bundle.getStatus() == Product.ProductStatus.ACTIVE && bundle.isVisible())
                .map(bundle -> {
                    Map<String, Object> bundleInfo = new HashMap<>();
                    bundleInfo.put("id", bundle.getId());
                    bundleInfo.put("name", bundle.getName());
                    bundleInfo.put("description", bundle.getDescription());
                    bundleInfo.put("productType", bundle.getProductType());
                    bundleInfo.put("category", bundle.getCategory());
                    bundleInfo.put("basePrice", bundle.getBasePrice()); // Retail price
                    bundleInfo.put("wholesalePrice", bundleService.calculateWholesalePrice(
                        bundle.getBasePrice(), bundle.getRetailerCommissionPercentage()));
                    bundleInfo.put("retailerCommissionPercentage", bundle.getRetailerCommissionPercentage());
                    bundleInfo.put("stockQuantity", bundle.getStockQuantity());
                    bundleInfo.put("dataAmount", bundle.getDataAmount());
                    bundleInfo.put("validity", bundle.getValidity());
                    bundleInfo.put("supportedCountries", bundle.getSupportedCountries());
                    bundleInfo.put("supportedNetworks", bundle.getSupportedNetworks());
                    bundleInfo.put("imageUrl", bundle.getImageUrl());
                    bundleInfo.put("tags", bundle.getTags());
                    bundleInfo.put("metadata", bundle.getMetadata());
                    bundleInfo.put("isFeatured", bundle.isFeatured());
                    return bundleInfo;
                })
                .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bundles", retailerBundles);
            response.put("totalCount", retailerBundles.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch bundles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bundle details by ID for retailers
     */
    @GetMapping("/bundles/{id}")
    public ResponseEntity<?> getBundleDetails(@PathVariable String id) {
        try {
            Product bundle = bundleService.getBundleById(id);
            
            if (bundle.getStatus() != Product.ProductStatus.ACTIVE || !bundle.isVisible()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Bundle not available");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> bundleInfo = new HashMap<>();
            bundleInfo.put("id", bundle.getId());
            bundleInfo.put("name", bundle.getName());
            bundleInfo.put("description", bundle.getDescription());
            bundleInfo.put("productType", bundle.getProductType());
            bundleInfo.put("category", bundle.getCategory());
            bundleInfo.put("basePrice", bundle.getBasePrice());
            bundleInfo.put("wholesalePrice", bundleService.calculateWholesalePrice(
                bundle.getBasePrice(), bundle.getRetailerCommissionPercentage()));
            bundleInfo.put("retailerCommissionPercentage", bundle.getRetailerCommissionPercentage());
            bundleInfo.put("profitMargin", bundle.getBasePrice().subtract(bundleService.calculateWholesalePrice(
                bundle.getBasePrice(), bundle.getRetailerCommissionPercentage())));
            bundleInfo.put("stockQuantity", bundle.getStockQuantity());
            bundleInfo.put("dataAmount", bundle.getDataAmount());
            bundleInfo.put("validity", bundle.getValidity());
            bundleInfo.put("supportedCountries", bundle.getSupportedCountries());
            bundleInfo.put("supportedNetworks", bundle.getSupportedNetworks());
            bundleInfo.put("imageUrl", bundle.getImageUrl());
            bundleInfo.put("tags", bundle.getTags());
            bundleInfo.put("metadata", bundle.getMetadata());
            bundleInfo.put("isFeatured", bundle.isFeatured());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bundle", bundleInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch bundle details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get retailer's purchased bundle inventory
     * @deprecated Use RetailerBundlePurchaseController#getInventory instead
     */
    @GetMapping("/inventory/legacy")
    public ResponseEntity<?> getRetailerInventory(Authentication authentication) {
        try {
            String retailerEmail = authentication.getName();
            Optional<User> retailerOpt = userService.findByEmail(retailerEmail);
            
            if (!retailerOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Retailer not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            User retailer = retailerOpt.get();

            // For now, return mock inventory data since we don't have the order relationship set up yet
            List<Map<String, Object>> mockInventory = java.util.Arrays.asList(
                createMockInventoryItem("1", "Lycamobile Smart S", "1GB", "30 days", 99.0, 69.30, 5),
                createMockInventoryItem("2", "Nordic Bundle M", "5GB", "30 days", 199.0, 139.30, 3),
                createMockInventoryItem("3", "Europe Travel eSIM", "10GB", "30 days", 349.0, 244.30, 8)
            );
            
            // Calculate total inventory value from mock data
            double totalInventoryValue = mockInventory.stream()
                    .mapToDouble(item -> (Double) item.get("wholesalePrice") * (Integer) item.get("quantity"))
                    .sum();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("inventory", mockInventory);
            response.put("totalItems", mockInventory.size());
            response.put("totalValue", totalInventoryValue);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch inventory: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Helper method for creating mock inventory items
    private Map<String, Object> createMockInventoryItem(String id, String name, String dataAllowance, 
                                                       String validity, Double retailPrice, Double wholesalePrice, Integer quantity) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("name", name);
        item.put("dataAllowance", dataAllowance);
        item.put("validity", validity);
        item.put("retailPrice", retailPrice);
        item.put("wholesalePrice", wholesalePrice);
        item.put("quantity", quantity);
        item.put("totalValue", wholesalePrice * quantity);
        return item;
    }

    // Get POS sales history
    @GetMapping("/pos-sales")
    public ResponseEntity<?> getPosSales(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // Get all SOLD orders (POS sales)
            List<Order> posSales = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
                retailer, Order.OrderStatus.SOLD);
            
            List<Map<String, Object>> salesData = posSales.stream().map(sale -> {
                Map<String, Object> saleInfo = new HashMap<>();
                saleInfo.put("id", sale.getId());
                saleInfo.put("productName", sale.getProductName());
                saleInfo.put("quantity", sale.getQuantity());
                saleInfo.put("amount", sale.getAmount());
                saleInfo.put("date", sale.getCreatedDate());
                saleInfo.put("paymentMethod", sale.getPaymentMethod());
                saleInfo.put("status", sale.getStatus());
                
                // Add metadata if available
                if (sale.getMetadata() != null) {
                    saleInfo.put("saleType", sale.getMetadata().get("saleType"));
                }
                
                return saleInfo;
            }).collect(Collectors.toList());
            
            // Calculate totals
            BigDecimal totalRevenue = posSales.stream()
                .map(Order::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            int totalSales = posSales.size();
            int totalPinsSold = posSales.stream()
                .mapToInt(Order::getQuantity)
                .sum();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sales", salesData);
            response.put("summary", Map.of(
                "totalSales", totalSales,
                "totalRevenue", totalRevenue,
                "totalPinsSold", totalPinsSold,
                "averageSaleAmount", totalSales > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalSales), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch POS sales: " + e.getMessage()));
        }
    }

    // Get sales data summary (for dashboard)
    @GetMapping("/sales")
    public ResponseEntity<?> getSalesData(Authentication authentication) {
        try {
            // Handle anonymous/unauthenticated requests
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of(
                        "customerSales", 0,
                        "totalSales", 0,
                        "totalRevenue", 0,
                        "revenue", 0
                    )
                ));
            }
            
            User retailer = getUserFromAuthentication(authentication);
            
            // Get all SOLD orders (customer sales / POS sales)
            List<Order> customerSales = orderRepository.findByRetailerAndStatusOrderByCreatedDateDesc(
                retailer, Order.OrderStatus.SOLD);
            
            // Calculate totals
            BigDecimal totalRevenue = customerSales.stream()
                .map(Order::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            int totalSales = customerSales.size();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "customerSales", totalSales,
                "totalSales", totalSales,
                "totalRevenue", totalRevenue,
                "revenue", totalRevenue
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch sales data: " + e.getMessage()));
        }
    }

    // Get retailer's margin rate
    @GetMapping("/margin-rate")
    public ResponseEntity<?> getMarginRate(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // Get margin rate from user's business details
            Double marginRate = retailerService.getRetailerMarginRate(retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("marginRate", marginRate);
            response.put("isSet", marginRate != null);
            response.put("description", marginRate != null ? "Retailer's profit margin rate set by admin" : "No margin rate set by admin yet");
            response.put("lastUpdated", retailer.getUpdatedDate());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch margin rate: " + e.getMessage()));
        }
    }

    /**
     * Get purchased bundles for the authenticated retailer
     */
    @GetMapping("/purchased-bundles")
    public ResponseEntity<?> getPurchasedBundles(Authentication authentication) {
        try {
            System.out.println("📦 Fetching purchased bundles...");
            User retailer = getUserFromAuthentication(authentication);
            System.out.println("👤 Retailer ID: " + retailer.getId());
            
            // Fetch retailer's bundle orders (COMPLETED or DELIVERED)
            List<RetailerOrder> completedOrders = retailerOrderRepository.findByRetailerIdAndStatus(
                retailer.getId(), 
                RetailerOrder.OrderStatus.COMPLETED
            );
            List<RetailerOrder> deliveredOrders = retailerOrderRepository.findByRetailerIdAndStatus(
                retailer.getId(), 
                RetailerOrder.OrderStatus.DELIVERED
            );
            
            // Combine both lists
            List<RetailerOrder> bundleOrders = new java.util.ArrayList<>();
            bundleOrders.addAll(completedOrders);
            bundleOrders.addAll(deliveredOrders);
            
            System.out.println("📋 Found " + bundleOrders.size() + " completed/delivered orders");
            
            // Filter for bundle-type products and map to response format
            List<Map<String, Object>> purchasedBundles = bundleOrders.stream()
                .flatMap(order -> {
                    System.out.println("🔍 Processing order: " + order.getOrderNumber() + " with " + order.getItems().size() + " items");
                    return order.getItems().stream()
                        .filter(item -> {
                            boolean isBundle = "BUNDLE".equalsIgnoreCase(item.getProductType()) || 
                                             "bundle".equalsIgnoreCase(item.getCategory());
                            System.out.println("  - Item: " + item.getProductName() + ", Type: " + item.getProductType() + ", Category: " + item.getCategory() + ", IsBundle: " + isBundle);
                            return isBundle;
                        })
                        .map(item -> {
                            Map<String, Object> bundle = new HashMap<>();
                            bundle.put("bundleName", item.getProductName());
                            bundle.put("poolName", item.getProductId() != null ? item.getProductId() : "Standard Pool");
                            bundle.put("unitCount", item.getQuantity());
                            bundle.put("pricePerUnit", item.getUnitPrice());  // Purchase/wholesale price
                            bundle.put("purchasePrice", item.getUnitPrice());  // Cost price (what retailer paid)
                            
                            // Use retailPrice if available, otherwise use unitPrice
                            java.math.BigDecimal sellingPrice = item.getRetailPrice() != null ? item.getRetailPrice() : item.getUnitPrice();
                            bundle.put("totalPrice", sellingPrice);  // Selling price to customer
                            bundle.put("bundlePrice", sellingPrice);  // Same as totalPrice for consistency
                            
                            bundle.put("purchaseDate", order.getCreatedDate());
                            bundle.put("orderId", order.getId());
                            bundle.put("orderNumber", order.getOrderNumber());
                            
                            // Extract encrypted PINs from order notes
                            List<String> encryptedPins = new ArrayList<>();
                            if (order.getNotes() != null && order.getNotes().startsWith("ENCRYPTED_PINS:")) {
                                String pinsData = order.getNotes().substring("ENCRYPTED_PINS:".length());
                                if (!pinsData.isEmpty()) {
                                    encryptedPins = Arrays.asList(pinsData.split(","));
                                }
                            }
                            bundle.put("encryptedPins", encryptedPins);
                            bundle.put("availablePins", encryptedPins.size());  // Number of available PINs
                            bundle.put("quantity", item.getQuantity());  // Total quantity in order
                            
                            System.out.println("  📌 Bundle: " + item.getProductName() + 
                                             ", Purchase Price: " + item.getUnitPrice() + 
                                             ", Retail Price: " + sellingPrice +
                                             ", PINs: " + encryptedPins.size());
                            
                            return bundle;
                        });
                })
                .collect(Collectors.toList());
            
            System.out.println("✅ Returning " + purchasedBundles.size() + " purchased bundles");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", purchasedBundles);
            response.put("total", purchasedBundles.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching purchased bundles: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch purchased bundles: " + e.getMessage());
            errorResponse.put("data", new ArrayList<>());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
        }
    }

    /**
     * Get purchased eSIMs for the authenticated retailer
     */
    @GetMapping("/purchased-esims")
    public ResponseEntity<?> getPurchasedEsims(Authentication authentication) {
        try {
            System.out.println("🌐 Fetching purchased eSIMs...");
            User retailer = getUserFromAuthentication(authentication);
            System.out.println("👤 Retailer ID: " + retailer.getId());
            
            // Fetch retailer's eSIM orders (COMPLETED or DELIVERED)
            List<RetailerOrder> completedOrders = retailerOrderRepository.findByRetailerIdAndStatus(
                retailer.getId(), 
                RetailerOrder.OrderStatus.COMPLETED
            );
            List<RetailerOrder> deliveredOrders = retailerOrderRepository.findByRetailerIdAndStatus(
                retailer.getId(), 
                RetailerOrder.OrderStatus.DELIVERED
            );
            
            // Combine both lists
            List<RetailerOrder> esimOrders = new java.util.ArrayList<>();
            esimOrders.addAll(completedOrders);
            esimOrders.addAll(deliveredOrders);
            
            System.out.println("📋 Found " + esimOrders.size() + " completed/delivered orders");
            
            // Filter for eSIM-type products and map to response format
            List<Map<String, Object>> purchasedEsims = esimOrders.stream()
                .flatMap(order -> {
                    System.out.println("🔍 Processing order: " + order.getOrderNumber() + " with " + order.getItems().size() + " items");
                    return order.getItems().stream()
                        .filter(item -> {
                            boolean isEsim = "ESIM".equalsIgnoreCase(item.getProductType()) || 
                                           "esim".equalsIgnoreCase(item.getCategory());
                            System.out.println("  - Item: " + item.getProductName() + ", Type: " + item.getProductType() + ", Category: " + item.getCategory() + ", IsEsim: " + isEsim);
                            return isEsim;
                        })
                        .map(item -> {
                            Map<String, Object> esim = new HashMap<>();
                            esim.put("productName", item.getProductName());
                            esim.put("poolName", item.getProductId());
                            esim.put("unitCount", item.getQuantity());
                            esim.put("pricePerUnit", item.getUnitPrice());
                            esim.put("purchaseDate", order.getCreatedDate());
                            esim.put("orderId", order.getId());
                            esim.put("orderNumber", order.getOrderNumber());
                            esim.put("dataAmount", item.getDataAmount());
                            esim.put("validity", item.getValidity());
                            // Note: Encrypted PINs should be fetched from stock/inventory separately
                            esim.put("encryptedPins", new ArrayList<>()); // Placeholder
                            return esim;
                        });
                })
                .collect(Collectors.toList());
            
            System.out.println("✅ Returning " + purchasedEsims.size() + " purchased eSIMs");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", purchasedEsims);
            response.put("total", purchasedEsims.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching purchased eSIMs: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch purchased eSIMs: " + e.getMessage());
            errorResponse.put("data", new ArrayList<>());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
        }
    }

    public static class UpdateOrderStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}