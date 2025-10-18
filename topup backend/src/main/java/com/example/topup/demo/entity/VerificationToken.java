package com.example.topup.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "verification_tokens")
@CompoundIndexes({
    @CompoundIndex(name = "email_token_idx", def = "{'email' : 1, 'token' : 1}"),
    @CompoundIndex(name = "type_expiry_idx", def = "{'tokenType' : 1, 'expiryDate' : 1}")
})
public class VerificationToken {

    @Id
    private String id;

    @Indexed
    private String token;

    @Indexed
    private String email;

    @DBRef
    private User user;

    @Indexed
    private TokenType tokenType;

    @Indexed(name = "expiryDate", expireAfterSeconds = 604800) // Auto-delete after 7 days (increased from 24 hours)
    private LocalDateTime expiryDate;

    private boolean used = false;

    @CreatedDate
    private LocalDateTime createdDate;

    // Constructors
    public VerificationToken() {}

    public VerificationToken(User user, TokenType tokenType) {
        this.user = user;
        this.email = user.getEmail();
        this.tokenType = tokenType;
        this.token = generateToken();
        this.expiryDate = calculateExpiryDate(tokenType);
        this.used = false;
    }

    public VerificationToken(String email, TokenType tokenType) {
        this.email = email;
        this.tokenType = tokenType;
        this.token = generateToken();
        this.expiryDate = calculateExpiryDate(tokenType);
        this.used = false;
    }

    // Token Type Enum
    public enum TokenType {
        EMAIL_VERIFICATION(168), // 7 days (increased from 24 hours)
        PASSWORD_RESET(24),      // 24 hours (increased from 1 hour)
        ACCOUNT_ACTIVATION(168); // 7 days (increased from 72 hours)

        private final int hoursValid;

        TokenType(int hoursValid) {
            this.hoursValid = hoursValid;
        }

        public int getHoursValid() {
            return hoursValid;
        }
    }

    // Private Methods
    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private LocalDateTime calculateExpiryDate(TokenType tokenType) {
        return LocalDateTime.now().plusHours(tokenType.getHoursValid());
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.email = user != null ? user.getEmail() : null;
    }

    public TokenType getTokenType() {
        return tokenType;
    }

    public void setTokenType(TokenType tokenType) {
        this.tokenType = tokenType;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    // Utility Methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !used && !isExpired();
    }

    public void markAsUsed() {
        this.used = true;
    }

    public boolean isEmailVerificationToken() {
        return tokenType == TokenType.EMAIL_VERIFICATION;
    }

    public boolean isPasswordResetToken() {
        return tokenType == TokenType.PASSWORD_RESET;
    }

    public boolean isAccountActivationToken() {
        return tokenType == TokenType.ACCOUNT_ACTIVATION;
    }

    public long getMinutesUntilExpiry() {
        if (isExpired()) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), expiryDate).toMinutes();
    }

    public long getHoursUntilExpiry() {
        if (isExpired()) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), expiryDate).toHours();
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "VerificationToken{" +
                "id='" + id + '\'' +
                ", email='" + email + '\'' +
                ", tokenType=" + tokenType +
                ", expiryDate=" + expiryDate +
                ", used=" + used +
                ", expired=" + isExpired() +
                ", createdDate=" + createdDate +
                '}';
    }
}