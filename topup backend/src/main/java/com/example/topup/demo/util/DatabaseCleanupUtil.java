package com.example.topup.demo.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("db-cleanup")
public class DatabaseCleanupUtil implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        System.out.println("Starting database cleanup...");
        
        // Drop all collections
        for (String collectionName : mongoTemplate.getCollectionNames()) {
            System.out.println("Dropping collection: " + collectionName);
            mongoTemplate.getCollection(collectionName).drop();
        }
        
        System.out.println("Database cleanup completed successfully!");
        
        // Exit the application after cleanup
        System.exit(0);
    }
}