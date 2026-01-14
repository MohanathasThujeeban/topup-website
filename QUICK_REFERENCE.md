# eSIM Upload Quick Reference

## 📋 CSV Format
```csv
iccid,activation_code,pin_1,puk_1,pin_2,puk_2
8947230000000000001,LPA:1$dp-plus-par07-01,0,23512557,0,51484788
```

## 🚀 Quick Start
1. Go to Admin Dashboard → **eSIM Stock** tab
2. Click **"Upload eSIM CSV + QR Codes"**
3. Select CSV file (auto-detects count)
4. Select QR code images (optional, multiple)
5. Fill form:
   - Pool Name (required)
   - Network Provider (required)
   - Product Type (required)
   - Price in NOK (required)
6. Click **"Upload eSIM Stock"**

## 🔐 Encrypted Data
- ✅ ICCID
- ✅ Activation Code
- ✅ PIN 1 & 2
- ✅ PUK 1 & 2
- ✅ QR Code Images

## 📁 Files Created
- `EsimStockManagement.jsx` - Frontend component
- `sample-esim-upload.csv` - Sample data
- `ESIM_UPLOAD_GUIDE.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## 🛠️ Modified Files
- `StockItemDTO.java` - Added eSIM fields
- `StockPool.java` - Added eSIM item fields
- `StockService.java` - New parser & upload methods
- `StockController.java` - Multi-file upload endpoint
- `AdminDashboard.jsx` - New tab integration

## ✨ Features
- Bulk upload via CSV
- Multiple QR code upload
- Auto encryption
- Sequential QR matching
- Real-time statistics
- Separate from ePIN stock
- Template download

## 📊 API Endpoint
```
POST /api/admin/stock/esims/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: CSV file
- metadata: JSON string
- qrCodes[]: Image files
```

## 🎯 Testing Ready
Sample CSV included at: `sample-esim-upload.csv`
Upload 5 eSIMs with 5 QR codes to test!
