# PowerShell script to clear mock retailer orders
# Usage: .\clear-mock-orders.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$baseUrl = "http://localhost:8080/api"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Clear Mock Retailer Orders" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Clearing all mock orders..." -ForegroundColor Yellow
Write-Host ""

try {
    $url = "$baseUrl/retailer/order-management/mock/clear"
    Write-Host "Calling: $url" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $url -Method Delete -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✓ Success! $($response.message)" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Backend is running on port 8080" -ForegroundColor White
    Write-Host "  2. MongoDB is connected" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
