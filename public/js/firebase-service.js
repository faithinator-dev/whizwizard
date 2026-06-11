// =====================
// Backend Service Layer
// Browser client for Node.js + MongoDB API
// Keeps legacy Database/Auth globals working for existing pages
// =====================

const API_CONFIG = {
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://whizwizard-backend.onrender.com/api',
    timeout: 10000
};

class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const API = new ApiClient();

function readCollection(key) {
    const preferred = localStorage.getItem(`whizwizard.${key}`) || localStorage.getItem(key);
    if (!preferred) return [];

    try {
        return JSON.parse(preferred);
    } catch (error) {
        return [];
    }
}

function writeCollection(key, value) {
    const serialized = JSON.stringify(value);
    localStorage.setItem(`whizwizard.${key}`, serialized);
    localStorage.setItem(key, serialized);
}

function readCurrentUser() {
    const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

function writeCurrentUser(user) {
    if (!user) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        return;
    }

    const serialized = JSON.stringify(user);
    localStorage.setItem('currentUser', serialized);
    localStorage.setItem('user', serialized);
}

function normalizeUser(user) {
    if (!user) return null;

    return {
        id: user.id || user.uid || user._id,
        uid: user.uid || user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        photoURL: user.photoURL || null,
        avatar: user.avatar || null,
        quizzesCompleted: user.quizzesCompleted || 0,
        quizzesCreated: user.quizzesCreated || 0,
        totalScore: user.totalScore || 0,
        createdAt: user.createdAt || new Date().toISOString()
    };
}

function upsertById(items, item) {
    const list = Array.isArray(items) ? [...items] : [];
    const index = list.findIndex(entry => String(entry.id) === String(item.id));

    if (index === -1) {
        list.push(item);
    } else {
        list[index] = { ...list[index], ...item };
    }

    return list;
}

function removeById(items, id) {
    return (Array.isArray(items) ? items : []).filter(entry => String(entry.id) !== String(id));
}

async function bootstrapCache() {
    try {
        const [usersResponse, quizzesResponse, resultsResponse] = await Promise.allSettled([
            API.get('/users'),
            API.get('/quizzes?limit=5000'),
            API.get('/results?limit=5000')
        ]);

        if (usersResponse.status === 'fulfilled' && Array.isArray(usersResponse.value.users)) {
            writeCollection('users', usersResponse.value.users.map(normalizeUser));
        }

        if (quizzesResponse.status === 'fulfilled' && Array.isArray(quizzesResponse.value.quizzes)) {
            writeCollection('quizzes', quizzesResponse.value.quizzes);
        }

        if (resultsResponse.status === 'fulfilled' && Array.isArray(resultsResponse.value.results)) {
            writeCollection('results', resultsResponse.value.results);
        }
    } catch (error) {
        console.warn('Cache bootstrap skipped:', error.message);
    }
}

