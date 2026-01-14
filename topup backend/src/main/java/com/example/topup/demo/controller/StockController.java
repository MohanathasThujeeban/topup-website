package com.example.topup.demo.controller;

import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.service.StockService;
import com.example.topup.demo.service.EmailService;
import com.example.topup.demo.repository.StockPoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<Map<String, Object>> sendEsimQRCode(@RequestBody Map<String, String> requestData) {
        try {
            String itemId = requestData.get("itemId");
            String iccid = requestData.get("iccid");
            String customerEmail = requestData.get("customerEmail");
            String customerName = requestData.get("customerName");
            String passportId = requestData.get("passportId");
            String poolId = requestData.get("poolId");
            String price = requestData.get("price");

            System.out.println("📧 Sending eSIM QR code to customer:");
            System.out.println("   - Customer: " + customerName);
            System.out.println("   - Email: " + customerEmail);
            System.out.println("   - Passport/ID: " + passportId);
            System.out.println("   - ICCID: " + iccid);
            System.out.println("   - Pool ID: " + poolId);

            // Get the stock pool and find the item
            StockPool pool = stockService.getStockPoolById(poolId);
            if (pool == null) {
                throw new IllegalArgumentException("Stock pool not found");
            }

            StockPool.StockItem esimItem = null;
            for (StockPool.StockItem item : pool.getItems()) {
                if (item.getItemId().equals(itemId)) {
                    esimItem = item;
                    break;
                }
            }

            if (esimItem == null) {
                throw new IllegalArgumentException("eSIM item not found");
            }

            if (esimItem.getStatus() != StockPool.StockItem.ItemStatus.AVAILABLE) {
                throw new IllegalStateException("eSIM is not available for sale");
            }

            // Decrypt QR code for sending
            String qrCodeBase64 = stockService.decryptData(esimItem.getQrCodeImage());
            String activationCode = esimItem.getActivationCode() != null ? 
                stockService.decryptData(esimItem.getActivationCode()) : "";
            String pin1 = esimItem.getPin1() != null ? stockService.decryptData(esimItem.getPin1()) : "";
            String puk1 = esimItem.getPuk1() != null ? stockService.decryptData(esimItem.getPuk1()) : "";

            // Send email with QR code
            System.out.println("📧 Sending eSIM QR code email to: " + customerEmail);
            emailService.sendEsimQRCode(
                customerEmail,
                customerName,
                passportId,
                qrCodeBase64,
                iccid,
                activationCode,
                pin1,
                puk1,
                pool.getNetworkProvider(),
                price
            );
            System.out.println("✅ Email sent successfully!");

            // Mark eSIM as used
            esimItem.setStatus(StockPool.StockItem.ItemStatus.USED);
            esimItem.setAssignedDate(java.time.LocalDateTime.now());
            esimItem.setAssignedToUserEmail(customerEmail);
            esimItem.setNotes("Sold to: " + customerName + " (Passport/ID: " + passportId + ")");

            // Update pool quantities
            pool.setAvailableQuantity(pool.getAvailableQuantity() - 1);
            pool.setUsedQuantity(pool.getUsedQuantity() + 1);

            // Save updated pool
            stockPoolRepository.save(pool);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "eSIM QR code sent to " + customerEmail);
            response.put("customerName", customerName);
            response.put("customerEmail", customerEmail);
            response.put("iccid", iccid);

            System.out.println("✅ eSIM sold and marked as used");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error sending eSIM QR code: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

