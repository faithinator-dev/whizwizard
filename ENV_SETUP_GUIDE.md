# 🔐 Environment Variables Setup - Complete Guide

This guide explains all environment variables needed for WhizWizard and how to configure them properly.

---

## 📁 Files Overview

Your project uses two environment files:

1. **`.env`** - Your actual configuration (DO NOT commit to Git)
2. **`.env.example`** - Template for other developers (safe to commit)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Locate Your .env File

The `.env` file is already created at:
```
c:\Users\HomePC\Desktop\DKT TOOL\code\quiz app\.env
```

### Step 2: Download Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Save the file as `firebase-service-account.json` in your project root

### Step 3: Verify Configuration

Your `.env` file should look like this:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration (Option 1: Use Service Account File - Recommended)
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json

# CORS Configuration (add your frontend URLs)
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000
```

That's it! You're ready to run `npm start`.

---

## 📋 Detailed Configuration Guide

### Option 1: Using Service Account File (Recommended)

This is the **easiest and most secure** method.

**Configuration:**
```env
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```

**Steps:**
1. Download `firebase-service-account.json` from Firebase Console
2. Place it in your project root directory
3. Set the path in `.env` file
4. Done!

**Advantages:**
- ✅ Easiest setup
- ✅ Most secure (file permissions)
- ✅ No need to copy/paste long keys
- ✅ Works with Git (file is in .gitignore)

---

### Option 2: Using Environment Variables

Use this if you can't use a file (e.g., on certain hosting platforms).

**Configuration:**
```env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

**Steps to get values:**

1. Open your `firebase-service-account.json` file
2. Find these fields:
   - `project_id` → Copy to `FIREBASE_PROJECT_ID`
   - `client_email` → Copy to `FIREBASE_CLIENT_EMAIL`
   - `private_key` → Copy to `FIREBASE_PRIVATE_KEY`

**Important for private_key:**
- Keep the quotes: `"-----BEGIN PRIVATE KEY-----\n..."`
- Keep the `\n` characters (they represent newlines)
- The entire key should be on ONE line in .env

**Example:**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(long key)...vFQ==\n-----END PRIVATE KEY-----\n"
```

---

## 🌐 CORS Configuration

Controls which domains can access your backend API.

**Default Configuration:**
```env
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000
```

**What it means:**
- Multiple URLs separated by commas
- Port 5500: VS Code Live Server default
- Port 8000: Common development server port
- Both localhost and 127.0.0.1 (same thing, different formats)

**When to update:**
- ✏️ Using a different port? Add it: `http://localhost:3001`
- ✏️ Deploying to production? Add your domain: `https://whizwizard.com`
- ✏️ Using Vercel/Netlify? Add their URL: `https://your-app.vercel.app`

**Production Example:**
```env
CORS_ORIGIN=https://whizwizard.com,https://www.whizwizard.com
```

---

## 🎨 Frontend Firebase Config (For Google Login)

These values are needed for client-side Firebase features like Google Sign-In.

**Where to add them:**
Edit `src/js/firebase-config.js`

**How to get values:**

1. Go to Firebase Console
2. Click ⚙️ → **Project Settings**
3. Scroll to **"Your apps"** section
4. Click on your Web app (or create one if you haven't)
5. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Copy these values to your `src/js/firebase-config.js` file

**Security Note:**
- ✅ Safe to expose in frontend code
- ✅ Protected by Firebase security rules
- ✅ Can be committed to Git

---

## 🔒 Environment Variables Security Checklist

### ✅ DO:
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different values for development and production
- ✅ Commit `.env.example` (without real values)
- ✅ Share `.env.example` with your team
- ✅ Regenerate keys if accidentally exposed

### ❌ DON'T:
- ❌ Commit `.env` to Git
- ❌ Share your `.env` file publicly
- ❌ Use production keys in development
- ❌ Hardcode secrets in your source code
- ❌ Post your keys on forums/Discord/GitHub issues

---

## 🧪 Testing Your Configuration

### Test 1: Check if .env is loaded

Add this temporarily to `server/server.js`:

```javascript
console.log('🔍 Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT);
```

Run `npm start` and verify you see the values.

### Test 2: Test Firebase Connection

```powershell
npm start
```

Look for:
```
✅ Firebase Admin initialized successfully
📊 Project: your-project-id
```

### Test 3: Test API Health

```powershell
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "WhizWizard API is running"
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module '.env'"

**Problem:** `.env` file doesn't exist or is in wrong location

**Solution:**
```powershell
# Check if file exists
Test-Path ".env"

# If it returns False, create it:
Copy-Item ".env.example" ".env"
```

### Issue 2: "Firebase initialization error"

**Problem:** Service account file not found or invalid

**Solution:**
1. Check the file exists: `Test-Path "firebase-service-account.json"`
2. Verify the path in `.env` matches the actual location
3. Make sure the file is valid JSON (open it in VS Code)

### Issue 3: "CORS error" in browser console

**Problem:** Your frontend URL is not in CORS_ORIGIN

**Solution:**
1. Check what URL your frontend is running on (look at browser address bar)
2. Add it to CORS_ORIGIN in `.env`
3. Restart the server (`npm start`)

### Issue 4: "Private key must be a string"

**Problem:** FIREBASE_PRIVATE_KEY is not formatted correctly

**Solution:**
- Make sure it's wrapped in quotes
- Keep all `\n` characters
- The entire key should be one line in .env

---

## 📝 Example Configurations

### Development (Local Machine)

```env
PORT=3000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

### Production (Deployed)

```env
PORT=3000
NODE_ENV=production
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
CORS_ORIGIN=https://whizwizard.com,https://www.whizwizard.com
```

### Heroku (Using Environment Variables)

```env
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=whizwizard-abc123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@whizwizard.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CORS_ORIGIN=https://whizwizard.herokuapp.com
```

---

## 🎯 Quick Reference

| Variable | Required? | Default | Purpose |
|----------|-----------|---------|---------|
| `PORT` | Optional | 3000 | Server port |
| `NODE_ENV` | Optional | development | Environment mode |
| `FIREBASE_SERVICE_ACCOUNT` | Required* | - | Path to service account file |
| `FIREBASE_PROJECT_ID` | Required** | - | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Required** | - | Service account email |
| `FIREBASE_PRIVATE_KEY` | Required** | - | Service account private key |
| `CORS_ORIGIN` | Optional | * | Allowed frontend URLs |

\* Required if not using individual Firebase environment variables  
\** Required if not using FIREBASE_SERVICE_ACCOUNT file

---

## ✅ Final Checklist

Before running your app, verify:

- [ ] `.env` file exists in project root
- [ ] `firebase-service-account.json` downloaded and placed correctly
- [ ] `FIREBASE_SERVICE_ACCOUNT` path is correct in `.env`
- [ ] `CORS_ORIGIN` includes your frontend URL
- [ ] `.env` is listed in `.gitignore`
- [ ] All values are filled (no "your-value-here" placeholders)

---

## 🆘 Still Having Issues?

1. **Check the logs:** Look at the server console output when running `npm start`
2. **Verify files:** Make sure both `.env` and service account file exist
3. **Test manually:** Try each step from the "Testing Your Configuration" section
4. **Compare with example:** Your `.env` should match the structure in `.env.example`

---

**Your `.env` file is now properly configured!** 🎉

Run `npm start` to launch your backend server.
