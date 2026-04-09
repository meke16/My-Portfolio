import React, { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import { HeroSection } from "../components/HeroSection";
import { AboutPage } from "./AboutPage";
import { WorkExperiencePage } from "./WorkExperiencePage";
import { SkillsPage } from "./SkillsPage";
import { ProjectsPage } from "./ProjectsPage";
import { ContactPage } from "./ContactPage";
import { BlogPage } from "./BlogPage";
import { TestimonialsPage } from "./TestimonialsPage";
import { NotFoundPage } from "./NotFoundPage";

const SECTIONS = ["/", "/about", "/experience", "/skills", "/projects", "/blog", "/contact", "/testimonials"];

function PublicLayout() {
  const { info, projects, skills, testimonials, loading, error, fromCache, reload } = useFirestorePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = useRef(SECTIONS.indexOf(location.pathname));
  const isScrolling = useRef(false);
  const wheelAccumulator = useRef(0);
  const lastNavAt = useRef(0);
  const sectionRefs = useRef([]);
  const [showWarning, setShowWarning] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const scrollLockMs = 520;
  const wheelThreshold = typeof window !== "undefined" && window.matchMedia("(pointer: coarse), (max-width: 768px)").matches
    ? 70
    : 110;

  useEffect(() => {
    setShowWarning(fromCache);
  }, [fromCache]);

  useEffect(() => {
    const idx = SECTIONS.indexOf(location.pathname);
    if (idx !== -1) currentIndex.current = idx;
    setMobileNavVisible(true);
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
    const triggerSectionShift = (direction) => {
      const now = performance.now();
      if (isScrolling.current || now - lastNavAt.current < scrollLockMs) return;

      const idx = currentIndex.current;
      const next = idx + direction;
      if (next < 0 || next >= SECTIONS.length) return;

      isScrolling.current = true;
      lastNavAt.current = now;
      goToSection(next);
      setTimeout(() => {
        isScrolling.current = false;
      }, scrollLockMs);
    };

    const onWheel = (e) => {
      const delta = e.deltaY;
      if (Math.abs(delta) < 2) return;

      const idx = currentIndex.current;
      const el = sectionRefs.current[idx];

      if (el) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
        const atTop = el.scrollTop < 5;
        if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
          wheelAccumulator.current = 0;
          return;
        }
      }

      if (Math.sign(wheelAccumulator.current) !== Math.sign(delta)) {
        wheelAccumulator.current = 0;
      }

      wheelAccumulator.current += delta;
      if (Math.abs(wheelAccumulator.current) < wheelThreshold) return;

      const direction = wheelAccumulator.current > 0 ? 1 : -1;
      wheelAccumulator.current = 0;
      triggerSectionShift(direction);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [goToSection, scrollLockMs, wheelThreshold]);

  const activeIdx = SECTIONS.indexOf(location.pathname);
  const isKnownRoute = activeIdx !== -1;
  const displayIdx = Math.max(0, activeIdx);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(pointer: fine) and (hover: hover)").matches) return undefined;

    const el = sectionRefs.current[displayIdx];
    if (!el) return undefined;

    let lastTop = el.scrollTop;

    const onSectionScroll = () => {
      const currentTop = el.scrollTop;
      const scrollingDown = currentTop > lastTop + 4;
      const scrollingUp = currentTop < lastTop - 4;

      if (scrollingDown) {
        setMobileNavVisible(false);
      } else if (scrollingUp || currentTop < 12) {
        setMobileNavVisible(true);
      }

      lastTop = currentTop;
    };

    el.addEventListener("scroll", onSectionScroll, { passive: true });
    return () => el.removeEventListener("scroll", onSectionScroll);
  }, [displayIdx]);

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

  // If Firebase failed but we have cached data, show a warning banner instead of error page
  const hasCachedData = info?.name || (projects?.length > 0) || (skills?.length > 0);

  if (error && !hasCachedData) {
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

  // 404 for unknown routes
  if (!isKnownRoute) {
    return <NotFoundPage />;
  }

  const sections = [
    <HeroSection
      info={info}
      stats={{
        projects: projects?.length ?? 0,
        skills: skills?.length ?? 0,
        testimonials: testimonials?.length ?? 0,
      }}
    />,
    <AboutPage />,
    <WorkExperiencePage />,
    <SkillsPage />,
    <ProjectsPage />,
    <BlogPage />,
    <ContactPage />,
    <TestimonialsPage />,
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
            <p className="text-xs text-amber-300">Using cached data — Firebase unavailable. Data will refresh when connection is restored.</p>
          </div>
          <button onClick={() => setShowWarning(false)} className="text-amber-400 hover:text-amber-200 text-xs shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <Navbar info={info} mobileNavVisible={mobileNavVisible} />

      {/* Sections with smooth route transition */}
      <div className="relative h-full overflow-hidden">
        {sections.map((section, idx) => {
          const isActive = idx === displayIdx;
          const translate = isActive ? 0 : (idx < displayIdx ? -14 : 14);

          return (
            <div
              key={SECTIONS[idx]}
              ref={(el) => (sectionRefs.current[idx] = el)}
              className={`section-scroll-container absolute inset-0 w-full h-full overflow-y-auto will-change-transform ${
                isActive
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } transition-opacity duration-300 ease-out`}
              style={{
                transform: `translate3d(0, ${translate}vh, 0)`,
                transition: "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out",
                backfaceVisibility: "hidden",
              }}
            >
              {section}
            </div>
          );
        })}
      </div>

      {/* Dot navigation */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-50">
        {SECTIONS.map((path, idx) => (
          <button
            key={path}
            onClick={() => goToSection(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === displayIdx ? "bg-[#ff4500] scale-125" : "bg-white/30 hover:bg-white/60"
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
