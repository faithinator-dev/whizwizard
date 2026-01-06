const { getFirestore } = require('../config/database');

class Quiz {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.timer = data.timer;
        this.questions = data.questions || [];
        this.createdBy = data.createdBy;
        this.attempts = data.attempts || 0;
        this.averageScore = data.averageScore || 0;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validate quiz data
    static validate(data) {
        const errors = [];

        if (!data.title || data.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters');
        }
        if (data.title && data.title.length > 100) {
            errors.push('Title cannot exceed 100 characters');
        }
        if (!data.description || data.description.trim().length === 0) {
            errors.push('Description is required');
        }
        if (data.description && data.description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }
        if (!['Science', 'History', 'Technology', 'General Knowledge'].includes(data.category)) {
            errors.push('Invalid category');
        }
        if (!data.timer || data.timer < 5 || data.timer > 300) {
            errors.push('Timer must be between 5 and 300 seconds');
        }
        if (!data.questions || data.questions.length < 1) {
            errors.push('Quiz must have at least 1 question');
        }

        // Validate each question
        if (data.questions) {
            data.questions.forEach((q, index) => {
                if (!q.question || q.question.trim().length === 0) {
                    errors.push(`Question ${index + 1}: Question text is required`);
                }
                if (!q.options || q.options.length !== 4) {
                    errors.push(`Question ${index + 1}: Must have exactly 4 options`);
                }
                if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
                    errors.push(`Question ${index + 1}: Correct answer must be between 0 and 3`);
                }
            });
        }

        return errors;
    }

    // Save quiz to Firestore
    async save() {
        const db = getFirestore();
        const quizData = {
            title: this.title,
            description: this.description,
            category: this.category,
            timer: this.timer,
            questions: this.questions,
            createdBy: this.createdBy,
            attempts: this.attempts,
            averageScore: this.averageScore,
            updatedAt: new Date()
        };

        if (this.id) {
            // Update existing quiz
            await db.collection('quizzes').doc(this.id).update(quizData);
        } else {
            // Create new quiz
            quizData.createdAt = new Date();
            const docRef = await db.collection('quizzes').add(quizData);
            this.id = docRef.id;
            this.createdAt = quizData.createdAt;
        }

        return this;
    }

    // Find quiz by ID
    static async findById(id) {
        const db = getFirestore();
        const doc = await db.collection('quizzes').doc(id).get();
        
        if (!doc.exists) {
            return null;
        }

        return new Quiz({
            id: doc.id,
            ...doc.data()
        });
    }

    // Find all quizzes with optional filters
    static async find(filters = {}) {
        const db = getFirestore();
        let query = db.collection('quizzes');

        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
        if (filters.createdBy) {
            query = query.where('createdBy', '==', filters.createdBy);
        }

        query = query.orderBy('createdAt', 'desc');

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        
        return snapshot.docs.map(doc => new Quiz({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Get all quizzes
    static async findAll() {
        return await Quiz.find();
    }

    // Find quizzes by creator
    static async findByCreator(userId) {
        return await Quiz.find({ createdBy: userId });
    }

    // Find quizzes by category
    static async findByCategory(category) {
        return await Quiz.find({ category });
    }

    // Update quiz statistics
    async updateStats(score, totalQuestions) {
        const db = getFirestore();
        this.attempts += 1;
        const percentage = (score / totalQuestions) * 100;
        this.averageScore = ((this.averageScore * (this.attempts - 1)) + percentage) / this.attempts;
        
        await db.collection('quizzes').doc(this.id).update({
            attempts: this.attempts,
            averageScore: this.averageScore,
            updatedAt: new Date()
        });
    }

    // Delete quiz
    static async deleteById(id) {
        const db = getFirestore();
        await db.collection('quizzes').doc(id).delete();
    }
}

module.exports = Quiz;
