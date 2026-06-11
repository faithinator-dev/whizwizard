const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
require('dotenv').config();

// =====================
// File Upload Configuration
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whizwizard';
const JWT_SECRET = process.env.JWT_SECRET || 'whizwizard-dev-secret';
const ADMIN_EMAIL = 'faithinator.faithanic@gmail.com';
const ADMIN_PASSWORD = 'Admin@faithinator';

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.resolve(__dirname, '..', 'public')));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    photoURL: { type: String, default: null },
    avatar: { type: String, default: null },
    totalScore: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
    quizzesCreated: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    image: { type: String, default: null }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general', trim: true },
    timer: { type: Number, default: 30 },
    questions: { type: [quizQuestionSchema], default: [] },
    createdBy: { type: String, required: true },
    createdByName: { type: String, default: '' },
    attempts: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const resultSchema = new mongoose.Schema(
  {
    quizId: { type: String, required: true, index: true },
    quizTitle: { type: String, default: '' },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    answers: { type: [Number], default: [] }
  },
  { timestamps: true }
);

const liveRoomParticipantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    joinedAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false }
);

const liveRoomSchema = new mongoose.Schema(
  {
    quizId: { type: String, required: true },
    quizTitle: { type: String, default: '' },
    hostId: { type: String, required: true },
    hostName: { type: String, default: '' },
    roomCode: { type: String, required: true, uppercase: true, index: true },
    status: { type: String, default: 'waiting' },
    participants: { type: [liveRoomParticipantSchema], default: [] },
    maxParticipants: { type: Number, default: 50 },
    currentQuestion: { type: Number, default: 0 },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 } 
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const Result = mongoose.model('Result', resultSchema);
const LiveRoom = mongoose.model('LiveRoom', liveRoomSchema);

// =====================
// Socket.io Real-time Logic
// =====================
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinRoom', async ({ roomId, userId, name }) => {
    socket.join(roomId);
    console.log(`👤 User ${name} joined room ${roomId}`);
    
    // Notify others in the room
    io.to(roomId).emit('playerJoined', { userId, name });
  });

  socket.on('startGame', ({ roomId }) => {
    console.log(`🚀 Game starting in room ${roomId}`);
    io.to(roomId).emit('gameStarted');
  });

  socket.on('nextQuestion', ({ roomId, questionIndex }) => {
    console.log(`➡️ Room ${roomId} moving to question ${questionIndex}`);
    io.to(roomId).emit('questionUpdate', { questionIndex });
  });

  socket.on('submitAnswer', ({ roomId, userId, name, score }) => {
    console.log(`📝 User ${name} submitted answer in room ${roomId}`);
    io.to(roomId).emit('answerReceived', { userId, name, score });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

function toPlain(doc) {
  if (!doc) return null;
  const plain = doc.toObject({ versionKey: false });
  plain.id = String(plain._id);
  delete plain._id;
  return plain;
}

function signToken(user) {
  return jwt.sign(
    {
      userId: String(user._id),
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function createAuthUser(user) {
  return {
    id: String(user._id),
    uid: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    photoURL: user.photoURL || null,
    avatar: user.avatar || null,
    quizzesCompleted: user.quizzesCompleted || 0,
    quizzesCreated: user.quizzesCreated || 0,
    totalScore: user.totalScore || 0,
    createdAt: user.createdAt
  };
}

function authenticateRequest(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing auth token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

async function seedAdminAccount() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: 'Admin Faithinator',
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: 'admin',
      photoURL: null,
      avatar: null
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

app.post('/api/upload', authenticateRequest, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

app.post('/api/quizzes/generate', authenticateRequest, async (req, res) => {
  try {
    const { topic, count = 5 } = req.body || {};
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    // SIMULATED AI SORCERER LOGIC
    // In a real production app, you would call Gemini API or OpenAI here.
    // We will generate high-quality questions based on the topic.
    
    const lowercaseTopic = topic.toLowerCase();
    let generatedQuestions = [];

    // Simple template-based generation for demonstration
    // A real implementation would use: const completion = await openai.chat.completions.create(...)
    for (let i = 1; i <= count; i++) {
      generatedQuestions.push({
        question: `What is a key fact about ${topic} related to aspect ${i}?`,
        options: [
          `Correct fact about ${topic}`,
          `Common misconception about ${topic}`,
          `Unrelated fact about something else`,
          `Historical myth about ${topic}`
        ],
        correctAnswer: 0
      });
    }

    // If the topic is specific, we can provide better examples
    if (lowercaseTopic.includes('space')) {
      generatedQuestions = [
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Earth", "Mars", "Jupiter", "Venus"],
          correctAnswer: 1
        },
        {
          question: "What is the largest planet in our solar system?",
          options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
          correctAnswer: 1
        },
        {
          question: "Which galaxy is the Milky Way's closest neighbor?",
          options: ["Andromeda", "Sombrero", "Triangulum", "Centaurus A"],
          correctAnswer: 0
        }
      ];
    } else if (lowercaseTopic.includes('javascript') || lowercaseTopic.includes('coding')) {
      generatedQuestions = [
        {
          question: "Which keyword is used to declare a variable that cannot be reassigned?",
          options: ["var", "let", "const", "def"],
          correctAnswer: 2
        },
        {
          question: "What does DOM stand for?",
          options: ["Data Object Model", "Document Object Model", "Digital Order Management", "Direct Object Mapping"],
          correctAnswer: 1
        },
        {
          question: "Which array method is used to add an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: 0
        }
      ];
    }

    res.json({
      success: true,
      quiz: {
        title: `All About ${topic}`,
        description: `A magical quiz generated about ${topic} by the WhizWizard AI.`,
        category: 'general',
        questions: generatedQuestions
      }
    });
  } catch (error) {
    console.error('AI Generation error:', error);
    res.status(500).json({ success: false, message: 'The Sorcerer is tired. Failed to generate quiz.' });
  }
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'admin-dashboard.html'));
});

app.get('/api/health', async (_req, res) => {
  res.json({ success: true, status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: passwordHash,
      role: 'user'
    });

    const token = signToken(user);
    return res.status(201).json({ success: true, token, user: createAuthUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ success: true, token, user: createAuthUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to login' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, photoURL } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const generatedPassword = await bcrypt.hash(`${normalizedEmail}:${Date.now()}`, 10);

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          photoURL: photoURL || null
        },
        $setOnInsert: {
          password: generatedPassword,
          role: 'user'
        }
      },
      { upsert: true, new: true }
    );

    const token = signToken(user);
    return res.json({ success: true, token, user: createAuthUser(user) });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, message: 'Failed to authenticate with Google' });
  }
});

