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
import { defaultAboutContent, normalizeAboutContent } from "../lib/aboutContent";
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
  };
}

export function FirestorePortfolioProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const [info, setInfo] = useState({});
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [about, setAbout] = useState(defaultAboutContent);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFromCache(false);

    // ── 1. Try Firebase ────────────────────────────────────────
    if (db) {
      try {
        const [infoSnap, skillsSnap, projectsSnap, aboutSnap] = await Promise.all([
          getDoc(doc(db, "info", "main")),
          getDocs(collection(db, "skills")),
          getDocs(collection(db, "projects")),
          getDoc(doc(db, "content", "about")),
        ]);

        const rawInfo = infoSnap.exists() ? infoSnap.data() : {};
        const rawSkills = normalizeSkills(skillsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          proficiency: Number(d.data().proficiency) || 0,
        })));
        const rawProjects = projectsSnap.docs.map((d) =>
          normalizeProjectDoc(d.id, d.data())
        );
        const rawAbout = aboutSnap.exists()
          ? normalizeAboutContent(aboutSnap.data())
          : defaultAboutContent;

        setInfo(rawInfo);
        setSkills(rawSkills);
        setProjects(rawProjects);
        setAbout(rawAbout);
        setLoading(false);
        return;
      } catch (e) {
        console.warn("Firebase load failed, falling back to synced data:", e?.message || e);
      }
    }

    // ── 2. Fallback to synced JSON ─────────────────────────────
    try {
      const fb = loadFallbackData();
      setInfo(fb.info);
      setProjects(fb.projects);
      setSkills(fb.skills);
      setAbout(fb.about);
      setFromCache(true);
      setLoading(false);
    } catch {
      setError("Failed to load portfolio data from Firebase and no fallback data found.");
      setInfo({});
      setProjects([]);
      setSkills([]);
      setAbout(defaultAboutContent);
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
      reload,
    }),
    [loading, error, fromCache, info, projects, skills, about, reload]
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
