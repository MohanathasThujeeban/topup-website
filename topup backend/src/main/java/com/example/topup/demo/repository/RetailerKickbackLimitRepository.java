package com.example.topup.demo.repository;

import com.example.topup.demo.entity.RetailerKickbackLimit;
import com.example.topup.demo.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RetailerKickbackLimitRepository extends MongoRepository<RetailerKickbackLimit, String> {
    
    /**
     * Find kickback limit by retailer
     */
    Optional<RetailerKickbackLimit> findByRetailer(User retailer);
    
    /**
     * Find kickback limit by retailer ID
     */
    Optional<RetailerKickbackLimit> findByRetailerId(String retailerId);
    
    /**
     * Check if kickback limit exists for a retailer
     */
    boolean existsByRetailer(User retailer);
    
    /**
     * Delete kickback limit by retailer
     */
    void deleteByRetailer(User retailer);
}
