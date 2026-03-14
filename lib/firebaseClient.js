import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Only initialize if we have the minimum required config
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;
const app = (isConfigValid && getApps().length === 0) ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApp() : null);

// Messaging instance
let messaging = null;

export const requestNotificationPermissionAndToken = async () => {
    try {
        const supported = await isSupported();
        if (!supported || !app) {
            console.log("Firebase Messaging is not supported or Firebase is not configured.");
            return null;
        }

        messaging = getMessaging(app);

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Get FCM device token
            const curToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // Optional but recommended
            });
            if (curToken) {
                console.log('FCM Token generated');
                return curToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission or token', error);
        return null;
    }
};

export { app, messaging };
