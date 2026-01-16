package com.example.topup.demo.controller;

import com.example.topup.demo.service.AdminService;
import com.example.topup.demo.dto.RetailerCreditLimitDTO;
import com.example.topup.demo.dto.UpdateCreditLimitRequest;
import com.example.topup.demo.dto.UpdateUnitLimitRequest;
import com.example.topup.demo.dto.UpdateMarginRateRequest;
import com.example.topup.demo.dto.UpdateKickbackLimitRequest;
import com.example.topup.demo.dto.RetailerKickbackLimitDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://topup.neirahtech.com", "https://topup-website-gmoj.vercel.app"}, allowCredentials = "true")
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

    /**
     * Update retailer unit limit specifically
     */
    @PostMapping("/retailers/unit-limit")
    public ResponseEntity<Map<String, Object>> updateRetailerUnitLimit(
            @Valid @RequestBody UpdateUnitLimitRequest request) {
        try {
            RetailerCreditLimitDTO updatedLimit = adminService.updateRetailerUnitLimit(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedLimit);
            response.put("message", "Unit limit updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update retailer eSIM credit limit specifically
     */
    @PostMapping("/retailers/esim-credit-limit")
    public ResponseEntity<Map<String, Object>> updateRetailerEsimCreditLimit(
            @Valid @RequestBody com.example.topup.demo.dto.UpdateEsimCreditLimitRequest request) {
        try {
            RetailerCreditLimitDTO updatedLimit = adminService.updateRetailerEsimCreditLimit(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedLimit);
            response.put("message", "eSIM credit limit updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Set retailer margin rate (Test version without auth)
     */
    @PostMapping("/retailers/margin-rate-test")
    public ResponseEntity<Map<String, Object>> setRetailerMarginRateTest(@RequestBody UpdateMarginRateRequest request) {
        try {
            adminService.updateRetailerMarginRate(request.getRetailerEmail(), request.getMarginRate());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Margin rate updated successfully (test mode)");
            response.put("retailerEmail", request.getRetailerEmail());
            response.put("marginRate", request.getMarginRate());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Set retailer margin rate
     */
    @PostMapping("/retailers/margin-rate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> setRetailerMarginRate(@Valid @RequestBody UpdateMarginRateRequest request) {
        try {
            adminService.updateRetailerMarginRate(
                request.getRetailerEmail(), 
                request.getMarginRate(),
                request.getProductId(),
                request.getProductName(),
                request.getPoolName()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Margin rate updated successfully for product");
            response.put("retailerEmail", request.getRetailerEmail());
            response.put("marginRate", request.getMarginRate());
            response.put("productName", request.getProductName());
            response.put("poolName", request.getPoolName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get retailer margin rate (Test version without auth)
     */
    @GetMapping("/retailers/{retailerEmail}/margin-rate-test")
    public ResponseEntity<Map<String, Object>> getRetailerMarginRateTest(@PathVariable String retailerEmail) {
        try {
            Double marginRate = adminService.getRetailerMarginRate(retailerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("marginRate", marginRate);
            response.put("retailerEmail", retailerEmail);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get retailer margin rate
     */
    @GetMapping("/retailers/{retailerEmail}/margin-rate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRetailerMarginRate(@PathVariable String retailerEmail) {
        try {
            Double marginRate = adminService.getRetailerMarginRate(retailerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("marginRate", marginRate);
            response.put("isSet", marginRate != null);
            response.put("retailerEmail", retailerEmail);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all product-specific margin rates for a retailer
     */
    @GetMapping("/retailers/{retailerEmail}/margin-rates/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllRetailerProductMarginRates(@PathVariable String retailerEmail) {
        try {
            List<Map<String, Object>> productMarginRates = adminService.getAllRetailerProductMarginRates(retailerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("productMarginRates", productMarginRates);
            response.put("totalProducts", productMarginRates.size());
            response.put("retailerEmail", retailerEmail);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get retailer purchase history
     */
    @GetMapping("/retailers/{retailerEmail}/purchase-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRetailerPurchaseHistory(@PathVariable String retailerEmail) {
        try {
            // This would be implemented in the service layer
            // For now, return empty history
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("purchases", new ArrayList<>());
            response.put("totalAmount", 0.0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user details with purchases and usage
     */
    @GetMapping("/users/{userId}/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserDetails(@PathVariable String userId) {
        try {
            Map<String, Object> userDetails = adminService.getUserDetails(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userDetails);
            response.put("message", "User details fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch user details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Suspend user account
     */
    @PostMapping("/users/{userId}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> suspendUser(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String reason = requestBody != null ? requestBody.get("reason") : "Account suspended by admin";
            boolean success = adminService.suspendUser(userId, reason);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "User suspended successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to suspend user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to suspend user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Activate user account
     */
    @PostMapping("/users/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> activateUser(@PathVariable String userId) {
        try {
            boolean success = adminService.activateUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "User activated successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to activate user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to activate user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update user details (email and phone)
     */
    @PutMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable String userId,
            @RequestBody Map<String, String> updateData) {
        try {
            String newEmail = updateData.get("email");
            String newMobileNumber = updateData.get("mobileNumber");
            
            boolean success = adminService.updateUserDetails(userId, newEmail, newMobileNumber);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "User updated successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to update user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to update user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete user account
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        try {
            boolean success = adminService.deleteUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "User deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to delete user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Send invoice email to retailer
     */
    @PostMapping("/send-invoice-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendInvoiceEmail(@RequestBody Map<String, Object> request) {
        try {
            String retailerEmail = (String) request.get("retailerEmail");
            String retailerName = (String) request.get("retailerName");
            String invoiceNumber = (String) request.get("invoiceNumber");
            String invoiceDate = (String) request.get("invoiceDate");
            String dueDate = (String) request.get("dueDate");
            
            Object creditLimitObj = request.get("creditLimit");
            Object usedCreditObj = request.get("usedCredit");
            Object creditUsagePercentageObj = request.get("creditUsagePercentage");
            Object totalAmountObj = request.get("totalAmount");
            
            Double creditLimit = creditLimitObj instanceof Number ? ((Number) creditLimitObj).doubleValue() : 0.0;
            Double usedCredit = usedCreditObj instanceof Number ? ((Number) usedCreditObj).doubleValue() : 0.0;
            Double creditUsagePercentage = creditUsagePercentageObj instanceof Number ? ((Number) creditUsagePercentageObj).doubleValue() : 0.0;
            Double totalAmount = totalAmountObj instanceof Number ? ((Number) totalAmountObj).doubleValue() : usedCredit;
            
            String level = (String) request.getOrDefault("level", "ENTRY");
            
            boolean sent = adminService.sendInvoiceEmail(
                retailerEmail,
                retailerName,
                invoiceNumber,
                invoiceDate,
                dueDate,
                creditLimit,
                usedCredit,
                creditUsagePercentage,
                totalAmount,
                level
            );
            
            Map<String, Object> response = new HashMap<>();
            if (sent) {
                response.put("success", true);
                response.put("message", "Invoice email sent successfully to " + retailerEmail);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to send invoice email");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error sending invoice: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get retailer's sales details (orders with eSIM and ePIN information)
     */
    @GetMapping("/retailers/{retailerId}/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRetailerSales(@PathVariable String retailerId) {
        try {
            Map<String, Object> salesData = adminService.getRetailerSalesDetails(retailerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", salesData);
            response.put("message", "Retailer sales details fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch retailer sales: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get eSIM sales analytics
     * Includes total eSIMs sold, total earnings, and sales history with details
     */
    @GetMapping("/analytics/esim-sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getEsimSalesAnalytics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String retailerId) {
        try {
            Map<String, Object> esimAnalytics = adminService.getEsimSalesAnalytics(startDate, endDate, retailerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", esimAnalytics);
            response.put("message", "eSIM sales analytics fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch eSIM analytics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get detailed eSIM sales history with pagination
     */
    @GetMapping("/analytics/esim-sales/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getEsimSalesHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String retailerId,
            @RequestParam(required = false) String productType) {
        try {
            Map<String, Object> salesHistory = adminService.getEsimSalesHistory(page, size, startDate, endDate, retailerId, productType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", salesHistory);
            response.put("message", "eSIM sales history fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch eSIM sales history: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all retailers with their kickback limits
     */
    @GetMapping("/retailers/kickback-limits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllRetailerKickbackLimits() {
        try {
            List<RetailerKickbackLimitDTO> kickbackLimits = adminService.getAllRetailersWithKickbackLimits();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", kickbackLimits);
            response.put("count", kickbackLimits.size());
            response.put("message", "Retailer kickback limits fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch retailer kickback limits: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get specific retailer's kickback limit
     */
    @GetMapping("/retailers/{retailerId}/kickback-limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRetailerKickbackLimit(@PathVariable String retailerId) {
        try {
            RetailerKickbackLimitDTO kickbackLimit = adminService.getRetailerKickbackLimit(retailerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", kickbackLimit);
            response.put("message", "Retailer kickback limit fetched successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update retailer kickback limit
     */
    @PostMapping("/retailers/kickback-limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateRetailerKickbackLimit(
            @Valid @RequestBody UpdateKickbackLimitRequest request) {
        try {
            RetailerKickbackLimitDTO updatedLimit = adminService.updateRetailerKickbackLimit(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedLimit);
            response.put("message", "Kickback limit updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
