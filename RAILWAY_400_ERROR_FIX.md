# Railway 400 Bad Request Error - Fixed

## Problem
When deploying to Railway, users were getting a **400 Bad Request** error when trying to register personal accounts.

## Root Causes Identified

### 1. Mobile Number Validation Issue
**Problem:** The backend validates mobile numbers with regex: `^[0-9\+][0-9]{7,14}$`
- This means: Must start with digit or `+`, followed by 7-14 digits
- **No spaces, dashes, or parentheses allowed**

**Frontend was sending:** Phone numbers potentially with spaces like `123 456 789` or dashes like `123-456-789`

### 2. CORS Configuration Issue
**Problem:** The Railway backend URL and Vercel frontend URL were NOT in the allowed CORS origins list.

## Fixes Applied

### Fix 1: Clean Mobile Number in Frontend (PersonalRegistrationPage.jsx)
```javascript
// Before sending to backend, remove spaces, dashes, parentheses
const cleanedMobile = formData.mobileNumber.replace(/[\s\-\(\)]/g, '');

const result = await registerPersonal({
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim().toLowerCase(),
  mobileNumber: cleanedMobile,  // ✅ Now cleaned
  password: formData.password,
  acceptMarketing: formData.acceptMarketing,
  accountType: 'personal'
});
```

### Fix 2: Updated CORS Configuration

**Updated Files:**
1. `AuthController.java`
2. `SecurityConfig.java`
3. `WebConfig.java`

**Added allowed origins:**
```java
"https://topup-website-nine.vercel.app",  // Vercel frontend
"https://topup-backend-production.up.railway.app",  // Railway backend
"https://topup.neirahtech"
```

## Files Modified
1. ✅ `src/pages/PersonalRegistrationPage.jsx` - Mobile number cleaning
2. ✅ `topup backend/src/main/java/com/example/topup/demo/controller/AuthController.java` - CORS origins
3. ✅ `topup backend/src/main/java/com/example/topup/demo/config/SecurityConfig.java` - CORS config
4. ✅ `topup backend/src/main/java/com/example/topup/demo/config/WebConfig.java` - CORS mappings

## Next Steps

### 1. Rebuild Backend
```powershell
cd "topup backend"
./mvnw clean package -DskipTests
```

### 2. Push to GitHub
```powershell
git add .
git commit -m "Fix Railway 400 error: CORS config and mobile number validation"
git push origin main
```

### 3. Railway Auto-Deploy
Railway will automatically detect the push and redeploy the backend.

### 4. Test Registration
Try registering a new personal account on your production URL and it should work now!

## Testing Checklist
- [ ] Backend builds successfully
- [ ] Changes pushed to GitHub
- [ ] Railway redeploys automatically
- [ ] Personal registration works (test with various phone formats)
- [ ] Business registration works
- [ ] No CORS errors in browser console

## Additional Notes

### BusinessRegistrationPage Already Fixed
The `BusinessRegistrationPage.jsx` already had mobile number sanitization implemented:
```javascript
const normalizePhone = (input) => {
  const trimmed = (input || '').trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
};
```

### Backend Validation Rules
The backend `PersonalRegistrationRequest` DTO has these validations:
- First name: 2-50 characters, required
- Last name: 2-50 characters, required
- Email: Valid email format, required
- Mobile: Must match `^[0-9\+][0-9]{7,14}$`, required
- Password: Minimum 8 characters, required

Make sure the frontend always cleans the mobile number before sending!
