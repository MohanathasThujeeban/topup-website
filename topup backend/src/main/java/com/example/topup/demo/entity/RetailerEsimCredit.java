package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity to store eSIM credit limits for retailers.
 * This is stored in a separate collection from RetailerLimit for better separation of concerns.
 */
@Document(collection = "retailer_esim_credits")
public class RetailerEsimCredit {

    @Id
    private String id;

    @DBRef
    @Indexed(unique = true)
    private User retailer;

    // eSIM Credit Limit Management
    @DecimalMin(value = "0.0", message = "eSIM credit limit must be non-negative")
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "eSIM available credit must be non-negative")
    private BigDecimal availableCredit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "eSIM used credit must be non-negative")
    private BigDecimal usedCredit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "eSIM outstanding amount must be non-negative")
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Min(value = 1, message = "Payment terms must be at least 1 day")
    @Max(value = 365, message = "Payment terms cannot exceed 365 days")
    private Integer paymentTermsDays = 30;

    @Indexed
    private LimitStatus status = LimitStatus.ACTIVE;

    private boolean autoRenewal = false;
    private LocalDateTime renewalDate;

    // Transaction history for eSIM credits
    private List<EsimCreditTransaction> transactions = new ArrayList<>();

    // Alert settings
    private BigDecimal lowCreditThreshold;
    private boolean sendLowCreditAlert = true;

    private String notes;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy;
    private String lastModifiedBy;

    // Enums
    public enum LimitStatus {
        ACTIVE,
        SUSPENDED,
        BLOCKED,
        PENDING_REVIEW
    }

    // Nested class for eSIM credit transactions
    public static class EsimCreditTransaction {
        private String transactionId;
        private TransactionType type;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private LocalDateTime transactionDate;
        private String description;
        private String referenceOrderId;
        private String processedBy;

        public enum TransactionType {
            CREDIT_INCREASE,
            CREDIT_DECREASE,
            PAYMENT_RECEIVED,
            ESIM_SALE,
            REFUND,
            ADJUSTMENT
        }

        public EsimCreditTransaction() {}

        public EsimCreditTransaction(TransactionType type, BigDecimal amount, BigDecimal balanceAfter, String description) {
            this.type = type;
            this.amount = amount;
            this.balanceAfter = balanceAfter;
            this.description = description;
            this.transactionDate = LocalDateTime.now();
            this.transactionId = generateTransactionId();
        }

        private String generateTransactionId() {
            return "ESIM-TXN-" + System.currentTimeMillis();
        }

        // Getters and Setters
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public TransactionType getType() { return type; }
        public void setType(TransactionType type) { this.type = type; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public BigDecimal getBalanceAfter() { return balanceAfter; }
        public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
        public LocalDateTime getTransactionDate() { return transactionDate; }
        public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getReferenceOrderId() { return referenceOrderId; }
        public void setReferenceOrderId(String referenceOrderId) { this.referenceOrderId = referenceOrderId; }
        public String getProcessedBy() { return processedBy; }
        public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
    }

    // Default constructor
    public RetailerEsimCredit() {}

    // Constructor with retailer
    public RetailerEsimCredit(User retailer) {
        this.retailer = retailer;
        this.creditLimit = BigDecimal.ZERO;
        this.availableCredit = BigDecimal.ZERO;
        this.usedCredit = BigDecimal.ZERO;
        this.outstandingAmount = BigDecimal.ZERO;
        this.status = LimitStatus.ACTIVE;
    }

    // Business methods
    public boolean hasAvailableCredit(BigDecimal amount) {
        BigDecimal available = this.availableCredit != null ? this.availableCredit : BigDecimal.ZERO;
        return available.compareTo(amount) >= 0;
    }

    public void useCredit(BigDecimal amount, String orderId, String description) {
        // Initialize null fields to prevent NullPointerException
        if (this.usedCredit == null) {
            this.usedCredit = BigDecimal.ZERO;
        }
        if (this.availableCredit == null) {
            this.availableCredit = this.creditLimit != null ? this.creditLimit : BigDecimal.ZERO;
        }

        if (!hasAvailableCredit(amount)) {
            throw new IllegalStateException("Insufficient eSIM credit available. Required: " + amount + ", Available: " + this.availableCredit);
        }

        this.usedCredit = this.usedCredit.add(amount);
        this.availableCredit = this.availableCredit.subtract(amount);

        // Record transaction
        EsimCreditTransaction transaction = new EsimCreditTransaction(
            EsimCreditTransaction.TransactionType.ESIM_SALE,
            amount,
            this.availableCredit,
            description
        );
        transaction.setReferenceOrderId(orderId);
        this.transactions.add(transaction);
    }

    public void adjustCreditLimit(BigDecimal newLimit, String adminId, String reason) {
        // Initialize null fields
        if (this.creditLimit == null) {
            this.creditLimit = BigDecimal.ZERO;
        }
        if (this.usedCredit == null) {
            this.usedCredit = BigDecimal.ZERO;
        }

        BigDecimal difference = newLimit.subtract(this.creditLimit);
        this.creditLimit = newLimit;
        this.availableCredit = this.creditLimit.subtract(this.usedCredit);

        // Record transaction
        EsimCreditTransaction transaction = new EsimCreditTransaction(
            difference.compareTo(BigDecimal.ZERO) > 0 ?
                EsimCreditTransaction.TransactionType.CREDIT_INCREASE :
                EsimCreditTransaction.TransactionType.CREDIT_DECREASE,
            difference.abs(),
            this.availableCredit,
            reason
        );
        transaction.setProcessedBy(adminId);
        this.transactions.add(transaction);
    }

    public void addPayment(BigDecimal amount, String processedBy, String description) {
        if (this.usedCredit == null) {
            this.usedCredit = BigDecimal.ZERO;
        }
        if (this.availableCredit == null) {
            this.availableCredit = this.creditLimit != null ? this.creditLimit : BigDecimal.ZERO;
        }

        this.usedCredit = this.usedCredit.subtract(amount);
        if (this.usedCredit.compareTo(BigDecimal.ZERO) < 0) {
            this.usedCredit = BigDecimal.ZERO;
        }
        this.availableCredit = this.creditLimit.subtract(this.usedCredit);

        EsimCreditTransaction transaction = new EsimCreditTransaction(
            EsimCreditTransaction.TransactionType.PAYMENT_RECEIVED,
            amount,
            this.availableCredit,
            description
        );
        transaction.setProcessedBy(processedBy);
        this.transactions.add(transaction);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getRetailer() { return retailer; }
    public void setRetailer(User retailer) { this.retailer = retailer; }

    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }

    public BigDecimal getAvailableCredit() { return availableCredit; }
    public void setAvailableCredit(BigDecimal availableCredit) { this.availableCredit = availableCredit; }

    public BigDecimal getUsedCredit() { return usedCredit; }
    public void setUsedCredit(BigDecimal usedCredit) { this.usedCredit = usedCredit; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }

    public Integer getPaymentTermsDays() { return paymentTermsDays; }
    public void setPaymentTermsDays(Integer paymentTermsDays) { this.paymentTermsDays = paymentTermsDays; }

    public LimitStatus getStatus() { return status; }
    public void setStatus(LimitStatus status) { this.status = status; }

    public boolean isAutoRenewal() { return autoRenewal; }
    public void setAutoRenewal(boolean autoRenewal) { this.autoRenewal = autoRenewal; }

    public LocalDateTime getRenewalDate() { return renewalDate; }
    public void setRenewalDate(LocalDateTime renewalDate) { this.renewalDate = renewalDate; }

    public List<EsimCreditTransaction> getTransactions() { return transactions; }
    public void setTransactions(List<EsimCreditTransaction> transactions) { this.transactions = transactions; }

    public BigDecimal getLowCreditThreshold() { return lowCreditThreshold; }
    public void setLowCreditThreshold(BigDecimal lowCreditThreshold) { this.lowCreditThreshold = lowCreditThreshold; }

    public boolean isSendLowCreditAlert() { return sendLowCreditAlert; }
    public void setSendLowCreditAlert(boolean sendLowCreditAlert) { this.sendLowCreditAlert = sendLowCreditAlert; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDateTime lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
}
