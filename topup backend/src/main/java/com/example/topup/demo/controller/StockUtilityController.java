package com.example.topup.demo.controller;

import com.example.topup.demo.entity.StockPool;
import com.example.topup.demo.repository.StockPoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stock/utility")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StockUtilityController {

    @Autowired
    private StockPoolRepository stockPoolRepository;

    /**
     * Utility endpoint to add price to all items in a pool
     * This is useful when you've uploaded CSVs without price and want to add it later
     */
    @PostMapping("/pools/{poolId}/add-price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addPriceToPoolItems(
            @PathVariable String poolId,
            @RequestParam String price,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "false") boolean force) {
        
        try {
            StockPool pool = stockPoolRepository.findById(poolId)
                .orElseThrow(() -> new RuntimeException("Pool not found: " + poolId));
            
            int updatedCount = 0;
            for (StockPool.StockItem item : pool.getItems()) {
                // Update price if force=true OR if price is empty
                if (force || item.getPrice() == null || item.getPrice().isEmpty()) {
                    item.setPrice(price);
                    updatedCount++;
                }
                // Update type if force=true OR if type is empty
                if (force || (type != null && !type.isEmpty() && (item.getType() == null || item.getType().isEmpty()))) {
                    if (type != null && !type.isEmpty()) {
                        item.setType(type);
                    }
                }
            }
            
            stockPoolRepository.save(pool);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Price updated for " + updatedCount + " items");
            response.put("poolId", poolId);
            response.put("poolName", pool.getName());
            response.put("priceSet", price);
            response.put("typeSet", type);
            response.put("updatedItemsCount", updatedCount);
            response.put("forced", force);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update price for a single item
     */
    @PutMapping("/pools/{poolId}/items/{itemId}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateItemPrice(
            @PathVariable String poolId,
            @PathVariable String itemId,
            @RequestParam String price,
            @RequestParam(required = false) String type) {
        
        try {
            StockPool pool = stockPoolRepository.findById(poolId)
                .orElseThrow(() -> new RuntimeException("Pool not found: " + poolId));
            
            StockPool.StockItem item = pool.getItems().stream()
                .filter(i -> itemId.equals(i.getItemId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
            
            item.setPrice(price);
            if (type != null && !type.isEmpty()) {
                item.setType(type);
            }
            
            stockPoolRepository.save(pool);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item price updated");
            response.put("itemId", itemId);
            response.put("price", price);
            response.put("type", type);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
