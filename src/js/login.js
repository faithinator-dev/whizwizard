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
    
    // Setup Google Sign-In
    const googleBtn = document.getElementById('google-signin-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleSignIn);
    }
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
    ButtonLoader.show(submitBtn);

    // Use API for login
    API.auth.login(email, password)
        .then(data => {
            if (data.success) {
                // Store user data and token
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                QuizUtils.showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            } else {
                // Show specific error message from backend
                QuizUtils.showNotification(data.message || 'Login failed. Please try again.', 'error');
                ButtonLoader.hide(submitBtn);
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            // Show user-friendly error messages
            let errorMessage = 'Login failed. Please try again.';
            if (error.message.includes('User not found') || error.message.includes('not found')) {
                errorMessage = '❌ No account found with this email. Please sign up first.';
            } else if (error.message.includes('password') || error.message.includes('Invalid credentials')) {
                errorMessage = '❌ Incorrect password. Please try again.';
            } else if (error.message.includes('Email')) {
                errorMessage = '❌ Invalid email address.';
            }
            QuizUtils.showNotification(errorMessage, 'error');
            ButtonLoader.hide(submitBtn);
        });
}

async function handleGoogleSignIn() {
    const googleBtn = document.getElementById('google-signin-btn');
    ButtonLoader.show(googleBtn);

    try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded. Please refresh the page.');
        }
        
        // Check if Firebase app is initialized
        if (!firebase.apps || firebase.apps.length === 0) {
            throw new Error('Firebase not initialized. Please check firebase-config.js configuration.');
        }
        
        // Check if Google provider is configured
        if (!window.googleProvider) {
            throw new Error('Google Sign-In provider not configured. Please check firebase-config.js.');
        }

        // Sign in with Google popup
        const result = await firebase.auth().signInWithPopup(window.googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();

        // Send token to backend
        const response = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idToken: idToken,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL
            })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token);
            QuizUtils.showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            throw new Error(data.message || 'Google sign-in failed');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        QuizUtils.showNotification(error.message || 'Google sign-in failed. Please try again.', 'error');
        ButtonLoader.hide(googleBtn);
    }
}
