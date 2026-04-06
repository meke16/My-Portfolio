import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_BOOT_DATA = {
  name: "CHERINET HABTAMU",
  title: "FULL STACK DEVELOPER",
  projectsCount: 12,
  skillsCount: 10,
  availability: "AVAILABLE FOR WORK",
};

/**
 * Generates a component that displays a retro binary loading screen 
 * with scanlines, terminal text, and a flowing binary code matrix.
 */
function LoadingScreen({ bootData }) {
  const [binaryMatrix, setBinaryMatrix] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const matrixRef = useRef(null);
  const mergedBootData = {
    ...DEFAULT_BOOT_DATA,
    ...(bootData && typeof bootData === "object" ? bootData : {}),
  };

  // --- Constants ---
  const INITIAL_TEXT = ">>> INITIALIZING VIRTUAL PORTFOLIO CORE... [OK]";
  const LOADING_MESSAGES = [
    "FETCHING {USER} DATA",
    "DECOMPILING SKILL TREE",
    "PULLING PROJECT MANIFESTS",
    "ESTABLISHING CONTACT CHANNEL",
    "VERIFYING INTEGRITY...",
  ];
  const FULL_TEXT = "LOADING COMPLETE. ENTERING MAIN FRAME...";

  // --- Effect 1: Binary Matrix Generation ---
  useEffect(() => {
    // Determine the number of rows/cols based on screen size
    const generateMatrix = () => {
      if (!matrixRef.current) return;
      const { clientWidth, clientHeight } = matrixRef.current;
      const cols = Math.floor(clientWidth / 12); // Assuming 12px font width
      const rows = Math.floor(clientHeight / 20); // Assuming 20px line height

      const newMatrix = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => Math.random() > 0.5 ? '1' : '0')
      );
      setBinaryMatrix(newMatrix);
    };

    generateMatrix();
    window.addEventListener('resize', generateMatrix);

    const intervalId = setInterval(() => {
      setBinaryMatrix(prevMatrix => 
        prevMatrix.map(row => 
          row.map(() => Math.random() > 0.95 ? (Math.random() > 0.5 ? '1' : '0') : '')
        )
      );
    }, 150); // Faster update for visual effect

    return () => {
      window.removeEventListener('resize', generateMatrix);
      clearInterval(intervalId);
    };
  }, []);

  // --- Effect 2: Terminal Text Typing Simulation ---
  useEffect(() => {
    let currentMessageIndex = 0;
    let charIndex = 0;
    let timer;
    const allText = [INITIAL_TEXT, ...LOADING_MESSAGES, FULL_TEXT];

    const type = () => {
      if (currentMessageIndex < allText.length) {
        const targetMessage = allText[currentMessageIndex];
        
        if (charIndex < targetMessage.length) {
          setLoadingText(prev => prev.slice(0, prev.lastIndexOf('\n') + 1) + targetMessage.substring(0, charIndex + 1));
          charIndex++;
          timer = setTimeout(type, 5); // Fast typing speed
        } else {
          // Finished current message, move to the next line after a pause
          setLoadingText(prev => prev + "\n");
          currentMessageIndex++;
          charIndex = 0;
          timer = setTimeout(type, 300); // Pause between messages
        }
      }
    };

    type();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center font-mono overflow-hidden">
      {/* Theme grid + glow to match main UI */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#ff4500]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Binary Matrix Background --- */}
      <div 
        ref={matrixRef}
        className="absolute inset-0 opacity-15 pointer-events-none"
      >
        {binaryMatrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex whitespace-nowrap leading-none h-[20px]">
            {row.map((char, colIndex) => (
              <span 
                key={`${rowIndex}-${colIndex}`} 
                className={`text-xs w-[12px] text-[#ff7a45] transition-colors duration-150 ${char ? 'opacity-100' : 'opacity-0'}`}
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* --- Terminal Content --- */}
      <div className="p-8 md:p-12 w-full max-w-2xl bg-[#111111]/70 border border-[#ff4500]/25 shadow-2xl shadow-[#ff4500]/20 rounded-lg backdrop-blur-sm z-10">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] tracking-wide">
          <div className="px-3 py-2 rounded border border-[#ff4500]/20 bg-black/20 text-[#ffb08f]">
            PROFILE: <span className="text-[#ffd3bf]">{String(mergedBootData.name || DEFAULT_BOOT_DATA.name).toUpperCase()}</span>
          </div>
          <div className="px-3 py-2 rounded border border-[#ff4500]/20 bg-black/20 text-[#ffb08f]">
            ROLE: <span className="text-[#ffd3bf]">{String(mergedBootData.title || DEFAULT_BOOT_DATA.title).toUpperCase()}</span>
          </div>
          <div className="px-3 py-2 rounded border border-[#ff4500]/20 bg-black/20 text-[#ffb08f]">
            PROJECTS INDEXED: <span className="text-[#ffd3bf]">{Number(mergedBootData.projectsCount) || 0}</span>
          </div>
          <div className="px-3 py-2 rounded border border-[#ff4500]/20 bg-black/20 text-[#ffb08f]">
            SKILLS LOADED: <span className="text-[#ffd3bf]">{Number(mergedBootData.skillsCount) || 0}</span>
          </div>
          <div className="sm:col-span-2 px-3 py-2 rounded border border-[#ff4500]/20 bg-black/20 text-[#ffb08f]">
            STATUS: <span className="text-[#ffd3bf]">{String(mergedBootData.availability || DEFAULT_BOOT_DATA.availability).toUpperCase()}</span>
          </div>
        </div>

        <pre className="text-sm md:text-base text-[#ff7a45] h-40 overflow-hidden whitespace-pre-wrap leading-relaxed">
          {loadingText}
          {/* Pulsating Cursor */}
          <span className="animate-pulse">█</span>
        </pre>
        
        <div className="mt-6 flex items-center space-x-4">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            {/* Progress Bar (simulated, always full width by the time the text finishes) */}
            <div 
              className="h-full bg-gradient-to-r from-[#ff4500] to-[#ff8a50] transition-all duration-1000 ease-out" 
              style={{ width: loadingText.includes(FULL_TEXT) ? '100%' : '5%' }}
            ></div>
          </div>
          <span className="text-[#ff7a45] text-xs tracking-widest">
            {loadingText.includes(FULL_TEXT) ? '100% COMPLETE' : 'PROCESSING...'}
          </span>
        </div>
      </div>

      {/* --- Scanline Overlay Effect --- */}
      <div className="scanline-overlay"></div>

      {/* --- Custom CSS for terminal look and scanlines --- */}
      <style>{`
        .scanline-overlay {
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(255, 69, 0, 0.02) 50%,
            rgba(0, 0, 0, 0.3) 50%
          );
          background-size: 100% 4px;
          animation: scanline 8s linear infinite;
        }

        @keyframes scanline {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 4px;
          }
        }
      `}</style>
    </div>
  );
}

export { LoadingScreen };
export default LoadingScreen;
