# WhizWizard - Live Quiz Hosting Platform

A fully functional multiplayer quiz hosting platform with **Firebase/Firestore database**, Node.js/Express backend, and modern frontend. Features Firebase authentication, Kahoot-style live quiz functionality with real-time leaderboards, **Nigerian grading system** for educational institutions, and a beautiful navy blue theme with smooth animations.

## Features

### Authentication System
- **User Registration**: Create an account with email and password
- **Secure Login**: Session-based authentication
- **Protected Routes**: Quiz creation requires authentication
- **User Profiles**: Track your quiz history and performance

### Quiz Management
- **Create Quizzes**: Build custom quizzes with multiple questions and options
- **Multiple Categories**: Science, History, Technology, and General Knowledge
- **Timer System**: Configurable time limits for each question
- **Edit & Delete**: Full CRUD operations for quiz management
- **Live Sessions**: Start live quiz sessions with join codes
- **Nigerian Grading System**: Optional grading for Secondary School, Polytechnic, and University levels

### Nigerian Grading System 🎓
- **Secondary School**: WAEC/NECO grading (A1-F9 with points)
- **Polytechnic**: ND/HND grading (A-F with GPA 0.0-5.0)
- **University**: Undergraduate grading (First Class to Fail with GPA)
- **Automatic Calculation**: Grades calculated based on percentage scores
- **Visual Display**: Color-coded grade badges with descriptions
- **Flexible**: Optional - can be enabled per quiz

### Live Quiz (Kahoot-style)
- **Join Codes**: 6-character alphanumeric codes for joining live quizzes
- **Real-time Gameplay**: 12-second timer per question
- **Live Leaderboards**: Top 10 players displayed after each question
- **Host Controls**: Start, pause, and advance questions manually or automatically
- **Automatic Progression**: 5-second countdown before next question
- **Time-based Scoring**: 1000 base points + speed bonus (up to 600 points)
- **Final Results**: Podium display and complete rankings

### Solo Quiz Taking
- **Interactive Interface**: Clean, responsive design with real-time feedback
- **Progress Tracking**: Visual progress bar and question counter
- **Timer Countdown**: Visual timer with warning indicators
- **Instant Results**: Detailed score breakdown and statistics
- **Grade Display**: Shows Nigerian grade if enabled for the quiz

### Leaderboard
- **Top Performers**: Podium display for top 3 users
- **Complete Rankings**: Full leaderboard table with statistics
- **User Stats**: Track attempts, scores, and averages

### Database System
- **Firebase/Firestore**: Production-ready NoSQL database
- **Complete CRUD**: Create, Read, Update, Delete operations
- **Statistics**: Real-time stats for quizzes, users, and completions
- **Result History**: Track all quiz attempts, scores, and grades
- **Live Rooms**: Room management with automatic cleanup (24hr TTL)
- **Persistent**: Data survives browser restarts and works across devices

## Project Structure

```
quiz app/
└── src/
    ├── index.html              # Home page
    ├── create-quiz.html        # Quiz creation page
    ├── take-quiz.html          # Solo quiz taking page
    ├── my-quizzes.html         # User's quizzes page
    ├── leaderboard.html        # Leaderboard page
    ├── login.html              # Login page
    ├── signup.html             # Registration page
    ├── join-quiz.html          # Join live quiz with code
    ├── live-quiz-play.html     # Live quiz player interface
    ├── live-quiz-host.html     # Live quiz host controls
    ├── css/
    │   ├── styles.css          # Main styles (Navy blue theme)
    │   └── animations.css      # Animation definitions
    ├── js/
    │   ├── database.js         # Database management system
    │   ├── quiz.js             # Quiz utility functions
    │   ├── auth.js             # Authentication system
    │   ├── live-quiz.js        # Live quiz room management
    │   ├── app.js              # Home page logic
    │   ├── create-quiz.js      # Quiz creation logic
    │   ├── take-quiz.js        # Solo quiz taking logic
    │   ├── my-quizzes.js       # My quizzes page logic
    │   ├── leaderboard.js      # Leaderboard page logic
    │   ├── login.js            # Login page logic
    │   ├── signup.js           # Registration page logic
    │   ├── join-quiz.js        # Join live quiz logic
    │   ├── live-quiz-play.js   # Live quiz player logic
    │   └── live-quiz-host.js   # Live quiz host logic
    └── assets/
        ├── icons/              # SVG icon files (27 total)
        │   ├── logo.svg
        │   ├── home.svg
        │   ├── create.svg
        │   ├── quiz.svg
        │   ├── trophy.svg
        │   ├── users.svg
        │   └── ... (more icons)
        └── characters/         # Animated character SVGs (5 total)
            ├── welcome-character.svg
            ├── create-character.svg
            ├── quiz-character.svg
            ├── result-character.svg
            └── empty-character.svg
```

