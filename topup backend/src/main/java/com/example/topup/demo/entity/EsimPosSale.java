package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity for storing eSIM Point of Sales transactions
 * Collection: esim_pos_sales
 */
@Document(collection = "esim_pos_sales")
public class EsimPosSale {

    @Id
    private String id;

    // Retailer who made the sale
    @DBRef
    private User retailer;

    @Indexed
    private String retailerId;

    private String retailerEmail;

    private String retailerName;

    // Customer information
    @Indexed
    private String customerEmail;

    private String customerName;

    private String customerPhone;

    // eSIM product details
    @Indexed
    private String iccid;

    private String productName;

    private String productId;

    private String bundleName;

    private String bundleId;

    private String operator;

    private String country;

    // Pool information
    private String stockPoolId;

    private String stockPoolName;

    // Pricing
    private BigDecimal salePrice;

    private BigDecimal costPrice;

    private BigDecimal margin;

    private BigDecimal marginRate;

    private String currency;

    // Order reference
    @Indexed
    private String orderId;

    private String orderReference;

    // Sale status
    @Indexed
    private SaleStatus status;

    private String qrCodeUrl;

    private boolean emailSent;

    private LocalDateTime emailSentAt;

    // Timestamps
    @Indexed
    private LocalDateTime saleDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Additional metadata
    private String notes;

    private String createdBy;

    // eSIM activation details
    private String activationCode;

    private String smdpAddress;

    private String matchingId;

    public enum SaleStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REFUNDED,
        CANCELLED
    }

    // Default constructor
    public EsimPosSale() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.saleDate = LocalDateTime.now();
        this.status = SaleStatus.COMPLETED;
        this.emailSent = false;
        this.currency = "NOK";
    }

    // Constructor with retailer and customer
    public EsimPosSale(User retailer, String customerEmail) {
        this();
        this.retailer = retailer;
        this.retailerId = retailer.getId();
        this.retailerEmail = retailer.getEmail();
        this.retailerName = retailer.getFirstName() + " " + retailer.getLastName();
        this.customerEmail = customerEmail;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getRetailer() {
        return retailer;
    }

    public void setRetailer(User retailer) {
        this.retailer = retailer;
        if (retailer != null) {
            this.retailerId = retailer.getId();
            this.retailerEmail = retailer.getEmail();
            this.retailerName = retailer.getFirstName() + " " + retailer.getLastName();
        }
    }

    public String getRetailerId() {
        return retailerId;
    }

    public void setRetailerId(String retailerId) {
        this.retailerId = retailerId;
    }

    public String getRetailerEmail() {
        return retailerEmail;
    }

    public void setRetailerEmail(String retailerEmail) {
        this.retailerEmail = retailerEmail;
    }

    public String getRetailerName() {
        return retailerName;
    }

    public void setRetailerName(String retailerName) {
        this.retailerName = retailerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getIccid() {
        return iccid;
    }

    public void setIccid(String iccid) {
        this.iccid = iccid;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getBundleName() {
        return bundleName;
    }

    public void setBundleName(String bundleName) {
        this.bundleName = bundleName;
    }

    public String getBundleId() {
        return bundleId;
    }

    public void setBundleId(String bundleId) {
        this.bundleId = bundleId;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getStockPoolId() {
        return stockPoolId;
    }

    public void setStockPoolId(String stockPoolId) {
        this.stockPoolId = stockPoolId;
    }

    public String getStockPoolName() {
        return stockPoolName;
    }

    public void setStockPoolName(String stockPoolName) {
        this.stockPoolName = stockPoolName;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getMargin() {
        return margin;
    }

    public void setMargin(BigDecimal margin) {
        this.margin = margin;
    }

    public BigDecimal getMarginRate() {
        return marginRate;
    }

    public void setMarginRate(BigDecimal marginRate) {
        this.marginRate = marginRate;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderReference() {
        return orderReference;
    }

    public void setOrderReference(String orderReference) {
        this.orderReference = orderReference;
    }

    public SaleStatus getStatus() {
        return status;
    }

    public void setStatus(SaleStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public boolean isEmailSent() {
        return emailSent;
    }

    public void setEmailSent(boolean emailSent) {
        this.emailSent = emailSent;
        if (emailSent) {
            this.emailSentAt = LocalDateTime.now();
        }
    }

    public LocalDateTime getEmailSentAt() {
        return emailSentAt;
    }

    public void setEmailSentAt(LocalDateTime emailSentAt) {
        this.emailSentAt = emailSentAt;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }

    public String getSmdpAddress() {
        return smdpAddress;
    }

    public void setSmdpAddress(String smdpAddress) {
        this.smdpAddress = smdpAddress;
    }

    public String getMatchingId() {
        return matchingId;
    }

    public void setMatchingId(String matchingId) {
        this.matchingId = matchingId;
    }

    // Mark email as sent
    public void markEmailSent() {
        this.emailSent = true;
        this.emailSentAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Mark sale as refunded
    public void markRefunded(String reason) {
        this.status = SaleStatus.REFUNDED;
        this.notes = (this.notes != null ? this.notes + " | " : "") + "Refunded: " + reason;
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "EsimPosSale{" +
                "id='" + id + '\'' +
                ", retailerEmail='" + retailerEmail + '\'' +
                ", customerEmail='" + customerEmail + '\'' +
                ", iccid='" + iccid + '\'' +
                ", productName='" + productName + '\'' +
                ", salePrice=" + salePrice +
                ", status=" + status +
                ", saleDate=" + saleDate +
                '}';
    }
}
