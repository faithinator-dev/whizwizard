# Firebase Web Configuration Instructions

## 🔥 How to Get Your Firebase Web API Key

The "Continue with Google" button needs your Firebase Web API credentials. Follow these steps:

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Sign in with your Google account
3. Select your project: **whizwizard-b0b39**

### Step 2: Access Project Settings
1. Click the **gear icon (⚙️)** next to "Project Overview" at the top left
2. Click **"Project Settings"**

### Step 3: Get Web App Configuration
1. Scroll down to **"Your apps"** section
2. Look for the Web app **(</>)** icon
   - If you don't see one, click **"Add app"** → Select **Web (</>)**
   - Give it a nickname like "WhizWizard Web"
   - Click **"Register app"**
3. You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "whizwizard-b0b39.firebaseapp.com",
  projectId: "whizwizard-b0b39",
  storageBucket: "whizwizard-b0b39.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Update Your Code
1. Open `src/js/firebase-config.js`
2. Replace the placeholder values with your actual values from Firebase Console
3. Save the file

### Step 5: Enable Google Sign-In
1. In Firebase Console, go to **"Authentication"** (left sidebar)
2. Click **"Sign-in method"** tab
3. Click on **"Google"**
4. Toggle **"Enable"**
5. Set support email (your email)
6. Click **"Save"**

### Step 6: Add Authorized Domains
1. Still in **Authentication → Settings → Authorized domains**
2. Make sure these domains are listed:
   - `localhost`
   - Your Vercel domain (e.g., `whizwizard.vercel.app`)

### ⚠️ Security Note
- Never commit your Firebase API key to public repositories
- Consider using environment variables for production

---

After completing these steps, the "Continue with Google" button will work!
