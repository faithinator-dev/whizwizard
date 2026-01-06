const admin = require('firebase-admin');

// Initialize Firebase Admin
const initializeFirebase = () => {
    try {
        // Check if individual credentials are provided via environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                })
            });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Fallback to service account file
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            throw new Error('No Firebase credentials found. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
        }

        console.log('✅ Firebase Admin initialized successfully');
        console.log(`📊 Project: ${process.env.FIREBASE_PROJECT_ID || admin.app().options.credential.projectId}`);
    } catch (error) {
        console.error(`❌ Firebase initialization error: ${error.message}`);
        process.exit(1);
    }
};

// Get Firestore instance
const getFirestore = () => {
    return admin.firestore();
};

// Get Auth instance
const getAuth = () => {
    return admin.auth();
};

module.exports = {
    initializeFirebase,
    getFirestore,
    getAuth,
    admin
};
