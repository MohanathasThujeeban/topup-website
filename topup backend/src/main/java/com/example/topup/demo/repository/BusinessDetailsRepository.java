package com.example.topup.demo.repository;

import com.example.topup.demo.entity.BusinessDetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessDetailsRepository extends MongoRepository<BusinessDetails, String> {

    /**
     * Find business details by organization number (unique)
     */
    Optional<BusinessDetails> findByOrganizationNumber(String organizationNumber);

    /**
     * Check if organization number exists
     */
    boolean existsByOrganizationNumber(String organizationNumber);

    /**
     * Find business details by VAT number
     */
    Optional<BusinessDetails> findByVatNumber(String vatNumber);

    /**
     * Check if VAT number exists
     */
    boolean existsByVatNumber(String vatNumber);

    /**
     * Find business details by company email
     */
    Optional<BusinessDetails> findByCompanyEmail(String companyEmail);

    /**
     * Find businesses by verification status
     */
    List<BusinessDetails> findByVerificationStatus(BusinessDetails.VerificationStatus verificationStatus);

    /**
     * Find businesses by verification method
     */
    List<BusinessDetails> findByVerificationMethod(BusinessDetails.VerificationMethod verificationMethod);

    /**
     * Find businesses by verification status and method
     */
    List<BusinessDetails> findByVerificationStatusAndVerificationMethod(
        BusinessDetails.VerificationStatus verificationStatus,
        BusinessDetails.VerificationMethod verificationMethod);

    /**
     * Find pending businesses (awaiting approval)
     */
    @Query("{'verificationStatus': 'PENDING'}")
    List<BusinessDetails> findPendingBusinesses();

    /**
     * Find verified businesses
     */
    @Query("{'verificationStatus': 'VERIFIED'}")
    List<BusinessDetails> findVerifiedBusinesses();

    /**
     * Find rejected businesses
     */
    @Query("{'verificationStatus': 'REJECTED'}")
    List<BusinessDetails> findRejectedBusinesses();

    /**
     * Find businesses requiring review
     */
    @Query("{'verificationStatus': 'REQUIRES_REVIEW'}")
    List<BusinessDetails> findBusinessesRequiringReview();

    /**
     * Find businesses by company name (case-insensitive partial match)
     */
    @Query("{'companyName': {$regex: ?0, $options: 'i'}}")
    List<BusinessDetails> findByCompanyNameContainingIgnoreCase(String companyName);

    /**
     * Find businesses created between dates
     */
    @Query("{'createdDate': {$gte: ?0, $lte: ?1}}")
    List<BusinessDetails> findBusinessesCreatedBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find businesses with BankID verification
     */
    @Query("{'verificationMethod': 'BANK_ID'}")
    List<BusinessDetails> findBankIdVerifiedBusinesses();

    /**
     * Find businesses with manual verification
     */
    @Query("{'verificationMethod': 'MANUAL'}")
    List<BusinessDetails> findManuallyVerifiedBusinesses();

    /**
     * Find businesses with BankID token
     */
    @Query("{'bankIdToken': {$exists: true, $ne: null}}")
    List<BusinessDetails> findBusinessesWithBankIdToken();

    /**
     * Find businesses verified within date range
     */
    @Query("{'verificationStatus': 'VERIFIED', 'lastModifiedDate': {$gte: ?0, $lte: ?1}}")
    List<BusinessDetails> findBusinessesVerifiedBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find businesses by postal address city
     */
    @Query("{'postalAddress.city': {$regex: ?0, $options: 'i'}}")
    List<BusinessDetails> findByPostalAddressCity(String city);

    /**
     * Find businesses by postal address country
     */
    @Query("{'postalAddress.country': {$regex: ?0, $options: 'i'}}")
    List<BusinessDetails> findByPostalAddressCountry(String country);

    /**
     * Find businesses by postal address postal code
     */
    @Query("{'postalAddress.postalCode': ?0}")
    List<BusinessDetails> findByPostalAddressPostalCode(String postalCode);

    /**
     * Count businesses by verification status
     */
    long countByVerificationStatus(BusinessDetails.VerificationStatus verificationStatus);

    /**
     * Count businesses by verification method
     */
    long countByVerificationMethod(BusinessDetails.VerificationMethod verificationMethod);

    /**
     * Count pending businesses
     */
    @Query(value = "{'verificationStatus': 'PENDING'}", count = true)
    long countPendingBusinesses();

    /**
     * Count verified businesses
     */
    @Query(value = "{'verificationStatus': 'VERIFIED'}", count = true)
    long countVerifiedBusinesses();

    /**
     * Count rejected businesses
     */
    @Query(value = "{'verificationStatus': 'REJECTED'}", count = true)
    long countRejectedBusinesses();

    /**
     * Count businesses requiring review
     */
    @Query(value = "{'verificationStatus': 'REQUIRES_REVIEW'}", count = true)
    long countBusinessesRequiringReview();

    /**
     * Find businesses with admin notes
     */
    @Query("{'adminNotes': {$exists: true, $ne: null, $ne: ''}}")
    List<BusinessDetails> findBusinessesWithAdminNotes();

    /**
     * Find recently registered businesses (last 7 days)
     */
    @Query("{'createdDate': {$gte: ?0}}")
    List<BusinessDetails> findRecentlyRegisteredBusinesses(LocalDateTime sevenDaysAgo);

    /**
     * Find businesses pending approval for more than specified days
     */
    @Query("{'verificationStatus': 'PENDING', 'createdDate': {$lt: ?0}}")
    List<BusinessDetails> findLongPendingBusinesses(LocalDateTime cutoffDate);

    /**
     * Find businesses by organization number pattern (for search)
     */
    @Query("{'organizationNumber': {$regex: ?0}}")
    List<BusinessDetails> findByOrganizationNumberPattern(String pattern);

    /**
     * Find businesses by VAT number pattern (for search)
     */
    @Query("{'vatNumber': {$regex: ?0}}")
    List<BusinessDetails> findByVatNumberPattern(String pattern);

    /**
     * Custom aggregation queries for complex business reporting
     */
    
    /**
     * Find businesses that need follow-up (pending for more than X days)
     */
    @Query("{'verificationStatus': {$in: ['PENDING', 'REQUIRES_REVIEW']}, 'createdDate': {$lt: ?0}}")
    List<BusinessDetails> findBusinessesNeedingFollowUp(LocalDateTime thresholdDate);

    /**
     * Delete businesses with specific status older than specified date (cleanup)
     */
    @Query("{'verificationStatus': ?0, 'createdDate': {$lt: ?1}}")
    void deleteByVerificationStatusAndCreatedDateBefore(BusinessDetails.VerificationStatus status, LocalDateTime cutoffDate);
}