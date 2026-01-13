package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "stock_pools")
public class StockPool {

    @Id
    private String id;

    @NotBlank(message = "Stock pool name is required")
    private String name;

    @NotNull(message = "Stock type is required")
    @Indexed
    private StockType stockType;

    @DBRef
    private Product product; // Associated product

    @Indexed
    private String productId; // For easier querying

    private List<StockItem> items = new ArrayList<>();

    private Integer totalQuantity = 0;
    private Integer availableQuantity = 0;
    private Integer usedQuantity = 0;
    private Integer reservedQuantity = 0;

    @Indexed
    private StockStatus status = StockStatus.ACTIVE;

    private String description;
    private String supplier;
    private String batchNumber;
    
    // New fields for enhanced categorization
    private String networkProvider; // Lycamobile, Mycall, Telia
    private String productType; // Topups, Bundle plans, Data plans
    private String price; // Price in NOK

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    private String createdBy;
    private String lastModifiedBy;

    // Enum for Stock Type
    public enum StockType {
        EPIN, ESIM
    }

    // Enum for Stock Status
    public enum StockStatus {
        ACTIVE, INACTIVE, DEPLETED
    }

    // Nested class for Stock Items (PINs or eSIMs)
    public static class StockItem {
        private String itemId;
        private String itemData; // PIN number or eSIM ICCID
        private String serialNumber;
        private String productId; // Product ID from CSV
        
        // eSIM specific fields
        private String activationUrl;
        private String qrCodeUrl;
        private String qrCodeImage; // Base64 or URL
        
        private ItemStatus status = ItemStatus.AVAILABLE;
        private LocalDateTime assignedDate;
        private String assignedToOrderId;
        private String assignedToUserId;
        private String assignedToUserEmail;
        
        private LocalDateTime usedDate;
        private LocalDateTime expiryDate;
        
        private String notes;
        private String price; // Price from CSV
        private String type;  // Type from CSV (e.g., "Data Bundle", "Voice", etc.)

        public enum ItemStatus {
            AVAILABLE, RESERVED, ASSIGNED, USED, EXPIRED, FAILED
        }

        // Constructors
        public StockItem() {}

        public StockItem(String itemData, String serialNumber) {
            this.itemData = itemData;
            this.serialNumber = serialNumber;
            this.status = ItemStatus.AVAILABLE;
        }

        // Getters and Setters
        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }

        public String getItemData() { return itemData; }
        public void setItemData(String itemData) { this.itemData = itemData; }

        public String getSerialNumber() { return serialNumber; }
        public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public String getActivationUrl() { return activationUrl; }
        public void setActivationUrl(String activationUrl) { this.activationUrl = activationUrl; }

        public String getQrCodeUrl() { return qrCodeUrl; }
        public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

        public String getQrCodeImage() { return qrCodeImage; }
        public void setQrCodeImage(String qrCodeImage) { this.qrCodeImage = qrCodeImage; }

        public ItemStatus getStatus() { return status; }
        public void setStatus(ItemStatus status) { this.status = status; }

        public LocalDateTime getAssignedDate() { return assignedDate; }
        public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

        public String getAssignedToOrderId() { return assignedToOrderId; }
        public void setAssignedToOrderId(String assignedToOrderId) { this.assignedToOrderId = assignedToOrderId; }

        public String getAssignedToUserId() { return assignedToUserId; }
        public void setAssignedToUserId(String assignedToUserId) { this.assignedToUserId = assignedToUserId; }

        public String getAssignedToUserEmail() { return assignedToUserEmail; }
        public void setAssignedToUserEmail(String assignedToUserEmail) { this.assignedToUserEmail = assignedToUserEmail; }

        public LocalDateTime getUsedDate() { return usedDate; }
        public void setUsedDate(LocalDateTime usedDate) { this.usedDate = usedDate; }

        public LocalDateTime getExpiryDate() { return expiryDate; }
        public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    // Constructors
    public StockPool() {}

    public StockPool(String name, StockType stockType, Product product) {
        this.name = name;
        this.stockType = stockType;
        this.product = product;
        this.productId = product.getId();
        this.status = StockStatus.ACTIVE;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public StockType getStockType() { return stockType; }
    public void setStockType(StockType stockType) { this.stockType = stockType; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { 
        this.product = product;
        this.productId = product != null ? product.getId() : null;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public List<StockItem> getItems() { return items; }
    public void setItems(List<StockItem> items) { this.items = items; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Integer getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }

    public Integer getUsedQuantity() { return usedQuantity; }
    public void setUsedQuantity(Integer usedQuantity) { this.usedQuantity = usedQuantity; }

    public Integer getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(Integer reservedQuantity) { this.reservedQuantity = reservedQuantity; }

    public StockStatus getStatus() { return status; }
    public void setStatus(StockStatus status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getNetworkProvider() { return networkProvider; }
    public void setNetworkProvider(String networkProvider) { this.networkProvider = networkProvider; }

    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDateTime lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    // Helper methods
    public void addItem(StockItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        items.add(item);
        updateQuantities();
    }

    public void updateQuantities() {
        if (items == null) {
            this.totalQuantity = 0;
            this.availableQuantity = 0;
            this.usedQuantity = 0;
            this.reservedQuantity = 0;
            return;
        }

        this.totalQuantity = items.size();
        this.availableQuantity = (int) items.stream()
            .filter(item -> item.getStatus() == StockItem.ItemStatus.AVAILABLE)
            .count();
        this.usedQuantity = (int) items.stream()
            .filter(item -> item.getStatus() == StockItem.ItemStatus.USED)
            .count();
        this.reservedQuantity = (int) items.stream()
            .filter(item -> item.getStatus() == StockItem.ItemStatus.RESERVED)
            .count();

        if (this.availableQuantity == 0 && this.reservedQuantity == 0) {
            this.status = StockStatus.DEPLETED;
        }
    }
}
