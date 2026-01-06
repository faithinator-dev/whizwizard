# Render Deployment Guide for WhizWizard Backend

## Quick Deploy Steps:

### 1. Sign Up / Login to Render
- Go to https://render.com/
- Click "Get Started for Free"
- Sign up with GitHub (recommended) or email

### 2. Connect Your GitHub Repository
- Push your code to GitHub first
- In Render Dashboard, click "New +" → "Web Service"
- Click "Connect GitHub" (if not already connected)
- Select your `whizwizard` repository

### 3. Configure the Web Service

Fill in these settings:

**Basic Settings:**
- **Name**: `whizwizard-backend`
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`

**Build Settings:**
- **Build Command**: `npm install`
- **Start Command**: `node server/server.js`

**Instance Type:**
- Select **"Free"** (perfect for development)

### 4. Environment Variables

Click "Advanced" → Add Environment Variables:

```
NODE_ENV=production
PORT=3000
FIREBASE_SERVICE_ACCOUNT=/etc/secrets/firebase-service-account.json
CORS_ORIGIN=https://your-vercel-app-url.vercel.app
```

**IMPORTANT: Firebase Credentials**
You need to add your Firebase credentials as a SECRET FILE:

1. Scroll to **"Secret Files"** section
2. Click "Add Secret File"
3. **Filename**: `firebase-service-account.json`
4. **Contents**: Copy-paste the ENTIRE contents of your local `firebase-service-account.json` file
5. Click "Save"

### 5. Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://whizwizard-backend.onrender.com`

### 6. Test Your Backend

Once deployed, test it:
```
https://whizwizard-backend.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "WhizWizard API is running"
}
```

---

## After Backend Deployment

1. **Copy your Render URL** (e.g., `https://whizwizard-backend.onrender.com`)
2. **Update frontend** API configuration (I'll help with this)
3. **Deploy frontend** to Vercel

---

## Important Notes

- **Free Tier Limitations**:
  - Service spins down after 15 minutes of inactivity
  - First request after sleep takes ~30 seconds to wake up
  - Perfect for development/portfolio projects

- **CORS**: Remember to add your Vercel frontend URL to CORS_ORIGIN environment variable

- **Logs**: Check "Logs" tab in Render dashboard if something goes wrong

---

## Troubleshooting

**Issue: "Firebase initialization error"**
- Make sure you added the secret file correctly
- Check the filename is exactly: `firebase-service-account.json`
- Verify the file path in environment variable: `/etc/secrets/firebase-service-account.json`

**Issue: "CORS error"**
- Add your frontend URL to CORS_ORIGIN environment variable
- Restart the service after adding

**Issue: "Build failed"**
- Check that `package.json` is in root directory
- Verify all dependencies are listed in package.json
