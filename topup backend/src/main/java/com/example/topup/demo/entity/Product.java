package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    @Indexed
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Product type is required")
    @Indexed
    private ProductType productType;

    @NotNull(message = "Product category is required")
    @Indexed
    private Category category;

    // Pricing information
    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal basePrice;

    @DecimalMin(value = "0.0", message = "Discount percentage must be non-negative")
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Retailer commission must be non-negative")
    private BigDecimal retailerCommissionPercentage = BigDecimal.ZERO;

    // Stock management
    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity = 0;

    @Min(value = 0, message = "Sold quantity must be non-negative")
    private Integer soldQuantity = 0;

    private Integer lowStockThreshold = 10;

    // Product specifications
    private String dataAmount; // e.g., "30GB", "Unlimited"
    private String validity; // e.g., "30 days", "60 days"
    private List<String> supportedCountries;
    private List<String> supportedNetworks;

    // Bundle-specific fields (for eSIM/PIN bundles)
    private List<PinData> availablePins; // For ePIN products
    private List<EsimData> availableEsims; // For eSIM products

    // Product status and visibility
    @Indexed
    private ProductStatus status = ProductStatus.DRAFT;

    private boolean isVisible = true;
    private boolean isFeatured = false;

    // SEO and display
    private String slug; // URL-friendly name
    private String imageUrl;
    private List<String> tags;
    private Map<String, String> metadata; // Additional key-value data

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy; // Admin user who created this product
    private String lastModifiedBy; // Admin user who last modified this product

    // Constructors
    public Product() {}

    public Product(String name, ProductType productType, Category category, BigDecimal basePrice) {
        this.name = name;
        this.productType = productType;
        this.category = category;
        this.basePrice = basePrice;
        this.status = ProductStatus.DRAFT;
        generateSlug();
    }

    // Product Type Enum
    public enum ProductType {
        ESIM, EPIN, BUNDLE, ADDON
    }

    // Category Enum
    public enum Category {
        NORWAY, NORDIC, EUROPE, GLOBAL, DATA_ONLY, VOICE_DATA
    }

    // Product Status Enum
    public enum ProductStatus {
        DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED
    }

    // Nested classes for PIN and eSIM data
    public static class PinData {
        private String pinNumber;
        private String serialNumber;
        private boolean isUsed = false;
        private LocalDateTime usedDate;
        private String usedByUserId;

        // Constructors, getters, and setters
        public PinData() {}

        public PinData(String pinNumber, String serialNumber) {
            this.pinNumber = pinNumber;
            this.serialNumber = serialNumber;
        }

        public String getPinNumber() { return pinNumber; }
        public void setPinNumber(String pinNumber) { this.pinNumber = pinNumber; }

        public String getSerialNumber() { return serialNumber; }
        public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

        public boolean isUsed() { return isUsed; }
        public void setUsed(boolean used) { isUsed = used; }

        public LocalDateTime getUsedDate() { return usedDate; }
        public void setUsedDate(LocalDateTime usedDate) { this.usedDate = usedDate; }

        public String getUsedByUserId() { return usedByUserId; }
        public void setUsedByUserId(String usedByUserId) { this.usedByUserId = usedByUserId; }
    }

    public static class EsimData {
        private String iccid;
        private String qrCodeUrl;
        private String activationUrl;
        private String eid;
        private boolean isActivated = false;
        private LocalDateTime activatedDate;
        private String activatedByUserId;

        // Constructors, getters, and setters
        public EsimData() {}

        public EsimData(String iccid, String qrCodeUrl, String activationUrl) {
            this.iccid = iccid;
            this.qrCodeUrl = qrCodeUrl;
            this.activationUrl = activationUrl;
        }

        public String getIccid() { return iccid; }
        public void setIccid(String iccid) { this.iccid = iccid; }

        public String getQrCodeUrl() { return qrCodeUrl; }
        public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

        public String getActivationUrl() { return activationUrl; }
        public void setActivationUrl(String activationUrl) { this.activationUrl = activationUrl; }

        public String getEid() { return eid; }
        public void setEid(String eid) { this.eid = eid; }

        public boolean isActivated() { return isActivated; }
        public void setActivated(boolean activated) { isActivated = activated; }

        public LocalDateTime getActivatedDate() { return activatedDate; }
        public void setActivatedDate(LocalDateTime activatedDate) { this.activatedDate = activatedDate; }

        public String getActivatedByUserId() { return activatedByUserId; }
        public void setActivatedByUserId(String activatedByUserId) { this.activatedByUserId = activatedByUserId; }
    }

    // Utility methods
    public void generateSlug() {
        if (this.name != null) {
            this.slug = this.name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        }
    }

    public BigDecimal getDiscountedPrice() {
        if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discount = basePrice.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
            return basePrice.subtract(discount);
        }
        return basePrice;
    }

    public boolean isLowStock() {
        return stockQuantity <= lowStockThreshold;
    }

    public boolean isOutOfStock() {
        return stockQuantity <= 0;
    }

    public int getAvailableStock() {
        int pinStock = availablePins != null ? (int) availablePins.stream().filter(pin -> !pin.isUsed()).count() : 0;
        int esimStock = availableEsims != null ? (int) availableEsims.stream().filter(esim -> !esim.isActivated()).count() : 0;
        return Math.max(stockQuantity, Math.max(pinStock, esimStock));
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { 
        this.name = name; 
        generateSlug();
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getRetailerCommissionPercentage() { return retailerCommissionPercentage; }
    public void setRetailerCommissionPercentage(BigDecimal retailerCommissionPercentage) { this.retailerCommissionPercentage = retailerCommissionPercentage; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(Integer soldQuantity) { this.soldQuantity = soldQuantity; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public String getDataAmount() { return dataAmount; }
    public void setDataAmount(String dataAmount) { this.dataAmount = dataAmount; }

    public String getValidity() { return validity; }
    public void setValidity(String validity) { this.validity = validity; }

    public List<String> getSupportedCountries() { return supportedCountries; }
    public void setSupportedCountries(List<String> supportedCountries) { this.supportedCountries = supportedCountries; }

    public List<String> getSupportedNetworks() { return supportedNetworks; }
    public void setSupportedNetworks(List<String> supportedNetworks) { this.supportedNetworks = supportedNetworks; }

    public List<PinData> getAvailablePins() { return availablePins; }
    public void setAvailablePins(List<PinData> availablePins) { this.availablePins = availablePins; }

    public List<EsimData> getAvailableEsims() { return availableEsims; }
    public void setAvailableEsims(List<EsimData> availableEsims) { this.availableEsims = availableEsims; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public boolean isVisible() { return isVisible; }
    public void setVisible(boolean visible) { isVisible = visible; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDateTime lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    @Override
    public String toString() {
        return "Product{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", productType=" + productType +
                ", category=" + category +
                ", basePrice=" + basePrice +
                ", stockQuantity=" + stockQuantity +
                ", status=" + status +
                ", createdDate=" + createdDate +
                '}';
    }
}