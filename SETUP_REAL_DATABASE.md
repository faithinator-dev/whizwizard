# 🚀 Complete Setup Guide - Real Database

Your QuizMaster app now has a **real backend with MongoDB**! Here's how to set it up.

## What Changed?

- ✅ **MongoDB Database** - Real database instead of LocalStorage
- ✅ **Express API** - RESTful backend server
- ✅ **JWT Authentication** - Secure token-based auth with bcrypt password hashing
- ✅ **Real-time Updates** - Polling system works with actual database
- ✅ **Persistent Data** - Data survives browser refresh and works across devices
- ✅ **Production Ready** - Scalable architecture

## 📋 Prerequisites

### 1. Install Node.js

**Download Node.js v18 or higher:**
- Visit: https://nodejs.org
- Download the LTS (Long Term Support) version
- Run the installer
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

### 2. Install MongoDB

**Option A: Local MongoDB (Recommended for development)**

1. Download MongoDB Community Edition:
   - Visit: https://www.mongodb.com/try/download/community
   - Select your Windows version
   - Download and install

2. Start MongoDB:
   ```powershell
   # MongoDB usually auto-starts after installation
   # Or manually start it:
   mongod
   ```

**Option B: MongoDB Atlas (Cloud - Free Tier Available)**

1. Create account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env` file with your Atlas connection string

## 🔧 Backend Setup

### Step 1: Install Dependencies

Open PowerShell in the quiz app folder:

```powershell
cd "c:\Users\HomePC\Desktop\code\quiz app"
npm install
```

This installs:
- `express` - Web server framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### Step 2: Configure Environment

The `.env` file is already created with defaults:

```env
MONGODB_URI=mongodb://localhost:27017/quizmaster
JWT_SECRET=super-secret-jwt-key-change-this-in-production-abc123
PORT=3000
NODE_ENV=development
```

**If using MongoDB Atlas:**
1. Replace `MONGODB_URI` with your Atlas connection string
2. Example: `mongodb+srv://username:password@cluster.mongodb.net/quizmaster`

### Step 3: Start the Backend

```powershell
# Production mode
npm start

# OR Development mode (auto-restarts on code changes)
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 QuizMaster API running on http://localhost:3000
📊 Environment: development
```

### Step 4: Verify Backend

Open browser and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "QuizMaster API is running",
  "timestamp": "2025-12-31T..."
}
```

## 🎮 Frontend Setup

The frontend is **already configured** to use the real API!

Just open the quiz app:
```powershell
cd "c:\Users\HomePC\Desktop\code\quiz app\src"
Start-Process index.html
```

Or use a local server:
```powershell
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

## 🎯 How It Works

### Before (LocalStorage)
```
Browser → LocalStorage → Browser
```
- Data only in one browser
- Deleted when clearing cache
- Can't sync across devices

### After (Real Database)
```
Browser → API (http://localhost:3000) → MongoDB
```
- Data persists in database
- Works across multiple browsers/devices
- Real authentication with hashed passwords
- Production-ready architecture

## 📚 Project Structure

```
quiz app/
├── server/                      # Backend
│   ├── server.js               # Main server file
│   ├── config/
│   │   └── database.js         # DB configuration
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js             # User model
│   │   ├── Quiz.js             # Quiz model
│   │   ├── LiveRoom.js         # Live room model
│   │   └── Result.js           # Result model
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── liveRoomController.js
│   │   └── resultController.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── quizzes.js
│   │   ├── liveRooms.js
│   │   └── results.js
│   └── middleware/
│       └── auth.js             # JWT authentication
├── src/                        # Frontend (unchanged)
│   └── js/
│       └── api.js              # Updated to use real API
├── package.json                # Backend dependencies
├── .env                        # Environment config
└── .env.example                # Example config
```

## 🔐 Security Features

✅ **Password Hashing** - bcrypt with salt rounds
✅ **JWT Tokens** - Secure authentication
✅ **Protected Routes** - Middleware checks auth
✅ **CORS** - Configured for security
✅ **Input Validation** - Mongoose schema validation

## 🧪 Testing the Setup

### 1. Start Backend
```powershell
npm start
```

### 2. Open Frontend
Open `src/index.html` in browser

### 3. Test Flow
1. **Sign Up** - Create a new account
2. **Check Database** - Account is saved in MongoDB
3. **Create Quiz** - Quiz is saved to database
4. **Start Live Session** - Room created in database
5. **Join from Another Browser** - Works across browsers!

### 4. View Database

**Using MongoDB Compass (GUI):**
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. View `quizmaster` database

**Using MongoDB Shell:**
```bash
mongo
use quizmaster
db.users.find().pretty()
db.quizzes.find().pretty()
db.liverooms.find().pretty()
```

## 🚨 Troubleshooting

### "npm is not recognized"
- **Solution**: Install Node.js from https://nodejs.org
- Restart PowerShell after installation

### "MongoDB connection failed"
- **Solution**: Make sure MongoDB is running
  ```powershell
  mongod
  ```
- Or check MongoDB service in Windows Services

### "Port 3000 already in use"
- **Solution**: Change PORT in `.env` to 3001
- Or stop the process:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Frontend not connecting to API
- **Solution**: Make sure backend is running on port 3000
- Check browser console for errors
- Verify API URL in `src/js/api.js`

### CORS errors
- **Solution**: Backend has CORS enabled by default
- Make sure you're accessing frontend via http://localhost (not file://)
- Use `npx http-server` to serve the frontend

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Live Rooms
- `POST /api/live-rooms` - Create room
- `POST /api/live-rooms/join` - Join room
- `POST /api/live-rooms/:id/start` - Start quiz
- `POST /api/live-rooms/:id/answer` - Submit answer
- `POST /api/live-rooms/:id/next` - Next question
- `GET /api/live-rooms/:id/leaderboard` - Get leaderboard

### Results
- `POST /api/results` - Save result
- `GET /api/results/leaderboard` - Global leaderboard

## 🌐 Production Deployment

For production:

1. **Use environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongo-uri
   JWT_SECRET=very-long-random-secure-string
   ```

2. **Use process manager**
   ```bash
   npm install -g pm2
   pm2 start server/server.js
   pm2 startup
   ```

3. **Deploy to:**
   - **Backend**: Heroku, DigitalOcean, AWS, Azure
   - **Database**: MongoDB Atlas (free tier available)
   - **Frontend**: Netlify, Vercel, GitHub Pages

## ✨ Benefits

| Feature | LocalStorage | Real Database |
|---------|-------------|---------------|
| **Persistence** | Browser only | Permanent |
| **Multi-device** | ❌ No | ✅ Yes |
| **Security** | ❌ Visible | ✅ Encrypted |
| **Scalability** | ❌ Limited | ✅ Unlimited |
| **Production** | ❌ Not suitable | ✅ Ready |
| **Collaboration** | ❌ Same browser only | ✅ Any device |

## 🎉 You're Done!

Your quiz app now has:
- ✅ Real MongoDB database
- ✅ Secure authentication
- ✅ RESTful API
- ✅ Production-ready architecture
- ✅ Works across multiple devices
- ✅ Persistent data storage

Enjoy your fully-featured quiz platform! 🚀
