# Test email sending functionality
# Usage: .\test-email.ps1 -email "your@email.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$email,
    
    [Parameter(Mandatory=$false)]
    [string]$baseUrl = "http://localhost:8080/api"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Email Configuration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing email send to: $email" -ForegroundColor Yellow
Write-Host ""

try {
    $url = "$baseUrl/test/send-email"
    $body = @{
        email = $email
    } | ConvertTo-Json
    
    Write-Host "Calling: $url" -ForegroundColor Gray
    Write-Host "Request body: $body" -ForegroundColor Gray
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Message: $($response.message)" -ForegroundColor Green
        Write-Host "Sent to: $($response.sentTo)" -ForegroundColor White
        Write-Host ""
        Write-Host "Please check your email inbox (and spam folder) for the test ePIN email." -ForegroundColor Yellow
    } else {
        Write-Host "❌ FAILED!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Backend not running on port 8080" -ForegroundColor White
    Write-Host "  2. Gmail App Password not configured correctly" -ForegroundColor White
    Write-Host "  3. SMTP settings incorrect in application.properties" -ForegroundColor White
    Write-Host "  4. Gmail security blocking the app" -ForegroundColor White
    Write-Host ""
    Write-Host "To fix Gmail issues:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://myaccount.google.com/apppasswords" -ForegroundColor White
    Write-Host "  2. Create a new App Password" -ForegroundColor White
    Write-Host "  3. Update MAIL_PASSWORD in application.properties" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
