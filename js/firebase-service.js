// =====================
// Firebase Service Layer
// Unified service for all Firebase operations
// Replaces api.js and database.js
// =====================

const FirebaseService = {
    // =====================
    // Utility Functions
    // =====================
    
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    getCurrentTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    },

    // =====================
    // Authentication
    // =====================

    auth: {
        // Register with email/password
        async register(name, email, password) {
            try {
                // Create user in Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update profile with name
                await user.updateProfile({ displayName: name });

                // Create user document in Firestore
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    photoURL: null,
                    role: 'user'
                });

                // Store user in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.uid,
                    uid: user.uid,
                    name: name,
                    email: email,
                    photoURL: null
                }));

                return { success: true, user: user };
            } catch (error) {
                console.error('Registration error:', error);
                return { success: false, message: error.message };
            }
        },

        // Login with email/password
        async login(email, password) {
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Get user data from Firestore
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.exists ? userDoc.data() : {};

                const currentUser = {
                    id: user.uid,
                    uid: user.uid,
                    name: user.displayName || userData.name || 'User',
                    email: user.email,
                    photoURL: user.photoURL || userData.photoURL || null
                };

                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                return { success: true, user: currentUser };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: error.message };
            }
        },

        // Google Sign-In
        async googleSignIn() {
            try {
                const result = await auth.signInWithPopup(googleProvider);
                const user = result.user;

                // Create or update user document in Firestore
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user'
                }, { merge: true });

                const currentUser = {
                    id: user.uid,
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                };

                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                return { success: true, user: currentUser };
            } catch (error) {
                console.error('Google sign-in error:', error);
                return { success: false, message: error.message };
            }
        },

        // Logout
        async logout() {
            try {
                await auth.signOut();
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        },

        // Get current user
        getCurrentUser() {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                try {
                    return JSON.parse(userStr);
                } catch (e) {
                    return null;
                }
            }
            return null;
        },

        // Check if authenticated
        isAuthenticated() {
            const user = this.getCurrentUser();
            return user && user.email;
        },

        // Update profile
        async updateProfile(updates) {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) return { success: false, message: 'Not authenticated' };

                // Update Auth profile if name is changed
                if (updates.name) {
                    await currentUser.updateProfile({ displayName: updates.name });
                }

                // Update Firestore document
                await db.collection('users').doc(currentUser.uid).update({
                    ...updates,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Update localStorage
                const localUser = this.getCurrentUser();
                const updatedUser = { ...localUser, ...updates };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                return { success: true, user: updatedUser };
            } catch (error) {
                console.error('Profile update error:', error);
                return { success: false, message: error.message };
            }
        },

        // Check if admin
        isAdmin() {
            const user = this.getCurrentUser();
            return user && user.role === 'admin';
        }
    },

    // =====================
    // Quiz Operations
    // =====================

    quizzes: {
        // Get all quizzes
        async getAll() {
            try {
                const snapshot = await db.collection('quizzes')
                    .orderBy('createdAt', 'desc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                return [];
            }
        },

        // Get quiz by ID
        async getById(quizId) {
            try {
                const doc = await db.collection('quizzes').doc(quizId).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error('Error fetching quiz:', error);
                return null;
            }
        },

        // Get quizzes by user
        async getByUser(userId) {
            try {
                const snapshot = await db.collection('quizzes')
                    .where('createdBy', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching user quizzes:', error);
                return [];
            }
        },

        // Get quizzes by category
        async getByCategory(category) {
            try {
                if (category === 'all') {
                    return await this.getAll();
                }

                const snapshot = await db.collection('quizzes')
                    .where('category', '==', category)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching quizzes by category:', error);
                return [];
            }
        },

        // Create quiz
        async create(quizData) {
            try {
                const currentUser = FirebaseService.auth.getCurrentUser();
                if (!currentUser) throw new Error('Not authenticated');

                const quiz = {
                    title: quizData.title,
                    description: quizData.description,
                    category: quizData.category,
                    timer: parseInt(quizData.timer),
                    questions: quizData.questions,
                    createdBy: currentUser.id,
                    createdByName: currentUser.name,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    attempts: 0,
                    isPublic: quizData.isPublic !== false
                };

                const docRef = await db.collection('quizzes').add(quiz);
                
                return { success: true, id: docRef.id, quiz: { id: docRef.id, ...quiz } };
            } catch (error) {
                console.error('Error creating quiz:', error);
                return { success: false, message: error.message };
            }
        },

        // Update quiz
        async update(quizId, updates) {
            try {
                await db.collection('quizzes').doc(quizId).update({
                    ...updates,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                return { success: true };
            } catch (error) {
                console.error('Error updating quiz:', error);
                return { success: false, message: error.message };
            }
        },

        // Delete quiz
        async delete(quizId) {
            try {
                await db.collection('quizzes').doc(quizId).delete();
                return { success: true };
            } catch (error) {
                console.error('Error deleting quiz:', error);
                return { success: false, message: error.message };
            }
        },

        // Increment attempts
        async incrementAttempts(quizId) {
            try {
                await db.collection('quizzes').doc(quizId).update({
                    attempts: firebase.firestore.FieldValue.increment(1)
                });
            } catch (error) {
                console.error('Error incrementing attempts:', error);
            }
        }
    },

    // =====================
    // Results Operations
    // =====================

    results: {
        // Save result
        async save(resultData) {
            try {
                const currentUser = FirebaseService.auth.getCurrentUser();
                
                const result = {
                    quizId: resultData.quizId,
                    quizTitle: resultData.quizTitle,
                    userId: currentUser ? currentUser.id : 'guest',
                    userName: currentUser ? currentUser.name : 'Guest',
                    score: resultData.score,
                    totalQuestions: resultData.totalQuestions,
                    percentage: resultData.percentage,
                    timeTaken: resultData.timeTaken,
                    answers: resultData.answers || [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                const docRef = await db.collection('results').add(result);
                
                // Increment quiz attempts
                await FirebaseService.quizzes.incrementAttempts(resultData.quizId);

                return { success: true, id: docRef.id, result: { id: docRef.id, ...result } };
            } catch (error) {
                console.error('Error saving result:', error);
                return { success: false, message: error.message };
            }
        },

        // Get results by user
        async getByUser(userId) {
            try {
                const snapshot = await db.collection('results')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching user results:', error);
                return [];
            }
        },

        // Get results by quiz
        async getByQuiz(quizId) {
            try {
                const snapshot = await db.collection('results')
                    .where('quizId', '==', quizId)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching quiz results:', error);
                return [];
            }
        },

        // Get leaderboard for a quiz
        async getLeaderboard(quizId, limit = 10) {
            try {
                const snapshot = await db.collection('results')
                    .where('quizId', '==', quizId)
                    .orderBy('score', 'desc')
                    .orderBy('timeTaken', 'asc')
                    .limit(limit)
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                return [];
            }
        },

        // Get global leaderboard
        async getGlobalLeaderboard(limit = 10) {
            try {
                const snapshot = await db.collection('results')
                    .orderBy('score', 'desc')
                    .orderBy('createdAt', 'desc')
                    .limit(limit)
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error fetching global leaderboard:', error);
                return [];
            }
        }
    },

    // =====================
    // Live Room Operations
    // =====================

    liveRooms: {
        // Create live room
        async create(roomData) {
            try {
                const currentUser = FirebaseService.auth.getCurrentUser();
                if (!currentUser) throw new Error('Not authenticated');

                const room = {
                    quizId: roomData.quizId,
                    quizTitle: roomData.quizTitle,
                    hostId: currentUser.id,
                    hostName: currentUser.name,
                    roomCode: roomData.roomCode || FirebaseService.generateId().substr(-6).toUpperCase(),
                    status: 'waiting', // waiting, active, finished
                    participants: [],
                    maxParticipants: roomData.maxParticipants || 50,
                    currentQuestion: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                const docRef = await db.collection('liveRooms').add(room);
                
                return { success: true, id: docRef.id, room: { id: docRef.id, ...room } };
            } catch (error) {
                console.error('Error creating live room:', error);
                return { success: false, message: error.message };
            }
        },

        // Join live room
        async join(roomCode, participantName) {
            try {
                // Find room by code
                const snapshot = await db.collection('liveRooms')
                    .where('roomCode', '==', roomCode.toUpperCase())
                    .where('status', '!=', 'finished')
                    .get();

                if (snapshot.empty) {
                    return { success: false, message: 'Room not found or already finished' };
                }

                const roomDoc = snapshot.docs[0];
                const room = roomDoc.data();

                // Check if room is full
                if (room.participants && room.participants.length >= room.maxParticipants) {
                    return { success: false, message: 'Room is full' };
                }

                const participant = {
                    id: FirebaseService.generateId(),
                    name: participantName,
                    score: 0,
                    joinedAt: new Date().toISOString()
                };

                // Add participant to room
                await db.collection('liveRooms').doc(roomDoc.id).update({
                    participants: firebase.firestore.FieldValue.arrayUnion(participant)
                });

                return { 
                    success: true, 
                    roomId: roomDoc.id, 
                    room: { id: roomDoc.id, ...room },
                    participant 
                };
            } catch (error) {
                console.error('Error joining room:', error);
                return { success: false, message: error.message };
            }
        },

        // Get live room by ID
        async getById(roomId) {
            try {
                const doc = await db.collection('liveRooms').doc(roomId).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error('Error fetching room:', error);
                return null;
            }
        },

        // Listen to room updates (real-time)
        listenToRoom(roomId, callback) {
            return db.collection('liveRooms').doc(roomId).onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        callback({ id: doc.id, ...doc.data() });
                    }
                },
                (error) => {
                    console.error('Room listener error:', error);
                }
            );
        },

        // Update room status
        async updateStatus(roomId, status) {
            try {
                await db.collection('liveRooms').doc(roomId).update({ status });
                return { success: true };
            } catch (error) {
                console.error('Error updating room status:', error);
                return { success: false, message: error.message };
            }
        },

        // Delete room
        async delete(roomId) {
            try {
                await db.collection('liveRooms').doc(roomId).delete();
                return { success: true };
            } catch (error) {
                console.error('Error deleting room:', error);
                return { success: false, message: error.message };
            }
        }
    }
};

// Make FirebaseService available globally
window.FirebaseService = FirebaseService;

// Also create backward compatibility aliases
window.Auth = FirebaseService.auth;
window.Database = {
    init: () => console.log('Database.init() deprecated - using Firebase'),
    getCurrentUser: () => FirebaseService.auth.getCurrentUser(),
    getAllQuizzes: () => FirebaseService.quizzes.getAll(),
    getQuizById: (id) => FirebaseService.quizzes.getById(id),
    getQuizzesByCategory: (cat) => FirebaseService.quizzes.getByCategory(cat),
    getQuizzesByUser: (uid) => FirebaseService.quizzes.getByUser(uid),
    saveQuiz: (data) => FirebaseService.quizzes.create(data),
    updateQuiz: (id, data) => FirebaseService.quizzes.update(id, data),
    deleteQuiz: (id) => FirebaseService.quizzes.delete(id),
    saveResult: (data) => FirebaseService.results.save(data),
    getResultsByUser: (uid) => FirebaseService.results.getByUser(uid),
    getResultsByQuiz: (qid) => FirebaseService.results.getByQuiz(qid)
};
