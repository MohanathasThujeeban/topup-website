package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity to track retailer profit/earnings over time
 * Stores daily, monthly, and yearly profit data
 */
@Document(collection = "retailer_profits")
public class RetailerProfit {
    
    @Id
    private String id;
    
    @DBRef
    private User retailer;
    
    // Date tracking
    private LocalDate date;           // For daily tracking
    private Integer year;             // For yearly tracking
    private Integer month;            // For monthly tracking (1-12)
    private String period;            // "daily", "monthly", "yearly"
    
    // Financial data
    private BigDecimal profit;        // Total profit for this period
    private BigDecimal revenue;       // Total revenue (sales amount)
    private BigDecimal costPrice;     // Total cost price
    private Integer salesCount;       // Number of sales
    
    // Product tracking
    private String productId;         // Optional: track by product
    private String productName;       // Optional: product name
    private String bundleName;        // Bundle/product name
    
    // Margin information
    private Double marginRate;        // Margin rate used (percentage)
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public RetailerProfit() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.salesCount = 0;
        this.profit = BigDecimal.ZERO;
        this.revenue = BigDecimal.ZERO;
        this.costPrice = BigDecimal.ZERO;
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
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Integer getYear() {
        return year;
    }
    
    public void setYear(Integer year) {
        this.year = year;
    }
    
    public Integer getMonth() {
        return month;
    }
    
    public void setMonth(Integer month) {
        this.month = month;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public BigDecimal getProfit() {
        return profit;
    }
    
    public void setProfit(BigDecimal profit) {
        this.profit = profit;
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getRevenue() {
        return revenue;
    }
    
    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getCostPrice() {
        return costPrice;
    }
    
    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Integer getSalesCount() {
        return salesCount;
    }
    
    public void setSalesCount(Integer salesCount) {
        this.salesCount = salesCount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getBundleName() {
        return bundleName;
    }
    
    public void setBundleName(String bundleName) {
        this.bundleName = bundleName;
    }
    
    public Double getMarginRate() {
        return marginRate;
    }
    
    public void setMarginRate(Double marginRate) {
        this.marginRate = marginRate;
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
    
    // Helper methods
    public void addSale(BigDecimal saleAmount, BigDecimal cost, Double margin) {
        this.revenue = this.revenue.add(saleAmount);
        this.costPrice = this.costPrice.add(cost);
        this.profit = this.revenue.subtract(this.costPrice);
        this.salesCount++;
        if (margin != null) {
            this.marginRate = margin;
        }
        this.updatedAt = LocalDateTime.now();
    }
}
