import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { normalizeProjectDoc } from "../lib/firestorePortfolio";
import {
  defaultAboutContent,
  defaultWorkExperience,
  normalizeAboutContent,
  normalizeWorkExperience,
} from "../contentSchemas";
import portfolioDataFallback from "../data/portfolioData.json";

const FirestorePortfolioContext = createContext(null);

function normalizeSkillType(value, category) {
  const type = String(value || "").trim().toLowerCase();
  if (type === "hard" || type === "soft") return type;
  const c = String(category || "").trim().toLowerCase();
  const softHints = [
    "soft", "communication", "leadership", "teamwork", "collaboration",
    "problem solving", "adaptability", "time management",
  ];
  return softHints.some((hint) => c.includes(hint)) ? "soft" : "hard";
}

function normalizeSkills(list) {
  return (Array.isArray(list) ? list : []).map((s, idx) => ({
    id: s?.id || `skill-${idx}`,
    ...s,
    proficiency: Number(s?.proficiency) || 0,
    skillType: normalizeSkillType(s?.skillType, s?.category),
  }));
}

function loadFallbackData() {
  const fb = portfolioDataFallback || {};
  return {
    info: fb.info || {},
    projects: (fb.projects || []).map((p) =>
      normalizeProjectDoc(p.id || p.title, p)
    ),
    skills: normalizeSkills(fb.skills || []),
    about: fb.about && typeof fb.about === "object"
      ? normalizeAboutContent(fb.about)
      : defaultAboutContent,
    workExperience: fb.workExperience && typeof fb.workExperience === "object"
      ? normalizeWorkExperience(fb.workExperience)
      : defaultWorkExperience,
  };
}

export function FirestorePortfolioProvider({ children }) {
  // Pre-load fallback data immediately so the page renders without waiting
  const initialFallback = useMemo(() => loadFallbackData(), []);
  const hasRealFallback = Object.keys(initialFallback.info || {}).length > 0 ||
    (initialFallback.projects || []).length > 0 ||
    (initialFallback.skills || []).length > 0;

  const [loading, setLoading] = useState(!hasRealFallback);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const [info, setInfo] = useState(initialFallback.info || {});
  const [projects, setProjects] = useState(initialFallback.projects || []);
  const [skills, setSkills] = useState(initialFallback.skills || []);
  const [about, setAbout] = useState(initialFallback.about);
  const [workExperience, setWorkExperience] = useState(initialFallback.workExperience);

  const reload = useCallback(async () => {
    setError(null);
    setFromCache(false);

    const fallback = loadFallbackData();

    // ── 1. Try Firebase ────────────────────────────────────────
    if (db) {
      try {
        const [infoSnap, skillsSnap, projectsSnap, aboutSnap, workExperienceSnap] = await Promise.all([
          getDoc(doc(db, "info", "main")),
          getDocs(collection(db, "skills")),
          getDocs(collection(db, "projects")),
          getDoc(doc(db, "content", "about")),
          getDoc(doc(db, "content", "workExperience")),
        ]);

        const rawInfo = infoSnap.exists() ? infoSnap.data() : fallback.info;
        const rawSkills = skillsSnap.docs.length > 0
          ? normalizeSkills(skillsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            proficiency: Number(d.data().proficiency) || 0,
          })))
          : fallback.skills;
        const rawProjects = projectsSnap.docs.length > 0
          ? projectsSnap.docs.map((d) => normalizeProjectDoc(d.id, d.data()))
          : fallback.projects;
        const rawAbout = aboutSnap.exists()
          ? normalizeAboutContent(aboutSnap.data())
          : fallback.about;
        const rawWorkExperience = workExperienceSnap.exists()
          ? normalizeWorkExperience(workExperienceSnap.data())
          : fallback.workExperience;

        const usedFallback = !infoSnap.exists() ||
          skillsSnap.docs.length === 0 ||
          projectsSnap.docs.length === 0 ||
          !aboutSnap.exists() ||
          !workExperienceSnap.exists();

        setInfo(rawInfo);
        setSkills(rawSkills);
        setProjects(rawProjects);
        setAbout(rawAbout);
        setWorkExperience(rawWorkExperience);
        setFromCache(usedFallback);
        setLoading(false);
        return;
      } catch (e) {
        console.warn("Firebase load failed, falling back to synced data:", e?.message || e);
      }
    }

    // ── 2. Fallback to synced JSON ─────────────────────────────
    try {
      setInfo(fallback.info);
      setProjects(fallback.projects);
      setSkills(fallback.skills);
      setAbout(fallback.about);
      setWorkExperience(fallback.workExperience);
      setFromCache(true);
      setLoading(false);
    } catch {
      setError("Failed to load portfolio data from Firebase and no fallback data found.");
      setInfo({});
      setProjects([]);
      setSkills([]);
      setAbout(defaultAboutContent);
      setWorkExperience(defaultWorkExperience);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      db,
      loading,
      error,
      fromCache,
      info,
      projects,
      skills,
      about,
      workExperience,
      reload,
    }),
    [loading, error, fromCache, info, projects, skills, about, workExperience, reload]
  );

  return (
    <FirestorePortfolioContext.Provider value={value}>
      {children}
    </FirestorePortfolioContext.Provider>
  );
}

export function useFirestorePortfolio() {
  const ctx = useContext(FirestorePortfolioContext);
  if (!ctx) {
    throw new Error(
      "useFirestorePortfolio must be used within FirestorePortfolioProvider"
    );
  }
  return ctx;
}
