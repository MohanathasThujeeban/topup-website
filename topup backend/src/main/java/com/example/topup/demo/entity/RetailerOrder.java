package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "retailer_orders")
public class RetailerOrder {
    
    @Id
    private String id;
    
    @NotNull(message = "Retailer ID is required")
    @Indexed
    private String retailerId;
    
    @NotNull(message = "Order number is required")
    @Indexed(unique = true)
    private String orderNumber;
    
    @NotNull(message = "Order items are required")
    private List<OrderItem> items = new ArrayList<>();
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", message = "Total amount must be positive")
    private BigDecimal totalAmount;
    
    @NotNull(message = "Currency is required")
    private String currency = "NOK";
    
    @NotNull(message = "Order status is required")
    @Indexed
    private OrderStatus status = OrderStatus.PENDING;
    
    @Indexed
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    private String paymentMethod;
    private String paymentTransactionId;
    
    // Billing Information
    private BillingInfo billingInfo;
    
    // Shipping Information (if physical products)
    private ShippingInfo shippingInfo;
    
    // Order Processing
    private String notes;
    private String cancellationReason;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime deliveredDate;
    
    @CreatedDate
    private LocalDateTime createdDate;
    
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
    
    private String createdBy;
    private String processedBy;
    
    // Constructors
    public RetailerOrder() {}
    
    public RetailerOrder(String retailerId, List<OrderItem> items) {
        this.retailerId = retailerId;
        this.items = items;
        this.orderNumber = generateOrderNumber();
        calculateTotalAmount();
    }
    
    // Helper Methods
    public void calculateTotalAmount() {
        this.totalAmount = items.stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }
    
    public void addItem(OrderItem item) {
        this.items.add(item);
        calculateTotalAmount();
    }
    
    public void removeItem(String productId) {
        this.items.removeIf(item -> item.getProductId().equals(productId));
        calculateTotalAmount();
    }
    
    public int getTotalItems() {
        return items.stream().mapToInt(OrderItem::getQuantity).sum();
    }
    
    // Inner Classes
    public static class OrderItem {
        @NotNull(message = "Product ID is required")
        private String productId;
        
        @NotNull(message = "Product name is required")
        private String productName;
        
        private String productType;
        private String category;
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
        
        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.0", message = "Unit price must be positive")
        private BigDecimal unitPrice; // Wholesale price
        
        private BigDecimal retailPrice; // Original retail price
        
        // Product specifications
        private String dataAmount;
        private String validity;
        
        // Constructors
        public OrderItem() {}
        
        public OrderItem(String productId, String productName, Integer quantity, BigDecimal unitPrice) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }
        
        // Getters and Setters
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public String getProductType() { return productType; }
        public void setProductType(String productType) { this.productType = productType; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        
        public BigDecimal getRetailPrice() { return retailPrice; }
        public void setRetailPrice(BigDecimal retailPrice) { this.retailPrice = retailPrice; }
        
        public String getDataAmount() { return dataAmount; }
        public void setDataAmount(String dataAmount) { this.dataAmount = dataAmount; }
        
        public String getValidity() { return validity; }
        public void setValidity(String validity) { this.validity = validity; }
        
        public BigDecimal getTotalPrice() {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    public static class BillingInfo {
        private String companyName;
        private String contactName;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String postalCode;
        private String country = "Norway";
        private String vatNumber;
        
        // Constructors
        public BillingInfo() {}
        
        // Getters and Setters
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        
        public String getContactName() { return contactName; }
        public void setContactName(String contactName) { this.contactName = contactName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        
        public String getVatNumber() { return vatNumber; }
        public void setVatNumber(String vatNumber) { this.vatNumber = vatNumber; }
    }
    
    public static class ShippingInfo {
        private String contactName;
        private String phone;
        private String address;
        private String city;
        private String postalCode;
        private String country = "Norway";
        private String instructions;
        
        // Constructors
        public ShippingInfo() {}
        
        // Getters and Setters
        public String getContactName() { return contactName; }
        public void setContactName(String contactName) { this.contactName = contactName; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
    }
    
    // Enums
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        COMPLETED,
        DELIVERED,
        CANCELLED,
        REFUNDED
    }
    
    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        REFUNDED,
        CANCELLED
    }
    
    // Main Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getRetailerId() { return retailerId; }
    public void setRetailerId(String retailerId) { this.retailerId = retailerId; }
    
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { 
        this.items = items;
        calculateTotalAmount();
    }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentTransactionId() { return paymentTransactionId; }
    public void setPaymentTransactionId(String paymentTransactionId) { this.paymentTransactionId = paymentTransactionId; }
    
    public BillingInfo getBillingInfo() { return billingInfo; }
    public void setBillingInfo(BillingInfo billingInfo) { this.billingInfo = billingInfo; }
    
    public ShippingInfo getShippingInfo() { return shippingInfo; }
    public void setShippingInfo(ShippingInfo shippingInfo) { this.shippingInfo = shippingInfo; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    
    public LocalDateTime getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    
    public LocalDateTime getDeliveredDate() { return deliveredDate; }
    public void setDeliveredDate(LocalDateTime deliveredDate) { this.deliveredDate = deliveredDate; }
    
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    
    public LocalDateTime getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDateTime lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
}