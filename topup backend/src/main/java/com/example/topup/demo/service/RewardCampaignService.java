package com.example.topup.demo.service;

import com.example.topup.demo.entity.RewardCampaign;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.repository.RewardCampaignRepository;
import com.example.topup.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RewardCampaignService {

    @Autowired
    private RewardCampaignRepository rewardCampaignRepository;

    @Autowired
    private UserRepository userRepository;

    // Create reward campaign
    @Transactional
    public RewardCampaign createCampaign(RewardCampaign campaign, String adminId) {
        // Validate dates
        if (campaign.getEndDate().isBefore(campaign.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        campaign.setCreatedBy(adminId);
        campaign.setLastModifiedBy(adminId);
        campaign.updateStatus();
        
        return rewardCampaignRepository.save(campaign);
    }

    // Get all campaigns
    public List<RewardCampaign> getAllCampaigns() {
        return rewardCampaignRepository.findAll();
    }

    // Get campaign by ID
    public Optional<RewardCampaign> getCampaignById(String id) {
        return rewardCampaignRepository.findById(id);
    }

    // Get active campaigns
    public List<RewardCampaign> getActiveCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        return rewardCampaignRepository.findActiveCampaigns(now).stream()
                .filter(RewardCampaign::isActive)
                .collect(Collectors.toList());
    }

    // Get featured campaigns
    public List<RewardCampaign> getFeaturedCampaigns() {
        return rewardCampaignRepository.findByIsFeaturedTrue().stream()
                .filter(RewardCampaign::isActive)
                .collect(Collectors.toList());
    }

    // Get referral campaigns
    public List<RewardCampaign> getReferralCampaigns() {
        return rewardCampaignRepository.findByIsReferralCampaignTrue().stream()
                .filter(RewardCampaign::isActive)
                .collect(Collectors.toList());
    }

    // Update campaign
    @Transactional
    public RewardCampaign updateCampaign(String id, RewardCampaign updatedCampaign, String adminId) {
        RewardCampaign existing = rewardCampaignRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found"));

        // Validate dates
        if (updatedCampaign.getEndDate().isBefore(updatedCampaign.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Update fields
        existing.setName(updatedCampaign.getName());
        existing.setDescription(updatedCampaign.getDescription());
        existing.setRewardType(updatedCampaign.getRewardType());
        existing.setRewardValue(updatedCampaign.getRewardValue());
        existing.setMaxRewardPerTransaction(updatedCampaign.getMaxRewardPerTransaction());
        existing.setMinOrderValue(updatedCampaign.getMinOrderValue());
        existing.setStartDate(updatedCampaign.getStartDate());
        existing.setEndDate(updatedCampaign.getEndDate());
        existing.setApplicableProductIds(updatedCampaign.getApplicableProductIds());
        existing.setApplicableProductTypes(updatedCampaign.getApplicableProductTypes());
        existing.setApplicableUserTypes(updatedCampaign.getApplicableUserTypes());
        existing.setTargetedUserIds(updatedCampaign.getTargetedUserIds());
        existing.setMinPurchaseCount(updatedCampaign.getMinPurchaseCount());
        existing.setMinSpendAmount(updatedCampaign.getMinSpendAmount());
        existing.setTierRewards(updatedCampaign.getTierRewards());
        existing.setReferralCampaign(updatedCampaign.isReferralCampaign());
        existing.setReferrerReward(updatedCampaign.getReferrerReward());
        existing.setRefereeReward(updatedCampaign.getRefereeReward());
        existing.setCampaignBudget(updatedCampaign.getCampaignBudget());
        existing.setFeatured(updatedCampaign.isFeatured());
        existing.setBannerImageUrl(updatedCampaign.getBannerImageUrl());
        existing.setTermsAndConditions(updatedCampaign.getTermsAndConditions());
        existing.setLastModifiedBy(adminId);
        existing.updateStatus();

        return rewardCampaignRepository.save(existing);
    }

    // Delete campaign
    @Transactional
    public void deleteCampaign(String id) {
        RewardCampaign campaign = rewardCampaignRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found"));
        
        // Mark as cancelled instead of hard delete
        campaign.setStatus(RewardCampaign.CampaignStatus.CANCELLED);
        rewardCampaignRepository.save(campaign);
    }

    // Toggle campaign status
    @Transactional
    public RewardCampaign toggleCampaignStatus(String id) {
        RewardCampaign campaign = rewardCampaignRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found"));

        if (campaign.getStatus() == RewardCampaign.CampaignStatus.PAUSED) {
            campaign.setStatus(RewardCampaign.CampaignStatus.ACTIVE);
        } else if (campaign.getStatus() == RewardCampaign.CampaignStatus.ACTIVE) {
            campaign.setStatus(RewardCampaign.CampaignStatus.PAUSED);
        } else {
            throw new IllegalStateException("Cannot toggle status for campaign in " + campaign.getStatus() + " state");
        }

        campaign.updateStatus();
        return rewardCampaignRepository.save(campaign);
    }

    // Calculate reward for an order
    public Map<String, Object> calculateReward(String userId, BigDecimal orderValue, List<String> productIds) {
        Map<String, Object> result = new HashMap<>();
        
        List<RewardCampaign> applicableCampaigns = getActiveCampaigns().stream()
                .filter(campaign -> isCampaignApplicable(campaign, userId, productIds))
                .collect(Collectors.toList());

        if (applicableCampaigns.isEmpty()) {
            result.put("hasReward", false);
            result.put("reward", BigDecimal.ZERO);
            return result;
        }

        // Get the best reward
        RewardCampaign bestCampaign = applicableCampaigns.stream()
                .max(Comparator.comparing(c -> c.calculateReward(orderValue)))
                .orElse(null);

        if (bestCampaign != null) {
            BigDecimal reward = bestCampaign.calculateReward(orderValue);
            
            result.put("hasReward", true);
            result.put("reward", reward);
            result.put("campaignId", bestCampaign.getId());
            result.put("campaignName", bestCampaign.getName());
            result.put("rewardType", bestCampaign.getRewardType());
        } else {
            result.put("hasReward", false);
            result.put("reward", BigDecimal.ZERO);
        }

        return result;
    }

    // Apply reward to order
    @Transactional
    public BigDecimal applyReward(String campaignId, String userId, BigDecimal orderValue) {
        RewardCampaign campaign = rewardCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found"));

        if (!campaign.isActive()) {
            throw new IllegalStateException("Campaign is not active");
        }

        if (campaign.isBudgetExhausted()) {
            throw new IllegalStateException("Campaign budget has been exhausted");
        }

        BigDecimal reward = campaign.calculateReward(orderValue);
        campaign.recordReward(reward);
        campaign.addParticipant();
        
        rewardCampaignRepository.save(campaign);

        return reward;
    }

    // Check if campaign is applicable to user and products
    private boolean isCampaignApplicable(RewardCampaign campaign, String userId, List<String> productIds) {
        // Check user type applicability
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (campaign.getApplicableUserTypes() != null && 
                !campaign.getApplicableUserTypes().isEmpty() &&
                !campaign.getApplicableUserTypes().contains(user.getAccountType())) {
                return false;
            }

            // Check targeted users
            if (campaign.getTargetedUserIds() != null && 
                !campaign.getTargetedUserIds().isEmpty() &&
                !campaign.getTargetedUserIds().contains(userId)) {
                return false;
            }
        }

        // Check product applicability
        if (campaign.getApplicableProductIds() != null && 
            !campaign.getApplicableProductIds().isEmpty()) {
            boolean hasApplicableProduct = productIds.stream()
                    .anyMatch(productId -> campaign.getApplicableProductIds().contains(productId));
            if (!hasApplicableProduct) {
                return false;
            }
        }

        return true;
    }

    // Get campaigns by status
    public List<RewardCampaign> getCampaignsByStatus(RewardCampaign.CampaignStatus status) {
        return rewardCampaignRepository.findByStatus(status);
    }

    // Get campaign statistics
    public Map<String, Object> getCampaignStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalCampaigns = rewardCampaignRepository.count();
        long activeCampaigns = rewardCampaignRepository.countByStatus(RewardCampaign.CampaignStatus.ACTIVE);
        long scheduledCampaigns = rewardCampaignRepository.countByStatus(RewardCampaign.CampaignStatus.SCHEDULED);
        long completedCampaigns = rewardCampaignRepository.countByStatus(RewardCampaign.CampaignStatus.COMPLETED);

        List<RewardCampaign> allCampaigns = rewardCampaignRepository.findAll();
        
        int totalParticipants = allCampaigns.stream()
                .mapToInt(c -> c.getTotalParticipants() != null ? c.getTotalParticipants() : 0)
                .sum();
        
        BigDecimal totalRewardsDistributed = allCampaigns.stream()
                .map(c -> c.getTotalRewardsDistributed() != null ? c.getTotalRewardsDistributed() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalRedemptions = allCampaigns.stream()
                .mapToInt(c -> c.getTotalRedemptions() != null ? c.getTotalRedemptions() : 0)
                .sum();

        stats.put("totalCampaigns", totalCampaigns);
        stats.put("activeCampaigns", activeCampaigns);
        stats.put("scheduledCampaigns", scheduledCampaigns);
        stats.put("completedCampaigns", completedCampaigns);
        stats.put("totalParticipants", totalParticipants);
        stats.put("totalRewardsDistributed", totalRewardsDistributed);
        stats.put("totalRedemptions", totalRedemptions);

        // Top performing campaigns
        List<Map<String, Object>> topCampaigns = allCampaigns.stream()
                .sorted((c1, c2) -> Integer.compare(
                        c2.getTotalParticipants() != null ? c2.getTotalParticipants() : 0,
                        c1.getTotalParticipants() != null ? c1.getTotalParticipants() : 0
                ))
                .limit(5)
                .map(campaign -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", campaign.getId());
                    data.put("name", campaign.getName());
                    data.put("rewardType", campaign.getRewardType());
                    data.put("participants", campaign.getTotalParticipants());
                    data.put("rewardsDistributed", campaign.getTotalRewardsDistributed());
                    data.put("redemptions", campaign.getTotalRedemptions());
                    data.put("budgetSpent", campaign.getBudgetSpent());
                    data.put("status", campaign.getStatus());
                    return data;
                })
                .collect(Collectors.toList());

        stats.put("topCampaigns", topCampaigns);

        return stats;
    }

    // Scheduled task to update campaign statuses
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void updateCampaignStatuses() {
        List<RewardCampaign> allCampaigns = rewardCampaignRepository.findAll();
        
        for (RewardCampaign campaign : allCampaigns) {
            RewardCampaign.CampaignStatus oldStatus = campaign.getStatus();
            campaign.updateStatus();
            
            if (oldStatus != campaign.getStatus()) {
                rewardCampaignRepository.save(campaign);
            }
        }
    }

    // Get campaigns for a specific product
    public List<RewardCampaign> getCampaignsForProduct(String productId) {
        return rewardCampaignRepository.findByApplicableProductId(productId).stream()
                .filter(RewardCampaign::isActive)
                .collect(Collectors.toList());
    }

    // Get campaigns for a specific user
    public List<RewardCampaign> getCampaignsForUser(String userId) {
        return rewardCampaignRepository.findByTargetedUserId(userId).stream()
                .filter(RewardCampaign::isActive)
                .collect(Collectors.toList());
    }

    // Process referral reward
    @Transactional
    public Map<String, Object> processReferralReward(String campaignId, String referrerId, String refereeId) {
        Map<String, Object> result = new HashMap<>();
        
        RewardCampaign campaign = rewardCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found"));

        if (!campaign.isReferralCampaign()) {
            throw new IllegalStateException("Campaign is not a referral campaign");
        }

        if (!campaign.isActive()) {
            throw new IllegalStateException("Campaign is not active");
        }

        if (campaign.isBudgetExhausted()) {
            throw new IllegalStateException("Campaign budget has been exhausted");
        }

        BigDecimal totalReward = campaign.getReferrerReward().add(campaign.getRefereeReward());
        campaign.recordReward(totalReward);
        campaign.addParticipant();
        
        rewardCampaignRepository.save(campaign);

        result.put("success", true);
        result.put("referrerReward", campaign.getReferrerReward());
        result.put("refereeReward", campaign.getRefereeReward());
        result.put("campaignName", campaign.getName());

        return result;
    }
}
