package com.example.topup.demo.controller;

import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerOrder.OrderItem;
import com.example.topup.demo.entity.RetailerOrder.OrderStatus;
import com.example.topup.demo.entity.RetailerOrder.PaymentStatus;
import com.example.topup.demo.service.RetailerOrderService;
import com.example.topup.demo.service.RetailerOrderService.PaymentDetails;
import com.example.topup.demo.service.RetailerOrderService.PaymentResult;
import com.example.topup.demo.service.RetailerOrderService.OrderStatistics;
import com.example.topup.demo.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/retailer/order-management")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://topup.neirahtech", "https://topup-website-gmoj.vercel.app"}, allowCredentials = "true")
public class RetailerOrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(RetailerOrderController.class);
    
    @Autowired
    private RetailerOrderService orderService;
    
    @Autowired
    private AdminService adminService;
    
    // Create new order
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        logger.info("Creating order for retailer: {}", request.getRetailerId());
        
        try {
            RetailerOrder order = orderService.createOrder(request.getRetailerId(), request.getItems());
            logger.info("Order created successfully: {}", order.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Order created successfully",
                "data", order
            ));
        } catch (Exception e) {
            logger.error("Error creating order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Failed to create order: " + e.getMessage()
            ));
        }
    }
    
    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable String orderId) {
        logger.info("Retrieving order: {}", orderId);
        
        try {
            Optional<RetailerOrder> order = orderService.getOrderById(orderId);
            
            if (order.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", order.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Order not found"
                ));
            }
        } catch (Exception e) {
            logger.error("Error retrieving order {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve order: " + e.getMessage()
            ));
        }
    }
    
    // Get order by order number
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber) {
        logger.info("Retrieving order by number: {}", orderNumber);
        
        try {
            Optional<RetailerOrder> order = orderService.getOrderByOrderNumber(orderNumber);
            
            if (order.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", order.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Order not found"
                ));
            }
        } catch (Exception e) {
            logger.error("Error retrieving order by number {}: {}", orderNumber, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve order: " + e.getMessage()
            ));
        }
    }
    
    // Get orders by retailer
    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<?> getOrdersByRetailer(
            @PathVariable String retailerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        logger.info("Retrieving orders for retailer: {} (page: {}, size: {})", retailerId, page, size);
        
        try {
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RetailerOrder> orders = orderService.getOrdersByRetailer(retailerId, pageable);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders.getContent(),
                "pagination", Map.of(
                    "page", orders.getNumber(),
                    "size", orders.getSize(),
                    "totalElements", orders.getTotalElements(),
                    "totalPages", orders.getTotalPages(),
                    "hasNext", orders.hasNext(),
                    "hasPrevious", orders.hasPrevious()
                )
            ));
        } catch (Exception e) {
            logger.error("Error retrieving orders for retailer {}: {}", retailerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve orders: " + e.getMessage()
            ));
        }
    }
    
    // Get all orders (admin use)
    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        
        logger.info("Retrieving all orders (page: {}, size: {}, status: {})", page, size, status);
        
        try {
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RetailerOrder> orders;
            
            if (status != null && !status.isEmpty()) {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orders = orderService.getOrdersByStatus(orderStatus, pageable);
            } else {
                orders = orderService.getAllOrders(pageable);
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders.getContent(),
                "pagination", Map.of(
                    "page", orders.getNumber(),
                    "size", orders.getSize(),
                    "totalElements", orders.getTotalElements(),
                    "totalPages", orders.getTotalPages(),
                    "hasNext", orders.hasNext(),
                    "hasPrevious", orders.hasPrevious()
                )
            ));
        } catch (Exception e) {
            logger.error("Error retrieving orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve orders: " + e.getMessage()
            ));
        }
    }
    
    // Update order status
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        
        logger.info("Updating status for order: {}", orderId);
        
        try {
            String statusStr = request.get("status");
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", "Status is required"
                ));
            }
            
            OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
            RetailerOrder updatedOrder = orderService.updateOrderStatus(orderId, status);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order status updated successfully",
                "data", updatedOrder
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Invalid status value"
            ));
        } catch (Exception e) {
            logger.error("Error updating order status {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to update order status: " + e.getMessage()
            ));
        }
    }
    
    // Process payment
    @PostMapping("/{orderId}/payment")
    public ResponseEntity<?> processPayment(
            @PathVariable String orderId,
            @Valid @RequestBody PaymentRequest request) {
        
        logger.info("Processing payment for order: {}", orderId);
        
        try {
            PaymentResult result = orderService.processPayment(
                orderId,
                request.getPaymentMethod(),
                request.getPaymentDetails()
            );
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", result.getMessage(),
                    "transactionId", result.getTransactionId()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", result.getMessage()
                ));
            }
        } catch (Exception e) {
            logger.error("Error processing payment for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Payment processing failed: " + e.getMessage()
            ));
        }
    }
    
    // Cancel order
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        
        logger.info("Cancelling order: {}", orderId);
        
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Cancelled by retailer";
            }
            
            RetailerOrder cancelledOrder = orderService.cancelOrder(orderId, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order cancelled successfully",
                "data", cancelledOrder
            ));
        } catch (Exception e) {
            logger.error("Error cancelling order {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Failed to cancel order: " + e.getMessage()
            ));
        }
    }
    
    // Create order item (for cart functionality)
    @PostMapping("/items/create")
    public ResponseEntity<?> createOrderItem(@Valid @RequestBody CreateOrderItemRequest request) {
        logger.info("Creating order item for product: {}", request.getProductId());
        
        try {
            OrderItem item = orderService.createOrderItem(request.getProductId(), request.getQuantity());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", item
            ));
        } catch (Exception e) {
            logger.error("Error creating order item: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Failed to create order item: " + e.getMessage()
            ));
        }
    }
    
    // Get order statistics
    @GetMapping("/retailer/{retailerId}/statistics")
    public ResponseEntity<?> getOrderStatistics(@PathVariable String retailerId) {
        logger.info("Retrieving order statistics for retailer: {}", retailerId);
        
        try {
            OrderStatistics stats = orderService.getOrderStatistics(retailerId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            logger.error("Error retrieving order statistics for retailer {}: {}", retailerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve statistics: " + e.getMessage()
            ));
        }
    }
    
    // ==================== MOCK DATA ENDPOINTS ====================
    
    /**
     * Generate mock retailer orders for testing
     * POST /api/retailer/order-management/mock/generate
     */
    @PostMapping("/mock/generate")
    public ResponseEntity<?> generateMockOrders(
            @RequestParam String retailerId,
            @RequestParam(defaultValue = "10") int count) {
        logger.info("Generating {} mock orders for retailer: {}", count, retailerId);
        
        try {
            List<RetailerOrder> mockOrders = adminService.generateMockRetailerOrders(retailerId, count);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", count + " mock orders generated successfully",
                "count", mockOrders.size(),
                "data", mockOrders
            ));
        } catch (Exception e) {
            logger.error("Error generating mock orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to generate mock orders: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Clear all mock retailer orders
     * DELETE /api/retailer/order-management/mock/clear
     */
    @DeleteMapping("/mock/clear")
    public ResponseEntity<?> clearMockOrders() {
        logger.info("Clearing all mock orders");
        
        try {
            adminService.clearMockRetailerOrders();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All mock orders cleared successfully"
            ));
        } catch (Exception e) {
            logger.error("Error clearing mock orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to clear mock orders: " + e.getMessage()
            ));
        }
    }
    
    // Request DTOs
    public static class CreateOrderRequest {
        private String retailerId;
        private List<OrderItem> items;
        
        // Constructors
        public CreateOrderRequest() {}
        
        // Getters and Setters
        public String getRetailerId() { return retailerId; }
        public void setRetailerId(String retailerId) { this.retailerId = retailerId; }
        
        public List<OrderItem> getItems() { return items; }
        public void setItems(List<OrderItem> items) { this.items = items; }
    }
    
    public static class CreateOrderItemRequest {
        private String productId;
        private Integer quantity;
        
        // Constructors
        public CreateOrderItemRequest() {}
        
        // Getters and Setters
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class PaymentRequest {
        private String paymentMethod;
        private PaymentDetails paymentDetails;
        
        // Constructors
        public PaymentRequest() {}
        
        // Getters and Setters
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public PaymentDetails getPaymentDetails() { return paymentDetails; }
        public void setPaymentDetails(PaymentDetails paymentDetails) { this.paymentDetails = paymentDetails; }
    }
}