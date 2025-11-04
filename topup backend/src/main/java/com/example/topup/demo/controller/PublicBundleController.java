package com.example.topup.demo.controller;

import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.repository.StockPoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/bundles")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:5173", "https://topup.neirahtech", "https://topup-website-beta.vercel.app"}, 
    allowCredentials = "true",
    allowedHeaders = {"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"},
    methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
public class PublicBundleController {

    @Autowired
    private StockPoolRepository stockPoolRepository;

    /**
     * Get all active stock pools (eSIMs/ePINs) for customers
     * Reads directly from stock_pools collection
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllActiveStockPools(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        
        try {
            // Get active stock pools only
            List<StockPool> stockPools = stockPoolRepository.findByStatus(StockPool.StockStatus.ACTIVE);
            
            // Filter by type if specified (ESIM, EPIN)
            if (type != null && !type.trim().isEmpty()) {
                String typeUpper = type.toUpperCase();
                stockPools = stockPools.stream()
                        .filter(sp -> sp.getStockType() != null && sp.getStockType().toString().equals(typeUpper))
                        .collect(Collectors.toList());
            }
            
            // Filter by search term if specified
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                stockPools = stockPools.stream()
                        .filter(sp -> (sp.getName() != null && sp.getName().toLowerCase().contains(searchLower)) ||
                                     (sp.getDescription() != null && sp.getDescription().toLowerCase().contains(searchLower)))
                        .collect(Collectors.toList());
            }
            
            // Transform to bundle format for frontend
            List<Map<String, Object>> bundles = stockPools.stream()
                    .map(sp -> {
                        Map<String, Object> bundle = new HashMap<>();
                        bundle.put("id", sp.getId());
                        bundle.put("name", sp.getName());
                        bundle.put("description", sp.getDescription());
                        bundle.put("productType", sp.getStockType() != null ? sp.getStockType().toString() : "ESIM");
                        bundle.put("basePrice", 99.00); // Default price
                        bundle.put("stockQuantity", sp.getAvailableQuantity());
                        bundle.put("availableQuantity", sp.getAvailableQuantity());
                        bundle.put("totalQuantity", sp.getTotalQuantity());
                        bundle.put("usedQuantity", sp.getUsedQuantity());
                        bundle.put("dataAmount", "1GB"); // Can be parsed from description
                        bundle.put("validity", "30 days");
                        bundle.put("hasStock", sp.getAvailableQuantity() > 0);
                        bundle.put("status", sp.getStatus().toString());
                        bundle.put("featured", false);
                        bundle.put("discountPercentage", 0);
                        
                        // Create metadata with features
                        Map<String, String> metadata = new HashMap<>();
                        metadata.put("feature_0", "Unlimited national minutes");
                        metadata.put("feature_1", "100* Minutes to United Kingdom and more");
                        metadata.put("feature_2", "1GB EU Roaming Data");
                        metadata.put("feature_3", "eSIM available");
                        bundle.put("metadata", metadata);
                        
                        return bundle;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bundles", bundles);
            response.put("totalCount", bundles.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to fetch bundles: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get a single stock pool by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getStockPoolById(@PathVariable String id) {
        try {
            StockPool stockPool = stockPoolRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Stock pool not found"));
            
            // Only return if active
            if (stockPool.getStatus() != StockPool.StockStatus.ACTIVE) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Bundle not available");
                return ResponseEntity.status(404).body(error);
            }
            
            // Transform to bundle format
            Map<String, Object> bundle = new HashMap<>();
            bundle.put("id", stockPool.getId());
            bundle.put("name", stockPool.getName());
            bundle.put("description", stockPool.getDescription());
            bundle.put("productType", stockPool.getStockType() != null ? stockPool.getStockType().toString() : "ESIM");
            bundle.put("basePrice", 99.00);
            bundle.put("stockQuantity", stockPool.getAvailableQuantity());
            bundle.put("availableQuantity", stockPool.getAvailableQuantity());
            bundle.put("dataAmount", "1GB");
            bundle.put("validity", "30 days");
            bundle.put("hasStock", stockPool.getAvailableQuantity() > 0);
            bundle.put("discountPercentage", 0);
            
            Map<String, String> metadata = new HashMap<>();
            metadata.put("feature_0", "Unlimited national minutes");
            metadata.put("feature_1", "100* Minutes to United Kingdom and more");
            metadata.put("feature_2", "1GB EU Roaming Data");
            metadata.put("feature_3", "eSIM available");
            bundle.put("metadata", metadata);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bundle", bundle);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Bundle not found: " + e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
}
