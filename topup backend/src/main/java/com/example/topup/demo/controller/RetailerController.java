package com.example.topup.demo.controller;

import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.Order.OrderStatus;
import com.example.topup.demo.service.RetailerService;
import com.example.topup.demo.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/retailer")
@PreAuthorize("hasRole('BUSINESS')")
@CrossOrigin(origins = "http://localhost:5173")
public class RetailerController {

    @Autowired
    private RetailerService retailerService;
    
    @Autowired
    private UserService userService;

    // Get all orders for the authenticated retailer
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(Authentication authentication) {
        try {
            User retailer = getUserFromAuthentication(authentication);
            List<Order> orders = retailerService.getOrdersByRetailer(retailer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", orders);
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

    public static class UpdateOrderStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}