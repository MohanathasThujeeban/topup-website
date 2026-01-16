package com.example.topup.demo.controller;

import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.RetailerOrder;
import com.example.topup.demo.entity.RetailerLimit;
import com.example.topup.demo.entity.RetailerEsimCredit;
import com.example.topup.demo.entity.EsimOrderRequest;
import com.example.topup.demo.entity.EsimPosSale;
import com.example.topup.demo.service.StockService;
import com.example.topup.demo.service.EmailService;
import com.example.topup.demo.service.RetailerService;
import com.example.topup.demo.repository.StockPoolRepository;
import com.example.topup.demo.repository.UserRepository;
import com.example.topup.demo.repository.RetailerOrderRepository;
import com.example.topup.demo.repository.RetailerLimitRepository;
import com.example.topup.demo.repository.RetailerEsimCreditRepository;
import com.example.topup.demo.repository.EsimOrderRequestRepository;
import com.example.topup.demo.repository.EsimPosSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stock")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080", "https://topup-website-gmoj.vercel.app"})
public class StockController {

    @Autowired
    private StockService stockService;

    @Autowired
    private StockPoolRepository stockPoolRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RetailerOrderRepository retailerOrderRepository;

    @Autowired
    private RetailerLimitRepository retailerLimitRepository;

    @Autowired
    private RetailerEsimCreditRepository retailerEsimCreditRepository;

    @Autowired
    private EsimOrderRequestRepository esimOrderRequestRepository;

    @Autowired
    private EsimPosSaleRepository esimPosSaleRepository;

    @Autowired
    private RetailerService retailerService;

    @Autowired
    private com.example.topup.demo.repository.RetailerKickbackLimitRepository retailerKickbackLimitRepository;

    // Test endpoint to verify controller is loaded
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Stock Controller is working!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // 1. Get all stock pools with optional filters (PINs are masked by default)
    @GetMapping("/pools")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllStockPools(
            @RequestParam(required = false) String stockType,
            @RequestParam(required = false) String productId) {
        try {
            List<StockPool> pools;
            
            if (stockType != null) {
                StockPool.StockType type = StockPool.StockType.valueOf(stockType.toUpperCase());
                pools = stockService.getStockPoolsByType(type);
            } else if (productId != null) {
                pools = stockService.getStockPoolsByProduct(productId);
            } else {
                pools = stockService.getAllStockPools();
            }
            
            // Mask sensitive data in response
            List<Map<String, Object>> maskedPools = new ArrayList<>();
            for (StockPool pool : pools) {
                Map<String, Object> poolMap = new HashMap<>();
                poolMap.put("id", pool.getId());
                poolMap.put("name", pool.getName());
                poolMap.put("bundleName", pool.getBatchNumber()); // CSV filename
                poolMap.put("stockType", pool.getStockType());
                poolMap.put("productId", pool.getProductId());
                poolMap.put("totalQuantity", pool.getTotalQuantity());
                poolMap.put("availableQuantity", pool.getAvailableQuantity());
                poolMap.put("usedQuantity", pool.getUsedQuantity());
                poolMap.put("reservedQuantity", pool.getReservedQuantity());
                poolMap.put("status", pool.getStatus());
                poolMap.put("networkProvider", pool.getNetworkProvider());
                poolMap.put("productType", pool.getProductType());
                poolMap.put("price", pool.getPrice());
                poolMap.put("description", pool.getDescription());
                poolMap.put("supplier", pool.getSupplier());
                poolMap.put("createdDate", pool.getCreatedDate());
                poolMap.put("lastModifiedDate", pool.getLastModifiedDate());
                poolMap.put("createdBy", pool.getCreatedBy());
                poolMap.put("lastModifiedBy", pool.getLastModifiedBy());
                
                // Mask individual items (don't send full PINs/ICCIDs)
                List<Map<String, Object>> maskedItems = new ArrayList<>();
                for (StockPool.StockItem item : pool.getItems()) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("itemId", item.getItemId());
                    // Decrypt then mask for display
                    String decrypted = stockService.decryptData(item.getItemData());
                    itemMap.put("itemData", stockService.maskData(decrypted)); // ****1234
                    itemMap.put("status", item.getStatus());
                    itemMap.put("assignedToOrderId", item.getAssignedToOrderId());
                    maskedItems.add(itemMap);
                }
                poolMap.put("items", maskedItems);
                poolMap.put("itemCount", maskedItems.size());
                
                maskedPools.add(poolMap);
            }
            
            return ResponseEntity.ok(maskedPools);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // NEW: Get stock pools formatted for Bundle Management display
    @GetMapping("/pools/bundles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getStockPoolsForBundleManagement() {
        try {
            List<Map<String, Object>> bundles = stockService.getAllStockPoolsForBundleManagement();
            return ResponseEntity.ok(bundles);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve stock bundles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(error));
        }
    }

