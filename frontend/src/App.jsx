import React, { useEffect, useState } from "react";
import { getPortfolioData } from "./services/api";
import HeroSection from "./components/HeroSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactForm from './components/ContactForm'; 
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import GallerySection from "./components/GallerySection";

export default function App() {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        //set timeout for 3 second before fetch
        const result = await getPortfolioData();
        setData(result);
        console.log(data)
      } catch (error) {
        console.error("Error loading portfolio:", error);
      }
    })();
  }, []);
  useEffect(() => {
  if (!data || !data.info || !data.info.profile_image) return;

  const favicon = document.getElementById("dynamic-favicon");
  if (favicon) {
    favicon.href = data.info.profile_image;  
  }
}, [data]);


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
      <GallerySection items={data.items}/>
      <ContactForm info={data.info}/>
    </>
  );
}
