package com.example.topup.demo.controller;

import com.example.topup.demo.entity.Promotion;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/promotions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://topup-website-nine.vercel.app", "https://topup-website-gmoj.vercel.app"}, allowCredentials = "true")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    // Create a new promotion
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPromotion(
            @Valid @RequestBody Promotion promotion,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Handle case where authentication is null (development/testing)
            String adminId = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User admin = (User) authentication.getPrincipal();
                adminId = admin.getId();
            }
            
            Promotion createdPromotion = promotionService.createPromotion(promotion, adminId);
            
            response.put("success", true);
            response.put("message", "Promotion created successfully");
            response.put("data", createdPromotion);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create promotion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get all promotions
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPromotions() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Promotion> promotions = promotionService.getAllPromotions();
            
            response.put("success", true);
            response.put("data", promotions);
            response.put("count", promotions.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch promotions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get promotion by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPromotionById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Promotion> promotion = promotionService.getPromotionById(id);
            
            if (promotion.isPresent()) {
                response.put("success", true);
                response.put("data", promotion.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Promotion not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch promotion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get active promotions
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActivePromotions() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Promotion> promotions = promotionService.getActivePromotions();
            
            response.put("success", true);
            response.put("data", promotions);
            response.put("count", promotions.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch active promotions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get featured promotions (public endpoint)
    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeaturedPromotions() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Promotion> promotions = promotionService.getFeaturedPromotions();
            
            response.put("success", true);
            response.put("data", promotions);
            response.put("count", promotions.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch featured promotions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get promotions by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPromotionsByStatus(@PathVariable String status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Promotion.PromotionStatus promotionStatus = Promotion.PromotionStatus.valueOf(status.toUpperCase());
            List<Promotion> promotions = promotionService.getPromotionsByStatus(promotionStatus);
            
            response.put("success", true);
            response.put("data", promotions);
            response.put("count", promotions.size());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Invalid status value");
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch promotions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update promotion
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updatePromotion(
            @PathVariable String id,
            @Valid @RequestBody Promotion promotion,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            Promotion updatedPromotion = promotionService.updatePromotion(id, promotion, admin.getId());
            
            response.put("success", true);
            response.put("message", "Promotion updated successfully");
            response.put("data", updatedPromotion);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Promotion not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update promotion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete promotion
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletePromotion(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            promotionService.deletePromotion(id);
            
            response.put("success", true);
            response.put("message", "Promotion deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Promotion not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete promotion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Toggle promotion status (activate/deactivate)
    @PostMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> togglePromotionStatus(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Promotion promotion = promotionService.togglePromotionStatus(id);
            
            response.put("success", true);
            response.put("message", "Promotion status toggled successfully");
            response.put("data", promotion);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Promotion not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to toggle promotion status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Validate promo code
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePromoCode(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String promoCode = (String) request.get("promoCode");
            String userId = (String) request.get("userId");
            BigDecimal orderValue = new BigDecimal(request.get("orderValue").toString());
            
            @SuppressWarnings("unchecked")
            List<String> productIds = request.get("productIds") != null ? 
                    (List<String>) request.get("productIds") : new ArrayList<>();
            
            Map<String, Object> validation = promotionService.validatePromoCode(promoCode, userId, orderValue, productIds);
            
            response.put("success", validation.get("valid"));
            response.put("message", validation.get("message"));
            response.put("data", validation);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to validate promo code: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get promotion statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPromotionStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = promotionService.getPromotionStatistics();
            
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get promotions for a specific product
    @GetMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> getPromotionsForProduct(@PathVariable String productId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Promotion> promotions = promotionService.getPromotionsForProduct(productId);
            
            response.put("success", true);
            response.put("data", promotions);
            response.put("count", promotions.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch promotions for product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
