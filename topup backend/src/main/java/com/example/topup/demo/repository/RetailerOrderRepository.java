package com.example.topup.demo.repository;

import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerOrder.OrderStatus;
import com.example.topup.demo.entity.RetailerOrder.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RetailerOrderRepository extends MongoRepository<RetailerOrder, String> {
    
    // Find by retailer
    List<RetailerOrder> findByRetailerId(String retailerId);
    Page<RetailerOrder> findByRetailerId(String retailerId, Pageable pageable);
    
    // Find by order number
    Optional<RetailerOrder> findByOrderNumber(String orderNumber);
    
    // Find by status
    List<RetailerOrder> findByStatus(OrderStatus status);
    Page<RetailerOrder> findByStatus(OrderStatus status, Pageable pageable);
    
    // Find by payment status
    List<RetailerOrder> findByPaymentStatus(PaymentStatus paymentStatus);
    Page<RetailerOrder> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);
    
    // Find by retailer and status
    List<RetailerOrder> findByRetailerIdAndStatus(String retailerId, OrderStatus status);
    Page<RetailerOrder> findByRetailerIdAndStatus(String retailerId, OrderStatus status, Pageable pageable);
    
    // Find by retailer and payment status
    List<RetailerOrder> findByRetailerIdAndPaymentStatus(String retailerId, PaymentStatus paymentStatus);
    
    // Find by date range
    List<RetailerOrder> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    Page<RetailerOrder> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Find by retailer and date range
    List<RetailerOrder> findByRetailerIdAndCreatedDateBetween(String retailerId, LocalDateTime startDate, LocalDateTime endDate);
    Page<RetailerOrder> findByRetailerIdAndCreatedDateBetween(String retailerId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Find pending orders older than specified date
    @Query("{'status': 'PENDING', 'createdDate': {$lt: ?0}}")
    List<RetailerOrder> findPendingOrdersOlderThan(LocalDateTime date);
    
    // Find orders with specific payment methods
    List<RetailerOrder> findByPaymentMethod(String paymentMethod);
    
    // Find orders by multiple statuses
    List<RetailerOrder> findByStatusIn(List<OrderStatus> statuses);
    
    // Count orders by retailer
    long countByRetailerId(String retailerId);
    
    // Count orders by status
    long countByStatus(OrderStatus status);
    
    // Count orders by payment status
    long countByPaymentStatus(PaymentStatus paymentStatus);
    
    // Count orders by retailer and status
    long countByRetailerIdAndStatus(String retailerId, OrderStatus status);
    
    // Find recent orders
    @Query(value = "{}", sort = "{'createdDate': -1}")
    List<RetailerOrder> findRecentOrders(Pageable pageable);
    
    // Find orders by retailer sorted by date
    List<RetailerOrder> findByRetailerIdOrderByCreatedDateDesc(String retailerId);
    
    // Find orders containing specific product
    @Query("{'items.productId': ?0}")
    List<RetailerOrder> findOrdersContainingProduct(String productId);
    
    // Find orders by retailer containing specific product
    @Query("{'retailerId': ?0, 'items.productId': ?1}")
    List<RetailerOrder> findByRetailerIdAndItemsProductId(String retailerId, String productId);
    
    // Aggregation queries for analytics
    @Query(value = "{'retailerId': ?0}", count = true)
    long countOrdersByRetailer(String retailerId);
    
    // Find orders with total amount greater than
    @Query("{'totalAmount': {$gt: ?0}}")
    List<RetailerOrder> findOrdersWithAmountGreaterThan(Double amount);
    
    // Find orders with total amount between
    @Query("{'totalAmount': {$gte: ?0, $lte: ?1}}")
    List<RetailerOrder> findOrdersWithAmountBetween(Double minAmount, Double maxAmount);
    
    // Delete orders by retailer (for cleanup)
    long deleteByRetailerId(String retailerId);
    
    // Check if order exists by order number
    boolean existsByOrderNumber(String orderNumber);
}