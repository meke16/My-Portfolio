import React, { useEffect, useState } from "react";
import { getPortfolioData } from "./services/api";
import HeroSection from "./components/HeroSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactForm from './components/ContactForm'; 
import Navbar from "./components/Navbar";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await getPortfolioData();
        setData(result);
      } catch (error) {
        console.error("Error loading portfolio:", error);
      }
    })();
  }, []);

  if (!data) return <p>Loading portfolio...</p>;

  return (
    <>
      <Navbar info={data.info} />
      <HeroSection info={data.info} />
      <SkillsSection skills={data.skills} />
      <ProjectsSection projects={data.projects} />
      <ContactForm info={data.info}/>
    </>
  );
}
