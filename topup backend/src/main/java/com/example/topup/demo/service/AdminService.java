package com.example.topup.demo.service;

import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.BusinessDetails;
import com.example.topup.demo.entity.Order;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.EsimOrderRequest;
import com.example.topup.demo.dto.RetailerCreditLimitDTO;
import com.example.topup.demo.dto.UpdateCreditLimitRequest;
import com.example.topup.demo.dto.UpdateUnitLimitRequest;
import com.example.topup.demo.repository.UserRepository;
import com.example.topup.demo.repository.BusinessDetailsRepository;
import com.example.topup.demo.repository.OrderRepository;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.RetailerLimitRepository;
import com.example.topup.demo.repository.EsimOrderRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
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
    private OrderRepository orderRepository;

    @Autowired
    private RetailerOrderRepository retailerOrderRepository;

    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    @Autowired
    private EsimOrderRequestRepository esimOrderRequestRepository;

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
        
        // Real revenue data from orders
        double totalRevenue = calculateTotalRevenue();
        double monthlyRevenue = calculateMonthlyRevenue();
        double dailyRevenue = calculateDailyRevenue();
        double revenueGrowth = calculateRevenueGrowth();
        
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("monthlyRevenue", monthlyRevenue);
        analytics.put("dailyRevenue", dailyRevenue);
        analytics.put("revenueGrowth", revenueGrowth);
        
        // Total orders calculation
        long totalOrders = calculateTotalOrders();
        analytics.put("totalOrders", totalOrders);
        
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
        
        // Real revenue data from actual transactions
        double totalRevenue = calculateTotalRevenue();
        double b2cRevenue = calculateB2CRevenue();
        double b2bRevenue = calculateB2BRevenue();
        double growthRate = calculateRevenueGrowth();
        
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("b2cRevenue", b2cRevenue);
        analytics.put("b2bRevenue", b2bRevenue);
        analytics.put("growthRate", growthRate);
        
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
    
    // Revenue calculation methods
    private double calculateTotalRevenue() {
        try {
            // Calculate revenue from customer orders (Order entity)
            List<Order> allOrders = orderRepository.findAll();
            double customerRevenue = allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount().doubleValue() : 0.0)
                .sum();
            
            // Calculate revenue from retailer orders (RetailerOrder entity)
            List<RetailerOrder> allRetailerOrders = retailerOrderRepository.findAll();
            double retailerRevenue = allRetailerOrders.stream()
                .filter(order -> order.getStatus() == RetailerOrder.OrderStatus.DELIVERED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
            
            // Calculate revenue from eSIM orders (EsimOrderRequest entity)
            List<EsimOrderRequest> allEsimOrders = esimOrderRequestRepository.findAll();
            double esimRevenue = allEsimOrders.stream()
                .filter(order -> "APPROVED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus()))
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount() : 0.0)
                .sum();
            
            return customerRevenue + retailerRevenue + esimRevenue;
        } catch (Exception e) {
            System.err.println("Error calculating total revenue: " + e.getMessage());
            return 0.0;
        }
    }
    
    private double calculateMonthlyRevenue() {
        try {
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfMonth = LocalDateTime.now();
            
            // Customer orders for this month
            List<Order> monthlyOrders = orderRepository.findByCreatedDateBetween(startOfMonth, endOfMonth);
            double customerRevenue = monthlyOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount().doubleValue() : 0.0)
                .sum();
            
            // Retailer orders for this month
            List<RetailerOrder> monthlyRetailerOrders = retailerOrderRepository.findByCreatedDateBetween(startOfMonth, endOfMonth);
            double retailerRevenue = monthlyRetailerOrders.stream()
                .filter(order -> order.getStatus() == RetailerOrder.OrderStatus.DELIVERED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
            
            // eSIM orders for this month
            List<EsimOrderRequest> monthlyEsimOrders = esimOrderRequestRepository.findByRequestDateBetween(startOfMonth, endOfMonth);
            double esimRevenue = monthlyEsimOrders.stream()
                .filter(order -> "APPROVED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus()))
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount() : 0.0)
                .sum();
            
            return customerRevenue + retailerRevenue + esimRevenue;
        } catch (Exception e) {
            System.err.println("Error calculating monthly revenue: " + e.getMessage());
            return 0.0;
        }
    }
    
    private double calculateDailyRevenue() {
        try {
            LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            
            // Customer orders for today
            List<Order> todayOrders = orderRepository.findByCreatedDateBetween(startOfDay, endOfDay);
            double customerRevenue = todayOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount().doubleValue() : 0.0)
                .sum();
            
            // Retailer orders for today
            List<RetailerOrder> todayRetailerOrders = retailerOrderRepository.findByCreatedDateBetween(startOfDay, endOfDay);
            double retailerRevenue = todayRetailerOrders.stream()
                .filter(order -> order.getStatus() == RetailerOrder.OrderStatus.DELIVERED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
            
            // eSIM orders for today
            List<EsimOrderRequest> todayEsimOrders = esimOrderRequestRepository.findByRequestDateBetween(startOfDay, endOfDay);
            double esimRevenue = todayEsimOrders.stream()
                .filter(order -> "APPROVED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus()))
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount() : 0.0)
                .sum();
            
            return customerRevenue + retailerRevenue + esimRevenue;
        } catch (Exception e) {
            System.err.println("Error calculating daily revenue: " + e.getMessage());
            return 0.0;
        }
    }
    
    private double calculateRevenueGrowth() {
        try {
            // Calculate current month revenue
            double currentMonthRevenue = calculateMonthlyRevenue();
            
            // Calculate previous month revenue
            LocalDateTime startOfLastMonth = LocalDateTime.now().minusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfLastMonth = LocalDateTime.now().withDayOfMonth(1).minusDays(1).withHour(23).withMinute(59).withSecond(59);
            
            // Customer orders for last month
            List<Order> lastMonthOrders = orderRepository.findByCreatedDateBetween(startOfLastMonth, endOfLastMonth);
            double lastMonthCustomerRevenue = lastMonthOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount().doubleValue() : 0.0)
                .sum();
            
            // Retailer orders for last month
            List<RetailerOrder> lastMonthRetailerOrders = retailerOrderRepository.findByCreatedDateBetween(startOfLastMonth, endOfLastMonth);
            double lastMonthRetailerRevenue = lastMonthRetailerOrders.stream()
                .filter(order -> order.getStatus() == RetailerOrder.OrderStatus.DELIVERED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
            
            // eSIM orders for last month
            List<EsimOrderRequest> lastMonthEsimOrders = esimOrderRequestRepository.findByRequestDateBetween(startOfLastMonth, endOfLastMonth);
            double lastMonthEsimRevenue = lastMonthEsimOrders.stream()
                .filter(order -> "APPROVED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus()))
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount() : 0.0)
                .sum();
            
            double lastMonthRevenue = lastMonthCustomerRevenue + lastMonthRetailerRevenue + lastMonthEsimRevenue;
            
            // Calculate growth percentage
            if (lastMonthRevenue == 0) {
                return currentMonthRevenue > 0 ? 100.0 : 0.0; // 100% growth if we had no revenue last month
            }
            
            return ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100.0;
        } catch (Exception e) {
            System.err.println("Error calculating revenue growth: " + e.getMessage());
            return 0.0;
        }
    }
    
    private long calculateTotalOrders() {
        try {
            // Count all completed customer orders
            long customerOrders = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .count();
            
            // Count all delivered retailer orders
            long retailerOrders = retailerOrderRepository.findAll().stream()
                .filter(order -> order.getStatus() == RetailerOrder.OrderStatus.DELIVERED)
                .count();
            
            // Count all approved/completed eSIM orders
            long esimOrders = esimOrderRequestRepository.findAll().stream()
                .filter(order -> "APPROVED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus()))
                .count();
            
            return customerOrders + retailerOrders + esimOrders;
        } catch (Exception e) {
            System.err.println("Error calculating total orders: " + e.getMessage());
            return 0;
        }
    }
    
    private double calculateB2CRevenue() {
        try {
            // B2C revenue comes from direct customer orders (Order entity)
            List<Order> allOrders = orderRepository.findAll();
            return allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getAmount() != null ? order.getAmount().doubleValue() : 0.0)
                .sum();
        } catch (Exception e) {
            System.err.println("Error calculating B2C revenue: " + e.getMessage());
            return 0.0;
        }
    }
    
    private double calculateB2BRevenue() {
        try {
            // B2B revenue comes from retailer orders (RetailerOrder entity)
            List<RetailerOrder> allRetailerOrders = retailerOrderRepository.findAll();
            return allRetailerOrders.stream()
                .filter(order -> order.getStatus() == RetailerOrder.OrderStatus.DELIVERED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
        } catch (Exception e) {
            System.err.println("Error calculating B2B revenue: " + e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * Get all retailers with their credit limit information
     */
    public List<RetailerCreditLimitDTO> getAllRetailersWithCreditLimits() {
        try {
            // Get all BUSINESS users
            List<User> retailers = userRepository.findByAccountType(User.AccountType.BUSINESS);
            
            return retailers.stream()
                .map(this::convertToRetailerCreditLimitDTO)
                .sorted((a, b) -> {
                    // Sort by credit usage percentage descending
                    double usageA = a.getCreditUsagePercentage() != null ? a.getCreditUsagePercentage() : 0.0;
                    double usageB = b.getCreditUsagePercentage() != null ? b.getCreditUsagePercentage() : 0.0;
                    return Double.compare(usageB, usageA);
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching retailers with credit limits: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    /**
     * Get specific retailer's credit limit information
     */
    public RetailerCreditLimitDTO getRetailerCreditLimit(String retailerId) {
        try {
            User retailer = userRepository.findById(retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));
                
            if (retailer.getAccountType() != User.AccountType.BUSINESS) {
                throw new RuntimeException("User is not a business/retailer account");
            }
            
            return convertToRetailerCreditLimitDTO(retailer);
        } catch (Exception e) {
            System.err.println("Error fetching retailer credit limit: " + e.getMessage());
            throw new RuntimeException("Failed to fetch retailer credit limit: " + e.getMessage());
        }
    }
    
    /**
     * Update retailer credit limit
     */
    public RetailerCreditLimitDTO updateRetailerCreditLimit(UpdateCreditLimitRequest request) {
        try {
            User retailer = userRepository.findById(request.getRetailerId())
                .orElseThrow(() -> new RuntimeException("Retailer not found"));
                
            if (retailer.getAccountType() != User.AccountType.BUSINESS) {
                throw new RuntimeException("User is not a business/retailer account");
            }
            
            // Get or create retailer limit
            RetailerLimit limit = retailerLimitRepository.findByRetailer(retailer)
                .orElse(new RetailerLimit());
            
            // If new limit, set retailer and initial values
            if (limit.getId() == null) {
                limit.setRetailer(retailer);
                limit.setUsedCredit(BigDecimal.ZERO);
                limit.setOutstandingAmount(BigDecimal.ZERO);
                limit.setStatus(RetailerLimit.LimitStatus.ACTIVE);
            }
            
            // Update credit limit
            BigDecimal oldLimit = limit.getCreditLimit();
            BigDecimal newLimit = request.getCreditLimit();
            limit.setCreditLimit(newLimit);
            
            // Recalculate available credit
            BigDecimal usedCredit = limit.getUsedCredit() != null ? limit.getUsedCredit() : BigDecimal.ZERO;
            limit.setAvailableCredit(newLimit.subtract(usedCredit));
            
            // Update payment terms if provided
            if (request.getPaymentTermsDays() != null) {
                limit.setPaymentTermsDays(request.getPaymentTermsDays());
            }
            
            // Update unit limit if provided
            if (request.getUnitLimit() != null) {
                Integer oldUnitLimit = limit.getUnitLimit();
                limit.setUnitLimit(request.getUnitLimit());
                
                // Initialize used units if not set
                if (limit.getUsedUnits() == null) {
                    limit.setUsedUnits(0);
                }
                
                // Update available units
                limit.updateAvailableUnits();
                
                System.out.println("✅ Updated unit limit for retailer " + retailer.getEmail() + 
                                 " from " + oldUnitLimit + " to " + request.getUnitLimit());
            }
            
            // Save the updated limit
            retailerLimitRepository.save(limit);
            
            System.out.println("✅ Updated credit limit for retailer " + retailer.getEmail() + 
                             " from " + oldLimit + " to " + newLimit);
            
            return convertToRetailerCreditLimitDTO(retailer);
        } catch (Exception e) {
            System.err.println("Error updating retailer credit limit: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update credit limit: " + e.getMessage());
        }
    }
    
    /**
     * Update retailer unit limit specifically
     */
    public RetailerCreditLimitDTO updateRetailerUnitLimit(com.example.topup.demo.dto.UpdateUnitLimitRequest request) {
        try {
            User retailer = userRepository.findById(request.getRetailerId())
                .orElseThrow(() -> new RuntimeException("Retailer not found"));
                
            if (retailer.getAccountType() != User.AccountType.BUSINESS) {
                throw new RuntimeException("User is not a business/retailer account");
            }
            
            // Get or create retailer limit
            RetailerLimit limit = retailerLimitRepository.findByRetailer(retailer)
                .orElse(new RetailerLimit());
            
            // If new limit, set retailer and initial values
            if (limit.getId() == null) {
                limit.setRetailer(retailer);
                limit.setUsedCredit(BigDecimal.ZERO);
                limit.setOutstandingAmount(BigDecimal.ZERO);
                limit.setStatus(RetailerLimit.LimitStatus.ACTIVE);
                // Set default credit limit if not set
                if (limit.getCreditLimit() == null) {
                    limit.setCreditLimit(BigDecimal.ZERO);
                    limit.setAvailableCredit(BigDecimal.ZERO);
                }
            }
            
            // Update unit limit
            Integer oldUnitLimit = limit.getUnitLimit();
            limit.setUnitLimit(request.getUnitLimit());
            
            // Initialize used units if not set
            if (limit.getUsedUnits() == null) {
                limit.setUsedUnits(0);
            }
            
            // Update available units
            limit.updateAvailableUnits();
            
            // Save the updated limit
            retailerLimitRepository.save(limit);
            
            System.out.println("✅ Updated unit limit for retailer " + retailer.getEmail() + 
                             " from " + oldUnitLimit + " to " + request.getUnitLimit());
            
            return convertToRetailerCreditLimitDTO(retailer);
        } catch (Exception e) {
            System.err.println("Error updating retailer unit limit: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update unit limit: " + e.getMessage());
        }
    }
    
    /**
     * Convert User entity to RetailerCreditLimitDTO
     */
    private RetailerCreditLimitDTO convertToRetailerCreditLimitDTO(User retailer) {
        RetailerCreditLimitDTO dto = new RetailerCreditLimitDTO();
        
        dto.setRetailerId(retailer.getId());
        dto.setRetailerName(retailer.getFullName());
        dto.setRetailerEmail(retailer.getEmail());
        
        // Get retailer limit if exists
        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer(retailer);
        
        if (limitOpt.isPresent()) {
            RetailerLimit limit = limitOpt.get();
            dto.setId(limit.getId());
            dto.setCreditLimit(limit.getCreditLimit());
            dto.setAvailableCredit(limit.getAvailableCredit());
            dto.setUsedCredit(limit.getUsedCredit());
            dto.setOutstandingAmount(limit.getOutstandingAmount());
            dto.setPaymentTermsDays(limit.getPaymentTermsDays());
            dto.setLastPaymentDate(limit.getLastPaymentDate());
            dto.setNextDueDate(limit.getNextDueDate());
            dto.setStatus(limit.getStatus().toString());
            
            // Calculate credit usage percentage
            if (limit.getCreditLimit() != null && limit.getCreditLimit().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal usedCredit = limit.getUsedCredit() != null ? limit.getUsedCredit() : BigDecimal.ZERO;
                double percentage = usedCredit.divide(limit.getCreditLimit(), 4, java.math.RoundingMode.HALF_UP)
                                             .multiply(BigDecimal.valueOf(100))
                                             .doubleValue();
                dto.setCreditUsagePercentage(percentage);
            } else {
                dto.setCreditUsagePercentage(0.0);
            }
            
            // Set unit limit fields
            dto.setUnitLimit(limit.getUnitLimit());
            dto.setUsedUnits(limit.getUsedUnits());
            dto.setAvailableUnits(limit.getAvailableUnits());
            dto.setUnitUsagePercentage(limit.getUnitUsagePercentage());
            
            // Determine level based on credit limit
            dto.setLevel(determineCreditLevel(limit.getCreditLimit()));
        } else {
            // No limit set yet
            dto.setCreditLimit(BigDecimal.ZERO);
            dto.setAvailableCredit(BigDecimal.ZERO);
            dto.setUsedCredit(BigDecimal.ZERO);
            dto.setOutstandingAmount(BigDecimal.ZERO);
            dto.setPaymentTermsDays(30);
            dto.setStatus("NOT_SET");
            dto.setCreditUsagePercentage(0.0);
            dto.setLevel("NOT_SET");
            
            // Default unit limit values
            dto.setUnitLimit(0);
            dto.setUsedUnits(0);
            dto.setAvailableUnits(0);
            dto.setUnitUsagePercentage(0.0);
        }
        
        return dto;
    }
    
    /**
     * Determine credit level based on credit limit
     */
    private String determineCreditLevel(BigDecimal creditLimit) {
        if (creditLimit == null || creditLimit.compareTo(BigDecimal.ZERO) == 0) {
            return "NOT_SET";
        }
        
        double limit = creditLimit.doubleValue();
        
        if (limit >= 20000) {
            return "DIAMOND";
        } else if (limit >= 15000) {
            return "PLATINUM";
        } else if (limit >= 10000) {
            return "GOLD";
        } else if (limit >= 7500) {
            return "SILVER";
        } else if (limit >= 5000) {
            return "BRONZE";
        } else {
            return "STARTER";
        }
    }

    /**
     * Get user details by user ID (includes purchases and usage)
     */
    public Map<String, Object> getUserDetails(String userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (!optionalUser.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = optionalUser.get();
        Map<String, Object> userDetails = new HashMap<>();
        
        // Basic user info
        Map<String, Object> basicInfo = new HashMap<>();
        basicInfo.put("id", user.getId());
        basicInfo.put("firstName", user.getFirstName());
        basicInfo.put("lastName", user.getLastName());
        basicInfo.put("email", user.getEmail());
        basicInfo.put("mobileNumber", user.getMobileNumber());
        basicInfo.put("accountType", user.getAccountType().name());
        basicInfo.put("accountStatus", user.getAccountStatus().name());
        basicInfo.put("createdDate", user.getCreatedDate());
        basicInfo.put("lastModifiedDate", user.getLastModifiedDate());
        basicInfo.put("emailVerified", user.isEmailVerified());
        userDetails.put("basicInfo", basicInfo);
        
        // Business details if applicable
        if (user.getBusinessDetails() != null) {
            BusinessDetails business = user.getBusinessDetails();
            Map<String, Object> businessInfo = new HashMap<>();
            businessInfo.put("companyName", business.getCompanyName());
            businessInfo.put("organizationNumber", business.getOrganizationNumber());
            businessInfo.put("vatNumber", business.getVatNumber());
            businessInfo.put("companyEmail", business.getCompanyEmail());
            businessInfo.put("verificationMethod", business.getVerificationMethod().name());
            businessInfo.put("verificationStatus", business.getVerificationStatus().name());
            businessInfo.put("postalAddress", business.getPostalAddress());
            businessInfo.put("billingAddress", business.getBillingAddress());
            businessInfo.put("adminNotes", business.getAdminNotes());
            userDetails.put("businessDetails", businessInfo);
        }
        
        // Get purchases from all sources
        List<Map<String, Object>> purchases = new ArrayList<>();
        double totalSpent = 0.0;
        
        // 1. Get eSIM orders
        List<EsimOrderRequest> esimOrders = esimOrderRequestRepository.findByCustomerEmail(user.getEmail());
        for (EsimOrderRequest order : esimOrders) {
            Map<String, Object> purchase = new HashMap<>();
            purchase.put("orderId", order.getId());
            purchase.put("orderNumber", order.getOrderNumber());
            purchase.put("productName", order.getProductName());
            purchase.put("amount", order.getAmount());
            purchase.put("status", order.getStatus());
            purchase.put("orderDate", order.getRequestDate());
            purchase.put("type", "eSIM");
            purchases.add(purchase);
            
            // Sum up approved/completed orders
            String status = order.getStatus();
            if ("APPROVED".equals(status) || "COMPLETED".equals(status)) {
                totalSpent += order.getAmount();
            }
        }
        
        // 2. Get regular customer orders (bundles/ePIN) by customer email
        List<Order> customerOrders = orderRepository.findByCustomerEmailOrderByCreatedDateDesc(user.getEmail());
        for (Order order : customerOrders) {
            Map<String, Object> purchase = new HashMap<>();
            purchase.put("orderId", order.getId());
            purchase.put("orderNumber", order.getOrderNumber());
            purchase.put("productName", order.getProductName());
            purchase.put("amount", order.getAmount().doubleValue());
            purchase.put("status", order.getStatus().name());
            purchase.put("orderDate", order.getCreatedDate());
            purchase.put("type", order.getProductType() != null ? order.getProductType() : "Bundle");
            purchase.put("quantity", order.getQuantity());
            purchases.add(purchase);
            
            // Sum up completed orders
            Order.OrderStatus status = order.getStatus();
            if (status == Order.OrderStatus.COMPLETED) {
                totalSpent += order.getAmount().doubleValue();
            }
        }
        
        // 2b. Get orders where user is the retailer (for direct purchases by retailers)
        List<Order> retailerDirectOrders = orderRepository.findByRetailer_Id(user.getId());
        for (Order order : retailerDirectOrders) {
            // Skip if already added (avoid duplicates)
            boolean alreadyAdded = purchases.stream()
                .anyMatch(p -> p.get("orderId").equals(order.getId()));
            if (alreadyAdded) continue;
            
            Map<String, Object> purchase = new HashMap<>();
            purchase.put("orderId", order.getId());
            purchase.put("orderNumber", order.getOrderNumber());
            purchase.put("productName", order.getProductName());
            purchase.put("amount", order.getAmount().doubleValue());
            purchase.put("status", order.getStatus().name());
            purchase.put("orderDate", order.getCreatedDate());
            purchase.put("type", order.getProductType() != null ? order.getProductType() : "Bundle");
            purchase.put("quantity", order.getQuantity());
            purchases.add(purchase);
            
            // Sum up completed orders
            Order.OrderStatus status = order.getStatus();
            if (status == Order.OrderStatus.COMPLETED) {
                totalSpent += order.getAmount().doubleValue();
            }
        }
        
        // 3. If user is a retailer, get their retailer orders too
        if (user.getAccountType() == User.AccountType.BUSINESS) {
            List<RetailerOrder> retailerOrders = retailerOrderRepository.findByRetailerId(user.getId());
            for (RetailerOrder order : retailerOrders) {
                Map<String, Object> purchase = new HashMap<>();
                purchase.put("orderId", order.getId());
                purchase.put("orderNumber", order.getOrderNumber());
                purchase.put("productName", order.getItems().size() + " items");
                purchase.put("amount", order.getTotalAmount().doubleValue());
                purchase.put("status", order.getStatus().name());
                purchase.put("orderDate", order.getCreatedDate());
                purchase.put("type", "Retailer Order");
                purchase.put("itemCount", order.getItems().size());
                purchases.add(purchase);
                
                // Sum up delivered retailer orders
                RetailerOrder.OrderStatus status = order.getStatus();
                if (status == RetailerOrder.OrderStatus.DELIVERED) {
                    totalSpent += order.getTotalAmount().doubleValue();
                }
            }
        }
        
        // Sort purchases by date (most recent first)
        purchases.sort((p1, p2) -> {
            LocalDateTime d1 = (LocalDateTime) p1.get("orderDate");
            LocalDateTime d2 = (LocalDateTime) p2.get("orderDate");
            return d2.compareTo(d1);
        });
        
        userDetails.put("purchases", purchases);
        
        // Usage statistics
        Map<String, Object> usage = new HashMap<>();
        usage.put("totalOrders", purchases.size());
        usage.put("totalSpent", totalSpent);
        usage.put("averageOrderValue", purchases.size() > 0 ? totalSpent / purchases.size() : 0.0);
        usage.put("lastPurchaseDate", purchases.isEmpty() ? null : 
            purchases.stream()
                .map(p -> (LocalDateTime) p.get("orderDate"))
                .max(Comparator.naturalOrder())
                .orElse(null));
        userDetails.put("usage", usage);
        
        return userDetails;
    }

    /**
     * Suspend user account
     */
    public boolean suspendUser(String userId, String reason) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (!optionalUser.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = optionalUser.get();
        user.setAccountStatus(User.AccountStatus.SUSPENDED);
        
        // Store suspension reason in business details admin notes if available
        if (user.getBusinessDetails() != null) {
            String currentNotes = user.getBusinessDetails().getAdminNotes();
            String newNotes = (currentNotes != null ? currentNotes + "\n" : "") + 
                            "SUSPENDED: " + LocalDateTime.now() + " - " + reason;
            user.getBusinessDetails().setAdminNotes(newNotes);
        }
        
        userRepository.save(user);
        
        // Send suspension email
        try {
            emailService.sendSuspensionEmail(user.getEmail(), user.getFirstName(), reason);
        } catch (Exception e) {
            // Log email error but don't fail the suspension
            System.err.println("Failed to send suspension email: " + e.getMessage());
        }
        
        return true;
    }

    /**
     * Activate user account
     */
    public boolean activateUser(String userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (!optionalUser.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = optionalUser.get();
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        
        // Add activation note
        if (user.getBusinessDetails() != null) {
            String currentNotes = user.getBusinessDetails().getAdminNotes();
            String newNotes = (currentNotes != null ? currentNotes + "\n" : "") + 
                            "ACTIVATED: " + LocalDateTime.now();
            user.getBusinessDetails().setAdminNotes(newNotes);
        }
        
        userRepository.save(user);
        
        // Send activation email
        try {
            emailService.sendActivationEmail(user.getEmail(), user.getFirstName());
        } catch (Exception e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
        }
        
        return true;
    }

    /**
     * Update user details (email and mobile number)
     */
    public boolean updateUserDetails(String userId, String newEmail, String newMobileNumber) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (!optionalUser.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = optionalUser.get();
        
        // Check if new email is already taken by another user
        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new RuntimeException("Email already exists for another user");
            }
            user.setEmail(newEmail.toLowerCase());
            
            // If email is changed, mark as unverified and send new verification
            user.setEmailVerified(false);
            
            // Add update note
            if (user.getBusinessDetails() != null) {
                String currentNotes = user.getBusinessDetails().getAdminNotes();
                String newNotes = (currentNotes != null ? currentNotes + "\n" : "") + 
                                "EMAIL_UPDATED: " + LocalDateTime.now() + " - Changed by admin";
                user.getBusinessDetails().setAdminNotes(newNotes);
            }
        }
        
        // Update mobile number if provided
        if (newMobileNumber != null && !newMobileNumber.trim().isEmpty()) {
            user.setMobileNumber(newMobileNumber.trim());
            
            // Add update note for mobile
            if (user.getBusinessDetails() != null) {
                String currentNotes = user.getBusinessDetails().getAdminNotes();
                String newNotes = (currentNotes != null ? currentNotes + "\n" : "") + 
                                "MOBILE_UPDATED: " + LocalDateTime.now() + " - Changed by admin";
                user.getBusinessDetails().setAdminNotes(newNotes);
            }
        }
        
        user.setLastModifiedDate(LocalDateTime.now());
        userRepository.save(user);
        
        // Send email verification if email was changed
        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            try {
                // Send verification email for new email
                emailService.sendEmailVerification(newEmail, user.getFirstName(), 
                    java.util.UUID.randomUUID().toString());
            } catch (Exception e) {
                // Log email error but don't fail the update
                System.err.println("Failed to send verification email: " + e.getMessage());
            }
        }
        
        return true;
    }

    /**
     * Delete user account (soft delete by marking as deleted)
     */
    public boolean deleteUser(String userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (!optionalUser.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        User user = optionalUser.get();
        
        // Soft delete - mark as deleted status
        user.setAccountStatus(User.AccountStatus.SUSPENDED);
        
        // Add deletion marker in admin notes
        if (user.getBusinessDetails() != null) {
            String currentNotes = user.getBusinessDetails().getAdminNotes();
            String newNotes = (currentNotes != null ? currentNotes + "\n" : "") + 
                            "DELETED: " + LocalDateTime.now();
            user.getBusinessDetails().setAdminNotes(newNotes);
        }
        
        // Mark email as deleted
        user.setEmail("DELETED_" + user.getId() + "_" + user.getEmail());
        
        userRepository.save(user);
        
        return true;
    }

    /**
     * Generate mock retailer orders for testing
     */
    public List<RetailerOrder> generateMockRetailerOrders(String retailerId, int count) {
        List<RetailerOrder> mockOrders = new ArrayList<>();
        Random random = new Random();
        
        String[] bundleNames = {
            "Lyca 11GB Bundle", "Lyca 22GB Bundle", "Lyca 33GB Bundle",
            "Data Bundle 10GB", "Data Bundle 20GB", "Voice Bundle Premium",
            "International Bundle", "Unlimited Bundle", "Student Bundle"
        };
        
        String[] customerNames = {
            "John Smith", "Emma Johnson", "Michael Brown", "Sarah Davis",
            "David Wilson", "Lisa Anderson", "James Taylor", "Maria Garcia",
            "Robert Martinez", "Jennifer Lopez", "William Robinson", "Elizabeth Clark"
        };
        
        RetailerOrder.OrderStatus[] statuses = RetailerOrder.OrderStatus.values();
        RetailerOrder.PaymentStatus[] paymentStatuses = RetailerOrder.PaymentStatus.values();
        
        for (int i = 0; i < count; i++) {
            RetailerOrder order = new RetailerOrder();
            order.setRetailerId(retailerId);
            order.setOrderNumber("ORD-MOCK-" + System.currentTimeMillis() + "-" + i);
            
            // Create random order items
            List<RetailerOrder.OrderItem> items = new ArrayList<>();
            int itemCount = random.nextInt(3) + 1; // 1-3 items
            
            for (int j = 0; j < itemCount; j++) {
                RetailerOrder.OrderItem item = new RetailerOrder.OrderItem();
                item.setProductId("PROD-MOCK-" + random.nextInt(100));
                item.setProductName(bundleNames[random.nextInt(bundleNames.length)]);
                item.setProductType("BUNDLE");
                item.setCategory("MOBILE_DATA");
                item.setQuantity(random.nextInt(20) + 1); // 1-20 units
                
                BigDecimal unitPrice = BigDecimal.valueOf(49 + random.nextInt(200)); // 49-249 NOK
                item.setUnitPrice(unitPrice);
                item.setRetailPrice(unitPrice.multiply(BigDecimal.valueOf(1.2))); // 20% markup
                item.setDataAmount((10 + random.nextInt(30)) + "GB");
                item.setValidity((7 + random.nextInt(23)) + " days");
                
                items.add(item);
            }
            
            order.setItems(items);
            order.calculateTotalAmount();
            order.setCurrency("NOK");
            
            // Random status
            RetailerOrder.OrderStatus status = statuses[random.nextInt(statuses.length)];
            order.setStatus(status);
            
            // Payment status based on order status
            if (status == RetailerOrder.OrderStatus.DELIVERED) {
                order.setPaymentStatus(RetailerOrder.PaymentStatus.COMPLETED);
            } else if (status == RetailerOrder.OrderStatus.CANCELLED) {
                order.setPaymentStatus(RetailerOrder.PaymentStatus.FAILED);
            } else {
                order.setPaymentStatus(paymentStatuses[random.nextInt(paymentStatuses.length)]);
            }
            
            order.setPaymentMethod(random.nextBoolean() ? "CREDIT_ACCOUNT" : "BANK_TRANSFER");
            order.setPaymentTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));
            
            // Billing info
            RetailerOrder.BillingInfo billingInfo = new RetailerOrder.BillingInfo();
            billingInfo.setCompanyName("Test Company " + (i + 1));
            billingInfo.setContactName(customerNames[random.nextInt(customerNames.length)]);
            billingInfo.setEmail("customer" + (i + 1) + "@example.com");
            billingInfo.setPhone("+47" + (10000000 + random.nextInt(90000000)));
            billingInfo.setAddress("Test Address " + (i + 1));
            billingInfo.setCity("Oslo");
            billingInfo.setPostalCode("0" + (100 + random.nextInt(900)));
            billingInfo.setCountry("Norway");
            order.setBillingInfo(billingInfo);
            
            // Random dates within last 30 days
            LocalDateTime createdDate = LocalDateTime.now().minusDays(random.nextInt(30));
            order.setCreatedDate(createdDate);
            order.setLastModifiedDate(createdDate.plusHours(random.nextInt(48)));
            
            if (status == RetailerOrder.OrderStatus.DELIVERED) {
                order.setDeliveredDate(createdDate.plusDays(random.nextInt(7)));
            }
            
            if (status == RetailerOrder.OrderStatus.CANCELLED) {
                String[] reasons = {
                    "Customer request", "Out of stock", "Payment failed",
                    "Duplicate order", "Address incorrect"
                };
                order.setCancellationReason(reasons[random.nextInt(reasons.length)]);
            }
            
            order.setCreatedBy(retailerId);
            
            mockOrders.add(order);
        }
        
        // Save all mock orders
        return retailerOrderRepository.saveAll(mockOrders);
    }
    
    /**
     * Clear all mock retailer orders
     */
    public void clearMockRetailerOrders() {
        List<RetailerOrder> mockOrders = retailerOrderRepository.findAll().stream()
            .filter(order -> order.getOrderNumber().contains("MOCK"))
            .collect(Collectors.toList());
        
        retailerOrderRepository.deleteAll(mockOrders);
    }
    
    // Margin Rate Management
    public void updateRetailerMarginRate(String retailerEmail, Double marginRate) {
        System.out.println("=== UPDATING MARGIN RATE ===");
        System.out.println("Email: " + retailerEmail);
        System.out.println("Margin Rate: " + marginRate);
        
        User retailer = userRepository.findByEmailIgnoreCase(retailerEmail)
            .orElseThrow(() -> new RuntimeException("Retailer not found with email: " + retailerEmail));
        
        if (!retailer.getAccountType().equals(User.AccountType.BUSINESS)) {
            throw new RuntimeException("User is not a business retailer");
        }
        
        // Get or create business details
        BusinessDetails businessDetails = retailer.getBusinessDetails();
        if (businessDetails == null) {
            businessDetails = new BusinessDetails();
            businessDetails.setUser(retailer);
            businessDetails.setCompanyName(retailer.getFullName() + " Business");
            businessDetails.setCreatedDate(LocalDateTime.now());
        }
        
        // Update metadata with margin rate
        Map<String, Object> metadata = businessDetails.getMetadata();
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        
        metadata.put("marginRate", marginRate);
        metadata.put("marginRateSetDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        metadata.put("marginRateSetBy", "admin");
        
        businessDetails.setMetadata(metadata);
        businessDetails.setUpdatedDate(LocalDateTime.now());
        
        // Save business details
        businessDetailsRepository.save(businessDetails);
        
        // Update retailer's updated date
        retailer.setUpdatedDate(LocalDateTime.now());
        userRepository.save(retailer);
        
        System.out.println("✅ Margin rate saved successfully!");
        System.out.println("Saved metadata: " + metadata);
    }
    
    public Double getRetailerMarginRate(String retailerEmail) {
        System.out.println("=== GETTING MARGIN RATE ===");
        System.out.println("Email: " + retailerEmail);
        
        User retailer = userRepository.findByEmailIgnoreCase(retailerEmail)
            .orElseThrow(() -> new RuntimeException("Retailer not found with email: " + retailerEmail));
        
        if (!retailer.getAccountType().equals(User.AccountType.BUSINESS)) {
            throw new RuntimeException("User is not a business retailer");
        }
        
        // Check business details for margin rate
        BusinessDetails businessDetails = retailer.getBusinessDetails();
        System.out.println("Business Details: " + (businessDetails != null ? "Found" : "NULL"));
        
        if (businessDetails != null) {
            Map<String, Object> metadata = businessDetails.getMetadata();
            System.out.println("Metadata: " + metadata);
            
            if (metadata != null && metadata.containsKey("marginRate")) {
                Object marginRateObj = metadata.get("marginRate");
                System.out.println("Found marginRate in metadata: " + marginRateObj + " (type: " + (marginRateObj != null ? marginRateObj.getClass().getSimpleName() : "null") + ")");
                
                if (marginRateObj instanceof Number) {
                    Double rate = ((Number) marginRateObj).doubleValue();
                    System.out.println("✅ Returning margin rate: " + rate + "%");
                    return rate;
                }
                if (marginRateObj instanceof String) {
                    try {
                        Double rate = Double.parseDouble((String) marginRateObj);
                        System.out.println("✅ Returning parsed margin rate: " + rate + "%");
                        return rate;
                    } catch (NumberFormatException e) {
                        System.out.println("❌ Failed to parse margin rate string: " + marginRateObj);
                    }
                }
            } else {
                System.out.println("❌ No marginRate found in metadata");
            }
        }
        
        System.out.println("❌ Returning null - no admin margin rate set");
        return null;
    }
}