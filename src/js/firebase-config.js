// Firebase Client Configuration
// This file is for frontend Firebase SDK initialization (needed for Google Login)
// Get these values from Firebase Console -> Project Settings -> General -> Your apps

const firebaseConfig = {
    // REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIG VALUES
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase (only if firebase is loaded)
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
        
        // Get Auth instance
        window.firebaseAuth = firebase.auth();
        
        // Configure Google Provider
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.googleProvider.addScope('profile');
        window.googleProvider.addScope('email');
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
} else {
    console.warn('Firebase SDK not loaded. Google Sign-In will not work.');
}
