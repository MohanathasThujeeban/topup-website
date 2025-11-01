package com.example.topup.demo.dto;

import java.math.BigDecimal;

public class RetailerCreditLevel {
    
    private String level;
    private BigDecimal amount;
    private boolean isAvailable;
    private boolean isCurrentLevel;
    private String displayName;
    private String description;
    
    public RetailerCreditLevel() {}
    
    public RetailerCreditLevel(String level, BigDecimal amount, String displayName) {
        this.level = level;
        this.amount = amount;
        this.displayName = displayName;
        this.isAvailable = false;
        this.isCurrentLevel = false;
    }
    
    // Getters and Setters
    public String getLevel() {
        return level;
    }
    
    public void setLevel(String level) {
        this.level = level;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public boolean isAvailable() {
        return isAvailable;
    }
    
    public void setAvailable(boolean available) {
        isAvailable = available;
    }
    
    public boolean isCurrentLevel() {
        return isCurrentLevel;
    }
    
    public void setCurrentLevel(boolean currentLevel) {
        isCurrentLevel = currentLevel;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
