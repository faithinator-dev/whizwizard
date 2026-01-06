// =====================
// Signup Page JavaScript
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Setup form submission
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
});

function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        QuizUtils.showNotification('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        QuizUtils.showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        QuizUtils.showNotification('Passwords do not match', 'error');
        return;
    }

    const result = Auth.register(name, email, password);

    if (result.success) {
        QuizUtils.showNotification('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}
