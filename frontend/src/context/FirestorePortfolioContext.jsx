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

const FirestorePortfolioContext = createContext(null);

export function FirestorePortfolioProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState({});
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);

  const reload = useCallback(async () => {
    if (!db) {
      setError("Firebase is not configured. Add VITE_FIREBASE_* variables to frontend/.env");
      setLoading(false);
      setInfo({});
      setProjects([]);
      setSkills([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [infoSnap, skillsSnap, projectsSnap] = await Promise.all([
        getDoc(doc(db, "info", "main")),
        getDocs(collection(db, "skills")),
        getDocs(collection(db, "projects")),
      ]);

      setInfo(infoSnap.exists() ? infoSnap.data() : {});
      setSkills(
        skillsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          proficiency: Number(d.data().proficiency) || 0,
        }))
      );
      setProjects(
        projectsSnap.docs.map((d) =>
          normalizeProjectDoc(d.id, d.data())
        )
      );
      setLoading(false);
    } catch (e) {
      setError(e?.message || "Failed to load portfolio from Firestore");
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
      info,
      projects,
      skills,
      reload,
    }),
    [loading, error, info, projects, skills, reload]
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
