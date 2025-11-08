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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/retailer")
@PreAuthorize("hasRole('BUSINESS')")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:5173", "https://topup.neirahtech"})
public class RetailerController {

    @Autowired
    private RetailerService retailerService;
    
    @Autowired
    private BundleService bundleService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RetailerOrderRepository retailerOrderRepository;

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
        String email = authentication.getName();
        return userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
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

    public static class UpdateOrderStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}