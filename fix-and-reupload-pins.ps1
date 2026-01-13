# Script to fix PIN format in CSV and re-upload to MongoDB
# This will convert scientific notation to full PIN numbers and encrypt them properly

param(
    [string]$CsvFile = "servicepin.csv",
    [string]$MongoConnectionString = "mongodb+srv://thujee_db:yourpassword@topupdb.puesjra.mongodb.net/topupdb?retryWrites=true&w=majority",
    [string]$OrderId = ""  # Optional: specific order ID to update
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PIN Re-upload Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to convert scientific notation to full number
function Convert-ScientificToNumber {
    param([string]$value)
    
    if ($value -match '^[\d.]+E\+\d+$') {
        # Convert scientific notation to full number
        $number = [decimal]$value
        return $number.ToString("0")
    }
    return $value
}

# Function to encrypt PIN (Base64 encoding)
function Encrypt-Pin {
    param([string]$pin)
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($pin)
    $base64 = [Convert]::ToBase64String($bytes)
    return "ENCRYPTED:$base64"
}

# Check if CSV file exists
if (-not (Test-Path $CsvFile)) {
    Write-Host "❌ Error: CSV file '$CsvFile' not found!" -ForegroundColor Red
    Write-Host "Available CSV files:" -ForegroundColor Yellow
    Get-ChildItem -Filter "*.csv" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
    exit 1
}

Write-Host "📁 Reading CSV file: $CsvFile" -ForegroundColor Green
Write-Host ""

# Read CSV file with proper formatting to prevent Excel scientific notation issues
$csvContent = Get-Content $CsvFile -Raw
$csvLines = $csvContent -split "`n"
$headers = $csvLines[0] -split ","

Write-Host "CSV Headers: $headers" -ForegroundColor Cyan
Write-Host ""

# Parse CSV manually to preserve full numbers
$pins = @()
for ($i = 1; $i -lt $csvLines.Length; $i++) {
    $line = $csvLines[$i].Trim()
    if ($line) {
        $fields = $line -split ","
        
        if ($fields.Length -ge 2) {
            $pinNumber = Convert-ScientificToNumber -value $fields[0].Trim()
            $serialNumber = $fields[1].Trim()
            $productId = if ($fields.Length -gt 2) { $fields[2].Trim() } else { "" }
            $notes = if ($fields.Length -gt 3) { $fields[3].Trim() } else { "" }
            $price = if ($fields.Length -gt 4) { $fields[4].Trim() } else { "99" }
            
            $pins += @{
                PinNumber = $pinNumber
                SerialNumber = $serialNumber
                ProductId = $productId
                Notes = $notes
                Price = $price
                EncryptedPin = Encrypt-Pin -pin $pinNumber
            }
        }
    }
}

Write-Host "✅ Found $($pins.Count) PINs in CSV" -ForegroundColor Green
Write-Host ""

# Display sample PINs
Write-Host "Sample PINs (first 3):" -ForegroundColor Yellow
for ($i = 0; $i -lt [Math]::Min(3, $pins.Count); $i++) {
    Write-Host "  PIN $($i+1):" -ForegroundColor Gray
    Write-Host "    Original: $($pins[$i].PinNumber)" -ForegroundColor Gray
    Write-Host "    Encrypted: $($pins[$i].EncryptedPin)" -ForegroundColor Gray
    Write-Host "    Serial: $($pins[$i].SerialNumber)" -ForegroundColor Gray
    Write-Host ""
}

# Ask for confirmation
Write-Host "Do you want to generate a MongoDB update script? (Y/N): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Cancelled by user" -ForegroundColor Red
    exit 0
}

# Generate MongoDB update script
$mongoScriptContent = "// MongoDB Script to Update PINs with Proper Encryption`n"
$mongoScriptContent += "// Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$mongoScriptContent += "// Source: $CsvFile`n`n"
$mongoScriptContent += "use topupdb;`n`n"
$mongoScriptContent += "// Sample PINs from CSV (encrypted):`n"

for ($i = 0; $i -lt [Math]::Min(5, $pins.Count); $i++) {
    $mongoScriptContent += "// PIN $($i+1): $($pins[$i].PinNumber) -> $($pins[$i].EncryptedPin)`n"
}

$mongoScriptContent += "`n// Encrypted PINs comma-separated:`n"
$mongoScriptContent += "// "
$mongoScriptContent += ($pins | ForEach-Object { $_.EncryptedPin }) -join ","
$mongoScriptContent += "`n"

$scriptPath = "mongodb-update-pins.txt"
$mongoScriptContent | Out-File -FilePath $scriptPath -Encoding UTF8

Write-Host ""
Write-Host "✅ MongoDB script generated: $scriptPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open MongoDB Compass or mongosh" -ForegroundColor White
Write-Host "2. Connect to your database" -ForegroundColor White
Write-Host "3. Copy encrypted PINs from the file to update orders" -ForegroundColor White
Write-Host "4. Or manually use the encrypted PINs below" -ForegroundColor White
Write-Host ""
Write-Host "Encrypted PINs for manual update:" -ForegroundColor Cyan
$allEncrypted = ($pins | ForEach-Object { $_.EncryptedPin }) -join ","
Write-Host $allEncrypted -ForegroundColor Gray
Write-Host ""
Write-Host "Copy this and update your MongoDB order metadata.allocatedItems field" -ForegroundColor Yellow
