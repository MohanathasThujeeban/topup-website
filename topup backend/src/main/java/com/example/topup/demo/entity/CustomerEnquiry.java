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

    // SLA Tracking Fields
    private Integer slaResponseTimeMinutes; // Expected response time in minutes based on priority
    private LocalDateTime firstResponseDate; // When agent first responded
    private Long actualResponseTimeMinutes; // Actual time taken to first response
    private boolean slaResponseMet = false;

    private Integer slaResolutionTimeHours; // Expected resolution time in hours based on priority
    private Long actualResolutionTimeHours; // Actual time taken to resolve
    private boolean slaResolutionMet = false;

    private LocalDateTime escalatedDate;
    private boolean isEscalated = false;
    private String escalationReason;
    private Integer escalationLevel = 0; // 0 = not escalated, 1 = first level, 2 = second level, etc.

    // Auto-escalation settings
    private boolean autoEscalationEnabled = true;
    private LocalDateTime nextEscalationCheck;

    // Conversation thread
    private java.util.List<ConversationMessage> conversationThread = new java.util.ArrayList<>();

    // Tracking fields
    private String ipAddress;
    private String userAgent;
    private String referenceOrderId;
    private String attachmentUrls; // JSON array of attachment URLs

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    // Nested class for conversation messages
    public static class ConversationMessage {
        private String messageId;
        private String sender; // "CUSTOMER" or "AGENT" or "SYSTEM"
        private String senderName;
        private String senderEmail;
        private String message;
        private LocalDateTime timestamp;
        private boolean isInternal; // Internal notes not visible to customer

        public ConversationMessage() {
            this.messageId = java.util.UUID.randomUUID().toString();
            this.timestamp = LocalDateTime.now();
        }

        public ConversationMessage(String sender, String senderName, String message, boolean isInternal) {
            this();
            this.sender = sender;
            this.senderName = senderName;
            this.message = message;
            this.isInternal = isInternal;
        }

        // Getters and Setters
        public String getMessageId() { return messageId; }
        public void setMessageId(String messageId) { this.messageId = messageId; }

        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getSenderEmail() { return senderEmail; }
        public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public boolean isInternal() { return isInternal; }
        public void setInternal(boolean internal) { isInternal = internal; }
    }

    // Business logic methods for SLA tracking
    public void initializeSLA() {
        // Set SLA times based on priority
        switch (this.priority) {
            case URGENT:
                this.slaResponseTimeMinutes = 15; // 15 minutes
                this.slaResolutionTimeHours = 4; // 4 hours
                break;
            case HIGH:
                this.slaResponseTimeMinutes = 60; // 1 hour
                this.slaResolutionTimeHours = 24; // 24 hours
                break;
            case MEDIUM:
                this.slaResponseTimeMinutes = 240; // 4 hours
                this.slaResolutionTimeHours = 72; // 72 hours (3 days)
                break;
            case LOW:
                this.slaResponseTimeMinutes = 480; // 8 hours
                this.slaResolutionTimeHours = 168; // 168 hours (7 days)
                break;
        }
        
        // Calculate next escalation check (half of response time)
        if (this.slaResponseTimeMinutes != null) {
            this.nextEscalationCheck = this.createdDate.plusMinutes(this.slaResponseTimeMinutes / 2);
        }
    }

    public void recordFirstResponse(String agentName, String agentEmail) {
        if (this.firstResponseDate == null) {
            this.firstResponseDate = LocalDateTime.now();
            this.actualResponseTimeMinutes = java.time.Duration.between(this.createdDate, this.firstResponseDate).toMinutes();
            this.slaResponseMet = this.actualResponseTimeMinutes <= this.slaResponseTimeMinutes;
        }
    }

    public void recordResolution() {
        this.resolvedDate = LocalDateTime.now();
        if (this.createdDate != null) {
            this.actualResolutionTimeHours = java.time.Duration.between(this.createdDate, this.resolvedDate).toHours();
            this.slaResolutionMet = this.actualResolutionTimeHours <= this.slaResolutionTimeHours;
        }
        this.status = Status.RESOLVED;
    }

    public void escalate(String reason) {
        this.isEscalated = true;
        this.escalatedDate = LocalDateTime.now();
        this.escalationReason = reason;
        this.escalationLevel++;
        this.status = Status.ESCALATED;
        this.priority = Priority.HIGH; // Escalated enquiries get high priority
    }

    public boolean needsEscalation() {
        if (!autoEscalationEnabled || isEscalated) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Check if no response within SLA time
        if (this.firstResponseDate == null && this.slaResponseTimeMinutes != null) {
            long minutesSinceCreated = java.time.Duration.between(this.createdDate, now).toMinutes();
            if (minutesSinceCreated > this.slaResponseTimeMinutes) {
                return true;
            }
        }
        
        // Check if not resolved within SLA time
        if (this.resolvedDate == null && this.slaResolutionTimeHours != null) {
            long hoursSinceCreated = java.time.Duration.between(this.createdDate, now).toHours();
            if (hoursSinceCreated > this.slaResolutionTimeHours) {
                return true;
            }
        }
        
        return false;
    }

    public void addMessage(ConversationMessage message) {
        this.conversationThread.add(message);
    }

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

    // SLA Tracking Getters and Setters
    public Integer getSlaResponseTimeMinutes() {
        return slaResponseTimeMinutes;
    }

    public void setSlaResponseTimeMinutes(Integer slaResponseTimeMinutes) {
        this.slaResponseTimeMinutes = slaResponseTimeMinutes;
    }

    public LocalDateTime getFirstResponseDate() {
        return firstResponseDate;
    }

    public void setFirstResponseDate(LocalDateTime firstResponseDate) {
        this.firstResponseDate = firstResponseDate;
    }

    public Long getActualResponseTimeMinutes() {
        return actualResponseTimeMinutes;
    }

    public void setActualResponseTimeMinutes(Long actualResponseTimeMinutes) {
        this.actualResponseTimeMinutes = actualResponseTimeMinutes;
    }

    public boolean isSlaResponseMet() {
        return slaResponseMet;
    }

    public void setSlaResponseMet(boolean slaResponseMet) {
        this.slaResponseMet = slaResponseMet;
    }

    public Integer getSlaResolutionTimeHours() {
        return slaResolutionTimeHours;
    }

    public void setSlaResolutionTimeHours(Integer slaResolutionTimeHours) {
        this.slaResolutionTimeHours = slaResolutionTimeHours;
    }

    public Long getActualResolutionTimeHours() {
        return actualResolutionTimeHours;
    }

    public void setActualResolutionTimeHours(Long actualResolutionTimeHours) {
        this.actualResolutionTimeHours = actualResolutionTimeHours;
    }

    public boolean isSlaResolutionMet() {
        return slaResolutionMet;
    }

    public void setSlaResolutionMet(boolean slaResolutionMet) {
        this.slaResolutionMet = slaResolutionMet;
    }

    public LocalDateTime getEscalatedDate() {
        return escalatedDate;
    }

    public void setEscalatedDate(LocalDateTime escalatedDate) {
        this.escalatedDate = escalatedDate;
    }

    public boolean isEscalated() {
        return isEscalated;
    }

    public void setEscalated(boolean escalated) {
        isEscalated = escalated;
    }

    public String getEscalationReason() {
        return escalationReason;
    }

    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }

    public Integer getEscalationLevel() {
        return escalationLevel;
    }

    public void setEscalationLevel(Integer escalationLevel) {
        this.escalationLevel = escalationLevel;
    }

    public boolean isAutoEscalationEnabled() {
        return autoEscalationEnabled;
    }

    public void setAutoEscalationEnabled(boolean autoEscalationEnabled) {
        this.autoEscalationEnabled = autoEscalationEnabled;
    }

    public LocalDateTime getNextEscalationCheck() {
        return nextEscalationCheck;
    }

    public void setNextEscalationCheck(LocalDateTime nextEscalationCheck) {
        this.nextEscalationCheck = nextEscalationCheck;
    }

    public java.util.List<ConversationMessage> getConversationThread() {
        return conversationThread;
    }

    public void setConversationThread(java.util.List<ConversationMessage> conversationThread) {
        this.conversationThread = conversationThread;
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
                ", isEscalated=" + isEscalated +
                ", slaResponseMet=" + slaResponseMet +
                ", slaResolutionMet=" + slaResolutionMet +
                ", createdDate=" + createdDate +
                '}';
    }
}