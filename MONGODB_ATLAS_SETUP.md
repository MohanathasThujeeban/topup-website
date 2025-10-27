# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account with your email
4. Complete email verification

## Step 2: Create a Cluster
1. After login, click "Create a New Cluster" or "Build a Database"
2. Choose "M0 Sandbox" (FREE tier)
3. Select a cloud provider and region (choose closest to your location)
4. Give your cluster a name (e.g., "topup-cluster")
5. Click "Create Cluster"

## Step 3: Create Database User
1. In Atlas dashboard, go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Create username and password (SAVE THESE CREDENTIALS!)
   - Username: topup_user
   - Password: [Generate a strong password]
5. Set Database User Privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, you should restrict to specific IPs
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Java" as driver and version "4.3 or later"
5. Copy the connection string (it will look like):
   ```
   mongodb+srv://topup_user:<password>@topup-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Replace <password> in Connection String
Replace `<password>` in the connection string with the actual password you created for the database user.

## Next Steps
Once you have your connection string, we'll update your Spring Boot configuration to use MongoDB Atlas instead of local MongoDB.