# 🚂 Railway Environment Variables Setup

Copy these environment variables to your Railway dashboard:

## 📍 Where to Add These Variables
1. Go to: https://railway.com/project/53ed27e2-f431-499e-a097-b343f5b8bf5c/service/48d65c2e-b8fc-42d7-a93a-506940f1c5f3
2. Click on "Variables" tab
3. Add each variable below:

---

## ✅ Required Environment Variables

### Server Configuration
```
PORT=8080
```

### MongoDB Configuration
```
MONGODB_URI=mongodb+srv://thujee_db:Thujee%40tamil01923@topupdb.puesjra.mongodb.net/topup_db?retryWrites=true&w=majority&appName=topupdb
```

### Email Configuration (Gmail)
```
MAIL_USERNAME=thujeeforearn@gmail.com
MAIL_PASSWORD=vblv pumf zyuw ecag
```

### Application URLs
```
APP_URL=https://topup-website.vercel.app
SUPPORT_EMAIL=support@topuppro.com
```

---

## 🔒 Optional Security Variables (Recommended for Production)

If you want to use different JWT secrets in production:

```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
```

---

## 📝 Notes

1. **MongoDB URI**: Already includes authentication credentials
2. **Email Password**: Using Gmail App Password (not regular password)
3. **PORT**: Railway will automatically assign PORT, but 8080 is the default
4. **APP_URL**: This is your frontend URL for email verification links

---

## ✨ After Adding Variables

1. Save all variables
2. Railway will automatically redeploy your backend
3. Check deployment logs to ensure everything starts correctly
4. Test the API endpoint: `https://topup-backend-production.up.railway.app/api`

---

## 🧪 Test Your Deployment

Once deployed, test with:

```bash
# Health check (if you have one)
curl https://topup-backend-production.up.railway.app/api/health

# Or test any public endpoint
curl https://topup-backend-production.up.railway.app/api/bundles
```
