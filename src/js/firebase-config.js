// Firebase Client Configuration
// This file is for frontend Firebase SDK initialization (needed for Google Login)
// 
//  IMPORTANT: YOU MUST UPDATE THIS FILE WITH YOUR ACTUAL FIREBASE CREDENTIALS
// 
//  See FIREBASE_WEB_CONFIG.md for detailed instructions on how to get these values
// 
// Quick Steps:
// 1. Go to https://console.firebase.google.com/
// 2. Select project: whizwizard-b0b39
// 3. Click gear icon  Project Settings
// 4. Scroll to 'Your apps'  Web app (</>)
// 5. Copy the firebaseConfig values below

const firebaseConfig = {
    //  REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE CONSOLE 
    apiKey: 'YOUR_API_KEY_HERE',  // Example: 'AIzaSyB...'
    authDomain: 'whizwizard-b0b39.firebaseapp.com',  //  Correct
    projectId: 'whizwizard-b0b39',  //  Correct
    storageBucket: 'whizwizard-b0b39.appspot.com',  //  Correct
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',  // Example: '123456789012'
    appId: 'YOUR_APP_ID'  // Example: '1:123456789012:web:abc123def456'
};

// Initialize Firebase (only if firebase is loaded)
if (typeof firebase !== 'undefined') {
    try {
        // Check if config is still using placeholders
        if (firebaseConfig.apiKey === 'YOUR_API_KEY_HERE' || 
            firebaseConfig.apiKey.includes('XXXX')) {
            throw new Error('Firebase configuration not set. Please update firebase-config.js with your actual credentials. See FIREBASE_WEB_CONFIG.md for instructions.');
        }
        
        firebase.initializeApp(firebaseConfig);
        console.log(' Firebase initialized successfully');
        console.log(' Project ID:', firebaseConfig.projectId);
        
        // Get Auth instance
        window.firebaseAuth = firebase.auth();
        
        // Configure Google Provider
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.googleProvider.addScope('profile');
        window.googleProvider.addScope('email');
        
        console.log(' Google Sign-In provider configured');
        
    } catch (error) {
        console.error(' Firebase initialization error:', error.message);
        console.error(' Please check FIREBASE_WEB_CONFIG.md for setup instructions');
        
        // Show user-friendly error
        if (error.message.includes('api-key-not-valid')) {
            alert('Firebase configuration error!\n\nPlease update src/js/firebase-config.js with your actual Firebase credentials.\n\nSee FIREBASE_WEB_CONFIG.md for instructions.');
        }
    }
} else {
    console.warn(' Firebase SDK not loaded. Make sure Firebase scripts are included in your HTML.');
    console.log('Expected scripts:');
    console.log('- https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
    console.log('- https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
}
