package com.example.topup.demo.repository;

import com.example.topup.demo.entity.StockPool;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockPoolRepository extends MongoRepository<StockPool, String> {
    
    List<StockPool> findByStockType(StockPool.StockType stockType);
    
    List<StockPool> findByProductId(String productId);
    
    List<StockPool> findByStatus(StockPool.StockStatus status);
    
    List<StockPool> findByStockTypeAndStatus(StockPool.StockType stockType, StockPool.StockStatus status);
    
    Optional<StockPool> findByProductIdAndStockType(String productId, StockPool.StockType stockType);
    
    @Query("{ 'availableQuantity' : { $gt: 0 } }")
    List<StockPool> findAllWithAvailableStock();
    
    @Query("{ 'status': 'ACTIVE', 'availableQuantity': { $lt: 10, $gt: 0 } }")
    List<StockPool> findLowStockPools();
    
    @Query("{ 'status': 'ACTIVE', 'availableQuantity': { $lt: ?0, $gt: 0 } }")
    List<StockPool> findLowStockPoolsByThreshold(int threshold);
}
