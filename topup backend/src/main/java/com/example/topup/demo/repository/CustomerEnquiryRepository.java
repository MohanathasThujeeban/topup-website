package com.example.topup.demo.repository;

import com.example.topup.demo.entity.CustomerEnquiry;
import com.example.topup.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerEnquiryRepository extends MongoRepository<CustomerEnquiry, String> {

    // Find by enquiry ID
    Optional<CustomerEnquiry> findByEnquiryId(String enquiryId);

    // Find by customer email
    List<CustomerEnquiry> findByCustomerEmailOrderByCreatedDateDesc(String customerEmail);

    // Find by user reference
    List<CustomerEnquiry> findByUserOrderByCreatedDateDesc(User user);

    // Find by status
    Page<CustomerEnquiry> findByStatus(CustomerEnquiry.Status status, Pageable pageable);
    List<CustomerEnquiry> findByStatus(CustomerEnquiry.Status status);
    long countByStatus(CustomerEnquiry.Status status);

    // Find by priority
    Page<CustomerEnquiry> findByPriority(CustomerEnquiry.Priority priority, Pageable pageable);
    List<CustomerEnquiry> findByPriority(CustomerEnquiry.Priority priority);

    // Find by channel
    Page<CustomerEnquiry> findByChannel(CustomerEnquiry.Channel channel, Pageable pageable);
    List<CustomerEnquiry> findByChannel(CustomerEnquiry.Channel channel);

    // Find by assigned agent
    Page<CustomerEnquiry> findByAssignedAgentOrderByCreatedDateDesc(String assignedAgent, Pageable pageable);
    List<CustomerEnquiry> findByAssignedAgentOrderByCreatedDateDesc(String assignedAgent);

    // Find by status and priority
    Page<CustomerEnquiry> findByStatusAndPriority(CustomerEnquiry.Status status, CustomerEnquiry.Priority priority, Pageable pageable);

    // Find by status and assigned agent
    Page<CustomerEnquiry> findByStatusAndAssignedAgent(CustomerEnquiry.Status status, String assignedAgent, Pageable pageable);

    // Find by date range
    Page<CustomerEnquiry> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    List<CustomerEnquiry> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find unassigned enquiries (no assigned agent)
    @Query("{ 'assignedAgent': { $exists: false } }")
    Page<CustomerEnquiry> findUnassignedEnquiries(Pageable pageable);

    @Query("{ 'assignedAgent': { $exists: false } }")
    List<CustomerEnquiry> findUnassignedEnquiries();

    // Find open enquiries older than specified hours
    @Query("{ 'status': ?0, 'createdDate': { $lt: ?1 } }")
    List<CustomerEnquiry> findOldOpenEnquiries(CustomerEnquiry.Status status, LocalDateTime cutoffDate);

    // Search by subject or message content
    @Query("{ $or: [ " +
           "  { 'subject': { $regex: ?0, $options: 'i' } }, " +
           "  { 'message': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<CustomerEnquiry> findBySubjectOrMessageContaining(String searchTerm, Pageable pageable);

    // Find by category
    Page<CustomerEnquiry> findByCategory(String category, Pageable pageable);
    List<CustomerEnquiry> findByCategory(String category);

    // Find by category and subcategory
    Page<CustomerEnquiry> findByCategoryAndSubcategory(String category, String subcategory, Pageable pageable);

    // Find resolved enquiries with customer satisfaction rating
    @Query("{ 'status': 'RESOLVED', 'customerSatisfactionRating': { $exists: true } }")
    List<CustomerEnquiry> findResolvedEnquiriesWithRating();

    // Count enquiries by date range
    long countByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Count enquiries by status and date range
    long countByStatusAndCreatedDateBetween(CustomerEnquiry.Status status, LocalDateTime startDate, LocalDateTime endDate);

    // Count enquiries by assigned agent
    long countByAssignedAgent(String assignedAgent);

    // Count enquiries by channel
    long countByChannel(CustomerEnquiry.Channel channel);

    // Find top customers by enquiry count
    @Query(value = "{ }", fields = "{ 'customerEmail': 1 }")
    List<CustomerEnquiry> findAllCustomerEmails();

    // Get recent enquiries (last 24 hours)
    @Query("{ 'createdDate': { $gte: ?0 } }")
    List<CustomerEnquiry> findRecentEnquiries(LocalDateTime since);

    // Find enquiries by reference order ID
    List<CustomerEnquiry> findByReferenceOrderId(String referenceOrderId);

    // Custom aggregation queries can be added here for analytics
    // For example, count by status grouped by date, average resolution time, etc.
}