app.get('/api/auth/me', authenticateRequest, async (req, res) => {
  const user = await User.findById(req.auth.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({ success: true, user: createAuthUser(user) });
});

app.patch('/api/auth/profile', authenticateRequest, async (req, res) => {
  try {
    const updates = req.body || {};
    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (updates.name) user.name = String(updates.name).trim();
    if (updates.photoURL !== undefined) user.photoURL = updates.photoURL;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.role && req.auth.role === 'admin') user.role = updates.role;

    await user.save();
    return res.json({ success: true, user: createAuthUser(user) });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

app.post('/api/auth/change-password', authenticateRequest, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

app.get('/api/users', authenticateRequest, requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users: users.map(createAuthUser) });
});

app.get('/api/users/:id', authenticateRequest, requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user: createAuthUser(user) });
});

app.patch('/api/users/:id', authenticateRequest, requireAdmin, async (req, res) => {
  try {
    const updates = req.body || {};
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = String(updates.email).toLowerCase().trim();
    if (updates.photoURL !== undefined) user.photoURL = updates.photoURL;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.password !== undefined) user.password = await bcrypt.hash(updates.password, 10);
    if (updates.totalScore !== undefined) user.totalScore = updates.totalScore;
    if (updates.quizzesCompleted !== undefined) user.quizzesCompleted = updates.quizzesCompleted;
    if (updates.quizzesCreated !== undefined) user.quizzesCreated = updates.quizzesCreated;

    await user.save();
    res.json({ success: true, user: createAuthUser(user) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateRequest, requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
  }

  await Promise.all([
    Quiz.deleteMany({ createdBy: String(user._id) }),
    Result.deleteMany({ userId: String(user._id) }),
    user.deleteOne()
  ]);

  res.json({ success: true });
});

app.get('/api/quizzes', async (req, res) => {
  const { category, userId, limit } = req.query;
  const query = {};

  if (category && category !== 'all') query.category = category;
  if (userId) query.createdBy = String(userId);

  let quizzes = await Quiz.find(query).sort({ createdAt: -1 });
  if (limit) quizzes = quizzes.slice(0, Number(limit));

  res.json({ success: true, quizzes: quizzes.map(toPlain) });
});

app.get('/api/quizzes/:id', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }
  res.json({ success: true, quiz: toPlain(quiz) });
});

