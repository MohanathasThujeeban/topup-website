package com.example.topup.demo.controller;

import com.example.topup.demo.entity.Product;
import com.example.topup.demo.service.BundleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bundles")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:5173", "https://topup.neirahtech"}, 
    allowCredentials = "true",
    allowedHeaders = {"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class BundleController {

    @Autowired
    private BundleService bundleService;
    
    // Simple test endpoint to verify controller is loaded
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "BundleController is working");
        response.put("timestamp", new Date());
        return ResponseEntity.ok(response);
    }

    // Get all bundles
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllBundles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Product.ProductStatus status,
            @RequestParam(required = false) Product.Category category,
            @RequestParam(required = false) Product.ProductType type) {
        
        try {
            List<Product> bundles;
            
            if (search != null && !search.trim().isEmpty()) {
                bundles = bundleService.searchBundles(search);
            } else if (status != null) {
                bundles = bundleService.getBundlesByStatus(status);
            } else if (category != null) {
                bundles = bundleService.getBundlesByCategory(category);
            } else if (type != null) {
                bundles = bundleService.getBundlesByType(type);
            } else {
                bundles = bundleService.getAllBundles();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("bundles", bundles);
            response.put("totalCount", bundles.size());
            response.put("page", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch bundles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get bundle by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBundleById(@PathVariable String id) {
        try {
            Product bundle = bundleService.getBundleById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bundle", bundle);
            response.put("wholesalePrice", bundleService.calculateWholesalePrice(
                bundle.getBasePrice(), bundle.getRetailerCommissionPercentage()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Bundle not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Create new bundle
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createBundle(@Valid @RequestBody Product bundle) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("DEBUG: Received bundle creation request for: " + bundle.getName());
            System.out.println("DEBUG: Bundle type: " + bundle.getProductType());
            System.out.println("DEBUG: Bundle price: " + bundle.getBasePrice());
            
            // Set created by (in real app, get from security context)
            bundle.setCreatedBy("admin");
            bundle.setLastModifiedBy("admin");
            
            Product createdBundle = bundleService.createBundle(bundle);
            
            System.out.println("DEBUG: Bundle created successfully with ID: " + createdBundle.getId());
            
            response.put("success", true);
            response.put("bundle", createdBundle);
            response.put("message", "Bundle created successfully");
            response.put("wholesalePrice", bundleService.calculateWholesalePrice(
                createdBundle.getBasePrice(), createdBundle.getRetailerCommissionPercentage()));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to create bundle: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", "Failed to create bundle: " + e.getMessage());
            response.put("errorType", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update bundle
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateBundle(@PathVariable String id, @Valid @RequestBody Product bundle) {
        try {
            bundle.setLastModifiedBy("admin"); // In real app, get from security context
            Product updatedBundle = bundleService.updateBundle(id, bundle);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bundle", updatedBundle);
            response.put("message", "Bundle updated successfully");
            response.put("wholesalePrice", bundleService.calculateWholesalePrice(
                updatedBundle.getBasePrice(), updatedBundle.getRetailerCommissionPercentage()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update bundle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Delete bundle
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteBundle(@PathVariable String id) {
        try {
            bundleService.deleteBundle(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bundle deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete bundle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Bulk import bundles
    @PostMapping("/bulk-import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkImportBundles(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "File is empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only CSV and Excel files are supported");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            List<Product> importedBundles = bundleService.bulkImportBundles(file, "admin");
            
            Map<String, Object> response = new HashMap<>();
            response.put("importedBundles", importedBundles);
            response.put("totalImported", importedBundles.size());
            response.put("message", "Successfully imported " + importedBundles.size() + " bundles");
            
            // Calculate summary statistics
            double totalValue = importedBundles.stream()
                    .mapToDouble(b -> b.getBasePrice().doubleValue())
                    .sum();
            double totalWholesaleValue = importedBundles.stream()
                    .mapToDouble(b -> bundleService.calculateWholesalePrice(
                        b.getBasePrice(), b.getRetailerCommissionPercentage()).doubleValue())
                    .sum();
            
            response.put("totalValue", totalValue);
            response.put("totalWholesaleValue", totalWholesaleValue);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to import bundles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get bundle statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBundleStatistics() {
        try {
            Map<String, Object> statistics = bundleService.getBundleStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get top selling bundles
    @GetMapping("/top-selling")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTopSellingBundles(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Product> topBundles = bundleService.getTopSellingBundles(limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("topBundles", topBundles);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch top selling bundles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update bundle stock
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateBundleStock(@PathVariable String id, @RequestBody Map<String, Integer> stockUpdate) {
        try {
            Integer newStock = stockUpdate.get("stock");
            if (newStock == null || newStock < 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid stock value");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Product updatedBundle = bundleService.updateBundleStock(id, newStock);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bundle", updatedBundle);
            response.put("message", "Stock updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update stock: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Calculate wholesale price endpoint
    @PostMapping("/calculate-wholesale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> calculateWholesalePrice(@RequestBody Map<String, BigDecimal> priceData) {
        try {
            BigDecimal basePrice = priceData.get("basePrice");
            BigDecimal commissionPercentage = priceData.get("commissionPercentage");
            
            if (basePrice == null || commissionPercentage == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Base price and commission percentage are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            BigDecimal wholesalePrice = bundleService.calculateWholesalePrice(basePrice, commissionPercentage);
            
            Map<String, Object> response = new HashMap<>();
            response.put("basePrice", basePrice);
            response.put("commissionPercentage", commissionPercentage);
            response.put("wholesalePrice", wholesalePrice);
            response.put("margin", basePrice.subtract(wholesalePrice));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to calculate wholesale price: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get bundle template for CSV import
    @GetMapping("/import-template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBundleImportTemplate() {
        Map<String, Object> template = new HashMap<>();
        
        template.put("headers", new String[]{
            "name", "description", "productType", "category", "basePrice", 
            "retailerCommissionPercentage", "stockQuantity", "dataAmount", 
            "validity", "features"
        });
        
        template.put("sampleData", new String[][]{
            {"Lycamobile Smart S", "1GB Data with unlimited national minutes", "EPIN", "NORWAY", "99", "30", "100", "1GB", "30 days", "Unlimited national minutes;100 Minutes to UK;1GB EU Roaming"},
            {"Nordic Bundle M", "5GB Data for Nordic countries", "BUNDLE", "NORDIC", "199", "30", "150", "5GB", "30 days", "Nordic coverage;High-speed data;Voice calling"},
            {"Europe Travel eSIM", "10GB eSIM for European travel", "ESIM", "EUROPE", "349", "30", "200", "10GB", "30 days", "European coverage;Multi-carrier;Instant activation"}
        });
        
        template.put("productTypes", Product.ProductType.values());
        template.put("categories", Product.Category.values());
        
        template.put("instructions", new String[]{
            "1. Fill in all required fields (name, description, productType, category, basePrice, retailerCommissionPercentage, stockQuantity, dataAmount)",
            "2. Use semicolon (;) to separate multiple features",
            "3. Product types: ESIM, EPIN, BUNDLE, ADDON",
            "4. Categories: NORWAY, NORDIC, EUROPE, GLOBAL, DATA_ONLY, VOICE_DATA",
            "5. Prices should be in NOK without currency symbol",
            "6. Commission percentage should be a number (e.g., 30 for 30%)"
        });
        
        return ResponseEntity.ok(template);
    }
}