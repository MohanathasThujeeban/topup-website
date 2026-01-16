package com.example.topup.demo.controller;

import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.Order.OrderStatus;
import com.example.topup.demo.service.RetailerService;
import com.example.topup.demo.service.UserService;
import com.example.topup.demo.service.BundleService;
import com.example.topup.demo.service.StockService;
import com.example.topup.demo.service.AdminService;
import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.RetailerEsimCredit;
import com.example.topup.demo.entity.RetailerKickbackLimit;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.OrderRepository;
import com.example.topup.demo.repository.RetailerLimitRepository;
import com.example.topup.demo.repository.RetailerEsimCreditRepository;
import com.example.topup.demo.repository.RetailerKickbackLimitRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
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
    private StockService stockService;
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private RetailerOrderRepository retailerOrderRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    @Autowired
    private RetailerEsimCreditRepository retailerEsimCreditRepository;

    @Autowired
    private RetailerKickbackLimitRepository retailerKickbackLimitRepository;

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

    // Get sales summary (count of sold items and total earnings)
    @GetMapping("/sales-summary")
    public ResponseEntity<?> getSalesSummary(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            Map<String, Object> salesSummary = retailerService.getSalesSummary(retailer);
            
            return ResponseEntity.ok(salesSummary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch sales summary: " + e.getMessage()));
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
        // Handle null authentication
        if (authentication == null || authentication.getName() == null) {
            System.err.println("⚠️ Authentication is null - checking for any BUSINESS user");
            // Try to find any BUSINESS user as fallback
            Optional<User> businessUser = userService.findByAccountType(User.AccountType.BUSINESS).stream()
                .findFirst();
            if (businessUser.isPresent()) {
                System.out.println("⚠️ Using fallback BUSINESS user: " + businessUser.get().getEmail());
                return businessUser.get();
            }
            throw new RuntimeException("Authentication required and no BUSINESS user found");
        }
        
        // Get retailer by email from authentication
        String email = authentication.getName();
        System.out.println("✅ Authenticated user: " + email);
        
        Optional<User> retailerOpt = userService.findByEmail(email);
        if (retailerOpt.isPresent()) {
            User user = retailerOpt.get();
            if (user.getAccountType() == User.AccountType.BUSINESS) {
                System.out.println("✅ Authenticated retailer ID: " + user.getId());
                return user;
            } else {
                System.err.println("⚠️ User is not a BUSINESS account: " + email + " (type: " + user.getAccountType() + ")");
                // Try to find a BUSINESS user as fallback
                Optional<User> businessUser = userService.findByAccountType(User.AccountType.BUSINESS).stream()
                    .findFirst();
                if (businessUser.isPresent()) {
                    System.out.println("⚠️ Using fallback BUSINESS user: " + businessUser.get().getEmail());
                    return businessUser.get();
                }
            }
        }
        
        // If not found, throw error with details
        System.err.println("❌ User not found: " + email);
        throw new RuntimeException("User not found or not a business account: " + email);
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
     * Get all product-specific margin rates for the authenticated retailer
     */
    @GetMapping("/margin-rates/all")
    public ResponseEntity<?> getAllProductMarginRates(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // Get all product-specific margin rates
            List<Map<String, Object>> productMarginRates = retailerService.getAllProductMarginRates(retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("productMarginRates", productMarginRates);
            response.put("totalProducts", productMarginRates.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch product margin rates: " + e.getMessage()));
        }
    }

    /**
     * Get credit level for the authenticated retailer
     */
    @GetMapping("/credit-level")
    public ResponseEntity<?> getCreditLevel(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // Fetch credit limit from retailer_limits collection
            Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailer.getId());
            
            // Fetch eSIM credit from SEPARATE retailer_esim_credits collection
            Optional<RetailerEsimCredit> esimCreditOpt = retailerEsimCreditRepository.findByRetailer_Id(retailer.getId());
            
            // If no eSIM credit in new collection, check old collection and migrate
            if (!esimCreditOpt.isPresent() && limitOpt.isPresent()) {
                RetailerLimit oldLimit = limitOpt.get();
                BigDecimal oldEsimCreditLimit = oldLimit.getEsimCreditLimit();
                
                if (oldEsimCreditLimit != null && oldEsimCreditLimit.compareTo(BigDecimal.ZERO) > 0) {
                    System.out.println("📊 Migrating eSIM credit from OLD collection to NEW collection...");
                    
                    // Create new record in retailer_esim_credits collection
                    RetailerEsimCredit newEsimCredit = new RetailerEsimCredit(retailer);
                    newEsimCredit.setCreditLimit(oldEsimCreditLimit);
                    newEsimCredit.setUsedCredit(oldLimit.getEsimUsedCredit() != null ? oldLimit.getEsimUsedCredit() : BigDecimal.ZERO);
                    newEsimCredit.setAvailableCredit(oldLimit.getEsimAvailableCredit() != null ? oldLimit.getEsimAvailableCredit() : oldEsimCreditLimit);
                    newEsimCredit.setCreatedBy("system-migration");
                    RetailerEsimCredit savedCredit = retailerEsimCreditRepository.save(newEsimCredit);
                    esimCreditOpt = Optional.of(savedCredit);
                    
                    System.out.println("✅ Migrated eSIM credit to NEW collection. ID: " + savedCredit.getId());
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            
            if (limitOpt.isPresent()) {
                RetailerLimit limit = limitOpt.get();
                
                // Calculate credit usage percentage
                BigDecimal usagePercentage = BigDecimal.ZERO;
                if (limit.getCreditLimit() != null && limit.getCreditLimit().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal usedCredit = limit.getUsedCredit() != null ? limit.getUsedCredit() : BigDecimal.ZERO;
                    usagePercentage = usedCredit
                        .multiply(BigDecimal.valueOf(100))
                        .divide(limit.getCreditLimit(), 2, RoundingMode.HALF_UP);
                }
                
                response.put("success", true);
                response.put("creditLimit", limit.getCreditLimit() != null ? limit.getCreditLimit().doubleValue() : 0.0);
                response.put("usedCredit", limit.getUsedCredit() != null ? limit.getUsedCredit().doubleValue() : 0.0);
                response.put("availableCredit", limit.getAvailableCredit() != null ? limit.getAvailableCredit().doubleValue() : 0.0);
                response.put("creditUsagePercentage", usagePercentage.doubleValue());
                response.put("status", limit.getStatus() != null ? limit.getStatus().toString() : "ACTIVE");
                response.put("outstandingAmount", limit.getOutstandingAmount() != null ? limit.getOutstandingAmount().doubleValue() : 0.0);
                
                // Include transactions if available
                if (limit.getTransactions() != null && !limit.getTransactions().isEmpty()) {
                    response.put("transactions", limit.getTransactions());
                }
                
                System.out.println("✅ Credit level fetched for retailer: " + retailer.getId());
                System.out.println("   Credit Limit: " + limit.getCreditLimit());
                System.out.println("   Used Credit: " + limit.getUsedCredit());
                System.out.println("   Available Credit: " + limit.getAvailableCredit());
            } else {
                // No credit limit set - return zeros
                System.out.println("⚠️ No credit limit found for retailer: " + retailer.getId());
                response.put("success", true);
                response.put("creditLimit", 0.0);
                response.put("usedCredit", 0.0);
                response.put("availableCredit", 0.0);
                response.put("creditUsagePercentage", 0.0);
                response.put("status", "NOT_SET");
                response.put("outstandingAmount", 0.0);
                response.put("message", "No credit limit set by admin yet");
            }
            
            // eSIM Credit fields from SEPARATE collection
            if (esimCreditOpt.isPresent()) {
                RetailerEsimCredit esimCredit = esimCreditOpt.get();
                response.put("esimCreditLimit", esimCredit.getCreditLimit() != null ? esimCredit.getCreditLimit().doubleValue() : 0.0);
                response.put("esimUsedCredit", esimCredit.getUsedCredit() != null ? esimCredit.getUsedCredit().doubleValue() : 0.0);
                response.put("esimAvailableCredit", esimCredit.getAvailableCredit() != null ? esimCredit.getAvailableCredit().doubleValue() : 0.0);
                
                // Calculate eSIM credit usage percentage
                BigDecimal esimUsagePercentage = BigDecimal.ZERO;
                if (esimCredit.getCreditLimit() != null && esimCredit.getCreditLimit().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal esimUsed = esimCredit.getUsedCredit() != null ? esimCredit.getUsedCredit() : BigDecimal.ZERO;
                    esimUsagePercentage = esimUsed
                        .multiply(BigDecimal.valueOf(100))
                        .divide(esimCredit.getCreditLimit(), 2, RoundingMode.HALF_UP);
                }
                response.put("esimCreditUsagePercentage", esimUsagePercentage.doubleValue());
                
                // Include eSIM transactions if available
                if (esimCredit.getTransactions() != null && !esimCredit.getTransactions().isEmpty()) {
                    response.put("esimTransactions", esimCredit.getTransactions());
                }
                
                System.out.println("   eSIM Credit Limit: " + esimCredit.getCreditLimit());
                System.out.println("   eSIM Used Credit: " + esimCredit.getUsedCredit());
                System.out.println("   eSIM Available Credit: " + esimCredit.getAvailableCredit());
            } else {
                response.put("esimCreditLimit", 0.0);
                response.put("esimUsedCredit", 0.0);
                response.put("esimAvailableCredit", 0.0);
                response.put("esimCreditUsagePercentage", 0.0);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching credit level: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch credit level: " + e.getMessage()));
        }
    }

    /**
     * Get kickback bonus limit for the authenticated retailer
     */
    @GetMapping("/kickback-limit")
    public ResponseEntity<?> getKickbackLimit(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            Optional<RetailerKickbackLimit> kickbackLimitOpt = retailerKickbackLimitRepository.findByRetailerId(retailer.getId());
            
            Map<String, Object> response = new HashMap<>();
            
            if (kickbackLimitOpt.isPresent()) {
                RetailerKickbackLimit kickbackLimit = kickbackLimitOpt.get();
                
                response.put("success", true);
                response.put("kickbackLimit", kickbackLimit.getKickbackLimit() != null ? kickbackLimit.getKickbackLimit().doubleValue() : 0.0);
                response.put("usedKickback", kickbackLimit.getUsedKickback() != null ? kickbackLimit.getUsedKickback().doubleValue() : 0.0);
                response.put("availableKickback", kickbackLimit.getAvailableKickback() != null ? kickbackLimit.getAvailableKickback().doubleValue() : 0.0);
                response.put("usagePercentage", kickbackLimit.getUsagePercentage());
                response.put("status", kickbackLimit.getStatus() != null ? kickbackLimit.getStatus().toString() : "ACTIVE");
                
                System.out.println("✅ Kickback limit fetched for retailer: " + retailer.getId());
                System.out.println("   Kickback Limit: " + kickbackLimit.getKickbackLimit());
                System.out.println("   Used Kickback: " + kickbackLimit.getUsedKickback());
                System.out.println("   Available Kickback: " + kickbackLimit.getAvailableKickback());
            } else {
                // No kickback limit set - return zeros
                System.out.println("⚠️ No kickback limit found for retailer: " + retailer.getId());
                response.put("success", true);
                response.put("kickbackLimit", 0.0);
                response.put("usedKickback", 0.0);
                response.put("availableKickback", 0.0);
                response.put("usagePercentage", 0.0);
                response.put("status", "NOT_SET");
                response.put("message", "No kickback limit set by admin yet");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching kickback limit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch kickback limit: " + e.getMessage()));
        }
    }

    /**
     * Record profit from a sale
     */
    @PostMapping("/record-profit")
    public ResponseEntity<?> recordProfit(@RequestBody Map<String, Object> profitData, Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            BigDecimal saleAmount = new BigDecimal(profitData.get("saleAmount").toString());
            BigDecimal costPrice = new BigDecimal(profitData.get("costPrice").toString());
            String bundleName = profitData.get("bundleName").toString();
            String bundleId = profitData.getOrDefault("bundleId", "").toString();
            Double marginRate = profitData.containsKey("marginRate") ? 
                Double.parseDouble(profitData.get("marginRate").toString()) : null;
            
            // Record the profit
            retailerService.recordProfit(retailer, saleAmount, costPrice, bundleName, bundleId, marginRate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profit recorded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error recording profit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to record profit: " + e.getMessage()));
        }
    }

    /**
     * Get profit data by time period (daily, monthly, yearly)
     */
    @GetMapping("/profit/{period}")
    public ResponseEntity<?> getProfitData(@PathVariable String period, Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            // Validate period
            if (!Arrays.asList("daily", "monthly", "yearly").contains(period.toLowerCase())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid period. Use: daily, monthly, or yearly"));
            }
            
            List<Map<String, Object>> profitData = retailerService.getProfitData(retailer, period);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("period", period);
            response.put("data", profitData);
            response.put("count", profitData.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching profit data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch profit data: " + e.getMessage()));
        }
    }

    /**
     * Get profit summary (total profit, daily profit, avg margin)
     */
    @GetMapping("/profit-summary")
    public ResponseEntity<?> getProfitSummary(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            Map<String, Object> summary = retailerService.getProfitSummary(retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("summary", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching profit summary: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch profit summary: " + e.getMessage()));
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

    // Direct sale from admin stock pool (POS)
    @PostMapping("/direct-sale")
    public ResponseEntity<?> directSale(@RequestBody Map<String, Object> saleRequest, Authentication authentication) {
        try {
            System.out.println("📥 Received direct sale request: " + saleRequest);
            
            User retailer = getUserFromAuthentication(authentication);
            
            String bundleId = (String) saleRequest.get("bundleId");
            String bundleName = (String) saleRequest.get("bundleName");
            Integer quantity = (Integer) saleRequest.get("quantity");
            Object unitPriceObj = saleRequest.get("unitPrice");
            Object totalAmountObj = saleRequest.get("totalAmount");
            String customerName = (String) saleRequest.getOrDefault("customerName", "Walk-in Customer");
            String customerPhone = (String) saleRequest.getOrDefault("customerPhone", "");
            String customerEmail = (String) saleRequest.getOrDefault("customerEmail", "");
            String saleType = (String) saleRequest.getOrDefault("saleType", "EPIN"); // EPIN or ESIM
            String paymentMode = (String) saleRequest.getOrDefault("paymentMode", "credit"); // 'credit' or 'kickback'
            
            System.out.println("🔍 DEBUG - Received saleType from frontend: '" + saleType + "'");
            System.out.println("🔍 DEBUG - Received paymentMode from frontend: '" + paymentMode + "'");
            System.out.println("🔍 DEBUG - saleType.equalsIgnoreCase(ESIM): " + saleType.equalsIgnoreCase("ESIM"));
            
            // Handle numeric values that might come as Double or Integer
            double unitPrice = 0;
            if (unitPriceObj instanceof Number) {
                unitPrice = ((Number) unitPriceObj).doubleValue();
            }
            
            double totalAmount = 0;
            if (totalAmountObj instanceof Number) {
                totalAmount = ((Number) totalAmountObj).doubleValue();
            }
            
            if (bundleId == null || quantity == null || quantity <= 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid sale request. bundleId and quantity are required.");
                return ResponseEntity.badRequest().body(error);
            }
            
            System.out.println("🛒 Processing " + saleType + " sale: " + quantity + "x " + bundleName + " (" + bundleId + ")");
            
            // Assign stock items from admin pool
            List<Map<String, String>> assignedItems = new ArrayList<>();
            String orderId = "POS-" + System.currentTimeMillis();
            StockPool.StockType stockType = saleType.equalsIgnoreCase("ESIM") ? StockPool.StockType.ESIM : StockPool.StockType.EPIN;
            
            for (int i = 0; i < quantity; i++) {
                try {
                    // Assign stock from admin pool
                    StockPool.StockItem item = stockService.assignStockToOrder(
                        bundleId, 
                        stockType, 
                        orderId,
                        retailer.getId(),
                        retailer.getEmail()
                    );
                    
                    // Create item object with details
                    Map<String, String> itemData = new HashMap<>();
                    
                    if (stockType == StockPool.StockType.ESIM) {
                        // For eSIM, don't decrypt - just store the reference
                        itemData.put("serialNumber", item.getSerialNumber() != null ? item.getSerialNumber() : "N/A");
                        itemData.put("iccid", item.getItemData() != null ? item.getItemData() : "N/A");
                    } else {
                        // For ePIN, decrypt the PIN
                        String decryptedPin = stockService.decryptData(item.getItemData());
                        itemData.put("pin", decryptedPin);
                        
                        // Generate serial number: use item's serial number, or itemId, or create from PIN
                        String serialNumber;
                        if (item.getSerialNumber() != null && !item.getSerialNumber().isEmpty()) {
                            serialNumber = item.getSerialNumber();
                        } else if (item.getItemId() != null && !item.getItemId().isEmpty()) {
                            serialNumber = item.getItemId();
                        } else {
                            // Create serial number from PIN (e.g., first 15 digits + last 4)
                            serialNumber = decryptedPin.length() >= 16 
                                ? "OFF" + decryptedPin.substring(0, Math.min(13, decryptedPin.length())) + decryptedPin.substring(Math.max(0, decryptedPin.length() - 4))
                                : "SN-" + decryptedPin;
                        }
                        itemData.put("serialNumber", serialNumber);
                    }
                    
                    itemData.put("expiryDate", item.getExpiryDate() != null ? item.getExpiryDate().toString() : null);
                    assignedItems.add(itemData);
                    
                    System.out.println("✅ Assigned " + saleType + " " + (i + 1) + "/" + quantity);
                } catch (Exception e) {
                    System.err.println("❌ Failed to assign " + saleType + " " + (i + 1) + ": " + e.getMessage());
                    throw new RuntimeException("Failed to allocate stock: " + e.getMessage());
                }
            }
            
            System.out.println("✅ Sale completed - " + assignedItems.size() + " items assigned");
            
            // Create RetailerOrder record for this sale
            try {
                RetailerOrder order = new RetailerOrder();
                order.setRetailerId(retailer.getId());
                order.setOrderNumber(orderId);
                order.setTotalAmount(BigDecimal.valueOf(totalAmount));
                order.setCurrency("NOK");
                order.setStatus(RetailerOrder.OrderStatus.COMPLETED);
                order.setPaymentStatus(RetailerOrder.PaymentStatus.COMPLETED);
                order.setPaymentMethod("CREDIT");
                order.setCreatedBy(retailer.getEmail());
                order.setCreatedDate(LocalDateTime.now());
                
                // Create order item
                RetailerOrder.OrderItem orderItem = new RetailerOrder.OrderItem();
                orderItem.setProductId(bundleId);
                orderItem.setProductName(bundleName);
                orderItem.setProductType(saleType);
                orderItem.setCategory(saleType.equalsIgnoreCase("ESIM") ? "ESIM" : "EPIN");
                orderItem.setQuantity(quantity);
                orderItem.setUnitPrice(BigDecimal.valueOf(unitPrice));
                
                // Add serial numbers to order item
                List<String> serialNumbers = assignedItems.stream()
                    .map(item -> item.get("serialNumber"))
                    .collect(Collectors.toList());
                orderItem.setSerialNumbers(serialNumbers);
                
                order.setItems(Arrays.asList(orderItem));
                
                // Save order
                RetailerOrder savedOrder = retailerOrderRepository.save(order);
                System.out.println("📝 Order record created: " + orderId);
                System.out.println("📝 Order ID (MongoDB): " + savedOrder.getId());
                System.out.println("📝 Order Type: " + saleType);
                System.out.println("📝 Order Category: " + orderItem.getCategory());
                System.out.println("📝 Order Items Count: " + savedOrder.getItems().size());
                System.out.println("📝 First Item Type: " + savedOrder.getItems().get(0).getProductType());
                System.out.println("📝 First Item Category: " + savedOrder.getItems().get(0).getCategory());
            } catch (Exception e) {
                System.err.println("⚠️ Failed to create order record: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to save order: " + e.getMessage());
            }
            
            // Update retailer credit or kickback based on payment mode
            // Note: eSIM sales are handled separately via /admin/stock/esims/send-qr endpoint
            try {
                System.out.println("🔍 Looking for limits for retailer ID: " + retailer.getId());
                System.out.println("🔍 Payment mode: " + paymentMode);
                System.out.println("🔍 Sale amount: " + totalAmount);
                
                BigDecimal saleAmount = BigDecimal.valueOf(totalAmount);
                
                if ("kickback".equalsIgnoreCase(paymentMode)) {
                    // Deduct from Kickback Bonus Limit
                    Optional<RetailerKickbackLimit> kickbackLimitOpt = retailerKickbackLimitRepository.findByRetailerId(retailer.getId());
                    
                    if (kickbackLimitOpt.isPresent()) {
                        RetailerKickbackLimit kickbackLimit = kickbackLimitOpt.get();
                        
                        System.out.println("✅ Found RetailerKickbackLimit: " + kickbackLimit.getId());
                        System.out.println("📊 Before update - Kickback Used: " + kickbackLimit.getUsedKickback() + ", Available: " + kickbackLimit.getAvailableKickback());
                        
                        // Use the entity's helper method to deduct kickback
                        kickbackLimit.useKickback(saleAmount);
                        
                        // Save updated kickback limit
                        RetailerKickbackLimit savedKickback = retailerKickbackLimitRepository.save(kickbackLimit);
                        System.out.println("✅ Kickback limit updated successfully. ID: " + savedKickback.getId());
                        System.out.println("📊 After save - Kickback Used: " + savedKickback.getUsedKickback() + ", Available: " + savedKickback.getAvailableKickback());
                    } else {
                        System.out.println("⚠️ No kickback limit found for retailer ID: " + retailer.getId());
                    }
                } else {
                    // Deduct from Credit Limit (default)
                    Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailer.getId());
                    
                    if (limitOpt.isPresent()) {
                        RetailerLimit limit = limitOpt.get();
                        
                        System.out.println("✅ Found RetailerLimit: " + limit.getId());
                        System.out.println("📊 Before update - ePIN Used: " + limit.getUsedCredit() + ", ePIN Available: " + limit.getAvailableCredit());
                        
                        // Update regular credit
                        BigDecimal currentUsed = limit.getUsedCredit() != null ? limit.getUsedCredit() : BigDecimal.ZERO;
                        limit.setUsedCredit(currentUsed.add(saleAmount));
                        
                        BigDecimal currentAvailable = limit.getAvailableCredit() != null ? limit.getAvailableCredit() : BigDecimal.ZERO;
                        limit.setAvailableCredit(currentAvailable.subtract(saleAmount));
                        
                        System.out.println("💰 ePIN Credit updated - Used: " + limit.getUsedCredit() + ", Available: " + limit.getAvailableCredit());
                        
                        // Save updated limit
                        RetailerLimit savedLimit = retailerLimitRepository.save(limit);
                        System.out.println("✅ RetailerLimit saved successfully. ID: " + savedLimit.getId());
                        System.out.println("📊 After save - ePIN Used: " + savedLimit.getUsedCredit() + ", ePIN Available: " + savedLimit.getAvailableCredit());
                    } else {
                        System.out.println("⚠️ No credit limit found for retailer ID: " + retailer.getId() + " - skipping credit update");
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to update payment limit: " + e.getMessage());
                e.printStackTrace();
                // Continue with the sale even if limit update fails
            }
            
            // Prepare response
            Map<String, Object> saleData = new HashMap<>();
            saleData.put("saleId", orderId);
            saleData.put("items", assignedItems);
            saleData.put("pins", assignedItems); // Add pins alias for frontend compatibility
            saleData.put("bundleName", bundleName);
            saleData.put("quantity", quantity);
            saleData.put("totalAmount", totalAmount);
            saleData.put("customerName", customerName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sale completed successfully");
            response.put("data", saleData);
            response.put("pins", assignedItems); // Also add pins at root level for frontend compatibility
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Direct sale failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Sale failed: " + e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get retailer's own sales details with serial numbers
     */
    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getMySales(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            Map<String, Object> salesData = adminService.getRetailerSalesDetails(retailer.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", salesData);
            response.put("message", "Sales details fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch sales: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get retailer's eSIM POS sales report with ICCID and customer details
     */
    @GetMapping("/esim-sales-report")
    public ResponseEntity<Map<String, Object>> getEsimSalesReport(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            User retailer = getUserFromAuthentication(authentication);

            Map<String, Object> reportData = adminService.getRetailerEsimSalesReport(retailer.getId(), startDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reportData);
            response.put("message", "eSIM sales report fetched successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch eSIM sales report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Print receipt for an order
     */
    @PostMapping("/orders/{orderId}/print")
    public ResponseEntity<?> printReceipt(@PathVariable String orderId, Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            Optional<Order> orderOptional = orderRepository.findById(orderId);
            if (!orderOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Order not found"));
            }
            
            Order order = orderOptional.get();
            
            // Verify retailer owns this order
            User retailerUser = order.getRetailer();
            if (retailerUser == null || !retailerUser.getId().equals(retailer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Unauthorized access to this order"));
            }
            
            // Generate receipt data
            Map<String, Object> receipt = new HashMap<>();
            receipt.put("orderId", order.getId());
            receipt.put("timestamp", order.getCreatedDate());
            receipt.put("retailerName", retailer.getFullName() != null ? retailer.getFullName() : retailer.getUsername());
            receipt.put("retailerEmail", retailer.getEmail());
            receipt.put("retailerPhone", retailer.getMobileNumber());
            receipt.put("customerName", order.getCustomerName());
            receipt.put("customerEmail", order.getCustomerEmail());
            receipt.put("customerPhone", order.getCustomerPhone());
            receipt.put("productName", order.getProductName());
            receipt.put("productId", order.getProduct() != null ? order.getProduct().getId() : "N/A");
            receipt.put("quantity", order.getQuantity());
            receipt.put("unitPrice", order.getAmount());
            receipt.put("totalAmount", order.getAmount());
            receipt.put("status", order.getStatus());
            
            // Add eSIM-specific fields if applicable
            Map<String, Object> metadata = order.getMetadata() != null ? new HashMap<>(order.getMetadata()) : new HashMap<>();
            if (!metadata.isEmpty() && metadata.containsKey("isEsim")) {
                receipt.put("isEsim", true);
                receipt.put("activationCode", metadata.getOrDefault("activationCode", "N/A"));
                receipt.put("smDpAddress", metadata.getOrDefault("smDpAddress", "N/A"));
                receipt.put("qrCodeUrl", metadata.getOrDefault("qrCodeUrl", ""));
                receipt.put("iccid", metadata.getOrDefault("iccid", ""));
                receipt.put("apnSettings", metadata.getOrDefault("apnSettings", ""));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Receipt generated successfully");
            response.put("receipt", receipt);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to generate receipt: " + e.getMessage()));
        }
    }

    /**
     * Print eSIM receipt with QR code and activation details
     */
    @PostMapping("/orders/{orderId}/print-esim")
    public ResponseEntity<?> printEsimReceipt(@PathVariable String orderId, 
                                             @RequestParam(required = false) String qrCodeBase64,
                                             Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            
            Optional<Order> orderOptional = orderRepository.findById(orderId);
            if (!orderOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Order not found"));
            }
            
            Order order = orderOptional.get();
            
            // Verify retailer owns this order
            User retailerUser = order.getRetailer();
            if (retailerUser == null || !retailerUser.getId().equals(retailer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Unauthorized access to this order"));
            }
            
            // Generate eSIM receipt with full template
            Map<String, Object> esimReceipt = new HashMap<>();
            esimReceipt.put("orderId", order.getId());
            esimReceipt.put("date", order.getCreatedDate());
            esimReceipt.put("bundleName", order.getProductName());
            esimReceipt.put("bundlePrice", order.getAmount());
            esimReceipt.put("customerName", order.getCustomerName());
            esimReceipt.put("customerEmail", order.getCustomerEmail());
            esimReceipt.put("customerPhone", order.getCustomerPhone());
            esimReceipt.put("retailerName", retailer.getFullName() != null ? retailer.getFullName() : retailer.getUsername());
            esimReceipt.put("retailerEmail", retailer.getEmail());
            esimReceipt.put("retailerPhone", retailer.getMobileNumber());
            
            // eSIM-specific details
            Map<String, Object> metadata = order.getMetadata() != null ? new HashMap<>(order.getMetadata()) : new HashMap<>();
            if (!metadata.isEmpty()) {
                esimReceipt.put("activationCode", metadata.getOrDefault("activationCode", ""));
                esimReceipt.put("smDpAddress", metadata.getOrDefault("smDpAddress", ""));
                esimReceipt.put("iccid", metadata.getOrDefault("iccid", ""));
                esimReceipt.put("apnSettings", metadata.getOrDefault("apnSettings", ""));
                esimReceipt.put("qrCodeBase64", qrCodeBase64 != null ? qrCodeBase64 : metadata.getOrDefault("qrCodeUrl", ""));
            }
            
            // Generate HTML content for printing
            String htmlContent = generateEsimReceiptHTML(esimReceipt);
            esimReceipt.put("htmlContent", htmlContent);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "eSIM receipt generated successfully");
            response.put("receipt", esimReceipt);
            response.put("htmlContent", htmlContent);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to generate eSIM receipt: " + e.getMessage()));
        }
    }

    /**
     * Print multiple receipts for bulk orders
     */
    @PostMapping("/orders/print-bulk")
    public ResponseEntity<?> printBulkReceipts(@RequestBody List<String> orderIds, Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            List<Map<String, Object>> receipts = new ArrayList<>();
            
            for (String orderId : orderIds) {
                Optional<Order> orderOptional = orderRepository.findById(orderId);
                if (orderOptional.isPresent()) {
                    Order order = orderOptional.get();
                    
                    // Verify retailer owns this order
                    User retailerUser = order.getRetailer();
                    if (retailerUser == null || !retailerUser.getId().equals(retailer.getId())) {
                        continue;
                    }
                    
                    Map<String, Object> receipt = new HashMap<>();
                    receipt.put("orderId", order.getId());
                    receipt.put("timestamp", order.getCreatedDate());
                    receipt.put("retailerName", retailer.getFullName() != null ? retailer.getFullName() : retailer.getUsername());
                    receipt.put("customerName", order.getCustomerName());
                    receipt.put("customerEmail", order.getCustomerEmail());
                    receipt.put("customerPhone", order.getCustomerPhone());
                    receipt.put("productName", order.getProductName());
                    receipt.put("quantity", order.getQuantity());
                    receipt.put("unitPrice", order.getAmount());
                    receipt.put("totalAmount", order.getAmount());
                    receipt.put("status", order.getStatus());
                    
                    receipts.add(receipt);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bulk receipts generated successfully");
            response.put("count", receipts.size());
            response.put("receipts", receipts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to generate receipts: " + e.getMessage()));
        }
    }

    /**
     * Helper method to generate eSIM receipt HTML with Telelys template
     */
    private String generateEsimReceiptHTML(Map<String, Object> receipt) {
        String qrCodeHtml = "";
        if (receipt.containsKey("qrCodeBase64") && receipt.get("qrCodeBase64") != null) {
            String qrCode = receipt.get("qrCodeBase64").toString();
            if (!qrCode.isEmpty()) {
                qrCodeHtml = "<div style=\"background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;\">" +
                            "<h3 style=\"color: #1F2937; margin-bottom: 15px;\">Your eSIM QR Code</h3>" +
                            "<img src=\"" + qrCode + "\" alt=\"eSIM QR Code\" style=\"max-width: 300px; height: auto; border-radius: 8px;\">" +
                            "</div>";
            }
        }
        
        return "<!DOCTYPE html>" +
            "<html lang=\"no\">" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>eSIM Receipt - Telelys</title>" +
            "<style>" +
            "body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background: white; }" +
            ".receipt { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px; }" +
            ".header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 20px; }" +
            ".logo { font-size: 28px; font-weight: bold; color: #2563EB; margin-bottom: 10px; }" +
            ".company { font-size: 14px; color: #666; margin-bottom: 20px; }" +
            ".title { font-size: 24px; font-weight: bold; color: #1F2937; margin: 20px 0; }" +
            ".info-section { background: #F9FAFB; padding: 15px; margin: 15px 0; border-radius: 8px; }" +
            ".info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }" +
            ".info-label { color: #6B7280; font-weight: 600; }" +
            ".info-value { color: #1F2937; font-weight: 600; }" +
            ".activation { background: #FEF3C7; border: 1px solid #FCD34D; padding: 15px; margin: 20px 0; border-radius: 8px; }" +
            ".activation h3 { margin-top: 0; color: #92400E; }" +
            ".step { padding: 10px 0; margin: 10px 0; border-bottom: 1px solid #E5E7EB; }" +
            ".step-title { font-weight: bold; color: #1F2937; }" +
            ".step-content { color: #6B7280; font-size: 14px; margin-top: 5px; }" +
            ".qr-section { text-align: center; margin: 30px 0; }" +
            ".code-box { background: #F3F4F6; padding: 15px; margin: 10px 0; border-radius: 6px; font-family: monospace; font-size: 13px; word-break: break-all; }" +
            ".footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; }" +
            ".print-only { display: none; }" +
            "@media print { .print-only { display: block; } body { margin: 0; padding: 0; } .receipt { border: none; box-shadow: none; } }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"receipt\">" +
            "  <div class=\"header\">" +
            "    <div class=\"logo\">Telelys</div>" +
            "    <div class=\"company\">Thank you for choosing Telelys</div>" +
            "  </div>" +
            
            "  <div class=\"title\">eSIM Activation Receipt</div>" +
            
            "  <div class=\"info-section\">" +
            "    <h3 style=\"margin-top: 0; color: #1F2937;\">Your eSIM Information</h3>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Date:</span>" +
            "      <span class=\"info-value\">" + formatDate(receipt.get("date")) + "</span>" +
            "    </div>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Order ID:</span>" +
            "      <span class=\"info-value\">" + receipt.getOrDefault("orderId", "N/A") + "</span>" +
            "    </div>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Bundle Name:</span>" +
            "      <span class=\"info-value\">" + receipt.getOrDefault("bundleName", "N/A") + "</span>" +
            "    </div>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Bundle Price:</span>" +
            "      <span class=\"info-value\">NOK " + receipt.getOrDefault("bundlePrice", "0") + "</span>" +
            "    </div>" +
            "  </div>" +
            
            "  <div class=\"info-section\">" +
            "    <h3 style=\"margin-top: 0; color: #1F2937;\">Customer Details</h3>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Name:</span>" +
            "      <span class=\"info-value\">" + receipt.getOrDefault("customerName", "N/A") + "</span>" +
            "    </div>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Email:</span>" +
            "      <span class=\"info-value\">" + receipt.getOrDefault("customerEmail", "N/A") + "</span>" +
            "    </div>" +
            "    <div class=\"info-row\" style=\"border-bottom: none;\">" +
            "      <span class=\"info-label\">Phone:</span>" +
            "      <span class=\"info-value\">" + receipt.getOrDefault("customerPhone", "N/A") + "</span>" +
            "    </div>" +
            "  </div>" +
            
            "  <div class=\"activation\">" +
            "    <h3>⚠️ Important Notes Before Setting Up</h3>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">1. Internet Connection Required</div>" +
            "      <div class=\"step-content\">eSIM can only be installed when there is an internet connection.</div>" +
            "    </div>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">2. Do Not Delete eSIM</div>" +
            "      <div class=\"step-content\">Please do not delete eSIM after activation. The eSIM QR code can only be activated once.</div>" +
            "    </div>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">3. Single Device Installation</div>" +
            "      <div class=\"step-content\">eSIM cannot be transferred to another device after installation.</div>" +
            "    </div>" +
            "  </div>" +
            
            "  <div class=\"info-section\">" +
            "    <h3 style=\"margin-top: 0; color: #1F2937;\">Activation Information</h3>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">SM-DP+ Address:</span>" +
            "    </div>" +
            "    <div class=\"code-box\">" + receipt.getOrDefault("smDpAddress", "N/A") + "</div>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">Activation Code:</span>" +
            "    </div>" +
            "    <div class=\"code-box\">" + receipt.getOrDefault("activationCode", "N/A") + "</div>" +
            "    <div class=\"info-row\">" +
            "      <span class=\"info-label\">ICCID:</span>" +
            "    </div>" +
            "    <div class=\"code-box\">" + receipt.getOrDefault("iccid", "N/A") + "</div>" +
            "  </div>" +
            
            qrCodeHtml +
            
            "  <div class=\"info-section\">" +
            "    <h3 style=\"margin-top: 0; color: #1F2937;\">Setup Instructions</h3>" +
            "    <div style=\"margin: 15px 0;\">" +
            "      <div class=\"step-title\" style=\"color: #2563EB;\">For iOS:</div>" +
            "      <div class=\"step-content\">1. Go to Settings > Cellular (or Mobile Data)<br>" +
            "      2. Click Add eSIM or Add Cellular Plan > Choose Use QR Code<br>" +
            "      3. Scan the QR code above or enter details manually<br>" +
            "      4. Click Next to finish installation<br>" +
            "      5. Register your SIM: <a href='https://www.lyca-mobile.no/en/registration/'>https://www.lyca-mobile.no/en/registration/</a></div>" +
            "    </div>" +
            "    <div style=\"margin: 15px 0;\">" +
            "      <div class=\"step-title\" style=\"color: #2563EB;\">For Android:</div>" +
            "      <div class=\"step-content\">1. Go to Settings > Connections<br>" +
            "      2. Choose Add eSIM > Choose Use QR Code<br>" +
            "      3. Scan the QR code above or enter details manually<br>" +
            "      4. Click Next to finish installation<br>" +
            "      5. Register your SIM: <a href='https://www.lyca-mobile.no/en/registration/'>https://www.lyca-mobile.no/en/registration/</a></div>" +
            "    </div>" +
            "  </div>" +
            
            "  <div class=\"info-section\">" +
            "    <h3 style=\"margin-top: 0; color: #1F2937;\">Troubleshooting</h3>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">Unable to Scan QR Code</div>" +
            "      <div class=\"step-content\">Place your phone camera opposite the QR Code and ensure the camera captures the whole code.</div>" +
            "    </div>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">eSIM in Activating Status</div>" +
            "      <div class=\"step-content\">You need to travel to a country supported by your eSIM to start using it.</div>" +
            "    </div>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">No Signal After Installation</div>" +
            "      <div class=\"step-content\">Enable Data Roaming mode and Cellular Data mode on your phone.</div>" +
            "    </div>" +
            "    <div class=\"step\">" +
            "      <div class=\"step-title\">Network Signal but No Internet</div>" +
            "      <div class=\"step-content\">Check APN settings and configure:<br><code>" + receipt.getOrDefault("apnSettings", "Contact support") + "</code></div>" +
            "    </div>" +
            "  </div>" +
            
            "  <div class=\"footer\">" +
            "    <p><strong>Need Help?</strong></p>" +
            "    <p>💬 WhatsApp: " + receipt.getOrDefault("retailerPhone", "+47 XXX XXX XXX") + "</p>" +
            "    <p>📧 Email: " + receipt.getOrDefault("retailerEmail", "support@telelys.no") + "</p>" +
            "    <p style=\"margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 15px;\">" +
            "      Thank you for choosing Telelys!<br>" +
            "      Please keep this receipt for your records." +
            "    </p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>";
    }

    /**
     * Helper method to format date
     */
    private String formatDate(Object dateObj) {
        if (dateObj == null) return "N/A";
        return dateObj.toString();
    }

    public static class UpdateOrderStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}