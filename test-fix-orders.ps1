# PowerShell script to fix existing retailer orders

Write-Host "🔧 Fixing Retailer Orders and Credit Limits..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/fix-retailer-orders" `
        -Method Post `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Total Orders: $($response.totalOrders)" -ForegroundColor White
    Write-Host "Orders Fixed: $($response.ordersFixed)" -ForegroundColor Yellow
    Write-Host "Orders Skipped: $($response.ordersSkipped)" -ForegroundColor Gray
    Write-Host "Credit Limits Updated: $($response.creditLimitsUpdated)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the backend is running on http://localhost:8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
