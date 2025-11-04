# How to Add eSIM Products to Display on Website

## Problem
The website is showing hardcoded/mock data because there are no **Product** documents in the MongoDB `products` collection with `status=ACTIVE` and `isVisible=true`.

## Solution
You need to insert Product documents into MongoDB that link to your StockPool data.

## Steps to Add Products

### Option 1: Using MongoDB Atlas Web Interface

1. **Open MongoDB Atlas** (https://cloud.mongodb.com)
2. **Navigate to your cluster** → Click "Browse Collections"
3. **Select the `products` collection**
4. **Click "Insert Document"**
5. **Switch to JSON view** (toggle button at top)
6. **Copy and paste** one of the product documents from `sample-esim-products.json`
7. **Click "Insert"**
8. **Repeat** for other products

### Option 2: Using MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect to your database**
3. **Navigate to `products` collection**
4. **Click "Add Data" → "Insert Document"**
5. **Paste the JSON** from `sample-esim-products.json`
6. **Click "Insert"**

### Option 3: Using Admin Dashboard (Recommended)

Use your existing admin bundle creation interface to create products via the API.

## Important Fields for Products

### Required Fields:
- `name` - Display name (e.g., "Lyca Smart eSIM S")
- `productType` - Must be **"ESIM"** for eSIM bundles
- `category` - e.g., "NORWAY", "NORDIC", "EUROPE"
- `basePrice` - Price in NOK (e.g., 119.00)
- `status` - Must be **"ACTIVE"** to show on website
- `isVisible` - Must be **true** to show on website
- `dataAmount` - Data quota (e.g., "1GB", "5GB", "30GB")
- `validity` - Validity period (e.g., "30 days")

### Optional but Important:
- `metadata` - Object containing features to display
  ```json
  "metadata": {
    "feature_0": "Unlimited national minutes",
    "feature_1": "100* Minutes to United Kingdom and more",
    "feature_2": "1GB EU Roaming Data",
    "feature_3": "eSIM available"
  }
  ```
- `stockQuantity` - Number of available items
- `isFeatured` - Set to true for featured products
- `discountPercentage` - Discount percentage (0 = no discount)

## Linking Products to StockPools

Your StockPool document has:
```json
"productId": "69034113f29dda01ad32c8ab"
```

The corresponding Product document should have:
```json
"_id": "69034113f29dda01ad32c8ab"
```

This links the StockPool inventory to the Product display information.

## Current Setup

Your StockPool "Lyca11" has:
- **productId**: `69034113f29dda01ad32c8ab`
- **Total Quantity**: 10 eSIMs
- **Available**: 7 eSIMs
- **Used**: 3 eSIMs

You need to create a Product with `_id: "69034113f29dda01ad32c8ab"` to display this on the website.

## Sample Product Document

See `sample-esim-products.json` for ready-to-use product documents.

The first product in that file has the correct ID to link with your existing StockPool.

## After Adding Products

1. **Refresh the website** (http://localhost:3000/bundles?filter=esim)
2. **Check browser console** for API response (F12 → Console tab)
3. You should see:
   ```
   Fetched data: {success: true, bundles: [...], totalCount: 3}
   ```
4. The eSIM bundles should now appear with real data

## Verification

The backend logs show:
```
GET "/api/public/bundles"
Writing [{success=true, bundles=[], totalCount=0}]
```

After adding products, this should change to:
```
Writing [{success=true, bundles=[...product data...], totalCount=3}]
```

## Quick Test Product

If you want to test quickly, copy this minimal product into MongoDB:

```json
{
  "_id": "69034113f29dda01ad32c8ab",
  "name": "Lyca Smart eSIM S",
  "productType": "ESIM",
  "category": "NORWAY",
  "basePrice": 119.00,
  "stockQuantity": 7,
  "dataAmount": "1GB",
  "validity": "30 days",
  "status": "ACTIVE",
  "isVisible": true,
  "metadata": {
    "feature_0": "Unlimited national minutes",
    "feature_1": "100* Minutes to United Kingdom and more",
    "feature_2": "1GB EU Roaming Data",
    "feature_3": "eSIM available"
  },
  "createdBy": "admin",
  "_class": "com.example.topup.demo.entity.Product"
}
```

Insert this into the `products` collection and refresh the website.
