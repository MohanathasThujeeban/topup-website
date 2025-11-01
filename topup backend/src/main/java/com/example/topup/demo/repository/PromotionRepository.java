package com.example.topup.demo.repository;

import com.example.topup.demo.entity.Promotion;
import com.example.topup.demo.entity.Promotion.PromotionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends MongoRepository<Promotion, String> {
    
    Optional<Promotion> findByPromoCode(String promoCode);
    
    List<Promotion> findByStatus(PromotionStatus status);
    
    List<Promotion> findByIsActiveTrue();
    
    List<Promotion> findByIsFeaturedTrue();
    
    @Query("{ 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 } }")
    List<Promotion> findActivePromotions(LocalDateTime currentDate);
    
    @Query("{ 'status': ?0, 'createdBy': ?1 }")
    List<Promotion> findByStatusAndCreatedBy(PromotionStatus status, String createdBy);
    
    @Query("{ 'endDate': { $lt: ?0 }, 'status': { $ne: 'EXPIRED' } }")
    List<Promotion> findExpiredPromotions(LocalDateTime currentDate);
    
    @Query("{ 'applicableProductIds': { $in: [?0] } }")
    List<Promotion> findByApplicableProductId(String productId);
    
    long countByStatus(PromotionStatus status);
    
    long countByIsActiveTrue();
}
