# Test Promotions API

## Steps to Debug:

1. **Check Backend is Running**
   - Make sure `mvn spring-boot:run` is running in the backend terminal
   - Should see: "Started TopupbackendApplication"

2. **Test API Directly in Browser**
   - Open: http://localhost:8080/api/admin/promotions/active
   - You should see JSON response like:
   ```json
   {
     "success": true,
     "data": [...],
     "count": 1
   }
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for logs:
     - "Fetched promotions data:"
     - "Total offers:"
     - "Filtered offers:"

4. **Verify Promotion Data Structure**
   The promotion should have these fields:
   - `id`
   - `name`
   - `description`
   - `promotionType` (e.g., "NEW_CUSTOMER", "LIMITED_TIME")
   - `discountPercentage` or `discountAmount`
   - `startDate`
   - `endDate`
   - `status` (should be "ACTIVE")
   - `terms`

5. **Common Issues:**

   **Issue: "No Active Offers" shown**
   - **Cause**: Promotion status is not "ACTIVE" or dates are invalid
   - **Fix**: Check the promotion startDate is in the past and endDate is in the future

   **Issue: Promotion created but not showing**
   - **Cause**: API endpoint returning empty array
   - **Fix**: Check MongoDB has the promotion saved

   **Issue: CORS errors**
   - **Cause**: Backend CORS not configured
   - **Fix**: Already fixed in CustomCorsFilter.java

## Manual Test Steps:

1. **Restart Backend** (if not already running):
   ```bash
   cd "topup backend"
   mvn spring-boot:run
   ```

2. **Create a Test Promotion** in Admin Dashboard:
   - Name: "Test Offer"
   - Description: "50% off test"
   - Type: NEW_CUSTOMER
   - Discount: 50%
   - Start Date: Today
   - End Date: One month from now
   - Status: ACTIVE

3. **Check MongoDB**:
   - Go to MongoDB Atlas
   - Find `promotions` collection
   - Verify the promotion is saved

4. **Refresh Offers Page**:
   - Go to http://localhost:3000/offers
   - Check Console for logs
   - Should see the promotion card

## Expected Console Output:

```
Fetched promotions data: {success: true, data: Array(1), count: 1}
Setting offers: [{id: "...", name: "Test Offer", ...}]
Current filter: all
Total offers: 1
Filtered offers: 1
Offers data: [{...}]
```

## If Still Not Working:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+F5)
3. Check Network tab for the API request
4. Verify response status is 200
5. Check if response data has correct structure
