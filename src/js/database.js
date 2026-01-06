// =====================
// Database Management System
// Using LocalStorage for data persistence
// =====================

const Database = {
    // Initialize database
    init() {
        if (!localStorage.getItem('quizzes')) {
            localStorage.setItem('quizzes', JSON.stringify([]));
        }
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('results')) {
            localStorage.setItem('results', JSON.stringify([]));
        }
        if (!localStorage.getItem('currentUser')) {
            // Create default user
            const defaultUser = {
                id: this.generateId(),
                name: 'Guest User',
                email: 'guest@quizmaster.com',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(defaultUser));
            this.saveUser(defaultUser);
        }
    },

    // Generate unique ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // =====================
    // Quiz Operations
    // =====================

    // Get all quizzes
    getAllQuizzes() {
        const quizzes = localStorage.getItem('quizzes');
        return quizzes ? JSON.parse(quizzes) : [];
    },

    // Get quiz by ID
    getQuizById(quizId) {
        const quizzes = this.getAllQuizzes();
        return quizzes.find(quiz => quiz.id === quizId);
    },

    // Get quizzes by category
    getQuizzesByCategory(category) {
        const quizzes = this.getAllQuizzes();
        if (category === 'all') return quizzes;
        return quizzes.filter(quiz => quiz.category === category);
    },

    // Get quizzes by user
    getQuizzesByUser(userId) {
        const quizzes = this.getAllQuizzes();
        return quizzes.filter(quiz => quiz.createdBy === userId);
    },

    // Save new quiz
    saveQuiz(quizData) {
        const quizzes = this.getAllQuizzes();
        const currentUser = this.getCurrentUser();
        
        const newQuiz = {
            id: this.generateId(),
            title: quizData.title,
            description: quizData.description,
            category: quizData.category,
            timer: parseInt(quizData.timer),
            questions: quizData.questions,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            attempts: 0
        };

        quizzes.push(newQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        return newQuiz;
    },

    // Update quiz
    updateQuiz(quizId, quizData) {
        const quizzes = this.getAllQuizzes();
        const index = quizzes.findIndex(quiz => quiz.id === quizId);
        
        if (index !== -1) {
            quizzes[index] = {
                ...quizzes[index],
                ...quizData,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            return quizzes[index];
        }
        return null;
    },

    // Delete quiz
    deleteQuiz(quizId) {
        const quizzes = this.getAllQuizzes();
        const filtered = quizzes.filter(quiz => quiz.id !== quizId);
        localStorage.setItem('quizzes', JSON.stringify(filtered));
        
        // Also delete related results
        const results = this.getAllResults();
        const filteredResults = results.filter(result => result.quizId !== quizId);
        localStorage.setItem('results', JSON.stringify(filteredResults));
        
        return true;
    },

    // Increment quiz attempts
    incrementQuizAttempts(quizId) {
        const quizzes = this.getAllQuizzes();
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz) {
            quiz.attempts = (quiz.attempts || 0) + 1;
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
        }
    },

    // =====================
    // User Operations
    // =====================

    // Get all users
    getAllUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Save user
    saveUser(userData) {
        const users = this.getAllUsers();
        const existingIndex = users.findIndex(u => u.id === userData.id);
        
        if (existingIndex !== -1) {
            users[existingIndex] = userData;
        } else {
            users.push(userData);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        return userData;
    },

    // Update current user
    updateCurrentUser(userData) {
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.saveUser(updatedUser);
        return updatedUser;
    },

    // =====================
    // Results Operations
    // =====================

    // Get all results
    getAllResults() {
        const results = localStorage.getItem('results');
        return results ? JSON.parse(results) : [];
    },

    // Get results by user
    getResultsByUser(userId) {
        const results = this.getAllResults();
        return results.filter(result => result.userId === userId);
    },

    // Get results by quiz
    getResultsByQuiz(quizId) {
        const results = this.getAllResults();
        return results.filter(result => result.quizId === quizId);
    },

    // Save result
    saveResult(resultData) {
        const results = this.getAllResults();
        const currentUser = this.getCurrentUser();
        
        const newResult = {
            id: this.generateId(),
            quizId: resultData.quizId,
            userId: currentUser.id,
            score: resultData.score,
            correctAnswers: resultData.correctAnswers,
            wrongAnswers: resultData.wrongAnswers,
            totalQuestions: resultData.totalQuestions,
            timeTaken: resultData.timeTaken,
            answers: resultData.answers,
            completedAt: new Date().toISOString()
        };

        results.push(newResult);
        localStorage.setItem('results', JSON.stringify(results));
        
        // Increment quiz attempts
        this.incrementQuizAttempts(resultData.quizId);
        
        return newResult;
    },

    // Get user's best score for a quiz
    getUserBestScore(userId, quizId) {
        const results = this.getAllResults();
        const userQuizResults = results.filter(
            r => r.userId === userId && r.quizId === quizId
        );
        
        if (userQuizResults.length === 0) return null;
        
        return Math.max(...userQuizResults.map(r => r.score));
    },

    // =====================
    // Statistics Operations
    // =====================

    // Get total quizzes count
    getTotalQuizzes() {
        return this.getAllQuizzes().length;
    },

    // Get total users count
    getTotalUsers() {
        return this.getAllUsers().length;
    },

    // Get total completed quizzes count
    getTotalCompleted() {
        return this.getAllResults().length;
    },

    // Get leaderboard data
    getLeaderboard() {
        const users = this.getAllUsers();
        const results = this.getAllResults();
        
        const leaderboard = users.map(user => {
            const userResults = results.filter(r => r.userId === user.id);
            const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
            const quizzesCompleted = userResults.length;
            const avgScore = quizzesCompleted > 0 ? 
                Math.round(totalScore / quizzesCompleted) : 0;
            
            return {
                id: user.id,
                name: user.name,
                totalScore,
                quizzesCompleted,
                avgScore
            };
        });
        
        // Sort by total score descending
        return leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    },

    // Get user statistics
    getUserStats(userId) {
        const results = this.getResultsByUser(userId);
        const quizzes = this.getQuizzesByUser(userId);
        
        const totalAttempts = results.length;
        const totalCreated = quizzes.length;
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const avgScore = totalAttempts > 0 ? 
            Math.round(totalScore / totalAttempts) : 0;
        
        return {
            totalAttempts,
            totalCreated,
            totalScore,
            avgScore
        };
    },

    // =====================
    // Utility Functions
    // =====================

    // Clear all data
    clearAll() {
        localStorage.removeItem('quizzes');
        localStorage.removeItem('users');
        localStorage.removeItem('results');
        localStorage.removeItem('currentUser');
        this.init();
    },

    // Export data
    exportData() {
        return {
            quizzes: this.getAllQuizzes(),
            users: this.getAllUsers(),
            results: this.getAllResults(),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.quizzes) {
            localStorage.setItem('quizzes', JSON.stringify(data.quizzes));
        }
        if (data.users) {
            localStorage.setItem('users', JSON.stringify(data.users));
        }
        if (data.results) {
            localStorage.setItem('results', JSON.stringify(data.results));
        }
    },

    // Search quizzes
    searchQuizzes(query) {
        const quizzes = this.getAllQuizzes();
        const lowerQuery = query.toLowerCase();
        
        return quizzes.filter(quiz => 
            quiz.title.toLowerCase().includes(lowerQuery) ||
            quiz.description.toLowerCase().includes(lowerQuery) ||
            quiz.category.toLowerCase().includes(lowerQuery)
        );
    }
};

// Initialize database on load
Database.init();

// Make Database available globally
window.Database = Database;
