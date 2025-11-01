package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.topup.demo.entity.Product.ProductType;

@Document(collection = "promotions")
public class Promotion {

    @Id
    private String id;

    @NotBlank(message = "Promotion code is required")
    @Indexed(unique = true)
    @Size(min = 4, max = 20, message = "Promotion code must be between 4 and 20 characters")
    private String promoCode;

    @NotBlank(message = "Promotion name is required")
    @Size(min = 3, max = 100, message = "Promotion name must be between 3 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    private BigDecimal discountValue; // Percentage or fixed amount

    @DecimalMin(value = "0.0", message = "Maximum discount must be non-negative")
    private BigDecimal maxDiscountAmount; // Maximum discount for percentage type

    @DecimalMin(value = "0.0", message = "Minimum order value must be non-negative")
    private BigDecimal minOrderValue; // Minimum order value to apply promo

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit; // Total usage limit

    @Min(value = 1, message = "Usage per user must be at least 1")
    private Integer usageLimitPerUser = 1;

    @Min(value = 0, message = "Usage count must be non-negative")
    private Integer usageCount = 0; // Current usage count

    @Indexed
    private PromotionStatus status = PromotionStatus.SCHEDULED;

    private boolean isActive = false;

    // Applicability
    private List<String> applicableProductIds; // If empty, applies to all products
    private List<ProductType> applicableProductTypes;
    private List<String> applicableUserIds; // If empty, applies to all users
    private List<User.AccountType> applicableUserTypes; // PERSONAL, BUSINESS

    // Targeting
    private boolean isPublic = true; // If false, only specific users can use it
    private List<String> targetedEmails; // For personalized promotions

    // Featured and Display
    private boolean isFeatured = false;
    private String bannerImageUrl;
    private String termsAndConditions;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy; // Admin user ID
    private String lastModifiedBy;

    // Enums
    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT,
        BUY_X_GET_Y,
        FREE_SHIPPING
    }

    public enum PromotionStatus {
        DRAFT,
        SCHEDULED,
        ACTIVE,
        EXPIRED,
        PAUSED,
        CANCELLED
    }

    // Constructors
    public Promotion() {}

    public Promotion(String promoCode, String name, DiscountType discountType, BigDecimal discountValue,
                     LocalDateTime startDate, LocalDateTime endDate) {
        this.promoCode = promoCode.toUpperCase();
        this.name = name;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        updateStatus();
    }

    // Business Logic Methods
    public void updateStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        if (this.status == PromotionStatus.CANCELLED) {
            return; // Don't update if cancelled
        }
        
        if (now.isBefore(this.startDate)) {
            this.status = PromotionStatus.SCHEDULED;
            this.isActive = false;
        } else if (now.isAfter(this.endDate)) {
            this.status = PromotionStatus.EXPIRED;
            this.isActive = false;
        } else if (this.usageLimit != null && this.usageCount >= this.usageLimit) {
            this.status = PromotionStatus.EXPIRED;
            this.isActive = false;
        } else if (this.status == PromotionStatus.PAUSED) {
            this.isActive = false;
        } else {
            this.status = PromotionStatus.ACTIVE;
            this.isActive = true;
        }
    }

    public boolean isValid() {
        updateStatus();
        return this.isActive && this.status == PromotionStatus.ACTIVE;
    }

    public boolean canBeUsedBy(User user) {
        if (!isValid()) {
            return false;
        }

        // Check if promotion is public or user is targeted
        if (!isPublic && (targetedEmails == null || !targetedEmails.contains(user.getEmail()))) {
            return false;
        }

        // Check user type applicability
        if (applicableUserTypes != null && !applicableUserTypes.isEmpty() &&
            !applicableUserTypes.contains(user.getAccountType())) {
            return false;
        }

        // Check specific user IDs
        if (applicableUserIds != null && !applicableUserIds.isEmpty() &&
            !applicableUserIds.contains(user.getId())) {
            return false;
        }

        return true;
    }

    public boolean canBeAppliedToProduct(Product product) {
        if (!isValid()) {
            return false;
        }

        // Check product ID applicability
        if (applicableProductIds != null && !applicableProductIds.isEmpty() &&
            !applicableProductIds.contains(product.getId())) {
            return false;
        }

        // Check product type applicability
        if (applicableProductTypes != null && !applicableProductTypes.isEmpty() &&
            !applicableProductTypes.contains(product.getProductType())) {
            return false;
        }

        return true;
    }

    public BigDecimal calculateDiscount(BigDecimal orderValue) {
        if (!isValid()) {
            return BigDecimal.ZERO;
        }

        if (minOrderValue != null && orderValue.compareTo(minOrderValue) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = BigDecimal.ZERO;

        switch (discountType) {
            case PERCENTAGE:
                discount = orderValue.multiply(discountValue).divide(BigDecimal.valueOf(100));
                if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                    discount = maxDiscountAmount;
                }
                break;
            case FIXED_AMOUNT:
                discount = discountValue;
                if (discount.compareTo(orderValue) > 0) {
                    discount = orderValue; // Discount cannot exceed order value
                }
                break;
            case FREE_SHIPPING:
                // Handle in shipping calculation
                discount = BigDecimal.ZERO;
                break;
            default:
                discount = BigDecimal.ZERO;
        }

        return discount;
    }

    public void incrementUsage() {
        this.usageCount++;
        updateStatus();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode != null ? promoCode.toUpperCase() : null;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getMaxDiscountAmount() {
        return maxDiscountAmount;
    }

    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }

    public BigDecimal getMinOrderValue() {
        return minOrderValue;
    }

    public void setMinOrderValue(BigDecimal minOrderValue) {
        this.minOrderValue = minOrderValue;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
        updateStatus();
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
        updateStatus();
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
        updateStatus();
    }

    public Integer getUsageLimitPerUser() {
        return usageLimitPerUser;
    }

    public void setUsageLimitPerUser(Integer usageLimitPerUser) {
        this.usageLimitPerUser = usageLimitPerUser;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
        updateStatus();
    }

    public PromotionStatus getStatus() {
        return status;
    }

    public void setStatus(PromotionStatus status) {
        this.status = status;
        this.isActive = (status == PromotionStatus.ACTIVE);
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public List<String> getApplicableProductIds() {
        return applicableProductIds;
    }

    public void setApplicableProductIds(List<String> applicableProductIds) {
        this.applicableProductIds = applicableProductIds;
    }

    public List<ProductType> getApplicableProductTypes() {
        return applicableProductTypes;
    }

    public void setApplicableProductTypes(List<ProductType> applicableProductTypes) {
        this.applicableProductTypes = applicableProductTypes;
    }

    public List<String> getApplicableUserIds() {
        return applicableUserIds;
    }

    public void setApplicableUserIds(List<String> applicableUserIds) {
        this.applicableUserIds = applicableUserIds;
    }

    public List<User.AccountType> getApplicableUserTypes() {
        return applicableUserTypes;
    }

    public void setApplicableUserTypes(List<User.AccountType> applicableUserTypes) {
        this.applicableUserTypes = applicableUserTypes;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public List<String> getTargetedEmails() {
        return targetedEmails;
    }

    public void setTargetedEmails(List<String> targetedEmails) {
        this.targetedEmails = targetedEmails;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public String getBannerImageUrl() {
        return bannerImageUrl;
    }

    public void setBannerImageUrl(String bannerImageUrl) {
        this.bannerImageUrl = bannerImageUrl;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
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
