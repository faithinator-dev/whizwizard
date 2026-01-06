# whizwizard Backend Setup

## Prerequisites

Before running the backend, you need:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v5 or higher)
   - Download Community Edition from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
   - Verify installation: `mongod --version`

## Quick Start

### 1. Install Dependencies

```powershell
cd "c:\Users\HomePC\Desktop\code\quiz app"
npm install
```

### 2. Start MongoDB (if using local installation)

```powershell
# Start MongoDB service (Windows)
net start MongoDB

# OR run MongoDB manually
mongod --dbpath "C:\data\db"
```

### 3. Configure Environment

The `.env` file is already created with default settings:
- MongoDB URI: `mongodb://localhost:27017/whizwizard`
- Port: `3000`
- JWT Secret: (change this in production!)

### 4. Start the Server

```powershell
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

### 5. Test the API

Open your browser or use curl/Postman:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "whizwizard API is running",
  "timestamp": "2025-12-31T..."
}
```

## Running the Full Application

### Option 1: Using Live Server (VS Code Extension)

1. Install "Live Server" extension in VS Code
2. Right-click on `src/index.html`
3. Select "Open with Live Server"
4. Application will open at `http://127.0.0.1:5500`

### Option 2: Using Python HTTP Server

```powershell
cd "c:\Users\HomePC\Desktop\code\quiz app\src"
python -m http.server 8000
```

Then open: `http://localhost:8000`

### Option 3: Using Node.js http-server

```powershell
npm install -g http-server
cd "c:\Users\HomePC\Desktop\code\quiz app\src"
http-server -p 8000
```

Then open: `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get single quiz
- `POST /api/quizzes` - Create quiz (protected)
- `PUT /api/quizzes/:id` - Update quiz (protected)
- `DELETE /api/quizzes/:id` - Delete quiz (protected)
- `GET /api/quizzes/user/my-quizzes` - Get user's quizzes (protected)

### Results
- `POST /api/results` - Submit quiz result (protected)
- `GET /api/results/quiz/:quizId` - Get results by quiz (protected)
- `GET /api/results/user/my-results` - Get user's results (protected)
- `GET /api/results/leaderboard` - Get global leaderboard

### Live Rooms
- `POST /api/live-rooms` - Create live room (protected)
- `POST /api/live-rooms/:code/join` - Join room (protected)
- `GET /api/live-rooms/:id` - Get room details (protected)
- `POST /api/live-rooms/:id/start` - Start quiz (protected, host only)
- `POST /api/live-rooms/:id/answer` - Submit answer (protected)
- `POST /api/live-rooms/:id/next` - Next question (protected, host only)
- `GET /api/live-rooms/:id/leaderboard` - Get leaderboard (protected)
- `DELETE /api/live-rooms/:id` - Delete room (protected, host only)

## Troubleshooting

### MongoDB Connection Error

**Issue**: `MongoDB Connection Error: connect ECONNREFUSED`

**Solution**:
1. Make sure MongoDB is running:
   ```powershell
   net start MongoDB
   ```
2. Or check if MongoDB is installed:
   ```powershell
   mongod --version
   ```
3. If not installed, download from mongodb.com

### Port Already in Use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
1. Change port in `.env` file:
   ```
   PORT=3001
   ```
2. Or kill the process using port 3000:
   ```powershell
   # Find process
   netstat -ano | findstr :3000
   
   # Kill process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

### CORS Errors

**Issue**: `Access-Control-Allow-Origin error`

**Solution**:
1. Make sure backend is running
2. Check frontend URL matches CORS_ORIGIN in `.env`
3. Add your frontend URL to CORS_ORIGIN:
   ```
   CORS_ORIGIN=http://127.0.0.1:5500,http://localhost:8000
   ```

### Authentication Not Working

**Issue**: User can't login after switching to API

**Solution**:
1. Clear browser LocalStorage (F12 → Application → Local Storage → Clear)
2. Make sure `src/js/api.js` is loaded before `auth.js` in HTML
3. Check browser console for errors

## Development Tips

### View MongoDB Data

Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `whizwizard`

Using mongo shell:
```powershell
mongo
use whizwizard
db.users.find()
db.quizzes.find()
db.liverooms.find()
```

### Reset Database

```powershell
mongo
use whizwizard
db.dropDatabase()
```

Then restart your server.

### Watch Server Logs

The server logs all requests and errors in the terminal where you ran `npm run dev`.

## Next Steps

1. Update all frontend JavaScript files to use the new API
2. Test authentication flow
3. Test quiz creation and taking
4. Test live quiz functionality
5. Deploy to production (Heroku, DigitalOcean, AWS, etc.)

## Production Deployment

Before deploying to production:

1. **Change JWT Secret** in `.env`:
   ```
   JWT_SECRET=your-very-long-random-secret-key-here
   ```

2. **Use MongoDB Atlas** (cloud database):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whizwizard
   ```

3. **Set NODE_ENV**:
   ```
   NODE_ENV=production
   ```

4. **Use Environment Variables** (don't commit `.env` file)

5. **Add Password Hashing** (already implemented with bcrypt)

6. **Enable HTTPS**

7. **Add Rate Limiting**

8. **Set up monitoring** (PM2, New Relic, etc.)
