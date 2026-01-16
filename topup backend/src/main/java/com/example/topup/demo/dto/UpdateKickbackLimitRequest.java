package com.example.topup.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * DTO for updating retailer kickback bonus limit
 */
public class UpdateKickbackLimitRequest {

    @NotBlank(message = "Retailer email is required")
    private String retailerEmail;

    @NotNull(message = "Kickback limit is required")
    @DecimalMin(value = "0.0", message = "Kickback limit must be non-negative")
    private BigDecimal kickbackLimit;

    private String notes;

    // Constructors
    public UpdateKickbackLimitRequest() {}

    public UpdateKickbackLimitRequest(String retailerEmail, BigDecimal kickbackLimit, String notes) {
        this.retailerEmail = retailerEmail;
        this.kickbackLimit = kickbackLimit;
        this.notes = notes;
    }

    // Getters and Setters
    public String getRetailerEmail() {
        return retailerEmail;
    }

    public void setRetailerEmail(String retailerEmail) {
        this.retailerEmail = retailerEmail;
    }

    public BigDecimal getKickbackLimit() {
        return kickbackLimit;
    }

    public void setKickbackLimit(BigDecimal kickbackLimit) {
        this.kickbackLimit = kickbackLimit;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