app.post('/api/quizzes', authenticateRequest, async (req, res) => {
  try {
    const currentUser = await User.findById(req.auth.userId);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const payload = req.body || {};
    const quiz = await Quiz.create({
      title: payload.title,
      description: payload.description || '',
      category: payload.category || 'general',
      timer: Number.parseInt(payload.timer, 10) || 30,
      questions: Array.isArray(payload.questions) ? payload.questions : [],
      createdBy: String(currentUser._id),
      createdByName: currentUser.name,
      attempts: 0,
      isPublic: payload.isPublic !== false
    });

    currentUser.quizzesCreated = (currentUser.quizzesCreated || 0) + 1;
    await currentUser.save();

    res.status(201).json({ success: true, id: String(quiz._id), quiz: toPlain(quiz) });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  }
});

app.patch('/api/quizzes/:id', authenticateRequest, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (String(quiz.createdBy) !== String(req.auth.userId) && req.auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    const updates = req.body || {};
    if (updates.title !== undefined) quiz.title = updates.title;
    if (updates.description !== undefined) quiz.description = updates.description;
    if (updates.category !== undefined) quiz.category = updates.category;
    if (updates.timer !== undefined) quiz.timer = Number.parseInt(updates.timer, 10) || quiz.timer;
    if (updates.questions !== undefined) quiz.questions = updates.questions;
    if (updates.isPublic !== undefined) quiz.isPublic = updates.isPublic;
    if (updates.attempts !== undefined) quiz.attempts = updates.attempts;

    await quiz.save();
    res.json({ success: true, quiz: toPlain(quiz) });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  }
});

app.delete('/api/quizzes/:id', authenticateRequest, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (String(quiz.createdBy) !== String(req.auth.userId) && req.auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    await Promise.all([
      Result.deleteMany({ quizId: String(quiz._id) }),
      quiz.deleteOne()
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
});

app.post('/api/quizzes/:id/attempt', authenticateRequest, async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }

  quiz.attempts = (quiz.attempts || 0) + 1;
  await quiz.save();
  res.json({ success: true, quiz: toPlain(quiz) });
});

app.get('/api/results', async (req, res) => {
  const { userId, quizId, limit } = req.query;
  const query = {};

  if (userId) query.userId = String(userId);
  if (quizId) query.quizId = String(quizId);

  let results = await Result.find(query).sort({ createdAt: -1 });
  if (limit) results = results.slice(0, Number(limit));

  res.json({ success: true, results: results.map(toPlain) });
});

app.post('/api/results', authenticateRequest, async (req, res) => {
  try {
    const currentUser = await User.findById(req.auth.userId);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const payload = req.body || {};
    const result = await Result.create({
      quizId: String(payload.quizId),
      quizTitle: payload.quizTitle || '',
      userId: String(currentUser._id),
      userName: currentUser.name,
      score: Number(payload.score) || 0,
      correctAnswers: Number(payload.correctAnswers) || 0,
      wrongAnswers: Number(payload.wrongAnswers) || 0,
      totalQuestions: Number(payload.totalQuestions) || 0,
      percentage: Number(payload.percentage) || Number(payload.score) || 0,
      timeTaken: Number(payload.timeTaken) || 0,
      answers: Array.isArray(payload.answers) ? payload.answers : []
    });

    await Quiz.findByIdAndUpdate(payload.quizId, { $inc: { attempts: 1 } });
    currentUser.quizzesCompleted = (currentUser.quizzesCompleted || 0) + 1;
    currentUser.totalScore = (currentUser.totalScore || 0) + (Number(payload.score) || 0);
    await currentUser.save();

    res.status(201).json({ success: true, id: String(result._id), result: toPlain(result) });
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ success: false, message: 'Failed to save result' });
  }
});

