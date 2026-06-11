// =====================
// Admin Account Initialization
// Backend now seeds the admin user directly.
// =====================

(function initializeAdmin() {
    console.log('✅ Admin account managed by backend');
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
