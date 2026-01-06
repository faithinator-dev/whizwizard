const { validationResult } = require('express-validator');
const { getAuth } = require('../config/database');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, email, password } = req.body;

        // Validate user data
        const validationErrors = User.validate({ name, email, password });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors.map(err => ({ msg: err }))
            });
        }

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await User.hashPassword(password);

        // Create user in Firestore
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });
        await user.save();

        // Create Firebase Auth user
        const auth = getAuth();
        const firebaseUser = await auth.createUser({
            uid: user.id,
            email: email.toLowerCase().trim(),
            password: password,
            displayName: name.trim()
        });

        // Generate custom token
        const token = await auth.createCustomToken(firebaseUser.uid);

        res.status(201).json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate custom token
        const auth = getAuth();
        const token = await auth.createCustomToken(user.id);

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, avatar } = req.body;

        const user = await User.findById(req.user.id);

        if (name) user.name = name.trim();
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        // Update Firebase Auth display name
        if (name) {
            const auth = getAuth();
            await auth.updateUser(user.id, {
                displayName: name.trim()
            });
        }

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};
