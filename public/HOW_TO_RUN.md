# 🚀 How to Run WhizWizard (Node.js + MongoDB)

## ⚡ Super Quick Start

Your app now runs on a **Node.js/Express backend with MongoDB** for persistence.

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure MongoDB

1. Start a local MongoDB server or create a MongoDB Atlas cluster.
2. Optionally set `MONGO_URI` and `JWT_SECRET` in a `.env` file.
3. The backend defaults to `mongodb://127.0.0.1:27017/whizwizard`.

### Step 3: Run the App

Choose **ONE** of these options:

#### Option A: NPM (Easiest)
```bash
npm start
```

The backend serves the frontend files too, so `npm start` is enough.

### Step 4: Open Browser

Visit: `http://localhost:3000`

---

## 🎉 That's It!

The backend handles authentication, quizzes, results, and live-room state through MongoDB.

### First Time Usage

1. Click "Sign Up" to create an account
2. Start creating quizzes!
3. Share quiz codes with friends

### Need Help?

- Check `README.md` for the backend API and data model overview.
- Make sure MongoDB is running before starting the server.
