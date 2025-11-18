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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0f14",
        color: "#00ff9c",
        fontFamily: "Courier New, monospace",
        textAlign: "center"
      }}
    >

      {/* Booting Text */}
      <h2 className="boot-text">
       wait <span className="cursor">_</span>
      </h2>
      {/* Device Charging Animation Line */}
      <div className="loader-line" />

      {/* Booting Text */}
      <h2 className="boot-text">
        Loading <span className="cursor">_</span>
      </h2>

      {/* Injecting CSS */}
      <style>
        {`
          .loader-line {
            width: 180px;
            height: 6px;
            background: linear-gradient(90deg, #001, #00ff9c, #001);
            background-size: 300% 100%;
            animation: charge 2.5s linear infinite;
            border-radius: 4px;
            margin-bottom: 20px;
          }

          @keyframes charge {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .boot-text {
            font-size: 22px;
            font-weight: bold;
            animation: flicker 1.5s infinite alternate;
          }

          @keyframes flicker {
            0% { opacity: 0.8; }
            100% { opacity: 1; }
          }

          .cursor {
            animation: blink 0.6s infinite;
          }

          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
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
