package com.example.topup.demo.repository;

import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.Order.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    
    // Find orders by retailer (business user)
    List<Order> findByRetailerOrderByCreatedDateDesc(User retailer);
    
    // Find orders by retailer ID
    List<Order> findByRetailer_Id(String retailerId);
    
    // Find orders by retailer and status
    List<Order> findByRetailerAndStatusOrderByCreatedDateDesc(User retailer, OrderStatus status);
    
    // Find orders by retailer within date range
    List<Order> findByRetailerAndCreatedDateBetweenOrderByCreatedDateDesc(
        User retailer, LocalDateTime startDate, LocalDateTime endDate);
    
    // Count orders by retailer
    long countByRetailer(User retailer);
    
    // Count pending orders by retailer
    long countByRetailerAndStatus(User retailer, OrderStatus status);
    
    // Find orders by order number
    Order findByOrderNumber(String orderNumber);
    
    // Find orders by customer email
    List<Order> findByCustomerEmailOrderByCreatedDateDesc(String customerEmail);
    
    // Get monthly order count for retailer
    @Query(value = "{ 'retailer': ?0, 'createdDate': { $gte: ?1, $lt: ?2 } }", 
           count = true)
    long countByRetailerAndDateRange(User retailer, LocalDateTime startDate, LocalDateTime endDate);
    
    // Get total revenue for retailer in date range
    @Query(value = "{ 'retailer': ?0, 'status': 'COMPLETED', 'createdDate': { $gte: ?1, $lt: ?2 } }")
    List<Order> findCompletedOrdersByRetailerAndDateRange(User retailer, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find orders by created date range
    List<Order> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}