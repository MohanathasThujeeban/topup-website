package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "esim_order_requests")
public class EsimOrderRequest {
    
    @Id
    private String id;
    
    private String orderNumber;
    private String customerEmail;
    private String customerPhone;
    private String customerFullName;
    private String idType; // passport, national_id, driving_license
    private String idNumber;
    private String idDocumentFileName;
    
    private String productName;
    private String productId;
    private Double amount;
    private String paymentMethod;
    
    private String status; // PENDING, APPROVED, REJECTED
    private String assignedEsimSerial;
    private String assignedEsimQrCode;
    
    private LocalDateTime requestDate;
    private LocalDateTime approvedDate;
    private LocalDateTime rejectedDate;
    private String rejectionReason;
    private String approvedByAdmin;
    
    // Constructors
    public EsimOrderRequest() {
        this.requestDate = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public String getCustomerFullName() {
        return customerFullName;
    }
    
    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }
    
    public String getIdType() {
        return idType;
    }
    
    public void setIdType(String idType) {
        this.idType = idType;
    }
    
    public String getIdNumber() {
        return idNumber;
    }
    
    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }
    
    public String getIdDocumentFileName() {
        return idDocumentFileName;
    }
    
    public void setIdDocumentFileName(String idDocumentFileName) {
        this.idDocumentFileName = idDocumentFileName;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getAssignedEsimSerial() {
        return assignedEsimSerial;
    }
    
    public void setAssignedEsimSerial(String assignedEsimSerial) {
        this.assignedEsimSerial = assignedEsimSerial;
    }
    
    public String getAssignedEsimQrCode() {
        return assignedEsimQrCode;
    }
    
    public void setAssignedEsimQrCode(String assignedEsimQrCode) {
        this.assignedEsimQrCode = assignedEsimQrCode;
    }
    
    public LocalDateTime getRequestDate() {
        return requestDate;
    }
    
    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }
    
    public LocalDateTime getApprovedDate() {
        return approvedDate;
    }
    
    public void setApprovedDate(LocalDateTime approvedDate) {
        this.approvedDate = approvedDate;
    }
    
    public LocalDateTime getRejectedDate() {
        return rejectedDate;
    }
    
    public void setRejectedDate(LocalDateTime rejectedDate) {
        this.rejectedDate = rejectedDate;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public String getApprovedByAdmin() {
        return approvedByAdmin;
    }
    
    public void setApprovedByAdmin(String approvedByAdmin) {
        this.approvedByAdmin = approvedByAdmin;
    }
}
