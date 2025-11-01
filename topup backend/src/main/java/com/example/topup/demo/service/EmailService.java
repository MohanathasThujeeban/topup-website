package com.example.topup.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.io.IOException;
import java.io.InputStream;

@Service
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.name:TopUp Pro}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Value("${app.support.email:support@topuppro.com}")
    private String supportEmail;

    /**
     * Send email verification message
     */
    public void sendEmailVerification(String toEmail, String firstName, String verificationToken) {
        try {
            String verificationUrl = appUrl + "/verify-email?token=" + verificationToken + "&email=" + toEmail;
            // Create a 16-digit verification key from the token (using first 16 chars or padding if needed)
            String verificationKey = (verificationToken.length() >= 16) ? 
                verificationToken.substring(0, 16) : 
                String.format("%-16s", verificationToken).replace(' ', '0');
            
            String htmlContent = generateEmailVerificationHtml(firstName, verificationUrl, verificationKey);
            
            sendHtmlEmail(
                toEmail,
                "Verify Your Email Address - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send verification email", e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {
        try {
            String resetUrl = appUrl + "/reset-password?token=" + resetToken + "&email=" + toEmail;
            String htmlContent = generatePasswordResetHtml(firstName, resetUrl);
            
            sendHtmlEmail(
                toEmail,
                "Reset Your Password - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Send business account approval email
     */
    public void sendBusinessApprovalEmail(String toEmail, String firstName, String companyName, String username, String temporaryPassword) {
        try {
            String htmlContent = generateBusinessApprovalHtml(firstName, companyName, username, temporaryPassword);
            
            sendHtmlEmail(
                toEmail,
                "Business Account Approved - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send business approval email", e);
            throw new RuntimeException("Failed to send business approval email", e);
        }
    }

    /**
     * Send business account pending approval notification
     */
    public void sendBusinessPendingEmail(String toEmail, String firstName, String companyName) {
        try {
            String htmlContent = generateBusinessPendingHtml(firstName, companyName);
            
            sendHtmlEmail(
                toEmail,
                "Business Registration Under Review - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send business pending email", e);
            throw new RuntimeException("Failed to send business pending email", e);
        }
    }

    /**
     * Send business approval email (overloaded method for User entity)
     */
    public void sendBusinessApprovalEmail(com.example.topup.demo.entity.User user) {
        try {
            String companyName = user.getBusinessDetails() != null ? 
                user.getBusinessDetails().getCompanyName() : "Your Company";
            
            String htmlContent = generateBusinessApprovalHtml(
                user.getFirstName(), 
                companyName, 
                user.getEmail(), 
                null // No temporary password needed
            );
            
            sendHtmlEmail(
                user.getEmail(),
                "Business Account Approved - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send business approval email", e);
            throw new RuntimeException("Failed to send business approval email", e);
        }
    }

    /**
     * Send business rejection email
     */
    public void sendBusinessRejectionEmail(com.example.topup.demo.entity.User user, String reason) {
        try {
            String companyName = user.getBusinessDetails() != null ? 
                user.getBusinessDetails().getCompanyName() : "Your Company";
            
            String htmlContent = generateBusinessRejectionHtml(
                user.getFirstName(), 
                companyName, 
                reason
            );
            
            sendHtmlEmail(
                user.getEmail(),
                "Business Registration Update - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send business rejection email", e);
            throw new RuntimeException("Failed to send business rejection email", e);
        }
    }

    /**
     * Send customer enquiry acknowledgment email
     */
    public void sendEnquiryAcknowledgment(String toEmail, String customerName, String enquiryId, String subject) {
        try {
            String htmlContent = generateEnquiryAcknowledgmentHtml(customerName, enquiryId, subject);
            
            sendHtmlEmail(
                toEmail,
                "We've Received Your Enquiry - " + enquiryId + " - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send enquiry acknowledgment email", e);
            throw new RuntimeException("Failed to send enquiry acknowledgment email", e);
        }
    }

    /**
     * Send enquiry resolution notification email
     */
    public void sendEnquiryResolutionEmail(String toEmail, String customerName, String enquiryId, String subject, String resolution) {
        try {
            String htmlContent = generateEnquiryResolutionHtml(customerName, enquiryId, subject, resolution);
            
            sendHtmlEmail(
                toEmail,
                "Your Enquiry Has Been Resolved - " + enquiryId + " - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send enquiry resolution email", e);
            throw new RuntimeException("Failed to send enquiry resolution email", e);
        }
    }

    /**
     * Send business pending review email
     */
    public void sendBusinessUnderReviewEmail(String toEmail, String businessName) {
        try {
            String appName = "TopUp";
            String htmlContent = String.format("""
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #2563eb; text-align: center;'>Business Registration Under Review</h2>
                        <p>Dear %s,</p>
                        <p>Thank you for registering your business with %s. We have received your application and it is currently under review by our admin team.</p>
                        <div style='background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <h3 style='color: #92400e; margin-top: 0;'>What's Next?</h3>
                            <ul style='color: #92400e;'>
                                <li>Our team will review your business details within 1-2 business days</li>
                                <li>You will receive an email notification once the review is complete</li>
                                <li>If approved, you will gain access to retailer features and pricing</li>
                            </ul>
                        </div>
                        <p>If you have any questions, please don't hesitate to contact our support team.</p>
                        <p>Best regards,<br>The %s Team</p>
                    </div>
                </body>
                </html>
                """, businessName, appName, appName);
            
            sendHtmlEmail(
                toEmail,
                "Business Registration Under Review - " + appName,
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send business pending email", e);
            throw new RuntimeException("Failed to send business pending email", e);
        }
    }

    /**
     * Send welcome email after successful registration
     */
    public void sendWelcomeEmail(String toEmail, String firstName, boolean isBusinessAccount) {
        try {
            String htmlContent = generateWelcomeHtml(firstName, isBusinessAccount);
            
            sendHtmlEmail(
                toEmail,
                "Welcome to " + appName + "!",
                htmlContent
            );
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    /**
     * Send generic HTML email
     */
    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(supportEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    /**
     * Load and process HTML template with variable substitution
     */
    private String loadHtmlTemplate(String templateName) {
        try {
            Resource resource = new ClassPathResource("templates/" + templateName);
            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("Failed to load email template: " + templateName, e);
            return "<html><body><h2>Email Template Error</h2><p>Could not load email template.</p></body></html>";
        }
    }

    /**
     * Replace placeholders in HTML template
     */
    private String processTemplate(String template, String firstName, String companyName, String email) {
        return template
                .replace("{{firstName}}", firstName != null ? firstName : "")
                .replace("{{companyName}}", companyName != null ? companyName : "")
                .replace("{{email}}", email != null ? email : "")
                .replace("{{appUrl}}", appUrl)
                .replace("{{supportEmail}}", supportEmail)
                .replace("{{appName}}", appName);
    }

    // HTML Email Templates
    private String generateEmailVerificationHtml(String firstName, String verificationUrl, String verificationKey) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">%s</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                    <p style="margin-bottom: 20px;">Thank you for registering with %s. To complete your account setup, please verify your email address.</p>
                    <div style="background: #eef6ff; border: 2px dashed #667eea; padding: 18px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                        <span style="font-size: 22px; letter-spacing: 2px; font-family: 'Courier New', monospace; color: #333; font-weight: bold;">Your 16-digit key:</span><br>
                        <span style="font-size: 28px; font-family: 'Courier New', monospace; color: #667eea; font-weight: bold; background: #fff; padding: 8px 18px; border-radius: 6px; display: inline-block; margin-top: 10px;">%s</span>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                    </div>
                    <p style="margin-bottom: 20px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px; font-family: monospace;">%s</p>
                    <p style="margin-bottom: 20px; color: #666; font-size: 14px;">This verification link will expire in 24 hours for security purposes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        If you didn't create an account with us, please ignore this email or contact our support team at 
                        <a href="mailto:%s" style="color: #667eea;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """,
            appName, firstName, appName, verificationKey, verificationUrl, verificationUrl, supportEmail, supportEmail
        );
    }

    private String generatePasswordResetHtml(String firstName, String resetUrl) {
        // Try to load template from file
        try {
            // Read the template file
            Resource resource = new ClassPathResource("templates/password-reset-email.html");
            String template = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            
            // Format the template with the values
            return String.format(template, firstName, resetUrl, resetUrl, supportEmail, supportEmail);
        } catch (Exception e) {
            // Fall back to the inline template if file loading fails
            log.error("Failed to load password reset email template, falling back to default template", e);
            
            return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">%s</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                        
                        <p style="margin-bottom: 20px;">We received a request to reset your password for your %s account.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                        </div>
                        
                        <p style="margin-bottom: 20px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px; font-family: monospace;">%s</p>
                        
                        <p style="margin-bottom: 20px; color: #666; font-size: 14px;">This reset link will expire in 1 hour for security purposes.</p>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is still secure.
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            Need help? Contact our support team at 
                            <a href="mailto:%s" style="color: #667eea;">%s</a>
                        </p>
                    </div>
                </body>
                </html>
                """, 
                appName, firstName, appName, resetUrl, resetUrl, supportEmail, supportEmail
            );
        }
    }

    private String generateBusinessApprovalHtml(String firstName, String companyName, String username, String temporaryPassword) {
        try {
            String template = loadHtmlTemplate("business-approval-email.html");
            return processTemplate(template, firstName, companyName, username);
        } catch (Exception e) {
            log.error("Failed to generate business approval HTML", e);
            // Fallback to simple HTML
            return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Business Account Approved</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #10B981 0%%, #059669 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Congratulations %s!</h2>
                        
                        <p style="margin-bottom: 20px;">Great news! Your business account for <strong>%s</strong> has been approved and is now active.</p>
                        
                        <div style="background: white; border: 2px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #10B981;">Your Account Details</h3>
                            <p style="margin: 10px 0;"><strong>Email/Username:</strong> %s</p>
                            <p style="margin: 10px 0; color: #059669; font-size: 14px;">
                                <strong>Note:</strong> You can now log in using your existing credentials.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s/retailer-login" style="background: linear-gradient(135deg, #10B981 0%%, #059669 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Business Dashboard</a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            Questions? Contact our business support team at 
                            <a href="mailto:%s" style="color: #10B981;">%s</a>
                        </p>
                    </div>
                </body>
                </html>
                """, 
                firstName, companyName, username, appUrl, supportEmail, supportEmail
            );
        }
    }

    private String generateBusinessPendingHtml(String firstName, String companyName) {
        try {
            String template = loadHtmlTemplate("business-pending-email.html");
            return processTemplate(template, firstName, companyName, null);
        } catch (Exception e) {
            log.error("Failed to generate business pending HTML", e);
            // Fallback to simple HTML
            return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Business Registration Under Review</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #FFA500 0%%, #FF6B35 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">⏳ Under Review</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                        
                        <p style="margin-bottom: 20px;">Thank you for submitting your business registration for <strong>%s</strong>.</p>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #856404;">📋 What's Happening Now?</h3>
                            <p style="margin: 10px 0; color: #856404;">
                                Our team is carefully reviewing your business information and documentation. 
                                This process typically takes 1-3 business days.
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            Questions about your application? Contact our business team at 
                            <a href="mailto:%s" style="color: #FFA500;">%s</a>
                        </p>
                    </div>
                </body>
                </html>
                """, 
                firstName, companyName, supportEmail, supportEmail
            );
        }
    }

    private String generateBusinessRejectionHtml(String firstName, String companyName, String reason) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Business Registration Update</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ff7675 0%%, #fd79a8 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">📋 Registration Update</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                    
                    <p style="margin-bottom: 20px;">Thank you for your interest in creating a business account with %s for <strong>%s</strong>.</p>
                    
                    <div style="background: #ffebee; border: 1px solid #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #721c24;">Additional Information Required</h3>
                        <p style="margin: 10px 0; color: #721c24;">
                            %s
                        </p>
                    </div>
                    
                    <p style="margin-bottom: 20px;">
                        If you have any questions or would like to resubmit your application with additional documentation, 
                        please don't hesitate to contact our business team.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s/contact" style="background: linear-gradient(135deg, #fd79a8 0%%, #ff7675 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Contact Support</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        Questions about your application? Contact our business team at 
                        <a href="mailto:%s" style="color: #fd79a8;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            firstName, appName, companyName, reason != null ? reason : "We need additional documentation to proceed with your application.", appUrl, supportEmail, supportEmail
        );
    }

    private String generateEnquiryAcknowledgmentHtml(String customerName, String enquiryId, String subject) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Enquiry Received</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #74b9ff 0%%, #0984e3 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">📨 Enquiry Received</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                    
                    <p style="margin-bottom: 20px;">Thank you for contacting %s. We've successfully received your enquiry and assigned it the reference number <strong>%s</strong>.</p>
                    
                    <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1976d2;">📋 Enquiry Details</h3>
                        <p style="margin: 5px 0; color: #1976d2;"><strong>Reference:</strong> %s</p>
                        <p style="margin: 5px 0; color: #1976d2;"><strong>Subject:</strong> %s</p>
                        <p style="margin: 5px 0; color: #1976d2;"><strong>Status:</strong> Open</p>
                    </div>
                    
                    <p style="margin-bottom: 20px;">
                        Our support team will review your enquiry and respond within 24 hours during business days. 
                        Please keep your reference number <strong>%s</strong> for future correspondence.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        Need immediate assistance? Contact our support team at 
                        <a href="mailto:%s" style="color: #0984e3;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            customerName, appName, enquiryId, enquiryId, subject, enquiryId, supportEmail, supportEmail
        );
    }

    private String generateEnquiryResolutionHtml(String customerName, String enquiryId, String subject, String resolution) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Enquiry Resolved</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #00b894 0%%, #00cec9 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Enquiry Resolved</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                    
                    <p style="margin-bottom: 20px;">Great news! Your enquiry <strong>%s</strong> has been resolved by our support team.</p>
                    
                    <div style="background: #e8f5e8; border: 1px solid #c8e6c9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2e7d32;">📋 Enquiry Summary</h3>
                        <p style="margin: 5px 0; color: #2e7d32;"><strong>Reference:</strong> %s</p>
                        <p style="margin: 5px 0; color: #2e7d32;"><strong>Subject:</strong> %s</p>
                        <p style="margin: 5px 0; color: #2e7d32;"><strong>Status:</strong> Resolved</p>
                    </div>
                    
                    <div style="background: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">💡 Resolution Details</h3>
                        <p style="margin: 10px 0; color: #555;">%s</p>
                    </div>
                    
                    <p style="margin-bottom: 20px;">
                        If you have any additional questions or need further assistance, please don't hesitate to contact us.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s/contact" style="background: linear-gradient(135deg, #00b894 0%%, #00cec9 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Contact Support</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        We'd love to hear about your experience! Contact us at 
                        <a href="mailto:%s" style="color: #00b894;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            customerName, enquiryId, enquiryId, subject, resolution, appUrl, supportEmail, supportEmail
        );
    }

    private String generateWelcomeHtml(String firstName, boolean isBusinessAccount) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to %s!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi %s!</h2>
                    
                    <p style="margin-bottom: 20px;">
                        Welcome to %s! Your %s account is now active and ready to use.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s/login" style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Exploring</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        Need help getting started? Contact our support team at 
                        <a href="mailto:%s" style="color: #667eea;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            appName, firstName, appName, isBusinessAccount ? "business" : "personal", appUrl, supportEmail, supportEmail
        );
    }

    /**
     * Generic method to send a simple email
     * @param toEmail Recipient email address
     * @param subject Email subject
     * @param message Email body (can be plain text or HTML)
     */
    public void sendEmail(String toEmail, String subject, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(supportEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            // Check if message contains HTML tags
            boolean isHtml = message.contains("<html") || message.contains("<div") || message.contains("<p");
            helper.setText(message, isHtml);

            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}