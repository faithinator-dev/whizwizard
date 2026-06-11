// =====================
// Live Quiz System
// Real-time quiz rooms with join codes
// =====================

const LiveQuiz = {
    LIVE_TIMER: 12, // seconds per question for live quizzes
    LEADERBOARD_DELAY: 5, // seconds to show leaderboard
    POLL_INTERVAL: 500, // milliseconds to check for updates

    // Generate join code
    generateJoinCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Create live quiz room
    createRoom(quizId) {
        const quiz = Database.getQuizById(quizId);
        if (!quiz) return null;

        const currentUser = Auth.getAuthUser();
        const code = this.generateJoinCode();

        const room = {
            id: Database.generateId(),
            code: code,
            quizId: quizId,
            hostId: currentUser.id,
            hostName: currentUser.name,
            status: 'waiting', // waiting, in-progress, finished
            currentQuestion: -1,
            players: [],
            responses: {},
            scores: {},
            createdAt: new Date().toISOString(),
            startedAt: null,
            questionStartTime: null
        };

        // Save room to localStorage
        const rooms = this.getAllRooms();
        rooms.push(room);
        localStorage.setItem('liveQuizRooms', JSON.stringify(rooms));

        return room;
    },

    // Get all rooms
    getAllRooms() {
        const rooms = localStorage.getItem('liveQuizRooms');
        return rooms ? JSON.parse(rooms) : [];
    },

    // Get room by code
    getRoomByCode(code) {
        const rooms = this.getAllRooms();
        return rooms.find(r => r.code.toUpperCase() === code.toUpperCase());
    },

    // Get room by ID
    getRoomById(roomId) {
        const rooms = this.getAllRooms();
        return rooms.find(r => r.id === roomId);
    },

    // Update room
    updateRoom(roomId, updates) {
        const rooms = this.getAllRooms();
        const index = rooms.findIndex(r => r.id === roomId);
        
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...updates };
            localStorage.setItem('liveQuizRooms', JSON.stringify(rooms));
            return rooms[index];
        }
        return null;
    },

    // Join room
    joinRoom(code) {
        const room = this.getRoomByCode(code);
        if (!room) {
            return { success: false, message: 'Room not found' };
        }

        if (room.status !== 'waiting') {
            return { success: false, message: 'Quiz already started or finished' };
        }

        const currentUser = Auth.getAuthUser();
        
        // Check if already joined
        if (room.players.find(p => p.id === currentUser.id)) {
            return { success: true, room }; // Already in room
        }

        // Add player to room
        room.players.push({
            id: currentUser.id,
            name: currentUser.name,
            joinedAt: new Date().toISOString()
        });

        // Initialize score
        room.scores[currentUser.id] = 0;

        this.updateRoom(room.id, room);

        return { success: true, room };
    },

    // Start quiz
    startQuiz(roomId) {
        const room = this.getRoomById(roomId);
        if (!room) return false;

        const updates = {
            status: 'in-progress',
            currentQuestion: 0,
            startedAt: new Date().toISOString(),
            questionStartTime: Date.now(),
            responses: {}
        };

        this.updateRoom(roomId, updates);
        return true;
    },

    // Submit answer
    submitAnswer(roomId, playerId, questionIndex, answerIndex) {
        const room = this.getRoomById(roomId);
        if (!room) return false;

        const quiz = Database.getQuizById(room.quizId);
        const question = quiz.questions[questionIndex];
        
        // Calculate time taken (for scoring)
        const timeTaken = Math.floor((Date.now() - room.questionStartTime) / 1000);
        const isCorrect = answerIndex === question.correctAnswer;
        
        // Calculate score (faster answers get more points)
        let points = 0;
        if (isCorrect) {
            const basePoints = 1000;
            const timeBonus = Math.max(0, (this.LIVE_TIMER - timeTaken) * 50);
            points = basePoints + timeBonus;
        }

        // Store response
        if (!room.responses[questionIndex]) {
            room.responses[questionIndex] = {};
        }

        room.responses[questionIndex][playerId] = {
            answer: answerIndex,
            timeTaken: timeTaken,
            points: points,
            timestamp: Date.now()
        };

        // Update player score
        if (!room.scores[playerId]) {
            room.scores[playerId] = 0;
        }
        room.scores[playerId] += points;

        this.updateRoom(room.id, room);
        return { points, isCorrect };
    },

    // Move to next question
    nextQuestion(roomId) {
        const room = this.getRoomById(roomId);
        if (!room) return false;

        const quiz = Database.getQuizById(room.quizId);
        
        if (room.currentQuestion >= quiz.questions.length - 1) {
            // Quiz finished
            return this.finishQuiz(roomId);
        }

        const updates = {
            currentQuestion: room.currentQuestion + 1,
            questionStartTime: Date.now(),
            responses: { ...room.responses }
        };

        this.updateRoom(roomId, updates);
        return true;
    },

    // Finish quiz
    finishQuiz(roomId) {
        const room = this.getRoomById(roomId);
        if (!room) return false;

        const updates = {
            status: 'finished',
            finishedAt: new Date().toISOString()
        };

        this.updateRoom(roomId, updates);
        
        // Save results for each player
        room.players.forEach(player => {
            const totalScore = room.scores[player.id] || 0;
            const quiz = Database.getQuizById(room.quizId);
            
            let correctAnswers = 0;
            quiz.questions.forEach((q, index) => {
                const response = room.responses[index] && room.responses[index][player.id];
                if (response && response.answer === q.correctAnswer) {
                    correctAnswers++;
                }
            });

            const resultData = {
                quizId: room.quizId,
                userId: player.id,
                score: Math.round((correctAnswers / quiz.questions.length) * 100),
                points: totalScore,
                correctAnswers: correctAnswers,
                wrongAnswers: quiz.questions.length - correctAnswers,
                totalQuestions: quiz.questions.length,
                timeTaken: Math.floor((Date.now() - new Date(room.startedAt).getTime()) / 1000),
                roomId: roomId,
                isLive: true
            };

            Database.saveResult(resultData);
        });

        return true;
    },

    // Get leaderboard for current question
    getQuestionLeaderboard(roomId, questionIndex) {
        const room = this.getRoomById(roomId);
        if (!room) return [];

        const leaderboard = room.players.map(player => {
            const response = room.responses[questionIndex] && room.responses[questionIndex][player.id];
            
            return {
                id: player.id,
                name: player.name,
                points: room.scores[player.id] || 0,
                answered: !!response,
                correct: response && response.answer !== undefined ? 
                    response.answer === Database.getQuizById(room.quizId).questions[questionIndex].correctAnswer : false
            };
        });

        // Sort by points descending
        leaderboard.sort((a, b) => b.points - a.points);

        return leaderboard.slice(0, 10); // Top 10
    },

    // Get final leaderboard
    getFinalLeaderboard(roomId) {
        const room = this.getRoomById(roomId);
        if (!room) return [];

        const leaderboard = room.players.map(player => ({
            id: player.id,
            name: player.name,
            points: room.scores[player.id] || 0
        }));

        // Sort by points descending
        leaderboard.sort((a, b) => b.points - a.points);

        return leaderboard;
    },

    // Get response statistics for a question
    getQuestionStats(roomId, questionIndex) {
        const room = this.getRoomById(roomId);
        if (!room || !room.responses[questionIndex]) return null;

        const quiz = Database.getQuizById(room.quizId);
        const question = quiz.questions[questionIndex];
        const responses = room.responses[questionIndex];

        const stats = question.options.map((option, index) => ({
            option: option,
            count: Object.values(responses).filter(r => r.answer === index).length,
            isCorrect: index === question.correctAnswer
        }));

        return {
            stats,
            totalResponses: Object.keys(responses).length,
            totalPlayers: room.players.length
        };
    },

    // Delete room
    deleteRoom(roomId) {
        const rooms = this.getAllRooms();
        const filtered = rooms.filter(r => r.id !== roomId);
        localStorage.setItem('liveQuizRooms', JSON.stringify(filtered));
    },

    // Clean up old rooms (older than 24 hours)
    cleanupOldRooms() {
        const rooms = this.getAllRooms();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        const active = rooms.filter(room => {
            const createdAt = new Date(room.createdAt).getTime();
            return createdAt > oneDayAgo;
        });

        localStorage.setItem('liveQuizRooms', JSON.stringify(active));
    }
};

// Clean up old rooms on load
LiveQuiz.cleanupOldRooms();

// Make LiveQuiz available globally
window.LiveQuiz = LiveQuiz;
