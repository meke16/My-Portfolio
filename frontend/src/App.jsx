import React, { useEffect, useState } from "react";
import { getPortfolioData } from "./services/api";
import HeroSection from "./components/HeroSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactForm from './components/ContactForm'; 
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";


export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        //set timeout for 3 second before fetch
        const result = await getPortfolioData();
        setData(result);
      } catch (error) {
        console.error("Error loading portfolio:", error);
      }
    })();
  }, []);

  if (!data)
    return (
      <>
        <LoadingScreen />
      </>
    );
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
