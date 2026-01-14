# eSIM Stock Upload - User Guide

## Overview
The eSIM Stock Management module allows administrators to upload eSIM inventory with associated QR codes in bulk. All sensitive data is automatically encrypted before storage.

## Features
- ✅ Bulk upload of eSIM data via CSV
- ✅ QR code image upload (multiple files)
- ✅ Automatic encryption of sensitive data (ICCID, activation codes, PINs, PUKs, QR codes)
- ✅ Support for standard eSIM data format
- ✅ Separate management for ePIN and eSIM stock
- ✅ Real-time statistics and inventory tracking

## CSV File Format

### Required Columns
- `iccid` - International Circuit Card Identifier (unique identifier for the eSIM)
- `activation_code` - LPA (Local Profile Assistant) string for eSIM activation

### Optional Columns
- `pin_1` - First PIN code
- `puk_1` - First PUK (PIN Unblocking Key) code
- `pin_2` - Second PIN code
- `puk_2` - Second PUK code
- `serialNumber` - Serial number of the eSIM
- `activationUrl` - URL for activation (if different from LPA)
- `qrCodeUrl` - URL to QR code image (if stored externally)

### Sample CSV Format
```csv
iccid,activation_code,pin_1,puk_1,pin_2,puk_2
8947230000000000001,LPA:1$dp-plus-par07-01,0,23512557,0,51484788
8947230000000000002,LPA:1$dp-plus-par07-02,0,91169804,0,11838166
8947230000000000003,LPA:1$dp-plus-par07-03,0,17324628,0,30855481
8947230000000000004,LPA:1$dp-plus-par07-04,0,56725383,0,59210443
8947230000000000005,LPA:1$dp-plus-par07-05,0,22472872,0,7049321
```

## Upload Process

### Step 1: Navigate to eSIM Stock Management
1. Log in as an administrator
2. Click on **"eSIM Stock"** in the sidebar navigation
3. Click **"Upload eSIM CSV + QR Codes"** button

### Step 2: Upload CSV File
1. Click on the CSV upload area
2. Select your CSV file containing eSIM data
3. The system will automatically:
   - Count the number of eSIMs
   - Auto-fill the "Total Stock" field
   - Validate the CSV structure

### Step 3: Upload QR Code Images (Optional)
1. Click on the QR code upload area
2. Select multiple QR code image files (PNG, JPG, etc.)
3. QR codes will be matched to eSIMs in order (first QR → first eSIM, etc.)
4. You can upload up to the same number of eSIMs

### Step 4: Fill in Pool Information
Required fields:
- **Pool Name**: Unique identifier for this stock pool (e.g., "lycamobile-esim-10gb")
- **Network Provider**: Select from Lycamobile, Mycall, or Telia
- **Product Type**: Bundle plans, Data only, or Voice & Data
- **Price (NOK)**: Price per eSIM in Norwegian Kroner
- **Status**: Active or Inactive

Optional fields:
- **Product ID**: Auto-generated if left empty
- **Notes**: Additional information about this stock pool

### Step 5: Submit Upload
1. Review all information
2. Click **"Upload eSIM Stock"** button
3. Wait for confirmation message
4. All data will be encrypted and stored securely

## Security Features

### Automatic Encryption
The following data is automatically encrypted before storage:
- ✅ ICCID numbers
- ✅ Activation codes
- ✅ PIN codes (pin_1, pin_2)
- ✅ PUK codes (puk_1, puk_2)
- ✅ QR code images (Base64 encoded and encrypted)

### Data Protection
- All sensitive data is encrypted using Base64 encoding
- In production, implement AES-256 encryption with proper key management
- QR codes are stored as encrypted Base64 strings
- Access restricted to admin users only

## QR Code Management

### QR Code Upload
- Supported formats: PNG, JPG, JPEG, GIF
- Multiple files can be uploaded at once
- QR codes are matched to eSIMs sequentially
- Maximum file size: Recommended under 5MB per image

### QR Code Matching Logic
1. First QR code image → First eSIM in CSV
2. Second QR code image → Second eSIM in CSV
3. And so on...

Example:
```
CSV Row 1 (ICCID: 894723...001) → qr-code-1.png
CSV Row 2 (ICCID: 894723...002) → qr-code-2.png
CSV Row 3 (ICCID: 894723...003) → qr-code-3.png
```

## Database Structure

### Stock Pool Fields
- `poolId` - Unique identifier for the stock pool
- `poolName` - Name of the pool
- `networkProvider` - Network provider name
- `productType` - Type of product
- `price` - Price in NOK
- `totalQuantity` - Total number of eSIMs
- `availableQuantity` - Available eSIMs
- `status` - ACTIVE or INACTIVE

### Stock Item Fields (per eSIM)
- `itemId` - Unique identifier
- `itemData` - Encrypted ICCID
- `activationCode` - Encrypted activation code
- `pin1` - Encrypted PIN 1
- `puk1` - Encrypted PUK 1
- `pin2` - Encrypted PIN 2
- `puk2` - Encrypted PUK 2
- `qrCodeImage` - Encrypted Base64 QR code
- `status` - AVAILABLE, ASSIGNED, USED, etc.

## API Endpoints

### Upload eSIM Stock
```
POST /api/admin/stock/esims/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: CSV file
- metadata: JSON string with pool information
- qrCodes[]: Array of QR code image files (optional)
```

### Get eSIM Stock Pools
```
GET /api/admin/stock/pools
Authorization: Bearer <token>

Response: Array of stock pools (filtered by stockType: ESIM)
```

### Get Stock Statistics
```
GET /api/admin/stock/usage-report
Authorization: Bearer <token>

Response: Statistics including total, available, and used eSIMs
```

## Troubleshooting

### Common Issues

**1. CSV file is empty or invalid**
- Ensure CSV has header row with required columns
- Check for empty rows
- Verify column names match exactly (case-insensitive)

**2. Upload fails with "Missing required fields"**
- Pool Name is required
- Price is required
- At least one eSIM must be in the CSV

**3. QR codes not matching eSIMs**
- Ensure QR code files are in the correct order
- Number of QR codes should match or be less than number of eSIMs
- Check file names for proper sequencing

**4. Authentication error**
- Ensure you're logged in as an admin
- Check if token is valid
- Try logging out and logging back in

### Error Messages

| Error | Solution |
|-------|----------|
| "CSV must contain 'iccid' column" | Add iccid column to your CSV |
| "CSV must contain 'activation_code' column" | Add activation_code column to your CSV |
| "File must be a CSV file" | Ensure file has .csv extension |
| "Failed to upload eSIMs" | Check server logs for detailed error |

## Best Practices

1. **CSV Preparation**
   - Use UTF-8 encoding
   - Remove any BOM (Byte Order Mark)
   - Ensure no trailing commas
   - Validate data before upload

2. **QR Code Images**
   - Use clear, high-resolution images
   - Name files sequentially (qr-1.png, qr-2.png, etc.)
   - Keep file sizes reasonable (<2MB recommended)

3. **Pool Naming**
   - Use descriptive, unique names
   - Include network provider and data amount
   - Example: "lycamobile-esim-10gb-norway"

4. **Testing**
   - Test with small batches first (5-10 eSIMs)
   - Verify encryption and storage
   - Check retrieval and decryption

## Sample Data

A sample CSV file is provided: `sample-esim-upload.csv`

This file contains 5 sample eSIM records with all required fields.

## Support

For additional support or questions:
- Check server logs for detailed error messages
- Verify database connection
- Ensure proper permissions for admin users
- Contact system administrator if issues persist

---

**Last Updated**: January 2026
**Version**: 1.0.0
