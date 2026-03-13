import admin from 'firebase-admin';

function formatPrivateKey(key) {
    if (!key) return undefined;
    // Replace actual literal '\n' characters with actual newlines
    return key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Ensure private key is correctly formatted from env string
                privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
            }),
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error.stack);
    }
}

export default admin;
