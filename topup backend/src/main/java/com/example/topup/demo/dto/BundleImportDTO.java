package com.example.topup.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.util.List;

public class BundleImportDTO {

    @NotBlank(message = "Bundle name is required")
    private String name;

    private String description;

    @NotBlank(message = "Product type is required")
    private String productType;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal basePrice;

    @DecimalMin(value = "0.0", message = "Commission percentage must be non-negative")
    private BigDecimal retailerCommissionPercentage = BigDecimal.valueOf(30);

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity = 0;

    private String dataAmount;
    private String validity;
    private List<String> features;
    private List<String> supportedCountries;
    private List<String> supportedNetworks;
    private String imageUrl;

    // Constructors
    public BundleImportDTO() {}

    public BundleImportDTO(String name, String description, String productType, String category, 
                          BigDecimal basePrice, BigDecimal retailerCommissionPercentage, 
                          Integer stockQuantity, String dataAmount, String validity) {
        this.name = name;
        this.description = description;
        this.productType = productType;
        this.category = category;
        this.basePrice = basePrice;
        this.retailerCommissionPercentage = retailerCommissionPercentage;
        this.stockQuantity = stockQuantity;
        this.dataAmount = dataAmount;
        this.validity = validity;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public BigDecimal getRetailerCommissionPercentage() { return retailerCommissionPercentage; }
    public void setRetailerCommissionPercentage(BigDecimal retailerCommissionPercentage) { 
        this.retailerCommissionPercentage = retailerCommissionPercentage; 
    }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getDataAmount() { return dataAmount; }
    public void setDataAmount(String dataAmount) { this.dataAmount = dataAmount; }

    public String getValidity() { return validity; }
    public void setValidity(String validity) { this.validity = validity; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public List<String> getSupportedCountries() { return supportedCountries; }
    public void setSupportedCountries(List<String> supportedCountries) { 
        this.supportedCountries = supportedCountries; 
    }

    public List<String> getSupportedNetworks() { return supportedNetworks; }
    public void setSupportedNetworks(List<String> supportedNetworks) { 
        this.supportedNetworks = supportedNetworks; 
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @Override
    public String toString() {
        return "BundleImportDTO{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", productType='" + productType + '\'' +
                ", category='" + category + '\'' +
                ", basePrice=" + basePrice +
                ", retailerCommissionPercentage=" + retailerCommissionPercentage +
                ", stockQuantity=" + stockQuantity +
                ", dataAmount='" + dataAmount + '\'' +
                ", validity='" + validity + '\'' +
                '}';
    }
}