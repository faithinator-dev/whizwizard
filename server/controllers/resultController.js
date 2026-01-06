const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Submit quiz result
// @route   POST /api/results
// @access  Private
exports.submitResult = async (req, res) => {
    try {
        const { quizId, score, correctAnswers, wrongAnswers, totalQuestions, timeTaken, answers } = req.body;

        // Verify quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Create result
        const result = await Result.create({
            quiz: quizId,
            user: req.user._id,
            score,
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            timeTaken,
            answers
        });

        // Update quiz attempts and average score
        const allResults = await Result.find({ quiz: quizId });
        const averageScore = allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length;
        
        await Quiz.findByIdAndUpdate(quizId, {
            $inc: { attempts: 1 },
            averageScore: Math.round(averageScore)
        });

        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 
                quizzesCompleted: 1,
                totalScore: score
            }
        });

        res.status(201).json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Submit result error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during result submission'
        });
    }
};

// @desc    Get results by quiz
// @route   GET /api/results/quiz/:quizId
// @access  Private
exports.getResultsByQuiz = async (req, res) => {
    try {
        const results = await Result.find({ quiz: req.params.quizId })
            .populate('user', 'name email')
            .sort({ score: -1, createdAt: -1 });

        res.json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        console.error('Get results by quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's results
// @route   GET /api/results/user/my-results
// @access  Private
exports.getResultsByUser = async (req, res) => {
    try {
        const results = await Result.find({ user: req.user._id })
            .populate('quiz', 'title category')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        console.error('Get results by user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get leaderboard
// @route   GET /api/results/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find()
            .select('name email totalScore quizzesCompleted')
            .sort({ totalScore: -1 })
            .limit(50);

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