## Getting Started
Prerequisites

1. **Node.js** v16+ - Download from https://nodejs.org
2. **MongoDB** - Install locally or use MongoDB Atlas (cloud)
   - Local: https://www.mongodb.com/try/download/community
   - Cloud: https://www.mongodb.com/cloud/atlas (free tier available)

### Installation

**See [SETUP_REAL_DATABASE.md](SETUP_REAL_DATABASE.md) for complete setup guide!**

**See [NG_GRADING_SYSTEM.md](NG_GRADING_SYSTEM.md) for Nigerian Grading System documentation!**

**Quick Start:**

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

3. **Start the backend server**
   ```bash
   npm start
   ```

4. **Open the frontend**
   - Open `src/index.html` in your browser
   - Or serve with http-server: `npx http-server src -p 8000`pplication
2. Simply open `src/index.html` in any modern web browser

### Quick Start

1. **Navigate to the project folder**:
   ```
   cd "c:\Users\HomePC\Desktop\code\quiz app\src"
   ```

2. **Open in browser**:
   - Double-click `index.html`
   - Or right-click → Open with → Your preferred browser
   - Or use a local server (recommended for development)

3. **Using a local server** (optional):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   ```
   Then navigate to `http://localhost:8000`

## Usage Guide

### Getting Started

1. **Create an Account**: Click "Sign Up" and register with your name, email, and password
2. **Login**: Use your credentials to login

### Creating a Quiz

1. Click **"Create Quiz"** in the navigation (requires login)
2. Fill in quiz details:
   - Title and description
   - Select category
   - Set timer (seconds per question)
3. Add questions:
   - Click "Add Question" for each new question
   - Enter question text
   - Add 4 options
   - Select the correct answer
4. Click **"Create Quiz"** to save

### Starting a Live Quiz Session

1. Go to **"My Quizzes"** page
2. Find the quiz you want to host
3. Click the **"Start Live Session"** button (users icon)
4. Share the 6-character join code with participants
5. Wait for players to join in the lobby
6. Click **"Start Quiz"** when ready
7. Control the quiz flow:
   - View real-time response statistics
   - Auto-advance when all players answer (if enabled)
   - Manually advance to next question
   - View live leaderboard after each question

### Joining a Live Quiz

1. Click **"Join Live Quiz"** from the home page
2. Enter the 6-character code provided by the host
3. Wait in the lobby until the host starts
4. Answer each question within 12 seconds
5. View your ranking after each question (Top 10)
6. See final results and podium at the end

### Taking a Solo Quiz

1. From the home page, click on any available quiz
2. Answer questions within the time limit
3. Navigate between questions using Previous/Next buttons
4. Click **"Finish"** to submit and view results

### Managing Your Quizzes

1. Go to **"My Quizzes"** page (requires login)
2. View all quizzes you've created
3. Options available:
   - **Live**: Start a live session with join code
   - **Play**: Take your own quiz
   - **Edit**: Modify quiz (coming soon)
   - **Delete**: Remove quiz permanently

### Viewing Leaderboard

1. Navigate to **"Leaderboard"**
2. See top 3 performers on the podium
3. View complete rankings in the table

## Live Quiz System

### How It Works

The live quiz system uses a polling-based approach with LocalStorage for real-time synchronization:

