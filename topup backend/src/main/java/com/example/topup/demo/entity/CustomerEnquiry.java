package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Document(collection = "customer_enquiries")
public class CustomerEnquiry {

    @Id
    private String id;

    @NotBlank(message = "Enquiry ID is required")
    @Indexed(unique = true)
    private String enquiryId;

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    private String customerName;

    @Email(message = "Please provide a valid email address")
    private String customerEmail;

    private String customerPhone;

    @DBRef
    private User user; // Reference to the user if they are registered

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 200, message = "Subject must be between 5 and 200 characters")
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters")
    private String message;

    @Indexed
    private Channel channel = Channel.EMAIL;

    @Indexed
    private Priority priority = Priority.MEDIUM;

    @Indexed
    private Status status = Status.OPEN;

    private String assignedAgent;
    private String assignedAgentEmail;

    private String category; // e.g., "Technical", "Billing", "General"
    private String subcategory; // e.g., "eSIM Activation", "Payment Issue"

    private String resolutionNotes;
    private LocalDateTime resolvedDate;
    private String customerSatisfactionRating; // 1-5 stars
    private String customerFeedback;

    // Tracking fields
    private String ipAddress;
    private String userAgent;
    private String referenceOrderId;
    private String attachmentUrls; // JSON array of attachment URLs

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    // Auto-generated enquiry ID
    public void generateEnquiryId() {
        if (this.enquiryId == null) {
            // Generate ID like ENQ20241024001
            LocalDateTime now = LocalDateTime.now();
            String datePart = String.format("%d%02d%02d", 
                now.getYear(), now.getMonthValue(), now.getDayOfMonth());
            
            // In a real implementation, you'd get the next sequence number from database
            int sequenceNumber = (int) (Math.random() * 999) + 1;
            this.enquiryId = String.format("ENQ%s%03d", datePart, sequenceNumber);
        }
    }

    // Constructors
    public CustomerEnquiry() {}

    public CustomerEnquiry(String customerName, String customerEmail, String subject, String message, Channel channel) {
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.subject = subject;
        this.message = message;
        this.channel = channel;
        this.status = Status.OPEN;
        this.priority = Priority.MEDIUM;
        generateEnquiryId();
    }

    // Enums
    public enum Channel {
        EMAIL, WHATSAPP, PHONE, CONTACT_FORM, CHAT
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum Status {
        OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED, ESCALATED
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEnquiryId() {
        return enquiryId;
    }

    public void setEnquiryId(String enquiryId) {
        this.enquiryId = enquiryId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Channel getChannel() {
        return channel;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getAssignedAgent() {
        return assignedAgent;
    }

    public void setAssignedAgent(String assignedAgent) {
        this.assignedAgent = assignedAgent;
    }

    public String getAssignedAgentEmail() {
        return assignedAgentEmail;
    }

    public void setAssignedAgentEmail(String assignedAgentEmail) {
        this.assignedAgentEmail = assignedAgentEmail;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getResolvedDate() {
        return resolvedDate;
    }

    public void setResolvedDate(LocalDateTime resolvedDate) {
        this.resolvedDate = resolvedDate;
    }

    public String getCustomerSatisfactionRating() {
        return customerSatisfactionRating;
    }

    public void setCustomerSatisfactionRating(String customerSatisfactionRating) {
        this.customerSatisfactionRating = customerSatisfactionRating;
    }

    public String getCustomerFeedback() {
        return customerFeedback;
    }

    public void setCustomerFeedback(String customerFeedback) {
        this.customerFeedback = customerFeedback;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getReferenceOrderId() {
        return referenceOrderId;
    }

    public void setReferenceOrderId(String referenceOrderId) {
        this.referenceOrderId = referenceOrderId;
    }

    public String getAttachmentUrls() {
        return attachmentUrls;
    }

    public void setAttachmentUrls(String attachmentUrls) {
        this.attachmentUrls = attachmentUrls;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    @Override
    public String toString() {
        return "CustomerEnquiry{" +
                "id='" + id + '\'' +
                ", enquiryId='" + enquiryId + '\'' +
                ", customerName='" + customerName + '\'' +
                ", customerEmail='" + customerEmail + '\'' +
                ", subject='" + subject + '\'' +
                ", channel=" + channel +
                ", priority=" + priority +
                ", status=" + status +
                ", assignedAgent='" + assignedAgent + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}