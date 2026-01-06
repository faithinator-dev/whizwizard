const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
exports.getQuizzes = async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let filters = {};
        
        if (category && category !== 'all') {
            filters.category = category;
        }

        let quizzes = await Quiz.find(filters);

        // Client-side filtering for search (Firestore doesn't support regex)
        if (search) {
            const searchLower = search.toLowerCase();
            quizzes = quizzes.filter(quiz => 
                quiz.title.toLowerCase().includes(searchLower) ||
                quiz.description.toLowerCase().includes(searchLower)
            );
        }

        // Populate creator info
        for (let quiz of quizzes) {
            const creator = await User.findById(quiz.createdBy);
            quiz.createdBy = creator ? { 
                id: creator.id,
                name: creator.name, 
                email: creator.email 
            } : null;
        }

        res.json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Populate creator info
        const creator = await User.findById(quiz.createdBy);
        if (creator) {
            quiz.createdBy = {
                id: creator.id,
                name: creator.name,
                email: creator.email
            };
        }

        res.json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private
exports.createQuiz = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const quizData = {
            ...req.body,
            createdBy: req.user.id
        };

        // Validate quiz data
        const validationErrors = Quiz.validate(quizData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors.map(err => ({ msg: err }))
            });
        }

        const quiz = new Quiz(quizData);
        await quiz.save();

        // Update user's quiz count
        const user = await User.findById(req.user.id);
        if (user) {
            user.quizzesCreated += 1;
            await user.save();
        }

        res.status(201).json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during quiz creation'
        });
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private
exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Check ownership
        if (quiz.createdBy !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this quiz'
            });
        }

        // Update quiz fields
        Object.assign(quiz, req.body);
        await quiz.save();

        res.json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during quiz update'
        });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Check ownership
        if (quiz.createdBy !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this quiz'
            });
        }

        await Quiz.deleteById(req.params.id);

        // Update user's quiz count
        const user = await User.findById(req.user.id);
        if (user) {
            user.quizzesCreated = Math.max(0, user.quizzesCreated - 1);
            await user.save();
        }

        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during quiz deletion'
        });
    }
};

// @desc    Get user's quizzes
// @route   GET /api/quizzes/user/my-quizzes
// @access  Private
exports.getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findByCreator(req.user.id);

        res.json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Get my quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
