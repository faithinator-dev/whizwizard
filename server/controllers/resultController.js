const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const GradeScale = require('../models/GradeScale');

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

        // Validate result data
        const resultData = {
            quiz: quizId,
            user: req.user.id,
            score,
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            timeTaken,
            answers
        };

        // Calculate percentage and grade if quiz has grading level
        const percentage = (correctAnswers / totalQuestions) * 100;
        resultData.percentage = percentage;

        if (quiz.gradingLevel) {
            const grade = GradeScale.calculateGrade(percentage, quiz.gradingLevel);
            resultData.grade = grade;
        }

        const validationErrors = Result.validate(resultData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors.map(err => ({ msg: err }))
            });
        }

        // Create result
        const result = new Result(resultData);
        await result.save();

        // Update quiz statistics
        await quiz.updateStats(score, totalQuestions);

        // Update user stats
        const user = await User.findById(req.user.id);
        if (user) {
            user.quizzesCompleted += 1;
            user.totalScore += score;
            await user.save();
        }

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
        const results = await Result.findByQuiz(req.params.quizId);

        // Populate user info for each result
        for (let result of results) {
            const user = await User.findById(result.user);
            if (user) {
                result.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
            }
        }

        // Sort by score descending, then by creation date
        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

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
        const results = await Result.findByUser(req.user.id);

        // Populate quiz info for each result
        for (let result of results) {
            const quiz = await Quiz.findById(result.quiz);
            if (quiz) {
                result.quiz = {
                    id: quiz.id,
                    title: quiz.title,
                    category: quiz.category
                };
            }
        }

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
        const users = await User.findAll();

        // Sort by total score descending
        const leaderboard = users
            .map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                totalScore: user.totalScore,
                quizzesCompleted: user.quizzesCompleted
            }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 50);

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
