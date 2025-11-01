package com.example.topup.demo.repository;

import com.example.topup.demo.entity.RewardCampaign;
import com.example.topup.demo.entity.RewardCampaign.CampaignStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RewardCampaignRepository extends MongoRepository<RewardCampaign, String> {
    
    List<RewardCampaign> findByStatus(CampaignStatus status);
    
    List<RewardCampaign> findByIsFeaturedTrue();
    
    @Query("{ 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 }, 'status': 'ACTIVE' }")
    List<RewardCampaign> findActiveCampaigns(LocalDateTime currentDate);
    
    @Query("{ 'applicableProductIds': { $in: [?0] } }")
    List<RewardCampaign> findByApplicableProductId(String productId);
    
    @Query("{ 'targetedUserIds': { $in: [?0] } }")
    List<RewardCampaign> findByTargetedUserId(String userId);
    
    List<RewardCampaign> findByIsReferralCampaignTrue();
    
    @Query("{ 'endDate': { $lt: ?0 }, 'status': { $ne: 'COMPLETED' } }")
    List<RewardCampaign> findCompletedCampaigns(LocalDateTime currentDate);
    
    long countByStatus(CampaignStatus status);
}
