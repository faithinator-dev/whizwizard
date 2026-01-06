const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    wrongAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1
    },
    timeTaken: {
        type: Number,
        required: true,
        min: 0
    },
    answers: {
        type: [Number],
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
resultSchema.index({ quiz: 1, user: 1 });
resultSchema.index({ user: 1, createdAt: -1 });
resultSchema.index({ score: -1 });

module.exports = mongoose.model('Result', resultSchema);
