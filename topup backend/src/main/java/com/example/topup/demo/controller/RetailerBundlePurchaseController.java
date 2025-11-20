package com.example.topup.demo.controller;

import com.example.topup.demo.dto.RetailerCreditLevel;
import com.example.topup.demo.dto.RetailerPurchaseRequest;
import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.service.RetailerPurchaseService;
import com.example.topup.demo.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/retailer")
// Temporarily disabled authentication for development
// @PreAuthorize("hasRole('BUSINESS')")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:5173", "https://topup.neirahtech.com", "https://topup-website-beta.vercel.app", "https://topup-website-gmoj.vercel.app"})
public class RetailerBundlePurchaseController {

    @Autowired
    private RetailerPurchaseService retailerPurchaseService;

    @Autowired
    private UserService userService;

    // Get available bundles for purchase
    @GetMapping("/bundles")
    public ResponseEntity<?> getAvailableBundles(Authentication authentication) {
        try {
            // For development without authentication, just return all bundles
            List<Product> bundles = retailerPurchaseService.getAvailableBundles();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bundles", bundles);
            response.put("count", bundles.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch bundles: " + e.getMessage()));
        }
    }

    // Get credit levels
    @GetMapping("/credit-levels")
    public ResponseEntity<?> getCreditLevels(Authentication authentication) {
        try {
            // Get first BUSINESS user for development
            User retailer = getRetailerForDevelopment(authentication);
            List<RetailerCreditLevel> levels = retailerPurchaseService.getRetailerCreditLevels(retailer.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("levels", levels);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch credit levels: " + e.getMessage()));
        }
    }

    // Get credit status
    @GetMapping("/credit-status")
    public ResponseEntity<?> getCreditStatus(Authentication authentication) {
        try {
            User retailer = getRetailerForDevelopment(authentication);
            Map<String, Object> status = retailerPurchaseService.getRetailerCreditStatus(retailer.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", status);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch credit status: " + e.getMessage()));
        }
    }

    // Purchase bundles
    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseBundles(
            @Valid @RequestBody RetailerPurchaseRequest request,
            Authentication authentication) {
        try {
            User retailer = getRetailerForDevelopment(authentication);
            Map<String, Object> result = retailerPurchaseService.purchaseBundles(retailer.getId(), request);
            
            return ResponseEntity.ok(result);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Purchase failed: " + e.getMessage()));
        }
    }

    // Get retailer inventory (purchased items)
    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory(Authentication authentication) {
        try {
            User retailer = getRetailerForDevelopment(authentication);
            Map<String, Object> inventory = retailerPurchaseService.getRetailerInventory(retailer.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", inventory);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Log the full error for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch inventory: " + e.getMessage()));
        } catch (Exception e) {
            // Log the full error for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch inventory: " + e.getMessage()));
        }
    }

    // Clear retailer inventory (delete completed orders)
    @DeleteMapping("/inventory/clear")
    public ResponseEntity<?> clearInventory(Authentication authentication) {
        try {
            User retailer = getRetailerForDevelopment(authentication);
            int deletedCount = retailerPurchaseService.clearRetailerInventory(retailer.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Inventory cleared successfully");
            response.put("deletedOrders", deletedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to clear inventory: " + e.getMessage()));
        }
    }
    
    // Create sample inventory (development only)
    @PostMapping("/inventory/create-sample")
    public ResponseEntity<?> createSampleInventory(Authentication authentication) {
        try {
            User retailer = getRetailerForDevelopment(authentication);
            Map<String, Object> result = retailerPurchaseService.createSampleInventory(retailer.getId());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to create sample inventory: " + e.getMessage()));
        }
    }
    
    // Helper method for development - gets first BUSINESS user or creates one
    private User getRetailerForDevelopment(Authentication authentication) {
        // Try to get user from authentication if available
        if (authentication != null && authentication.getName() != null) {
            return userService.findByEmail(authentication.getName())
                    .orElseGet(this::getFirstBusinessUser);
        }
        
        // Otherwise get first BUSINESS user
        return getFirstBusinessUser();
    }
    
    private User getFirstBusinessUser() {
        try {
            // Find first user with BUSINESS account type
            return userService.findByAccountType(User.AccountType.BUSINESS)
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No BUSINESS user found. Please create a retailer account first."));
        } catch (Exception e) {
            System.err.println("❌ Error finding business user: " + e.getMessage());
            throw new RuntimeException("Failed to find retailer user: " + e.getMessage(), e);
        }
    }

    // Process direct sale to customer and generate ePINs
    @PostMapping("/direct-sale")
    public ResponseEntity<?> processDirectSale(@Valid @RequestBody com.example.topup.demo.dto.DirectSaleRequest request, Authentication authentication) {
        try {
            System.out.println("🔍 Attempting to get retailer for development");
            User retailer = getRetailerForDevelopment(authentication);
            System.out.println("✅ Found retailer: " + (retailer != null ? retailer.getEmail() : "null"));
            
            System.out.println("🛒 Processing direct sale for retailer: " + retailer.getEmail());
            System.out.println("📦 Bundle: " + request.getBundleName());
            System.out.println("👤 Customer: " + request.getCustomerName());
            System.out.println("📱 Phone: " + request.getCustomerPhone());
            System.out.println("🔢 Quantity: " + request.getQuantity());
            System.out.println("💰 Unit Price: NOK " + request.getUnitPrice());
            System.out.println("💰 Total: NOK " + request.getTotalAmount());
            
            // Validate request
            if (request.getUnitPrice() == null || request.getUnitPrice() <= 0) {
                throw new IllegalArgumentException("Invalid unit price: " + request.getUnitPrice());
            }
            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid quantity: " + request.getQuantity());
            }
            if (request.getBundleName() == null || request.getBundleName().trim().isEmpty()) {
                throw new IllegalArgumentException("Bundle name is required");
            }
            
            // Process the direct sale - this will validate inventory and remove PINs
            Map<String, Object> saleResult = retailerPurchaseService.processDirectSale(
                retailer.getId(), 
                request.getBundleName(), 
                request.getQuantity(), 
                java.math.BigDecimal.valueOf(request.getUnitPrice())
            );
            
            java.util.List<Map<String, Object>> allocatedPins = (java.util.List<Map<String, Object>>) saleResult.get("soldPins");
            
            // Add customer and sale information to each PIN
            for (Map<String, Object> pin : allocatedPins) {
                pin.put("customerName", request.getCustomerName());
                pin.put("saleDate", java.time.LocalDateTime.now().toString());
                pin.put("retailerName", retailer.getFullName());
                pin.put("status", "SOLD");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", saleResult.get("message"));
            response.put("data", Map.of(
                "pins", allocatedPins,
                "saleId", saleResult.get("saleId"),
                "customerName", request.getCustomerName(),
                "customerPhone", request.getCustomerPhone(),
                "bundleName", request.getBundleName(),
                "quantity", request.getQuantity(),
                "totalAmount", request.getTotalAmount(),
                "saleDate", java.time.LocalDateTime.now().toString()
            ));
            
            System.out.println("✅ Direct sale completed successfully");
            System.out.println("🎫 Allocated " + allocatedPins.size() + " existing PINs from inventory");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error processing direct sale: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to process direct sale: " + e.getMessage()));
        }
    }

    // Helper method to get user from authentication
    private User getUserFromAuthentication(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        String email = authentication.getName();
        if (email == null) {
            throw new RuntimeException("User email not found in authentication token");
        }
        
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
