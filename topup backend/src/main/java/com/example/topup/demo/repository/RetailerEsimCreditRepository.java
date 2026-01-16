package com.example.topup.demo.repository;

import com.example.topup.demo.entity.RetailerEsimCredit;
import com.example.topup.demo.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for RetailerEsimCredit entity.
 * This manages eSIM credit limits stored in a separate collection.
 */
@Repository
public interface RetailerEsimCreditRepository extends MongoRepository<RetailerEsimCredit, String> {

    /**
     * Find eSIM credit by retailer
     */
    Optional<RetailerEsimCredit> findByRetailer(User retailer);

    /**
     * Find eSIM credit by retailer ID
     */
    Optional<RetailerEsimCredit> findByRetailer_Id(String retailerId);

    /**
     * Find all active eSIM credits
     */
    List<RetailerEsimCredit> findByStatus(RetailerEsimCredit.LimitStatus status);

    /**
     * Check if retailer has eSIM credit record
     */
    boolean existsByRetailer(User retailer);

    /**
     * Check if retailer has eSIM credit record by ID
     */
    boolean existsByRetailer_Id(String retailerId);

    /**
     * Delete eSIM credit by retailer
     */
    void deleteByRetailer(User retailer);
}
