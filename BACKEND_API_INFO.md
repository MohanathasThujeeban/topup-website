# 🚀 Backend API Information

## ✅ Your Railway Backend API URL

**Base URL:** `https://topup-backend-production.up.railway.app`

**API Base Path:** `https://topup-backend-production.up.railway.app/api`

---

## 📡 Available API Endpoints

### Authentication Endpoints
```
POST   https://topup-backend-production.up.railway.app/api/auth/register
POST   https://topup-backend-production.up.railway.app/api/auth/login
POST   https://topup-backend-production.up.railway.app/api/auth/verify-email
POST   https://topup-backend-production.up.railway.app/api/auth/forgot-password
POST   https://topup-backend-production.up.railway.app/api/auth/reset-password
POST   https://topup-backend-production.up.railway.app/api/auth/refresh-token
```

### Bundle Endpoints
```
GET    https://topup-backend-production.up.railway.app/api/bundles
GET    https://topup-backend-production.up.railway.app/api/bundles/{id}
POST   https://topup-backend-production.up.railway.app/api/bundles (Admin)
PUT    https://topup-backend-production.up.railway.app/api/bundles/{id} (Admin)
DELETE https://topup-backend-production.up.railway.app/api/bundles/{id} (Admin)
```

### Order Endpoints
```
GET    https://topup-backend-production.up.railway.app/api/orders
POST   https://topup-backend-production.up.railway.app/api/orders
GET    https://topup-backend-production.up.railway.app/api/orders/{id}
```

### User Profile Endpoints
```
GET    https://topup-backend-production.up.railway.app/api/profile
PUT    https://topup-backend-production.up.railway.app/api/profile
```

### Retailer Endpoints
```
POST   https://topup-backend-production.up.railway.app/api/retailer/login
GET    https://topup-backend-production.up.railway.app/api/retailer/orders
POST   https://topup-backend-production.up.railway.app/api/retailer/orders
```

### Admin Endpoints
```
GET    https://topup-backend-production.up.railway.app/api/admin/users
GET    https://topup-backend-production.up.railway.app/api/admin/dashboard
GET    https://topup-backend-production.up.railway.app/api/admin/business-requests
POST   https://topup-backend-production.up.railway.app/api/admin/business-requests/{id}/approve
POST   https://topup-backend-production.up.railway.app/api/admin/business-requests/{id}/reject
```

---

## 🧪 Test Your API

### Using cURL (PowerShell)
```powershell
# Test bundles endpoint (public)
Invoke-WebRequest -Uri "https://topup-backend-production.up.railway.app/api/bundles" -Method GET

# Test with JSON (for POST requests)
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://topup-backend-production.up.railway.app/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Using Browser
Simply open in your browser:
```
https://topup-backend-production.up.railway.app/api/bundles
```

---

## ⚙️ Current Configuration Status

### ✅ Frontend Configuration
- **File:** `src/config/api.js`
- **Production URL:** `https://topup-backend-production.up.railway.app/api`
- **Status:** ✅ Configured correctly

### ✅ Backend CORS Configuration
- **File:** `SecurityConfig.java`
- **Allowed Origins:** 
  - Local development (localhost:3000, 3001, 5173)
  - Production: `https://topup-website.vercel.app`
  - Vercel previews: `https://topup-website-*.vercel.app`
- **Status:** ✅ Configured correctly

### ✅ Application Properties
- **File:** `application.properties`
- **App URL:** `https://topup-website.vercel.app`
- **Status:** ✅ Configured correctly

---

## 🔗 Important Links

- **Backend API:** https://topup-backend-production.up.railway.app/api
- **Railway Dashboard:** https://railway.com/project/53ed27e2-f431-499e-a097-b343f5b8bf5c
- **Railway Service:** https://railway.com/project/53ed27e2-f431-499e-a097-b343f5b8bf5c/service/48d65c2e-b8fc-42d7-a93a-506940f1c5f3
- **Frontend (Vercel):** https://topup-website.vercel.app

---

## 📝 Next Steps

1. **Add Environment Variables to Railway** (if not done yet)
   - See `RAILWAY_ENV_SETUP.md` for details

2. **Test the API**
   ```powershell
   Invoke-WebRequest -Uri "https://topup-backend-production.up.railway.app/api/bundles"
   ```

3. **Deploy Frontend to Vercel**
   - Push your latest changes
   - Vercel will automatically deploy

4. **Test Full Integration**
   - Visit your frontend
   - Try login/register
   - Test bundle browsing and orders

---

## 🎉 Summary

Your backend API is ready at:
### `https://topup-backend-production.up.railway.app/api`

All configurations are in place! Just ensure environment variables are set in Railway and test the integration! 🚀
