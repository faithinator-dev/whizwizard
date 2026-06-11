// =====================
// Login Page JavaScript
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to initialize before checking auth
    const checkAuthAndInit = () => {
        if (window.isFirebaseReady && window.isFirebaseReady()) {
            // Check if user is already authenticated via Firebase
            const currentFirebaseUser = window.auth.currentUser;
            if (currentFirebaseUser) {
                console.log('✅ User already logged in, redirecting...');
                window.location.href = 'index.html';
                return;
            }
        }
        
        // Check localStorage as fallback
        if (Auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
        
        // Setup form submission
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        
        // Setup Google Sign-In (hide if Firebase not configured)
        const googleBtn = document.getElementById('google-signin-btn');
        if (googleBtn) {
            // Check if Firebase is configured
            if (window.firebaseConfigured === false) {
                // Hide Google Sign-In button
                googleBtn.style.display = 'none';
                console.log('ℹ️ Google Sign-In disabled - Firebase not configured');
            } else {
                googleBtn.addEventListener('click', handleGoogleSignIn);
            }
        }
    };
    
    // Wait a moment for Firebase to initialize
    if (window.firebaseConfigured) {
        checkAuthAndInit();
    } else {
        setTimeout(checkAuthAndInit, 500);
    }
});

async function handleLogin(e) {
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

    try {
        // Use Firebase service for login
        const result = await FirebaseService.auth.login(email, password);
        
        if (result.success) {
            QuizUtils.showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            // Show specific error message
            let errorMessage = result.message || 'Login failed. Please try again.';
            
            if (errorMessage.includes('user-not-found')) {
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (errorMessage.includes('wrong-password')) {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (errorMessage.includes('invalid-email')) {
                errorMessage = 'Invalid email address.';
            }
            
            QuizUtils.showNotification(errorMessage, 'error');
            ButtonLoader.hide(submitBtn);
        }
    } catch (error) {
        console.error('Login error:', error);
        QuizUtils.showNotification('Login failed. Please try again.', 'error');
        ButtonLoader.hide(submitBtn);
    }
}

async function handleGoogleSignIn() {
    const googleBtn = document.getElementById('google-signin-btn');
    ButtonLoader.show(googleBtn);

    try {
        // Use Firebase service for Google sign-in
        const result = await FirebaseService.auth.googleSignIn();

        if (result.success) {
            QuizUtils.showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            throw new Error(result.message || 'Google sign-in failed');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        QuizUtils.showNotification(error.message || 'Google sign-in failed. Please try again.', 'error');
        ButtonLoader.hide(googleBtn);
    }
}
