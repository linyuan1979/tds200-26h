import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase reads these values from the .env file.
// The EXPO_PUBLIC_ prefix makes them available in client-side code.
// Never paste real keys here — always use environment variables.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// db is the Firestore database instance we import in every API function.
export const db = getFirestore(app);
