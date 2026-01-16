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
    List<RetailerProfit> findByRetailer_IdAndPeriod(String retailerId, String period);
    
    // Find daily profit for specific date
    Optional<RetailerProfit> findByRetailer_IdAndDateAndPeriod(String retailerId, LocalDate date, String period);
    
    // Find monthly profit for specific month/year
    Optional<RetailerProfit> findByRetailer_IdAndYearAndMonthAndPeriod(String retailerId, Integer year, Integer month, String period);
    
    // Find yearly profit for specific year
    Optional<RetailerProfit> findByRetailer_IdAndYearAndPeriod(String retailerId, Integer year, String period);
    
    // Get profits within date range
    List<RetailerProfit> findByRetailer_IdAndDateBetween(String retailerId, LocalDate startDate, LocalDate endDate);
    
    // Delete old records
    void deleteByRetailer_IdAndDate(String retailerId, LocalDate date);
}
