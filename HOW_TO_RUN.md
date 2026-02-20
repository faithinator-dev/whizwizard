# 🚀 How to Run WhizWizard (Frontend Only - No Backend!)

## ⚡ Super Quick Start

Your app runs entirely on **Firebase** - no Node.js backend, no npm install required!

### Step 1: Configure Firebase (One-Time Setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing)
3. Enable **Firestore Database** (test mode)
4. Enable **Authentication** (Email/Password)
5. Get your web app config

### Step 2: Update Config File

1. Open `src/js/firebase-config.js`
2. Replace placeholder values with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY_HERE",
       authDomain: "your-app.firebaseapp.com",
       projectId: "your-project-id",
       ...
   };
   ```

### Step 3: Run a Web Server

Choose **ONE** of these options:

#### Option A: NPM (Easiest)
```bash
npm start
```

#### Option B: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `src/index.html`
3. Click "Open with Live Server"

#### Option C: Python
```bash
python -m http.server 8000
```

### Step 4: Open Browser

Visit: `http://localhost:8080` (or your server's port)

---

## 🎉 That's It!

No backend server, no database setup, no complex configuration!

Everything runs through Firebase.

### First Time Usage

1. Click "Sign Up" to create an account
2. Start creating quizzes!
3. Share quiz codes with friends

---

## 🔥 Firebase Free Tier

Perfect for personal use and testing:
- ✅ 50,000 document reads/day
- ✅ 20,000 document writes/day
- ✅ 1 GB storage
- ✅ Unlimited authenticated users

### Need Help?

- Check `FIREBASE_WEB_CONFIG.md` for detailed Firebase setup
- Check `GOOGLE_LOGIN_SETUP.md` for Google Sign-In setup

---

**Note**: Make sure to update Firebase config before first use!
