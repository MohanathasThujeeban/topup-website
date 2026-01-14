package com.example.topup.demo.repository;

import com.example.topup.demo.entity.RetailerProfit;
import com.example.topup.demo.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RetailerProfitRepository extends MongoRepository<RetailerProfit, String> {
    
    // Find by retailer and period
    List<RetailerProfit> findByRetailerAndPeriod(User retailer, String period);
    
    List<RetailerProfit> findByRetailer_IdAndPeriod(String retailerId, String period);
    
    // Find daily profit for specific date
    Optional<RetailerProfit> findByRetailerAndDateAndPeriod(User retailer, LocalDate date, String period);
    
    Optional<RetailerProfit> findByRetailer_IdAndDateAndPeriod(String retailerId, LocalDate date, String period);
    
    // Find monthly profit for specific month/year
    Optional<RetailerProfit> findByRetailerAndYearAndMonthAndPeriod(User retailer, Integer year, Integer month, String period);
    
    Optional<RetailerProfit> findByRetailer_IdAndYearAndMonthAndPeriod(String retailerId, Integer year, Integer month, String period);
    
    // Find yearly profit for specific year
    Optional<RetailerProfit> findByRetailerAndYearAndPeriod(User retailer, Integer year, String period);
    
    Optional<RetailerProfit> findByRetailer_IdAndYearAndPeriod(String retailerId, Integer year, String period);
    
    // Get all profits for a retailer ordered by date
    @Query("{ 'retailer.$id': ?0, 'period': 'daily' }")
    List<RetailerProfit> findDailyProfitsByRetailerId(String retailerId);
    
    @Query("{ 'retailer.$id': ?0, 'period': 'monthly' }")
    List<RetailerProfit> findMonthlyProfitsByRetailerId(String retailerId);
    
    @Query("{ 'retailer.$id': ?0, 'period': 'yearly' }")
    List<RetailerProfit> findYearlyProfitsByRetailerId(String retailerId);
    
    // Get profits within date range
    @Query("{ 'retailer.$id': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<RetailerProfit> findByRetailerIdAndDateBetween(String retailerId, LocalDate startDate, LocalDate endDate);
    
    // Delete old records
    void deleteByRetailer_IdAndDate(String retailerId, LocalDate date);
}