app.get('/api/results/leaderboard', async (req, res) => {
  const { quizId, limit = 10 } = req.query;
  const query = {};
  if (quizId) query.quizId = String(quizId);

  const results = await Result.find(query)
    .sort({ score: -1, timeTaken: 1, createdAt: -1 })
    .limit(Number(limit));

  res.json({ success: true, results: results.map(toPlain) });
});

app.get('/api/results/global-leaderboard', async (req, res) => {
  const { limit = 10 } = req.query;
  const results = await Result.find({})
    .sort({ score: -1, timeTaken: 1, createdAt: -1 })
    .limit(Number(limit));

  res.json({ success: true, results: results.map(toPlain) });
});

app.post('/api/live-rooms', authenticateRequest, async (req, res) => {
  try {
    const currentUser = await User.findById(req.auth.userId);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const payload = req.body || {};
    const roomCode = String(payload.roomCode || '').trim().toUpperCase() || String(Date.now()).slice(-6).toUpperCase();
    const room = await LiveRoom.create({
      quizId: String(payload.quizId),
      quizTitle: payload.quizTitle || '',
      hostId: String(currentUser._id),
      hostName: currentUser.name,
      roomCode,
      status: 'waiting',
      participants: [],
      maxParticipants: Number(payload.maxParticipants) || 50,
      currentQuestion: 0
    });

    res.status(201).json({ success: true, id: String(room._id), room: toPlain(room) });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Failed to create room' });
  }
});

app.get('/api/live-rooms/:id', authenticateRequest, async (req, res) => {
  const room = await LiveRoom.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  res.json({ success: true, room: toPlain(room) });
});

app.post('/api/live-rooms/join', authenticateRequest, async (req, res) => {
  try {
    const { roomCode, participantName } = req.body || {};
    if (!roomCode || !participantName) {
      return res.status(400).json({ success: false, message: 'Room code and participant name are required' });
    }

    const room = await LiveRoom.findOne({ roomCode: String(roomCode).toUpperCase(), status: { $ne: 'finished' } });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found or already finished' });
    }

    if ((room.participants || []).length >= room.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Room is full' });
    }

    const participant = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: String(participantName).trim(),
      score: 0,
      joinedAt: new Date().toISOString()
    };

    room.participants.push(participant);
    await room.save();

    res.json({ success: true, roomId: String(room._id), room: toPlain(room), participant });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ success: false, message: 'Failed to join room' });
  }
});

app.patch('/api/live-rooms/:id/status', authenticateRequest, async (req, res) => {
  try {
    const room = await LiveRoom.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (String(room.hostId) !== String(req.auth.userId) && req.auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    room.status = req.body?.status || room.status;
    if (req.body?.currentQuestion !== undefined) {
      room.currentQuestion = Number(req.body.currentQuestion) || 0;
    }
    await room.save();

    res.json({ success: true, room: toPlain(room) });
  } catch (error) {
    console.error('Update room status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update room' });
  }
});

app.delete('/api/live-rooms/:id', authenticateRequest, async (req, res) => {
  try {
    const room = await LiveRoom.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (String(room.hostId) !== String(req.auth.userId) && req.auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await room.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room' });
  }
});

app.get('/api/live-rooms/code/:roomCode', authenticateRequest, async (req, res) => {
  const room = await LiveRoom.findOne({ roomCode: String(req.params.roomCode).toUpperCase() });
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  res.json({ success: true, room: toPlain(room) });
});

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    await seedAdminAccount();

    server.listen(PORT, () => {
      console.log(`WhizWizard server running at http://localhost:${PORT}`);
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
