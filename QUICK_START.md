# WhizWizard Live - Quick Start Guide

## 🎯 Frontend-Only Application (No Backend Required!)

Your quiz platform runs entirely on **Firebase** - no Node.js backend server needed!

## 🚀 What's Included - Live Quiz Features!

Your quiz platform supports **Kahoot-style live multiplayer quizzes**!

### Key Features Added

#### 1. **User Authentication**
- Users must create an account to participate
- Login/Signup pages with session management
- Protected quiz creation (requires login)

#### 2. **Live Quiz Sessions**
- **6-Character Join Codes**: Easy room joining
- **12-Second Timer**: Per question (like Kahoot)
- **Real-time Leaderboards**: Top 10 after each question
- **5-Second Delay**: Countdown before next question
- **Host Controls**: Start/pause and advance questions

#### 3. **Scoring System**
```
Correct Answer: 1000 base points
Speed Bonus: (12 - timeTaken) × 50
Maximum: 1600 points per question
```

## 📋 How to Test the Live Quiz

### Step 1: Create an Account
1. Open `src/index.html` in your browser
2. Click "Sign Up"
3. Enter name, email, password
4. Click "Register"

### Step 2: Create a Quiz
1. After login, click "Create Quiz"
2. Fill in quiz details
3. Add at least 3-5 questions
4. Click "Create Quiz"

### Step 3: Start Live Session (Host)
1. Go to "My Quizzes"
2. Click the **users icon** (Start Live Session)
3. You'll see a 6-character join code (e.g., "ABC123")
4. Share this code with players
5. Wait for players to join in the lobby
6. Click "Start Quiz" when ready

### Step 4: Join as Player (New Browser Tab)
1. Open a **new incognito window** or different browser
2. Go to the same URL
3. Click "Sign Up" and create a different account
4. Click "Join Live Quiz" button
5. Enter the 6-character code from the host
6. Wait in lobby until host starts

### Step 5: Play!
- **Players**: Answer questions within 12 seconds
- **Host**: Monitor responses and advance questions
- **Everyone**: See leaderboard after each question
- **Final**: View podium and complete rankings

## 🎮 Testing Tips

### Multi-Browser Testing
Since this uses LocalStorage, test with:
- **Host**: Chrome (normal mode)
- **Player 1**: Chrome (incognito)
- **Player 2**: Firefox
- **Player 3**: Edge

Each browser has separate LocalStorage, simulating different users!

### Single Browser Testing
You can also:
1. Open DevTools (F12)
2. Use "Application" tab → "Local Storage"
3. Manually modify data to simulate multiple users
4. Or just create multiple accounts and switch between tabs

## 📁 File Structure

### New Files Created
```
src/
├── login.html              # Login page
├── signup.html             # Registration page
├── join-quiz.html          # Join live quiz with code
├── live-quiz-play.html     # Player interface
├── live-quiz-host.html     # Host control panel
└── js/
    ├── auth.js             # Authentication system
    ├── live-quiz.js        # Room management
    ├── login.js            # Login handler
    ├── signup.js           # Signup handler
    ├── join-quiz.js        # Join quiz handler
    ├── live-quiz-play.js   # Player interface logic
    └── live-quiz-host.js   # Host controls logic
```

### Updated Files
- `index.html` - Added "Join Live Quiz" button
- `my-quizzes.html` - Added "Start Live Session" button
- `create-quiz.html` - Added auth requirement
- All JS files - Added authentication checks
- `styles.css` - Added 600+ lines for new components
- `README.md` - Complete documentation update

## 🎯 Key Constants

Located in `src/js/live-quiz.js`:
```javascript
LIVE_TIMER: 12           // Seconds per question
LEADERBOARD_DELAY: 5     // Seconds before next question
POLL_INTERVAL: 500       // Milliseconds between updates
```

## 🔧 Customization

### Change Timer Duration
Edit `src/js/live-quiz.js`:
```javascript
LIVE_TIMER: 15  // Change to 15 seconds
```

### Change Leaderboard Delay
```javascript
LEADERBOARD_DELAY: 10  // Show leaderboard for 10 seconds
```

### Change Top Player Count
Edit `src/js/live-quiz.js` in `getQuestionLeaderboard()`:
```javascript
return leaderboard.slice(0, 15);  // Show top 15 instead of 10
```

### Modify Scoring
```javascript
const basePoints = 1000;
const speedBonus = (this.LIVE_TIMER - timeTaken) * 100;  // Increase bonus
```

## 📱 Pages Overview

1. **index.html** - Home page with "Join Live Quiz" button
2. **login.html** - User login
3. **signup.html** - User registration
4. **create-quiz.html** - Create new quiz (requires auth)
5. **my-quizzes.html** - Manage your quizzes, start live sessions
6. **join-quiz.html** - Enter code → Lobby → Wait for host
7. **live-quiz-play.html** - Play live quiz with timer
8. **live-quiz-host.html** - Host controls and statistics
9. **take-quiz.html** - Solo quiz (original functionality)
10. **leaderboard.html** - Global rankings

## 🎨 Design Elements

### Colors
- Navy Blue Theme (no gradients as requested)
- 27 SVG Icons (no emojis)
- 5 Animated Character SVGs

### Live Quiz Colors
- **Red (#e74c3c)** - Option 1
- **Blue (#3498db)** - Option 2
- **Orange (#f39c12)** - Option 3
- **Green (#2ecc71)** - Option 4

## ⚠️ Important Notes

### LocalStorage Limitations
- Data is per-browser/device
- Not truly "live" across different devices
- Best for same-device testing or demo purposes
- For production, use WebSockets + backend

### Security Warning
- Passwords are NOT hashed (demo only)
- No server-side validation
- Not suitable for production without security improvements

### Browser Requirements
- Modern browser (Chrome 90+, Firefox 88+, Edge 90+)
- LocalStorage enabled
- JavaScript enabled

## 🐛 Common Issues

**Issue**: "Room not found"
- Room may have expired (24-hour limit)
- Code entered incorrectly
- Host closed the room

**Issue**: "Not syncing in real-time"
- LocalStorage is per-browser
- Open in multiple browsers/incognito tabs
- Check polling is working (500ms intervals)

**Issue**: "Can't create quiz"
- Make sure you're logged in
- Check browser console for errors
- Verify LocalStorage is enabled

## 🎉 That's It!

You now have a complete Kahoot-style live quiz platform with:
- ✅ User authentication
- ✅ Live multiplayer quizzes
- ✅ 6-character join codes
- ✅ 12-second timers
- ✅ Real-time leaderboards
- ✅ Host controls
- ✅ Automatic scoring
- ✅ Beautiful navy theme
- ✅ Smooth animations

Enjoy your quiz platform! 🚀
