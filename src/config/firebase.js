import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Sambodhi Sarang Marriage Bureau Official Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAwpIdVDUaZjhQU1TyNaZvWegJt8x3OdLQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sambodhi-sarang.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sambodhi-sarang",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sambodhi-sarang.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "648384881977",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:648384881977:web:4c62ae58fd638b112b74e8"
};

// Check if Firebase configuration keys are present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket
);

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
