package com.example.topup.demo.controller;

import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.service.UserService;
import com.example.topup.demo.service.AdminService;
import com.example.topup.demo.service.BundleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://172.20.10.3:3000", "http://172.20.10.3"}, 
    allowedHeaders = "*", 
    exposedHeaders = {"Authorization", "Content-Type"},
    allowCredentials = "true", 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    maxAge = 3600)
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private BundleService bundleService;

    /**
     * Get dashboard analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getDashboardAnalytics() {
        try {
            Map<String, Object> analytics = adminService.getDashboardAnalytics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", analytics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch analytics data");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get all users with pagination and filtering
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String accountType,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String search) {
        try {
            Map<String, Object> usersData = adminService.getAllUsers(page, size, accountType, accountStatus, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", usersData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch users");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get pending business registrations
     */
    @GetMapping("/business-registrations")
    public ResponseEntity<?> getPendingBusinessRegistrations() {
        try {
            List<Map<String, Object>> businessRegistrations = adminService.getPendingBusinessRegistrations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", businessRegistrations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch business registrations");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Approve business user
     */
    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<?> approveBusinessUser(@PathVariable String userId) {
        try {
            boolean success = adminService.approveBusinessUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "User approved successfully" : "Failed to approve user");
            
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to approve user: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Reject business user
     */
    @PostMapping("/users/{userId}/reject")
    public ResponseEntity<?> rejectBusinessUser(@PathVariable String userId, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            boolean success = adminService.rejectBusinessUser(userId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "User rejected successfully" : "Failed to reject user");
            
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to reject user: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update user status
     */
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable String userId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            boolean success = adminService.updateUserStatus(userId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "User status updated successfully" : "Failed to update user status");
            
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update user status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get user details
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable String userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            Map<String, Object> userDetails = adminService.getUserDetails(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userDetails);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch user details");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get enquiries/support tickets
     */
    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        try {
            Map<String, Object> enquiriesData = adminService.getEnquiries(page, size, status, priority);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", enquiriesData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch enquiries");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update enquiry status
     */
    @PutMapping("/enquiries/{enquiryId}/status")
    public ResponseEntity<?> updateEnquiryStatus(@PathVariable String enquiryId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String assignedAgent = request.get("assignedAgent");
            String notes = request.get("notes");
            
            boolean success = adminService.updateEnquiryStatus(enquiryId, status, assignedAgent, notes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Enquiry updated successfully" : "Failed to update enquiry");
            
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update enquiry: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get system statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getSystemStatistics() {
        try {
            Map<String, Object> statistics = adminService.getSystemStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch statistics");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Export users data
     */
    @GetMapping("/users/export")
    public ResponseEntity<?> exportUsers(@RequestParam(required = false) String format) {
        try {
            // This would generate CSV/Excel export
            byte[] exportData = adminService.exportUsersData(format);
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=users_export." + (format != null ? format : "csv"))
                .header("Content-Type", "application/octet-stream")
                .body(exportData);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to export users data");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get revenue analytics
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueAnalytics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> revenueData = adminService.getRevenueAnalytics(period, startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", revenueData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch revenue analytics");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get bundle analytics and statistics
     */
    @GetMapping("/bundle-analytics")
    public ResponseEntity<?> getBundleAnalytics() {
        try {
            Map<String, Object> bundleStats = bundleService.getBundleStatistics();
            List<Product> topBundles = bundleService.getTopSellingBundles(5);
            List<Product> allBundles = bundleService.getAllBundles();
            
            Map<String, Object> analytics = new HashMap<>();
            analytics.putAll(bundleStats);
            analytics.put("topProducts", topBundles.stream().map(bundle -> {
                Map<String, Object> bundleInfo = new HashMap<>();
                bundleInfo.put("name", bundle.getName());
                bundleInfo.put("sales", bundle.getSoldQuantity() != null ? bundle.getSoldQuantity() : 0);
                bundleInfo.put("revenue", bundle.getBasePrice().doubleValue() * (bundle.getSoldQuantity() != null ? bundle.getSoldQuantity() : 0));
                return bundleInfo;
            }).toList());
            
            // Calculate revenue by category
            Map<String, Double> revenueByCategory = new HashMap<>();
            for (Product bundle : allBundles) {
                String category = bundle.getCategory() != null ? bundle.getCategory().toString() : "OTHER";
                double revenue = bundle.getBasePrice().doubleValue() * (bundle.getSoldQuantity() != null ? bundle.getSoldQuantity() : 0);
                revenueByCategory.put(category, revenueByCategory.getOrDefault(category, 0.0) + revenue);
            }
            analytics.put("revenueByCategory", revenueByCategory);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", analytics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch bundle analytics: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}