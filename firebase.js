// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOJfbjWE_P7a8by1190-YmL2ZV9I2-KCg",
  authDomain: "mystique-apparel.firebaseapp.com",
  projectId: "mystique-apparel",
  storageBucket: "mystique-apparel.firebasestorage.app",
  messagingSenderId: "1030825951926",
  appId: "1:1030825951926:web:ef3731b8d3a72b62759c17",
  measurementId: "G-P1KZNZNXME"
};

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };