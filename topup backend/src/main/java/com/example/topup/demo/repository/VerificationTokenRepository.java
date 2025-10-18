package com.example.topup.demo.repository;

import com.example.topup.demo.entity.VerificationToken;
import com.example.topup.demo.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends MongoRepository<VerificationToken, String> {

    /**
     * Find token by token string and email
     */
    Optional<VerificationToken> findByTokenAndEmail(String token, String email);

    /**
     * Find token by token string only
     */
    Optional<VerificationToken> findByToken(String token);

    /**
     * Find valid token by token string and email (not used and not expired)
     */
    @Query("{'token': ?0, 'email': ?1, 'used': false, 'expiryDate': {$gt: ?2}}")
    Optional<VerificationToken> findValidTokenByTokenAndEmail(String token, String email, LocalDateTime currentTime);
    
    // Using the existing findValidToken method at the bottom of the file

    /**
     * Find tokens by user
     */
    List<VerificationToken> findByUser(User user);

    /**
     * Find tokens by email
     */
    List<VerificationToken> findByEmail(String email);

    /**
     * Find tokens by user and token type
     */
    List<VerificationToken> findByUserAndTokenType(User user, VerificationToken.TokenType tokenType);

    /**
     * Find tokens by email and token type
     */
    List<VerificationToken> findByEmailAndTokenType(String email, VerificationToken.TokenType tokenType);

    /**
     * Find valid tokens by email and token type (not used and not expired)
     */
    @Query("{'email': ?0, 'tokenType': ?1, 'used': false, 'expiryDate': {$gt: ?2}}")
    List<VerificationToken> findValidTokensByEmailAndType(String email, VerificationToken.TokenType tokenType, LocalDateTime currentTime);

    /**
     * Find the latest valid token by email and token type
     */
    @Query(value = "{'email': ?0, 'tokenType': ?1, 'used': false, 'expiryDate': {$gt: ?2}}", 
           sort = "{'createdDate': -1}")
    Optional<VerificationToken> findLatestValidTokenByEmailAndType(String email, VerificationToken.TokenType tokenType, LocalDateTime currentTime);

    /**
     * Find expired tokens
     */
    @Query("{'expiryDate': {$lt: ?0}}")
    List<VerificationToken> findExpiredTokens(LocalDateTime currentTime);

    /**
     * Find used tokens
     */
    @Query("{'used': true}")
    List<VerificationToken> findUsedTokens();

    /**
     * Find tokens by token type
     */
    List<VerificationToken> findByTokenType(VerificationToken.TokenType tokenType);

    /**
     * Find tokens created between dates
     */
    @Query("{'createdDate': {$gte: ?0, $lte: ?1}}")
    List<VerificationToken> findTokensCreatedBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find tokens expiring soon (within specified minutes)
     */
    @Query("{'expiryDate': {$gte: ?0, $lte: ?1}, 'used': false}")
    List<VerificationToken> findTokensExpiringSoon(LocalDateTime currentTime, LocalDateTime soonTime);

    /**
     * Count tokens by type
     */
    long countByTokenType(VerificationToken.TokenType tokenType);

    /**
     * Count valid tokens by email
     */
    @Query(value = "{'email': ?0, 'used': false, 'expiryDate': {$gt: ?1}}", count = true)
    long countValidTokensByEmail(String email, LocalDateTime currentTime);

    /**
     * Count expired tokens
     */
    @Query(value = "{'expiryDate': {$lt: ?0}}", count = true)
    long countExpiredTokens(LocalDateTime currentTime);

    /**
     * Count used tokens
     */
    @Query(value = "{'used': true}", count = true)
    long countUsedTokens();

    /**
     * Check if valid token exists for email and type
     */
    @Query(value = "{'email': ?0, 'tokenType': ?1, 'used': false, 'expiryDate': {$gt: ?2}}", exists = true)
    boolean existsValidTokenByEmailAndType(String email, VerificationToken.TokenType tokenType, LocalDateTime currentTime);

    /**
     * Delete tokens by user
     */
    void deleteByUser(User user);

    /**
     * Delete tokens by email
     */
    void deleteByEmail(String email);

    /**
     * Delete expired tokens (cleanup task)
     */
    @Query("{'expiryDate': {$lt: ?0}}")
    void deleteExpiredTokens(LocalDateTime currentTime);

    /**
     * Delete used tokens older than specified date (cleanup task)
     */
    @Query("{'used': true, 'createdDate': {$lt: ?0}}")
    void deleteUsedTokensOlderThan(LocalDateTime cutoffDate);

    /**
     * Delete tokens by email and token type
     */
    void deleteByEmailAndTokenType(String email, VerificationToken.TokenType tokenType);

    /**
     * Mark all valid tokens as used for a specific email and type
     */
    @Query("{'email': ?0, 'tokenType': ?1, 'used': false, 'expiryDate': {$gt: ?2}}")
    List<VerificationToken> findValidTokensToMarkUsed(String email, VerificationToken.TokenType tokenType, LocalDateTime currentTime);

    /**
     * Find tokens that will expire in the next hour (for notification purposes)
     */
    @Query("{'expiryDate': {$gte: ?0, $lte: ?1}, 'used': false}")
    List<VerificationToken> findTokensExpiringInNextHour(LocalDateTime currentTime, LocalDateTime oneHourLater);

    /**
     * Find recently created tokens (last 24 hours)
     */
    @Query("{'createdDate': {$gte: ?0}}")
    List<VerificationToken> findRecentTokens(LocalDateTime twentyFourHoursAgo);

    /**
     * Custom method to find and validate token with all checks
     */
    @Query("{'token': ?0, 'email': ?1, 'tokenType': ?2, 'used': false, 'expiryDate': {$gt: ?3}}")
    Optional<VerificationToken> findValidToken(String token, String email, VerificationToken.TokenType tokenType, LocalDateTime currentTime);
}