const FirebaseService = {
    // Socket.io for real-time multiplayer
    socket: typeof io !== 'undefined' ? io() : null,

    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    },

    async bootstrapCache() {
        await bootstrapCache();
    },

    auth: {
        async register(name, email, password) {
            const response = await API.post('/auth/register', { name, email, password });
            if (response.token) API.setToken(response.token);

            const currentUser = normalizeUser(response.user);
            writeCurrentUser(currentUser);
            await bootstrapCache();

            return { success: true, user: currentUser, token: response.token };
        },

        async login(email, password) {
            const response = await API.post('/auth/login', { email, password });
            if (response.token) API.setToken(response.token);

            const currentUser = normalizeUser(response.user);
            writeCurrentUser(currentUser);
            await bootstrapCache();

            return { success: true, user: currentUser, token: response.token };
        },

        async googleSignIn(idToken, email, name, photoURL) {
            const response = await API.post('/auth/google', { idToken, email, name, photoURL });
            if (response.token) API.setToken(response.token);

            const currentUser = normalizeUser(response.user);
            writeCurrentUser(currentUser);
            await bootstrapCache();

            return { success: true, user: currentUser, token: response.token };
        },

        async logout() {
            API.setToken(null);
            writeCurrentUser(null);
            window.location.href = 'login.html';
        },

        getCurrentUser() {
            return readCurrentUser();
        },

        isAuthenticated() {
            return Boolean(readCurrentUser());
        },

        async updateProfile(updates) {
            const response = await API.patch('/auth/profile', updates);
            const updatedUser = normalizeUser(response.user);
            writeCurrentUser(updatedUser);

            const users = readCollection('users');
            writeCollection('users', upsertById(users, updatedUser));

            return { success: true, user: updatedUser };
        },

        async changePassword(currentPassword, newPassword) {
            const response = await API.post('/auth/change-password', { currentPassword, newPassword });
            return { success: true, message: response.message || 'Password updated' };
        },

        isAdmin() {
            const user = readCurrentUser();
            return Boolean(user && user.role === 'admin');
        }
    },

    users: {
        async getAll() {
            const response = await API.get('/users');
            const users = Array.isArray(response.users) ? response.users.map(normalizeUser) : [];
            writeCollection('users', users);
            return users;
        },

        async getById(userId) {
            const response = await API.get(`/users/${userId}`);
            return normalizeUser(response.user);
        },

        async getByEmail(email) {
            const users = readCollection('users');
            const cached = users.find(user => user.email?.toLowerCase() === String(email).toLowerCase());
            if (cached) return cached;

            const refreshed = await this.getAll().catch(() => users);
            return refreshed.find(user => user.email?.toLowerCase() === String(email).toLowerCase()) || null;
        },

        async update(userId, updates) {
            const response = await API.patch(`/users/${userId}`, updates);
            const updatedUser = normalizeUser(response.user);

            writeCollection('users', upsertById(readCollection('users'), updatedUser));

            const currentUser = readCurrentUser();
            if (currentUser && String(currentUser.id) === String(updatedUser.id)) {
                writeCurrentUser(updatedUser);
            }

            return { success: true, user: updatedUser };
        },

        async delete(userId) {
            await API.delete(`/users/${userId}`);
            writeCollection('users', removeById(readCollection('users'), userId));

            const currentUser = readCurrentUser();
            if (currentUser && String(currentUser.id) === String(userId)) {
                writeCurrentUser(null);
            }

            return { success: true };
        }
    },

    quizzes: {
        async getAll() {
            try {
                const response = await API.get('/quizzes?limit=5000');
                const quizzes = Array.isArray(response.quizzes) ? response.quizzes : [];
                if (quizzes.length > 0) {
                    writeCollection('quizzes', quizzes);
                    return quizzes;
                }
            } catch (error) {
                console.warn('Quiz fetch fallback used:', error.message);
            }

            return readCollection('quizzes');
        },

        async getById(quizId) {
            try {
                const response = await API.get(`/quizzes/${quizId}`);
                if (response.quiz) return response.quiz;
            } catch (error) {
                console.warn('Quiz fetch fallback used:', error.message);
            }

            return readCollection('quizzes').find(quiz => String(quiz.id) === String(quizId)) || null;
        },

        async getByUser(userId) {
            try {
                const response = await API.get(`/quizzes?userId=${encodeURIComponent(userId)}&limit=5000`);
                if (Array.isArray(response.quizzes) && response.quizzes.length > 0) {
                    return response.quizzes;
                }
            } catch (error) {
                console.warn('Quiz fetch fallback used:', error.message);
            }

            return readCollection('quizzes').filter(quiz => String(quiz.createdBy) === String(userId));
        },

        async getByCategory(category) {
            if (category === 'all') {
                return this.getAll();
            }

            try {
                const response = await API.get(`/quizzes?category=${encodeURIComponent(category)}&limit=5000`);
                if (Array.isArray(response.quizzes) && response.quizzes.length > 0) {
                    return response.quizzes;
                }
            } catch (error) {
                console.warn('Quiz fetch fallback used:', error.message);
            }

            return readCollection('quizzes').filter(quiz => String(quiz.category).toLowerCase() === String(category).toLowerCase());
        },

        async create(quizData) {
            const response = await API.post('/quizzes', quizData);
            const createdQuiz = response.quiz || null;

            if (createdQuiz) {
                writeCollection('quizzes', upsertById(readCollection('quizzes'), createdQuiz));

                const currentUser = readCurrentUser();
                if (currentUser) {
                    const cachedUsers = readCollection('users').map(user => {
                        if (String(user.id) === String(currentUser.id)) {
                            return { ...user, quizzesCreated: (user.quizzesCreated || 0) + 1 };
                        }
                        return user;
                    });
                    writeCollection('users', cachedUsers);
                }
            }

            return { success: true, id: response.id, quiz: createdQuiz };
        },

        async update(quizId, updates) {
            const response = await API.patch(`/quizzes/${quizId}`, updates);
            const updatedQuiz = response.quiz || null;
            if (updatedQuiz) {
                writeCollection('quizzes', upsertById(readCollection('quizzes'), updatedQuiz));
            }
            return { success: true, quiz: updatedQuiz };
        },

        async delete(quizId) {
            await API.delete(`/quizzes/${quizId}`);
            writeCollection('quizzes', removeById(readCollection('quizzes'), quizId));
            writeCollection('results', readCollection('results').filter(result => String(result.quizId) !== String(quizId)));
            return { success: true };
        },

        async incrementAttempts(quizId) {
            const response = await API.post(`/quizzes/${quizId}/attempt`, {});
            const updatedQuiz = response.quiz || null;
            if (updatedQuiz) {
                writeCollection('quizzes', upsertById(readCollection('quizzes'), updatedQuiz));
            }
            return { success: true, quiz: updatedQuiz };
        }
    },

    results: {
        async save(resultData) {
            const response = await API.post('/results', resultData);
            const savedResult = response.result || null;

            if (savedResult) {
                writeCollection('results', upsertById(readCollection('results'), savedResult));
            }

            return { success: true, id: response.id, result: savedResult };
        },

        async getByUser(userId) {
            try {
                const response = await API.get(`/results?userId=${encodeURIComponent(userId)}&limit=5000`);
                if (Array.isArray(response.results) && response.results.length > 0) {
                    return response.results;
                }
            } catch (error) {
                console.warn('Result fetch fallback used:', error.message);
            }

            return readCollection('results').filter(result => String(result.userId) === String(userId));
        },

        async getByQuiz(quizId) {
            try {
                const response = await API.get(`/results?quizId=${encodeURIComponent(quizId)}&limit=5000`);
                if (Array.isArray(response.results) && response.results.length > 0) {
                    return response.results;
                }
            } catch (error) {
                console.warn('Result fetch fallback used:', error.message);
            }

            return readCollection('results').filter(result => String(result.quizId) === String(quizId));
        },

        async getLeaderboard(quizId, limit = 10) {
            try {
                const response = await API.get(`/results/leaderboard?quizId=${encodeURIComponent(quizId)}&limit=${limit}`);
                if (Array.isArray(response.results) && response.results.length > 0) {
                    return response.results;
                }
            } catch (error) {
                console.warn('Result fetch fallback used:', error.message);
            }

            return readCollection('results')
                .filter(result => String(result.quizId) === String(quizId))
                .sort((a, b) => (b.score || 0) - (a.score || 0) || (a.timeTaken || 0) - (b.timeTaken || 0))
                .slice(0, limit);
        },

        async getGlobalLeaderboard(limit = 10) {
            try {
                const response = await API.get(`/results/global-leaderboard?limit=${limit}`);
                if (Array.isArray(response.results) && response.results.length > 0) {
                    return response.results;
                }
            } catch (error) {
                console.warn('Result fetch fallback used:', error.message);
            }

            return readCollection('results')
                .sort((a, b) => (b.score || 0) - (a.score || 0) || (a.timeTaken || 0) - (b.timeTaken || 0))
                .slice(0, limit);
        },

        async getAll() {
            try {
                const response = await API.get('/results?limit=5000');
                if (Array.isArray(response.results) && response.results.length > 0) {
                    return response.results;
                }
            } catch (error) {
                console.warn('Result fetch fallback used:', error.message);
            }

            return readCollection('results');
        }
    },

    liveRooms: {
        async create(roomData) {
            const response = await API.post('/live-rooms', roomData);
            const room = response.room || null;
            if (room) {
                writeCollection('liveRooms', upsertById(readCollection('liveRooms'), room));
            }
            return { success: true, id: response.id, room };
        },

        async join(roomCode, participantName) {
            const response = await API.post('/live-rooms/join', { roomCode, participantName });
            const room = response.room || null;
            if (room && FirebaseService.socket) {
                writeCollection('liveRooms', upsertById(readCollection('liveRooms'), room));
                // Emit socket event for real-time join
                FirebaseService.socket.emit('joinRoom', { 
                    roomId: room.id, 
                    userId: response.participant.id, 
                    name: response.participant.name 
                });
            }
            return response;
        },

        async getById(roomId) {
            const response = await API.get(`/live-rooms/${roomId}`);
            return response.room || null;
        },

        listenToRoom(roomId, callback) {
            // Use Socket.io if available for instant updates
            if (FirebaseService.socket) {
                const onPlayerJoined = (data) => {
                    console.log('Real-time: Player joined', data);
                    this.getById(roomId).then(room => { if(room) callback(room); });
                };

                const onGameStarted = () => {
                    console.log('Real-time: Game started');
                    this.getById(roomId).then(room => { if(room) callback(room); });
                };

                const onQuestionUpdate = (data) => {
                    console.log('Real-time: Question update', data);
                    this.getById(roomId).then(room => { if(room) callback(room); });
                };

                const onAnswerReceived = (data) => {
                    console.log('Real-time: Answer received', data);
                    this.getById(roomId).then(room => { if(room) callback(room); });
                };

                FirebaseService.socket.on('playerJoined', onPlayerJoined);
                FirebaseService.socket.on('gameStarted', onGameStarted);
                FirebaseService.socket.on('questionUpdate', onQuestionUpdate);
                FirebaseService.socket.on('answerReceived', onAnswerReceived);

                // Still do an initial fetch
                this.getById(roomId).then(room => { if(room) callback(room); });

                return () => {
                    FirebaseService.socket.off('playerJoined', onPlayerJoined);
                    FirebaseService.socket.off('gameStarted', onGameStarted);
                    FirebaseService.socket.off('questionUpdate', onQuestionUpdate);
                    FirebaseService.socket.off('answerReceived', onAnswerReceived);
                };
            }

            // Fallback to polling if socket fails
            let active = true;
            const poll = async () => {
                if (!active) return;
                try {
                    const room = await this.getById(roomId);
                    if (room) {
                        callback(room);
                    }
                } catch (error) {
                    console.error('Room listener error:', error);
                }
            };

            poll();
            const interval = window.setInterval(poll, 2000);

            return () => {
                active = false;
                window.clearInterval(interval);
            };
        },

        async updateStatus(roomId, status, currentQuestion) {
            const response = await API.patch(`/live-rooms/${roomId}/status`, { status, currentQuestion });
            const room = response.room || null;
            if (room) {
                writeCollection('liveRooms', upsertById(readCollection('liveRooms'), room));
            }
            return { success: true, room };
        },

        async delete(roomId) {
            await API.delete(`/live-rooms/${roomId}`);
            writeCollection('liveRooms', removeById(readCollection('liveRooms'), roomId));
            return { success: true };
        }
    }
};

