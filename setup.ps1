# EasyTopup.no - Quick Start Guide

Write-Host "🚀 EasyTopup.no - Setting up your project..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  🎉 Setup Complete!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To start the development server, run:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "To build for production, run:" -ForegroundColor Yellow
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Check README.md for more information" -ForegroundColor Cyan
    Write-Host ""
    
    # Ask if user wants to start dev server
    $response = Read-Host "Would you like to start the development server now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "Starting development server..." -ForegroundColor Cyan
        npm run dev
    }
} else {
    Write-Host ""
    Write-Host "✗ Installation failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
