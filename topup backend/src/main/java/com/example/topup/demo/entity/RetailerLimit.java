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

@Document(collection = "retailer_limits")
public class RetailerLimit {

    @Id
    private String id;

    @DBRef
    @Indexed(unique = true)
    private User retailer;

    @NotNull(message = "Credit limit is required")
    @DecimalMin(value = "0.0", message = "Credit limit must be non-negative")
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Available credit must be non-negative")
    private BigDecimal availableCredit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Used credit must be non-negative")
    private BigDecimal usedCredit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Outstanding amount must be non-negative")
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Min(value = 1, message = "Payment terms must be at least 1 day")
    @Max(value = 365, message = "Payment terms cannot exceed 365 days")
    private Integer paymentTermsDays = 30; // Default 30 days

    private LocalDateTime lastPaymentDate;
    private LocalDateTime nextDueDate;

    @Indexed
    private LimitStatus status = LimitStatus.ACTIVE;

    private boolean autoRenewal = false;
    private LocalDateTime renewalDate;

    // Credit history
    private List<CreditTransaction> transactions = new ArrayList<>();

    // Alert settings
    private BigDecimal lowCreditThreshold; // Alert when credit falls below this
    private boolean sendLowCreditAlert = true;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy; // Admin who set the limit
    private String lastModifiedBy;

    // Enums
    public enum LimitStatus {
        ACTIVE,
        SUSPENDED,
        BLOCKED,
        PENDING_REVIEW
    }

    // Nested class for credit transactions
    public static class CreditTransaction {
        private String transactionId;
        private TransactionType type;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private LocalDateTime transactionDate;
        private String description;
        private String referenceOrderId;
        private String processedBy; // Admin or system

        public enum TransactionType {
            CREDIT_INCREASE,
            CREDIT_DECREASE,
            PAYMENT_RECEIVED,
            ORDER_PLACED,
            REFUND,
            ADJUSTMENT
        }

        public CreditTransaction() {}

        public CreditTransaction(TransactionType type, BigDecimal amount, BigDecimal balanceAfter, String description) {
            this.type = type;
            this.amount = amount;
            this.balanceAfter = balanceAfter;
            this.description = description;
            this.transactionDate = LocalDateTime.now();
            this.transactionId = generateTransactionId();
        }

        private String generateTransactionId() {
            return "TXN" + System.currentTimeMillis();
        }

        // Getters and Setters
        public String getTransactionId() {
            return transactionId;
        }

        public void setTransactionId(String transactionId) {
            this.transactionId = transactionId;
        }

        public TransactionType getType() {
            return type;
        }

