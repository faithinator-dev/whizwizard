const admin = require('firebase-admin');

// Initialize Firebase Admin
const initializeFirebase = () => {
    try {
        // Check if credentials are provided via service account file
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            // Use environment variables for credentials
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
        }

        console.log('✅ Firebase Admin initialized successfully');
        console.log(`📊 Project: ${admin.app().options.credential.projectId || process.env.FIREBASE_PROJECT_ID}`);
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
