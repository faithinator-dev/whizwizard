// =====================
// Signup Page JavaScript
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
        document.getElementById('signup-form').addEventListener('submit', handleSignup);
        
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

async function handleSignup(e) {
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

    try {
        // Use Firebase service for registration
        const result = await FirebaseService.auth.register(name, email, password);

        if (result.success) {
            QuizUtils.showNotification('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            // Show specific error message
            let errorMessage = result.message || 'Signup failed. Please try again.';
            
            if (errorMessage.includes('email-already-in-use')) {
                errorMessage = 'Email already registered. Please login instead.';
            } else if (errorMessage.includes('invalid-email')) {
                errorMessage = 'Invalid email address.';
            } else if (errorMessage.includes('weak-password')) {
                errorMessage = 'Password must be at least 6 characters.';
            }
            
            QuizUtils.showNotification(errorMessage, 'error');
            ButtonLoader.hide(submitBtn);
        }
    } catch (error) {
        console.error('Signup error:', error);
        QuizUtils.showNotification('Signup failed. Please try again.', 'error');
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
            QuizUtils.showNotification('Signed up successfully with Google!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            throw new Error(result.message || 'Google Sign-In failed');
        }
    } catch (error) {
        console.error('Google Sign-In error:', error);
        QuizUtils.showNotification(error.message || 'Google Sign-In failed', 'error');
        ButtonLoader.hide(googleBtn);
    }
}
