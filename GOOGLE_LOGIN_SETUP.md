# Adding Google Sign-In to WhizWizard

This guide shows you how to add Google OAuth login to your WhizWizard application.

## Prerequisites

- Firebase project already set up
- Firebase Authentication enabled
- Your app already uses Firebase

---

## Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **WhizWizard** project
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Google** in the providers list
5. Click on it and toggle **Enable**
6. Enter a **Support email** (use your email address)
7. Click **Save**

---

## Step 2: Add Firebase Web SDK to Frontend

### Option A: Using CDN (Recommended for this project)

Add these scripts to your HTML files (login.html, signup.html):

```html
<!-- Add before closing </body> tag -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
```

### Option B: Using NPM (if you bundle your frontend)

```bash
npm install firebase
```

---

## Step 3: Initialize Firebase in Frontend

Create a new file `src/js/firebase-config.js`:

```javascript
// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth instance
const firebaseAuth = firebase.auth();

// Configure Google Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
```

**Get your config from:** Firebase Console → Project Settings → General → Your apps → Web app

---

## Step 4: Update Login Page UI

Add a Google Sign-In button to `src/login.html`:

```html
<!-- Add after the regular login button -->
<div class="divider">
    <span>OR</span>
</div>

<button type="button" id="google-login-btn" class="btn-google">
    <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64,9.2c0-0.74-0.06-1.28-0.19-1.84H9v3.34h4.96c-0.1,0.83-0.64,2.08-1.84,2.92l2.84,2.2C16.66,14.09,17.64,11.85,17.64,9.2z"/>
        <path fill="#34A853" d="M9,18c2.43,0,4.47-0.8,5.96-2.18l-2.84-2.2c-0.76,0.53-1.78,0.9-3.12,0.9c-2.38,0-4.4-1.57-5.12-3.74L0.97,13.04C2.45,15.98,5.48,18,9,18z"/>
        <path fill="#FBBC05" d="M3.88,10.78C3.69,10.22,3.58,9.62,3.58,9c0-0.62,0.11-1.22,0.29-1.78L0.97,4.96C0.35,6.18,0,7.55,0,9c0,1.45,0.35,2.82,0.97,4.04L3.88,10.78z"/>
        <path fill="#EA4335" d="M9,3.58c1.55,0,2.61,0.67,3.21,1.23l2.37-2.37C13.46,1.09,11.43,0,9,0C5.48,0,2.45,2.02,0.97,4.96l2.91,2.26C4.6,5.15,6.62,3.58,9,3.58z"/>
    </svg>
    Continue with Google
</button>
```

Add CSS for the Google button:

```css
.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.5rem 0;
    color: var(--text-secondary);
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--accent-navy);
}

.divider span {
    padding: 0 1rem;
    font-size: 0.9rem;
}

.btn-google {
    width: 100%;
    padding: 0.75rem;
    background: white;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
}

.btn-google:hover {
    background: #f8f8f8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

---

## Step 5: Add Google Sign-In Logic

Update `src/js/login.js`:

```javascript
// Add this to your login.js file

document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Google Sign-In Handler
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
});

async function handleGoogleLogin() {
    try {
        // Sign in with Google popup
        const result = await firebaseAuth.signInWithPopup(googleProvider);
        
        // Get user info
        const user = result.user;
        const idToken = await user.getIdToken();

        // Send token to your backend for verification
        const response = await fetch('http://localhost:3000/api/auth/google', {
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
            // Save user data
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token);
            
            // Redirect to home
            window.location.href = 'index.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Google login error:', error);
        alert('Google login failed. Please try again.');
    }
}
```

---

## Step 6: Add Backend Endpoint for Google Auth

Create a new route in `server/controllers/authController.js`:

```javascript
// @desc    Google Sign-In
// @route   POST /api/auth/google
// @access  Public
exports.googleSignIn = async (req, res) => {
    try {
        const { idToken, email, name, photoURL } = req.body;

        // Verify the Google ID token with Firebase Admin
        const auth = getAuth();
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (decodedToken.email !== email) {
            return res.status(400).json({
                success: false,
                message: 'Token verification failed'
            });
        }

        // Check if user exists
        let user = await User.findByEmail(email);

        if (!user) {
            // Create new user
            user = new User({
                name: name || email.split('@')[0],
                email: email.toLowerCase().trim(),
                password: null, // No password for OAuth users
                photoURL: photoURL || null,
                provider: 'google'
            });
            await user.save();

            // Update Firebase Auth user
            await auth.updateUser(decodedToken.uid, {
                displayName: name
            });
        }

        // Generate custom token
        const customToken = await auth.createCustomToken(decodedToken.uid);

        res.json({
            success: true,
            token: customToken,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
};
```

Add the route in `server/routes/auth.js`:

```javascript
const express = require('express');
const router = express.Router();
const { register, login, googleSignIn } = require('../controllers/authController');
const { body } = require('express-validator');

// ... existing routes ...

// Google Sign-In
router.post('/google', googleSignIn);

module.exports = router;
```

---

## Step 7: Update User Model

Modify `server/models/User.js` to support OAuth users:

```javascript
// Add to the User class
static validate(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
        errors.push('Valid email is required');
    }
    
    // Password is optional for OAuth users
    if (data.password !== null && data.password !== undefined) {
        if (data.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
    }
    
    return errors;
}
```

---

## Step 8: Test the Implementation

1. **Start your backend:**
   ```bash
   npm start
   ```

2. **Open login.html** in your browser

3. **Click "Continue with Google"**

4. **Select your Google account**

5. **You should be redirected to the home page logged in!**

---

## Security Considerations

✅ **ID Token Verification**: Your backend verifies tokens with Firebase Admin SDK  
✅ **HTTPS Required**: Google OAuth requires HTTPS in production  
✅ **Token Storage**: Store tokens securely (HttpOnly cookies recommended for production)  
✅ **CORS Configuration**: Ensure your backend allows requests from your frontend domain

---

## Troubleshooting

### "Popup blocked" error
- Allow popups for your domain
- Or use `signInWithRedirect()` instead of `signInWithPopup()`

### "unauthorized_client" error
- Check that you added your domain to Firebase Console → Authentication → Settings → Authorized domains

### "Token verification failed"
- Ensure your `firebase-service-account.json` is correctly configured in the backend
- Check that the Firebase project ID matches

---

## Next Steps

Once Google login works, you can also add:
- Facebook Login
- GitHub Login
- Twitter Login
- Microsoft Login

All follow similar patterns in Firebase Authentication!

---

**Need help?** Check the Firebase Auth documentation: https://firebase.google.com/docs/auth/web/google-signin
