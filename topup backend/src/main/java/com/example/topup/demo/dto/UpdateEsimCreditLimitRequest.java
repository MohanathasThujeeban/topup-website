package com.example.topup.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdateEsimCreditLimitRequest {
    
    @NotBlank(message = "Retailer ID is required")
    private String retailerId;
    
    @NotNull(message = "eSIM credit limit is required")
    @DecimalMin(value = "0.0", message = "eSIM credit limit must be non-negative")
    private BigDecimal esimCreditLimit;
    
    private String notes;
    
    // Constructors
    public UpdateEsimCreditLimitRequest() {}
    
    public UpdateEsimCreditLimitRequest(String retailerId, BigDecimal esimCreditLimit, String notes) {
        this.retailerId = retailerId;
        this.esimCreditLimit = esimCreditLimit;
        this.notes = notes;
    }
    
    // Getters and Setters
    public String getRetailerId() {
        return retailerId;
    }
    
    public void setRetailerId(String retailerId) {
        this.retailerId = retailerId;
    }
    
    public BigDecimal getEsimCreditLimit() {
        return esimCreditLimit;
    }
    
    public void setEsimCreditLimit(BigDecimal esimCreditLimit) {
        this.esimCreditLimit = esimCreditLimit;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "UpdateEsimCreditLimitRequest{" +
                "retailerId='" + retailerId + '\'' +
                ", esimCreditLimit=" + esimCreditLimit +
                ", notes='" + notes + '\'' +
                '}';
    }
}
