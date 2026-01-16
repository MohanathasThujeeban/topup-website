package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity to store kickback bonus limits for retailers
 * This is a separate collection to manage kickback rewards independently
 */
@Document(collection = "retailer_kickback_limits")
public class RetailerKickbackLimit {

    @Id
    private String id;

    @DBRef
    @Indexed(unique = true)
    private User retailer;

    @NotNull(message = "Kickback limit is required")
    @DecimalMin(value = "0.0", message = "Kickback limit must be non-negative")
    private BigDecimal kickbackLimit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Used kickback must be non-negative")
    private BigDecimal usedKickback = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Available kickback must be non-negative")
    private BigDecimal availableKickback = BigDecimal.ZERO;

    @Indexed
    private KickbackStatus status = KickbackStatus.ACTIVE;

    private String notes; // Admin notes

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy; // Admin who set the limit
    private String lastModifiedBy;

    // Enums
    public enum KickbackStatus {
        ACTIVE,
        SUSPENDED,
        BLOCKED
    }

    // Constructors
    public RetailerKickbackLimit() {
        this.createdDate = LocalDateTime.now();
        this.lastModifiedDate = LocalDateTime.now();
    }

    public RetailerKickbackLimit(User retailer, BigDecimal kickbackLimit) {
        this();
        this.retailer = retailer;
        this.kickbackLimit = kickbackLimit;
        this.availableKickback = kickbackLimit;
        this.usedKickback = BigDecimal.ZERO;
    }

    // Helper methods
    public void useKickback(BigDecimal amount) {
        if (amount.compareTo(availableKickback) > 0) {
            throw new IllegalArgumentException("Insufficient kickback available");
        }
        this.usedKickback = this.usedKickback.add(amount);
        this.availableKickback = this.availableKickback.subtract(amount);
        this.lastModifiedDate = LocalDateTime.now();
    }

    public void resetKickback() {
        this.usedKickback = BigDecimal.ZERO;
        this.availableKickback = this.kickbackLimit;
        this.lastModifiedDate = LocalDateTime.now();
    }

    public void updateLimit(BigDecimal newLimit) {
        BigDecimal difference = newLimit.subtract(this.kickbackLimit);
        this.kickbackLimit = newLimit;
        this.availableKickback = this.availableKickback.add(difference);
        if (this.availableKickback.compareTo(BigDecimal.ZERO) < 0) {
            this.availableKickback = BigDecimal.ZERO;
        }
        this.lastModifiedDate = LocalDateTime.now();
    }

    public double getUsagePercentage() {
        if (kickbackLimit.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return usedKickback.divide(kickbackLimit, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
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

    public BigDecimal getKickbackLimit() {
        return kickbackLimit;
    }

    public void setKickbackLimit(BigDecimal kickbackLimit) {
        this.kickbackLimit = kickbackLimit;
        this.lastModifiedDate = LocalDateTime.now();
    }

    public BigDecimal getUsedKickback() {
        return usedKickback;
    }

    public void setUsedKickback(BigDecimal usedKickback) {
        this.usedKickback = usedKickback;
        this.lastModifiedDate = LocalDateTime.now();
    }

    public BigDecimal getAvailableKickback() {
        return availableKickback;
    }

    public void setAvailableKickback(BigDecimal availableKickback) {
        this.availableKickback = availableKickback;
        this.lastModifiedDate = LocalDateTime.now();
    }

    public KickbackStatus getStatus() {
        return status;
    }

    public void setStatus(KickbackStatus status) {
        this.status = status;
        this.lastModifiedDate = LocalDateTime.now();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }
}
