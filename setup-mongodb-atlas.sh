#!/bin/bash

# MongoDB Atlas Configuration Script for TopUp Backend
# This script helps you configure your Spring Boot application to use MongoDB Atlas

echo "=== MongoDB Atlas Configuration Script ==="
echo ""
echo "Follow these steps to set up MongoDB Atlas:"
echo ""
echo "1. Create MongoDB Atlas Account:"
echo "   - Go to https://www.mongodb.com/cloud/atlas"
echo "   - Sign up for a free account"
echo ""
echo "2. Create a Cluster:"
echo "   - Choose M0 Sandbox (Free tier)"
echo "   - Select your preferred cloud provider and region"
echo ""
echo "3. Create Database User:"
echo "   - Username: topup_user"
echo "   - Generate a strong password and save it"
echo ""
echo "4. Configure Network Access:"
echo "   - Add your current IP address"
echo "   - For development, you can allow access from anywhere (0.0.0.0/0)"
echo ""
echo "5. Get Connection String:"
echo "   - Click 'Connect' on your cluster"
echo "   - Choose 'Connect your application'"
echo "   - Select Java driver"
echo "   - Copy the connection string"
echo ""

read -p "Press Enter when you have completed the MongoDB Atlas setup..."

echo ""
echo "Now, let's configure your application:"
echo ""

# Prompt for MongoDB connection string
echo "Please enter your MongoDB Atlas connection string:"
echo "It should look like: mongodb+srv://topup_user:<password>@cluster.xxxxx.mongodb.net/topup_db?retryWrites=true&w=majority"
read -p "Connection String: " MONGO_URI

# Create environment file
echo "Creating .env file with your MongoDB configuration..."
cat > .env << EOF
# MongoDB Atlas Configuration
MONGODB_URI=$MONGO_URI

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
EOF

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Your .env file has been created with the MongoDB Atlas connection string."
echo ""
echo "To use MongoDB Atlas:"
echo "1. Make sure your connection string includes the correct password"
echo "2. Run your Spring Boot application with: mvn spring-boot:run -Dspring.profiles.active=prod"
echo "3. Or use the environment variables in your IDE"
echo ""
echo "Test your connection by starting the application and checking the logs for successful MongoDB connection."