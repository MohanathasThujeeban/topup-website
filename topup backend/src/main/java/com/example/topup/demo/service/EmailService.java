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

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

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
     * Send eSIM approval email with QR code
     */
    public void sendEsimApprovalEmail(String toEmail, String customerName, String orderNumber, 
                                      String esimSerial, String qrCodeBase64, String activationCode, String smDpAddress) {
        sendEsimApprovalEmail(toEmail, customerName, orderNumber, esimSerial, qrCodeBase64, activationCode, smDpAddress, null);
    }

    public void sendEsimApprovalEmail(String toEmail, String customerName, String orderNumber, 
                                      String esimSerial, String qrCodeBase64, String activationCode, String smDpAddress, String bundlePrice) {
        try {
            System.out.println("\n🔍 === sendEsimApprovalEmail DEBUG ===");
            System.out.println("   toEmail: " + toEmail);
            System.out.println("   customerName: " + customerName);
            System.out.println("   orderNumber: " + orderNumber);
            System.out.println("   esimSerial: " + esimSerial);
            System.out.println("   qrCodeBase64 length: " + (qrCodeBase64 != null ? qrCodeBase64.length() : 0));
            System.out.println("   qrCodeBase64 is null: " + (qrCodeBase64 == null));
            System.out.println("   qrCodeBase64 is empty: " + (qrCodeBase64 != null && qrCodeBase64.isEmpty()));
            System.out.println("   qrCodeBase64 starts with iVBOR: " + (qrCodeBase64 != null && qrCodeBase64.startsWith("iVBORw0KGgo")));
            
            if (qrCodeBase64 != null && qrCodeBase64.length() > 100) {
                System.out.println("   QR Code Preview (first 100 chars): " + qrCodeBase64.substring(0, 100));
            } else if (qrCodeBase64 != null) {
                System.out.println("   QR Code Full: " + qrCodeBase64);
            } else {
                System.out.println("   ❌ QR Code is NULL!");
            }
            
            System.out.println("   activationCode: " + (activationCode != null ? activationCode.substring(0, Math.min(50, activationCode.length())) + "..." : "null"));
            System.out.println("   smDpAddress: " + smDpAddress);
            System.out.println("   bundlePrice: " + bundlePrice);
            
            String htmlContent = generateEsimApprovalHtml(
                customerName, 
                orderNumber, 
                esimSerial, 
                qrCodeBase64, 
                activationCode,
                smDpAddress,
                bundlePrice
            );
            
            System.out.println("   HTML content length: " + htmlContent.length());
            System.out.println("   HTML contains QR_CODE_IMAGE placeholder: " + htmlContent.contains("{{QR_CODE_IMAGE}}"));
            System.out.println("   HTML contains data:image/png: " + htmlContent.contains("data:image/png;base64,"));
            
            // Find the QR code image tag in HTML
            int qrImageIndex = htmlContent.indexOf("data:image/png;base64,");
            if (qrImageIndex > 0) {
                int endIndex = Math.min(qrImageIndex + 100, htmlContent.length());
                System.out.println("   QR image tag preview: " + htmlContent.substring(qrImageIndex, endIndex));
            }
            
            sendHtmlEmailWithQrCode(
                toEmail,
                "Your eSIM is Ready! - Order #" + orderNumber + " - " + appName,
                htmlContent,
                qrCodeBase64
            );
            log.info("eSIM approval email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send eSIM approval email to: {}", toEmail, e);
            e.printStackTrace();
            throw new RuntimeException("Failed to send eSIM approval email", e);
        }
    }

    /**
     * Send eSIM rejection email
     */
    public void sendEsimRejectionEmail(String toEmail, String customerName, String orderNumber, String reason) {
        try {
            String htmlContent = generateEsimRejectionHtml(
                customerName, 
                orderNumber, 
                reason
            );
            
            sendHtmlEmail(
                toEmail,
                "eSIM Order Update - Order #" + orderNumber + " - " + appName,
                htmlContent
            );
            log.info("eSIM rejection email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send eSIM rejection email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send eSIM rejection email", e);
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
     * Send HTML email with QR code as inline attachment (Gmail compatible)
     */
    private void sendHtmlEmailWithQrCode(String toEmail, String subject, String htmlContent, String qrCodeBase64) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(supportEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            System.out.println("\n🔍 === Email Sending Debug ===");
            System.out.println("   To: " + toEmail);
            System.out.println("   Subject: " + subject);
            System.out.println("   QR Code Base64 length: " + (qrCodeBase64 != null ? qrCodeBase64.length() : 0));
            System.out.println("   HTML content length: " + htmlContent.length());
            System.out.println("   HTML contains data URI: " + htmlContent.contains("data:image/png;base64,"));
            
            // For Gmail compatibility, try both data URI and CID attachment
            String htmlToSend = htmlContent;
            
            // Add QR code as inline attachment if available
            if (qrCodeBase64 != null && !qrCodeBase64.isEmpty() && qrCodeBase64.startsWith("iVBORw0KGgo")) {
                try {
                    // Decode base64 to bytes
                    byte[] qrCodeBytes = java.util.Base64.getDecoder().decode(qrCodeBase64);
                    
                    System.out.println("   Decoded QR bytes length: " + qrCodeBytes.length);
                    
                    // Replace data URI with CID for better Gmail compatibility
                    htmlToSend = htmlContent.replace(
                        "data:image/png;base64," + qrCodeBase64,
                        "cid:qrCodeImage"
                    );
                    
                    System.out.println("   Replaced data URI with CID: " + htmlToSend.contains("cid:qrCodeImage"));
                    
                    // Set HTML content
                    helper.setText(htmlToSend, true);
                    
                    // Add as inline attachment with Content-ID
                    helper.addInline("qrCodeImage", new jakarta.mail.util.ByteArrayDataSource(qrCodeBytes, "image/png"));
                    
                    System.out.println("   ✅ QR code added as inline CID attachment (qrCodeImage)");
                } catch (Exception e) {
                    System.err.println("   ⚠️ Failed to attach QR code as CID, using data URI fallback: " + e.getMessage());
                    e.printStackTrace();
                    // Fallback: use data URI if CID fails
                    helper.setText(htmlContent, true);
                }
            } else {
                System.out.println("   ⚠️ QR code not attached - invalid or missing data");
                helper.setText(htmlContent, true);
            }
            
            mailSender.send(message);
            System.out.println("   ✅ Email sent successfully!");
            System.out.println("=================================\n");
        } catch (Exception e) {
            log.error("Error sending email with QR code attachment", e);
            throw new MessagingException("Failed to send email with QR code", e);
        }
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

    /**
     * Generate HTML for eSIM approval email with QR code using Telelys template
     */
    private String generateEsimApprovalHtml(String customerName, String orderNumber, 
                                           String esimSerial, String qrCodeBase64,
                                           String activationCode, String smDpAddress) {
        return generateEsimApprovalHtml(customerName, orderNumber, esimSerial, qrCodeBase64, activationCode, smDpAddress, null);
    }

    private String generateEsimApprovalHtml(String customerName, String orderNumber, 
                                           String esimSerial, String qrCodeBase64,
                                           String activationCode, String smDpAddress, String bundlePrice) {
        // Telelys template with placeholders
        String template = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your eSIM is Ready - Telelys</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #2563EB;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .logo-text {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .subheader {
      font-size: 18px;
      font-weight: 300;
    }
    .content {
      padding: 30px;
    }
    h1 {
      color: #1F2937;
      font-size: 24px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .intro {
      color: #666;
      margin-bottom: 25px;
      font-size: 16px;
    }
    h2 {
      color: #1F2937;
      font-size: 18px;
      margin-top: 25px;
      margin-bottom: 15px;
      font-weight: bold;
      border-bottom: 2px solid #2563EB;
      padding-bottom: 10px;
    }
    .info-box {
      background-color: #f9fafb;
      border-left: 4px solid #2563EB;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6B7280;
      font-weight: 500;
    }
    .info-value {
      color: #1F2937;
      font-weight: bold;
    }
    .important-list {
      list-style: none;
      margin: 15px 0;
    }
    .important-list li {
      padding: 10px 0;
      padding-left: 25px;
      position: relative;
      color: #555;
    }
    .important-list li:before {
      content: "•";
      color: #2563EB;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .steps {
      margin: 20px 0;
    }
    .step {
      margin-bottom: 20px;
      padding-left: 30px;
      position: relative;
    }
    .step-number {
      position: absolute;
      left: 0;
      top: 0;
      width: 24px;
      height: 24px;
      background: #2563EB;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
    }
    .step-title {
      font-weight: bold;
      color: #1F2937;
      margin-bottom: 5px;
    }
    .step-desc {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
    .activation-info {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .activation-info p {
      margin: 8px 0;
    }
    .activation-label {
      font-weight: bold;
      color: #1F2937;
    }
    .activation-value {
      color: #666;
      word-break: break-all;
      font-family: monospace;
      background: white;
      padding: 5px;
      border-radius: 3px;
      display: inline-block;
      margin-top: 3px;
    }
    .warning {
      color: #D32F2F;
      font-weight: bold;
      margin: 10px 0;
    }
    .qr-section {
      text-align: center;
      margin: 25px 0;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .qr-label {
      font-weight: bold;
      color: #1F2937;
      margin-bottom: 15px;
      display: block;
      font-size: 16px;
    }
    .qr-image {
      width: 200px !important;
      height: 200px !important;
      max-width: 200px !important;
      max-height: 200px !important;
      border: 2px solid #2563EB;
      padding: 10px;
      border-radius: 8px;
      background: white;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .footer-note {
      color: #9CA3AF;
      font-size: 12px;
      margin-top: 15px;
      font-style: italic;
    }
    .support-box {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .support-title {
      font-weight: bold;
      color: #92400E;
      margin-bottom: 10px;
    }
    .support-item {
      color: #78350F;
      margin: 5px 0;
    }
    .troubleshooting-item {
      margin-bottom: 15px;
      padding-left: 20px;
      position: relative;
    }
    .troubleshooting-item:before {
      content: "→";
      color: #2563EB;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .troubleshooting-title {
      font-weight: bold;
      color: #1F2937;
      margin-bottom: 5px;
    }
    .troubleshooting-desc {
      color: #666;
      font-size: 14px;
    }
    .email-footer {
      background-color: #1F2937;
      color: #9CA3AF;
      padding: 20px;
      text-align: center;
      font-size: 13px;
    }
    .footer-text {
      margin: 10px 0;
    }
    a {
      color: #2563EB;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px;
      }
      .content {
        padding: 20px;
      }
      .qr-image {
        max-width: 200px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">Telelys</div>
      <div class="subheader">Your eSIM is Ready!</div>
    </div>

    <div class="content">
      <h1>Thank you for choosing Telelys</h1>
      <p class="intro">You can find details of your eSIM and setup instructions below.</p>

      <h2>Your eSIM Information</h2>
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Date:</span>
          <span class="info-value">{{DATE}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Order ID:</span>
          <span class="info-value">{{ORDER_ID}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bundle Name:</span>
          <span class="info-value">{{BUNDLE_NAME}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bundle Price:</span>
          <span class="info-value">{{BUNDLE_PRICE}}</span>
        </div>
      </div>

      <h2>Important Notes Before Setting Up</h2>
      <ul class="important-list">
        <li>eSIM can only be installed when there is an internet connection.</li>
        <li>Please do not delete eSIM after activation. The eSIM QR code can only be activated once.</li>
        <li>eSIM cannot be transferred to another device after installation.</li>
      </ul>

      <h2>eSIM Setup Guide - For iOS</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-title">Go to Settings > Cellular (or Mobile Data)</div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-title">Click Add eSIM or Add Cellular Plan > Choose Use QR Code</div>
          <div class="step-desc">Scan the below QR or tap Enter Details Manually and enter the activation code if you cannot use your device to scan your QR. Besides, you can choose Open Photos to upload the image of QR code.</div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-title">Activation Information</div>
          <div class="activation-info">
            <p><span class="activation-label">SM-DP+ Address:</span><br><span class="activation-value">{{SM_DP_ADDRESS}}</span></p>
            <p><span class="activation-label">Activation Code:</span><br><span class="activation-value">{{ACTIVATION_CODE}}</span></p>
          </div>
          <div class="warning">Don't delete eSIM after setting up</div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-title">Click Next to finish the installation</div>
        </div>

        <div class="step">
          <div class="step-number">5</div>
          <div class="step-title">SIM Registration Required</div>
          <div class="step-desc">Please <a href="https://www.lyca-mobile.no/en/registration/">click here to register your SIM</a></div>
        </div>
      </div>

      <p class="footer-note">Only iOS 17 and above allows users to open QR codes from the "Photos".</p>

      <!-- QR Code Section -->
      <div class="qr-section">
        <span class="qr-label">📱 Scan this QR Code to Activate Your eSIM</span>
        {{QR_CODE_IMAGE}}
        <p style="color: #6B7280; font-size: 12px; margin-top: 15px; font-style: italic;">
          Point your camera at the QR code above to install the eSIM on your device
        </p>
      </div>

      <h2>eSIM Setup Guide - For Android</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-title">Go to Settings > Connections</div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-title">Choose Add eSIM > Choose Use QR Code</div>
          <div class="step-desc">Scan the below QR or tap Enter Details Manually and enter the activation code if you cannot use your device to scan your QR. Besides, you can upload the image of QR code.</div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-title">Activation Information</div>
          <div class="activation-info">
            <p><span class="activation-label">SM-DP+ Address:</span><br><span class="activation-value">{{SM_DP_ADDRESS}}</span></p>
            <p><span class="activation-label">Activation Code:</span><br><span class="activation-value">{{ACTIVATION_CODE}}</span></p>
          </div>
          <div class="warning">Don't delete eSIM after setting up</div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-title">Click Next to finish the installation</div>
        </div>

        <div class="step">
          <div class="step-number">5</div>
          <div class="step-title">SIM Registration Required</div>
          <div class="step-desc">Please <a href="https://www.lyca-mobile.no/en/registration/">click here to register your SIM</a></div>
        </div>
      </div>

      <p class="footer-note">Only Samsung Galaxy S20 (and above) and some Android Phones allow users to upload QR image to set up eSIM.</p>

      <div class="support-box">
        <div class="support-title">Need Help?</div>
        <div class="support-item"><strong>WhatsApp:</strong> {{WHATSAPP_NUMBER}}</div>
        <div class="support-item"><strong>Email:</strong> {{SUPPORT_EMAIL}}</div>
        <p style="margin-top: 10px; color: #78350F; font-size: 14px;">If you encounter any problems, please contact Telelys for timely support.</p>
      </div>

      <h2>If You Encounter Problems When Setting Up</h2>
      
      <div class="troubleshooting-item">
        <div class="troubleshooting-title">Unable to Scan the QR Code</div>
        <div class="troubleshooting-desc">Please try to place your phone camera opposite the QR Code and start scanning to ensure the camera captures the whole QR Code.</div>
      </div>

      <div class="troubleshooting-item">
        <div class="troubleshooting-title">eSIM in Activating Status</div>
        <div class="troubleshooting-desc">Successfully installed eSIM, you need to go to the country supported by your eSIM in order to start using it.</div>
      </div>

      <div class="troubleshooting-item">
        <div class="troubleshooting-title">eSIM Installed but No Signal (3G/4G)</div>
        <div class="troubleshooting-desc">Please check that you have enabled Data Roaming mode and Cellular Data mode on your phone.</div>
      </div>

      <div class="troubleshooting-item">
        <div class="troubleshooting-title">Network Signal Shows but Internet Not Available</div>
        <div class="troubleshooting-desc">It might be an APN issue. Please read the instruction to check APN and change the APN section on your device to: {{APN_SETTINGS}}</div>
      </div>
    </div>

    <div class="email-footer">
      <div class="footer-text">&copy; 2026 Telelys. All rights reserved.</div>
      <div class="footer-text">
        <a href="https://www.lyca-mobile.no/" style="color: #9CA3AF;">Visit our website</a> | 
        <a href="https://www.lyca-mobile.no/en/registration/" style="color: #9CA3AF;">Register SIM</a>
      </div>
    </div>
  </div>
</body>
</html>
            """;

        // Replace placeholders with actual values
        System.out.println("\n🔍 === generateEsimApprovalHtml DEBUG ===");
        System.out.println("   qrCodeBase64 input length: " + (qrCodeBase64 != null ? qrCodeBase64.length() : 0));
        System.out.println("   qrCodeBase64 is null: " + (qrCodeBase64 == null));
        System.out.println("   Template contains {{QR_CODE_IMAGE}}: " + template.contains("{{QR_CODE_IMAGE}}"));
        
        String qrCodeToUse = "";
        if (qrCodeBase64 != null && !qrCodeBase64.isEmpty()) {
            // Verify it's valid base64 PNG
            if (qrCodeBase64.startsWith("iVBORw0KGgo")) {
                // Simple img tag for maximum Gmail compatibility - no wrapper divs
                qrCodeToUse = "<img src=\"data:image/png;base64," + qrCodeBase64 + "\" " +
                             "alt=\"eSIM QR Code\" " +
                             "width=\"220\" " +
                             "height=\"220\" " +
                             "border=\"0\" " +
                             "style=\"display: block; width: 220px; height: 220px; max-width: 220px; max-height: 220px; margin: 0 auto;\" " +
                             "/>";
                System.out.println("   ✅ QR code image tag created successfully (Gmail-optimized)");
            } else {
                qrCodeToUse = "<p style=\"color: #dc2626; text-align: center; font-weight: bold;\">⚠️ QR Code format invalid (doesn't start with PNG signature)</p>";
                System.out.println("   ⚠️ QR code doesn't start with PNG signature: " + qrCodeBase64.substring(0, Math.min(50, qrCodeBase64.length())));
            }
        } else {
            qrCodeToUse = "<p style=\"color: #dc2626; text-align: center; font-weight: bold;\">⚠️ QR Code not available - please contact support</p>";
            System.out.println("   ❌ QR code is null or empty!");
        }
        System.out.println("   qrCodeToUse length: " + qrCodeToUse.length());
        
        String bundlePriceDisplay = (bundlePrice != null && !bundlePrice.isEmpty()) ? bundlePrice : "N/A";
        
        String htmlContent = template
            .replace("{{DATE}}", java.time.LocalDate.now().toString())
            .replace("{{ORDER_ID}}", orderNumber)
            .replace("{{BUNDLE_NAME}}", "eSIM Bundle")
            .replace("{{BUNDLE_PRICE}}", bundlePriceDisplay)
            .replace("{{SM_DP_ADDRESS}}", smDpAddress != null && !smDpAddress.isEmpty() ? smDpAddress : "N/A")
            .replace("{{ACTIVATION_CODE}}", activationCode != null && !activationCode.isEmpty() ? activationCode : "N/A")
            .replace("{{QR_CODE_IMAGE}}", qrCodeToUse)
            .replace("{{WHATSAPP_NUMBER}}", "+47 123 456 789")
            .replace("{{SUPPORT_EMAIL}}", supportEmail)
            .replace("{{APN_SETTINGS}}", "internet");

        System.out.println("   After replacement, HTML contains {{QR_CODE_IMAGE}}: " + htmlContent.contains("{{QR_CODE_IMAGE}}"));
        System.out.println("   After replacement, HTML contains data:image/png: " + htmlContent.contains("data:image/png;base64,"));
        
        // Check if QR code is in the final HTML
        int qrIndex = htmlContent.indexOf("data:image/png;base64,");
        if (qrIndex > 0) {
            int afterBase64 = qrIndex + "data:image/png;base64,".length();
            int previewEnd = Math.min(afterBase64 + 50, htmlContent.length());
            System.out.println("   QR base64 in HTML starts with: " + htmlContent.substring(afterBase64, previewEnd));
        } else {
            System.out.println("   ⚠️ WARNING: QR code not found in final HTML!");
        }
        
        return htmlContent;
    }

    /**
     * Generate HTML for eSIM rejection email
     */
    private String generateEsimRejectionHtml(String customerName, String orderNumber, String reason) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>eSIM Order Update</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ eSIM Order Update</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi %s,</h2>
                    
                    <p style="margin-bottom: 20px;">
                        We regret to inform you that your eSIM order has not been approved at this time.
                    </p>
                    
                    <div style="background: #f9fafb; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1f2937;">📋 Order Details</h3>
                        <p style="margin: 5px 0;"><strong>Order Number:</strong> #%s</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Not Approved</span></p>
                    </div>
                    
                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #991b1b;">Reason for Rejection:</h3>
                        <p style="color: #7f1d1d; margin: 10px 0;">%s</p>
                    </div>
                    
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #1e40af;">💡 What You Can Do</h3>
                        <ul style="color: #1e3a8a; margin: 10px 0; padding-left: 20px;">
                            <li style="margin: 8px 0;">Review the rejection reason above</li>
                            <li style="margin: 8px 0;">Contact our support team for clarification</li>
                            <li style="margin: 8px 0;">Once the issue is resolved, you can place a new order</li>
                        </ul>
                    </div>
                    
                    <p style="margin: 20px 0;">
                        If you have any questions or need assistance, our support team is here to help.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s/support" style="background: linear-gradient(135deg, #3b82f6 0%%, #2563eb 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 2px 8px rgba(59,130,246,0.3);">Contact Support</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                        We apologize for any inconvenience.<br>
                        Questions? Email us at <a href="mailto:%s" style="color: #3b82f6; text-decoration: none;">%s</a>
                    </p>
                </div>
            </body>
            </html>
            """, 
            customerName, 
            orderNumber, 
            reason,
            appUrl,
            supportEmail, 
            supportEmail
        );
    }

    // Send ePIN delivery email
    public void sendEpinDeliveryEmail(String toEmail, String customerName, String orderNumber, 
                                      String pinCode, String productName, String validity) {
        try {
            log.info("=== Starting ePIN email delivery ===");
            log.info("Recipient: {}", toEmail);
            log.info("From Email: {}", fromEmail);
            log.info("Order Number: {}", orderNumber);
            log.info("Product: {}", productName);
            
            String htmlContent = generateEpinDeliveryHtml(
                customerName, 
                orderNumber, 
                pinCode, 
                productName, 
                validity
            );
            
            log.info("HTML content generated, length: {} characters", htmlContent.length());
            
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Your Lycamobile ePIN - Ready to Use!");
            helper.setText(htmlContent, true);
            
            log.info("Message configured, attempting to send...");
            javaMailSender.send(message);
            
            log.info("✅ ePIN delivery email sent successfully to: {}", toEmail);
            System.out.println("✅ ePIN delivery email sent successfully to: " + toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send ePIN delivery email to: {}", toEmail, e);
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("Root cause: {}", e.getCause().getMessage());
            }
            System.err.println("❌ Failed to send ePIN delivery email: " + e.getMessage());
            e.printStackTrace();
            
            // Rethrow to make the calling code aware of the failure
            throw new RuntimeException("Failed to send ePIN delivery email: " + e.getMessage(), e);
        }
    }

    private String generateEpinDeliveryHtml(String customerName, String orderNumber, 
                                            String pinCode, String productName, String validity) {
        String appUrl = "http://localhost:3000";
        String supportEmail = "support@topuppro.com";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); padding: 40px 20px; text-align: center; }
                    .header-icon { font-size: 60px; margin-bottom: 10px; }
                    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
                    .success-message { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 8px; }
                    .success-message p { color: #065f46; margin: 0; font-weight: 500; }
                    .pin-box { background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border: 2px dashed #10b981; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
                    .pin-label { color: #059669; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
                    .pin-code { font-size: 32px; font-weight: bold; color: #047857; font-family: 'Courier New', monospace; letter-spacing: 3px; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
                    .order-details { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 25px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .detail-row:last-child { border-bottom: none; }
                    .detail-label { color: #6b7280; font-weight: 500; }
                    .detail-value { color: #1f2937; font-weight: 600; }
                    .instructions { background: #eff6ff; border-radius: 12px; padding: 20px; margin: 25px 0; }
                    .instructions h3 { color: #1e40af; margin-top: 0; font-size: 18px; }
                    .instruction-step { color: #1e40af; margin: 12px 0; padding-left: 25px; position: relative; }
                    .instruction-step:before { content: "→"; position: absolute; left: 0; font-weight: bold; }
                    .warning-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
                    .warning-box p { color: #92400e; margin: 5px 0; font-size: 14px; }
                    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
                    .cta-button:hover { transform: translateY(-2px); }
                    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
                    .footer a { color: #059669; text-decoration: none; font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="header-icon">🎉</div>
                        <h1>Your ePIN is Ready!</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hi %s,</div>
                        
                        <div class="success-message">
                            <p>✅ Your payment was successful! Your Lycamobile ePIN has been delivered instantly.</p>
                        </div>
                        
                        <div class="pin-box">
                            <div class="pin-label">Your ePIN Code</div>
                            <div class="pin-code">%s</div>
                            <p style="color: #059669; margin: 10px 0; font-size: 14px;">
                                Keep this PIN safe and secure
                            </p>
                        </div>
                        
                        <div class="order-details">
                            <h3 style="margin-top: 0; color: #1f2937;">Order Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Order Number:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Product:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Validity:</span>
                                <span class="detail-value">%s</span>
                            </div>
                        </div>
                        
                        <div class="instructions">
                            <h3>📱 How to Use Your ePIN</h3>
                            <div class="instruction-step">Dial <strong>*131*</strong> + <strong>your PIN code</strong> + <strong>#</strong></div>
                            <div class="instruction-step">Press the call button</div>
                            <div class="instruction-step">Wait for confirmation SMS</div>
                            <div class="instruction-step">Your bundle is activated!</div>
                            <p style="color: #1e40af; margin-top: 15px; font-size: 14px;">
                                <strong>Example:</strong> *131*%s#
                            </p>
                        </div>
                        
                        <div class="warning-box">
                            <p><strong>⚠️ Important:</strong></p>
                            <p>• Use this PIN only once to activate your bundle</p>
                            <p>• Do not share your PIN with anyone</p>
                            <p>• Valid for %s from purchase date</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="cta-button">View My Orders</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Need help? Contact us at <a href="mailto:%s">%s</a></p>
                        <p style="margin-top: 10px;">Thank you for choosing TopUp Pro! 💚</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            customerName, 
            pinCode,
            orderNumber,
            productName,
            validity,
            pinCode,
            validity,
            appUrl,
            supportEmail,
            supportEmail
        );
    }

    /**
     * Send account suspension email
     */
    public void sendSuspensionEmail(String toEmail, String firstName, String reason) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Account Suspended - " + appName);
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
                        .reason { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                        .contact-btn { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Account Suspended</h1>
                        </div>
                        <div class="content">
                            <p>Hello %s,</p>
                            
                            <div class="alert-box">
                                <strong>Your account has been temporarily suspended.</strong>
                            </div>
                            
                            <div class="reason">
                                <strong>Reason:</strong><br>
                                %s
                            </div>
                            
                            <p>Your account access has been restricted. If you believe this is an error or would like to appeal this decision, please contact our support team.</p>
                            
                            <div style="text-align: center;">
                                <a href="mailto:%s" class="contact-btn">Contact Support</a>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated message from %s</p>
                                <p>Support: %s</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, 
                firstName,
                reason,
                supportEmail,
                appName,
                supportEmail
            );
            
            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            
            log.info("Suspension email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send suspension email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send suspension email", e);
        }
    }

    /**
     * Send account activation email
     */
    public void sendActivationEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Account Activated - " + appName);
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                        .login-btn { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Account Activated</h1>
                        </div>
                        <div class="content">
                            <p>Hello %s,</p>
                            
                            <div class="success-box">
                                <strong>Good news! Your account has been activated.</strong>
                            </div>
                            
                            <p>You now have full access to your account and can continue using our services.</p>
                            
                            <div style="text-align: center;">
                                <a href="%s/login" class="login-btn">Login to Your Account</a>
                            </div>
                            
                            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                            
                            <div class="footer">
                                <p>This is an automated message from %s</p>
                                <p>Support: %s</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """, 
                firstName,
                appUrl,
                appName,
                supportEmail
            );
            
            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            
            log.info("Activation email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send activation email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send activation email", e);
        }
    }

    /**
     * Send eSIM QR Code to customer
     */
    public void sendEsimQRCode(String toEmail, String customerName, String passportId,
                               String qrCodeBase64, String iccid, String activationCode,
                               String pin1, String puk1, String networkProvider, String price) {
        try {
            log.info("Sending eSIM QR code email to: {}", toEmail);
            
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your eSIM is Ready - Telelys");
            
            // Decode base64 QR code to bytes
            byte[] qrCodeBytes = java.util.Base64.getDecoder().decode(qrCodeBase64);
            
            // Create HTML email using Telelys template
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Your eSIM is Ready - Telelys</title>
                  <style>
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    body {
                      font-family: 'Arial', 'Helvetica', sans-serif;
                      line-height: 1.6;
                      color: #333;
                      background-color: #f5f5f5;
                    }
                    .container {
                      max-width: 600px;
                      margin: 20px auto;
                      background: white;
                      border-radius: 8px;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                      overflow: hidden;
                    }
                    .header {
                      background-color: #2563EB;
                      color: white;
                      padding: 30px;
                      text-align: center;
                    }
                    .logo-text {
                      font-size: 32px;
                      font-weight: bold;
                      margin-bottom: 10px;
                    }
                    .subheader {
                      font-size: 18px;
                      font-weight: 300;
                    }
                    .content {
                      padding: 30px;
                    }
                    h1 {
                      color: #1F2937;
                      font-size: 24px;
                      margin-bottom: 10px;
                      font-weight: bold;
                    }
                    .intro {
                      color: #666;
                      margin-bottom: 25px;
                      font-size: 16px;
                    }
                    h2 {
                      color: #1F2937;
                      font-size: 18px;
                      margin-top: 25px;
                      margin-bottom: 15px;
                      font-weight: bold;
                      border-bottom: 2px solid #2563EB;
                      padding-bottom: 10px;
                    }
                    .info-box {
                      background-color: #f9fafb;
                      border-left: 4px solid #2563EB;
                      padding: 15px;
                      margin-bottom: 20px;
                      border-radius: 4px;
                    }
                    .info-item {
                      display: flex;
                      justify-content: space-between;
                      padding: 8px 0;
                      border-bottom: 1px solid #e5e7eb;
                    }
                    .info-item:last-child {
                      border-bottom: none;
                    }
                    .info-label {
                      color: #6B7280;
                      font-weight: 500;
                    }
                    .info-value {
                      color: #1F2937;
                      font-weight: bold;
                      font-family: monospace;
                    }
                    .qr-section {
                      text-align: center;
                      margin: 25px 0;
                    }
                    .qr-label {
                      font-weight: bold;
                      color: #1F2937;
                      margin-bottom: 15px;
                      display: block;
                    }
                    .qr-image {
                      max-width: 300px;
                      border: 1px solid #e5e7eb;
                      padding: 10px;
                      border-radius: 4px;
                    }
                    .important-list {
                      list-style: none;
                      margin: 15px 0;
                    }
                    .important-list li {
                      padding: 10px 0;
                      padding-left: 25px;
                      position: relative;
                      color: #555;
                    }
                    .important-list li:before {
                      content: "•";
                      color: #2563EB;
                      font-weight: bold;
                      position: absolute;
                      left: 0;
                    }
                    .steps {
                      margin: 20px 0;
                    }
                    .step {
                      margin-bottom: 20px;
                      padding-left: 30px;
                      position: relative;
                    }
                    .step-number {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 24px;
                      height: 24px;
                      background: #2563EB;
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 14px;
                      font-weight: bold;
                    }
                    .step-title {
                      font-weight: bold;
                      color: #1F2937;
                      margin-bottom: 5px;
                    }
                    .step-desc {
                      color: #666;
                      font-size: 14px;
                      line-height: 1.5;
                    }
                    .activation-info {
                      background-color: #f9fafb;
                      border: 1px solid #e5e7eb;
                      padding: 15px;
                      margin: 15px 0;
                      border-radius: 4px;
                      font-size: 14px;
                    }
                    .activation-info p {
                      margin: 8px 0;
                    }
                    .activation-label {
                      font-weight: bold;
                      color: #1F2937;
                    }
                    .activation-value {
                      color: #666;
                      word-break: break-all;
                      font-family: monospace;
                      background: white;
                      padding: 5px;
                      border-radius: 3px;
                      display: inline-block;
                      margin-top: 3px;
                    }
                    .warning {
                      color: #D32F2F;
                      font-weight: bold;
                      margin: 10px 0;
                    }
                    .support-box {
                      background-color: #FEF3C7;
                      border-left: 4px solid #F59E0B;
                      padding: 15px;
                      margin: 20px 0;
                      border-radius: 4px;
                    }
                    .support-title {
                      font-weight: bold;
                      color: #92400E;
                      margin-bottom: 10px;
                    }
                    .support-item {
                      color: #78350F;
                      margin: 5px 0;
                    }
                    .email-footer {
                      background-color: #1F2937;
                      color: #9CA3AF;
                      padding: 20px;
                      text-align: center;
                      font-size: 13px;
                    }
                    .footer-text {
                      margin: 10px 0;
                    }
                    a {
                      color: #2563EB;
                      text-decoration: none;
                    }
                    a:hover {
                      text-decoration: underline;
                    }
                    @media only screen and (max-width: 600px) {
                      .container {
                        margin: 10px;
                      }
                      .content {
                        padding: 20px;
                      }
                      .qr-image {
                        max-width: 200px;
                      }
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <div class="logo-text">Telelys</div>
                      <div class="subheader">Your eSIM is Ready!</div>
                    </div>

                    <div class="content">
                      <h1>Thank you for choosing Telelys</h1>
                      <p class="intro">You can find details of your eSIM and setup instructions below.</p>

                      <h2>Your eSIM Information</h2>
                      <div class="info-box">
                        <div class="info-item">
                          <span class="info-label">Date:</span>
                          <span class="info-value">%s</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Order ID:</span>
                          <span class="info-value">%s</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">ICCID:</span>
                          <span class="info-value">%s</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Provider:</span>
                          <span class="info-value">%s</span>
                        </div>
                      </div>

                      <h2>Important Notes Before Setting Up</h2>
                      <ul class="important-list">
                        <li>eSIM can only be installed when there is an internet connection.</li>
                        <li>Please do not delete eSIM after activation. The eSIM QR code can only be activated once.</li>
                        <li>eSIM cannot be transferred to another device after installation.</li>
                      </ul>

                      <h2>eSIM Setup Guide - For iOS</h2>
                      <div class="steps">
                        <div class="step">
                          <div class="step-number">1</div>
                          <div class="step-title">Go to Settings > Cellular (or Mobile Data)</div>
                        </div>
                        <div class="step">
                          <div class="step-number">2</div>
                          <div class="step-title">Click Add eSIM or Add Cellular Plan > Choose Use QR Code</div>
                          <div class="step-desc">Scan the below QR or tap Enter Details Manually and enter the activation code.</div>
                        </div>
                        <div class="step">
                          <div class="step-number">3</div>
                          <div class="step-title">Activation Information</div>
                          <div class="activation-info">
                            <p><span class="activation-label">Activation Code:</span><br><span class="activation-value">%s</span></p>
                          </div>
                          <div class="warning">Don't delete eSIM after setting up</div>
                        </div>
                        <div class="step">
                          <div class="step-number">4</div>
                          <div class="step-title">Click Next to finish the installation</div>
                        </div>
                        <div class="step">
                          <div class="step-number">5</div>
                          <div class="step-title">SIM Registration Required</div>
                          <div class="step-desc">Please <a href="https://www.lyca-mobile.no/en/registration/">click here to register your SIM</a></div>
                        </div>
                      </div>

                      <div class="qr-section">
                        <span class="qr-label">Scan this QR Code</span>
                        <img src="cid:qrCodeImage" alt="eSIM QR Code" class="qr-image" />
                      </div>

                      <h2>eSIM Setup Guide - For Android</h2>
                      <div class="steps">
                        <div class="step">
                          <div class="step-number">1</div>
                          <div class="step-title">Go to Settings > Connections</div>
                        </div>
                        <div class="step">
                          <div class="step-number">2</div>
                          <div class="step-title">Choose Add eSIM > Choose Use QR Code</div>
                          <div class="step-desc">Scan the below QR or tap Enter Details Manually and enter the activation code.</div>
                        </div>
                        <div class="step">
                          <div class="step-number">3</div>
                          <div class="step-title">Activation Information</div>
                          <div class="activation-info">
                            <p><span class="activation-label">Activation Code:</span><br><span class="activation-value">%s</span></p>
                          </div>
                          <div class="warning">Don't delete eSIM after setting up</div>
                        </div>
                        <div class="step">
                          <div class="step-number">4</div>
                          <div class="step-title">Click Next to finish the installation</div>
                        </div>
                        <div class="step">
                          <div class="step-number">5</div>
                          <div class="step-title">SIM Registration Required</div>
                          <div class="step-desc">Please <a href="https://www.lyca-mobile.no/en/registration/">click here to register your SIM</a></div>
                        </div>
                      </div>

                      <div class="support-box">
                        <div class="support-title">Need Help?</div>
                        <div class="support-item"><strong>WhatsApp:</strong> +47 (WhatsApp)</div>
                        <div class="support-item"><strong>Email:</strong> %s</div>
                        <p style="margin-top: 10px; color: #78350F; font-size: 14px;">If you encounter any problems, please contact Telelys for timely support.</p>
                      </div>
                    </div>

                    <div class="email-footer">
                      <div class="footer-text">&copy; 2026 Telelys. All rights reserved.</div>
                      <div class="footer-text">
                        <a href="https://www.lyca-mobile.no/" style="color: #9CA3AF;">Visit our website</a> | 
                        <a href="https://www.lyca-mobile.no/en/registration/" style="color: #9CA3AF;">Register SIM</a>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
                """,
                java.time.LocalDate.now().toString(),
                passportId,
                iccid,
                networkProvider,
                activationCode != null && !activationCode.isEmpty() ? activationCode : "N/A",
                activationCode != null && !activationCode.isEmpty() ? activationCode : "N/A",
                supportEmail
            );
            
            helper.setText(htmlContent, true);
            
            // Add QR code as inline attachment with Content-ID
            helper.addInline("qrCodeImage", new jakarta.mail.util.ByteArrayDataSource(qrCodeBytes, "image/png"));
            
            javaMailSender.send(message);
            
            log.info("✅ eSIM QR code email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("❌ Failed to send eSIM QR code email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send eSIM QR code email", e);
        }
    }
}
