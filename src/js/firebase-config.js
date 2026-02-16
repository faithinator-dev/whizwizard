// =====================
// Firebase Client Configuration
// Complete Firebase SDK initialization for WhizWizard
// =====================

// Firebase Configuration
// IMPORTANT: Update these values with your Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY_HERE',
    authDomain: 'whizwizard-b0b39.firebaseapp.com',
    projectId: 'whizwizard-b0b39',
    storageBucket: 'whizwizard-b0b39.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
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
