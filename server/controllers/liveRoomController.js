const LiveRoom = require('../models/LiveRoom');
const Quiz = require('../models/Quiz');

// Generate random 6-character code
const generateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

// @desc    Create live room
// @route   POST /api/live-rooms
// @access  Private
exports.createRoom = async (req, res) => {
    try {
        const { quizId } = req.body;

        // Verify quiz exists and user owns it
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create room for this quiz'
            });
        }

        // Generate unique code
        let code;
        let codeExists = true;
        while (codeExists) {
            code = generateCode();
            const existing = await LiveRoom.findOne({ code });
            if (!existing) codeExists = false;
        }

        // Create room
        const room = await LiveRoom.create({
            code,
            quiz: quizId,
            host: req.user._id,
            players: [],
            currentQuestion: -1,
            answers: {}
        });

        const populatedRoom = await LiveRoom.findById(room._id)
            .populate('quiz', 'title description category questions')
            .populate('host', 'name email');

        res.status(201).json({
            success: true,
            room: populatedRoom
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during room creation'
        });
    }
};

// @desc    Join live room
// @route   POST /api/live-rooms/:code/join
// @access  Private
exports.joinRoom = async (req, res) => {
    try {
        const { code } = req.params;

        const room = await LiveRoom.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found with this code'
            });
        }

        if (room.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                message: 'Room is not accepting players'
            });
        }

        // Check if already joined
        const alreadyJoined = room.players.some(
            p => p.userId.toString() === req.user._id.toString()
        );

        if (alreadyJoined) {
            return res.status(400).json({
                success: false,
                message: 'You have already joined this room'
            });
        }

        // Add player
        room.players.push({
            userId: req.user._id,
            name: req.user.name,
            points: 0
        });

        await room.save();

        const populatedRoom = await LiveRoom.findById(room._id)
            .populate('quiz', 'title description category questions')
            .populate('host', 'name email');

        res.json({
            success: true,
            room: populatedRoom
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during room join'
        });
    }
};

// @desc    Get room details
// @route   GET /api/live-rooms/:id
// @access  Private
exports.getRoom = async (req, res) => {
    try {
        const room = await LiveRoom.findById(req.params.id)
            .populate('quiz', 'title description category questions')
            .populate('host', 'name email');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            room
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Start quiz
// @route   POST /api/live-rooms/:id/start
// @access  Private (Host only)
exports.startQuiz = async (req, res) => {
    try {
        const room = await LiveRoom.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Verify host
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the host can start the quiz'
            });
        }

        if (room.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                message: 'Quiz has already been started'
            });
        }

        if (room.players.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Need at least one player to start'
            });
        }

        room.status = 'in-progress';
        room.currentQuestion = 0;
        room.startedAt = new Date();

        await room.save();

        const populatedRoom = await LiveRoom.findById(room._id)
            .populate('quiz', 'title description category questions')
            .populate('host', 'name email');

        res.json({
            success: true,
            room: populatedRoom
        });
    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Submit answer
// @route   POST /api/live-rooms/:id/answer
// @access  Private
exports.submitAnswer = async (req, res) => {
    try {
        const { questionIndex, answerIndex, timeTaken } = req.body;

        const room = await LiveRoom.findById(req.params.id).populate('quiz');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (room.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Quiz is not in progress'
            });
        }

        // Get player
        const player = room.players.find(
            p => p.userId.toString() === req.user._id.toString()
        );

        if (!player) {
            return res.status(400).json({
                success: false,
                message: 'You are not in this room'
            });
        }

        // Get question
        const question = room.quiz.questions[questionIndex];
        const isCorrect = answerIndex === question.correctAnswer;

        // Calculate points (1000 base + speed bonus)
        let points = 0;
        if (isCorrect) {
            const LIVE_TIMER = 12;
            points = 1000 + Math.max(0, (LIVE_TIMER - timeTaken) * 50);
            player.points += points;
        }

        // Store answer
        const questionKey = questionIndex.toString();
        if (!room.answers.has(questionKey)) {
            room.answers.set(questionKey, []);
        }

        const answers = room.answers.get(questionKey);
        
        // Check if already answered
        const alreadyAnswered = answers.some(
            a => a.playerId.toString() === req.user._id.toString()
        );

        if (!alreadyAnswered) {
            answers.push({
                playerId: req.user._id,
                answerIndex,
                timeTaken,
                isCorrect,
                points
            });
            room.answers.set(questionKey, answers);
        }

        await room.save();

        res.json({
            success: true,
            isCorrect,
            points,
            correctAnswer: question.correctAnswer
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Next question
// @route   POST /api/live-rooms/:id/next
// @access  Private (Host only)
exports.nextQuestion = async (req, res) => {
    try {
        const room = await LiveRoom.findById(req.params.id).populate('quiz');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Verify host
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the host can advance questions'
            });
        }

        if (room.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Quiz is not in progress'
            });
        }

        // Check if there are more questions
        if (room.currentQuestion >= room.quiz.questions.length - 1) {
            room.status = 'finished';
            room.finishedAt = new Date();
        } else {
            room.currentQuestion += 1;
        }

        await room.save();

        const populatedRoom = await LiveRoom.findById(room._id)
            .populate('quiz', 'title description category questions')
            .populate('host', 'name email');

        res.json({
            success: true,
            room: populatedRoom
        });
    } catch (error) {
        console.error('Next question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get leaderboard
// @route   GET /api/live-rooms/:id/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
    try {
        const { questionIndex } = req.query;

        const room = await LiveRoom.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Get leaderboard
        let leaderboard = room.players
            .map(p => ({
                id: p.userId,
                name: p.name,
                points: p.points
            }))
            .sort((a, b) => b.points - a.points);

        // Limit to top 10 if specified
        if (questionIndex !== undefined) {
            leaderboard = leaderboard.slice(0, 10);
        }

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete room
// @route   DELETE /api/live-rooms/:id
// @access  Private (Host only)
exports.deleteRoom = async (req, res) => {
    try {
        const room = await LiveRoom.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Verify host
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the host can delete the room'
            });
        }

        await room.deleteOne();

        res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
