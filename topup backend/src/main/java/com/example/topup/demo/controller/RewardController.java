package com.example.topup.demo.controller;

import com.example.topup.demo.entity.RewardCampaign;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.service.RewardCampaignService;
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
@RequestMapping("/api/admin/rewards")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://topup-website-nine.vercel.app"}, allowCredentials = "true")
public class RewardController {

    @Autowired
    private RewardCampaignService rewardCampaignService;

    // Create reward campaign
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createCampaign(
            @Valid @RequestBody RewardCampaign campaign,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            RewardCampaign createdCampaign = rewardCampaignService.createCampaign(campaign, admin.getId());
            
            response.put("success", true);
            response.put("message", "Reward campaign created successfully");
            response.put("data", createdCampaign);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create campaign: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get all campaigns
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllCampaigns() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RewardCampaign> campaigns = rewardCampaignService.getAllCampaigns();
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch campaigns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get campaign by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCampaignById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<RewardCampaign> campaign = rewardCampaignService.getCampaignById(id);
            
            if (campaign.isPresent()) {
                response.put("success", true);
                response.put("data", campaign.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Campaign not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch campaign: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get active campaigns
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getActiveCampaigns() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RewardCampaign> campaigns = rewardCampaignService.getActiveCampaigns();
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch active campaigns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get featured campaigns (public endpoint)
    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeaturedCampaigns() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RewardCampaign> campaigns = rewardCampaignService.getFeaturedCampaigns();
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch featured campaigns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get referral campaigns
    @GetMapping("/referral")
    public ResponseEntity<Map<String, Object>> getReferralCampaigns() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RewardCampaign> campaigns = rewardCampaignService.getReferralCampaigns();
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch referral campaigns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get campaigns by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCampaignsByStatus(@PathVariable String status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            RewardCampaign.CampaignStatus campaignStatus = RewardCampaign.CampaignStatus.valueOf(status.toUpperCase());
            List<RewardCampaign> campaigns = rewardCampaignService.getCampaignsByStatus(campaignStatus);
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Invalid status value");
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch campaigns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update campaign
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateCampaign(
            @PathVariable String id,
            @Valid @RequestBody RewardCampaign campaign,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User admin = (User) authentication.getPrincipal();
            RewardCampaign updatedCampaign = rewardCampaignService.updateCampaign(id, campaign, admin.getId());
            
            response.put("success", true);
            response.put("message", "Campaign updated successfully");
            response.put("data", updatedCampaign);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Campaign not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update campaign: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete campaign
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteCampaign(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            rewardCampaignService.deleteCampaign(id);
            
            response.put("success", true);
            response.put("message", "Campaign deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Campaign not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete campaign: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Toggle campaign status
    @PostMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleCampaignStatus(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            RewardCampaign campaign = rewardCampaignService.toggleCampaignStatus(id);
            
            response.put("success", true);
            response.put("message", "Campaign status toggled successfully");
            response.put("data", campaign);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Campaign not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to toggle campaign status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Calculate reward
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateReward(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) request.get("userId");
            BigDecimal orderValue = new BigDecimal(request.get("orderValue").toString());
            
            @SuppressWarnings("unchecked")
            List<String> productIds = request.get("productIds") != null ? 
                    (List<String>) request.get("productIds") : new ArrayList<>();
            
            Map<String, Object> result = rewardCampaignService.calculateReward(userId, orderValue, productIds);
            
            response.put("success", true);
            response.put("data", result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to calculate reward: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get campaign statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCampaignStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = rewardCampaignService.getCampaignStatistics();
            
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get campaigns for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> getCampaignsForProduct(@PathVariable String productId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RewardCampaign> campaigns = rewardCampaignService.getCampaignsForProduct(productId);
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch campaigns for product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get campaigns for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getCampaignsForUser(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<RewardCampaign> campaigns = rewardCampaignService.getCampaignsForUser(userId);
            
            response.put("success", true);
            response.put("data", campaigns);
            response.put("count", campaigns.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch campaigns for user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Process referral reward
    @PostMapping("/referral/process")
    public ResponseEntity<Map<String, Object>> processReferralReward(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String campaignId = (String) request.get("campaignId");
            String referrerId = (String) request.get("referrerId");
            String refereeId = (String) request.get("refereeId");
            
            Map<String, Object> result = rewardCampaignService.processReferralReward(campaignId, referrerId, refereeId);
            
            response.put("success", true);
            response.put("data", result);
            return ResponseEntity.ok(response);
            
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", "Campaign not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to process referral reward: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
