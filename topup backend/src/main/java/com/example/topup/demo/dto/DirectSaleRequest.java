package com.example.topup.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class DirectSaleRequest {
    
    @NotBlank(message = "Bundle ID is required")
    private String bundleId;
    
    @NotBlank(message = "Bundle name is required")
    private String bundleName;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    @Min(value = 0, message = "Unit price must be non-negative")
    private Double unitPrice;
    
    @NotNull(message = "Total amount is required")
    @Min(value = 0, message = "Total amount must be non-negative")
    private Double totalAmount;
    
    // Customer information is optional for direct sales
    private String customerName;
    
    private String customerPhone;
    
    private String customerEmail;
    
    @NotBlank(message = "Sale type is required")
    private String saleType;
    
    // Constructors
    public DirectSaleRequest() {}
    
    // Getters and Setters
    public String getBundleId() {
        return bundleId;
    }
    
    public void setBundleId(String bundleId) {
        this.bundleId = bundleId;
    }
    
    public String getBundleName() {
        return bundleName;
    }
    
    public void setBundleName(String bundleName) {
        this.bundleName = bundleName;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public Double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
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
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public String getSaleType() {
        return saleType;
    }
    
    public void setSaleType(String saleType) {
        this.saleType = saleType;
    }
}