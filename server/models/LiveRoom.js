const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

const answerSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    answerIndex: {
        type: Number,
        required: true,
        min: -1,
        max: 3
    },
    timeTaken: {
        type: Number,
        required: true,
        min: 0
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    answeredAt: {
        type: Date,
        default: Date.now
    }
});

const liveRoomSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        length: 6
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'in-progress', 'finished'],
        default: 'waiting'
    },
    players: [playerSchema],
    currentQuestion: {
        type: Number,
        default: -1
    },
    answers: {
        type: Map,
        of: [answerSchema],
        default: {}
    },
    startedAt: {
        type: Date,
        default: null
    },
    finishedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
liveRoomSchema.index({ code: 1 });
liveRoomSchema.index({ host: 1, status: 1 });
liveRoomSchema.index({ createdAt: 1 });

// Auto-delete rooms older than 24 hours
liveRoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('LiveRoom', liveRoomSchema);
