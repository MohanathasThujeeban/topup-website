package com.example.topup.demo.service;

import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.RetailerLimit.CreditTransaction;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.repository.RetailerLimitRepository;
import com.example.topup.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RetailerLimitService {

    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Create or initialize retailer limit
    @Transactional
    public RetailerLimit createRetailerLimit(String retailerId, BigDecimal creditLimit, String adminId) {
        User retailer = userRepository.findById(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer not found"));

        if (retailer.getAccountType() != User.AccountType.BUSINESS) {
            throw new IllegalArgumentException("User is not a business account");
        }

        Optional<RetailerLimit> existing = retailerLimitRepository.findByRetailer_Id(retailerId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Retailer limit already exists");
        }

        RetailerLimit limit = new RetailerLimit(retailer, creditLimit);
        limit.setCreatedBy(adminId);
        limit.setLastModifiedBy(adminId);
        
        return retailerLimitRepository.save(limit);
    }

    // Get retailer limit by retailer ID
    public Optional<RetailerLimit> getRetailerLimit(String retailerId) {
        return retailerLimitRepository.findByRetailer_Id(retailerId);
    }

    // Get all retailer limits
    public List<RetailerLimit> getAllRetailerLimits() {
        return retailerLimitRepository.findAll();
    }

    // Update credit limit
    @Transactional
    public RetailerLimit updateCreditLimit(String retailerId, BigDecimal newLimit, String adminId, String reason) {
        RetailerLimit limit = retailerLimitRepository.findByRetailer_Id(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer limit not found"));

        limit.adjustCreditLimit(newLimit, adminId, reason);
        limit.setLastModifiedBy(adminId);
        
        RetailerLimit saved = retailerLimitRepository.save(limit);
        
        // Send notification email
        try {
            String retailerEmail = limit.getRetailer().getEmail();
            String subject = "Credit Limit Updated";
            String message = String.format(
                "Your credit limit has been updated to $%s. Reason: %s",
                newLimit.toString(), reason
            );
            emailService.sendEmail(retailerEmail, subject, message);
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to send credit limit update email: " + e.getMessage());
        }
        
        return saved;
    }

    // Use credit for an order
    @Transactional
    public void useCredit(String retailerId, BigDecimal amount, String orderId, String description) {
        RetailerLimit limit = retailerLimitRepository.findByRetailer_Id(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer limit not found"));

        if (limit.getStatus() != RetailerLimit.LimitStatus.ACTIVE) {
            throw new IllegalStateException("Retailer credit limit is not active");
        }

        limit.useCredit(amount, orderId, description);
        retailerLimitRepository.save(limit);

        // Check if low credit alert needed
        if (limit.isSendLowCreditAlert() && 
            limit.getLowCreditThreshold() != null &&
            limit.getAvailableCredit().compareTo(limit.getLowCreditThreshold()) <= 0) {
            sendLowCreditAlert(limit);
        }
    }

    // Receive payment
    @Transactional
    public RetailerLimit receivePayment(String retailerId, BigDecimal amount, String adminId, String description) {
        RetailerLimit limit = retailerLimitRepository.findByRetailer_Id(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer limit not found"));

        limit.receivePayment(amount, adminId, description);
        RetailerLimit saved = retailerLimitRepository.save(limit);
        
        // Send payment confirmation email
        try {
            String retailerEmail = limit.getRetailer().getEmail();
            String subject = "Payment Received";
            String message = String.format(
                "We have received your payment of $%s. Your available credit is now $%s.",
                amount.toString(), limit.getAvailableCredit().toString()
            );
            emailService.sendEmail(retailerEmail, subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
        }
        
        return saved;
    }

    // Process refund
    @Transactional
    public RetailerLimit processRefund(String retailerId, BigDecimal amount, String orderId, String adminId, String description) {
        RetailerLimit limit = retailerLimitRepository.findByRetailer_Id(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer limit not found"));

        limit.refundCredit(amount, orderId, adminId, description);
        return retailerLimitRepository.save(limit);
    }

    // Update retailer limit status
    @Transactional
    public RetailerLimit updateStatus(String retailerId, RetailerLimit.LimitStatus newStatus, String adminId, String reason) {
        RetailerLimit limit = retailerLimitRepository.findByRetailer_Id(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer limit not found"));

        limit.setStatus(newStatus);
        limit.setLastModifiedBy(adminId);
        
        // Add a transaction record for status change
        CreditTransaction transaction = new CreditTransaction(
            CreditTransaction.TransactionType.ADJUSTMENT,
            BigDecimal.ZERO,
            limit.getAvailableCredit(),
            "Status changed to " + newStatus + ": " + reason
        );
        transaction.setProcessedBy(adminId);
        limit.getTransactions().add(transaction);
        
        RetailerLimit saved = retailerLimitRepository.save(limit);
        
        // Send status change notification
        try {
            String retailerEmail = limit.getRetailer().getEmail();
            String subject = "Credit Limit Status Changed";
            String message = String.format(
                "Your credit limit status has been changed to %s. Reason: %s",
                newStatus.toString(), reason
            );
            emailService.sendEmail(retailerEmail, subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send status change email: " + e.getMessage());
        }
        
        return saved;
    }

    // Get retailers with low credit
    public List<RetailerLimit> getRetailersNeedingCreditAlert() {
        return retailerLimitRepository.findRetailersNeedingCreditAlert();
    }

    // Get overdue retailers
    public List<RetailerLimit> getOverdueRetailers() {
        return retailerLimitRepository.findOverdueRetailers(LocalDateTime.now());
    }

    // Get retailers with outstanding balance
    public List<RetailerLimit> getRetailersWithOutstanding() {
        return retailerLimitRepository.findRetailersWithOutstandingBalance();
    }

    // Get statistics
    public Map<String, Object> getRetailerLimitStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalRetailers = retailerLimitRepository.count();
        long activeRetailers = retailerLimitRepository.countByStatus(RetailerLimit.LimitStatus.ACTIVE);
        long suspendedRetailers = retailerLimitRepository.countByStatus(RetailerLimit.LimitStatus.SUSPENDED);
        long overdueRetailers = retailerLimitRepository.findOverdueRetailers(LocalDateTime.now()).size();
        long withOutstanding = retailerLimitRepository.countRetailersWithOutstanding();

        List<RetailerLimit> allLimits = retailerLimitRepository.findAll();
        
        BigDecimal totalCreditLimit = allLimits.stream()
                .map(RetailerLimit::getCreditLimit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalAvailableCredit = allLimits.stream()
                .map(RetailerLimit::getAvailableCredit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalOutstanding = allLimits.stream()
                .map(RetailerLimit::getOutstandingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalRetailers", totalRetailers);
        stats.put("activeRetailers", activeRetailers);
        stats.put("suspendedRetailers", suspendedRetailers);
        stats.put("overdueRetailers", overdueRetailers);
        stats.put("retailersWithOutstanding", withOutstanding);
        stats.put("totalCreditLimit", totalCreditLimit);
        stats.put("totalAvailableCredit", totalAvailableCredit);
        stats.put("totalOutstanding", totalOutstanding);
        stats.put("creditUtilization", calculateOverallUtilization(totalCreditLimit, totalAvailableCredit));

        // Top retailers by credit usage
        List<Map<String, Object>> topRetailers = allLimits.stream()
                .sorted((l1, l2) -> l2.getUsedCredit().compareTo(l1.getUsedCredit()))
                .limit(10)
                .map(limit -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("retailerId", limit.getRetailer().getId());
                    data.put("retailerName", limit.getRetailer().getFirstName() + " " + limit.getRetailer().getLastName());
                    data.put("email", limit.getRetailer().getEmail());
                    data.put("creditLimit", limit.getCreditLimit());
                    data.put("usedCredit", limit.getUsedCredit());
                    data.put("availableCredit", limit.getAvailableCredit());
                    data.put("outstanding", limit.getOutstandingAmount());
                    data.put("utilization", limit.getCreditUtilizationPercentage());
                    return data;
                })
                .collect(Collectors.toList());

        stats.put("topRetailers", topRetailers);

        return stats;
    }

    private BigDecimal calculateOverallUtilization(BigDecimal totalLimit, BigDecimal available) {
        if (totalLimit.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal used = totalLimit.subtract(available);
        return used.divide(totalLimit, 4, java.math.RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(100));
    }

    // Send low credit alert
    private void sendLowCreditAlert(RetailerLimit limit) {
        try {
            String retailerEmail = limit.getRetailer().getEmail();
            String subject = "Low Credit Alert";
            String message = String.format(
                "Your available credit ($%s) has fallen below the threshold ($%s). " +
                "Please make a payment to continue using our services.",
                limit.getAvailableCredit().toString(),
                limit.getLowCreditThreshold().toString()
            );
            emailService.sendEmail(retailerEmail, subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send low credit alert: " + e.getMessage());
        }
    }

    // Scheduled task to check overdue payments
    @Scheduled(cron = "0 0 9 * * *") // Run daily at 9 AM
    public void checkOverduePayments() {
        List<RetailerLimit> overdueRetailers = getOverdueRetailers();
        
        for (RetailerLimit limit : overdueRetailers) {
            try {
                String retailerEmail = limit.getRetailer().getEmail();
                String subject = "Payment Overdue";
                String message = String.format(
                    "Your payment of $%s is overdue as of %s. " +
                    "Please make a payment immediately to avoid service suspension.",
                    limit.getOutstandingAmount().toString(),
                    limit.getNextDueDate().toString()
                );
                emailService.sendEmail(retailerEmail, subject, message);
                
                // Auto-suspend if overdue for more than 30 days
                if (LocalDateTime.now().isAfter(limit.getNextDueDate().plusDays(30))) {
                    limit.setStatus(RetailerLimit.LimitStatus.SUSPENDED);
                    retailerLimitRepository.save(limit);
                }
            } catch (Exception e) {
                System.err.println("Failed to process overdue retailer " + 
                    limit.getRetailer().getId() + ": " + e.getMessage());
            }
        }
    }

    // Scheduled task to send low credit alerts
    @Scheduled(cron = "0 0 10 * * *") // Run daily at 10 AM
    public void sendLowCreditAlerts() {
        List<RetailerLimit> retailersNeedingAlert = getRetailersNeedingCreditAlert();
        
        for (RetailerLimit limit : retailersNeedingAlert) {
            sendLowCreditAlert(limit);
        }
    }

    // Get transaction history for a retailer
    public List<CreditTransaction> getTransactionHistory(String retailerId) {
        RetailerLimit limit = retailerLimitRepository.findByRetailer_Id(retailerId)
                .orElseThrow(() -> new NoSuchElementException("Retailer limit not found"));
        
        List<CreditTransaction> transactions = new ArrayList<>(limit.getTransactions());
        transactions.sort((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()));
        return transactions;
    }

    // Check if retailer has sufficient credit
    public boolean hasSufficientCredit(String retailerId, BigDecimal amount) {
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
        if (limitOpt.isEmpty()) {
            return false;
        }
        
        RetailerLimit limit = limitOpt.get();
        return limit.getStatus() == RetailerLimit.LimitStatus.ACTIVE &&
               limit.hasAvailableCredit(amount);
    }
}
