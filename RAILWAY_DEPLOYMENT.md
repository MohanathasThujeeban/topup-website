# Railway Deployment Configuration

## 🚀 Backend Deployment

### Railway Project Details
- **Project ID**: `53ed27e2-f431-499e-a097-b343f5b8bf5c`
- **Service ID**: `48d65c2e-b8fc-42d7-a93a-506940f1c5f3`
- **Environment ID**: `8bef6577-3fbb-4d66-91ac-2e8509be2742`
- **Backend URL**: `https://topup-backend-production.up.railway.app`

## 📝 Required Railway Environment Variables

Set these environment variables in your Railway dashboard:

```env
# Server Configuration
PORT=8080

# MongoDB Configuration
MONGODB_URI=mongodb+srv://thujee_db:Thujee%40tamil01923@topupdb.puesjra.mongodb.net/topup_db?retryWrites=true&w=majority&appName=topupdb

# Email Configuration
MAIL_USERNAME=thujeeforearn@gmail.com
MAIL_PASSWORD=vblv pumf zyuw ecag

# Application Configuration
APP_URL=https://topup-website.vercel.app
SUPPORT_EMAIL=support@topuppro.com

# JWT Configuration (Optional - uses defaults from application.properties if not set)
# JWT_SECRET=topupSecretKeyThatIsLongEnoughForHS512Algorithm123456789
# JWT_EXPIRATION=86400000
# JWT_REFRESH_EXPIRATION=604800000
```

## 🔧 Railway Setup Steps

1. **Connect GitHub Repository**
   - Go to your Railway project
   - Connect the repository: `https://github.com/neirahtech/topup.git`
   - Set root directory to: `topup backend`

2. **Configure Build Settings**
   - Build Command: Maven will auto-detect from `pom.xml`
   - Start Command: `java -jar target/demo-0.0.1-SNAPSHOT.jar`

3. **Set Environment Variables**
   - Add all the environment variables listed above in Railway dashboard

4. **Generate Public Domain**
   - In Railway service settings, generate a public domain
   - Update the domain in this file if different from: `topup-backend-production.up.railway.app`

## 📡 API Endpoints

### Base URL
```
Production: https://topup-backend-production.up.railway.app/api
Local: http://localhost:8080/api
```

### Example Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/bundles` - Get bundles list
- `POST /api/orders` - Create order
- And more...

## 🌐 Frontend Configuration

The frontend has been configured to connect to the Railway backend:

### Production Build
```javascript
BASE_URL: 'https://topup-backend-production.up.railway.app/api'
FRONTEND_URL: 'https://topup-website.vercel.app'
```

### Local Development
```javascript
BASE_URL: 'http://localhost:8080/api'
FRONTEND_URL: 'http://localhost:3000'
```

## 🔒 CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (Local React dev)
- `http://localhost:3001` (Local alternative)
- `http://localhost:5173` (Local Vite dev)
- `https://topup-website.vercel.app` (Production frontend)
- `https://topup-website-*.vercel.app` (Vercel preview deployments)

## 🚀 Deployment Commands

### Push to Railway (Automatic Deployment)
```bash
# Push to neirahtech repository (connected to Railway)
git push neirahtech main
```

### Manual Build (Local)
```bash
cd "topup backend"
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

## 📊 Monitoring

### Check Logs
Visit: https://railway.com/project/53ed27e2-f431-499e-a097-b343f5b8bf5c/service/48d65c2e-b8fc-42d7-a93a-506940f1c5f3/logs

### Check Metrics
Visit: https://railway.com/project/53ed27e2-f431-499e-a097-b343f5b8bf5c/service/48d65c2e-b8fc-42d7-a93a-506940f1c5f3/metrics

## ⚠️ Important Notes

1. **Environment Variables**: Make sure all required environment variables are set in Railway dashboard
2. **MongoDB Connection**: Verify MongoDB Atlas allows connections from Railway's IP addresses
3. **Email Service**: Ensure Gmail account has "Less secure app access" enabled or use App Password
4. **Domain**: If you get a different Railway domain, update the CORS configuration accordingly

## 🔗 Useful Links

- Railway Dashboard: https://railway.com/project/53ed27e2-f431-499e-a097-b343f5b8bf5c
- GitHub Repository: https://github.com/neirahtech/topup
- Frontend (Vercel): https://topup-website.vercel.app

## 🆘 Troubleshooting

### Backend Not Responding
1. Check Railway logs for errors
2. Verify environment variables are set correctly
3. Check if MongoDB connection is working
4. Verify the service is running (green status in Railway)

### CORS Errors
1. Verify frontend URL is in CORS allowed origins
2. Check browser console for exact error
3. Ensure credentials are enabled in API calls

### Database Connection Issues
1. Verify MongoDB URI is correct
2. Check MongoDB Atlas network access settings
3. Verify database user credentials
