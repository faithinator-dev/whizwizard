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
    
    // Setup Google Sign-In
    document.getElementById('google-signin-btn').addEventListener('click', handleGoogleSignIn);
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
    ButtonLoader.show(submitBtn);

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
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // Get ID token
        const idToken = await user.getIdToken();

        // Send to backend
        const response = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idToken: idToken,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            QuizUtils.showNotification('Signed up successfully with Google!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            throw new Error(data.message || 'Google Sign-In failed');
        }
    } catch (error) {
        console.error('Google Sign-In error:', error);
        QuizUtils.showNotification(error.message || 'Google Sign-In failed', 'error');
        ButtonLoader.hide(googleBtn);
    }
}
