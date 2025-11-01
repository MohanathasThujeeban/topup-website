package com.example.topup.demo.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class UpdateCreditLimitRequest {
    
    @NotBlank(message = "Retailer ID is required")
    private String retailerId;
    
    @NotNull(message = "Credit limit is required")
    @DecimalMin(value = "0.0", message = "Credit limit must be non-negative")
    private BigDecimal creditLimit;
    
    @Min(value = 1, message = "Payment terms must be at least 1 day")
    @Max(value = 365, message = "Payment terms cannot exceed 365 days")
    private Integer paymentTermsDays;
    
    private String notes;
    
    // Constructors
    public UpdateCreditLimitRequest() {}
    
    public UpdateCreditLimitRequest(String retailerId, BigDecimal creditLimit, Integer paymentTermsDays, String notes) {
        this.retailerId = retailerId;
        this.creditLimit = creditLimit;
        this.paymentTermsDays = paymentTermsDays;
        this.notes = notes;
    }
    
    // Getters and Setters
    public String getRetailerId() {
        return retailerId;
    }
    
    public void setRetailerId(String retailerId) {
        this.retailerId = retailerId;
    }
    
    public BigDecimal getCreditLimit() {
        return creditLimit;
    }
    
    public void setCreditLimit(BigDecimal creditLimit) {
        this.creditLimit = creditLimit;
    }
    
    public Integer getPaymentTermsDays() {
        return paymentTermsDays;
    }
    
    public void setPaymentTermsDays(Integer paymentTermsDays) {
        this.paymentTermsDays = paymentTermsDays;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
