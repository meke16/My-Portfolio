import React, { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import { HeroSection } from "../components/HeroSection";
import { AboutPage } from "./AboutPage";
import { SkillsPage } from "./SkillsPage";
import { ProjectsPage } from "./ProjectsPage";
import { ContactPage } from "./ContactPage";

const SECTIONS = ["/", "/about", "/skills", "/projects", "/contact"];

function PublicLayout() {
  const { info, projects, skills, loading, error, reload } = useFirestorePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = useRef(SECTIONS.indexOf(location.pathname));
  const isScrolling = useRef(false);
  const sectionRefs = useRef([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (error && info?.name) {
      setShowWarning(true);
    } else if (!error) {
      setShowWarning(false);
    }
  }, [error, info?.name]);

  useEffect(() => {
    const idx = SECTIONS.indexOf(location.pathname);
    if (idx !== -1) currentIndex.current = idx;
  }, [location.pathname]);

  useEffect(() => {
    if (!info) return;
    if (info.profile_image) {
      const favicon = document.getElementById("dynamic-favicon");
      if (favicon) favicon.href = info.profile_image;
    }
    if (info.name) document.title = info.name;
  }, [info]);

  const goToSection = useCallback(
    (idx) => {
      if (idx < 0 || idx >= SECTIONS.length) return;
      currentIndex.current = idx;
      const el = sectionRefs.current[idx];
      if (el) el.scrollTop = 0;
      navigate(SECTIONS[idx]);
    },
    [navigate]
  );

  useEffect(() => {
    const onWheel = (e) => {
      if (isScrolling.current) return;
      const delta = e.deltaY;
      if (Math.abs(delta) < 20) return;

      const idx = currentIndex.current;
      const el = sectionRefs.current[idx];

      if (el) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
        const atTop = el.scrollTop < 5;
        if (delta > 0 && !atBottom) return;
        if (delta < 0 && !atTop) return;
      }

      isScrolling.current = true;
      goToSection(delta > 0 ? idx + 1 : idx - 1);
      setTimeout(() => { isScrolling.current = false; }, 900);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [goToSection]);

  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (isScrolling.current) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 60) return;

      const idx = currentIndex.current;
      const el = sectionRefs.current[idx];
      if (el) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
        const atTop = el.scrollTop < 5;
        if (diff > 0 && !atBottom) return;
        if (diff < 0 && !atTop) return;
      }

      isScrolling.current = true;
      goToSection(diff > 0 ? idx + 1 : idx - 1);
      setTimeout(() => { isScrolling.current = false; }, 900);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goToSection]);

  if (loading) {
    return (
      <LoadingScreen
        bootData={{
          name: info?.name || "Cherinet Habtamu",
          title: info?.title || "Full Stack Developer",
          projectsCount: projects?.length ?? 0,
          skillsCount: skills?.length ?? 0,
          availability: "Available for work",
        }}
      />
    );
  }

  // If Firebase failed but we have fallback data, show a warning banner instead of error page
  const hasFallbackData = info?.name || (projects?.length > 0) || (skills?.length > 0);

  if (error && !hasFallbackData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-6 gap-4">
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button type="button" onClick={() => reload()}
          className="px-4 py-2 rounded-lg bg-[#ff4500] text-white text-sm font-medium hover:bg-[#cc3700]">
          Retry
        </button>
      </div>
    );
  }

  const activeIdx = Math.max(0, SECTIONS.indexOf(location.pathname));

  const sections = [
    <HeroSection info={info} />,
    <AboutPage />,
    <SkillsPage />,
    <ProjectsPage />,
    <ContactPage />,
  ];

  return (
    <div className="h-screen overflow-hidden">
      {/* Fallback warning banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/10 border-b border-amber-400/30 px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-amber-300">Showing offline data — Firebase unavailable. Changes won&apos;t sync.</p>
          </div>
          <button onClick={() => setShowWarning(false)} className="text-amber-400 hover:text-amber-200 text-xs shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <Navbar info={info} />

      <div
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${activeIdx * 100}vh)` }}
      >
        {sections.map((section, idx) => (
          <div
            key={SECTIONS[idx]}
            ref={(el) => (sectionRefs.current[idx] = el)}
            className="h-screen overflow-y-auto"
          >
            {section}
          </div>
        ))}
      </div>

      {/* Dot navigation */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-50">
        {SECTIONS.map((path, idx) => (
          <button
            key={path}
            onClick={() => goToSection(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeIdx === idx ? "bg-[#ff4500] scale-125" : "bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to section ${idx + 1}`}
          />
        ))}
      </nav>
    </div>
  );
}

export { PublicLayout };
export default PublicLayout;
