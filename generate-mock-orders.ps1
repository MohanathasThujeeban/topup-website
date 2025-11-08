# PowerShell script to generate mock retailer orders
# Usage: .\generate-mock-orders.ps1 -retailerId "YOUR_RETAILER_ID" -count 15

param(
    [Parameter(Mandatory=$false)]
    [string]$retailerId = "test-retailer-123",
    
    [Parameter(Mandatory=$false)]
    [int]$count = 15,
    
    [Parameter(Mandatory=$false)]
    [string]$baseUrl = "http://localhost:8080/api"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Mock Retailer Orders Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generate mock orders
Write-Host "Generating $count mock orders for retailer: $retailerId" -ForegroundColor Yellow
Write-Host ""

try {
    $url = "$baseUrl/retailer/order-management/mock/generate?retailerId=$retailerId&count=$count"
    Write-Host "Calling: $url" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "Success! Generated $($response.count) mock orders" -ForegroundColor Green
        Write-Host ""
        Write-Host "Order Summary:" -ForegroundColor Cyan
        Write-Host "  Total Orders: $($response.count)" -ForegroundColor White
        Write-Host "  Retailer ID: $retailerId" -ForegroundColor White
        Write-Host ""
        
        # Display first 5 orders
        $ordersToShow = [Math]::Min(5, $response.data.Count)
        Write-Host "First $ordersToShow orders:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $ordersToShow; $i++) {
            $order = $response.data[$i]
            Write-Host "  [$($i+1)] Order: $($order.orderNumber)" -ForegroundColor White
            Write-Host "      Status: $($order.status)" -ForegroundColor Yellow
            Write-Host "      Amount: $($order.totalAmount) $($order.currency)" -ForegroundColor Green
            Write-Host "      Items: $($order.items.Count)" -ForegroundColor White
            Write-Host ""
        }
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "To view orders, navigate to:" -ForegroundColor Yellow
        Write-Host "http://localhost:3000/retailer/dashboard" -ForegroundColor White
        Write-Host "or" -ForegroundColor Yellow
        Write-Host "http://localhost:5173/retailer/dashboard" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Cyan
        
    } else {
        Write-Host "Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Backend is running on port 8080" -ForegroundColor White
    Write-Host "  2. MongoDB is connected" -ForegroundColor White
    Write-Host "  3. The retailer ID exists in the database" -ForegroundColor White
}

Write-Host ""
