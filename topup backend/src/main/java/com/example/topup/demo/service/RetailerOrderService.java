package com.example.topup.demo.service;

import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerOrder.OrderItem;
import com.example.topup.demo.entity.RetailerOrder.OrderStatus;
import com.example.topup.demo.entity.RetailerOrder.PaymentStatus;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RetailerOrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(RetailerOrderService.class);
    
    @Autowired
    private RetailerOrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // Create new order
    public RetailerOrder createOrder(String retailerId, List<OrderItem> items) {
        logger.info("Creating new order for retailer: {}", retailerId);
        
        try {
            // Validate items and calculate pricing
            List<OrderItem> validatedItems = validateAndPrepareOrderItems(items);
            
            // Create order
            RetailerOrder order = new RetailerOrder();
            order.setRetailerId(retailerId);
            order.setOrderNumber(generateUniqueOrderNumber());
            order.setItems(validatedItems);
            order.calculateTotalAmount();
            order.setStatus(OrderStatus.PENDING);
            order.setPaymentStatus(PaymentStatus.PENDING);
            order.setCreatedDate(LocalDateTime.now());
            order.setCreatedBy(retailerId);
            
            RetailerOrder savedOrder = orderRepository.save(order);
            logger.info("Order created successfully with ID: {}", savedOrder.getId());
            
            return savedOrder;
        } catch (Exception e) {
            logger.error("Error creating order for retailer {}: {}", retailerId, e.getMessage());
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }
    
    // Add item to cart (before order creation)
    public OrderItem createOrderItem(String productId, Integer quantity) {
        logger.info("Creating order item for product: {} with quantity: {}", productId, quantity);
        
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found: " + productId);
        }
        
        Product product = productOpt.get();
        
        OrderItem item = new OrderItem();
        item.setProductId(productId);
        item.setProductName(product.getName());
        item.setProductType(product.getProductType().toString());
        item.setCategory(product.getCategory().toString());
        item.setQuantity(quantity);
        item.setUnitPrice(calculateWholesalePrice(product.getBasePrice()));
        item.setRetailPrice(product.getBasePrice());
        item.setDataAmount(product.getDataAmount());
        item.setValidity(product.getValidity());
        
        return item;
    }
    
    // Validate and prepare order items
    private List<OrderItem> validateAndPrepareOrderItems(List<OrderItem> items) {
        return items.stream().map(item -> {
            // Verify product exists
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isEmpty()) {
                throw new RuntimeException("Product not found: " + item.getProductId());
            }
            
            Product product = productOpt.get();
            
            // Update item with current product data
            item.setProductName(product.getName());
            item.setProductType(product.getProductType().toString());
            item.setCategory(product.getCategory().toString());
            item.setUnitPrice(calculateWholesalePrice(product.getBasePrice()));
            item.setRetailPrice(product.getBasePrice());
            item.setDataAmount(product.getDataAmount());
            item.setValidity(product.getValidity());
            
            // Validate quantity
            if (item.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for product: " + item.getProductName());
            }
            
            return item;
        }).collect(Collectors.toList());
    }
    
    // Generate unique order number
    private String generateUniqueOrderNumber() {
        String orderNumber;
        do {
            orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (orderRepository.existsByOrderNumber(orderNumber));
        
        return orderNumber;
    }
    
    // Update order status
    public RetailerOrder updateOrderStatus(String orderId, OrderStatus status) {
        logger.info("Updating order {} status to: {}", orderId, status);
        
        Optional<RetailerOrder> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        
        RetailerOrder order = orderOpt.get();
        order.setStatus(status);
        order.setLastModifiedDate(LocalDateTime.now());
        
        // Set delivery date if delivered
        if (status == OrderStatus.DELIVERED) {
            order.setDeliveredDate(LocalDateTime.now());
        }
        
        return orderRepository.save(order);
    }
    
    // Update payment status
    public RetailerOrder updatePaymentStatus(String orderId, PaymentStatus paymentStatus, String transactionId) {
        logger.info("Updating order {} payment status to: {}", orderId, paymentStatus);
        
        Optional<RetailerOrder> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        
        RetailerOrder order = orderOpt.get();
        order.setPaymentStatus(paymentStatus);
        order.setPaymentTransactionId(transactionId);
        order.setLastModifiedDate(LocalDateTime.now());
        
        // Update order status based on payment
        if (paymentStatus == PaymentStatus.COMPLETED) {
            order.setStatus(OrderStatus.CONFIRMED);
        } else if (paymentStatus == PaymentStatus.FAILED || paymentStatus == PaymentStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
        }
        
        return orderRepository.save(order);
    }
    
    // Process payment (simulation)
    public PaymentResult processPayment(String orderId, String paymentMethod, PaymentDetails paymentDetails) {
        logger.info("Processing payment for order: {} using method: {}", orderId, paymentMethod);
        
        Optional<RetailerOrder> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        
        RetailerOrder order = orderOpt.get();
        
        // Simulate payment processing
        try {
            // Update order with payment method
            order.setPaymentMethod(paymentMethod);
            order.setPaymentStatus(PaymentStatus.PROCESSING);
            orderRepository.save(order);
            
            // Simulate payment gateway call
            Thread.sleep(2000); // Simulate processing delay
            
            // For simulation, assume payment is successful
            String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Update order with successful payment
            updatePaymentStatus(orderId, PaymentStatus.COMPLETED, transactionId);
            
            PaymentResult result = new PaymentResult();
            result.setSuccess(true);
            result.setTransactionId(transactionId);
            result.setMessage("Payment processed successfully");
            
            return result;
            
        } catch (Exception e) {
            // Payment failed
            updatePaymentStatus(orderId, PaymentStatus.FAILED, null);
            
            PaymentResult result = new PaymentResult();
            result.setSuccess(false);
            result.setMessage("Payment processing failed: " + e.getMessage());
            
            return result;
        }
    }
    
    // Get order by ID
    public Optional<RetailerOrder> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }
    
    // Get order by order number
    public Optional<RetailerOrder> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    // Get orders by retailer
    public List<RetailerOrder> getOrdersByRetailer(String retailerId) {
        return orderRepository.findByRetailerIdOrderByCreatedDateDesc(retailerId);
    }
    
    // Get orders by retailer with pagination
    public Page<RetailerOrder> getOrdersByRetailer(String retailerId, Pageable pageable) {
        return orderRepository.findByRetailerId(retailerId, pageable);
    }
    
    // Get orders by status
    public Page<RetailerOrder> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }
    
    // Get all orders with pagination
    public Page<RetailerOrder> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    // Cancel order
    public RetailerOrder cancelOrder(String orderId, String reason) {
        logger.info("Cancelling order: {} with reason: {}", orderId, reason);
        
        Optional<RetailerOrder> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        
        RetailerOrder order = orderOpt.get();
        
        // Check if order can be cancelled
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setLastModifiedDate(LocalDateTime.now());
        
        // If payment was completed, set for refund
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        return orderRepository.save(order);
    }
    
    // Get order statistics for retailer
    public OrderStatistics getOrderStatistics(String retailerId) {
        OrderStatistics stats = new OrderStatistics();
        
        stats.setTotalOrders(orderRepository.countByRetailerId(retailerId));
        stats.setPendingOrders(orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.PENDING));
        stats.setConfirmedOrders(orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.CONFIRMED));
        stats.setDeliveredOrders(orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.CANCELLED));
        
        return stats;
    }
    
    // Inner classes for DTOs
    public static class PaymentDetails {
        private String cardNumber;
        private String cardHolderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        private String billingAddress;
        
        // Constructors
        public PaymentDetails() {}
        
        // Getters and Setters
        public String getCardNumber() { return cardNumber; }
        public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
        
        public String getCardHolderName() { return cardHolderName; }
        public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }
        
        public String getExpiryMonth() { return expiryMonth; }
        public void setExpiryMonth(String expiryMonth) { this.expiryMonth = expiryMonth; }
        
        public String getExpiryYear() { return expiryYear; }
        public void setExpiryYear(String expiryYear) { this.expiryYear = expiryYear; }
        
        public String getCvv() { return cvv; }
        public void setCvv(String cvv) { this.cvv = cvv; }
        
        public String getBillingAddress() { return billingAddress; }
        public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    }
    
    public static class PaymentResult {
        private boolean success;
        private String transactionId;
        private String message;
        private String errorCode;
        
        // Constructors
        public PaymentResult() {}
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getErrorCode() { return errorCode; }
        public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
    }
    
    // Helper method to calculate wholesale price (e.g., 20% discount from retail)
    private BigDecimal calculateWholesalePrice(BigDecimal retailPrice) {
        if (retailPrice == null) {
            return BigDecimal.ZERO;
        }
        // Apply 20% discount for wholesale pricing
        BigDecimal discount = new BigDecimal("0.20");
        return retailPrice.multiply(BigDecimal.ONE.subtract(discount))
                         .setScale(2, RoundingMode.HALF_UP);
    }
    
    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        
        // Constructors
        public OrderStatistics() {}
        
        // Getters and Setters
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        
        public long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
        
        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
        
        public long getDeliveredOrders() { return deliveredOrders; }
        public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
        
        public long getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }
    }
}