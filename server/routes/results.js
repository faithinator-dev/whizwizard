const express = require('express');
const router = express.Router();
const {
    submitResult,
    getResultsByQuiz,
    getResultsByUser,
    getLeaderboard
} = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, submitResult);
router.get('/quiz/:quizId', protect, getResultsByQuiz);
router.get('/user/my-results', protect, getResultsByUser);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
