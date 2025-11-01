package com.example.topup.demo.controller;

import com.example.topup.demo.service.AdminService;
import com.example.topup.demo.dto.RetailerCreditLimitDTO;
import com.example.topup.demo.dto.UpdateCreditLimitRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://topup.neirahtech.com"}, allowCredentials = "true")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Test endpoint to verify admin controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "AdminController is working");
        response.put("timestamp", new Date());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all users with pagination and filtering
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String accountType,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String search) {
        
        try {
            Map<String, Object> usersData = adminService.getAllUsers(page, size, accountType, accountStatus, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", usersData);
            response.put("message", "Users fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get pending business registrations
     */
    @GetMapping("/business-registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingBusinessRegistrations() {
        try {
            List<Map<String, Object>> businessRegistrations = adminService.getPendingBusinessRegistrations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", businessRegistrations);
            response.put("message", "Business registrations fetched successfully");
            response.put("count", businessRegistrations.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch business registrations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Approve business user
     */
    @PostMapping("/users/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveBusinessUser(@PathVariable String userId) {
        try {
            boolean success = adminService.approveBusinessUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "Business user approved successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "User not found or already approved");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to approve user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Reject business user
     */
    @PostMapping("/users/{userId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectBusinessUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "Administrative decision") String reason) {
        try {
            boolean success = adminService.rejectBusinessUser(userId, reason);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "Business user rejected successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to reject user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get admin analytics/statistics
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        try {
            Map<String, Object> analytics = adminService.getDashboardAnalytics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", analytics);
            response.put("message", "Analytics fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch analytics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get customer enquiries
     */
    @GetMapping("/enquiries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getEnquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        try {
            // For now, return empty array - implement this when ContactService is ready
            Map<String, Object> enquiriesData = new HashMap<>();
            enquiriesData.put("enquiries", new ArrayList<>());
            enquiriesData.put("totalElements", 0);
            enquiriesData.put("totalPages", 0);
            enquiriesData.put("currentPage", page);
            enquiriesData.put("size", size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", enquiriesData);
            response.put("message", "Enquiries fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch enquiries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get all retailers with their credit limits
     */
    @GetMapping("/retailers/credit-limits")
    public ResponseEntity<Map<String, Object>> getAllRetailerCreditLimits() {
        try {
            List<RetailerCreditLimitDTO> retailers = adminService.getAllRetailersWithCreditLimits();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", retailers);
            response.put("count", retailers.size());
            response.put("message", "Retailer credit limits fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch retailer credit limits: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get specific retailer's credit limit
     */
    @GetMapping("/retailers/{retailerId}/credit-limit")
    public ResponseEntity<Map<String, Object>> getRetailerCreditLimit(@PathVariable String retailerId) {
        try {
            RetailerCreditLimitDTO retailerLimit = adminService.getRetailerCreditLimit(retailerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", retailerLimit);
            response.put("message", "Retailer credit limit fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Update retailer credit limit
     */
    @PostMapping("/retailers/credit-limit")
    public ResponseEntity<Map<String, Object>> updateRetailerCreditLimit(
            @Valid @RequestBody UpdateCreditLimitRequest request) {
        try {
            RetailerCreditLimitDTO updatedLimit = adminService.updateRetailerCreditLimit(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedLimit);
            response.put("message", "Credit limit updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
