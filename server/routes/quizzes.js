const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getQuizzes,
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getMyQuizzes
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getQuizzes);
router.get('/:id', getQuiz);

// Protected routes
router.post('/', protect, [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('category').isIn(['Science', 'History', 'Technology', 'General Knowledge']).withMessage('Invalid category'),
    body('timer').isInt({ min: 5, max: 300 }).withMessage('Timer must be between 5 and 300 seconds'),
    body('questions').isArray({ min: 1 }).withMessage('Quiz must have at least 1 question')
], createQuiz);

router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);
router.get('/user/my-quizzes', protect, getMyQuizzes);

module.exports = router;
