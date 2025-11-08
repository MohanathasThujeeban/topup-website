package com.example.topup.demo.repository;

import com.example.topup.demo.entity.EsimOrderRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EsimOrderRequestRepository extends MongoRepository<EsimOrderRequest, String> {
    List<EsimOrderRequest> findByStatus(String status);
    List<EsimOrderRequest> findByCustomerEmail(String email);
    EsimOrderRequest findByOrderNumber(String orderNumber);
    List<EsimOrderRequest> findByRequestDateBetween(LocalDateTime start, LocalDateTime end);
}
