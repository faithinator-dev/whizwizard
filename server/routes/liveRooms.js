const express = require('express');
const router = express.Router();
const {
    createRoom,
    joinRoom,
    getRoom,
    startQuiz,
    submitAnswer,
    nextQuestion,
    getLeaderboard,
    deleteRoom
} = require('../controllers/liveRoomController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, createRoom);
router.post('/:code/join', protect, joinRoom);
router.get('/:id', protect, getRoom);
router.post('/:id/start', protect, startQuiz);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/next', protect, nextQuestion);
router.get('/:id/leaderboard', protect, getLeaderboard);
router.delete('/:id', protect, deleteRoom);

module.exports = router;
