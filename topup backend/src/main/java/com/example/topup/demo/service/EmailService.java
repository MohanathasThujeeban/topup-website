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
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Business Account Approved</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #00b09b 0%%, #96c93d 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Congratulations %s!</h2>
                    
                    <p style="margin-bottom: 20px;">Great news! Your business account for <strong>%s</strong> has been approved and is now active.</p>
                    
                    <div style="background: white; border: 2px solid #00b09b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #00b09b;">Your Login Credentials</h3>
                        <p style="margin: 10px 0;"><strong>Username:</strong> %s</p>
                        <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #f4f4f4; padding: 2px 6px; border-radius: 3px;">%s</code></p>
                        <p style="margin: 10px 0; color: #e74c3c; font-size: 14px;">
                            <strong>Important:</strong> Please change your password after your first login for security.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s/login" style="background: linear-gradient(135deg, #00b09b 0%%, #96c93d 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        Questions? Contact our business support team at 
                        <a href="mailto:%s" style="color: #00b09b;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            firstName, companyName, username, temporaryPassword, appUrl, supportEmail, supportEmail
        );
    }

    private String generateBusinessPendingHtml(String firstName, String companyName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Business Registration Under Review</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
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
                        <a href="mailto:%s" style="color: #f5576c;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            firstName, companyName, supportEmail, supportEmail
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
}