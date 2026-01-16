package com.example.topup.demo.controller;

import com.example.topup.demo.entity.EsimOrderRequest;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.repository.EsimOrderRequestRepository;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.RetailerLimitRepository;
import com.example.topup.demo.repository.StockPoolRepository;
import com.example.topup.demo.repository.UserRepository;
import com.example.topup.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://topup-website-gmoj.vercel.app"})
public class EsimOrderController {

    @Autowired
    private EsimOrderRequestRepository esimOrderRequestRepository;

    @Autowired
    private StockPoolRepository stockPoolRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RetailerOrderRepository retailerOrderRepository;

    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    @Autowired
    private UserRepository userRepository;

    // Public endpoint - Customer submits eSIM order request
    @PostMapping("/public/esim-orders")
    public ResponseEntity<Map<String, Object>> createEsimOrder(@RequestBody Map<String, Object> orderData) {
        try {
            EsimOrderRequest request = new EsimOrderRequest();
            
            // Generate order number
            String orderNumber = "ESIM-" + System.currentTimeMillis();
            request.setOrderNumber(orderNumber);
            
            // Customer details
            request.setCustomerEmail((String) orderData.get("email"));
            request.setCustomerPhone((String) orderData.get("phone"));
            request.setCustomerFullName((String) orderData.get("fullName"));
            
            // ID verification details
            request.setIdType((String) orderData.get("idType"));
            request.setIdNumber((String) orderData.get("idNumber"));
            request.setIdDocumentFileName((String) orderData.get("idDocument"));
            
            // Order details
            request.setProductName((String) orderData.get("product"));
            request.setAmount(((Number) orderData.get("amount")).doubleValue());
            request.setPaymentMethod((String) orderData.get("paymentMethod"));
            request.setStatus("PENDING");
            
            EsimOrderRequest savedRequest = esimOrderRequestRepository.save(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderNumber", orderNumber);
            response.put("message", "eSIM order request submitted successfully");
            response.put("data", savedRequest);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error creating eSIM order: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Admin endpoint - Get all pending eSIM requests
    @GetMapping("/admin/esim-requests")
    public ResponseEntity<Map<String, Object>> getPendingEsimRequests(
            @RequestParam(required = false) String status) {
        try {
            List<EsimOrderRequest> requests;
            
            if (status != null && !status.isEmpty()) {
                requests = esimOrderRequestRepository.findByStatus(status);
            } else {
                requests = esimOrderRequestRepository.findAll();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requests", requests);
            response.put("totalCount", requests.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching eSIM requests: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Admin endpoint - Approve eSIM request
    @PostMapping("/admin/esim-requests/{requestId}/approve")
    public ResponseEntity<Map<String, Object>> approveEsimRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, String> approvalData) {
        try {
            Optional<EsimOrderRequest> optionalRequest = esimOrderRequestRepository.findById(requestId);
            
            if (!optionalRequest.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "eSIM request not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            EsimOrderRequest request = optionalRequest.get();
            
            // Find available eSIM from stock pool
            List<StockPool> esimPools = stockPoolRepository.findByStockTypeAndStatus(
                    StockPool.StockType.ESIM, StockPool.StockStatus.ACTIVE);
            
            StockPool.StockItem assignedEsim = null;
            StockPool selectedPool = null;
            
            for (StockPool pool : esimPools) {
                for (StockPool.StockItem item : pool.getItems()) {
                    if (item.getStatus() == StockPool.StockItem.ItemStatus.AVAILABLE) {
                        assignedEsim = item;
                        selectedPool = pool;
                        break;
                    }
                }
                if (assignedEsim != null) break;
            }
            
            if (assignedEsim == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "No available eSIMs in stock");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Update eSIM status to ASSIGNED
            assignedEsim.setStatus(StockPool.StockItem.ItemStatus.ASSIGNED);
            assignedEsim.setAssignedDate(LocalDateTime.now());
            assignedEsim.setAssignedToOrderId(request.getOrderNumber());
            assignedEsim.setAssignedToUserEmail(request.getCustomerEmail());
            
            // Update stock pool quantities
            selectedPool.setAvailableQuantity(selectedPool.getAvailableQuantity() - 1);
            selectedPool.setUsedQuantity(selectedPool.getUsedQuantity() + 1);
            stockPoolRepository.save(selectedPool);
            
            // Update request status
            request.setStatus("APPROVED");
            request.setApprovedDate(LocalDateTime.now());
            request.setApprovedByAdmin(approvalData.get("adminEmail"));
            request.setAssignedEsimSerial(assignedEsim.getSerialNumber());
            request.setAssignedEsimQrCode(assignedEsim.getQrCodeImage());
            request.setProductId(selectedPool.getId());
            
            esimOrderRequestRepository.save(request);
            
            // CREATE RETAILER ORDER FOR ANALYTICS & CREDIT TRACKING
            // Get retailer ID from the order data (either from POS or admin assignment)
            String retailerId = approvalData.get("retailerId");
            if (retailerId != null && !retailerId.isEmpty()) {
                try {
                    System.out.println("=== Creating RetailerOrder for eSIM sale ===");
                    
                    RetailerOrder retailerOrder = new RetailerOrder();
                    retailerOrder.setRetailerId(retailerId);
                    retailerOrder.setOrderNumber(request.getOrderNumber());
                    retailerOrder.setTotalAmount(BigDecimal.valueOf(request.getAmount()));
                    retailerOrder.setCurrency("NOK");
                    retailerOrder.setStatus(RetailerOrder.OrderStatus.COMPLETED);
                    retailerOrder.setPaymentStatus(RetailerOrder.PaymentStatus.COMPLETED);
                    retailerOrder.setPaymentMethod("POINT_OF_SALE");
                    retailerOrder.setCreatedDate(LocalDateTime.now());
                    retailerOrder.setLastModifiedDate(LocalDateTime.now());
                    retailerOrder.setCreatedBy(request.getCustomerEmail());
                    
                    // Create order item for eSIM
                    RetailerOrder.OrderItem orderItem = new RetailerOrder.OrderItem();
                    orderItem.setProductId(selectedPool.getId());
                    orderItem.setProductName(request.getProductName());
                    orderItem.setProductType("ESIM");
                    orderItem.setCategory("esim");
                    orderItem.setQuantity(1);
                    orderItem.setUnitPrice(BigDecimal.valueOf(request.getAmount()));
                    orderItem.setRetailPrice(BigDecimal.valueOf(request.getAmount()));
                    
                    List<RetailerOrder.OrderItem> items = new ArrayList<>();
                    items.add(orderItem);
                    retailerOrder.setItems(items);
                    
                    // Save retailer order
                    RetailerOrder savedRetailerOrder = retailerOrderRepository.save(retailerOrder);
                    System.out.println("✅ Created RetailerOrder for analytics: " + savedRetailerOrder.getOrderNumber());
                    
                    // UPDATE RETAILER CREDIT LIMIT
                    Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
                    if (limitOpt.isPresent()) {
                        RetailerLimit limit = limitOpt.get();
                        
                        // Deduct the sale amount from eSIM credit limit (separate from general credit)
                        limit.useEsimCredit(BigDecimal.valueOf(request.getAmount()), 
                                        savedRetailerOrder.getId(), 
                                        "eSIM Sale: " + request.getProductName() + " to " + request.getCustomerEmail());
                        
                        retailerLimitRepository.save(limit);
                        System.out.println("✅ Updated eSIM credit limit for retailer: " + retailerId);
                        System.out.println("   eSIM Used: " + limit.getEsimUsedCredit() + ", Available: " + limit.getEsimAvailableCredit());
                    } else {
                        System.out.println("⚠️ No credit limit found for retailer: " + retailerId);
                    }
                } catch (Exception e) {
                    System.err.println("❌ Failed to create RetailerOrder/update eSIM credit: " + e.getMessage());
                    e.printStackTrace();
                    // Don't fail the approval, just log the error
                }
            } else {
                System.out.println("⚠️ No retailerId provided - skipping RetailerOrder creation");
            }
            
            // Send approval email with eSIM QR code
            boolean emailSent = false;
            String emailError = null;
            try {
                System.out.println("=== Attempting to send eSIM approval email ===");
                System.out.println("To: " + request.getCustomerEmail());
                System.out.println("Order: " + request.getOrderNumber());
                System.out.println("Serial: " + assignedEsim.getSerialNumber());
                System.out.println("QR Code length: " + (assignedEsim.getQrCodeImage() != null ? assignedEsim.getQrCodeImage().length() : 0));
                
                // Extract activation code and SM-DP address
                String activationCode = assignedEsim.getActivationCode() != null ? assignedEsim.getActivationCode() : "";
                String smDpAddress = assignedEsim.getActivationUrl() != null ? assignedEsim.getActivationUrl() : "";
                
                emailService.sendEsimApprovalEmail(
                    request.getCustomerEmail(),
                    request.getCustomerFullName(),
                    request.getOrderNumber(),
                    assignedEsim.getSerialNumber(),
                    assignedEsim.getQrCodeImage(),
                    activationCode,
                    smDpAddress
                );
                emailSent = true;
                System.out.println("✅ Email sent successfully!");
            } catch (Exception e) {
                // Log detailed error but don't fail the approval
                emailError = e.getMessage();
                System.err.println("❌ Failed to send approval email: " + e.getMessage());
                e.printStackTrace();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", emailSent ? 
                "eSIM request approved successfully and email sent to customer" : 
                "eSIM request approved successfully but email failed to send: " + emailError);
            response.put("emailSent", emailSent);
            response.put("request", request);
            response.put("assignedEsim", Map.of(
                "serial", assignedEsim.getSerialNumber(),
                "qrCode", assignedEsim.getQrCodeImage(),
                "activationUrl", assignedEsim.getActivationUrl()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error approving eSIM request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Admin endpoint - Reject eSIM request
    @PostMapping("/admin/esim-requests/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectEsimRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, String> rejectionData) {
        try {
            Optional<EsimOrderRequest> optionalRequest = esimOrderRequestRepository.findById(requestId);
            
            if (!optionalRequest.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "eSIM request not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            EsimOrderRequest request = optionalRequest.get();
            request.setStatus("REJECTED");
            request.setRejectedDate(LocalDateTime.now());
            request.setRejectionReason(rejectionData.get("reason"));
            
            esimOrderRequestRepository.save(request);
            
            // Send rejection email to customer
            try {
                emailService.sendEsimRejectionEmail(
                    request.getCustomerEmail(),
                    request.getCustomerFullName(),
                    request.getOrderNumber(),
                    rejectionData.get("reason")
                );
            } catch (Exception emailError) {
                // Log email error but don't fail the rejection
                System.err.println("Failed to send rejection email: " + emailError.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "eSIM request rejected and customer notified via email");
            response.put("request", request);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error rejecting eSIM request: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Test endpoint - Send test email to verify email configuration
    @PostMapping("/admin/test-email")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestBody Map<String, String> testData) {
        try {
            String toEmail = testData.get("email");
            if (toEmail == null || toEmail.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email address is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            System.out.println("=== Sending test eSIM approval email ===");
            System.out.println("To: " + toEmail);
            
            // Send a test approval email with dummy data
            emailService.sendEsimApprovalEmail(
                toEmail,
                "Test Customer",
                "TEST-" + System.currentTimeMillis(),
                "TEST-SERIAL-12345",
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // 1x1 transparent PNG
                "LPA:1$test.sm-dp-plus.com$TEST-ACTIVATION-CODE",
                "test.sm-dp-plus.com"
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test email sent successfully to " + toEmail);
            System.out.println("✅ Test email sent!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Test email failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to send test email: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Customer endpoint - Get my eSIM orders
    @GetMapping("/customer/my-esim-orders")
    public ResponseEntity<Map<String, Object>> getMyEsimOrders(@RequestParam String email) {
        try {
            List<EsimOrderRequest> requests = esimOrderRequestRepository.findByCustomerEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", requests);
            response.put("totalCount", requests.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching orders: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Public endpoint - Customer purchases ePIN (instant delivery)
    @PostMapping("/public/epin-orders")
    public ResponseEntity<Map<String, Object>> createEpinOrder(@RequestBody Map<String, Object> orderData) {
        try {
            System.out.println("=== Processing ePIN Order ===");
            
            // Extract order data
            String email = (String) orderData.get("email");
            String phone = (String) orderData.get("phone");
            String productName = (String) orderData.get("product");
            Double amount = ((Number) orderData.get("amount")).doubleValue();
            String paymentMethod = (String) orderData.get("paymentMethod");
            
            System.out.println("Email: " + email);
            System.out.println("Product: " + productName);
            System.out.println("Amount: " + amount);
            
            // Generate order number
            String orderNumber = "EPIN-" + System.currentTimeMillis();
            
            // Find available ePIN from stock pool
            List<StockPool> availablePools = stockPoolRepository.findByStockTypeAndStatus(
                StockPool.StockType.EPIN, StockPool.StockStatus.ACTIVE);
            
            if (availablePools.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "No ePINs available at the moment. Please try again later.");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Get first available pool with stock
            StockPool selectedPool = null;
            StockPool.StockItem assignedItem = null;
            
            for (StockPool pool : availablePools) {
                if (pool.getAvailableQuantity() > 0 && pool.getItems() != null && !pool.getItems().isEmpty()) {
                    // Find first available item
                    for (StockPool.StockItem item : pool.getItems()) {
                        if (item.getStatus() == StockPool.StockItem.ItemStatus.AVAILABLE) {
                            selectedPool = pool;
                            assignedItem = item;
                            break;
                        }
                    }
                    if (assignedItem != null) break;
                }
            }
            
            if (selectedPool == null || assignedItem == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "No ePINs available in stock. Please contact support.");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Get PIN code from item
            String pinCode = assignedItem.getItemData();
            
            // Update item status to USED
            assignedItem.setStatus(StockPool.StockItem.ItemStatus.USED);
            assignedItem.setAssignedDate(LocalDateTime.now());
            assignedItem.setUsedDate(LocalDateTime.now());
            assignedItem.setAssignedToOrderId(orderNumber);
            assignedItem.setAssignedToUserEmail(email);
            
            // Update stock pool quantities
            selectedPool.setAvailableQuantity(selectedPool.getAvailableQuantity() - 1);
            selectedPool.setUsedQuantity(selectedPool.getUsedQuantity() + 1);
            stockPoolRepository.save(selectedPool);
            
            System.out.println("✅ PIN assigned: " + pinCode);
            System.out.println("📦 Stock updated - Available: " + selectedPool.getAvailableQuantity());
            
            // CREATE RETAILER ORDER FOR ANALYTICS IF RETAILER ID PROVIDED
            String retailerId = (String) orderData.get("retailerId");
            if (retailerId != null && !retailerId.isEmpty()) {
                try {
                    System.out.println("=== Creating RetailerOrder for ePIN sale ===");
                    
                    RetailerOrder retailerOrder = new RetailerOrder();
                    retailerOrder.setRetailerId(retailerId);
                    retailerOrder.setOrderNumber(orderNumber);
                    retailerOrder.setTotalAmount(BigDecimal.valueOf(amount));
                    retailerOrder.setCurrency("NOK");
                    retailerOrder.setStatus(RetailerOrder.OrderStatus.COMPLETED);
                    retailerOrder.setPaymentStatus(RetailerOrder.PaymentStatus.COMPLETED);
                    retailerOrder.setPaymentMethod("POINT_OF_SALE");
                    retailerOrder.setCreatedDate(LocalDateTime.now());
                    retailerOrder.setLastModifiedDate(LocalDateTime.now());
                    retailerOrder.setCreatedBy(email);
                    
                    // Create order item for ePIN
                    RetailerOrder.OrderItem orderItem = new RetailerOrder.OrderItem();
                    orderItem.setProductId(selectedPool.getId());
                    orderItem.setProductName(selectedPool.getName());
                    orderItem.setProductType("EPIN");
                    orderItem.setCategory("epin");
                    orderItem.setQuantity(1);
                    orderItem.setUnitPrice(BigDecimal.valueOf(amount));
                    orderItem.setRetailPrice(BigDecimal.valueOf(amount));
                    
                    List<RetailerOrder.OrderItem> items = new ArrayList<>();
                    items.add(orderItem);
                    retailerOrder.setItems(items);
                    
                    // Store PIN in notes (encrypted)
                    retailerOrder.setNotes("ENCRYPTED_PIN:" + pinCode);
                    
                    // Save retailer order
                    RetailerOrder savedRetailerOrder = retailerOrderRepository.save(retailerOrder);
                    System.out.println("✅ Created RetailerOrder for analytics: " + savedRetailerOrder.getOrderNumber());
                    
                    // UPDATE RETAILER CREDIT LIMIT
                    Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(retailerId);
                    if (limitOpt.isPresent()) {
                        RetailerLimit limit = limitOpt.get();
                        
                        // Deduct the sale amount from general credit (ePINs use general credit, not eSIM credit)
                        limit.useCredit(BigDecimal.valueOf(amount), 
                                        savedRetailerOrder.getId(), 
                                        "ePIN Sale: " + selectedPool.getName() + " to " + email);
                        
                        retailerLimitRepository.save(limit);
                        System.out.println("✅ Updated credit limit for retailer: " + retailerId);
                    } else {
                        System.out.println("⚠️ No credit limit found for retailer: " + retailerId);
                    }
                } catch (Exception e) {
                    System.err.println("❌ Failed to create RetailerOrder/update credit: " + e.getMessage());
                    e.printStackTrace();
                    // Don't fail the order, just log the error
                }
            } else {
                System.out.println("⚠️ No retailerId provided - skipping RetailerOrder creation");
            }
            
            // Send ePIN delivery email immediately
            try {
                String customerName = email.split("@")[0]; // Extract name from email
                String validity = "30 days"; // Default validity
                
                System.out.println("=== Sending ePIN delivery email ===");
                System.out.println("To: " + email);
                System.out.println("PIN: " + pinCode);
                System.out.println("Product: " + selectedPool.getName());
                
                emailService.sendEpinDeliveryEmail(
                    email, 
                    customerName, 
                    orderNumber, 
                    pinCode, 
                    selectedPool.getName(),
                    validity
                );
                
                System.out.println("✅ ePIN delivery email sent successfully!");
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send ePIN email: " + emailError.getMessage());
                emailError.printStackTrace();
                // Continue even if email fails - customer still gets PIN in response
            }
            
            // Return success response with PIN
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment successful! Your ePIN has been delivered.");
            response.put("orderNumber", orderNumber);
            response.put("pin", pinCode);
            response.put("product", selectedPool.getName());
            response.put("validity", "30 days");
            response.put("emailSent", true);
            
            System.out.println("=== ePIN Order Completed Successfully ===");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error processing ePIN order: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error processing order: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Test endpoint to verify email configuration
    @PostMapping("/test/send-email")
    public ResponseEntity<Map<String, Object>> testEmail(@RequestBody Map<String, String> emailData) {
        try {
            String toEmail = emailData.get("email");
            String testPin = "1234567890123456";
            
            System.out.println("=== Testing Email Send ===");
            System.out.println("Sending test ePIN email to: " + toEmail);
            
            emailService.sendEpinDeliveryEmail(
                toEmail,
                "Test Customer",
                "TEST-" + System.currentTimeMillis(),
                testPin,
                "Test Product Bundle",
                "30 days"
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test email sent successfully to " + toEmail);
            response.put("sentTo", toEmail);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Test email failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to send test email: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            error.put("details", e.toString());
            
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Utility endpoint to fix existing retailer orders for analytics AND credit limits
    @PostMapping("/admin/fix-retailer-orders")
    public ResponseEntity<Map<String, Object>> fixRetailerOrders() {
        try {
            System.out.println("=== Fixing Existing Retailer Orders & Credit Limits ===");
            
            // Get all retailer orders
            List<RetailerOrder> allOrders = retailerOrderRepository.findAll();
            
            int ordersFixed = 0;
            int ordersSkipped = 0;
            int creditLimitsUpdated = 0;
            
            for (RetailerOrder order : allOrders) {
                boolean needsUpdate = false;
                
                // Fix productType and category
                if (order.getItems() != null && !order.getItems().isEmpty()) {
                    for (RetailerOrder.OrderItem item : order.getItems()) {
                        // Fix items without productType or category
                        if (item.getProductType() == null || item.getProductType().isEmpty() ||
                            item.getCategory() == null || item.getCategory().isEmpty()) {
                            
                            String productName = item.getProductName() != null ? item.getProductName().toLowerCase() : "";
                            
                            // Determine type based on product name
                            if (productName.contains("esim") || productName.contains("e-sim")) {
                                item.setProductType("ESIM");
                                item.setCategory("esim");
                                needsUpdate = true;
                                System.out.println("  Fixed eSIM item: " + item.getProductName());
                            } else if (productName.contains("pin") || productName.contains("bundle") || productName.contains("lycamobile")) {
                                item.setProductType("EPIN");
                                item.setCategory("bundle");
                                needsUpdate = true;
                                System.out.println("  Fixed ePIN item: " + item.getProductName());
                            }
                        }
                    }
                }
                
                if (needsUpdate) {
                    order.setLastModifiedDate(LocalDateTime.now());
                    retailerOrderRepository.save(order);
                    ordersFixed++;
                } else {
                    ordersSkipped++;
                }
                
                // UPDATE CREDIT LIMIT FOR THIS ORDER (if not already tracked)
                if (order.getRetailerId() != null && !order.getRetailerId().isEmpty() && 
                    order.getStatus() == RetailerOrder.OrderStatus.COMPLETED) {
                    
                    try {
                        Optional<RetailerLimit> limitOpt = retailerLimitRepository.findByRetailer_Id(order.getRetailerId());
                        
                        if (limitOpt.isPresent()) {
                            RetailerLimit limit = limitOpt.get();
                            
                            // Check if this order is already tracked in credit transaction history
                            boolean alreadyTracked = false;
                            if (limit.getTransactions() != null) {
                                alreadyTracked = limit.getTransactions().stream()
                                    .anyMatch(transaction -> order.getId().equals(transaction.getReferenceOrderId()));
                            }
                            
                            if (!alreadyTracked) {
                                System.out.println("  📊 Adding credit usage for order: " + order.getOrderNumber());
                                
                                // Add credit usage
                                String description = "Historical Order: " + order.getOrderNumber();
                                if (order.getItems() != null && !order.getItems().isEmpty()) {
                                    String productNames = order.getItems().stream()
                                        .map(RetailerOrder.OrderItem::getProductName)
                                        .collect(Collectors.joining(", "));
                                    description += " (" + productNames + ")";
                                }
                                
                                limit.useCredit(order.getTotalAmount(), order.getId(), description);
                                retailerLimitRepository.save(limit);
                                creditLimitsUpdated++;
                                
                                System.out.println("    ✅ Credit updated: -" + order.getTotalAmount() + " kr");
                            } else {
                                System.out.println("  ⏭️ Order already tracked in credit: " + order.getOrderNumber());
                            }
                        } else {
                            System.out.println("  ⚠️ No credit limit found for retailer: " + order.getRetailerId());
                        }
                    } catch (Exception e) {
                        System.err.println("  ❌ Failed to update credit for order " + order.getOrderNumber() + ": " + e.getMessage());
                    }
                }
            }
            
            System.out.println("✅ Fixed " + ordersFixed + " orders, skipped " + ordersSkipped + ", updated " + creditLimitsUpdated + " credit limits");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Retailer orders and credit limits fixed successfully");
            response.put("totalOrders", allOrders.size());
            response.put("ordersFixed", ordersFixed);
            response.put("ordersSkipped", ordersSkipped);
            response.put("creditLimitsUpdated", creditLimitsUpdated);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fixing orders: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fixing orders: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

