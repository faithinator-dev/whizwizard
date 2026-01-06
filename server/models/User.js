const { getFirestore } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.avatar = data.avatar || null;
        this.authProvider = data.authProvider || 'email'; // 'email' or 'google'
        this.totalScore = data.totalScore || 0;
        this.quizzesCompleted = data.quizzesCompleted || 0;
        this.quizzesCreated = data.quizzesCreated || 0;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validate user data
    static validate(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        if (data.name && data.name.length > 50) {
            errors.push('Name cannot exceed 50 characters');
        }
        if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
            errors.push('Please provide a valid email');
        }
        // Only validate password for email auth
        if (data.authProvider !== 'google' && (!data.password || data.password.length < 6)) {
            errors.push('Password must be at least 6 characters');
        }

        return errors;
    }

    // Hash password
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    // Compare password
    static async comparePassword(candidatePassword, hashedPassword) {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }

    // Get public profile
    getPublicProfile() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            avatar: this.avatar,
            totalScore: this.totalScore,
            quizzesCompleted: this.quizzesCompleted,
            quizzesCreated: this.quizzesCreated,
            createdAt: this.createdAt
        };
    }

    // Save user to Firestore
    async save() {
        const db = getFirestore();
        const userData = {
            name: this.name,
            email: this.email.toLowerCase(),
            password: this.password,
            avatar: this.avatar,
            totalScore: this.totalScore,
            quizzesCompleted: this.quizzesCompleted,
            quizzesCreated: this.quizzesCreated,
            updatedAt: new Date()
        };

        if (this.id) {
            // Update existing user
            await db.collection('users').doc(this.id).update(userData);
        } else {
            // Create new user
            userData.createdAt = new Date();
            const docRef = await db.collection('users').add(userData);
            this.id = docRef.id;
            this.createdAt = userData.createdAt;
        }

        return this;
    }

    // Find user by ID
    static async findById(id) {
        const db = getFirestore();
        const doc = await db.collection('users').doc(id).get();
        
        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        return new User({
            id: doc.id,
            ...data
        });
    }

    // Find user by email
    static async findByEmail(email) {
        const db = getFirestore();
        const snapshot = await db.collection('users')
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return new User({
            id: doc.id,
            ...doc.data()
        });
    }

    // Get all users
    static async findAll() {
        const db = getFirestore();
        const snapshot = await db.collection('users').get();
        
        return snapshot.docs.map(doc => new User({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Delete user
    static async deleteById(id) {
        const db = getFirestore();
        await db.collection('users').doc(id).delete();
    }
}

module.exports = User;
