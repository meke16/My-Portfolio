import React, { useEffect } from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import SkillsSection from "../components/SkillsSection";
import ProjectsSection from "../components/ProjectsSection";
import ContactForm from "../components/ContactForm";
import LoadingScreen from "../components/LoadingScreen";

export default function Portfolio() {
  const { info, projects, skills, loading, error, reload } = useFirestorePortfolio();

  useEffect(() => {
    if (!info) return;
    if (info.profile_image) {
      const favicon = document.getElementById("dynamic-favicon");
      if (favicon) favicon.href = info.profile_image;
    }
    if (info.name) document.title = info.name;
  }, [info]);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-6 gap-4">
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar info={info} />
      <HeroSection info={info} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ContactForm info={info} />
    </>
  );
}
