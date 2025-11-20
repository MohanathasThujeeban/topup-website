package com.example.topup.demo.dto;

import jakarta.validation.constraints.*;

public class UpdateUnitLimitRequest {
    
    @NotBlank(message = "Retailer ID is required")
    private String retailerId;
    
    @NotNull(message = "Unit limit is required")
    @Min(value = 0, message = "Unit limit must be non-negative")
    private Integer unitLimit;
    
    private String notes;
    
    // Constructors
    public UpdateUnitLimitRequest() {}
    
    public UpdateUnitLimitRequest(String retailerId, Integer unitLimit, String notes) {
        this.retailerId = retailerId;
        this.unitLimit = unitLimit;
        this.notes = notes;
    }
    
    // Getters and Setters
    public String getRetailerId() {
        return retailerId;
    }
    
    public void setRetailerId(String retailerId) {
        this.retailerId = retailerId;
    }
    
    public Integer getUnitLimit() {
        return unitLimit;
    }
    
    public void setUnitLimit(Integer unitLimit) {
        this.unitLimit = unitLimit;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}