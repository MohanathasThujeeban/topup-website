# Simple PIN Encryption Script
# Converts CSV PINs from scientific notation to Base64 encrypted format

param([string]$CsvFile = "servicepin.csv")

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PIN Encryption Script" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Check if file exists
if (-not (Test-Path $CsvFile)) {
    Write-Host "Error: CSV file not found: $CsvFile" -ForegroundColor Red
    exit 1
}

# Function to convert scientific notation
function Convert-ScientificToNumber {
    param([string]$value)
    if ($value -match '^[\d.]+E\+\d+$') {
        $number = [decimal]$value
        return $number.ToString("0")
    }
    return $value
}

# Function to encrypt PIN
function Encrypt-Pin {
    param([string]$pin)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($pin)
    $base64 = [Convert]::ToBase64String($bytes)
    return "ENCRYPTED:$base64"
}

# Read and process CSV
Write-Host "Reading CSV file: $CsvFile`n" -ForegroundColor Green

$lines = Get-Content $CsvFile
$pins = @()

for ($i = 1; $i -lt $lines.Length; $i++) {
    $line = $lines[$i].Trim()
    if ($line) {
        $fields = $line -split ","
        if ($fields.Length -ge 1) {
            $pinNumber = Convert-ScientificToNumber -value $fields[0].Trim()
            $encrypted = Encrypt-Pin -pin $pinNumber
            
            $pins += @{
                Original = $pinNumber
                Encrypted = $encrypted
            }
        }
    }
}

Write-Host "Found $($pins.Count) PINs`n" -ForegroundColor Green

# Show samples
Write-Host "Sample PINs:" -ForegroundColor Yellow
for ($i = 0; $i -lt [Math]::Min(3, $pins.Count); $i++) {
    Write-Host "  $($i+1). Original: $($pins[$i].Original)"
    Write-Host "     Encrypted: $($pins[$i].Encrypted)`n"
}

# Generate encrypted string
$encryptedString = ($pins | ForEach-Object { $_.Encrypted }) -join ","

# Save to file
$outputFile = "encrypted-pins.txt"
$encryptedString | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline

Write-Host "`nOutput saved to: $outputFile" -ForegroundColor Green
Write-Host "`nEncrypted PINs (copy this):" -ForegroundColor Cyan
Write-Host $encryptedString -ForegroundColor White

Write-Host "`n`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Copy the encrypted PINs above"
Write-Host "2. Open MongoDB Compass"
Write-Host "3. Find your MOBITAL order"
Write-Host "4. Update metadata.allocatedItems field with the encrypted PINs"
