package com.example.topup.demo.repository;

import com.example.topup.demo.entity.EsimPosSale;
import com.example.topup.demo.entity.EsimPosSale.SaleStatus;
import com.example.topup.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for eSIM Point of Sales transactions
 * Collection: esim_pos_sales
 */
@Repository
public interface EsimPosSaleRepository extends MongoRepository<EsimPosSale, String> {

    // Find by retailer
    List<EsimPosSale> findByRetailer(User retailer);

    List<EsimPosSale> findByRetailerId(String retailerId);

    List<EsimPosSale> findByRetailerEmail(String retailerEmail);

    // Find by retailer with pagination
    Page<EsimPosSale> findByRetailerId(String retailerId, Pageable pageable);

    Page<EsimPosSale> findByRetailerEmail(String retailerEmail, Pageable pageable);

    // Find by customer
    List<EsimPosSale> findByCustomerEmail(String customerEmail);

    Optional<EsimPosSale> findByIccid(String iccid);

    // Find by order
    Optional<EsimPosSale> findByOrderId(String orderId);

    List<EsimPosSale> findByOrderReference(String orderReference);

    // Find by status
    List<EsimPosSale> findByStatus(SaleStatus status);

    List<EsimPosSale> findByRetailerIdAndStatus(String retailerId, SaleStatus status);

    // Find by date range
    List<EsimPosSale> findBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    List<EsimPosSale> findByRetailerIdAndSaleDateBetween(String retailerId, LocalDateTime start, LocalDateTime end);

    // Find by retailer and date range with pagination
    Page<EsimPosSale> findByRetailerIdAndSaleDateBetween(String retailerId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Find by product/bundle
    List<EsimPosSale> findByProductId(String productId);

    List<EsimPosSale> findByBundleId(String bundleId);

    List<EsimPosSale> findByStockPoolId(String stockPoolId);

    // Find by operator
    List<EsimPosSale> findByOperator(String operator);

    List<EsimPosSale> findByRetailerIdAndOperator(String retailerId, String operator);

    // Count queries
    long countByRetailerId(String retailerId);

    long countByRetailerIdAndStatus(String retailerId, SaleStatus status);

    long countByRetailerIdAndSaleDateBetween(String retailerId, LocalDateTime start, LocalDateTime end);

    long countBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    // Find recent sales
    List<EsimPosSale> findTop10ByRetailerIdOrderBySaleDateDesc(String retailerId);

    List<EsimPosSale> findTop20ByOrderBySaleDateDesc();

    // Custom queries for analytics
    @Query("{ 'retailerId': ?0, 'status': 'COMPLETED' }")
    List<EsimPosSale> findCompletedSalesByRetailerId(String retailerId);

    @Query("{ 'retailerId': ?0, 'saleDate': { $gte: ?1, $lte: ?2 }, 'status': 'COMPLETED' }")
    List<EsimPosSale> findCompletedSalesByRetailerIdAndDateRange(String retailerId, LocalDateTime start, LocalDateTime end);

    // Find sales where email not sent
    List<EsimPosSale> findByEmailSentFalse();

    List<EsimPosSale> findByRetailerIdAndEmailSentFalse(String retailerId);

    // Search by customer email containing
    List<EsimPosSale> findByCustomerEmailContainingIgnoreCase(String email);

    // Search by product name containing
    List<EsimPosSale> findByProductNameContainingIgnoreCase(String productName);

    // Find by country
    List<EsimPosSale> findByCountry(String country);

    List<EsimPosSale> findByRetailerIdAndCountry(String retailerId, String country);

    // Delete old sales (for cleanup if needed)
    void deleteByCreatedAtBefore(LocalDateTime date);
}
