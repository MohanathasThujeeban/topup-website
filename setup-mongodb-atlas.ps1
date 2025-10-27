# MongoDB Atlas Configuration Script for TopUp Backend
# This script helps you configure your Spring Boot application to use MongoDB Atlas

Write-Host "=== MongoDB Atlas Configuration Script ===" -ForegroundColor Green
Write-Host ""
Write-Host "Follow these steps to set up MongoDB Atlas:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create MongoDB Atlas Account:"
Write-Host "   - Go to https://www.mongodb.com/cloud/atlas"
Write-Host "   - Sign up for a free account"
Write-Host ""
Write-Host "2. Create a Cluster:"
Write-Host "   - Choose M0 Sandbox (Free tier)"
Write-Host "   - Select your preferred cloud provider and region"
Write-Host ""
Write-Host "3. Create Database User:"
Write-Host "   - Username: topup_user"
Write-Host "   - Generate a strong password and save it"
Write-Host ""
Write-Host "4. Configure Network Access:"
Write-Host "   - Add your current IP address"
Write-Host "   - For development, you can allow access from anywhere (0.0.0.0/0)"
Write-Host ""
Write-Host "5. Get Connection String:"
Write-Host "   - Click 'Connect' on your cluster"
Write-Host "   - Choose 'Connect your application'"
Write-Host "   - Select Java driver"
Write-Host "   - Copy the connection string"
Write-Host ""

Read-Host "Press Enter when you have completed the MongoDB Atlas setup"

Write-Host ""
Write-Host "Now, let's configure your application:" -ForegroundColor Yellow
Write-Host ""

# Prompt for MongoDB connection string
Write-Host "Please enter your MongoDB Atlas connection string:"
Write-Host "It should look like: mongodb+srv://topup_user:<password>@cluster.xxxxx.mongodb.net/topup_db?retryWrites=true&w=majority" -ForegroundColor Cyan
$mongoUri = Read-Host "Connection String"

# Create environment file
Write-Host "Creating .env file with your MongoDB configuration..." -ForegroundColor Yellow

$envContent = @"
# MongoDB Atlas Configuration
MONGODB_URI=$mongoUri

# JWT Configuration
JWT_SECRET=topupSecretKeyThatIsLongEnoughForHS512Algorithm123456789

# Email Configuration
MAIL_USERNAME=thujeeforearn@gmail.com
MAIL_PASSWORD=vblv pumf zyuw ecag

# Application Configuration
APP_URL=http://localhost:3000
SUPPORT_EMAIL=support@topuppro.com

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ""
Write-Host "✅ Configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your .env file has been created with the MongoDB Atlas connection string."
Write-Host ""
Write-Host "To use MongoDB Atlas:" -ForegroundColor Yellow
Write-Host "1. Make sure your connection string includes the correct password"
Write-Host "2. Run your Spring Boot application with: mvn spring-boot:run -Dspring.profiles.active=prod"
Write-Host "3. Or use the environment variables in your IDE"
Write-Host ""
Write-Host "Test your connection by starting the application and checking the logs for successful MongoDB connection." -ForegroundColor Cyan