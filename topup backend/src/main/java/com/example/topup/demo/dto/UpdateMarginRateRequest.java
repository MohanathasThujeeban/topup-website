package com.example.topup.demo.dto;

import jakarta.validation.constraints.*;

public class UpdateMarginRateRequest {
    
    @NotBlank(message = "Retailer email is required")
    @Email(message = "Valid email address is required")
    private String retailerEmail;
    
    @NotNull(message = "Margin rate is required")
    @DecimalMin(value = "0.0", message = "Margin rate must be non-negative")
    @DecimalMax(value = "100.0", message = "Margin rate cannot exceed 100%")
    private Double marginRate;
    
    private String notes;
    
    // Constructors
    public UpdateMarginRateRequest() {}
    
    public UpdateMarginRateRequest(String retailerEmail, Double marginRate, String notes) {
        this.retailerEmail = retailerEmail;
        this.marginRate = marginRate;
        this.notes = notes;
    }
    
    // Getters and setters
    public String getRetailerEmail() {
        return retailerEmail;
    }
    
    public void setRetailerEmail(String retailerEmail) {
        this.retailerEmail = retailerEmail;
    }
    
    public Double getMarginRate() {
        return marginRate;
    }
    
    public void setMarginRate(Double marginRate) {
        this.marginRate = marginRate;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "UpdateMarginRateRequest{" +
                "retailerEmail='" + retailerEmail + '\'' +
                ", marginRate=" + marginRate +
                ", notes='" + notes + '\'' +
                '}';
    }
}