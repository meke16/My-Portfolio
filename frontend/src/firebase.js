import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

function buildFirebaseConfig() {
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim();
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL?.trim();
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    ...(databaseURL ? { databaseURL } : {}),
    ...(measurementId ? { measurementId } : {}),
  };
}

const firebaseConfig = buildFirebaseConfig();

const required = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
];

const missing = required.filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  throw new Error(
    `Firebase env missing: ${missing.join(", ")}. Copy .env.example to .env in frontend/ and fill values.`
  );
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) getAnalytics(app);
    });
  });
}

export { app };
