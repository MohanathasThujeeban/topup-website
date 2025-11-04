# eSIM Purchase Implementation - Complete Guide

## ✅ What Has Been Implemented

### 1. **Backend API** (`PublicBundleController.java`)
- Public endpoint: `/api/public/bundles` - No authentication required
- Fetches products with `status=ACTIVE` and `visible=true`
- Integrates with StockPool to show real-time availability
- Returns enriched product data with stock information

### 2. **Frontend - Bundles Page** (`BundlesPage.jsx`)
- ✅ Fetches real data from backend API
- ✅ Removed all hardcoded/static bundle data
- ✅ Shows stock availability for eSIMs
- ✅ Displays "One eSIM per purchase" notice
- ✅ Shows limited stock warning when stock ≤ 5
- ✅ Disables "Buy now" when out of stock
- ✅ Shows proper error messages when no products exist

### 3. **Frontend - Product Page** (`ProductPage.jsx`)
- ✅ Fetches individual product by ID
- ✅ **Removes quantity selector for eSIMs** (always quantity = 1)
- ✅ Shows clear notice: "One eSIM per order"
- ✅ Keeps quantity selector for E-PIN products
- ✅ Displays all features from metadata

## 🎯 Customer Purchase Flow

### For eSIM Products:

1. **Browse Bundles** → Click "eSIM Bundles" filter
2. **View Available eSIMs** → See stock count (e.g., "7 eSIMs available")
3. **Read Notice** → "One eSIM per purchase"
4. **Click "Buy now"** → Redirected to product page
5. **No Quantity Selection** → Fixed at 1 eSIM only
6. **Purchase** → Gets ONE eSIM from available pool

### Stock Display Example:
```
┌─────────────────────────────────────┐
│ 🗄️ 7 eSIMs available  [Limited stock]│
│ One eSIM per purchase               │
└─────────────────────────────────────┘
```

## 📊 How Stock Works

### Your Current StockPool Data:
- **Total eSIMs**: 10
- **Assigned to Retailer**: 3 (status: ASSIGNED)
- **Available for Customer**: 7 (status: AVAILABLE)

### Backend Logic:
```java
// Only counts AVAILABLE items
int available = stockItems.stream()
    .filter(item -> "AVAILABLE".equals(item.getStatus()))
    .count(); // Returns 7
```

### Display Logic:
- Shows: **"7 eSIMs available"** (not 10)
- Customer can only buy: **1 eSIM at a time**
- After purchase: Available count decreases to 6

## 🔗 Data Linking

### MongoDB Collections:

1. **`products` Collection** (Display Info)
```json
{
  "_id": "69034113f29dda01ad32c8ab",  // ← Product ID
  "name": "Lyca Smart eSIM S",
  "basePrice": 119.00,
  "status": "ACTIVE",
  "isVisible": true,
  "metadata": {
    "feature_0": "Unlimited national minutes",
    "feature_1": "100* Minutes to United Kingdom and more",
    ...
  }
}
```

2. **`stockpools` Collection** (Inventory)
```json
{
  "_id": "6904326a3719d5dc6e9ebaa4",
  "productId": "69034113f29dda01ad32c8ab",  // ← Links to Product
  "items": [ /* 10 eSIM items */ ],
  "availableQuantity": 7,  // ← Shown to customer
  "usedQuantity": 3        // ← Not shown (assigned to retailer)
}
```

## 📝 To Display eSIMs on Website

### Step 1: Add Product to MongoDB

Insert this into the `products` collection:

```json
{
  "_id": {
    "$oid": "69034113f29dda01ad32c8ab"
  },
  "name": "Lyca Smart eSIM S",
  "description": "1GB eSIM with unlimited national minutes",
  "productType": "ESIM",
  "category": "NORWAY",
  "basePrice": {
    "$numberDouble": "119.0"
  },
  "retailerCommissionPercentage": {
    "$numberDouble": "30.0"
  },
  "stockQuantity": {
    "$numberInt": "7"
  },
  "dataAmount": "1GB",
  "validity": "30 days",
  "status": "ACTIVE",
  "isVisible": true,
  "isFeatured": true,
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

### Step 2: Verify StockPool Exists

Your StockPool already exists with:
- `productId: "69034113f29dda01ad32c8ab"` ✅
- 7 available eSIMs ✅
- Proper item data with QR codes ✅

### Step 3: Refresh Website

Visit: `http://localhost:3000/bundles?filter=esim`

