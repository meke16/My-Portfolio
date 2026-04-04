import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import SkillsSection from "../components/SkillsSection";
import ProjectsSection from "../components/ProjectsSection";
import ContactForm from "../components/ContactForm";
import LoadingScreen from "../components/LoadingScreen";

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [infoSnap, skillsSnap, projectsSnap] = await Promise.all([
          getDoc(doc(db, "info", "main")),
          getDocs(collection(db, "skills")),
          getDocs(collection(db, "projects")),
        ]);

        setData({
          info: infoSnap.exists() ? infoSnap.data() : {},
          skills: skillsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          projects: projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        });
      } catch (e) {
        console.error(e);
        setLoadError(
          "Could not load portfolio data. Check Firebase rules, network, and .env configuration."
        );
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!data?.info) return;
    if (data.info.profile_image) {
      const favicon = document.getElementById("dynamic-favicon");
      if (favicon) favicon.href = data.info.profile_image;
    }
    if (data.info.name) document.title = data.info.name;
  }, [data]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
        <p className="text-red-400 text-center max-w-md">{loadError}</p>
      </div>
    );
  }

  if (!data) return <LoadingScreen />;

  return (
    <>
      <Navbar info={data.info} />
      <HeroSection info={data.info} />
      <SkillsSection skills={data.skills} />
      <ProjectsSection projects={data.projects} />
      <ContactForm info={data.info} />
    </>
  );
}
