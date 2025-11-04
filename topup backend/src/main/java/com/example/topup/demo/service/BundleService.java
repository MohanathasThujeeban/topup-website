package com.example.topup.demo.service;

import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.repository.ProductRepository;
import com.example.topup.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BundleService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Get all bundles/products
    public List<Product> getAllBundles() {
        return productRepository.findAll();
    }

    // Get bundles by status
    public List<Product> getBundlesByStatus(Product.ProductStatus status) {
        return productRepository.findByStatus(status);
    }

    // Create a new bundle
    public Product createBundle(Product bundle) {
        bundle.setCreatedDate(LocalDateTime.now());
        bundle.setLastModifiedDate(LocalDateTime.now());
        bundle.generateSlug();
        return productRepository.save(bundle);
    }

    // Update an existing bundle
    public Product updateBundle(String id, Product bundle) {
        Optional<Product> existingBundle = productRepository.findById(id);
        if (existingBundle.isPresent()) {
            Product existing = existingBundle.get();
            existing.setName(bundle.getName());
            existing.setDescription(bundle.getDescription());
            existing.setProductType(bundle.getProductType());
            existing.setCategory(bundle.getCategory());
            existing.setBasePrice(bundle.getBasePrice());
            existing.setRetailerCommissionPercentage(bundle.getRetailerCommissionPercentage());
            existing.setStockQuantity(bundle.getStockQuantity());
            existing.setDataAmount(bundle.getDataAmount());
            existing.setValidity(bundle.getValidity());
            existing.setSupportedCountries(bundle.getSupportedCountries());
            existing.setSupportedNetworks(bundle.getSupportedNetworks());
            existing.setStatus(bundle.getStatus());
            existing.setVisible(bundle.isVisible());
            existing.setFeatured(bundle.isFeatured());
            existing.setImageUrl(bundle.getImageUrl());
            existing.setTags(bundle.getTags());
            existing.setMetadata(bundle.getMetadata());
            existing.setLastModifiedDate(LocalDateTime.now());
            existing.setLastModifiedBy(bundle.getLastModifiedBy());
            existing.generateSlug();
            
            return productRepository.save(existing);
        }
        throw new RuntimeException("Bundle not found with id: " + id);
    }

    // Delete a bundle
    public void deleteBundle(String id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
        } else {
            throw new RuntimeException("Bundle not found with id: " + id);
        }
    }

    // Get bundle by ID
    public Product getBundleById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found with id: " + id));
    }

    // Bulk import bundles from CSV
    public List<Product> bulkImportBundles(MultipartFile file, String createdBy) {
        List<Product> bundles = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header line
                }
                
                String[] fields = line.split(",");
                if (fields.length >= 8) {
                    Product bundle = createBundleFromCsvLine(fields, createdBy);
                    bundles.add(bundle);
                }
            }
            
            // Save all bundles
            return productRepository.saveAll(bundles);
            
        } catch (Exception e) {
            throw new RuntimeException("Error processing file: " + e.getMessage());
        }
    }

    private Product createBundleFromCsvLine(String[] fields, String createdBy) {
        Product bundle = new Product();
        
        try {
            bundle.setName(fields[0].trim());
            bundle.setDescription(fields[1].trim());
            bundle.setProductType(Product.ProductType.valueOf(fields[2].trim().toUpperCase()));
            bundle.setCategory(Product.Category.valueOf(fields[3].trim().toUpperCase()));
            bundle.setBasePrice(new BigDecimal(fields[4].trim()));
            bundle.setRetailerCommissionPercentage(new BigDecimal(fields[5].trim()));
            bundle.setStockQuantity(Integer.parseInt(fields[6].trim()));
            bundle.setDataAmount(fields[7].trim());
            
            if (fields.length > 8) bundle.setValidity(fields[8].trim());
            if (fields.length > 9) {
                // Parse features as comma-separated list in field 9
                String[] features = fields[9].split(";");
                Map<String, String> metadata = new HashMap<>();
                for (int i = 0; i < features.length; i++) {
                    metadata.put("feature_" + i, features[i].trim());
                }
                bundle.setMetadata(metadata);
            }
            
            bundle.setStatus(Product.ProductStatus.ACTIVE);
            bundle.setVisible(true);
            bundle.setFeatured(false);
            bundle.setSoldQuantity(0);
            bundle.setCreatedDate(LocalDateTime.now());
            bundle.setLastModifiedDate(LocalDateTime.now());
            bundle.setCreatedBy(createdBy);
            bundle.setLastModifiedBy(createdBy);
            bundle.generateSlug();
            
        } catch (Exception e) {
            throw new RuntimeException("Error parsing bundle data: " + e.getMessage());
        }
        
        return bundle;
    }

    // Get bundle statistics
    public Map<String, Object> getBundleStatistics() {
        List<Product> allBundles = productRepository.findAll();
        
        // Count total users (all account types)
        long totalUsers = userRepository.count();
        
        // Count active users (users with ACTIVE status)
        long activeUsers = userRepository.countByAccountStatus(User.AccountStatus.ACTIVE);
        
        // Count pending business approvals
        long pendingApprovals = userRepository.countByAccountStatus(User.AccountStatus.PENDING_BUSINESS_APPROVAL);
        
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingApprovals", pendingApprovals);
        
        // Bundle statistics
        stats.put("totalBundles", allBundles.size());
        stats.put("activeBundles", allBundles.stream().filter(p -> p.getStatus() == Product.ProductStatus.ACTIVE).count());
        stats.put("totalRevenue", allBundles.stream()
                .mapToDouble(p -> p.getBasePrice().doubleValue() * (p.getSoldQuantity() != null ? p.getSoldQuantity() : 0))
                .sum());
        stats.put("totalUnitsSold", allBundles.stream()
                .mapToInt(p -> p.getSoldQuantity() != null ? p.getSoldQuantity() : 0)
                .sum());
        stats.put("lowStockBundles", allBundles.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 10)
                .count());
        
        // Wrap in success response format
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", stats);
        
        return response;
    }

    // Get top selling bundles
    public List<Product> getTopSellingBundles(int limit) {
        return productRepository.findByStatusOrderBySoldQuantityDesc(Product.ProductStatus.ACTIVE)
                .stream()
                .limit(limit)
                .toList();
    }

    // Search bundles
    public List<Product> searchBundles(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllBundles();
        }
        return productRepository.findByNameContainingIgnoreCase(query.trim());
    }

    // Get bundles by category
    public List<Product> getBundlesByCategory(Product.Category category) {
        return productRepository.findByCategory(category);
    }

    // Get bundles by type
    public List<Product> getBundlesByType(Product.ProductType productType) {
        return productRepository.findByProductType(productType);
    }

    // Update bundle stock
    public Product updateBundleStock(String id, int newStock) {
        Product bundle = getBundleById(id);
        bundle.setStockQuantity(newStock);
        bundle.setLastModifiedDate(LocalDateTime.now());
        return productRepository.save(bundle);
    }

    // Calculate wholesale price
    public BigDecimal calculateWholesalePrice(BigDecimal basePrice, BigDecimal commissionPercentage) {
        if (basePrice == null || commissionPercentage == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal commission = basePrice.multiply(commissionPercentage.divide(BigDecimal.valueOf(100)));
        return basePrice.subtract(commission);
    }
}