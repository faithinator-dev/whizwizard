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
    const submitBtn = e.target.querySelector('button[type="submit"]');

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

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    // Use API for registration
    API.auth.register(name, email, password)
        .then(data => {
            QuizUtils.showNotification('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        })
        .catch(error => {
            console.error('Signup error:', error);
            QuizUtils.showNotification(error.message || 'Signup failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        });
}

    if (result.success) {
        QuizUtils.showNotification('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}