You should see:
```
┌────────────────────────────────────┐
│ [eSIM available]                   │
│                                    │
│ Lyca Smart eSIM S                  │
│                                    │
│ 1GB          kr119.00              │
│ Data         /30 days              │
│                                    │
│ ✓ Unlimited national minutes       │
│ ✓ 100* Minutes to United Kingdom   │
│ ✓ 1GB EU Roaming Data              │
│ ✓ eSIM available                   │
│                                    │
│ 🗄️ 7 eSIMs available               │
│ One eSIM per purchase              │
│                                    │
│ [Add to basket]  [Buy now]         │
└────────────────────────────────────┘
```

## 🚫 What Customers CANNOT Do

- ❌ Buy multiple eSIMs in one order
- ❌ Select quantity (fixed at 1)
- ❌ Buy if stock is 0
- ❌ See the 3 eSIMs already assigned to retailer

## ✅ What Customers CAN Do

- ✓ Buy exactly ONE eSIM per purchase
- ✓ See real-time stock availability
- ✓ Make multiple separate purchases (one at a time)
- ✓ See when stock is limited (≤ 5)
- ✓ Get instant QR code after purchase

## 🔄 Purchase Flow (Backend)

When customer buys an eSIM:

1. **Order Created** → Customer pays kr119.00
2. **StockPool Queried** → Find AVAILABLE eSIM
3. **Item Assigned** → Status: AVAILABLE → ASSIGNED
4. **Customer Gets**:
   - QR Code URL
   - Activation URL
   - Serial Number
   - ICCID
5. **Stock Updated** → Available: 7 → 6

## 📱 eSIM vs E-PIN Differences

| Feature | eSIM | E-PIN |
|---------|------|-------|
| Quantity Selector | ❌ No (always 1) | ✅ Yes (1-10) |
| Stock Display | ✅ Shows count | ❌ Not shown |
| Delivery | QR Code | Email PIN |
| One-time Use | ✅ Yes | ✅ Yes |
| Activation | Scan QR | Dial *123*PIN# |

## 🔍 Verification Checklist

After adding the product to MongoDB, check:

- [ ] Backend running: `mvnw spring-boot:run`
- [ ] API responds: GET `http://localhost:8080/api/public/bundles`
- [ ] Response shows: `{success: true, bundles: [...]}`
- [ ] Website shows: Real eSIM data
- [ ] Stock count: Shows "7 eSIMs available"
- [ ] Quantity selector: Hidden for eSIM
- [ ] Notice shown: "One eSIM per purchase"
- [ ] Buy button: Enabled
- [ ] Features: All 4 display correctly

## 🐛 Troubleshooting

### Issue: "No products found in database"
**Solution**: Add product to MongoDB `products` collection with `status=ACTIVE` and `isVisible=true`

### Issue: Stock shows 0 even though StockPool has items
**Solution**: Ensure `productId` in StockPool matches `_id` in Product

### Issue: Shows 10 instead of 7 available
**Solution**: Check backend counts only items with `status=AVAILABLE`

### Issue: Customer can select quantity
**Solution**: Verify `productType: "ESIM"` (uppercase) in MongoDB

## 📄 Files Modified

1. `PublicBundleController.java` - Public API endpoint
2. `BundlesPage.jsx` - Shows stock, removes static data
3. `ProductPage.jsx` - Removes quantity selector for eSIM
4. `sample-esim-products.json` - Sample product data
5. `ADD_ESIM_PRODUCTS_GUIDE.md` - Instructions

## 🎉 Result

✅ **Real eSIM data displayed from MongoDB**
✅ **Customer can only buy ONE eSIM at a time**
✅ **Shows 7 available (not 10 total)**
✅ **No hardcoded data**
✅ **Stock managed through StockPool**
✅ **Proper features from metadata**

---

**Next Step**: Add the product to MongoDB and refresh the website!
