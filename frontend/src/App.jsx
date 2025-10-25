import React, { useEffect, useState } from "react";
import { getPortfolioData } from "./services/api";
import HeroSection from "./components/HeroSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactForm from './components/ContactForm'; 
import Navbar from "./components/Navbar";


  // function dd(...args) {
  //   // Create container
  //   const container = document.createElement('div');
  //   container.style.cssText = `
  //     background: #fff;
  //     border: 1px solid #ccc;
  //     padding: 12px;
  //     margin: 10px;
  //     font-family: monospace;
  //     font-size: 14px;
  //     line-height: 1.5;
  //     white-space: pre-wrap;
  //     word-wrap: break-word;
  //     color: #111;
  //     border-radius: 6px;
  //     box-shadow: 0 0 10px rgba(0,0,0,0.1);
  //   `;

  //   // Add each dumped argument
  //   args.forEach(arg => {
  //     const block = document.createElement('div');
  //     block.style.marginBottom = '8px';
  //     try {
  //       block.textContent = JSON.stringify(arg, null, 2);
  //     } catch {
  //       block.textContent = String(arg);
  //     }
  //     container.appendChild(block);
  //   });

  //   // Clear page and display dump
  //   document.body.innerHTML = '';
  //   document.body.appendChild(container);

  //   // Stop further script execution
  //   throw new Error('Execution stopped by dd()');
  // }


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


if (!data)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "6px solid #e0e0e0",
          borderTop: "6px solid #4a90e2",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <h2 style={{ marginTop: "20px", color: "#333", fontWeight: 500 }}>
        Loading...
      </h2>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
