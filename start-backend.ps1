Write-Host "=== TopUp Backend Startup Script ===" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (Test-Path ".\.env") {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content ".\.env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Set $name" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

Write-Host "Starting Spring Boot application..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\ASUS\Desktop\topup\topup backend"

# Check if we should use production profile (MongoDB Atlas)
if ($env:MONGODB_URI) {
    Write-Host "Using MongoDB Atlas (production profile)..." -ForegroundColor Yellow
    mvn spring-boot:run -Dspring.profiles.active=prod
} else {
    Write-Host "Using local MongoDB (development profile)..." -ForegroundColor Yellow
    mvn spring-boot:run -Dspring.profiles.active=dev,local
}