package com.example.topup.demo.dto;

import java.math.BigDecimal;

/**
 * DTO for retailer kickback limit response
 */
public class RetailerKickbackLimitDTO {

    private String retailerId;
    private String retailerEmail;
    private String retailerName;
    private BigDecimal kickbackLimit;
    private BigDecimal usedKickback;
    private BigDecimal availableKickback;
    private double usagePercentage;
    private String status;
    private String notes;

    // Constructors
    public RetailerKickbackLimitDTO() {}

    // Getters and Setters
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

    public BigDecimal getKickbackLimit() {
        return kickbackLimit;
    }

    public void setKickbackLimit(BigDecimal kickbackLimit) {
        this.kickbackLimit = kickbackLimit;
    }

    public BigDecimal getUsedKickback() {
        return usedKickback;
    }

    public void setUsedKickback(BigDecimal usedKickback) {
        this.usedKickback = usedKickback;
    }

    public BigDecimal getAvailableKickback() {
        return availableKickback;
    }

    public void setAvailableKickback(BigDecimal availableKickback) {
        this.availableKickback = availableKickback;
    }

    public double getUsagePercentage() {
        return usagePercentage;
    }

    public void setUsagePercentage(double usagePercentage) {
        this.usagePercentage = usagePercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
