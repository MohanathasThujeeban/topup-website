package com.example.topup.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RetailerCreditLimitDTO {
    
    private String id;
    private String retailerId;
    private String retailerName;
    private String retailerEmail;
    private BigDecimal creditLimit;
    private BigDecimal availableCredit;
    private BigDecimal usedCredit;
    private BigDecimal outstandingAmount;
    private Integer paymentTermsDays;
    private LocalDateTime lastPaymentDate;
    private LocalDateTime nextDueDate;
    private String status;
    private Double creditUsagePercentage;
    private String level;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public RetailerCreditLimitDTO() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getRetailerId() {
        return retailerId;
    }
    
    public void setRetailerId(String retailerId) {
        this.retailerId = retailerId;
    }
    
    public String getRetailerName() {
        return retailerName;
    }
    
    public void setRetailerName(String retailerName) {
        this.retailerName = retailerName;
    }
    
    public String getRetailerEmail() {
        return retailerEmail;
    }
    
    public void setRetailerEmail(String retailerEmail) {
        this.retailerEmail = retailerEmail;
    }
    
    public BigDecimal getCreditLimit() {
        return creditLimit;
    }
    
    public void setCreditLimit(BigDecimal creditLimit) {
        this.creditLimit = creditLimit;
    }
    
    public BigDecimal getAvailableCredit() {
        return availableCredit;
    }
    
    public void setAvailableCredit(BigDecimal availableCredit) {
        this.availableCredit = availableCredit;
    }
    
    public BigDecimal getUsedCredit() {
        return usedCredit;
    }
    
    public void setUsedCredit(BigDecimal usedCredit) {
        this.usedCredit = usedCredit;
    }
    
    public BigDecimal getOutstandingAmount() {
        return outstandingAmount;
    }
    
    public void setOutstandingAmount(BigDecimal outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }
    
    public Integer getPaymentTermsDays() {
        return paymentTermsDays;
    }
    
    public void setPaymentTermsDays(Integer paymentTermsDays) {
        this.paymentTermsDays = paymentTermsDays;
    }
    
    public LocalDateTime getLastPaymentDate() {
        return lastPaymentDate;
    }
    
    public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
    }
    
    public LocalDateTime getNextDueDate() {
        return nextDueDate;
    }
    
    public void setNextDueDate(LocalDateTime nextDueDate) {
        this.nextDueDate = nextDueDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Double getCreditUsagePercentage() {
        return creditUsagePercentage;
    }
    
    public void setCreditUsagePercentage(Double creditUsagePercentage) {
        this.creditUsagePercentage = creditUsagePercentage;
    }
    
    public String getLevel() {
        return level;
    }
    
    public void setLevel(String level) {
        this.level = level;
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
}
