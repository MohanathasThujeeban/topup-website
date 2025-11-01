package com.example.topup.demo.service;

import com.example.topup.demo.entity.*;
import com.example.topup.demo.repository.PromotionRepository;
import com.example.topup.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new promotion
    @Transactional
    public Promotion createPromotion(Promotion promotion, String adminId) {
        // Validate promo code uniqueness
        if (promotionRepository.findByPromoCode(promotion.getPromoCode()).isPresent()) {
            throw new IllegalArgumentException("Promotion code already exists");
        }

        // Validate dates
        if (promotion.getEndDate().isBefore(promotion.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        promotion.setCreatedBy(adminId);
        promotion.setLastModifiedBy(adminId);
        promotion.updateStatus();
        
        return promotionRepository.save(promotion);
    }

    // Get all promotions
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    // Get promotion by ID
    public Optional<Promotion> getPromotionById(String id) {
        return promotionRepository.findById(id);
    }

    // Get promotion by code
    public Optional<Promotion> getPromotionByCode(String promoCode) {
        return promotionRepository.findByPromoCode(promoCode.toUpperCase());
    }

    // Get active promotions
    public List<Promotion> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActivePromotions(now).stream()
                .filter(Promotion::isValid)
                .collect(Collectors.toList());
    }

    // Get featured promotions
    public List<Promotion> getFeaturedPromotions() {
        return promotionRepository.findByIsFeaturedTrue().stream()
                .filter(Promotion::isValid)
                .collect(Collectors.toList());
    }

    // Update promotion
    @Transactional
    public Promotion updatePromotion(String id, Promotion updatedPromotion, String adminId) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Promotion not found"));

        // Don't allow changing promo code if it's different from existing
        if (!existing.getPromoCode().equals(updatedPromotion.getPromoCode())) {
            if (promotionRepository.findByPromoCode(updatedPromotion.getPromoCode()).isPresent()) {
                throw new IllegalArgumentException("Promotion code already exists");
            }
        }

        // Validate dates
        if (updatedPromotion.getEndDate().isBefore(updatedPromotion.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Update fields
        existing.setPromoCode(updatedPromotion.getPromoCode());
        existing.setName(updatedPromotion.getName());
        existing.setDescription(updatedPromotion.getDescription());
        existing.setDiscountType(updatedPromotion.getDiscountType());
        existing.setDiscountValue(updatedPromotion.getDiscountValue());
        existing.setMaxDiscountAmount(updatedPromotion.getMaxDiscountAmount());
        existing.setMinOrderValue(updatedPromotion.getMinOrderValue());
        existing.setStartDate(updatedPromotion.getStartDate());
        existing.setEndDate(updatedPromotion.getEndDate());
        existing.setUsageLimit(updatedPromotion.getUsageLimit());
        existing.setUsageLimitPerUser(updatedPromotion.getUsageLimitPerUser());
        existing.setApplicableProductIds(updatedPromotion.getApplicableProductIds());
        existing.setApplicableProductTypes(updatedPromotion.getApplicableProductTypes());
        existing.setApplicableUserIds(updatedPromotion.getApplicableUserIds());
        existing.setApplicableUserTypes(updatedPromotion.getApplicableUserTypes());
        existing.setPublic(updatedPromotion.isPublic());
        existing.setTargetedEmails(updatedPromotion.getTargetedEmails());
        existing.setFeatured(updatedPromotion.isFeatured());
        existing.setBannerImageUrl(updatedPromotion.getBannerImageUrl());
        existing.setTermsAndConditions(updatedPromotion.getTermsAndConditions());
        existing.setLastModifiedBy(adminId);
        existing.updateStatus();

        return promotionRepository.save(existing);
    }

    // Delete promotion
    @Transactional
    public void deletePromotion(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Promotion not found"));
        
        // Instead of hard delete, mark as cancelled
        promotion.setStatus(Promotion.PromotionStatus.CANCELLED);
        promotion.setActive(false);
        promotionRepository.save(promotion);
    }

    // Toggle promotion active status
    @Transactional
    public Promotion togglePromotionStatus(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Promotion not found"));

        if (promotion.getStatus() == Promotion.PromotionStatus.PAUSED) {
            promotion.setStatus(Promotion.PromotionStatus.ACTIVE);
        } else if (promotion.getStatus() == Promotion.PromotionStatus.ACTIVE) {
            promotion.setStatus(Promotion.PromotionStatus.PAUSED);
        } else {
            throw new IllegalStateException("Cannot toggle status for promotion in " + promotion.getStatus() + " state");
        }

        promotion.updateStatus();
        return promotionRepository.save(promotion);
    }

    // Validate promo code for a specific user and order
    public Map<String, Object> validatePromoCode(String promoCode, String userId, BigDecimal orderValue, List<String> productIds) {
        Map<String, Object> result = new HashMap<>();

        Optional<Promotion> promotionOpt = promotionRepository.findByPromoCode(promoCode.toUpperCase());
        
        if (promotionOpt.isEmpty()) {
            result.put("valid", false);
            result.put("message", "Invalid promotion code");
            return result;
        }

        Promotion promotion = promotionOpt.get();

        // Check if promotion is valid
        if (!promotion.isValid()) {
            result.put("valid", false);
            result.put("message", "This promotion is not currently active");
            return result;
        }

        // Get user
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && !promotion.canBeUsedBy(user)) {
            result.put("valid", false);
            result.put("message", "This promotion is not applicable to your account");
            return result;
        }

        // Check minimum order value
        if (promotion.getMinOrderValue() != null && orderValue.compareTo(promotion.getMinOrderValue()) < 0) {
            result.put("valid", false);
            result.put("message", "Minimum order value of $" + promotion.getMinOrderValue() + " required");
            return result;
        }

        // Calculate discount
        BigDecimal discount = promotion.calculateDiscount(orderValue);

        result.put("valid", true);
        result.put("message", "Promotion code applied successfully");
        result.put("discount", discount);
        result.put("discountType", promotion.getDiscountType());
        result.put("promotionName", promotion.getName());
        result.put("promotionId", promotion.getId());

        return result;
    }

    // Apply promotion to order
    @Transactional
    public BigDecimal applyPromotion(String promoCode, String userId, BigDecimal orderValue, List<String> productIds) {
        Map<String, Object> validation = validatePromoCode(promoCode, userId, orderValue, productIds);
        
        if (!(Boolean) validation.get("valid")) {
            throw new IllegalArgumentException((String) validation.get("message"));
        }

        String promotionId = (String) validation.get("promotionId");
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new NoSuchElementException("Promotion not found"));

        // Increment usage
        promotion.incrementUsage();
        promotionRepository.save(promotion);

        return (BigDecimal) validation.get("discount");
    }

    // Get promotions by status
    public List<Promotion> getPromotionsByStatus(Promotion.PromotionStatus status) {
        return promotionRepository.findByStatus(status);
    }

    // Get promotion statistics
    public Map<String, Object> getPromotionStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalPromotions = promotionRepository.count();
        long activePromotions = promotionRepository.countByIsActiveTrue();
        long scheduledPromotions = promotionRepository.countByStatus(Promotion.PromotionStatus.SCHEDULED);
        long expiredPromotions = promotionRepository.countByStatus(Promotion.PromotionStatus.EXPIRED);

        List<Promotion> allPromotions = promotionRepository.findAll();
        int totalUsage = allPromotions.stream()
                .mapToInt(p -> p.getUsageCount() != null ? p.getUsageCount() : 0)
                .sum();

        stats.put("totalPromotions", totalPromotions);
        stats.put("activePromotions", activePromotions);
        stats.put("scheduledPromotions", scheduledPromotions);
        stats.put("expiredPromotions", expiredPromotions);
        stats.put("totalUsage", totalUsage);

        // Top performing promotions
        List<Map<String, Object>> topPromotions = allPromotions.stream()
                .sorted((p1, p2) -> Integer.compare(
                        p2.getUsageCount() != null ? p2.getUsageCount() : 0,
                        p1.getUsageCount() != null ? p1.getUsageCount() : 0
                ))
                .limit(5)
                .map(p -> {
                    Map<String, Object> promoData = new HashMap<>();
                    promoData.put("code", p.getPromoCode());
                    promoData.put("name", p.getName());
                    promoData.put("usage", p.getUsageCount());
                    promoData.put("limit", p.getUsageLimit());
                    return promoData;
                })
                .collect(Collectors.toList());

        stats.put("topPromotions", topPromotions);

        return stats;
    }

    // Scheduled task to update promotion statuses
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void updatePromotionStatuses() {
        List<Promotion> allPromotions = promotionRepository.findAll();
        
        for (Promotion promotion : allPromotions) {
            Promotion.PromotionStatus oldStatus = promotion.getStatus();
            promotion.updateStatus();
            
            if (oldStatus != promotion.getStatus()) {
                promotionRepository.save(promotion);
            }
        }
    }

    // Get promotions applicable to a product
    public List<Promotion> getPromotionsForProduct(String productId) {
        return promotionRepository.findByApplicableProductId(productId).stream()
                .filter(Promotion::isValid)
                .collect(Collectors.toList());
    }
}
