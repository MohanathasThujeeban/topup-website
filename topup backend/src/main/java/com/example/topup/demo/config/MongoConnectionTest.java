package com.example.topup.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile({"prod", "test"})
public class MongoConnectionTest implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;
    
    @Value("${spring.mongodb.uri:N/A}")
    private String mongoUri;

    public MongoConnectionTest(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("=== MongoDB Connection Test ===");
            System.out.println("MongoDB URI: " + hidePassword(mongoUri));
            
            // Test connection
            String dbName = mongoTemplate.getDb().getName();
            System.out.println("✅ Successfully connected to MongoDB!");
            System.out.println("Database Name: " + dbName);
            
            // List collections
            var collections = mongoTemplate.getCollectionNames();
            System.out.println("Available Collections: " + collections);
            
            System.out.println("=== MongoDB Connection Test Complete ===");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to connect to MongoDB: " + e.getMessage());
            System.err.println("Please check your MongoDB configuration and ensure the database is accessible.");
        }
    }
    
    private String hidePassword(String uri) {
        if (uri.contains("@")) {
            return uri.replaceAll("://[^:]+:[^@]+@", "://***:***@");
        }
        return uri;
    }
}