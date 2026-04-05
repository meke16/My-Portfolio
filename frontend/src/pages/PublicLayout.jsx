import React, { useRef, useEffect, useCallback } from "react";
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
  const { info, loading, error, reload } = useFirestorePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = useRef(SECTIONS.indexOf(location.pathname));
  const isScrolling = useRef(false);
  const sectionRefs = useRef([]);

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

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-6 gap-4">
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button type="button" onClick={() => reload()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500">
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
              activeIdx === idx ? "bg-blue-400 scale-125" : "bg-white/30 hover:bg-white/60"
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
