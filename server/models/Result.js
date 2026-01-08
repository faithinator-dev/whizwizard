const { getFirestore } = require('../config/database');

class Result {
    constructor(data) {
        this.id = data.id || null;
        this.quiz = data.quiz;
        this.user = data.user;
        this.score = data.score;
        this.correctAnswers = data.correctAnswers;
        this.wrongAnswers = data.wrongAnswers;
        this.totalQuestions = data.totalQuestions;
        this.timeTaken = data.timeTaken;
        this.answers = data.answers || [];
        this.grade = data.grade || null; // Grade object with grade, description, points/gpa
        this.percentage = data.percentage || 0;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validate result data
    static validate(data) {
        const errors = [];

        if (!data.quiz) {
            errors.push('Quiz ID is required');
        }
        if (!data.user) {
            errors.push('User ID is required');
        }
        if (data.score === undefined || data.score < 0) {
            errors.push('Score must be a positive number');
        }
        if (data.correctAnswers === undefined || data.correctAnswers < 0) {
            errors.push('Correct answers must be a positive number');
        }
        if (data.wrongAnswers === undefined || data.wrongAnswers < 0) {
            errors.push('Wrong answers must be a positive number');
        }
        if (!data.totalQuestions || data.totalQuestions < 1) {
            errors.push('Total questions must be at least 1');
        }
        if (data.timeTaken === undefined || data.timeTaken < 0) {
            errors.push('Time taken must be a positive number');
        }
        if (!data.answers || !Array.isArray(data.answers)) {
            errors.push('Answers array is required');
        }

        return errors;
    }

    // Save result to Firestore
    async save() {
        const db = getFirestore();
        const resultData = {
            quiz: this.quiz,
            user: this.user,
            score: this.score,
            correctAnswers: this.correctAnswers,
            wrongAnswers: this.wrongAnswers,
            totalQuestions: this.totalQuestions,
            timeTaken: this.timeTaken,
            answers: this.answers,
            grade: this.grade,
            percentage: this.percentage,
            updatedAt: new Date()
        };

        if (this.id) {
            // Update existing result
            await db.collection('results').doc(this.id).update(resultData);
        } else {
            // Create new result
            resultData.createdAt = new Date();
            const docRef = await db.collection('results').add(resultData);
            this.id = docRef.id;
            this.createdAt = resultData.createdAt;
        }

        return this;
    }

    // Find result by ID
    static async findById(id) {
        const db = getFirestore();
        const doc = await db.collection('results').doc(id).get();
        
        if (!doc.exists) {
            return null;
        }

        return new Result({
            id: doc.id,
            ...doc.data()
        });
    }

    // Find results with filters
    static async find(filters = {}) {
        const db = getFirestore();
        let query = db.collection('results');

        if (filters.quiz) {
            query = query.where('quiz', '==', filters.quiz);
        }
        if (filters.user) {
            query = query.where('user', '==', filters.user);
        }

        // Sort by creation date (newest first)
        query = query.orderBy('createdAt', 'desc');

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        
        return snapshot.docs.map(doc => new Result({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Find results by user
    static async findByUser(userId) {
        return await Result.find({ user: userId });
    }

    // Find results by quiz
    static async findByQuiz(quizId) {
        return await Result.find({ quiz: quizId });
    }

    // Get leaderboard for a quiz (top scores)
    static async getLeaderboard(quizId, limit = 10) {
        const db = getFirestore();
        const snapshot = await db.collection('results')
            .where('quiz', '==', quizId)
            .orderBy('score', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Result({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Get user statistics
    static async getUserStats(userId) {
        const results = await Result.findByUser(userId);
        
        if (results.length === 0) {
            return {
                totalQuizzes: 0,
                totalScore: 0,
                averageScore: 0,
                averageAccuracy: 0
            };
        }

        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
        const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);

        return {
            totalQuizzes: results.length,
            totalScore: totalScore,
            averageScore: totalScore / results.length,
            averageAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
        };
    }

    // Delete result
    static async deleteById(id) {
        const db = getFirestore();
        await db.collection('results').doc(id).delete();
    }
}

module.exports = Result;
