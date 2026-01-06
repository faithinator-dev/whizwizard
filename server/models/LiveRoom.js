const { getFirestore } = require('../config/database');

class LiveRoom {
    constructor(data) {
        this.id = data.id || null;
        this.code = data.code;
        this.quiz = data.quiz;
        this.host = data.host;
        this.status = data.status || 'waiting';
        this.players = data.players || [];
        this.currentQuestion = data.currentQuestion || -1;
        this.answers = data.answers || {};
        this.startedAt = data.startedAt || null;
        this.finishedAt = data.finishedAt || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Generate random room code
    static generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Validate live room data
    static validate(data) {
        const errors = [];

        if (!data.code || data.code.length !== 6) {
            errors.push('Code must be exactly 6 characters');
        }
        if (!data.quiz) {
            errors.push('Quiz ID is required');
        }
        if (!data.host) {
            errors.push('Host ID is required');
        }
        if (data.status && !['waiting', 'in-progress', 'finished'].includes(data.status)) {
            errors.push('Invalid status');
        }

        return errors;
    }

    // Save live room to Firestore
    async save() {
        const db = getFirestore();
        const roomData = {
            code: this.code.toUpperCase(),
            quiz: this.quiz,
            host: this.host,
            status: this.status,
            players: this.players,
            currentQuestion: this.currentQuestion,
            answers: this.answers,
            startedAt: this.startedAt,
            finishedAt: this.finishedAt,
            updatedAt: new Date()
        };

        if (this.id) {
            // Update existing room
            await db.collection('liveRooms').doc(this.id).update(roomData);
        } else {
            // Create new room
            roomData.createdAt = new Date();
            const docRef = await db.collection('liveRooms').add(roomData);
            this.id = docRef.id;
            this.createdAt = roomData.createdAt;
        }

        return this;
    }

    // Find room by ID
    static async findById(id) {
        const db = getFirestore();
        const doc = await db.collection('liveRooms').doc(id).get();
        
        if (!doc.exists) {
            return null;
        }

        return new LiveRoom({
            id: doc.id,
            ...doc.data()
        });
    }

    // Find room by code
    static async findByCode(code) {
        const db = getFirestore();
        const snapshot = await db.collection('liveRooms')
            .where('code', '==', code.toUpperCase())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return new LiveRoom({
            id: doc.id,
            ...doc.data()
        });
    }

    // Find rooms by host
    static async findByHost(hostId) {
        const db = getFirestore();
        const snapshot = await db.collection('liveRooms')
            .where('host', '==', hostId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => new LiveRoom({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Find active rooms
    static async findActive() {
        const db = getFirestore();
        const snapshot = await db.collection('liveRooms')
            .where('status', 'in', ['waiting', 'in-progress'])
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => new LiveRoom({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Add player to room
    addPlayer(player) {
        const existingPlayer = this.players.find(p => p.userId === player.userId);
        if (!existingPlayer) {
            this.players.push({
                userId: player.userId,
                name: player.name,
                points: 0,
                joinedAt: new Date()
            });
        }
    }

    // Remove player from room
    removePlayer(userId) {
        this.players = this.players.filter(p => p.userId !== userId);
    }

    // Update player points
    updatePlayerPoints(userId, points) {
        const player = this.players.find(p => p.userId === userId);
        if (player) {
            player.points += points;
        }
    }

    // Record player answer
    recordAnswer(questionIndex, answer) {
        if (!this.answers[questionIndex]) {
            this.answers[questionIndex] = [];
        }
        this.answers[questionIndex].push({
            playerId: answer.playerId,
            answerIndex: answer.answerIndex,
            timeTaken: answer.timeTaken,
            isCorrect: answer.isCorrect,
            points: answer.points,
            answeredAt: new Date()
        });
    }

    // Get leaderboard
    getLeaderboard() {
        return this.players
            .sort((a, b) => b.points - a.points)
            .map((player, index) => ({
                rank: index + 1,
                ...player
            }));
    }

    // Delete room
    static async deleteById(id) {
        const db = getFirestore();
        await db.collection('liveRooms').doc(id).delete();
    }

    // Clean up old rooms (older than 24 hours)
    static async cleanupOldRooms() {
        const db = getFirestore();
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const snapshot = await db.collection('liveRooms')
            .where('createdAt', '<', cutoffTime)
            .get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return snapshot.size;
    }
}

module.exports = LiveRoom;
