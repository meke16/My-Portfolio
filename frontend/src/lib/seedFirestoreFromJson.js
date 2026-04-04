import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import adminInfoRaw from "../data/admin_info.json";
import projectsSeedRaw from "../data/projects.json";
import skillsSeedRaw from "../data/skills.json";

/** Firestore root doc must be a plain object, not an array (SQL exports often use `[{...}]`). */
function normalizeAdminInfoForFirestore(raw) {
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error(
      "admin_info.json must be a JSON object or a one-element array of an object."
    );
  }
  const socials = row.socials && typeof row.socials === "object" && !Array.isArray(row.socials)
    ? row.socials
    : {};
  return {
    name: row.name ?? "",
    title: row.title ?? "",
    bio: row.bio ?? "",
    email: row.email ?? "",
    phones: Array.isArray(row.phones) ? row.phones : [],
    locations: Array.isArray(row.locations) ? row.locations : [],
    profile_image: row.profile_image ?? row.profileImage ?? "",
    heroImage: row.heroImage ?? row.hero_image ?? "",
    galleryImages: Array.isArray(row.galleryImages)
      ? row.galleryImages
      : Array.isArray(row.gallery_images)
        ? row.gallery_images
        : [],
    socials: {
      github: socials.github ?? "",
      linkedin: socials.linkedin ?? "",
      twitter: socials.twitter ?? "",
      facebook: socials.facebook ?? "",
      tiktok: socials.tiktok ?? "",
      instagram: socials.instagram ?? "",
    },
  };
}

function normalizeProjectsSeed(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("projects.json must be a JSON array of projects.");
  }
  return raw;
}

function normalizeSkillsSeed(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("skills.json must be a JSON array of skills.");
  }
  return raw;
}

/**
 * Merges profile into info/main; appends each skill and project from bundled JSON.
 * Running twice duplicates skills/projects — use only for empty collections or after manual delete.
 */
export async function seedFirestoreFromJson(db) {
  const adminInfo = normalizeAdminInfoForFirestore(adminInfoRaw);
  const projectsSeed = normalizeProjectsSeed(projectsSeedRaw);
  const skillsSeed = normalizeSkillsSeed(skillsSeedRaw);

  await setDoc(doc(db, "info", "main"), adminInfo, { merge: true });

  for (const s of skillsSeed) {
    const { id: _drop, ...rest } = s;
    await addDoc(collection(db, "skills"), {
      name: rest.name || "",
      category: rest.category || "Other",
      proficiency: Number(rest.proficiency) || 0,
      logo: rest.logo || "",
    });
  }

  for (const p of projectsSeed) {
    const { id: _drop, ...rest } = p;
    await addDoc(collection(db, "projects"), {
      title: rest.title || "",
      description: rest.description || "",
      image: Array.isArray(rest.image) ? rest.image : [],
      url: rest.url || "",
      github_url: rest.github_url || "",
      technologies: rest.technologies || "",
      featured: Boolean(rest.featured),
      year: rest.year || "",
    });
  }
}