window.API_CONFIG = API_CONFIG;
window.API = API;
window.FirebaseService = FirebaseService;
window.Auth = FirebaseService.auth;

window.Database = {
    init: () => {
        FirebaseService.bootstrapCache();
    },
    generateId: () => FirebaseService.generateId(),
    getCurrentUser: () => readCurrentUser(),

    getAllUsers: () => readCollection('users'),
    getUserByEmail: (email) => readCollection('users').find(user => user.email?.toLowerCase() === String(email).toLowerCase()) || null,
    saveUser: (userData) => {
        const normalizedUser = normalizeUser(userData);
        writeCollection('users', upsertById(readCollection('users'), normalizedUser));
        if (String(readCurrentUser()?.id) === String(normalizedUser.id)) {
            writeCurrentUser(normalizedUser);
        }
        FirebaseService.users.update(normalizedUser.id, normalizedUser).catch(() => {});
        return normalizedUser;
    },
    updateUser: (userId, updates) => {
        const updatedUsers = readCollection('users').map(user => String(user.id) === String(userId) ? { ...user, ...updates } : user);
        writeCollection('users', updatedUsers);

        const currentUser = readCurrentUser();
        if (currentUser && String(currentUser.id) === String(userId)) {
            writeCurrentUser({ ...currentUser, ...updates });
        }

        FirebaseService.users.update(userId, updates).catch(() => {});
        return updatedUsers.find(user => String(user.id) === String(userId)) || null;
    },
    deleteUser: (userId) => {
        writeCollection('users', removeById(readCollection('users'), userId));
        if (String(readCurrentUser()?.id) === String(userId)) {
            writeCurrentUser(null);
        }
        FirebaseService.users.delete(userId).catch(() => {});
        return true;
    },

    getAllQuizzes: () => readCollection('quizzes'),
    getQuizById: (quizId) => readCollection('quizzes').find(quiz => String(quiz.id) === String(quizId)) || null,
    getQuizzesByCategory: (category) => {
        const quizzes = readCollection('quizzes');
        if (category === 'all') return quizzes;
        return quizzes.filter(quiz => String(quiz.category).toLowerCase() === String(category).toLowerCase());
    },
    getQuizzesByUser: (userId) => readCollection('quizzes').filter(quiz => String(quiz.createdBy) === String(userId)),
    saveQuiz: (quizData) => {
        const currentUser = readCurrentUser();
        const quizzes = readCollection('quizzes');

        const newQuiz = {
            id: FirebaseService.generateId(),
            title: quizData.title,
            description: quizData.description,
            category: quizData.category,
            timer: Number.parseInt(quizData.timer, 10) || 30,
            questions: quizData.questions || [],
            createdBy: currentUser?.id || quizData.createdBy || 'unknown',
            createdByName: currentUser?.name || quizData.createdByName || '',
            createdAt: new Date().toISOString(),
            attempts: 0,
            isPublic: quizData.isPublic !== false
        };

        quizzes.push(newQuiz);
        writeCollection('quizzes', quizzes);
        if (!quizData.id) {
            FirebaseService.quizzes.create(quizData).catch(() => {});
        }
        return newQuiz;
    },
    updateQuiz: (quizId, updates) => {
        const quizzes = readCollection('quizzes').map(quiz => String(quiz.id) === String(quizId) ? { ...quiz, ...updates, updatedAt: new Date().toISOString() } : quiz);
        writeCollection('quizzes', quizzes);
        FirebaseService.quizzes.update(quizId, updates).catch(() => {});
        return quizzes.find(quiz => String(quiz.id) === String(quizId)) || null;
    },
    deleteQuiz: (quizId) => {
        writeCollection('quizzes', removeById(readCollection('quizzes'), quizId));
        writeCollection('results', readCollection('results').filter(result => String(result.quizId) !== String(quizId)));
        FirebaseService.quizzes.delete(quizId).catch(() => {});
        return true;
    },
    incrementQuizAttempts: (quizId) => {
        const quizzes = readCollection('quizzes').map(quiz => {
            if (String(quiz.id) === String(quizId)) {
                return { ...quiz, attempts: (quiz.attempts || 0) + 1 };
            }
            return quiz;
        });
        writeCollection('quizzes', quizzes);
        FirebaseService.quizzes.incrementAttempts(quizId).catch(() => {});
    },

    getAllResults: () => readCollection('results'),
    getResultsByUser: (userId) => readCollection('results').filter(result => String(result.userId) === String(userId)),
    getResultsByQuiz: (quizId) => readCollection('results').filter(result => String(result.quizId) === String(quizId)),
    saveResult: (resultData) => {
        const currentUser = readCurrentUser();
        const results = readCollection('results');

        const newResult = {
            id: FirebaseService.generateId(),
            quizId: resultData.quizId,
            quizTitle: resultData.quizTitle || '',
            userId: currentUser?.id || 'guest',
            userName: currentUser?.name || 'Guest',
            score: resultData.score,
            correctAnswers: resultData.correctAnswers,
            wrongAnswers: resultData.wrongAnswers,
            totalQuestions: resultData.totalQuestions,
            percentage: resultData.percentage,
            timeTaken: resultData.timeTaken,
            answers: resultData.answers || [],
            completedAt: new Date().toISOString()
        };

        results.push(newResult);
        writeCollection('results', results);
        if (!resultData.isLive) {
            FirebaseService.results.save(resultData).catch(() => {});
            FirebaseService.quizzes.incrementAttempts(resultData.quizId).catch(() => {});
        }
        return newResult;
    },
    getUserBestScore: (userId, quizId) => {
        const userResults = readCollection('results').filter(result => String(result.userId) === String(userId) && String(result.quizId) === String(quizId));
        if (userResults.length === 0) return null;
        return Math.max(...userResults.map(result => result.score || 0));
    },
    getTotalQuizzes: () => readCollection('quizzes').length,
    getTotalUsers: () => readCollection('users').length,
    getTotalCompleted: () => readCollection('results').length,
    getLeaderboard: () => {
        const users = readCollection('users');
        const results = readCollection('results');

        const leaderboard = users.map(user => {
            const userResults = results.filter(result => String(result.userId) === String(user.id));
            const totalScore = userResults.reduce((sum, result) => sum + (result.score || 0), 0);
            const quizzesCompleted = userResults.length;
            const avgScore = quizzesCompleted > 0 ? Math.round(totalScore / quizzesCompleted) : 0;

            return {
                id: user.id,
                name: user.name,
                totalScore,
                quizzesCompleted,
                avgScore
            };
        });

        return leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    },

    getAllLiveRooms: () => readCollection('liveRooms'),
    getLiveRoomById: (roomId) => readCollection('liveRooms').find(room => String(room.id) === String(roomId)) || null,
    saveLiveRoom: (roomData) => {
        const rooms = readCollection('liveRooms');
        const room = {
            id: roomData.id || FirebaseService.generateId(),
            quizId: roomData.quizId,
            quizTitle: roomData.quizTitle || '',
            hostId: roomData.hostId,
            hostName: roomData.hostName || '',
            roomCode: String(roomData.roomCode || FirebaseService.generateId().slice(-6)).toUpperCase(),
            status: roomData.status || 'waiting',
            participants: roomData.participants || [],
            maxParticipants: roomData.maxParticipants || 50,
            currentQuestion: roomData.currentQuestion || 0,
            createdAt: roomData.createdAt || new Date().toISOString()
        };

        writeCollection('liveRooms', upsertById(rooms, room));
        FirebaseService.liveRooms.create(roomData).catch(() => {});
        return room;
    },
    deleteLiveRoom: (roomId) => {
        writeCollection('liveRooms', removeById(readCollection('liveRooms'), roomId));
        FirebaseService.liveRooms.delete(roomId).catch(() => {});
        return true;
    }
};

FirebaseService.bootstrapCache();
