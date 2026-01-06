const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function(v) {
                return v.length === 4;
            },
            message: 'Each question must have exactly 4 options'
        }
    },
    correctAnswer: {
        type: Number,
        required: [true, 'Correct answer index is required'],
        min: 0,
        max: 3
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Quiz description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Science', 'History', 'Technology', 'General Knowledge']
    },
    timer: {
        type: Number,
        required: [true, 'Timer is required'],
        min: [5, 'Timer must be at least 5 seconds'],
        max: [300, 'Timer cannot exceed 300 seconds']
    },
    questions: {
        type: [questionSchema],
        required: [true, 'Questions are required'],
        validate: {
            validator: function(v) {
                return v.length >= 1;
            },
            message: 'Quiz must have at least 1 question'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
quizSchema.index({ category: 1, createdAt: -1 });
quizSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
