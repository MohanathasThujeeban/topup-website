package com.example.topup.demo.service;

import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.BusinessDetails;
import com.example.topup.demo.entity.VerificationToken;
import com.example.topup.demo.repository.UserRepository;
import com.example.topup.demo.repository.BusinessDetailsRepository;
import com.example.topup.demo.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register a new personal user
     */
    public User registerPersonalUser(String firstName, String lastName, String email, 
                                   String mobileNumber, String password) {
        // Check if user already exists
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Create new user
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email.toLowerCase());
        user.setMobileNumber(mobileNumber);
        user.setPassword(passwordEncoder.encode(password));
        user.setAccountType(User.AccountType.PERSONAL);
        user.setAccountStatus(User.AccountStatus.PENDING_VERIFICATION);
        user.setCreatedDate(LocalDateTime.now());

        // Save user
        user = userRepository.save(user);

        // Send verification email
        sendEmailVerification(user);

        return user;
    }

    /**
     * Register a new business user
     */
    public User registerBusinessUser(String firstName, String lastName, String email, 
                                   String mobileNumber, String password, BusinessDetails businessDetails) {
        // Check if user already exists
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Check if organization number already exists
        if (businessDetailsRepository.existsByOrganizationNumber(businessDetails.getOrganizationNumber())) {
            throw new IllegalArgumentException("Business with this organization number already exists");
        }

        // Save business details first
        businessDetails.setCreatedDate(LocalDateTime.now());
        businessDetails = businessDetailsRepository.save(businessDetails);

        // Create new user
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email.toLowerCase());
        user.setMobileNumber(mobileNumber);
        user.setPassword(passwordEncoder.encode(password));
        user.setAccountType(User.AccountType.BUSINESS);
        user.setAccountStatus(User.AccountStatus.PENDING_BUSINESS_APPROVAL);
        user.setBusinessDetails(businessDetails);
        user.setCreatedDate(LocalDateTime.now());

        // Save user
        user = userRepository.save(user);

        // Send verification email
        sendEmailVerification(user);

        // Send business pending approval notification
        emailService.sendBusinessPendingEmail(user.getEmail(), user.getFirstName(), 
                                            businessDetails.getCompanyName());

        return user;
    }

    /**
     * Send email verification
     */
    public void sendEmailVerification(User user) {
        // Invalidate any existing verification tokens
        invalidateExistingTokens(user.getEmail(), VerificationToken.TokenType.EMAIL_VERIFICATION);

        // Create new verification token
        VerificationToken token = new VerificationToken(user, VerificationToken.TokenType.EMAIL_VERIFICATION);
        verificationTokenRepository.save(token);

        // Send verification email
        emailService.sendEmailVerification(user.getEmail(), user.getFirstName(), token.getToken());
    }

    /**
     * Verify email with token
     */
    public boolean verifyEmail(String email, String token) {
        System.out.println("Verifying email: " + email + " with token: " + token);
        
        // Check if token exists at all
        Optional<VerificationToken> anyToken = verificationTokenRepository.findByToken(token);
        if (anyToken.isPresent()) {
            System.out.println("Token exists in database: " + anyToken.get());
        } else {
            System.out.println("Token not found in database!");
        }
        
        // Try to find valid token with expiry check
        Optional<VerificationToken> verificationToken = verificationTokenRepository
            .findValidTokenByTokenAndEmail(token, email, LocalDateTime.now());

        if (verificationToken.isPresent()) {
            System.out.println("Valid token found: " + verificationToken.get());
            
            VerificationToken vToken = verificationToken.get();
            User user = vToken.getUser();

            if (user != null) {
                // Mark token as used
                vToken.markAsUsed();
                verificationTokenRepository.save(vToken);

                // Activate user account
                user.setEmailVerified(true);
                if (user.isPersonalAccount()) {
                    user.setAccountStatus(User.AccountStatus.ACTIVE);
                }
                // Business accounts remain in PENDING_BUSINESS_APPROVAL status
                userRepository.save(user);

                // Send welcome email for personal accounts
                if (user.isPersonalAccount()) {
                    emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), false);
                }

                return true;
            } else {
                System.out.println("User not found for token!");
            }
        } else {
            System.out.println("No valid token found for this email and token combination!");
        }

        return false;
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Invalidate any existing password reset tokens
            invalidateExistingTokens(email, VerificationToken.TokenType.PASSWORD_RESET);

            // Create new password reset token
            VerificationToken token = new VerificationToken(user, VerificationToken.TokenType.PASSWORD_RESET);
            verificationTokenRepository.save(token);

            // Send password reset email
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token.getToken());
        }
        // Always return success to prevent email enumeration attacks
    }

    /**
     * Reset password with token
     */
    public boolean resetPassword(String email, String token, String newPassword) {
        Optional<VerificationToken> verificationToken = verificationTokenRepository
            .findValidToken(token, email, VerificationToken.TokenType.PASSWORD_RESET, LocalDateTime.now());

        if (verificationToken.isPresent()) {
            VerificationToken vToken = verificationToken.get();
            User user = vToken.getUser();

            if (user != null) {
                // Mark token as used
                vToken.markAsUsed();
                verificationTokenRepository.save(vToken);

                // Update user password
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setLastModifiedDate(LocalDateTime.now());
                userRepository.save(user);

                return true;
            }
        }

        return false;
    }

    /**
     * Validate reset token without using it
     */
    public boolean validateResetToken(String email, String token) {
        Optional<VerificationToken> verificationToken = verificationTokenRepository
            .findValidToken(token, email, VerificationToken.TokenType.PASSWORD_RESET, LocalDateTime.now());
        
        return verificationToken.isPresent();
    }
    
    /**
     * Approve business account
     */
    public void approveBusinessAccount(String userId, String temporaryPassword) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            if (user.isBusinessAccount() && user.isPendingBusinessApproval()) {
                // Update user status
                user.setAccountStatus(User.AccountStatus.ACTIVE);
                user.setLastModifiedDate(LocalDateTime.now());
                userRepository.save(user);

                // Update business details
                BusinessDetails businessDetails = user.getBusinessDetails();
                if (businessDetails != null) {
                    businessDetails.approve();
                    businessDetails.setLastModifiedDate(LocalDateTime.now());
                    businessDetailsRepository.save(businessDetails);
                }

                // Send approval email with credentials
                emailService.sendBusinessApprovalEmail(
                    user.getEmail(), 
                    user.getFirstName(),
                    businessDetails != null ? businessDetails.getCompanyName() : "N/A",
                    user.getEmail(), // username is email
                    temporaryPassword
                );

                // Send welcome email
                emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), true);
            }
        }
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    /**
     * Find users by account type
     */
    public java.util.List<User> findByAccountType(User.AccountType accountType) {
        return userRepository.findByAccountType(accountType);
    }

    /**
     * Find user by ID
     */
    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    /**
     * Update user last modified date
     */
    public void updateLastModifiedDate(User user) {
        user.setLastModifiedDate(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Invalidate existing tokens of a specific type for a user
     */
    private void invalidateExistingTokens(String email, VerificationToken.TokenType tokenType) {
        verificationTokenRepository.deleteByEmailAndTokenType(email, tokenType);
    }

    /**
     * Cleanup expired tokens
     */
    public void cleanupExpiredTokens() {
        verificationTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    /**
     * Cleanup used tokens older than 7 days
     */
    public void cleanupOldUsedTokens() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        verificationTokenRepository.deleteUsedTokensOlderThan(cutoffDate);
    }

    // Expose encoder for controller-level checks (dev only)
    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }
}