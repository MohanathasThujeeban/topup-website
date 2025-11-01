package com.example.topup.demo.controller;

import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.RetailerLimit.CreditTransaction;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.service.RetailerLimitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/retailers")
@CrossOrigin(origins = {"http://localhost:5173", "https://topup-website-nine.vercel.app"}, allowCredentials = "true")
public class RetailerLimitController {

    @Autowired
    private RetailerLimitService retailerLimitService;

    // Get all retailer limits
    @GetMapping("/limits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllRetailerLimits() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RetailerLimit> limits = retailerLimitService.getAllRetailerLimits();
            
            response.put("success", true);
            response.put("data", limits);
            response.put("count", limits.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch retailer limits: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get retailer limit by retailer ID
    @GetMapping("/{retailerId}/limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRetailerLimit(@PathVariable String retailerId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<RetailerLimit> limit = retailerLimitService.getRetailerLimit(retailerId);
            
            if (limit.isPresent()) {
                response.put("success", true);
                response.put("data", limit.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Retailer limit not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch retailer limit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Create retailer limit
    @PostMapping("/{retailerId}/limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createRetailerLimit(
            @PathVariable String retailerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            BigDecimal creditLimit = new BigDecimal(request.get("creditLimit").toString());
            
            RetailerLimit limit = retailerLimitService.createRetailerLimit(retailerId, creditLimit, admin.getId());
            
            response.put("success", true);
            response.put("message", "Retailer limit created successfully");
            response.put("data", limit);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Retailer not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create retailer limit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update credit limit
    @PutMapping("/{retailerId}/limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateCreditLimit(
            @PathVariable String retailerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            BigDecimal newLimit = new BigDecimal(request.get("creditLimit").toString());
            String reason = request.getOrDefault("reason", "Admin adjustment").toString();
            
            RetailerLimit limit = retailerLimitService.updateCreditLimit(retailerId, newLimit, admin.getId(), reason);
            
            response.put("success", true);
            response.put("message", "Credit limit updated successfully");
            response.put("data", limit);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Retailer limit not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update credit limit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Record payment
    @PostMapping("/{retailerId}/payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> recordPayment(
            @PathVariable String retailerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.getOrDefault("description", "Payment received").toString();
            
            RetailerLimit limit = retailerLimitService.receivePayment(retailerId, amount, admin.getId(), description);
            
            response.put("success", true);
            response.put("message", "Payment recorded successfully");
            response.put("data", limit);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Retailer limit not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to record payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Process refund
    @PostMapping("/{retailerId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> processRefund(
            @PathVariable String retailerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String orderId = request.get("orderId").toString();
            String description = request.getOrDefault("description", "Refund processed").toString();
            
            RetailerLimit limit = retailerLimitService.processRefund(retailerId, amount, orderId, admin.getId(), description);
            
            response.put("success", true);
            response.put("message", "Refund processed successfully");
            response.put("data", limit);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Retailer limit not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to process refund: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update status
    @PutMapping("/{retailerId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String retailerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            String statusStr = request.get("status").toString().toUpperCase();
            RetailerLimit.LimitStatus status = RetailerLimit.LimitStatus.valueOf(statusStr);
            String reason = request.getOrDefault("reason", "Status update").toString();
            
            RetailerLimit limit = retailerLimitService.updateStatus(retailerId, status, admin.getId(), reason);
            
            response.put("success", true);
            response.put("message", "Status updated successfully");
            response.put("data", limit);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Invalid status value");
            return ResponseEntity.badRequest().body(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Retailer limit not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get transaction history
    @GetMapping("/{retailerId}/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTransactionHistory(@PathVariable String retailerId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<CreditTransaction> transactions = retailerLimitService.getTransactionHistory(retailerId);
            
            response.put("success", true);
            response.put("data", transactions);
            response.put("count", transactions.size());
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Retailer limit not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch transaction history: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get overdue retailers
    @GetMapping("/limits/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOverdueRetailers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RetailerLimit> overdueRetailers = retailerLimitService.getOverdueRetailers();
            
            response.put("success", true);
            response.put("data", overdueRetailers);
            response.put("count", overdueRetailers.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch overdue retailers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get retailers with outstanding balance
    @GetMapping("/limits/outstanding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRetailersWithOutstanding() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RetailerLimit> retailers = retailerLimitService.getRetailersWithOutstanding();
            
            response.put("success", true);
            response.put("data", retailers);
            response.put("count", retailers.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch retailers with outstanding: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get statistics
    @GetMapping("/limits/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = retailerLimitService.getRetailerLimitStatistics();
            
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Check credit availability
    @PostMapping("/{retailerId}/check-credit")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BUSINESS')")
    public ResponseEntity<Map<String, Object>> checkCredit(
            @PathVariable String retailerId,
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            boolean hasSufficient = retailerLimitService.hasSufficientCredit(retailerId, amount);
            
            response.put("success", true);
            response.put("hasSufficientCredit", hasSufficient);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to check credit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
