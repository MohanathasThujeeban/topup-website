package com.example.topup.demo.service;

import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.BusinessDetails;
import com.example.topup.demo.repository.UserRepository;
import com.example.topup.demo.repository.BusinessDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Get dashboard analytics data
     */
    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Basic user statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus(User.AccountStatus.ACTIVE);
        long pendingApprovals = userRepository.countByAccountStatus(User.AccountStatus.PENDING_BUSINESS_APPROVAL);
        long businessUsers = userRepository.countByAccountType(User.AccountType.BUSINESS);
        long personalUsers = userRepository.countByAccountType(User.AccountType.PERSONAL);
        
        analytics.put("totalUsers", totalUsers);
        analytics.put("activeUsers", activeUsers);
        analytics.put("pendingApprovals", pendingApprovals);
        analytics.put("businessUsers", businessUsers);
        analytics.put("personalUsers", personalUsers);
        
        // Revenue data (mock data - replace with actual order/transaction data)
        analytics.put("totalRevenue", 245680.0);
        analytics.put("monthlyRevenue", 45200.0);
        analytics.put("dailyRevenue", 12450.0);
        analytics.put("revenueGrowth", 15.3);
        
        // User registration trends (last 7 days)
        List<Map<String, Object>> registrationTrends = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = date.withHour(23).withMinute(59).withSecond(59);
            
            long dailyRegistrations = userRepository.countByCreatedDateBetween(startOfDay, endOfDay);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(DateTimeFormatter.ofPattern("MMM dd")));
            dayData.put("registrations", dailyRegistrations);
            registrationTrends.add(dayData);
        }
        analytics.put("registrationTrends", registrationTrends);
        
        // Top products (mock data - replace with actual product sales data)
        List<Map<String, Object>> topProducts = Arrays.asList(
            Map.of("name", "Norway 30GB eSIM", "sales", 234, "revenue", 23400.0),
            Map.of("name", "Europe 50GB eSIM", "sales", 189, "revenue", 37800.0),
            Map.of("name", "Nordic 20GB eSIM", "sales", 156, "revenue", 15600.0),
            Map.of("name", "Global 10GB eSIM", "sales", 98, "revenue", 19600.0)
        );
        analytics.put("topProducts", topProducts);
        
        // Recent activities
        List<User> recentUsers = userRepository.findTop10ByOrderByCreatedDateDesc();
        List<Map<String, Object>> recentActivities = recentUsers.stream()
            .map(user -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", user.getId());
                activity.put("type", "USER_REGISTRATION");
                activity.put("description", user.getFirstName() + " " + user.getLastName() + " registered");
                activity.put("timestamp", user.getCreatedDate());
                activity.put("accountType", user.getAccountType().name());
                return activity;
            })
            .collect(Collectors.toList());
        analytics.put("recentActivities", recentActivities);
        
        return analytics;
    }

    /**
     * Get all users with pagination and filtering
     */
    public Map<String, Object> getAllUsers(int page, int size, String accountType, String accountStatus, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<User> usersPage;
        
        if (search != null && !search.trim().isEmpty()) {
            // Search by name or email
            usersPage = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                search, search, search, pageable);
        } else if (accountType != null || accountStatus != null) {
            // Filter by account type and/or status
            User.AccountType type = accountType != null ? User.AccountType.valueOf(accountType.toUpperCase()) : null;
            User.AccountStatus status = accountStatus != null ? User.AccountStatus.valueOf(accountStatus.toUpperCase()) : null;
            
            if (type != null && status != null) {
                usersPage = userRepository.findByAccountTypeAndAccountStatus(type, status, pageable);
            } else if (type != null) {
                usersPage = userRepository.findByAccountType(type, pageable);
            } else {
                usersPage = userRepository.findByAccountStatus(status, pageable);
            }
        } else {
            usersPage = userRepository.findAll(pageable);
        }
        
        List<Map<String, Object>> users = usersPage.getContent().stream()
            .map(this::convertUserToMap)
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("totalElements", usersPage.getTotalElements());
        result.put("totalPages", usersPage.getTotalPages());
        result.put("currentPage", page);
        result.put("size", size);
        
        return result;
    }

    /**
     * Get pending business registrations
     */
    public List<Map<String, Object>> getPendingBusinessRegistrations() {
        List<User> pendingBusinessUsers = userRepository.findByAccountTypeAndAccountStatus(
            User.AccountType.BUSINESS, User.AccountStatus.PENDING_BUSINESS_APPROVAL);
        
        return pendingBusinessUsers.stream()
            .map(user -> {
                Map<String, Object> registration = new HashMap<>();
                registration.put("id", user.getId());
                registration.put("user", convertUserToMap(user));
                
                if (user.getBusinessDetails() != null) {
                    BusinessDetails business = user.getBusinessDetails();
                    Map<String, Object> businessData = new HashMap<>();
                    businessData.put("id", business.getId());
                    businessData.put("companyName", business.getCompanyName());
                    businessData.put("organizationNumber", business.getOrganizationNumber());
                    businessData.put("vatNumber", business.getVatNumber());
                    businessData.put("companyEmail", business.getCompanyEmail());
                    businessData.put("verificationMethod", business.getVerificationMethod().name());
                    businessData.put("verificationStatus", business.getVerificationStatus().name());
                    businessData.put("createdDate", business.getCreatedDate());
                    businessData.put("postalAddress", business.getPostalAddress());
                    businessData.put("billingAddress", business.getBillingAddress());
                    registration.put("businessDetails", businessData);
                }
                
                return registration;
            })
            .collect(Collectors.toList());
    }

    /**
     * Approve business user
     */
    public boolean approveBusinessUser(String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return false;
            }
            
            User user = userOpt.get();
            user.setAccountStatus(User.AccountStatus.ACTIVE);
            user.setLastModifiedDate(LocalDateTime.now());
            
            // Update business details verification status
            if (user.getBusinessDetails() != null) {
                BusinessDetails business = user.getBusinessDetails();
                business.setVerificationStatus(BusinessDetails.VerificationStatus.VERIFIED);
                business.setLastModifiedDate(LocalDateTime.now());
                businessDetailsRepository.save(business);
            }
            
            userRepository.save(user);
            
            // Send approval email
            emailService.sendBusinessApprovalEmail(user);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Reject business user
     */
    public boolean rejectBusinessUser(String userId, String reason) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return false;
            }
            
            User user = userOpt.get();
            user.setAccountStatus(User.AccountStatus.SUSPENDED);
            user.setLastModifiedDate(LocalDateTime.now());
            
            // Update business details verification status
            if (user.getBusinessDetails() != null) {
                BusinessDetails business = user.getBusinessDetails();
                business.setVerificationStatus(BusinessDetails.VerificationStatus.REJECTED);
                business.setAdminNotes(reason);
                business.setLastModifiedDate(LocalDateTime.now());
                businessDetailsRepository.save(business);
            }
            
            userRepository.save(user);
            
            // Send rejection email
            emailService.sendBusinessRejectionEmail(user, reason);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update user status
     */
    public boolean updateUserStatus(String userId, String status) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return false;
            }
            
            User user = userOpt.get();
            User.AccountStatus newStatus = User.AccountStatus.valueOf(status.toUpperCase());
            user.setAccountStatus(newStatus);
            user.setLastModifiedDate(LocalDateTime.now());
            
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get detailed user information
     */
    public Map<String, Object> getUserDetails(User user) {
        Map<String, Object> details = convertUserToMap(user);
        
        // Add additional details
        if (user.getBusinessDetails() != null) {
            BusinessDetails business = user.getBusinessDetails();
            Map<String, Object> businessData = new HashMap<>();
            businessData.put("companyName", business.getCompanyName());
            businessData.put("organizationNumber", business.getOrganizationNumber());
            businessData.put("vatNumber", business.getVatNumber());
            businessData.put("companyEmail", business.getCompanyEmail());
            businessData.put("verificationMethod", business.getVerificationMethod().name());
            businessData.put("verificationStatus", business.getVerificationStatus().name());
            businessData.put("postalAddress", business.getPostalAddress());
            businessData.put("billingAddress", business.getBillingAddress());
            businessData.put("adminNotes", business.getAdminNotes());
            details.put("businessDetails", businessData);
        }
        
        // Add order history (mock data - replace with actual order data)
        List<Map<String, Object>> orderHistory = new ArrayList<>();
        details.put("orderHistory", orderHistory);
        
        return details;
    }

    /**
     * Get enquiries/support tickets
     */
    public Map<String, Object> getEnquiries(int page, int size, String status, String priority) {
        // This would use CustomerEnquiryRepository when implemented
        // For now, returning mock data that matches the frontend structure
        
        List<Map<String, Object>> enquiries = Arrays.asList(
            createEnquiryMap(
                "ENQ001", "John Doe", "john@example.com", "Personal",
                "eSIM Activation Issue", "Unable to activate my eSIM after purchase",
                "Email", "Open", "High", "Sarah Johnson",
                LocalDateTime.now().minusHours(2)
            ),
            createEnquiryMap(
                "ENQ002", "Tech Solutions AS", "support@techsolutions.no", "Business",
                "Bulk Order Support", "Need assistance with bulk eSIM order for 50 employees",
                "WhatsApp", "In Progress", "Medium", "Mike Wilson",
                LocalDateTime.now().minusHours(5)
            )
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("enquiries", enquiries);
        result.put("totalElements", enquiries.size());
        result.put("totalPages", 1);
        result.put("currentPage", page);
        result.put("size", size);
        
        return result;
    }

    /**
     * Update enquiry status
     */
    public boolean updateEnquiryStatus(String enquiryId, String status, String assignedAgent, String notes) {
        // This would update the actual enquiry in the database
        // For now, just return success
        return true;
    }

    /**
     * Get system statistics
     */
    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByAccountStatus(User.AccountStatus.ACTIVE));
        stats.put("pendingUsers", userRepository.countByAccountStatus(User.AccountStatus.PENDING_VERIFICATION));
        stats.put("businessUsers", userRepository.countByAccountType(User.AccountType.BUSINESS));
        
        // System health (mock data)
        stats.put("systemHealth", "Healthy");
        stats.put("uptime", "99.9%");
        stats.put("apiResponseTime", "120ms");
        
        return stats;
    }

    /**
     * Export users data
     */
    public byte[] exportUsersData(String format) {
        // This would generate actual CSV/Excel export
        // For now, return mock CSV data
        String csvData = "ID,Name,Email,Account Type,Status,Created Date\n";
        
        List<User> users = userRepository.findAll();
        for (User user : users) {
            csvData += String.format("%s,%s %s,%s,%s,%s,%s\n",
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAccountType().name(),
                user.getAccountStatus().name(),
                user.getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            );
        }
        
        return csvData.getBytes();
    }

    /**
     * Get revenue analytics
     */
    public Map<String, Object> getRevenueAnalytics(String period, String startDate, String endDate) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Mock revenue data - replace with actual transaction data
        analytics.put("totalRevenue", 245680.0);
        analytics.put("b2cRevenue", 156800.0);
        analytics.put("b2bRevenue", 88880.0);
        analytics.put("growthRate", 15.3);
        
        // Daily revenue for the last 30 days
        List<Map<String, Object>> dailyRevenue = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 29; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(DateTimeFormatter.ofPattern("MMM dd")));
            dayData.put("revenue", Math.random() * 15000 + 5000); // Mock data
            dailyRevenue.add(dayData);
        }
        analytics.put("dailyRevenue", dailyRevenue);
        
        return analytics;
    }

    /**
     * Convert User entity to Map for API response
     */
    private Map<String, Object> convertUserToMap(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("email", user.getEmail());
        userMap.put("mobileNumber", user.getMobileNumber());
        userMap.put("accountType", user.getAccountType().name());
        userMap.put("accountStatus", user.getAccountStatus().name());
        userMap.put("emailVerified", user.isEmailVerified());
        userMap.put("createdDate", user.getCreatedDate());
        userMap.put("lastModifiedDate", user.getLastModifiedDate());
        return userMap;
    }

    private Map<String, Object> createEnquiryMap(String id, String customerName, String customerEmail, 
                                                String accountType, String subject, String message,
                                                String channel, String status, String priority, 
                                                String assignedAgent, LocalDateTime createdDate) {
        Map<String, Object> enquiry = new HashMap<>();
        enquiry.put("id", id);
        enquiry.put("customerName", customerName);
        enquiry.put("customerEmail", customerEmail);
        enquiry.put("accountType", accountType);
        enquiry.put("subject", subject);
        enquiry.put("message", message);
        enquiry.put("channel", channel);
        enquiry.put("status", status);
        enquiry.put("priority", priority);
        enquiry.put("assignedAgent", assignedAgent);
        enquiry.put("createdDate", createdDate);
        return enquiry;
    }
}