        public void setType(TransactionType type) {
            this.type = type;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public BigDecimal getBalanceAfter() {
            return balanceAfter;
        }

        public void setBalanceAfter(BigDecimal balanceAfter) {
            this.balanceAfter = balanceAfter;
        }

        public LocalDateTime getTransactionDate() {
            return transactionDate;
        }

        public void setTransactionDate(LocalDateTime transactionDate) {
            this.transactionDate = transactionDate;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getReferenceOrderId() {
            return referenceOrderId;
        }

        public void setReferenceOrderId(String referenceOrderId) {
            this.referenceOrderId = referenceOrderId;
        }

        public String getProcessedBy() {
            return processedBy;
        }

        public void setProcessedBy(String processedBy) {
            this.processedBy = processedBy;
        }
    }

    // Constructors
    public RetailerLimit() {}

    public RetailerLimit(User retailer, BigDecimal creditLimit) {
        this.retailer = retailer;
        this.creditLimit = creditLimit;
        this.availableCredit = creditLimit;
        this.usedCredit = BigDecimal.ZERO;
        this.outstandingAmount = BigDecimal.ZERO;
        calculateNextDueDate();
    }

    // Business Logic Methods
    public boolean hasAvailableCredit(BigDecimal amount) {
        return availableCredit.compareTo(amount) >= 0;
    }

    public void useCredit(BigDecimal amount, String orderId, String description) {
        if (!hasAvailableCredit(amount)) {
            throw new IllegalStateException("Insufficient credit available");
        }

        this.usedCredit = this.usedCredit.add(amount);
        this.availableCredit = this.availableCredit.subtract(amount);
        this.outstandingAmount = this.outstandingAmount.add(amount);

        // Record transaction
        CreditTransaction transaction = new CreditTransaction(
            CreditTransaction.TransactionType.ORDER_PLACED,
            amount,
            this.availableCredit,
            description
        );
        transaction.setReferenceOrderId(orderId);
        this.transactions.add(transaction);

        // Check if alert should be sent
        if (sendLowCreditAlert && lowCreditThreshold != null &&
            availableCredit.compareTo(lowCreditThreshold) <= 0) {
            // Alert logic can be implemented here or in service
        }
    }

    public void receivePayment(BigDecimal amount, String processedBy, String description) {
        this.outstandingAmount = this.outstandingAmount.subtract(amount);
        if (this.outstandingAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.outstandingAmount = BigDecimal.ZERO;
        }

        this.availableCredit = this.creditLimit.subtract(this.outstandingAmount);
        this.lastPaymentDate = LocalDateTime.now();
        calculateNextDueDate();

        // Record transaction
        CreditTransaction transaction = new CreditTransaction(
            CreditTransaction.TransactionType.PAYMENT_RECEIVED,
            amount,
            this.availableCredit,
            description
        );
        transaction.setProcessedBy(processedBy);
        this.transactions.add(transaction);
    }

    public void adjustCreditLimit(BigDecimal newLimit, String adminId, String reason) {
        BigDecimal difference = newLimit.subtract(this.creditLimit);
        this.creditLimit = newLimit;
        this.availableCredit = this.creditLimit.subtract(this.outstandingAmount);

        // Record transaction
        CreditTransaction transaction = new CreditTransaction(
            difference.compareTo(BigDecimal.ZERO) > 0 ? 
                CreditTransaction.TransactionType.CREDIT_INCREASE :
                CreditTransaction.TransactionType.CREDIT_DECREASE,
            difference.abs(),
            this.availableCredit,
            reason
        );
        transaction.setProcessedBy(adminId);
        this.transactions.add(transaction);
    }

    public void refundCredit(BigDecimal amount, String orderId, String processedBy, String description) {
        this.usedCredit = this.usedCredit.subtract(amount);
        if (this.usedCredit.compareTo(BigDecimal.ZERO) < 0) {
            this.usedCredit = BigDecimal.ZERO;
        }

        this.outstandingAmount = this.outstandingAmount.subtract(amount);
        if (this.outstandingAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.outstandingAmount = BigDecimal.ZERO;
        }

        this.availableCredit = this.creditLimit.subtract(this.outstandingAmount);

        // Record transaction
        CreditTransaction transaction = new CreditTransaction(
            CreditTransaction.TransactionType.REFUND,
            amount,
            this.availableCredit,
            description
        );
        transaction.setReferenceOrderId(orderId);
        transaction.setProcessedBy(processedBy);
        this.transactions.add(transaction);
    }

    private void calculateNextDueDate() {
        if (paymentTermsDays != null) {
            this.nextDueDate = LocalDateTime.now().plusDays(paymentTermsDays);
        }
    }

    public boolean isOverdue() {
        return nextDueDate != null && LocalDateTime.now().isAfter(nextDueDate) &&
               outstandingAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public BigDecimal getCreditUtilizationPercentage() {
        if (creditLimit.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return usedCredit.divide(creditLimit, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getRetailer() {
        return retailer;
    }

    public void setRetailer(User retailer) {
        this.retailer = retailer;
    }

    public BigDecimal getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(BigDecimal creditLimit) {
        this.creditLimit = creditLimit;
    }

    public BigDecimal getAvailableCredit() {
        return availableCredit;
    }

    public void setAvailableCredit(BigDecimal availableCredit) {
        this.availableCredit = availableCredit;
    }

    public BigDecimal getUsedCredit() {
        return usedCredit;
    }

    public void setUsedCredit(BigDecimal usedCredit) {
        this.usedCredit = usedCredit;
    }

    public BigDecimal getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(BigDecimal outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    public Integer getPaymentTermsDays() {
        return paymentTermsDays;
    }

    public void setPaymentTermsDays(Integer paymentTermsDays) {
        this.paymentTermsDays = paymentTermsDays;
    }

    public LocalDateTime getLastPaymentDate() {
        return lastPaymentDate;
    }

    public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
    }

    public LocalDateTime getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDateTime nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public LimitStatus getStatus() {
        return status;
    }

    public void setStatus(LimitStatus status) {
        this.status = status;
    }

    public boolean isAutoRenewal() {
        return autoRenewal;
    }

    public void setAutoRenewal(boolean autoRenewal) {
        this.autoRenewal = autoRenewal;
    }

    public LocalDateTime getRenewalDate() {
        return renewalDate;
    }

    public void setRenewalDate(LocalDateTime renewalDate) {
        this.renewalDate = renewalDate;
    }

    public List<CreditTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<CreditTransaction> transactions) {
        this.transactions = transactions;
    }

    public BigDecimal getLowCreditThreshold() {
        return lowCreditThreshold;
    }

    public void setLowCreditThreshold(BigDecimal lowCreditThreshold) {
        this.lowCreditThreshold = lowCreditThreshold;
    }

    public boolean isSendLowCreditAlert() {
        return sendLowCreditAlert;
    }

    public void setSendLowCreditAlert(boolean sendLowCreditAlert) {
        this.sendLowCreditAlert = sendLowCreditAlert;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }
}
