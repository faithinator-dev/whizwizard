// =====================
// Authentication Helpers
// =====================

const Auth = {
    isAuthenticated() {
        return Boolean(FirebaseService.auth.getCurrentUser());
    },

    getAuthUser() {
        return FirebaseService.auth.getCurrentUser();
    },

    getUser() {
        return this.getAuthUser();
    },

    async login(email, password) {
        return FirebaseService.auth.login(email, password);
    },

    async register(name, email, password) {
        return FirebaseService.auth.register(name, email, password);
    },

    async logout() {
        return FirebaseService.auth.logout();
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    async updateProfile(updates) {
        const result = await FirebaseService.auth.updateProfile(updates);
        return Boolean(result && result.success);
    },

    isAdmin() {
        const user = this.getUser();
        return Boolean(user && user.role === 'admin');
    }
};

window.Auth = Auth;
