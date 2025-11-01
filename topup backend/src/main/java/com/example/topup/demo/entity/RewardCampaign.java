package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.topup.demo.entity.Product.ProductType;

@Document(collection = "reward_campaigns")
public class RewardCampaign {

    @Id
    private String id;

    @NotBlank(message = "Campaign name is required")
    @Size(min = 3, max = 100, message = "Campaign name must be between 3 and 100 characters")
    @Indexed
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Reward type is required")
    private RewardType rewardType;

    @NotNull(message = "Reward value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Reward value must be greater than 0")
    private BigDecimal rewardValue; // Points or cashback percentage or fixed amount

    @DecimalMin(value = "0.0", message = "Maximum reward must be non-negative")
    private BigDecimal maxRewardPerTransaction;

    @DecimalMin(value = "0.0", message = "Minimum order value must be non-negative")
    private BigDecimal minOrderValue;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @Indexed
    private CampaignStatus status = CampaignStatus.SCHEDULED;

    // Targeting
    private List<String> applicableProductIds;
    private List<ProductType> applicableProductTypes;
    private List<User.AccountType> applicableUserTypes;
    private List<String> targetedUserIds;

    // Campaign rules
    private Integer minPurchaseCount; // Minimum purchases to qualify
    private BigDecimal minSpendAmount; // Minimum total spend to qualify

    // Tier-based rewards
    private Map<String, TierReward> tierRewards = new HashMap<>();

    // Referral rewards
    private boolean isReferralCampaign = false;
    private BigDecimal referrerReward;
    private BigDecimal refereeReward;

    // Usage tracking
    @Min(value = 0, message = "Total participants must be non-negative")
    private Integer totalParticipants = 0;

    @DecimalMin(value = "0.0", message = "Total rewards distributed must be non-negative")
    private BigDecimal totalRewardsDistributed = BigDecimal.ZERO;

    @Min(value = 0, message = "Total redemptions must be non-negative")
    private Integer totalRedemptions = 0;

    // Budget
    @DecimalMin(value = "0.0", message = "Budget must be non-negative")
    private BigDecimal campaignBudget;

    @DecimalMin(value = "0.0", message = "Spent amount must be non-negative")
    private BigDecimal budgetSpent = BigDecimal.ZERO;

    // Display
    private boolean isFeatured = false;
    private String bannerImageUrl;
    private String termsAndConditions;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy;
    private String lastModifiedBy;

    // Enums
    public enum RewardType {
        POINTS,
        CASHBACK_PERCENTAGE,
        CASHBACK_FIXED,
        DISCOUNT_COUPON,
        FREE_PRODUCT,
        TIER_BASED
    }

    public enum CampaignStatus {
        DRAFT,
        SCHEDULED,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    // Nested class for tier-based rewards
    public static class TierReward {
        private String tierName;
        private BigDecimal minSpend;
        private BigDecimal maxSpend;
        private BigDecimal rewardValue;
        private String description;

        public TierReward() {}

        public TierReward(String tierName, BigDecimal minSpend, BigDecimal maxSpend, BigDecimal rewardValue) {
            this.tierName = tierName;
            this.minSpend = minSpend;
            this.maxSpend = maxSpend;
            this.rewardValue = rewardValue;
        }

        // Getters and Setters
        public String getTierName() {
            return tierName;
        }

        public void setTierName(String tierName) {
            this.tierName = tierName;
        }

        public BigDecimal getMinSpend() {
            return minSpend;
        }

        public void setMinSpend(BigDecimal minSpend) {
            this.minSpend = minSpend;
        }

        public BigDecimal getMaxSpend() {
            return maxSpend;
        }

        public void setMaxSpend(BigDecimal maxSpend) {
            this.maxSpend = maxSpend;
        }

        public BigDecimal getRewardValue() {
            return rewardValue;
        }

        public void setRewardValue(BigDecimal rewardValue) {
            this.rewardValue = rewardValue;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    // Constructors
    public RewardCampaign() {}

    public RewardCampaign(String name, RewardType rewardType, BigDecimal rewardValue,
                         LocalDateTime startDate, LocalDateTime endDate) {
        this.name = name;
        this.rewardType = rewardType;
        this.rewardValue = rewardValue;
        this.startDate = startDate;
        this.endDate = endDate;
        updateStatus();
    }

    // Business Logic Methods
    public void updateStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        if (this.status == CampaignStatus.CANCELLED) {
            return;
        }
        
        if (now.isBefore(this.startDate)) {
            this.status = CampaignStatus.SCHEDULED;
        } else if (now.isAfter(this.endDate)) {
            this.status = CampaignStatus.COMPLETED;
        } else if (this.status == CampaignStatus.PAUSED) {
            // Keep paused status
        } else if (isBudgetExhausted()) {
            this.status = CampaignStatus.COMPLETED;
        } else {
            this.status = CampaignStatus.ACTIVE;
        }
    }

    public boolean isActive() {
        updateStatus();
        return this.status == CampaignStatus.ACTIVE;
    }

    public boolean isBudgetExhausted() {
        if (campaignBudget == null) {
            return false;
        }
        return budgetSpent.compareTo(campaignBudget) >= 0;
    }

