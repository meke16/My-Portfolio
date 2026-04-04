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

const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const firebaseConfig = buildFirebaseConfig();
const missing = requiredKeys.filter((k) => !import.meta.env[k]);

let app = null;
let db = null;
let auth = null;
let storage = null;

if (missing.length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    if (typeof window !== "undefined") {
      import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
        isSupported().then((supported) => {
          if (supported) getAnalytics(app);
        });
      });
    }
  } catch (e) {
    console.error("[Firebase] initializeApp failed:", e);
  }
} else if (typeof window !== "undefined") {
  console.warn(
    `[Firebase] Missing env: ${missing.join(", ")} — add frontend/.env (see .env.example). Auth and Firestore are disabled until then.`
  );
}

export { app, db, auth, storage };
