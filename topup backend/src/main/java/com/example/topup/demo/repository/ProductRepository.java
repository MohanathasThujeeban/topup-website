package com.example.topup.demo.repository;

import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.Product.ProductStatus;
import com.example.topup.demo.entity.Product.ProductType;
import com.example.topup.demo.entity.Product.Category;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    
    // Find products by status
    List<Product> findByStatus(ProductStatus status);
    
    // Find active and visible products
    List<Product> findByStatusAndIsVisible(ProductStatus status, Boolean isVisible);
    
    // Find products with stock greater than specified amount
    List<Product> findByStatusAndStockQuantityGreaterThan(ProductStatus status, Integer stockQuantity);
    
    // Find products by type
    List<Product> findByProductType(ProductType productType);
    
    // Find products by category
    List<Product> findByCategory(Category category);
    
    // Find products by status and type
    List<Product> findByStatusAndProductType(ProductStatus status, ProductType productType);
    
    // Find products by status and category
    List<Product> findByStatusAndCategory(ProductStatus status, Category category);
    
    // Find products with price range
    List<Product> findByBasePriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find products by name containing (case-insensitive search)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Find featured products
    List<Product> findByIsFeaturedTrue();
    
    // Find active featured products
    List<Product> findByStatusAndIsFeaturedTrue(ProductStatus status);
    
    // Find products with low stock (useful for inventory management)
    List<Product> findByStockQuantityLessThan(Integer stockQuantity);
    
    // Find products ordered by creation date (newest first)
    List<Product> findByStatusOrderByCreatedDateDesc(ProductStatus status);
    
    // Find products ordered by popularity (sold quantity)
    List<Product> findByStatusOrderBySoldQuantityDesc(ProductStatus status);
    
    // Custom query to find products by retailer commission percentage
    @Query("{'retailerCommissionPercentage': {$gte: ?0}}")
    List<Product> findByRetailerCommissionPercentageGreaterThanEqual(BigDecimal commissionPercentage);
    
    // Find products by multiple criteria (advanced search)
    @Query("{'status': ?0, 'productType': ?1, 'category': ?2, 'basePrice': {$gte: ?3, $lte: ?4}}")
    List<Product> findByMultipleCriteria(ProductStatus status, ProductType productType, 
                                       Category category, BigDecimal minPrice, BigDecimal maxPrice);
    
    // Count products by status
    long countByStatus(ProductStatus status);
    
    // Count products by type
    long countByProductType(ProductType productType);
    
    // Find top selling products (for analytics)
    List<Product> findTop10ByStatusOrderBySoldQuantityDesc(ProductStatus status);
}