# How to Run WhizWizard (No Backend Needed!)

## Quick Start

Your app now runs entirely on Firebase - no Node.js backend required!

### Step 1: Configure Firebase

1. Open `src/js/firebase-config.js`
2. Replace placeholder values with your Firebase project credentials
3. Get credentials from: https://console.firebase.google.com/

### Step 2: Run a Local Web Server

Choose ONE of these options:

#### Option A: Live Server (Easiest)
```powershell
cd src
npx live-server
```

#### Option B: VS Code Extension
1. Install "Live Server" extension
2. Right-click `src/index.html`
3. Click "Open with Live Server"

#### Option C: Python
```powershell
cd src
python -m http.server 8000
```

### Step 3: Open Your Browser

Visit: http://localhost:8080 (or the port shown)

## That's It! 🎉

No `npm install`, no backend server, no database setup!

Everything runs through Firebase.

---

**Note**: Make sure to update Firebase config before first use!