    // 2. Get stock pool by ID
    @GetMapping("/pools/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockPool> getStockPoolById(@PathVariable String id) {
        try {
            StockPool pool = stockService.getStockPoolById(id);
            if (pool != null) {
                return ResponseEntity.ok(pool);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 3. Create new stock pool - TODO: Add method to StockService
    @PostMapping("/pools")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createStockPool(@RequestBody StockPool stockPool) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Create stock pool functionality will be added soon");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
    }

    // 4. Update stock pool - TODO: Add method to StockService
    @PutMapping("/pools/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateStockPool(
            @PathVariable String id, 
            @RequestBody StockPool stockPool) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Update stock pool functionality will be added soon");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
    }

    // 6. Bulk upload PIN stock from CSV
    @PostMapping("/pins/bulk-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkUploadPins(
            @RequestParam("file") MultipartFile file,
            @RequestParam("metadata") String metadataJson,
            @RequestParam(required = false, defaultValue = "admin") String uploadedBy) {
        try {
            // Parse metadata JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> metadata = mapper.readValue(metadataJson, Map.class);
            
            String poolName = metadata.get("poolName");
            String productType = metadata.get("productType");
            String networkProvider = metadata.get("networkProvider");
            String productId = metadata.get("productId");
            String price = metadata.get("price");
            String notes = metadata.get("notes");
            
            // Log received parameters
            System.out.println("===============================================");
            System.out.println("📥 Received PIN upload request:");
            System.out.println("File: " + (file != null ? file.getOriginalFilename() + " (" + file.getSize() + " bytes)" : "NULL"));
            System.out.println("Pool Name: " + poolName);
            System.out.println("Product Type: " + productType);
            System.out.println("Network Provider: " + networkProvider);
            System.out.println("Product ID: " + productId);
            System.out.println("Price: " + price);
            System.out.println("Notes: " + notes);
            System.out.println("Uploaded By: " + uploadedBy);
            System.out.println("===============================================");
            
            if (file == null) {
                throw new IllegalArgumentException("No file uploaded");
            }
            
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Uploaded file is empty");
            }
            
            Map<String, Object> result = stockService.uploadPinStock(file, uploadedBy, poolName, productId, price, notes, productType, networkProvider);
            
            System.out.println("✅ Upload successful!");
            System.out.println("Result: " + result);
            System.out.println("===============================================");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("❌ Upload failed!");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("===============================================");
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to upload PINs: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 7. Bulk upload eSIM stock from CSV with QR code images
    @PostMapping("/esims/bulk-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkUploadEsims(
            @RequestParam("file") MultipartFile file,
            @RequestParam("metadata") String metadataJson,
            @RequestParam(value = "qrCodes", required = false) List<MultipartFile> qrCodeFiles,
            @RequestParam(required = false, defaultValue = "admin") String uploadedBy) {
        try {
            // Parse metadata JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> metadata = mapper.readValue(metadataJson, Map.class);
            
            String poolName = metadata.get("poolName");
            String productType = metadata.get("productType");
            String networkProvider = metadata.get("networkProvider");
            String productId = metadata.get("productId");
            String price = metadata.get("price");
            String notes = metadata.get("notes");
            
            System.out.println("===============================================");
            System.out.println("📥 Received eSIM upload request:");
            System.out.println("File: " + (file != null ? file.getOriginalFilename() + " (" + file.getSize() + " bytes)" : "NULL"));
            System.out.println("Pool Name: " + poolName);
            System.out.println("Product Type: " + productType);
            System.out.println("Network Provider: " + networkProvider);
            System.out.println("Product ID: " + productId);
            System.out.println("Price: " + price);
            System.out.println("Notes: " + notes);
            System.out.println("QR Code Files: " + (qrCodeFiles != null ? qrCodeFiles.size() : 0));
            System.out.println("===============================================");
            
            // Convert QR code files to Base64 strings for storage
            Map<Integer, String> qrCodeMap = new HashMap<>();
            if (qrCodeFiles != null && !qrCodeFiles.isEmpty()) {
                System.out.println("🔄 Processing " + qrCodeFiles.size() + " QR code images...");
                
                // Create a map of filename (without extension) to Base64 QR code
                Map<String, String> qrCodeByFilename = new HashMap<>();
                for (MultipartFile qrFile : qrCodeFiles) {
                    String filename = qrFile.getOriginalFilename();
                    if (filename != null) {
                        // Remove file extension and clean the filename
                        String filenameWithoutExt = filename.replaceFirst("[.][^.]+$", "").trim();
                        
                        byte[] qrBytes = qrFile.getBytes();
                        String base64QR = java.util.Base64.getEncoder().encodeToString(qrBytes);
                        qrCodeByFilename.put(filenameWithoutExt, base64QR);
                        
                        System.out.println("   📸 Loaded QR: " + filename + " (key: " + filenameWithoutExt + ")");
                        System.out.println("      📏 Original file size: " + qrFile.getSize() + " bytes");
                        System.out.println("      📏 Byte array length: " + qrBytes.length + " bytes");
                        System.out.println("      📏 Base64 string length: " + base64QR.length() + " chars");
                        System.out.println("      🔍 Base64 starts with: " + base64QR.substring(0, Math.min(100, base64QR.length())));
                    }
                }
                System.out.println("✅ QR codes loaded successfully");
                
                // Pass the filename-based map instead of index-based map
                Map<String, Object> result = stockService.uploadEsimStockWithQRByFilename(
                    file, qrCodeByFilename, uploadedBy, poolName, productId, price, notes, productType, networkProvider);
                return ResponseEntity.ok(result);
            } else {
                // No QR codes provided, use regular upload
                Map<String, Object> result = stockService.uploadEsimStockWithQR(
                    file, new HashMap<>(), uploadedBy, poolName, productId, price, notes, productType, networkProvider);
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to upload eSIMs: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 8. Get stock statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStockStatistics() {
        try {
            // Call the actual method that exists: getStockUsageStatistics()
            Map<String, Object> stats = stockService.getStockUsageStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 9. Get stock usage report
    @GetMapping("/usage-report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStockUsageReport() {
        try {
            // Call the actual method that exists (no parameters)
            Map<String, Object> stats = stockService.getStockUsageStatistics();
            
            // Wrap response in 'statistics' property to match frontend expectations
            Map<String, Object> response = new HashMap<>();
            response.put("statistics", stats);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 10. Get low stock alerts - TODO: Implement in service
    @GetMapping("/low-stock-alerts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getLowStockAlerts(
            @RequestParam(defaultValue = "10") int threshold) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Low stock alerts functionality will be added soon");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
    }

    // 11. Get stock items from a pool - TODO: Implement in service
    @GetMapping("/pools/{poolId}/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getStockItems(
            @PathVariable String poolId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Get stock items functionality will be added soon");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
    }

    // NEW: Get stock items with decryption for admin viewing
    @GetMapping("/pools/{poolId}/items/decrypted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDecryptedStockItems(@PathVariable String poolId) {
        try {
            StockPool pool = stockService.getStockPoolById(poolId);
            if (pool == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> decryptedItems = new ArrayList<>();
            for (StockPool.StockItem item : pool.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("itemId", item.getItemId());
                // Return masked PIN number for security (show only last 4 digits)
                itemMap.put("itemData", stockService.maskData(stockService.decryptData(item.getItemData())));
                itemMap.put("serialNumber", item.getSerialNumber());
                itemMap.put("status", item.getStatus());
                itemMap.put("assignedDate", item.getAssignedDate());
                itemMap.put("assignedToOrderId", item.getAssignedToOrderId());
                itemMap.put("assignedToUserId", item.getAssignedToUserId());
                itemMap.put("assignedToUserEmail", item.getAssignedToUserEmail());
                itemMap.put("notes", item.getNotes());
                itemMap.put("productId", item.getProductId()); // Add productId from item
                itemMap.put("price", item.getPrice()); // Add price from item
                itemMap.put("type", item.getType()); // Add type from item
                decryptedItems.add(itemMap);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("poolId", pool.getId());
            response.put("poolName", pool.getName());
            response.put("bundleName", pool.getBatchNumber());
            response.put("stockType", pool.getStockType());
            response.put("productId", pool.getProductId()); // Add productId from pool
            response.put("notes", pool.getDescription()); // Add notes/description from pool
            response.put("items", decryptedItems);
            response.put("totalCount", decryptedItems.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 12. Download PIN CSV template (Simplified: PIN ID and PINS only)
    @GetMapping("/templates/pin-template.csv")
    public ResponseEntity<Resource> downloadPinTemplate() {
        try {
            String csvContent = "PIN ID,PINS\n" +
                    "22828126454,5.00004E+11\n" +
                    "99989145671,5.00004E+11\n" +
                    "62497545631,5.00004E+11\n";
            
            ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes(StandardCharsets.UTF_8));
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"pin-upload-template.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 13. Download eSIM CSV template
    @GetMapping("/templates/esim-template.csv")
    public ResponseEntity<Resource> downloadEsimTemplate() {
        try {
            String csvContent = "iccid,activation_code,qr_code_url,validity_days,batch_number\n" +
                    "89011234567890123456,ACT001,https://example.com/qr1,30,BATCH001\n" +
                    "89011234567890123457,ACT002,https://example.com/qr2,30,BATCH001\n" +
                    "89011234567890123458,ACT003,https://example.com/qr3,30,BATCH001\n";
            
            ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes(StandardCharsets.UTF_8));
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"esim-upload-template.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Additional helper endpoint: Assign stock to order (called by order service)
    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM')")
    public ResponseEntity<Map<String, Object>> assignStockToOrder(
            @RequestParam String productId,
            @RequestParam StockPool.StockType stockType,
            @RequestParam String orderId,
            @RequestParam String userId,
            @RequestParam String userEmail) {
        try {
            StockPool.StockItem assignedItem = stockService.assignStockToOrder(
                    productId, stockType, orderId, userId, userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("item", assignedItem);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to assign stock: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Delete entire stock pool
    @DeleteMapping("/pools/{poolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteStockPool(@PathVariable String poolId) {
        try {
            stockService.deleteStockPool(poolId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Stock pool deleted successfully");
            response.put("poolId", poolId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete pool: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Delete individual item from pool
    @DeleteMapping("/pools/{poolId}/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteStockItem(
            @PathVariable String poolId,
            @PathVariable String itemId) {
        try {
            stockService.deleteStockItem(poolId, itemId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item deleted successfully");
            response.put("poolId", poolId);
            response.put("itemId", itemId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Update individual item details (price, type, notes)
    @PutMapping("/pools/{poolId}/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStockItem(
            @PathVariable String poolId,
            @PathVariable String itemId,
            @RequestBody Map<String, String> updates) {
        try {
            stockService.updateStockItem(poolId, itemId, updates);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item updated successfully");
            response.put("poolId", poolId);
            response.put("itemId", itemId);
            response.put("updates", updates);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to update item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Delete ALL stock pools (use with caution!)
    @DeleteMapping("/pools/clear-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> clearAllStockPools() {
        try {
            long deletedCount = stockService.deleteAllStockPools();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All stock pools deleted successfully");
            response.put("deletedCount", deletedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete all pools: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get available eSIMs with decrypted QR codes for retailer Point of Sale
    @GetMapping("/esims/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'RETAILER')")
    public ResponseEntity<List<Map<String, Object>>> getAvailableEsimsForSale(
            @RequestParam(required = false) String networkProvider,
            @RequestParam(required = false) String productId) {
        try {
            System.out.println("📱 Fetching available eSIMs for Point of Sale");
            System.out.println("   - Network Provider: " + networkProvider);
            System.out.println("   - Product ID: " + productId);
            
            // Get all eSIM stock pools
            List<StockPool> pools = stockService.getStockPoolsByType(StockPool.StockType.ESIM);
            
            // Filter by network provider if specified
            if (networkProvider != null && !networkProvider.equals("All Operators")) {
                pools = pools.stream()
                    .filter(pool -> networkProvider.equals(pool.getNetworkProvider()))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            // Filter by product ID if specified
            if (productId != null && !productId.isEmpty()) {
                pools = pools.stream()
                    .filter(pool -> productId.equals(pool.getProductId()))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            List<Map<String, Object>> availableEsims = new ArrayList<>();
            
            for (StockPool pool : pools) {
                // Only include pools with available stock
                if (pool.getAvailableQuantity() <= 0) {
                    continue;
                }
                
                Map<String, Object> esimProduct = new HashMap<>();
                esimProduct.put("id", pool.getId());
                esimProduct.put("poolName", pool.getName());
                esimProduct.put("productId", pool.getProductId());
                esimProduct.put("networkProvider", pool.getNetworkProvider());
                esimProduct.put("productType", pool.getProductType());
                esimProduct.put("price", pool.getPrice());
                esimProduct.put("totalQuantity", pool.getTotalQuantity());
                esimProduct.put("availableQuantity", pool.getAvailableQuantity());
                esimProduct.put("description", pool.getDescription());
                
                // Get available eSIM items with decrypted QR codes
                List<Map<String, Object>> availableItems = new ArrayList<>();
                for (StockPool.StockItem item : pool.getItems()) {
                    if (item.getStatus() == StockPool.StockItem.ItemStatus.AVAILABLE) {
                        Map<String, Object> itemData = new HashMap<>();
                        
                        // Decrypt sensitive data
                        itemData.put("itemId", item.getItemId());
                        itemData.put("iccid", stockService.decryptData(item.getItemData()));
                        
                        if (item.getActivationCode() != null) {
                            itemData.put("activationCode", stockService.decryptData(item.getActivationCode()));
                        }
                        
                        // Decrypt QR code image (Base64)
                        if (item.getQrCodeImage() != null && !item.getQrCodeImage().isEmpty()) {
                            itemData.put("qrCodeImage", stockService.decryptData(item.getQrCodeImage()));
                        }
                        
                        // Include SM-DP+ Address
                        if (item.getActivationUrl() != null && !item.getActivationUrl().isEmpty()) {
                            itemData.put("smDpAddress", stockService.decryptData(item.getActivationUrl()));
                        } else if (item.getActivationCode() != null) {
                            // Try to extract from activation code
                            String decryptedCode = stockService.decryptData(item.getActivationCode());
                            if (decryptedCode != null && decryptedCode.contains("$")) {
                                String[] parts = decryptedCode.split("\\$");
                                if (parts.length > 1) {
                                    itemData.put("smDpAddress", parts[1]);
                                }
                            }
                        }
                        
                        // Include PIN/PUK if available (already encrypted)
                        if (item.getPin1() != null) {
                            itemData.put("pin1", stockService.decryptData(item.getPin1()));
                        }
                        if (item.getPuk1() != null) {
                            itemData.put("puk1", stockService.decryptData(item.getPuk1()));
                        }
                        if (item.getPin2() != null) {
                            itemData.put("pin2", stockService.decryptData(item.getPin2()));
                        }
                        if (item.getPuk2() != null) {
                            itemData.put("puk2", stockService.decryptData(item.getPuk2()));
                        }
                        
                        availableItems.add(itemData);
                    }
                }
                
                esimProduct.put("availableEsims", availableItems);
                esimProduct.put("availableCount", availableItems.size());
                
                availableEsims.add(esimProduct);
            }
            
            System.out.println("✅ Found " + availableEsims.size() + " eSIM products with available stock");
            return ResponseEntity.ok(availableEsims);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching available eSIMs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Send eSIM QR code to customer email
    @PostMapping("/esims/send-qr")
    @PreAuthorize("hasAnyRole('ADMIN', 'RETAILER')")
    public ResponseEntity<Map<String, Object>> sendEsimQRCode(@RequestBody String requestBodyStr, Authentication authentication) {
        System.out.println("\n🔍 ===== eSIM Send QR Request Received =====");
        System.out.println("Raw request body: " + requestBodyStr);
        System.out.println("Authentication principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
        
        Map<String, Object> requestData = new HashMap<>();
        try {
            // Parse JSON string manually
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            requestData = mapper.readValue(requestBodyStr, java.util.LinkedHashMap.class);
            System.out.println("✅ JSON parsed successfully");
            System.out.println("Parsed data keys: " + requestData.keySet());
        } catch (Exception e) {
            System.err.println("❌ JSON parsing failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid JSON in request body");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("receivedBody", requestBodyStr);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        try {
            System.out.println("\n📋 Extracting parameters from request data:");
            
            Object itemIdObj = requestData.get("itemId");
            Object iccidObj = requestData.get("iccid");
            Object customerEmailObj = requestData.get("customerEmail");
            Object customerNameObj = requestData.get("customerName");
            Object passportIdObj = requestData.get("passportId");
            Object poolIdObj = requestData.get("poolId");
            Object priceObj = requestData.get("price");
            Object paymentModeObj = requestData.get("paymentMode");
            
            // Convert to strings with null safety
            String itemId = (itemIdObj != null ? itemIdObj.toString().trim() : "").replaceAll("[;'\"]", "");
            String iccid = (iccidObj != null ? iccidObj.toString().trim() : "").replaceAll("[;'\"]", "");
            String customerEmail = (customerEmailObj != null ? customerEmailObj.toString().trim() : "").replaceAll("[;'\"]", "");
            String customerName = (customerNameObj != null ? customerNameObj.toString().trim() : "").replaceAll("[;'\"]", "");
            String passportId = (passportIdObj != null ? passportIdObj.toString().trim() : "").replaceAll("[;'\"]", "");
            String poolId = (poolIdObj != null ? poolIdObj.toString().trim() : "").replaceAll("[;'\"]", "");
            String priceStr = (priceObj != null ? priceObj.toString().trim() : "0").replaceAll("[;'\"]", "");
            String paymentMode = (paymentModeObj != null ? paymentModeObj.toString().trim() : "credit").replaceAll("[;'\"]", ""); // Default to 'credit'
            
            System.out.println("   itemId: [" + itemId + "]");
            System.out.println("   iccid: [" + iccid + "]");
            System.out.println("   customerEmail: [" + customerEmail + "]");
            System.out.println("   customerName: [" + customerName + "]");
            System.out.println("   passportId: [" + passportId + "]");
            System.out.println("   poolId: [" + poolId + "]");
            System.out.println("   price: [" + priceStr + "]");
            System.out.println("   paymentMode: [" + paymentMode + "]");
            
            // Validate required fields
            if (itemId.isEmpty()) {
                throw new IllegalArgumentException("itemId is required but was empty or missing");
            }
            if (iccid.isEmpty()) {
                throw new IllegalArgumentException("iccid is required but was empty or missing");
            }
            if (customerEmail.isEmpty()) {
                throw new IllegalArgumentException("customerEmail is required but was empty or missing");
            }
            if (customerName.isEmpty()) {
                throw new IllegalArgumentException("customerName is required but was empty or missing");
            }
            if (poolId.isEmpty()) {
                throw new IllegalArgumentException("poolId is required but was empty or missing");
            }
            
            // Parse price
            double price = 0;
            try {
                price = Double.parseDouble(priceStr);
                System.out.println("✅ Price parsed: " + price);
            } catch (NumberFormatException e) {
                System.err.println("⚠️ Invalid price format: " + priceStr + ", using 0");
                price = 0;
            }

            System.out.println("\n📧 Preparing to send eSIM QR code:");
            System.out.println("   - Customer: " + customerName);
            System.out.println("   - Email: " + customerEmail);
            System.out.println("   - ICCID: " + iccid);
            System.out.println("   - Pool ID: " + poolId);
            System.out.println("   - Price: " + price);

            // Get the stock pool and find the item
            StockPool pool = stockService.getStockPoolById(poolId);
            if (pool == null) {
                throw new IllegalArgumentException("Stock pool not found with ID: " + poolId);
            }
            System.out.println("✅ Stock pool found: " + pool.getName());
            System.out.println("   Total items in pool: " + pool.getItems().size());
            
            // Find the eSIM item in inventory by ICCID
            System.out.println("🔍 Searching for eSIM item with ICCID: " + iccid);
            System.out.println("🔍 Searching for eSIM item with ItemId: " + itemId);
            
            // First, let's log all items to see what we have
            System.out.println("📋 All items in pool:");
            for (int i = 0; i < pool.getItems().size(); i++) {
                var item = pool.getItems().get(i);
                System.out.println("   Item " + i + ":");
                System.out.println("      - ItemId: " + item.getItemId());
                System.out.println("      - SerialNumber: " + item.getSerialNumber());
                
                // Try to decrypt itemData to see if it contains ICCID
                String decryptedItemData = null;
                if (item.getItemData() != null && !item.getItemData().isEmpty()) {
                    try {
                        decryptedItemData = stockService.decryptData(item.getItemData());
                        System.out.println("      - ItemData (decrypted): " + decryptedItemData);
                    } catch (Exception e) {
                        System.out.println("      - ItemData (encrypted): " + item.getItemData().substring(0, Math.min(20, item.getItemData().length())) + "...");
                    }
                }
            }
            
            // Search for the item - check multiple fields
            var esimItem = pool.getItems().stream()
                    .filter(item -> {
                        // Match by itemId first
                        if (itemId.equals(item.getItemId())) {
                            System.out.println("✅ Found by ItemId: " + item.getItemId());
                            return true;
                        }
                        
                        // Match by serialNumber
                        if (iccid.equals(item.getSerialNumber())) {
                            System.out.println("✅ Found by SerialNumber: " + item.getSerialNumber());
                            return true;
                        }
                        
                        // Match by decrypted itemData (ICCID might be stored here)
                        if (item.getItemData() != null && !item.getItemData().isEmpty()) {
                            try {
                                String decryptedData = stockService.decryptData(item.getItemData());
                                if (iccid.equals(decryptedData)) {
                                    System.out.println("✅ Found by decrypted ItemData: " + decryptedData);
                                    return true;
                                }
                            } catch (Exception e) {
                                // Ignore decryption errors
                            }
                        }
                        
                        return false;
                    })
                    .findFirst()
                    .orElse(null);
            
            if (esimItem == null) {
                System.err.println("❌ eSIM item not found!");
                System.err.println("   Searched for ICCID: " + iccid);
                System.err.println("   Searched for ItemId: " + itemId);
                System.err.println("   Total items in pool: " + pool.getItems().size());
                throw new IllegalArgumentException("eSIM item not found with ICCID: " + iccid + " or ItemId: " + itemId + " in pool: " + poolId);
            }
            
            System.out.println("✅ eSIM item found - ItemId: " + esimItem.getItemId());
            
            // Decrypt eSIM details for email
            String decryptedActivationCode = "";
            String smDpAddress = "";
            String qrCodeBase64 = "";
            
            System.out.println("🔍 Checking eSIM item data:");
            System.out.println("   - ICCID (serialNumber): " + esimItem.getSerialNumber());
            System.out.println("   - ItemId: " + esimItem.getItemId());
            System.out.println("   - Has activationCode: " + (esimItem.getActivationCode() != null && !esimItem.getActivationCode().isEmpty()));
            System.out.println("   - Has qrCodeImage: " + (esimItem.getQrCodeImage() != null && !esimItem.getQrCodeImage().isEmpty()));
            System.out.println("   - Has activationUrl: " + (esimItem.getActivationUrl() != null && !esimItem.getActivationUrl().isEmpty()));
            System.out.println("   - Has qrCodeUrl: " + (esimItem.getQrCodeUrl() != null && !esimItem.getQrCodeUrl().isEmpty()));
            
            try {
                // Decrypt activation code
                if (esimItem.getActivationCode() != null && !esimItem.getActivationCode().isEmpty()) {
                    decryptedActivationCode = stockService.decryptData(esimItem.getActivationCode());
                    System.out.println("✅ Decrypted activation code for ICCID " + esimItem.getSerialNumber());
                }
                
                // Get QR code from qrCodeImage - check if it needs decryption or is already base64
                if (esimItem.getQrCodeImage() != null && !esimItem.getQrCodeImage().isEmpty()) {
                    String rawQrCode = esimItem.getQrCodeImage();
                    System.out.println("🔍 Raw QR code length: " + rawQrCode.length() + " chars");
                    
                    // Check if it's already valid base64 (PNG starts with iVBORw0KGgo)
                    if (rawQrCode.startsWith("iVBORw0KGgo")) {
                        // Already plain base64, use directly
                        qrCodeBase64 = rawQrCode;
                        System.out.println("✅ QR code is already in base64 format (not encrypted) - length: " + qrCodeBase64.length() + " chars");
                    } else {
                        // Needs decryption
                        try {
                            qrCodeBase64 = stockService.decryptData(rawQrCode);
                            System.out.println("✅ Decrypted QR code - length: " + qrCodeBase64.length() + " chars");
                        } catch (Exception e) {
                            System.err.println("⚠️ Failed to decrypt QR code, using raw value: " + e.getMessage());
                            qrCodeBase64 = rawQrCode;
                        }
                    }
                    
                    System.out.println("   QR code starts with: " + (qrCodeBase64.length() > 50 ? qrCodeBase64.substring(0, 50) + "..." : qrCodeBase64));
                    System.out.println("   Is valid PNG: " + qrCodeBase64.startsWith("iVBORw0KGgo"));
                } else {
                    System.out.println("⚠️ No QR code image stored in database");
                }
                
                // SM-DP address - decrypt from activationUrl or extract from activation code
                if (esimItem.getActivationUrl() != null && !esimItem.getActivationUrl().isEmpty()) {
                    smDpAddress = stockService.decryptData(esimItem.getActivationUrl());
                    System.out.println("✅ Decrypted SM-DP address from activationUrl: " + smDpAddress);
                } else if (decryptedActivationCode != null && decryptedActivationCode.startsWith("LPA:")) {
                    // Extract SM-DP+ from LPA string (format: LPA:1$SM-DP-ADDRESS$ACTIVATION-CODE)
                    String[] parts = decryptedActivationCode.split("\\$");
                    if (parts.length >= 2) {
                        smDpAddress = parts[1];
                        System.out.println("✅ Extracted SM-DP address from activation code: " + smDpAddress);
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error decrypting eSIM data: " + e.getMessage());
                e.printStackTrace();
            }
            
            System.out.println("📊 Final email data:");
            System.out.println("   - Activation Code: " + (decryptedActivationCode != null && !decryptedActivationCode.isEmpty() ? "✅" : "❌"));
            System.out.println("   - SM-DP Address: " + (smDpAddress != null && !smDpAddress.isEmpty() ? "✅" : "❌"));
            System.out.println("   - QR Code: " + (qrCodeBase64 != null && !qrCodeBase64.isEmpty() ? "✅ (" + qrCodeBase64.length() + " chars)" : "❌"));
            
            // Generate order ID
            String orderId = "eSIM-" + System.currentTimeMillis();
            
            // Send email using proper eSIM approval method with QR code embedding
            System.out.println("📤 Sending professional eSIM activation email to: " + customerEmail);
            System.out.println("   - Product: " + pool.getName());
            System.out.println("   - ICCID: " + iccid);
            System.out.println("   - Price: " + priceStr + " NOK");
            System.out.println("   - Has QR Code: " + (qrCodeBase64 != null && !qrCodeBase64.isEmpty()));
            System.out.println("   - QR Code Length: " + (qrCodeBase64 != null ? qrCodeBase64.length() : 0));
            if (qrCodeBase64 != null && qrCodeBase64.length() > 0) {
                System.out.println("   - QR Code Starts With: " + qrCodeBase64.substring(0, Math.min(50, qrCodeBase64.length())));
                System.out.println("   - Is Valid PNG: " + qrCodeBase64.startsWith("iVBORw0KGgo"));
            } else {
                System.out.println("   - ❌ QR CODE IS NULL OR EMPTY - EMAIL WILL NOT HAVE QR CODE!");
            }
            System.out.println("   - Has Activation Code: " + (decryptedActivationCode != null && !decryptedActivationCode.isEmpty()));
            emailService.sendEsimApprovalEmail(
                customerEmail,
                customerName,
                orderId,
                iccid,
                qrCodeBase64,
                decryptedActivationCode,
                smDpAddress,
                priceStr + " NOK"
            );
            System.out.println("✅ Professional email sent successfully with embedded QR code and price");
            
            // Mark item as USED and remove from pool
            System.out.println("📦 Updating stock pool - marking item as USED and removing from inventory");
            esimItem.setStatus(StockPool.StockItem.ItemStatus.USED);
            esimItem.setAssignedToUserEmail(customerEmail);
            esimItem.setUsedDate(java.time.LocalDateTime.now());
            esimItem.setNotes("Sold to: " + customerName + " (" + customerEmail + ")");
            
            // Remove from available inventory
            pool.getItems().remove(esimItem);
            
            // Update pool quantities
            if (pool.getAvailableQuantity() != null && pool.getAvailableQuantity() > 0) {
                pool.setAvailableQuantity(pool.getAvailableQuantity() - 1);
            }
            if (pool.getUsedQuantity() != null) {
                pool.setUsedQuantity(pool.getUsedQuantity() + 1);
            } else {
                pool.setUsedQuantity(1);
            }
            
            stockPoolRepository.save(pool);
            System.out.println("✅ Item marked as USED and removed from pool. Remaining items: " + pool.getItems().size());
            
            // Record the sale in database - CRITICAL: This must happen for analytics and credit updates
            System.out.println("\n=== STARTING SALE RECORDING PROCESS ===");
            System.out.println("📋 Authentication object: " + (authentication != null ? "Present" : "NULL"));
            if (authentication != null) {
                System.out.println("📋 Authentication name: " + authentication.getName());
                System.out.println("📋 Authentication principal: " + authentication.getPrincipal());
                System.out.println("📋 Authentication authorities: " + authentication.getAuthorities());
            }
            
            // Get retailer - with fallback to any BUSINESS user if authentication is null
            String retailerEmail = null;
            if (authentication != null && authentication.getName() != null) {
                retailerEmail = authentication.getName();
                System.out.println("💾 Using authenticated user: " + retailerEmail);
            } else {
                // Fallback: Find any BUSINESS user
                System.out.println("⚠️ Authentication is null - checking for any BUSINESS user");
                List<User> businessUsers = userRepository.findByAccountType(User.AccountType.BUSINESS);
                if (!businessUsers.isEmpty()) {
                    retailerEmail = businessUsers.get(0).getEmail();
                    System.out.println("💾 Using fallback BUSINESS user: " + retailerEmail);
                } else {
                    System.err.println("❌ No BUSINESS user found for fallback");
                }
            }
            
            if (retailerEmail != null) {
                System.out.println("💾 Recording eSIM sale for user: " + retailerEmail);
                
                var retailerOpt = userRepository.findByEmail(retailerEmail);
                if (!retailerOpt.isPresent()) {
                    System.err.println("⚠️ Retailer user not found: " + retailerEmail);
                } else {
                    User retailer = retailerOpt.get();
                    try {
                        // Create RetailerOrder with OrderItem
                        RetailerOrder order = new RetailerOrder();
                        order.setRetailerId(retailer.getId());
                        order.setOrderNumber("eSIM-" + System.currentTimeMillis());
                        
                        // Add customer details in notes field
                        order.setNotes("Customer: " + customerName + " (" + customerEmail + ")");
                        
                        // Create OrderItem for the eSIM
                        RetailerOrder.OrderItem item = new RetailerOrder.OrderItem();
                        item.setProductId(poolId);
                        item.setProductName(pool.getName());
                        item.setProductType("ESIM");
                        item.setCategory("ESIM");
                        item.setQuantity(1);
                        item.setUnitPrice(BigDecimal.valueOf(price));
                        item.setRetailPrice(BigDecimal.valueOf(price));
                        item.setSerialNumbers(java.util.Arrays.asList(iccid));
                        
                        order.addItem(item);
                        order.setTotalAmount(BigDecimal.valueOf(price));
                        order.setCurrency("NOK");
                        order.setStatus(RetailerOrder.OrderStatus.COMPLETED);
                        order.setPaymentStatus(RetailerOrder.PaymentStatus.COMPLETED);
                        order.setPaymentMethod("POINT_OF_SALE");
                        order.setCreatedDate(java.time.LocalDateTime.now());
                        order.setLastModifiedDate(java.time.LocalDateTime.now());
                        order.setCreatedBy(retailerEmail);
                        
                        retailerOrderRepository.save(order);
                        System.out.println("=== RetailerOrder SAVED SUCCESSFULLY ===");
                        System.out.println("✅ RetailerOrder created with ID: " + order.getId());
                        System.out.println("📝 Order Number: " + order.getOrderNumber());
                        System.out.println("📝 Retailer ID: " + order.getRetailerId());
                        System.out.println("📝 Payment Method: " + order.getPaymentMethod());
                        System.out.println("📝 Status: " + order.getStatus());
                        System.out.println("📝 Customer: " + customerName + " (" + customerEmail + ")");
                        System.out.println("📝 ICCID: " + iccid);
                        System.out.println("📝 Amount: NOK " + price);
                        
                        // Create EsimOrderRequest to store customer details for sales report
                        EsimOrderRequest esimOrderRequest = new EsimOrderRequest();
                        esimOrderRequest.setOrderNumber(order.getOrderNumber());
                        esimOrderRequest.setCustomerFullName(customerName);
                        esimOrderRequest.setCustomerEmail(customerEmail);
                        esimOrderRequest.setProductName(pool.getName());
                        esimOrderRequest.setProductId(poolId);
                        esimOrderRequest.setAmount((double) price);
                        esimOrderRequest.setPaymentMethod("POINT_OF_SALE");
                        esimOrderRequest.setStatus("APPROVED");
                        esimOrderRequest.setAssignedEsimSerial(iccid);
                        esimOrderRequest.setApprovedByAdmin(retailerEmail);
                        esimOrderRequest.setApprovedDate(java.time.LocalDateTime.now());
                        esimOrderRequest.setRequestDate(java.time.LocalDateTime.now());
                        esimOrderRequestRepository.save(esimOrderRequest);
                        System.out.println("✅ EsimOrderRequest created for sales report with ICCID: " + iccid);
                        
                        // ========== SAVE TO NEW esim_pos_sales COLLECTION ==========
                        EsimPosSale savedPosSale = null;
                        try {
                            EsimPosSale posSale = new EsimPosSale(retailer, customerEmail);
                            posSale.setCustomerName(customerName);
                            posSale.setIccid(iccid);
                            posSale.setProductName(pool.getName());
                            posSale.setProductId(poolId);
                            posSale.setStockPoolId(poolId);
                            posSale.setStockPoolName(pool.getName());
                            posSale.setSalePrice(BigDecimal.valueOf(price));
                            posSale.setOrderId(order.getId());
                            posSale.setOrderReference(order.getOrderNumber());
                            posSale.setStatus(EsimPosSale.SaleStatus.COMPLETED);
                            posSale.setEmailSent(true);
                            posSale.setCreatedBy(retailerEmail);
                            
                            // Set cost price if available
                            if (pool.getPrice() != null && !pool.getPrice().isEmpty()) {
                                try {
                                    BigDecimal poolCostPrice = new BigDecimal(pool.getPrice());
                                    posSale.setCostPrice(poolCostPrice);
                                    posSale.setMargin(BigDecimal.valueOf(price).subtract(poolCostPrice));
                                } catch (NumberFormatException e) {
                                    posSale.setCostPrice(BigDecimal.ZERO);
                                }
                            }
                            
                            // Set bundle info if available - use pool name as bundle name
                            posSale.setBundleName(pool.getName());
                            posSale.setBundleId(poolId);
                            
                            // Set operator from networkProvider if available
                            if (pool.getNetworkProvider() != null) {
                                posSale.setOperator(pool.getNetworkProvider());
                            }
                            
                            savedPosSale = esimPosSaleRepository.save(posSale);
                            System.out.println("✅ EsimPosSale saved to esim_pos_sales collection with ID: " + savedPosSale.getId());
                            System.out.println("   📊 Customer: " + customerName + " (" + customerEmail + ")");
                            System.out.println("   📊 ICCID: " + iccid);
                            System.out.println("   📊 Sale Price: NOK " + savedPosSale.getSalePrice());
                            System.out.println("   📊 Retailer: " + retailerEmail);
                        } catch (Exception posSaleEx) {
                            System.err.println("⚠️ Error saving to esim_pos_sales collection: " + posSaleEx.getMessage());
                            posSaleEx.printStackTrace();
                        }
                        // ========== END SAVE TO esim_pos_sales ==========
                        
                        // ========== DEDUCT CREDIT BASED ON PAYMENT MODE ==========
                        if (savedPosSale != null && savedPosSale.getSalePrice() != null) {
                            System.out.println("\n=== STARTING CREDIT DEDUCTION (from esim_pos_sales) ===");
                            System.out.println("📊 POS Sale ID: " + savedPosSale.getId());
                            System.out.println("📊 Retailer ID: " + retailer.getId());
                            System.out.println("📊 Sale Price from POS Sale: " + savedPosSale.getSalePrice());
                            System.out.println("📊 Payment Mode: " + paymentMode);
                            
                            BigDecimal salePriceFromPOS = savedPosSale.getSalePrice();
                            
                            try {
                                if ("kickback".equalsIgnoreCase(paymentMode)) {
                                    // ========== DEDUCT FROM KICKBACK BONUS ==========
                                    System.out.println("💰 Deducting from KICKBACK BONUS");
                                    var kickbackLimitOpt = retailerKickbackLimitRepository.findByRetailerId(retailer.getId());
                                    
                                    if (kickbackLimitOpt.isPresent()) {
                                        var kickbackLimit = kickbackLimitOpt.get();
                                        System.out.println("📊 BEFORE - Kickback Available: " + kickbackLimit.getAvailableKickback());
                                        System.out.println("📊 BEFORE - Kickback Used: " + kickbackLimit.getUsedKickback());
                                        
                                        // Use kickback for eSIM sale
                                        kickbackLimit.useKickback(salePriceFromPOS);
                                        
                                        System.out.println("📊 AFTER useKickback() - Kickback Available: " + kickbackLimit.getAvailableKickback());
                                        System.out.println("📊 AFTER useKickback() - Kickback Used: " + kickbackLimit.getUsedKickback());
                                        
                                        var savedKickback = retailerKickbackLimitRepository.save(kickbackLimit);
                                        System.out.println("✅ KICKBACK DEDUCTED for eSIM Sale: " + salePriceFromPOS);
                                        System.out.println("📊 SAVED - Kickback Available: " + savedKickback.getAvailableKickback());
                                        System.out.println("📊 SAVED - Kickback Used: " + savedKickback.getUsedKickback());
                                        
                                        // Update the POS sale with kickback deduction info
                                        savedPosSale.setNotes("Kickback deducted: " + salePriceFromPOS + " NOK");
                                        esimPosSaleRepository.save(savedPosSale);
                                        
                                        order.setNotes(order.getNotes() + " | Kickback Bonus Updated from POS Sale");
                                    } else {
                                        System.err.println("⚠️ No Kickback Limit record found for retailer: " + retailer.getId());
                                    }
                                } else {
                                    // ========== DEDUCT FROM eSIM CREDIT (DEFAULT) ==========
                                    System.out.println("💳 Deducting from eSIM CREDIT");
                                    var esimCreditOpt = retailerEsimCreditRepository.findByRetailer_Id(retailer.getId());
                                    System.out.println("📊 RetailerEsimCredit (new collection) found: " + esimCreditOpt.isPresent());
                                
                                    RetailerEsimCredit esimCredit = null;
                                    
                                    if (esimCreditOpt.isPresent()) {
                                        esimCredit = esimCreditOpt.get();
                                    } else {
                                        // Fallback: Check OLD retailer_limits collection and migrate if exists
                                        System.out.println("📊 Checking OLD retailer_limits collection for eSIM credit...");
                                        var oldLimitOpt = retailerLimitRepository.findByRetailer_Id(retailer.getId());
                                        
                                        if (oldLimitOpt.isPresent()) {
                                            RetailerLimit oldLimit = oldLimitOpt.get();
                                            BigDecimal oldEsimCreditLimit = oldLimit.getEsimCreditLimit();
                                            BigDecimal oldEsimUsedCredit = oldLimit.getEsimUsedCredit();
                                            BigDecimal oldEsimAvailableCredit = oldLimit.getEsimAvailableCredit();
                                            
                                            if (oldEsimCreditLimit != null && oldEsimCreditLimit.compareTo(BigDecimal.ZERO) > 0) {
                                                System.out.println("📊 Found eSIM credit in OLD collection - MIGRATING...");
                                                System.out.println("   Old eSIM Credit Limit: " + oldEsimCreditLimit);
                                                System.out.println("   Old eSIM Used Credit: " + oldEsimUsedCredit);
                                                System.out.println("   Old eSIM Available Credit: " + oldEsimAvailableCredit);
                                                
                                                // Create new record in retailer_esim_credits collection
                                                esimCredit = new RetailerEsimCredit(retailer);
                                                esimCredit.setCreditLimit(oldEsimCreditLimit);
                                                esimCredit.setUsedCredit(oldEsimUsedCredit != null ? oldEsimUsedCredit : BigDecimal.ZERO);
                                                esimCredit.setAvailableCredit(oldEsimAvailableCredit != null ? oldEsimAvailableCredit : oldEsimCreditLimit);
                                                esimCredit.setCreatedBy("system-migration");
                                                esimCredit = retailerEsimCreditRepository.save(esimCredit);
                                                System.out.println("✅ Migrated eSIM credit to NEW collection. ID: " + esimCredit.getId());
                                            }
                                        }
                                    }
                                    
                                    if (esimCredit != null) {
                                        System.out.println("📊 BEFORE - eSIM Credit Limit: " + esimCredit.getCreditLimit());
                                        System.out.println("📊 BEFORE - eSIM Available Credit: " + esimCredit.getAvailableCredit());
                                        System.out.println("📊 BEFORE - eSIM Used Credit: " + esimCredit.getUsedCredit());
                                        
                                        // Use eSIM credit from separate collection with POS sale reference
                                        esimCredit.useCredit(salePriceFromPOS, savedPosSale.getId(), 
                                            "eSIM POS Sale #" + savedPosSale.getId() + ": " + pool.getName() + " to " + customerEmail);
                                        
                                        System.out.println("📊 AFTER useCredit() - eSIM Available: " + esimCredit.getAvailableCredit());
                                        System.out.println("📊 AFTER useCredit() - eSIM Used: " + esimCredit.getUsedCredit());
                                        
                                        RetailerEsimCredit savedCredit = retailerEsimCreditRepository.save(esimCredit);
                                        System.out.println("✅ eSIM Credit DEDUCTED using POS Sale price: " + salePriceFromPOS);
                                        System.out.println("📊 SAVED - eSIM Available Credit: " + savedCredit.getAvailableCredit());
                                        System.out.println("📊 SAVED - eSIM Used Credit: " + savedCredit.getUsedCredit());
                                        System.out.println("=== eSIM CREDIT DEDUCTION COMPLETE ===\n");
                                        
                                        // Update the POS sale with credit deduction info
                                        savedPosSale.setNotes("Credit deducted: " + salePriceFromPOS + " NOK");
                                        esimPosSaleRepository.save(savedPosSale);
                                        
                                        // Store updated credit info for response
                                        order.setNotes(order.getNotes() + " | eSIM Credit Updated from POS Sale");
                                    } else {
                                        System.err.println("⚠️ No eSIM Credit record found for retailer: " + retailer.getId());
                                        System.err.println("⚠️ Admin needs to set eSIM credit limit for this retailer first");
                                        
                                        // Create new eSIM credit record to track usage even without limit set
                                        RetailerEsimCredit newEsimCredit = new RetailerEsimCredit(retailer);
                                        newEsimCredit.setCreditLimit(BigDecimal.ZERO);
                                        newEsimCredit.setAvailableCredit(BigDecimal.ZERO);
                                        newEsimCredit.setUsedCredit(salePriceFromPOS);
                                        newEsimCredit.setCreatedBy(retailerEmail);
                                        retailerEsimCreditRepository.save(newEsimCredit);
                                        System.out.println("📝 Created new eSIM credit record with used credit: " + salePriceFromPOS);
                                    }
                                }
                            } catch (Exception creditEx) {
                                System.err.println("❌ CRITICAL: Error deducting credit: " + creditEx.getMessage());
                                creditEx.printStackTrace();
                            }
                        } else {
                            System.err.println("⚠️ No POS Sale saved - skipping credit deduction");
                        }
                        // ========== END CREDIT DEDUCTION ==========
                        
                        // Record profit/earnings for this sale
                        try {
                            BigDecimal saleAmount = savedPosSale != null ? savedPosSale.getSalePrice() : BigDecimal.valueOf(price);
                            // For eSIMs, cost price is typically the wholesale price
                            // Assuming pool.getPrice() is the cost price, or use a default margin
                            BigDecimal costPrice = BigDecimal.ZERO;
                            if (pool.getPrice() != null && !pool.getPrice().isEmpty()) {
                                try {
                                    costPrice = new BigDecimal(pool.getPrice());
                                } catch (NumberFormatException e) {
                                    System.err.println("⚠️ Invalid price format in pool: " + pool.getPrice());
                                    costPrice = BigDecimal.ZERO;
                                }
                            }
                            
                            String bundleName = pool.getName();
                            String bundleId = poolId;
                            Double marginRate = 0.0; // Can be configured or passed from frontend
                            
                            // If cost price is same as sale price, assume 0 margin (retail = wholesale)
                            if (costPrice.compareTo(BigDecimal.ZERO) > 0) {
                                marginRate = ((saleAmount.subtract(costPrice)).divide(costPrice, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))).doubleValue();
                            }
                            
                            System.out.println("📊 Recording profit - Sale: " + saleAmount + ", Cost: " + costPrice + ", Margin: " + marginRate + "%");
                            retailerService.recordProfit(retailer, saleAmount, costPrice, bundleName, bundleId, marginRate);
                            System.out.println("✅ Profit/earnings recorded in retailer_profits collection");
                        } catch (Exception profitEx) {
                            System.err.println("⚠️ Error recording profit: " + profitEx.getMessage());
                            profitEx.printStackTrace();
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Error recording eSIM sale: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            } else {
                System.err.println("❌ No retailer email found - cannot record sale");
            }
            
            System.out.println("\n✅ eSIM QR code sent and sale recorded successfully\n");
            
            // Build response with updated eSIM credit information
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "eSIM QR code sent to " + customerEmail);
            response.put("customerId", itemId);
            response.put("iccid", iccid);
            response.put("salePrice", price);
            
            // Include updated eSIM credit balance in response for immediate UI update
            // Use retailerEmail variable instead of authentication.getName()
            if (retailerEmail != null) {
                try {
                    var retailerOpt = userRepository.findByEmail(retailerEmail);
                    if (retailerOpt.isPresent()) {
                        var esimCreditOpt = retailerEsimCreditRepository.findByRetailer_Id(retailerOpt.get().getId());
                        if (esimCreditOpt.isPresent()) {
                            RetailerEsimCredit esimCredit = esimCreditOpt.get();
                            Map<String, Object> creditInfo = new HashMap<>();
                            creditInfo.put("esimCreditLimit", esimCredit.getCreditLimit() != null ? esimCredit.getCreditLimit().doubleValue() : 0.0);
                            creditInfo.put("esimAvailableCredit", esimCredit.getAvailableCredit() != null ? esimCredit.getAvailableCredit().doubleValue() : 0.0);
                            creditInfo.put("esimUsedCredit", esimCredit.getUsedCredit() != null ? esimCredit.getUsedCredit().doubleValue() : 0.0);
                            
                            // Calculate usage percentage
                            if (esimCredit.getCreditLimit() != null && esimCredit.getCreditLimit().compareTo(BigDecimal.ZERO) > 0) {
                                double usagePercentage = esimCredit.getUsedCredit()
                                    .multiply(BigDecimal.valueOf(100))
                                    .divide(esimCredit.getCreditLimit(), 2, java.math.RoundingMode.HALF_UP)
                                    .doubleValue();
                                creditInfo.put("esimCreditUsagePercentage", usagePercentage);
                            } else {
                                creditInfo.put("esimCreditUsagePercentage", 0.0);
                            }
                            
                            response.put("updatedCredit", creditInfo);
                            System.out.println("📊 Response includes updated eSIM credit: " + creditInfo);
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("⚠️ Could not include updated credit in response: " + ex.getMessage());
                }
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Validation error: " + e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid request");
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send eSIM QR code");
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
