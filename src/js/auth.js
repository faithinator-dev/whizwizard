// =====================
// Authentication System
// =====================

const Auth = {
    // Check if user is authenticated
    isAuthenticated() {
        const currentUser = Database.getCurrentUser();
        return currentUser && currentUser.email && currentUser.email !== 'guest@whizwizard.com';
    },

    // Get current authenticated user
    getAuthUser() {
        if (this.isAuthenticated()) {
            return Database.getCurrentUser();
        }
        return null;
    },

    // Login user
    login(email, password) {
        const users = Database.getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        // Set as current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return { success: true, user };
    },

    // Register new user
    register(name, email, password) {
        const users = Database.getAllUsers();
        
        // Check if email already exists
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: Database.generateId(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // In production, this should be hashed
            createdAt: new Date().toISOString()
        };

        // Save user
        Database.saveUser(newUser);
        
        // Set as current user
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    },

    // Logout user
    logout() {
        // Create guest user
        const guestUser = {
            id: Database.generateId(),
            name: 'Guest User',
            email: 'guest@whizwizard.com',
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(guestUser));
        window.location.href = 'login.html';
    },

    // Require authentication (redirect to login if not authenticated)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Update user profile
    updateProfile(updates) {
        const currentUser = this.getAuthUser();
        if (!currentUser) return false;

        const updatedUser = { ...currentUser, ...updates };
        Database.saveUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return true;
    }
};

// Make Auth available globally
window.Auth = Auth;
