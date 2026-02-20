// =====================
// Admin Account Initialization
// =====================

(function initializeAdmin() {
    // Check if admin account exists
    const adminEmail = 'faithinator.faithanic@gmail.com';
    const existingAdmin = Database.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
        // Create admin account
        const adminUser = {
            id: 'admin-' + Date.now(),
            name: 'Admin Faithinator',
            email: adminEmail,
            password: null, // Will be set by bcrypt
            role: 'admin',
            avatar: null,
            totalScore: 0,
            quizzesCompleted: 0,
            quizzesCreated: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Hash password: Admin@faithinator
        // For localStorage, we'll use a pre-hashed version
        // In production, this should be handled by the backend
        const bcrypt = {
            hash: function(password) {
                // Simple hash for demo (in production, use proper bcrypt)
                return btoa(password + 'salt');
            },
            compare: function(password, hash) {
                return btoa(password + 'salt') === hash;
            }
        };
        
        adminUser.password = bcrypt.hash('Admin@faithinator');
        
        // Save admin user
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('✅ Admin account initialized successfully');
        console.log('📧 Email: faithinator.faithanic@gmail.com');
        console.log('🔑 Password: Admin@faithinator');
    } else {
        // Update role to admin if not already
        if (existingAdmin.role !== 'admin') {
            existingAdmin.role = 'admin';
            Database.updateUser(existingAdmin.id, { role: 'admin' });
            console.log('✅ Admin role updated for existing user');
        }
    }
})();

// Helper function to check if user is admin
function isAdmin() {
    const user = Auth.getUser();
    return user && user.role === 'admin';
}

// Middleware to protect admin routes
function requireAdmin() {
    if (!isAdmin()) {
        QuizUtils.showNotification('Access denied. Admin privileges required.', 'error');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
