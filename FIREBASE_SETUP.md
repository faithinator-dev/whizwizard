# 🔥 Firebase Setup Guide for WhizWizard

Your WhizWizard app has been converted to use **Firebase & Firestore**! This guide will help you set it up.

## 🎯 What Changed?

- ✅ **Firebase Authentication** - Secure user authentication
- ✅ **Cloud Firestore** - NoSQL database for all data
- ✅ **firebase-admin SDK** - Backend integration
- ✅ **No Local Installation Required** - Everything runs in the cloud
- ✅ **Free Tier Available** - Perfect for development and small projects

## 📋 Prerequisites

### Install Node.js (if not already installed)

1. Visit: https://nodejs.org
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

## 🚀 Step 1: Create Firebase Project

### 1.1 Create Firebase Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Click **"Add project"** or **"Create a project"**

### 1.2 Configure Your Project

1. **Project Name**: Enter `WhizWizard` (or any name you prefer)
2. **Google Analytics**: Optional (you can disable it for now)
3. Click **"Create project"**
4. Wait for the project to be created (takes ~30 seconds)

### 1.3 Enable Firestore Database

1. In your Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. **Mode Selection**:
   - For Development: Choose **"Start in test mode"** (allows read/write for 30 days)
   - For Production: Choose **"Start in production mode"** (you'll configure rules later)
4. **Location**: Choose a region closest to you
5. Click **"Enable"**

### 1.4 Enable Authentication

1. Click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider
5. Click **"Save"**

## 🔐 Step 2: Get Firebase Credentials

### 2.1 Generate Service Account Key

1. In Firebase Console, click the ⚙️ (gear icon) next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the confirmation dialog
6. A JSON file will be downloaded - **KEEP THIS FILE SECURE!**

### 2.2 Save the Service Account File

1. Rename the downloaded file to `firebase-service-account.json`
2. Move it to your project root directory:
   ```
   c:\Users\HomePC\Desktop\DKT TOOL\code\quiz app\firebase-service-account.json
   ```
3. **IMPORTANT**: This file contains sensitive credentials - never commit it to Git!

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create .env File

Create a file named `.env` in your project root directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration (Option 1: Use Service Account File)
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json

# CORS Configuration
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500

# Alternative: Firebase Configuration (Option 2: Environment Variables)
# Uncomment these if you prefer not to use the service account file
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

### 3.2 Get Firebase Config Values (If Using Option 2)

If you prefer environment variables over the service account file:

1. Open the downloaded JSON file
2. Copy these values to your `.env` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)

## 📦 Step 4: Install Dependencies

Open PowerShell in your project directory and run:

```powershell
cd "c:\Users\HomePC\Desktop\DKT TOOL\code\quiz app"
npm install
```

This will install:
- `firebase-admin` - Firebase Admin SDK
- `express` - Web server
- `cors` - Cross-origin requests
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `express-validator` - Input validation

## 🏃 Step 5: Run Your Application

### 5.1 Start the Backend Server

```powershell
npm start
```

Or for development with auto-restart:

```powershell
npm run dev
```

You should see:
```
✅ Firebase Admin initialized successfully
📊 Project: your-project-id
🚀 WhizWizard Backend Server Started
=====================================
📡 Server running on port 3000
🌐 API URL: http://localhost:3000/api
🏥 Health Check: http://localhost:3000/api/health
=====================================
```

### 5.2 Start the Frontend

Open `index.html` in your browser or use Live Server in VS Code:

1. Right-click `src/index.html`
2. Select **"Open with Live Server"**

## 🔒 Step 6: Configure Firestore Security Rules (Important!)

For production, you need to set proper security rules.

### 6.1 Access Firestore Rules

1. Go to Firebase Console → Firestore Database
2. Click the **"Rules"** tab

### 6.2 Update Security Rules

Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Quizzes collection - anyone can read, only owners can modify
    match /quizzes/{quizId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.createdBy);
    }
    
    // Results collection - authenticated users can create, read own results
    match /results/{resultId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.user);
    }
    
    // Live Rooms collection - authenticated users can read/create
    match /liveRooms/{roomId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isOwner(resource.data.host);
    }
  }
}
```

3. Click **"Publish"**

## 🔧 Step 7: Update Frontend API Configuration (If Needed)

Your frontend should work as-is, but verify the API base URL in `src/js/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## ✅ Step 8: Test Your Application

### Test the Backend

1. Check health endpoint:
   ```powershell
   curl http://localhost:3000/api/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "WhizWizard API is running",
     "timestamp": "2026-01-06T..."
   }
   ```

### Test Registration

1. Open your app in the browser
2. Go to Signup page
3. Create a new account
4. Check Firebase Console → Authentication to see the new user

### Test Quiz Creation

1. Login with your account
2. Create a new quiz
3. Check Firebase Console → Firestore Database to see the data

## 🛠️ Troubleshooting

### Issue: "Firebase initialization error"

**Solution**: Check that:
- Your `.env` file exists and has the correct values
- The `firebase-service-account.json` file is in the correct location
- The file path in `.env` is correct

### Issue: "Permission denied" errors

**Solution**: Update your Firestore security rules (see Step 6)

### Issue: "Port 3000 is already in use"

**Solution**: Change the PORT in `.env` file or kill the process using port 3000:

```powershell
netstat -ano | findstr :3000
taskkill /PID <process-id> /F
```

### Issue: Frontend can't connect to backend

**Solution**: 
1. Make sure backend is running (`npm start`)
2. Check CORS_ORIGIN in `.env` matches your frontend URL
3. Verify API_BASE_URL in `src/js/api.js`

## 📊 Firebase Console Overview

### Key Sections to Monitor

1. **Authentication** → Users
   - View registered users
   - Manage user accounts

2. **Firestore Database** → Data
   - View collections: users, quizzes, results, liveRooms
   - Browse and edit data

3. **Usage** → Dashboard
   - Monitor read/write operations
   - Check storage usage
   - View active connections

## 💰 Firebase Free Tier Limits

Firebase Spark Plan (Free) includes:

- **Firestore**:
  - 1 GB storage
  - 50,000 document reads/day
  - 20,000 document writes/day
  - 20,000 document deletes/day

- **Authentication**:
  - Unlimited users
  - Basic features included

This is more than enough for development and small to medium applications!

## 🚀 Next Steps

### For Development
- ✅ Backend is running on Firebase
- ✅ Data persists across devices
- ✅ Real-time updates work
- ✅ Secure authentication

### For Production
1. **Upgrade Firebase Plan** (if needed)
2. **Set proper environment variables** for production
3. **Review and tighten security rules**
4. **Set up Firebase Hosting** for your frontend
5. **Configure custom domain** (optional)
6. **Enable Firebase Analytics** (optional)

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Pricing](https://firebase.google.com/pricing)

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Check the server logs in PowerShell
3. Verify all environment variables are set correctly
4. Review Firebase Console for quota limits or permission issues

---

**Congratulations!** 🎉 Your WhizWizard app is now powered by Firebase!
