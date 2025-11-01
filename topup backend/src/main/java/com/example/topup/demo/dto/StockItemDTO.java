package com.example.topup.demo.dto;

public class StockItemDTO {
    private String itemData; // PIN or ICCID
    private String serialNumber;
    private String productId; // Product ID from CSV
    
    // eSIM specific
    private String activationUrl;
    private String qrCodeUrl;
    private String qrCodeImage;
    
    private String notes;
    private String price; // Price from CSV
    private String type;  // Type from CSV (e.g., "Data Bundle", "Voice", etc.)

    public StockItemDTO() {}

    public StockItemDTO(String itemData, String serialNumber) {
        this.itemData = itemData;
        this.serialNumber = serialNumber;
    }

    // Getters and Setters
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

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
