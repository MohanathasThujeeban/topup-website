package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Document(collection = "business_details")
public class BusinessDetails {

    @Id
    private String id;

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String companyName;

    @NotBlank(message = "Organization number is required")
    @Pattern(regexp = "\\d{9}", message = "Organization number must be exactly 9 digits")
    @Indexed(unique = true)
    private String organizationNumber;

    @Pattern(regexp = "\\d{12}", message = "VAT number must be exactly 12 digits")
    private String vatNumber;

    @NotBlank(message = "Company email is required")
    @Email(message = "Please provide a valid company email address")
    private String companyEmail;

    @Valid
    private Address postalAddress;

    @Valid
    private Address billingAddress;

    @Indexed
    private VerificationMethod verificationMethod = VerificationMethod.MANUAL;

    @Indexed
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String bankIdToken;
    private LocalDateTime bankIdVerificationTime;
    private String adminNotes;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    // Constructors
    public BusinessDetails() {}

    public BusinessDetails(String companyName, String organizationNumber, String vatNumber, 
                          String companyEmail, Address postalAddress, Address billingAddress) {
        this.companyName = companyName;
        this.organizationNumber = organizationNumber;
        this.vatNumber = vatNumber;
        this.companyEmail = companyEmail;
        this.postalAddress = postalAddress;
        this.billingAddress = billingAddress;
        this.verificationStatus = VerificationStatus.PENDING;
        this.verificationMethod = VerificationMethod.MANUAL;
    }

    // Verification Method Enum
    public enum VerificationMethod {
        BANK_ID, MANUAL
    }

    // Verification Status Enum
    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        REQUIRES_REVIEW
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getOrganizationNumber() {
        return organizationNumber;
    }

    public void setOrganizationNumber(String organizationNumber) {
        this.organizationNumber = organizationNumber;
    }

    public String getVatNumber() {
        return vatNumber;
    }

    public void setVatNumber(String vatNumber) {
        this.vatNumber = vatNumber;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public Address getPostalAddress() {
        return postalAddress;
    }

    public void setPostalAddress(Address postalAddress) {
        this.postalAddress = postalAddress;
    }

    public Address getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(Address billingAddress) {
        this.billingAddress = billingAddress;
    }

    public VerificationMethod getVerificationMethod() {
        return verificationMethod;
    }

    public void setVerificationMethod(VerificationMethod verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getBankIdToken() {
        return bankIdToken;
    }

    public void setBankIdToken(String bankIdToken) {
        this.bankIdToken = bankIdToken;
    }

    public LocalDateTime getBankIdVerificationTime() {
        return bankIdVerificationTime;
    }

    public void setBankIdVerificationTime(LocalDateTime bankIdVerificationTime) {
        this.bankIdVerificationTime = bankIdVerificationTime;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    // Utility Methods
    public boolean isPending() {
        return verificationStatus == VerificationStatus.PENDING;
    }

    public boolean isVerified() {
        return verificationStatus == VerificationStatus.VERIFIED;
    }

    public boolean isRejected() {
        return verificationStatus == VerificationStatus.REJECTED;
    }

    public boolean requiresReview() {
        return verificationStatus == VerificationStatus.REQUIRES_REVIEW;
    }

    public boolean isBankIdVerification() {
        return verificationMethod == VerificationMethod.BANK_ID;
    }

    public boolean isManualVerification() {
        return verificationMethod == VerificationMethod.MANUAL;
    }

    public void approve() {
        this.verificationStatus = VerificationStatus.VERIFIED;
    }

    public void reject(String adminNotes) {
        this.verificationStatus = VerificationStatus.REJECTED;
        this.adminNotes = adminNotes;
    }

    public void markForReview(String adminNotes) {
        this.verificationStatus = VerificationStatus.REQUIRES_REVIEW;
        this.adminNotes = adminNotes;
    }

    public void completeBankIdVerification(String bankIdToken) {
        this.verificationMethod = VerificationMethod.BANK_ID;
        this.bankIdToken = bankIdToken;
        this.bankIdVerificationTime = LocalDateTime.now();
        this.verificationStatus = VerificationStatus.VERIFIED;
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "BusinessDetails{" +
                "id='" + id + '\'' +
                ", companyName='" + companyName + '\'' +
                ", organizationNumber='" + organizationNumber + '\'' +
                ", verificationStatus=" + verificationStatus +
                ", verificationMethod=" + verificationMethod +
                ", createdDate=" + createdDate +
                '}';
    }
}