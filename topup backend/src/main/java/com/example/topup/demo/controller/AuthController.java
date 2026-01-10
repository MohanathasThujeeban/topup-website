package com.example.topup.demo.controller;

import com.example.topup.demo.entity.User;
import com.example.topup.demo.entity.BusinessDetails;
import com.example.topup.demo.entity.Address;
import com.example.topup.demo.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://localhost:5173", 
    "http://172.20.10.3:3000", 
    "http://172.20.10.3", 
    "https://topup.neirahtech",
    "https://topup-website-nine.vercel.app",
    "https://topup-website-gmoj.vercel.app",
    "https://topup-backend-production.up.railway.app"
}, 
    allowedHeaders = "*", 
    exposedHeaders = {"Authorization", "Content-Type"},
    allowCredentials = "true", 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    maxAge = 3600)
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Login (development-friendly): verifies credentials and returns a basic token and user payload
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userService.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", false);
                res.put("message", "Invalid email or password");
                return ResponseEntity.status(401).body(res);
            }

            User user = userOpt.get();
            // Validate password
            boolean matches = userService
                .getPasswordEncoder()
                .matches(request.getPassword(), user.getPassword());
            if (!matches) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", false);
                res.put("message", "Invalid email or password");
                return ResponseEntity.status(401).body(res);
            }

            // Ensure email verified for personal accounts before login (business accounts can login without verification)
            if (!user.isEmailVerified() && user.getAccountType() == User.AccountType.PERSONAL) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", false);
                res.put("message", "Please verify your email to continue.");
                res.put("requiresVerification", true);
                return ResponseEntity.status(403).body(res);
            }

            // Generate a simple dev token (replace with JWT in production)
            String token = "dev-" + UUID.randomUUID();

            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("id", user.getId());
            userPayload.put("name", (user.getFirstName() != null ? user.getFirstName() : "")
                    + (user.getLastName() != null ? (" " + user.getLastName()) : ""));
            userPayload.put("email", user.getEmail());
            userPayload.put("accountType", user.getAccountType() != null ? user.getAccountType().name() : "PERSONAL");
            userPayload.put("joinedAt", user.getCreatedDate());
            userPayload.put("avatar", null);
            Map<String, Object> prefs = new HashMap<>();
            prefs.put("currency", "NOK");
            prefs.put("language", "en");
            prefs.put("notifications", true);
            userPayload.put("preferences", prefs);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("user", userPayload);
            res.put("token", token);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("message", "Login failed. Please try again.");
            res.put("error", e.getMessage()); // Add detailed error for debugging
            return ResponseEntity.internalServerError().body(res);
        }
    }

    /**
     * Token verify (development): Accepts any Bearer token and returns success
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            return ResponseEntity.ok(res);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", "Missing or invalid Authorization header");
        return ResponseEntity.status(401).body(res);
    }

    /**
     * Personal user registration
     */
    @PostMapping("/register/personal")
    public ResponseEntity<?> registerPersonal(@Valid @RequestBody PersonalRegistrationRequest request) {
        System.out.println("Received registration request for: " + request.getEmail());
        try {
            System.out.println("Processing registration for: " + request.getFirstName() + " " + request.getLastName());
            User user = userService.registerPersonalUser(
                request.getFirstName(),
                request.getLastName(), 
                request.getEmail(),
                request.getMobileNumber(),
                request.getPassword()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful! Please check your email to verify your account.");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Registration failed. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Business user registration
     */
    @PostMapping("/register/business")
    public ResponseEntity<?> registerBusiness(@Valid @RequestBody BusinessRegistrationRequest request) {
        try {
            // Create business details
            BusinessDetails businessDetails = new BusinessDetails();
            businessDetails.setCompanyName(request.getCompanyName());
            businessDetails.setOrganizationNumber(request.getOrganizationNumber());
            businessDetails.setVatNumber(request.getVatNumber());
            businessDetails.setCompanyEmail(request.getCompanyEmail());

            // Set postal address
            Address postalAddress = new Address();
            postalAddress.setStreet(request.getPostalAddress().getStreet());
            postalAddress.setCity(request.getPostalAddress().getCity());
            postalAddress.setPostalCode(request.getPostalAddress().getPostalCode());
            postalAddress.setCountry(request.getPostalAddress().getCountry());
            businessDetails.setPostalAddress(postalAddress);

            // Set billing address
            Address billingAddress = new Address();
            billingAddress.setStreet(request.getBillingAddress().getStreet());
            billingAddress.setCity(request.getBillingAddress().getCity());
            billingAddress.setPostalCode(request.getBillingAddress().getPostalCode());
            billingAddress.setCountry(request.getBillingAddress().getCountry());
            businessDetails.setBillingAddress(billingAddress);

            // Set verification method
            BusinessDetails.VerificationMethod verificationMethod = 
                "bankid".equalsIgnoreCase(request.getVerificationMethod()) ? 
                BusinessDetails.VerificationMethod.BANK_ID : 
                BusinessDetails.VerificationMethod.MANUAL;
            businessDetails.setVerificationMethod(verificationMethod);

            User user = userService.registerBusinessUser(
                request.getFirstName(),
                request.getLastName(), 
                request.getEmail(),
                request.getMobileNumber(),
                request.getPassword(),
                businessDetails
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Business registration submitted successfully! Please check your email for verification instructions.");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("status", "pending_approval");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Business registration failed. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Email verification
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token, @RequestParam String email) {
        try {
            System.out.println("GET Verification request received - Token: " + token + ", Email: " + email);
            
            // Validate parameters
            if (token == null || token.trim().isEmpty() || email == null || email.trim().isEmpty()) {
                System.out.println("Missing verification parameters - token: " + token + ", email: " + email);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Missing required verification parameters. Please check your verification link.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            boolean verified = userService.verifyEmail(email, token);
            
            Map<String, Object> response = new HashMap<>();
            if (verified) {
                System.out.println("Email verification successful for " + email);
                response.put("success", true);
                response.put("message", "Email verified successfully!");
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Email verification failed for " + email + " - Invalid or expired token");
                response.put("success", false);
                response.put("message", "Invalid or expired verification token.");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.out.println("Email verification error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Email verification failed. Please try again. Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Email verification (POST version for backward compatibility)
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmailPost(@Valid @RequestBody EmailVerificationRequest request) {
        try {
            System.out.println("POST Verification request received - Token: " + request.getToken() + ", Email: " + request.getEmail());
            
            boolean verified = userService.verifyEmail(request.getEmail(), request.getToken());
            
            Map<String, Object> response = new HashMap<>();
            if (verified) {
                System.out.println("Email verification successful for " + request.getEmail());
                response.put("success", true);
                response.put("message", "Email verified successfully!");
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Email verification failed for " + request.getEmail() + " - Invalid or expired token");
                response.put("success", false);
                response.put("message", "Invalid or expired verification token.");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.out.println("Email verification error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Email verification failed. Please try again. Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Resend email verification
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        try {
            var userOptional = userService.findByEmail(request.getEmail());
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                if (!user.isEmailVerified()) {
                    userService.sendEmailVerification(user);
                }
            }

            // Always return success to prevent email enumeration
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "If the email exists, a verification email has been sent.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to resend verification email. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Send password reset email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            userService.sendPasswordResetEmail(request.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "If the email exists, a password reset link has been sent.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send password reset email. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Validate reset token without using it
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token, @RequestParam String email) {
        try {
            boolean isValid = userService.validateResetToken(email, token);

            Map<String, Object> response = new HashMap<>();
            if (isValid) {
                response.put("success", true);
                response.put("message", "Reset token is valid.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired reset token.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to validate reset token. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Reset password with token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            boolean reset = userService.resetPassword(request.getEmail(), request.getToken(), request.getNewPassword());

            Map<String, Object> response = new HashMap<>();
            if (reset) {
                response.put("success", true);
                response.put("message", "Password reset successfully!");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired reset token.");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Password reset failed. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Check if email exists
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            boolean exists = userService.emailExists(email);

            Map<String, Object> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("exists", false);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Change password for authenticated user
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        try {
            // Get authenticated user
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not authenticated"));
            }

            String email = authentication.getName();
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify old password
            if (!userService.verifyPassword(user, request.getOldPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Current password is incorrect"));
            }

            // Update password
            userService.updatePassword(user, request.getNewPassword());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password changed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to change password: " + e.getMessage()));
        }
    }

    // Request DTOs
    public static class PersonalRegistrationRequest {
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[0-9\\+][0-9]{7,14}$", message = "Please provide a valid mobile number")
        private String mobileNumber;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String password;
        
        private boolean acceptMarketing;
        
        private String accountType;

        // Getters and Setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public boolean getAcceptMarketing() { return acceptMarketing; }
        public void setAcceptMarketing(boolean acceptMarketing) { this.acceptMarketing = acceptMarketing; }
        public String getAccountType() { return accountType; }
        public void setAccountType(String accountType) { this.accountType = accountType; }
    }

    public static class BusinessRegistrationRequest extends PersonalRegistrationRequest {
        @NotBlank(message = "Company name is required")
        @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
        private String companyName;

        @NotBlank(message = "Organization number is required")
        @Pattern(regexp = "\\d{9}", message = "Organization number must be exactly 9 digits")
        private String organizationNumber;

        @Pattern(regexp = "^(|\\d{12})$", message = "VAT number must be exactly 12 digits or empty")
        private String vatNumber;

        @NotBlank(message = "Company email is required")
        @Email(message = "Please provide a valid company email address")
        private String companyEmail;

        @Valid
        private AddressDTO postalAddress;

        @Valid
        private AddressDTO billingAddress;

        @NotBlank(message = "Verification method is required")
        private String verificationMethod;

        // Getters and Setters
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getOrganizationNumber() { return organizationNumber; }
        public void setOrganizationNumber(String organizationNumber) { this.organizationNumber = organizationNumber; }
        public String getVatNumber() { return vatNumber; }
        public void setVatNumber(String vatNumber) { this.vatNumber = vatNumber; }
        public String getCompanyEmail() { return companyEmail; }
        public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
        public AddressDTO getPostalAddress() { return postalAddress; }
        public void setPostalAddress(AddressDTO postalAddress) { this.postalAddress = postalAddress; }
        public AddressDTO getBillingAddress() { return billingAddress; }
        public void setBillingAddress(AddressDTO billingAddress) { this.billingAddress = billingAddress; }
        public String getVerificationMethod() { return verificationMethod; }
        public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }
    }

    public static class AddressDTO {
        @NotBlank(message = "Street is required")
        private String street;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "Postal code is required")
        private String postalCode;

        @NotBlank(message = "Country is required")
        private String country;

        // Getters and Setters
        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    public static class EmailVerificationRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Token is required")
        private String token;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class ResendVerificationRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Token is required")
        private String token;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String newPassword;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ChangePasswordRequest {
        @NotBlank(message = "Old password is required")
        private String oldPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters long")
        private String newPassword;

        // Getters and Setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}