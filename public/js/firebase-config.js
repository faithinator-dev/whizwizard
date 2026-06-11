// =====================
// Firebase Client Configuration
// Complete Firebase SDK initialization for WhizWizard
// =====================

// Firebase Configuration
// IMPORTANT: Update these values with your Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyBnHtdts27JXoAnfJCTJItOR5MwOZz9hCQ",
  authDomain: "whizwizard-b0b39.firebaseapp.com",
  projectId: "whizwizard-b0b39",
  storageBucket: "whizwizard-b0b39.firebasestorage.app",
  messagingSenderId: "145308955230",
  appId: "1:145308955230:web:624b7e1eeb69f6cd2b7acf",
  measurementId: "G-S2DZ610XZ0"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    try {
        // Check if config is set
        if (firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('⚠️ Firebase configuration not set. Please update firebase-config.js');
            window.firebaseConfigured = false;
        } else {
            // Initialize Firebase App
            firebase.initializeApp(firebaseConfig);
            window.firebaseConfigured = true;
            
            // Initialize Firebase Services
            window.auth = firebase.auth();
            window.db = firebase.firestore();
            
            // Configure Google Provider
            window.googleProvider = new firebase.auth.GoogleAuthProvider();
            window.googleProvider.addScope('profile');
            window.googleProvider.addScope('email');
            
            console.log('✅ Firebase initialized successfully');
            console.log('📦 Project:', firebaseConfig.projectId);
            console.log('🔐 Auth enabled');
            console.log('🗄️ Firestore enabled');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        window.firebaseConfigured = false;
    }
} else {
    console.error('❌ Firebase SDK not loaded');
    console.log('Required: firebase-app, firebase-auth, firebase-firestore');
}

// Helper to check if Firebase is ready
window.isFirebaseReady = () => {
    return window.firebaseConfigured && 
           typeof window.auth !== 'undefined' && 
           typeof window.db !== 'undefined';
};

// =====================
// Auto-Login: Detect Firebase Auth State
// =====================
if (window.firebaseConfigured && window.auth) {
    // Listen for auth state changes (automatic login detection)
    window.auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in (from Google, email, or persisted session)
            console.log('🔐 User detected:', user.email);
            
            try {
                // Get user data from Firestore
                const userDoc = await window.db.collection('users').doc(user.uid).get();
                const userData = userDoc.exists ? userDoc.data() : {};
                
                // Update localStorage with current user
                const currentUser = {
                    id: user.uid,
                    uid: user.uid,
                    name: user.displayName || userData.name || 'User',
                    email: user.email,
                    photoURL: user.photoURL || userData.photoURL || null,
                    role: userData.role || 'user'
                };
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Dispatch custom event to notify pages that user is logged in
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: currentUser }));
                
                console.log('✅ Auto-login successful:', currentUser.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        } else {
            // User is signed out
            console.log('👤 No user detected - user must login/signup');
            
            // Clear user data when signed out
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user');
        }
    });
    
    console.log('🔄 Firebase auth state listener initialized');
}
