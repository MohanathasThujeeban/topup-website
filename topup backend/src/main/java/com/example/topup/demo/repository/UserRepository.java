package com.example.topup.demo.repository;

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
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find user by email address (case-insensitive)
     */
    @Query("{'email': {$regex: ?0, $options: 'i'}}")
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Find user by email address (exact match)
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email (case-insensitive)
     */
    @Query(value = "{'email': {$regex: ?0, $options: 'i'}}", exists = true)
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Find users by account type
     */
    List<User> findByAccountType(User.AccountType accountType);
    Page<User> findByAccountType(User.AccountType accountType, Pageable pageable);

    /**
     * Find users by account status
     */
    List<User> findByAccountStatus(User.AccountStatus accountStatus);
    Page<User> findByAccountStatus(User.AccountStatus accountStatus, Pageable pageable);

    /**
     * Find users by account type and status
     */
    List<User> findByAccountTypeAndAccountStatus(User.AccountType accountType, User.AccountStatus accountStatus);
    Page<User> findByAccountTypeAndAccountStatus(User.AccountType accountType, User.AccountStatus accountStatus, Pageable pageable);

    /**
     * Find business users pending approval
     */
    @Query("{'accountType': 'BUSINESS', 'accountStatus': 'PENDING_BUSINESS_APPROVAL'}")
    List<User> findBusinessUsersPendingApproval();

    /**
     * Find active users
     */
    @Query("{'accountStatus': 'ACTIVE', 'enabled': true}")
    List<User> findActiveUsers();

    /**
     * Find users by mobile number
     */
    Optional<User> findByMobileNumber(String mobileNumber);

    /**
     * Find users by first and last name (case-insensitive)
     */
    @Query("{'firstName': {$regex: ?0, $options: 'i'}, 'lastName': {$regex: ?1, $options: 'i'}}")
    List<User> findByFirstNameAndLastNameIgnoreCase(String firstName, String lastName);

    /**
     * Find unverified users older than specified date
     */
    @Query("{'emailVerified': false, 'createdDate': {$lt: ?0}}")
    List<User> findUnverifiedUsersOlderThan(LocalDateTime cutoffDate);

    /**
     * Find users created between dates
     */
    @Query("{'createdDate': {$gte: ?0, $lte: ?1}}")
    List<User> findUsersCreatedBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Count users created between dates
     */
    long countByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find recent users ordered by creation date
     */
    List<User> findTop10ByOrderByCreatedDateDesc();

    /**
     * Count users by account type
     */
    long countByAccountType(User.AccountType accountType);

    /**
     * Count users by account status
     */
    long countByAccountStatus(User.AccountStatus accountStatus);

    /**
     * Count verified users
     */
    @Query(value = "{'emailVerified': true}", count = true)
    long countVerifiedUsers();

    /**
     * Count unverified users
     */
    @Query(value = "{'emailVerified': false}", count = true)
    long countUnverifiedUsers();

    /**
     * Find users with business details
     */
    @Query("{'businessDetails': {$exists: true, $ne: null}}")
    List<User> findUsersWithBusinessDetails();

    /**
     * Find users by partial email match (for admin search)
     */
    @Query("{'email': {$regex: ?0, $options: 'i'}}")
    List<User> findByEmailContainingIgnoreCase(String emailFragment);

    /**
     * Find users by partial name match (for admin search)
     */
    @Query("{$or: [" +
           "{'firstName': {$regex: ?0, $options: 'i'}}, " +
           "{'lastName': {$regex: ?0, $options: 'i'}}" +
           "]}")
    List<User> findByNameContainingIgnoreCase(String nameFragment);

    /**
     * Search users by name or email (for admin search with pagination)
     */
    @Query("{$or: [" +
           "{'firstName': {$regex: ?0, $options: 'i'}}, " +
           "{'lastName': {$regex: ?1, $options: 'i'}}, " +
           "{'email': {$regex: ?2, $options: 'i'}}" +
           "]}")
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String firstName, String lastName, String email, Pageable pageable);

    /**
     * Find recently registered users (last 7 days)
     */
    @Query("{'createdDate': {$gte: ?0}}")
    List<User> findRecentlyRegisteredUsers(LocalDateTime sevenDaysAgo);

    /**
     * Find inactive users (not logged in for specified period)
     */
    @Query("{'lastModifiedDate': {$lt: ?0}}")
    List<User> findInactiveUsers(LocalDateTime inactivityThreshold);

    /**
     * Update user's last modified date
     */
    @Query("{'email': ?0}")
    void updateLastModifiedDate(String email, LocalDateTime lastModifiedDate);

    /**
     * Find users by enabled status
     */
    List<User> findByEnabled(boolean enabled);

    /**
     * Find locked accounts
     */
    List<User> findByAccountNonLocked(boolean accountNonLocked);

    /**
     * Find expired accounts
     */
    List<User> findByAccountNonExpired(boolean accountNonExpired);

    /**
     * Find user by ID
     */
    Optional<User> findById(String id);

    /**
     * Custom aggregation queries can be added here for complex reporting
     */
    
    /**
     * Delete unverified users older than specified date (cleanup task)
     */
    @Query("{'emailVerified': false, 'createdDate': {$lt: ?0}}")
    void deleteUnverifiedUsersOlderThan(LocalDateTime cutoffDate);
}