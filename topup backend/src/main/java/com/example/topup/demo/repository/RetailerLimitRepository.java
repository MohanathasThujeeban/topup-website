package com.example.topup.demo.repository;

import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.RetailerLimit.LimitStatus;
import com.example.topup.demo.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RetailerLimitRepository extends MongoRepository<RetailerLimit, String> {
    
    Optional<RetailerLimit> findByRetailer(User retailer);
    
    Optional<RetailerLimit> findByRetailer_Id(String retailerId);
    
    List<RetailerLimit> findByStatus(LimitStatus status);
    
    @Query("{ 'availableCredit': { $lt: ?0 } }")
    List<RetailerLimit> findByAvailableCreditLessThan(BigDecimal amount);
    
    @Query("{ 'outstandingAmount': { $gt: 0 } }")
    List<RetailerLimit> findRetailersWithOutstandingBalance();
    
    @Query("{ 'nextDueDate': { $lt: ?0 }, 'outstandingAmount': { $gt: 0 } }")
    List<RetailerLimit> findOverdueRetailers(LocalDateTime date);
    
    @Query("{ 'availableCredit': { $lt: '$lowCreditThreshold' }, 'sendLowCreditAlert': true }")
    List<RetailerLimit> findRetailersNeedingCreditAlert();
    
    @Query("{ 'retailer.$id': { $in: ?0 } }")
    List<RetailerLimit> findByRetailerIds(List<String> retailerIds);
    
    long countByStatus(LimitStatus status);
    
    @Query("{ 'outstandingAmount': { $gt: 0 } }")
    long countRetailersWithOutstanding();
}
