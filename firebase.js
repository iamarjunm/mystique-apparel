// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Check if Firebase config is valid
const isFirebaseConfigValid = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase only on client-side, not during build time
let app;
let auth;
let db;
let analytics = null;

if (typeof window !== 'undefined') {
  try {
    if (!isFirebaseConfigValid()) {
      console.warn('⚠️ Firebase config is incomplete. Check NEXT_PUBLIC_FIREBASE_* environment variables.');
      console.warn('Firebase config:', {
        apiKey: firebaseConfig.apiKey ? '✓' : '✗',
        authDomain: firebaseConfig.authDomain ? '✓' : '✗',
        projectId: firebaseConfig.projectId ? '✓' : '✗',
        appId: firebaseConfig.appId ? '✓' : '✗',
      });
    } else {
      // Client-side only initialization
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase Analytics initialization skipped:', err.message);
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
  }
}

export { app, auth, db, analytics, isFirebaseConfigValid };