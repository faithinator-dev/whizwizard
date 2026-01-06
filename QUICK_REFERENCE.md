# ⚡ Quick Reference - Backend Commands

## 🚀 Starting the App

### Start Backend (Required)
```powershell
cd "c:\Users\HomePC\Desktop\code\quiz app"
npm start
```

### Start MongoDB (Required if using local)
```powershell
mongod
```

### Open Frontend
```powershell
cd src
Start-Process index.html
```

Or with server:
```powershell
npx http-server src -p 8000
# Then open: http://localhost:8000
```

## 📦 First Time Setup

### 1. Install Node.js
https://nodejs.org (Download LTS version)

### 2. Install MongoDB
https://www.mongodb.com/try/download/community

### 3. Install Dependencies
```powershell
cd "c:\Users\HomePC\Desktop\code\quiz app"
npm install
```

### 4. Start Everything
```powershell
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
npm start

# Terminal 3 (optional): Frontend server
npx http-server src -p 8000
```

## 🔍 Check Status

### Backend Health
http://localhost:3000/api/health

### MongoDB Connection
```powershell
mongo
show dbs
use whizwizard
show collections
```

## 🛠️ Development

### Auto-restart on changes
```powershell
npm run dev
```

### View Logs
```powershell
# Backend logs show in console
npm start

# MongoDB logs
mongod --verbose
```

### Clear Database
```powershell
mongo
use whizwizard
db.dropDatabase()
```

## 🐛 Troubleshooting

### Port 3000 in use
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### MongoDB not starting
```powershell
# Check if running
Get-Process mongod

# Start manually
mongod --dbpath "C:\data\db"
```

### npm not found
- Install Node.js: https://nodejs.org
- Restart PowerShell after install

## 📡 API Endpoints Quick List

### Auth
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Quizzes  
- `GET /api/quizzes` - All quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Live Rooms
- `POST /api/live-rooms` - Create room
- `POST /api/live-rooms/join` - Join room
- `POST /api/live-rooms/:id/start` - Start quiz
- `POST /api/live-rooms/:id/answer` - Submit answer
- `GET /api/live-rooms/:id/leaderboard` - Leaderboard

## 📚 Full Guides

- **Complete Setup**: [SETUP_REAL_DATABASE.md](SETUP_REAL_DATABASE.md)
- **Backend Details**: [BACKEND_SETUP.md](BACKEND_SETUP.md)
- **What Changed**: [DATABASE_UPGRADE.md](DATABASE_UPGRADE.md)
- **Main README**: [README.md](README.md)

## ✅ Checklist

Before running the app:
- [ ] Node.js installed
- [ ] MongoDB installed
- [ ] `npm install` completed
- [ ] MongoDB running (`mongod`)
- [ ] Backend running (`npm start`)
- [ ] http://localhost:3000/api/health returns OK
- [ ] Frontend opened in browser

## 🎯 Common Tasks

### Create New User
Frontend: Click "Sign Up"
API: `POST /api/auth/register`

### Create Quiz
Frontend: "Create Quiz" → Fill form → Save
API: `POST /api/quizzes` (requires auth token)

### Start Live Session
Frontend: "My Quizzes" → Click users icon
API: `POST /api/live-rooms` (returns join code)

### Join Live Quiz
Frontend: "Join Live Quiz" → Enter code
API: `POST /api/live-rooms/join`

## 🔐 Environment Variables

Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/whizwizard
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

## 💾 Database Collections

```
whizwizard/
├── users        # User accounts
├── quizzes      # Quiz questions
├── liverooms    # Active game rooms
└── results      # Quiz scores
```

## 🌐 Deployment

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for:
- Heroku deployment
- MongoDB Atlas setup
- Environment configuration
- Production security tips

---

**Need Help?** Check the full guides in the docs folder! 📖
