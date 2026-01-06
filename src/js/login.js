// =====================
// Login Page JavaScript
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Setup form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        QuizUtils.showNotification('Please fill in all fields', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    // Use API for login
    API.auth.login(email, password)
        .then(data => {
            QuizUtils.showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        })
        .catch(error => {
            console.error('Login error:', error);
            QuizUtils.showNotification(error.message || 'Login failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        });
}
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}