    public BigDecimal calculateReward(BigDecimal orderValue) {
        if (!isActive()) {
            return BigDecimal.ZERO;
        }

        if (minOrderValue != null && orderValue.compareTo(minOrderValue) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal reward = BigDecimal.ZERO;

        switch (rewardType) {
            case POINTS:
                reward = rewardValue; // Fixed points per transaction
                break;
            case CASHBACK_PERCENTAGE:
                reward = orderValue.multiply(rewardValue).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                if (maxRewardPerTransaction != null && reward.compareTo(maxRewardPerTransaction) > 0) {
                    reward = maxRewardPerTransaction;
                }
                break;
            case CASHBACK_FIXED:
                reward = rewardValue;
                break;
            case TIER_BASED:
                reward = calculateTierReward(orderValue);
                break;
            default:
                reward = BigDecimal.ZERO;
        }

        // Check if budget allows this reward
        if (campaignBudget != null) {
            BigDecimal remainingBudget = campaignBudget.subtract(budgetSpent);
            if (reward.compareTo(remainingBudget) > 0) {
                reward = remainingBudget;
            }
        }

        return reward;
    }

    private BigDecimal calculateTierReward(BigDecimal orderValue) {
        for (TierReward tier : tierRewards.values()) {
            if (orderValue.compareTo(tier.getMinSpend()) >= 0 &&
                (tier.getMaxSpend() == null || orderValue.compareTo(tier.getMaxSpend()) <= 0)) {
                return tier.getRewardValue();
            }
        }
        return BigDecimal.ZERO;
    }

    public void recordReward(BigDecimal rewardAmount) {
        this.budgetSpent = this.budgetSpent.add(rewardAmount);
        this.totalRewardsDistributed = this.totalRewardsDistributed.add(rewardAmount);
        this.totalRedemptions++;
        updateStatus();
    }

    public void addParticipant() {
        this.totalParticipants++;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public RewardType getRewardType() {
        return rewardType;
    }

    public void setRewardType(RewardType rewardType) {
        this.rewardType = rewardType;
    }

    public BigDecimal getRewardValue() {
        return rewardValue;
    }

    public void setRewardValue(BigDecimal rewardValue) {
        this.rewardValue = rewardValue;
    }

    public BigDecimal getMaxRewardPerTransaction() {
        return maxRewardPerTransaction;
    }

    public void setMaxRewardPerTransaction(BigDecimal maxRewardPerTransaction) {
        this.maxRewardPerTransaction = maxRewardPerTransaction;
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

    public CampaignStatus getStatus() {
        return status;
    }

    public void setStatus(CampaignStatus status) {
        this.status = status;
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

    public List<User.AccountType> getApplicableUserTypes() {
        return applicableUserTypes;
    }

    public void setApplicableUserTypes(List<User.AccountType> applicableUserTypes) {
        this.applicableUserTypes = applicableUserTypes;
    }

    public List<String> getTargetedUserIds() {
        return targetedUserIds;
    }

    public void setTargetedUserIds(List<String> targetedUserIds) {
        this.targetedUserIds = targetedUserIds;
    }

    public Integer getMinPurchaseCount() {
        return minPurchaseCount;
    }

    public void setMinPurchaseCount(Integer minPurchaseCount) {
        this.minPurchaseCount = minPurchaseCount;
    }

    public BigDecimal getMinSpendAmount() {
        return minSpendAmount;
    }

    public void setMinSpendAmount(BigDecimal minSpendAmount) {
        this.minSpendAmount = minSpendAmount;
    }

    public Map<String, TierReward> getTierRewards() {
        return tierRewards;
    }

    public void setTierRewards(Map<String, TierReward> tierRewards) {
        this.tierRewards = tierRewards;
    }

    public boolean isReferralCampaign() {
        return isReferralCampaign;
    }

    public void setReferralCampaign(boolean referralCampaign) {
        isReferralCampaign = referralCampaign;
    }

    public BigDecimal getReferrerReward() {
        return referrerReward;
    }

    public void setReferrerReward(BigDecimal referrerReward) {
        this.referrerReward = referrerReward;
    }

    public BigDecimal getRefereeReward() {
        return refereeReward;
    }

    public void setRefereeReward(BigDecimal refereeReward) {
        this.refereeReward = refereeReward;
    }

    public Integer getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(Integer totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    public BigDecimal getTotalRewardsDistributed() {
        return totalRewardsDistributed;
    }

    public void setTotalRewardsDistributed(BigDecimal totalRewardsDistributed) {
        this.totalRewardsDistributed = totalRewardsDistributed;
    }

    public Integer getTotalRedemptions() {
        return totalRedemptions;
    }

    public void setTotalRedemptions(Integer totalRedemptions) {
        this.totalRedemptions = totalRedemptions;
    }

    public BigDecimal getCampaignBudget() {
        return campaignBudget;
    }

    public void setCampaignBudget(BigDecimal campaignBudget) {
        this.campaignBudget = campaignBudget;
    }

    public BigDecimal getBudgetSpent() {
        return budgetSpent;
    }

    public void setBudgetSpent(BigDecimal budgetSpent) {
        this.budgetSpent = budgetSpent;
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
