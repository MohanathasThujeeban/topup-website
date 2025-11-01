# eSIM QR Code Feature Implementation

## Overview
This feature adds QR code generation and sharing capabilities for eSIM items in the Admin Dashboard, making it easy to distribute eSIM activation details to customers.

## Features Implemented

### 1. QR Code Generation
- Every eSIM PIN now has an associated QR code
- QR codes contain activation URLs with eSIM code and serial number
- High-quality QR codes with error correction level H

### 2. QR Code Display
- New "QR Code" column in the eSIM Management table
- Click-to-view QR code button for each eSIM
- Beautiful modal popup showing:
  - Large, scannable QR code (256x256px)
  - eSIM details (code, serial number, pool, price, notes)
  - Activation URL with copy functionality

### 3. Sharing Options
The QR code modal includes multiple sharing methods:

#### a) Download QR Code
- Downloads QR code as PNG image (512x512px)
- Filename: `esim-{code}-qrcode.png`
- High resolution, ready to send to customers

#### b) Copy URL
- Copies activation URL to clipboard
- Customers can click the link directly

#### c) Share (Native)
- Uses Web Share API (mobile-friendly)
- Fallback to clipboard copy on desktop
- Shares complete eSIM details with URL

#### d) Send Email
- Opens default email client
- Pre-filled with:
  - Subject: "Your eSIM Activation Details"
  - Body: Complete eSIM information and activation URL
  - Professional formatting

## How to Use

### For Admin Users:

1. **Navigate to eSIM Management Tab**
   - Click "eSIM Management" in the admin dashboard sidebar

2. **View QR Code**
   - Click the green QR code icon in any eSIM row
   - Or click "Click to view" in the QR Code column

3. **Download QR Code**
   - In the modal, click "Download QR" button
   - Image will be saved to your downloads folder

4. **Copy Activation URL**
   - Click "Copy URL" button
   - Paste and send to customer via any messaging app

5. **Share via Native Share**
   - Click "Share" button
   - Select app to share (WhatsApp, SMS, etc.)

6. **Send via Email**
   - Click "Send Email" button
   - Your email client opens with pre-filled message
   - Add recipient email and send

## Technical Details

### Dependencies Added
```json
{
  "qrcode.react": "^3.1.0"
}
```

### New Functions
- `generateEsimQrData(esim)` - Generates activation URL
- `handleViewQrCode(esim)` - Opens QR modal
- `handleDownloadQrCode()` - Downloads QR as PNG
- `handleCopyQrUrl()` - Copies URL to clipboard
- `handleShareEsim()` - Native share or clipboard fallback
- `handleSendEsimEmail()` - Opens email client

### Activation URL Format
```
https://easytopup.no/esim/activate?code={ESIM_CODE}&serial={SERIAL_NUMBER}
```

### State Management
- `selectedEsim` - Currently selected eSIM for QR viewing
- `showQrModal` - Controls QR modal visibility
- `qrCodeRef` - Reference to QR code DOM element for download

## Customer Experience

When a customer receives the eSIM:

1. **Option 1: Scan QR Code**
   - Open device camera
   - Scan the QR code image
   - Automatically redirected to activation page

2. **Option 2: Click URL**
   - Click the activation link
   - Opens in browser
   - Follow activation instructions

3. **Option 3: Manual Entry**
   - eSIM code and serial number provided
   - Can be entered manually if needed

## Security Considerations

- QR codes contain only activation URLs, not sensitive data
- URLs are public but require the eSIM to be unused
- Status tracking prevents duplicate activations
- All data transmission follows existing security protocols

## Future Enhancements

Possible improvements:
- Bulk QR code generation for multiple eSIMs
- Custom QR code branding/logos
- SMS integration for direct sending
- WhatsApp Business API integration
- QR code expiration dates
- Print-ready PDF generation with QR codes

## Screenshots

### eSIM Management Table
- New QR Code column with green icon buttons
- "Click to view" helper text

### QR Code Modal
- Large header with gradient background
- eSIM information card
- Centered QR code with border
- Activation URL with copy button
- 5 action buttons (Download, Copy, Share, Email, Close)

## Support

For issues or questions about this feature:
1. Check that `qrcode.react` is installed
2. Verify browser supports Canvas API for downloads
3. Test Web Share API availability (mobile browsers)
4. Ensure activation page exists at `/esim/activate`

---

**Status:** ✅ Implemented and Ready
**Version:** 1.0.0
**Date:** November 1, 2025
