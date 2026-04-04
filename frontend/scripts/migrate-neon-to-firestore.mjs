/**
 * One-off migration: Neon (Postgres) → Firestore (portfolio app shape).
 *
 * 1. Firebase Console → Project settings → Service accounts → Generate new private key
 *    Save JSON outside the repo; point GOOGLE_APPLICATION_CREDENTIALS at it.
 * 2. Copy Neon connection string (Dashboard → Connection string → URI).
 * 3. Copy scripts/.env.migrate.example → scripts/.env.migrate and fill values.
 * 4. Edit the SQL_* constants below to match YOUR table and column names.
 * 5. From frontend/:  npm run migrate:neon-firestore
 *
 * Re-running adds duplicate skill/project/message docs. Clear those collections first if needed.
 *
 * Firestore targets:
 *   info/main          — single profile document
 *   skills             — one doc per row (auto IDs)
 *   projects           — one doc per row (auto IDs)
 *   messages (opt.)    — contact messages
 */

import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env.migrate") });

// ── Edit these queries for your Neon schema ─────────────────────────────────
const SQL_PROFILE = `
  SELECT * FROM profile LIMIT 1
`;
const SQL_SKILLS = `
  SELECT * FROM skills ORDER BY id
`;
const SQL_PROJECTS = `
  SELECT * FROM projects ORDER BY id
`;
/** Set to null to skip */
const SQL_MESSAGES = `
  SELECT * FROM contact_messages ORDER BY created_at
`;

const { Pool } = pg;

function lowerKeys(row) {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
  );
}

function parseStringArray(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "object") return Object.values(val).filter(Boolean).map(String);
  if (typeof val === "string") {
    const t = val.trim();
    if (!t) return [];
    try {
      const j = JSON.parse(t);
      if (Array.isArray(j)) return j.map(String);
    } catch {
      /* comma-separated */
    }
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseImageArray(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") {
    try {
      const j = JSON.parse(val);
      if (Array.isArray(j)) return j.map(String);
    } catch {
      /* single URL */
    }
    return val.trim() ? [val.trim()] : [];
  }
  return [];
}

function rowToProfile(row) {
  if (!row) return null;
  const r = lowerKeys(row);
  return {
    name: r.name ?? r.full_name ?? r.display_name ?? "",
    title: r.title ?? r.job_title ?? r.headline ?? "",
    bio: r.bio ?? r.about ?? r.description ?? "",
    email: r.email ?? "",
    phone: r.phone ?? r.phone_number ?? "",
    location: r.location ?? r.city ?? "",
    profile_image: r.profile_image ?? r.avatar_url ?? r.photo_url ?? "",
    socials: {
      github: String(r.github ?? r.social_github ?? r.github_username ?? "").replace(
        /^https?:\/\/(www\.)?github\.com\//i,
        ""
      ),
      linkedin: String(r.linkedin ?? r.social_linkedin ?? "").replace(
        /^https?:\/\/(www\.)?linkedin\.com\/in\//i,
        ""
      ),
      twitter: String(r.twitter ?? r.social_twitter ?? r.x_username ?? "").replace(
        /^https?:\/\/(www\.)?twitter\.com\//i,
        ""
      ),
      facebook: String(r.facebook ?? r.social_facebook ?? ""),
      tiktok: String(r.tiktok ?? r.social_tiktok ?? "").replace(/^@/, ""),
      instagram: String(r.instagram ?? r.social_instagram ?? "").replace(/^@/, ""),
    },
  };
}

function rowToSkill(row) {
  const r = lowerKeys(row);
  return {
    name: r.name ?? r.skill_name ?? "",
    category: r.category ?? r.type ?? "Other",
    proficiency: Number(r.proficiency ?? r.level ?? 80),
    logo: r.logo ?? r.logo_url ?? r.icon_url ?? "",
  };
}

function rowToProject(row) {
  const r = lowerKeys(row);
  return {
    title: r.title ?? r.name ?? "",
    description: r.description ?? r.summary ?? "",
    image: parseImageArray(r.image ?? r.images ?? r.image_urls),
    tech: parseStringArray(r.tech ?? r.technologies ?? r.stack),
    github: r.github ?? r.repo_url ?? r.github_url ?? "",
    live: r.live ?? r.live_url ?? r.demo_url ?? r.url ?? "",
    featured: Boolean(r.featured ?? r.is_featured ?? false),
  };
}

function rowToMessage(row) {
  const r = lowerKeys(row);
  const created =
    r.created_at instanceof Date
      ? r.created_at
      : r.created_at
        ? new Date(r.created_at)
        : new Date();
  return {
    name: r.name ?? r.sender_name ?? "",
    email: r.email ?? r.sender_email ?? "",
    subject: r.subject ?? "",
    message: r.message ?? r.body ?? "",
    read: Boolean(r.read ?? r.is_read ?? false),
    createdAt: admin.firestore.Timestamp.fromDate(created),
  };
}

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    throw new Error("Set DATABASE_URL (Neon Postgres connection URI) in scripts/.env.migrate");
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    throw new Error(
      "Set GOOGLE_APPLICATION_CREDENTIALS to the absolute path of your Firebase service account JSON"
    );
  }

  const abs = resolve(credPath);
  const serviceAccount = JSON.parse(readFileSync(abs, "utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  const db = admin.firestore();

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: true },
  });

  try {
    const { rows: profileRows } = await pool.query(SQL_PROFILE);
    const profile = rowToProfile(profileRows[0]);
    if (profile && profile.name) {
      await db.collection("info").doc("main").set(profile, { merge: true });
      console.log("Wrote info/main (profile)");
    } else {
      console.warn("No profile row or empty name — skipped info/main (check SQL_PROFILE / column names)");
    }

    const { rows: skillRows } = await pool.query(SQL_SKILLS);
    let skillsCount = 0;
    for (const row of skillRows) {
      const data = rowToSkill(row);
      if (!data.name) continue;
      await db.collection("skills").add(data);
      skillsCount += 1;
    }
    console.log(`Imported ${skillsCount} skills`);

    const { rows: projectRows } = await pool.query(SQL_PROJECTS);
    let projectsCount = 0;
    for (const row of projectRows) {
      const data = rowToProject(row);
      if (!data.title) continue;
      await db.collection("projects").add(data);
      projectsCount += 1;
    }
    console.log(`Imported ${projectsCount} projects`);

    if (SQL_MESSAGES?.trim()) {
      const { rows: msgRows } = await pool.query(SQL_MESSAGES);
      let msgCount = 0;
      for (const row of msgRows) {
        const data = rowToMessage(row);
        if (!data.email && !data.message) continue;
        await db.collection("messages").add(data);
        msgCount += 1;
      }
      console.log(`Imported ${msgCount} messages`);
    }
  } finally {
    await pool.end();
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