1. **Room Creation**: Host creates a room with a unique 6-character join code
2. **Player Joining**: Players join using the code and wait in the lobby
3. **Quiz Start**: Host starts the quiz, triggering all players to begin
4. **Question Flow**:
   - Each question has a 12-second timer
   - Players submit answers in real-time
   - Scoring: 1000 base points + (12 - time_taken) × 50 speed bonus
5. **Leaderboard Display**: Top 10 players shown after each question
6. **Auto-Advance**: 5-second countdown before next question
7. **Final Results**: Complete rankings and podium display

### Polling System

- **Poll Interval**: 500ms (0.5 seconds)
- **Room Updates**: Players and hosts check for room status changes
- **State Synchronization**: Question progression, player answers, leaderboards

### Scoring Formula

```javascript
Base Points: 1000 (for correct answer)
Speed Bonus: (12 - timeTaken) × 50
Maximum Score per Question: 1600 points
```

### Room Lifecycle

1. **Waiting**: Room created, players joining
2. **In Progress**: Quiz active, questions being answered
3. **Finished**: Quiz complete, final results displayed
4. **Cleanup**: Rooms auto-deleted after 24 hours

## Design Theme

### Color Palette
- **Primary Navy**: `#0a1929` - Main background
- **Secondary Navy**: `#1a2942` - Cards and containers
- **Accent Navy**: `#2d4a6d` - Borders and highlights
- **Accent Blue**: `#4a90e2` - Primary buttons and actions
- **Accent Cyan**: `#00d4ff` - Headings and emphasis
- **Success**: `#00e676` - Correct answers
- **Warning**: `#ffd700` - Timer warnings
- **Danger**: `#ff4757` - Wrong answers, delete actions

### Typography
- Font Family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Responsive sizing with rem units
- Clear hierarchy with font weights

### Animations
- Fade, slide, scale, and bounce effects
- Smooth transitions (0.2s - 0.5s)
- Infinite animations for characters
- Hover effects on interactive elements

## Database Schema

