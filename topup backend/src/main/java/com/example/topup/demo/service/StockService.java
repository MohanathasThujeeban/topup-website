package com.example.topup.demo.service;

import com.example.topup.demo.entity.Product;
import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.entity.StockPool.StockItem;
import com.example.topup.demo.repository.ProductRepository;
import com.example.topup.demo.repository.StockPoolRepository;
import com.example.topup.demo.dto.StockItemDTO;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StockService {

    @Autowired
    private StockPoolRepository stockPoolRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Upload PIN stock from CSV file
     * Expected CSV format: pinNumber, serialNumber, productId, notes, poolName, type, price
     */
    public Map<String, Object> uploadPinStock(MultipartFile file, String adminUser, String poolName, String productId, String notes) throws Exception {
        System.out.println("\n🚀 Starting PIN stock upload process...");
        
        // Use provided pool name or fallback to CSV filename
        String finalPoolName = (poolName != null && !poolName.trim().isEmpty()) ? poolName : 
            (file.getOriginalFilename() != null ? file.getOriginalFilename().replaceFirst("[.][^.]+$", "") : "PIN_BUNDLE_" + System.currentTimeMillis());
        
        System.out.println("📦 Pool Name: " + finalPoolName);
        System.out.println("👤 Admin User: " + adminUser);
        System.out.println("🆔 Product ID: " + productId);
        System.out.println("📝 Notes: " + notes);
        
        List<StockItemDTO> items = parseCSV(file);
        
        System.out.println("📊 Total items parsed from CSV: " + items.size());
        
        if (items.isEmpty()) {
            System.err.println("❌ No items found in CSV!");
            throw new IllegalArgumentException("CSV file is empty or contains no valid PIN data");
        }

        // Group items by productId (from CSV or parameter)
        Map<String, List<StockItemDTO>> itemsByProduct = groupByProduct(items, productId);
        
        System.out.println("🔢 Items grouped into " + itemsByProduct.size() + " product(s)");
        
        int totalImported = 0;
        List<String> errors = new ArrayList<>();
        List<StockPool> createdPools = new ArrayList<>();

        for (Map.Entry<String, List<StockItemDTO>> entry : itemsByProduct.entrySet()) {
            String poolProductId = entry.getKey();
            List<StockItemDTO> productItems = entry.getValue();

            System.out.println("\n📦 Processing product: " + poolProductId + " with " + productItems.size() + " items");

            try {
                StockPool pool = getOrCreateStockPool(poolProductId, StockPool.StockType.EPIN, adminUser);
                
                System.out.println("✅ Pool retrieved/created: " + pool.getId());
                
                // Set the pool name and metadata
                pool.setName(finalPoolName);
                pool.setBatchNumber(finalPoolName); // Also set as batch number for tracking
                if (notes != null && !notes.trim().isEmpty()) {
                    pool.setDescription(notes);
                }
                
                System.out.println("🔐 Encrypting and adding " + productItems.size() + " items to pool...");
                
                for (StockItemDTO dto : productItems) {
                    // Encrypt the PIN before storing
                    String encryptedPin = encryptData(dto.getItemData());
                    
                    StockItem item = new StockItem(encryptedPin, dto.getSerialNumber());
                    item.setItemId(UUID.randomUUID().toString());
                    item.setNotes(dto.getNotes());
                    item.setProductId(dto.getProductId()); // Set productId from CSV
                    item.setPrice(dto.getPrice()); // Set price from CSV
                    item.setType(dto.getType()); // Set type from CSV
                    pool.addItem(item);
                    totalImported++;
                }
                
                System.out.println("✅ Added " + productItems.size() + " items to pool");
                
                pool.setLastModifiedBy(adminUser);
                pool.setLastModifiedDate(LocalDateTime.now());
                
                System.out.println("💾 Saving pool to database...");
                StockPool savedPool = stockPoolRepository.save(pool);
                System.out.println("✅ Pool saved successfully! ID: " + savedPool.getId());
                System.out.println("   Total Quantity: " + savedPool.getTotalQuantity());
                System.out.println("   Available: " + savedPool.getAvailableQuantity());
                
                createdPools.add(savedPool);
                
            } catch (Exception e) {
                System.err.println("❌ Error processing product " + poolProductId + ": " + e.getMessage());
                e.printStackTrace();
                errors.add("Error processing product " + poolProductId + ": " + e.getMessage());
            }
        }

        System.out.println("\n🎉 Upload process complete!");
        System.out.println("   Total Imported: " + totalImported);
        System.out.println("   Pools Created/Updated: " + createdPools.size());
        System.out.println("   Errors: " + errors.size());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("totalImported", totalImported);
        result.put("poolsUpdated", createdPools.size());
        result.put("bundleName", finalPoolName);
        result.put("errors", errors);
        result.put("stockPools", createdPools);

        return result;
    }

    /**
     * Upload eSIM stock from CSV file
     * Expected CSV format: iccid, serialNumber, activationUrl, qrCodeUrl, productId, notes, poolName, type, price
     */
    public Map<String, Object> uploadEsimStock(MultipartFile file, String adminUser, String poolName, String productId, String notes) throws Exception {
        // Use provided pool name or fallback to CSV filename
        String finalPoolName = (poolName != null && !poolName.trim().isEmpty()) ? poolName : 
            (file.getOriginalFilename() != null ? file.getOriginalFilename().replaceFirst("[.][^.]+$", "") : "ESIM_BUNDLE_" + System.currentTimeMillis());
        
        List<StockItemDTO> items = parseEsimCSV(file);
        
        if (items.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty or invalid");
        }

        Map<String, List<StockItemDTO>> itemsByProduct = groupByProduct(items, productId);
        
        int totalImported = 0;
        List<String> errors = new ArrayList<>();
        List<StockPool> createdPools = new ArrayList<>();

        for (Map.Entry<String, List<StockItemDTO>> entry : itemsByProduct.entrySet()) {
            String poolProductId = entry.getKey();
            List<StockItemDTO> productItems = entry.getValue();

            try {
                StockPool pool = getOrCreateStockPool(poolProductId, StockPool.StockType.ESIM, adminUser);
                
                // Set the pool name and metadata
                pool.setName(finalPoolName);
                pool.setBatchNumber(finalPoolName);
                if (notes != null && !notes.trim().isEmpty()) {
                    pool.setDescription(notes);
                }
                
                for (StockItemDTO dto : productItems) {
                    // Encrypt the ICCID before storing
                    String encryptedIccid = encryptData(dto.getItemData());
                    
                    StockItem item = new StockItem(encryptedIccid, dto.getSerialNumber());
                    item.setItemId(UUID.randomUUID().toString());
                    item.setActivationUrl(dto.getActivationUrl());
                    item.setQrCodeUrl(dto.getQrCodeUrl());
                    item.setQrCodeImage(dto.getQrCodeImage());
                    item.setNotes(dto.getNotes());
                    pool.addItem(item);
                    totalImported++;
                }
                
                pool.setLastModifiedBy(adminUser);
                pool.setLastModifiedDate(LocalDateTime.now());
                stockPoolRepository.save(pool);
                createdPools.add(pool);
                
            } catch (Exception e) {
                errors.add("Error processing product " + poolProductId + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("totalImported", totalImported);
        result.put("poolsUpdated", createdPools.size());
        result.put("bundleName", finalPoolName);
        result.put("errors", errors);
        result.put("stockPools", createdPools);

        return result;
    }

    /**
     * Get all stock pools
     */
    public List<StockPool> getAllStockPools() {
        return stockPoolRepository.findAll();
    }

    /**
     * Get all stock pools with masked PINs for bundle display
     */
    public List<Map<String, Object>> getAllStockPoolsForBundleManagement() {
        List<StockPool> pools = stockPoolRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (StockPool pool : pools) {
            Map<String, Object> poolData = new HashMap<>();
            poolData.put("id", pool.getId());
            poolData.put("bundleName", pool.getName());
            poolData.put("csvFileName", pool.getBatchNumber());
            poolData.put("stockType", pool.getStockType());
            poolData.put("productId", pool.getProductId());
            poolData.put("totalQuantity", pool.getTotalQuantity());
            poolData.put("availableQuantity", pool.getAvailableQuantity());
            poolData.put("usedQuantity", pool.getUsedQuantity());
            poolData.put("status", pool.getStatus());
            poolData.put("createdDate", pool.getCreatedDate());
            poolData.put("createdBy", pool.getCreatedBy());
            
            // Add masked PIN count (don't send actual PINs)
            poolData.put("pinCount", pool.getItems().size());
            
            result.add(poolData);
        }
        
        return result;
    }

    /**
     * Get stock pools by type
     */
    public List<StockPool> getStockPoolsByType(StockPool.StockType stockType) {
        return stockPoolRepository.findByStockType(stockType);
    }

    /**
     * Get stock pool by ID
     */
    public StockPool getStockPoolById(String id) {
        return stockPoolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Stock pool not found with id: " + id));
    }

    /**
     * Get stock pools for a product
     */
    public List<StockPool> getStockPoolsByProduct(String productId) {
        return stockPoolRepository.findByProductId(productId);
    }

    /**
     * Update stock item status
     */
    public StockPool updateStockItemStatus(String poolId, String itemId, StockItem.ItemStatus newStatus) {
        StockPool pool = getStockPoolById(poolId);
        
        Optional<StockItem> itemOpt = pool.getItems().stream()
            .filter(item -> itemId.equals(item.getItemId()))
            .findFirst();
        
        if (itemOpt.isPresent()) {
            StockItem item = itemOpt.get();
            item.setStatus(newStatus);
            
            if (newStatus == StockItem.ItemStatus.USED) {
                item.setUsedDate(LocalDateTime.now());
            }
            
            pool.updateQuantities();
            pool.setLastModifiedDate(LocalDateTime.now());
            return stockPoolRepository.save(pool);
        }
        
        throw new RuntimeException("Stock item not found with id: " + itemId);
    }

    /**
     * Assign stock to order
     */
    public StockItem assignStockToOrder(String productId, StockPool.StockType stockType, 
                                        String orderId, String userId, String userEmail) {
        Optional<StockPool> poolOpt = stockPoolRepository.findByProductIdAndStockType(productId, stockType);
        
        if (!poolOpt.isPresent()) {
            throw new RuntimeException("No stock pool found for product: " + productId);
        }
        
        StockPool pool = poolOpt.get();
        
        // Find first available item
        Optional<StockItem> availableItemOpt = pool.getItems().stream()
            .filter(item -> item.getStatus() == StockItem.ItemStatus.AVAILABLE)
            .findFirst();
        
        if (!availableItemOpt.isPresent()) {
            throw new RuntimeException("No available stock for product: " + productId);
        }
        
        StockItem item = availableItemOpt.get();
        item.setStatus(StockItem.ItemStatus.ASSIGNED);
        item.setAssignedDate(LocalDateTime.now());
        item.setAssignedToOrderId(orderId);
        item.setAssignedToUserId(userId);
        item.setAssignedToUserEmail(userEmail);
        
        pool.updateQuantities();
        pool.setLastModifiedDate(LocalDateTime.now());
        stockPoolRepository.save(pool);
        
        return item;
    }

    /**
     * Get stock usage statistics
     */
    public Map<String, Object> getStockUsageStatistics() {
        List<StockPool> allPools = stockPoolRepository.findAll();
        
        int totalPins = 0, availablePins = 0, usedPins = 0;
        int totalEsims = 0, availableEsims = 0, usedEsims = 0;
        
        for (StockPool pool : allPools) {
            if (pool.getStockType() == StockPool.StockType.EPIN) {
                totalPins += pool.getTotalQuantity();
                availablePins += pool.getAvailableQuantity();
                usedPins += pool.getUsedQuantity();
            } else if (pool.getStockType() == StockPool.StockType.ESIM) {
                totalEsims += pool.getTotalQuantity();
                availableEsims += pool.getAvailableQuantity();
                usedEsims += pool.getUsedQuantity();
            }
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStockPools", allPools.size());
        
        Map<String, Object> pinStats = new HashMap<>();
        pinStats.put("total", totalPins);
        pinStats.put("available", availablePins);
        pinStats.put("used", usedPins);
        pinStats.put("usagePercentage", totalPins > 0 ? (usedPins * 100.0 / totalPins) : 0);
        stats.put("pins", pinStats);
        
        Map<String, Object> esimStats = new HashMap<>();
        esimStats.put("total", totalEsims);
        esimStats.put("available", availableEsims);
        esimStats.put("used", usedEsims);
        esimStats.put("usagePercentage", totalEsims > 0 ? (usedEsims * 100.0 / totalEsims) : 0);
        stats.put("esims", esimStats);
        
        // Low stock alerts
        List<StockPool> lowStockPools = stockPoolRepository.findLowStockPools();
        stats.put("lowStockAlerts", lowStockPools.size());
        stats.put("lowStockPools", lowStockPools.stream()
            .map(pool -> Map.of(
                "id", pool.getId(),
                "name", pool.getName(),
                "availableQuantity", pool.getAvailableQuantity(),
                "productId", pool.getProductId()
            ))
            .collect(Collectors.toList()));
        
        return stats;
    }

    private StockPool getOrCreateStockPool(String productId, StockPool.StockType stockType, String adminUser) {
        Optional<StockPool> existingPool = stockPoolRepository.findByProductIdAndStockType(productId, stockType);
        
        if (existingPool.isPresent()) {
            return existingPool.get();
        }
        
        // Create new pool
        StockPool newPool = new StockPool();
        
        // Try to get product if it exists (optional)
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            newPool.setName(product.getName() + " - " + stockType.name() + " Pool");
            newPool.setProduct(product);
            System.out.println("✅ Found existing product: " + product.getName());
        } else {
            // Create pool without product reference
            newPool.setName("Stock Pool - " + productId + " - " + stockType.name());
            System.out.println("⚠️ Product not found with ID: " + productId + ". Creating pool without product reference.");
        }
        
        newPool.setStockType(stockType);
        newPool.setProductId(productId);
        newPool.setCreatedBy(adminUser);
        newPool.setCreatedDate(LocalDateTime.now());
        newPool.setStatus(StockPool.StockStatus.ACTIVE);
        
        return newPool;
    }

    private List<StockItemDTO> parseCSV(MultipartFile file) throws Exception {
        List<StockItemDTO> items = new ArrayList<>();
        
        System.out.println("📄 Starting CSV parsing...");
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .withIgnoreHeaderCase()
                .withTrim());
            
            // Print headers for debugging
            System.out.println("CSV Headers: " + csvParser.getHeaderNames());
            
            int rowCount = 0;
            for (CSVRecord record : csvParser) {
                rowCount++;
                System.out.println("Processing row " + rowCount + ": " + record);
                
                StockItemDTO item = new StockItemDTO();
                
                // Support both "pin" and "pinNumber" column names
                String pinData = null;
                if (record.isMapped("pin")) {
                    pinData = record.get("pin");
                    System.out.println("  Found 'pin': " + pinData);
                } else if (record.isMapped("pinNumber")) {
                    pinData = record.get("pinNumber");
                    System.out.println("  Found 'pinNumber': " + pinData);
                }
                
                // Skip rows with empty PIN data
                if (pinData == null || pinData.trim().isEmpty()) {
                    System.out.println("  ⚠️ Skipping row " + rowCount + " - no PIN data");
                    continue;
                }
                
                // Convert scientific notation to full number (fixes Excel formatting)
                pinData = convertScientificNotation(pinData);
                item.setItemData(pinData);
                System.out.println("  ✅ PIN after conversion: " + pinData);
                
                // Support both "serial_number" and "serialNumber"
                String serialNum = null;
                if (record.isMapped("serial_number")) {
                    serialNum = record.get("serial_number");
                } else if (record.isMapped("serialNumber")) {
                    serialNum = record.get("serialNumber");
                }
                
                // Also convert serial number if it's in scientific notation
                if (serialNum != null && !serialNum.trim().isEmpty()) {
                    serialNum = convertScientificNotation(serialNum);
                    item.setSerialNumber(serialNum);
                    System.out.println("  Serial Number: " + serialNum);
                }
                
                // Store productId separately
                if (record.isMapped("productId")) {
                    String productIdValue = record.get("productId");
                    if (productIdValue != null && !productIdValue.trim().isEmpty()) {
                        item.setProductId(productIdValue.trim());
                        System.out.println("  Product ID: " + productIdValue.trim());
                    }
                }
                
                // Store notes separately
                if (record.isMapped("notes")) {
                    String notesValue = record.get("notes");
                    if (notesValue != null && !notesValue.trim().isEmpty()) {
                        item.setNotes(notesValue.trim());
                        System.out.println("  Notes: " + notesValue.trim());
                    }
                }
                
                // Store price separately
                if (record.isMapped("price")) {
                    String priceValue = record.get("price");
                    if (priceValue != null && !priceValue.trim().isEmpty()) {
                        item.setPrice(priceValue.trim());
                        System.out.println("  Price: " + priceValue.trim());
                    }
                }
                
                // Store type separately
                if (record.isMapped("type")) {
                    String typeValue = record.get("type");
                    if (typeValue != null && !typeValue.trim().isEmpty()) {
                        item.setType(typeValue.trim());
                        System.out.println("  Type: " + typeValue.trim());
                    }
                }
                
                items.add(item);
                System.out.println("  ✅ Item added to list");
            }
            
            System.out.println("📊 CSV parsing complete. Total items parsed: " + items.size());
        } catch (Exception e) {
            System.err.println("❌ Error parsing CSV: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        return items;
    }

    private List<StockItemDTO> parseEsimCSV(MultipartFile file) throws Exception {
        List<StockItemDTO> items = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .withIgnoreHeaderCase()
                .withTrim());
            
            for (CSVRecord record : csvParser) {
                StockItemDTO item = new StockItemDTO();
                item.setItemData(record.get("iccid"));
                item.setSerialNumber(record.get("serialNumber"));
                item.setActivationUrl(record.get("activationUrl"));
                item.setQrCodeUrl(record.get("qrCodeUrl"));
                
                if (record.isMapped("qrCodeImage")) {
                    item.setQrCodeImage(record.get("qrCodeImage"));
                }
                
                // Store productId in notes temporarily
                if (record.isMapped("productId")) {
                    item.setNotes("productId:" + record.get("productId"));
                }
                
                items.add(item);
            }
        }
        
        return items;
    }

    private Map<String, List<StockItemDTO>> groupByProduct(List<StockItemDTO> items) {
        Map<String, List<StockItemDTO>> grouped = new HashMap<>();
        
        for (StockItemDTO item : items) {
            String productId = extractProductId(item.getNotes());
            grouped.computeIfAbsent(productId, k -> new ArrayList<>()).add(item);
        }
        
        return grouped;
    }

    private Map<String, List<StockItemDTO>> groupByProduct(List<StockItemDTO> items, String defaultProductId) {
        Map<String, List<StockItemDTO>> grouped = new HashMap<>();
        String finalProductId = (defaultProductId != null && !defaultProductId.trim().isEmpty()) 
            ? defaultProductId.trim()
            : "default";
        
        System.out.println("🔍 Grouping items by product ID...");
        System.out.println("   Default Product ID: " + finalProductId);
        
        for (StockItemDTO item : items) {
            // Use productId from DTO, fallback to default
            String productId = item.getProductId();
            if (productId == null || productId.trim().isEmpty()) {
                productId = finalProductId;
            } else {
                productId = productId.trim();
            }
            
            System.out.println("   Item grouped under Product ID: " + productId);
            grouped.computeIfAbsent(productId, k -> new ArrayList<>()).add(item);
        }
        
        System.out.println("✅ Grouped into " + grouped.size() + " product(s)");
        return grouped;
    }

    private String extractProductId(String notes) {
        if (notes != null && notes.startsWith("productId:")) {
            return notes.substring(10);
        }
        return "default";
    }

    /**
     * Encrypt sensitive data (PIN numbers, eSIM ICCIDs) using AES-256
     * In production, use a proper encryption library like Jasypt or AWS KMS
     */
    private String encryptData(String data) {
        if (data == null || data.isEmpty()) {
            return data;
        }
        try {
            // Simple Base64 encoding for now - REPLACE with proper encryption in production!
            // TODO: Implement AES-256 encryption with key management
            return java.util.Base64.getEncoder().encodeToString(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt sensitive data
     */
    public String decryptData(String encryptedData) {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return encryptedData;
        }
        try {
            // Simple Base64 decoding - REPLACE with proper decryption in production!
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(encryptedData);
            return new String(decodedBytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Mask sensitive data for display (show only last 4 characters)
     */
    public String maskData(String data) {
        if (data == null || data.length() <= 4) {
            return "****";
        }
        String last4 = data.substring(data.length() - 4);
        return "****" + last4;
    }

    /**
     * Convert scientific notation to full number string
     * Handles Excel's scientific notation format (e.g., "1.23E+15" -> "1230000000000000")
     */
    private String convertScientificNotation(String value) {
        if (value == null || value.trim().isEmpty()) {
            return value;
        }
        
        String trimmedValue = value.trim();
        
        // Check if it's in scientific notation format
        if (trimmedValue.matches(".*[eE][+-]?\\d+.*")) {
            try {
                // Use BigDecimal to handle large numbers without precision loss
                BigDecimal decimal = new BigDecimal(trimmedValue);
                // Convert to plain string without scientific notation
                return decimal.toPlainString();
            } catch (NumberFormatException e) {
                // If conversion fails, return original value
                System.err.println("Failed to convert scientific notation: " + trimmedValue + " - " + e.getMessage());
                return trimmedValue;
            }
        }
        
        return trimmedValue;
    }

    /**
     * Delete entire stock pool
     */
    public void deleteStockPool(String poolId) {
        StockPool pool = stockPoolRepository.findById(poolId)
            .orElseThrow(() -> new RuntimeException("Stock pool not found: " + poolId));
        
        // Check if any items are already assigned/used
        long assignedOrUsedCount = pool.getItems().stream()
            .filter(item -> item.getStatus() == StockItem.ItemStatus.ASSIGNED || 
                           item.getStatus() == StockItem.ItemStatus.USED)
            .count();
        
        if (assignedOrUsedCount > 0) {
            throw new RuntimeException("Cannot delete pool: " + assignedOrUsedCount + " items are already assigned or used");
        }
        
        stockPoolRepository.deleteById(poolId);
    }

    /**
     * Delete individual item from pool
     */
    public void deleteStockItem(String poolId, String itemId) {
        StockPool pool = stockPoolRepository.findById(poolId)
            .orElseThrow(() -> new RuntimeException("Stock pool not found: " + poolId));
        
        StockItem item = pool.getItems().stream()
            .filter(i -> itemId.equals(i.getItemId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
        
        // Check if item is already assigned/used
        if (item.getStatus() == StockItem.ItemStatus.ASSIGNED || 
            item.getStatus() == StockItem.ItemStatus.USED) {
            throw new RuntimeException("Cannot delete item: Item is already assigned or used");
        }
        
        pool.getItems().removeIf(i -> itemId.equals(i.getItemId()));
        stockPoolRepository.save(pool);
    }

    /**
     * Update individual item details
     */
    public void updateStockItem(String poolId, String itemId, Map<String, String> updates) {
        StockPool pool = stockPoolRepository.findById(poolId)
            .orElseThrow(() -> new RuntimeException("Stock pool not found: " + poolId));
        
        StockItem item = pool.getItems().stream()
            .filter(i -> itemId.equals(i.getItemId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
        
        // Update allowed fields
        if (updates.containsKey("price")) {
            item.setPrice(updates.get("price"));
        }
        if (updates.containsKey("type")) {
            item.setType(updates.get("type"));
        }
        if (updates.containsKey("notes")) {
            item.setNotes(updates.get("notes"));
        }
        if (updates.containsKey("serialNumber")) {
            item.setSerialNumber(updates.get("serialNumber"));
        }
        
        stockPoolRepository.save(pool);
    }
}
