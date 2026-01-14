package com.example.topup.demo.dto;

public class StockItemDTO {
    private String itemData; // PIN or ICCID
    private String serialNumber;
    private String productId; // Product ID from CSV
    
    // eSIM specific
    private String activationUrl;
    private String activationCode; // activation_code from CSV
    private String pin1; // PIN 1
    private String puk1; // PUK 1
    private String pin2; // PIN 2
    private String puk2; // PUK 2
    private String qrCodeUrl;
    private String qrCodeImage; // Base64 encoded QR code
    
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

    public String getActivationCode() { return activationCode; }
    public void setActivationCode(String activationCode) { this.activationCode = activationCode; }

    public String getPin1() { return pin1; }
    public void setPin1(String pin1) { this.pin1 = pin1; }

    public String getPuk1() { return puk1; }
    public void setPuk1(String puk1) { this.puk1 = puk1; }

    public String getPin2() { return pin2; }
    public void setPin2(String pin2) { this.pin2 = pin2; }

    public String getPuk2() { return puk2; }
    public void setPuk2(String puk2) { this.puk2 = puk2; }

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