### Users
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string,  // Note: Not hashed in this demo - use proper hashing in production
  createdAt: timestamp
}
```

### Quizzes
```javascript
{
  id: string,
  title: string,
  description: string,
  category: string,
  timer: number,
  questions: Array,
  createdBy: string,
  createdAt: string,
  attempts: number
}
```

### Questions
```javascript
{
  question: string,
  options: string[],
  correctAnswer: number
}
```

### Results
```javascript
{
  id: string,
  quizId: string,
  userId: string,
  score: number,
  correctAnswers: number,
  wrongAnswers: number,
  totalQuestions: number,
  timeTaken: number,
  answers: number[],
  completedAt: string
}
```

### Live Quiz Rooms
```javascript
{
  id: string,
  code: string,          // 6-character join code
  quizId: string,
  hostId: string,
  status: string,        // 'waiting', 'in-progress', 'finished'
  players: Array[{
    id: string,
    name: string,
    points: number
  }],
  currentQuestion: number,
  answers: Object,       // Indexed by question number
  createdAt: timestamp
}
```

### Room Answers
```javascript
{
  playerId: string,
  answerIndex: number,
  timeTaken: number,
  isCorrect: boolean,
  points: number
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Features Overview

### Implemented
- ✅ User authentication (signup/login)
- ✅ Quiz creation and management (requires auth)
- ✅ Solo quiz taking with timer
- ✅ Live quiz sessions (Kahoot-style)
- ✅ 6-charactStack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing

### Frontend JavaScript Modules
- **API.js**: RESTful API client for backend communication
- **Auth.js**: User authentication, JWT token management
- **Live-quiz.js**: Live quiz room management (polling-based sync)
- ✅ Leaderboard system
- ✅ LocalStorage database
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Category filtering
- ✅ Result tracking
- ✅ Room management

### Future Enhancements
- 🔄 Quiz editing functionality
- 🔄 Password hashing and security
- 🔄 WebSocket for real real-time sync
- 🔄 Quiz sharing via links
- 🔄 Multiple question types (true/false, multiple select)
- 🔄 Image support in questions
- 🔄 Export/Import quiz data
- 🔄 Dark mode toggle
- 🔄 Sound effects
- 🔄 Team mode for live quizzes via API
- **State Management**: Centralized room state in MongoDB
- **Real-time Sync**: Players and hosts poll backend for changes
- **Automatic Cleanup**: MongoDB TTL index deletes rooms after 24 hours
- **Score Calculation**: Time-based bonus system (1000 base + speed bonus)
- **Leaderboard Generation**: Sorted by points, filtered to top 10
- **Cross-device**: Works across multiple browsers and devices simultaneously
- **Database.js**: Complete LocalStorage CRUD operations, user management, room management
- **Auth.js**: User authentication, session management, login/logout functionality
- **Live-quiz.js**: Live quiz room management, join codes, scoring, leaderboards
- **Quiz.js**: Utility functions for quiz operations
- **App.js**: Home page initialization, quiz loading, authentication navigation
- **Create-quiz.js**: Dynamic question form generation, authentication check
- **Take-quiz.js**: Solo quiz gameplay and timer logic
- **My-quizzes.js**: User quiz management, live session creation
- **Leaderboard.js**: Statistics and ranking display
- **Login.js / Signup.js**: Authentication form handling
- **Join-quiz.js**: Live quiz lobby, player waiting room
- **Live-quiz-play.js**: Live quiz player interface, real-time updates
- **Live-quiz-host.js**: Host controls, room management, response statistics

### CSS Architecture
- **Modular structure**: Separate files for base styles and animations
- **CSS Variables**: Centralized theming with custom properties
- **BEM-inspired naming**: Clear class naming conventions
- **Mobile-first**: Responsive breakpoints at 1024px, 768px, 480px
- **Extended styles**: 600+ lines added for live quiz components

### Performance Optimizations
- Minimal dependencies (zero external libraries)
- Optimized SVG assets (27 icons + 5 characters)
- CSS animations using GPU acceleration
- LocalStorage for instant data access
- Polling-based synchronization (500ms intervals)
- Efficient Features

✅ **Implemented:**
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT authentication with secure tokens
- ✅ Protected API routes with middleware
- ✅ Mongoose schema validation
- ✅ CORS configured
- ✅ Environment variables for secrets

⚠️ **For Production, also add:**
- HTTPS encryption (use reverse proxy like Nginx)
- Rate limiting (express-rate-limit)
- Input sanitization (express-validator already included)
- Helmet.js for security headers
- MongoDB connection encryption
- API request logging
- CSRF protection for state-changing operationss
Backend not starting
- Install Node.js from https://nodejs.org
- Run `npm install` to install dependencies
- Start MongoDB with `mongod`
- Check backend is running: http://localhost:3000/api/health

### Live quiz not syncing
- Ensure backend server is running on port 3000
- Check browser console for API errors
- Verify API_BASE_URL in src/js/api.js
- Refresh the page to reset polling
- Server-side authentication
- Database security
- Input validation and sanitization
- Rate limiting
- CSRF protection
- XSS prevention

## Troubleshooting

### Quiz not saving
- Check browser's LocalStorage is enabled
- Clear browser cache and try again

### Live quiz not syncing
- Ensure all participants are on the same browser/device (LocalStorage is per-browser)
- Refresh the page to reset polling
- Check browser console for errors

### Join code not working
- Verify the code is exactly 6 characters
- Check that the room still exists (not finished/expired)
- Ensure you're logged in

### Authentication issues
- Clear LocalStorage: `localStorage.clear()`
- Check browser allows cookies and storage
- Try in incognito mode to test fresh state
- Check browser console for errors

### Icons not displaying
- Ensure all SVG files are in `assets/icons/` folder
- Check file paths in HTML are correct
- Verify SVG files are not corrupted

### Timer not working
- Check JavaScript console for errors
- Ensure browser supports setInterval
- Try refreshing the page

## Credits

**Developer**: WhizWizard Team
**Version**: 1.0.0
**Date**: December 31, 2025
**License**: MIT

## Support

For issues or questions, please check:
1. Browser console for error messages
2. Ensure all files are in correct directories
3. Try different browser if issues persist

---

**Enjoy creating and taking quizzes with WhizWizard! 🎯**
# whizwizard
