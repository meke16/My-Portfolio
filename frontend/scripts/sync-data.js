/**
 * Sync script: pulls real data from Firebase Firestore and writes it to src/data/portfolioData.json.
 * Run: node scripts/sync-data.js
 * Usage:
 *   node scripts/sync-data.js                          # uses .env VITE_FIREBASE_* vars
 *   node scripts/sync-data.js --apiKey KEY --pid ID    # pass credentials directly
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");

function parseEnv(path) {
  const result = {};
  try {
    const lines = readFileSync(path, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  } catch {
    /* no env file */
  }
  return result;
}

function env(key, fallback = "") {
  return process.env[key] ?? process.argv.find((a) => a.startsWith(`--${key.toLowerCase()}=`))?.split("=")[1] ?? fallback;
}

async function main() {
  const envVars = parseEnv(envPath);
  const apiKey = env("VITE_FIREBASE_API_KEY") || envVars.VITE_FIREBASE_API_KEY;
  const projectId = env("VITE_FIREBASE_PROJECT_ID") || envVars.VITE_FIREBASE_PROJECT_ID;
  const appId = env("VITE_FIREBASE_APP_ID") || envVars.VITE_FIREBASE_APP_ID;
  const messagingSenderId = env("VITE_FIREBASE_MESSAGING_SENDER_ID") || envVars.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const authDomain = env("VITE_FIREBASE_AUTH_DOMAIN") || envVars.VITE_FIREBASE_AUTH_DOMAIN;
  const storageBucket = env("VITE_FIREBASE_STORAGE_BUCKET") || envVars.VITE_FIREBASE_STORAGE_BUCKET;
  const measurementId = env("VITE_FIREBASE_MEASUREMENT_ID") || envVars.VITE_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !projectId) {
    console.error("❌ Firebase credentials not found. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env");
    process.exit(1);
  }

  const firebaseConfig = {
    apiKey,
    projectId,
    appId,
    messagingSenderId,
    authDomain,
    storageBucket,
    measurementId,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log("🔄 Syncing data from Firebase...");

  try {
    const [infoSnap, skillsSnap, projectsSnap, aboutSnap] = await Promise.all([
      getDoc(doc(db, "info", "main")),
      getDocs(collection(db, "skills")),
      getDocs(collection(db, "projects")),
      getDoc(doc(db, "content", "about")),
    ]);

    const data = {
      info: infoSnap.exists() ? infoSnap.data() : {},
      projects: projectsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
      skills: skillsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
      about: aboutSnap.exists() ? aboutSnap.data() : {},
    };

    const dataDir = join(root, "src", "data");
    mkdirSync(dataDir, { recursive: true });
    const outPath = join(dataDir, "portfolioData.json");
    writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`✅ Data synced to ${outPath}`);
    console.log(`   Info: ${infoSnap.exists() ? "yes" : "no"}`);
    console.log(`   Projects: ${projectsSnap.docs.length}`);
    console.log(`   Skills: ${skillsSnap.docs.length}`);
    console.log(`   About: ${aboutSnap.exists() ? "yes" : "no"}`);
  } catch (err) {
    console.error("❌ Failed to sync data:", err.message || err);
    process.exit(1);
  }
}

main();
