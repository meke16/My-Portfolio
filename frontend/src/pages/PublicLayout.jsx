import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import { trackPageView, trackPageDuration } from "../lib/analytics";
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
import FloatingContactButton from "../components/FloatingContactButton";

const SECTIONS = ["/", "/about", "/experience", "/skills", "/projects", "/blog", "/contact", "/testimonials"];
const SECTION_META = {
  "/": { label: "Home" },
  "/about": { label: "About" },
  "/experience": { label: "Experience" },
  "/skills": { label: "Skills" },
  "/projects": { label: "Projects" },
  "/blog": { label: "Blog" },
  "/contact": { label: "Contact" },
  "/testimonials": { label: "Testimonials" },
};

function PublicLayout() {
  const { info, projects, skills, testimonials, loading, error, fromCache, reload } = useFirestorePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const isTouchViewport = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse), (max-width: 768px)").matches,
    []
  );
  const visibleSections = useMemo(
    () => (testimonials.length > 0 ? SECTIONS : SECTIONS.filter((section) => section !== "/testimonials")),
    [testimonials.length]
  );
  const currentIndex = useRef(Math.max(0, visibleSections.indexOf(location.pathname)));
  const isScrolling = useRef(false);
  const wheelAccumulator = useRef(0);
  const lastNavAt = useRef(0);
  const sectionRefs = useRef([]);
  const [showWarning, setShowWarning] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);
  const touchStartAt = useRef(0);
  const lastTapAt = useRef(0);
  const scrollLockMs = isTouchViewport ? 430 : 520;
  const wheelThreshold = isTouchViewport ? 70 : 110;

  useEffect(() => {
    setShowWarning(fromCache);
  }, [fromCache]);

  useEffect(() => {
    const idx = visibleSections.indexOf(location.pathname);
    if (idx !== -1) currentIndex.current = idx;
    setMobileNavVisible(true);
    
    trackPageView(location.pathname);
  }, [location.pathname, visibleSections]);

  const pageDurationRef = useRef({ started: Date.now(), page: null });

  useEffect(() => {
    const currentPage = location.pathname;
    const prev = pageDurationRef.current;
    
    if (prev.page && prev.started) {
      const duration = (Date.now() - prev.started) / 1000;
      if (duration > 2) {
        trackPageDuration(prev.page, duration);
      }
    }
    
    pageDurationRef.current = { started: Date.now(), page: currentPage };
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      const duration = (Date.now() - pageDurationRef.current.started) / 1000;
      if (duration > 2) {
        trackPageDuration(pageDurationRef.current.page, duration);
      }
    };
  }, []);

  useEffect(() => {
    if (!info) return;
    if (info.name) document.title = info.name;
  }, [info]);

  const goToSection = useCallback(
    (idx) => {
      if (idx < 0 || idx >= visibleSections.length) return;
      currentIndex.current = idx;
      const el = sectionRefs.current[idx];
      if (el) el.scrollTop = 0;
      navigate(visibleSections[idx]);
    },
    [navigate, visibleSections]
  );

  useEffect(() => {
    const triggerSectionShift = (direction) => {
      const now = performance.now();
      if (isScrolling.current || now - lastNavAt.current < scrollLockMs) return;

      const idx = currentIndex.current;
      const next = idx + direction;
      if (next < 0 || next >= visibleSections.length) return;

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

  // Touch swipe between sections + tap to toggle nav
  useEffect(() => {
    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchStartAt.current = performance.now();
    };

    const onTouchEnd = (e) => {
      if (touchStartY.current === null) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
      const elapsedMs = Math.max(1, performance.now() - touchStartAt.current);
      const absDy = Math.abs(dy);
      const swipeVelocity = absDy / elapsedMs;

      // Fast flicks should require less travel than slow drags.
      const minSwipeDistance = swipeVelocity > 0.9
        ? 24
        : swipeVelocity > 0.55
          ? 34
          : 50;

      // Tap (minimal movement) → toggle nav
      if (Math.abs(dy) < 8 && dx < 8) {
        const now = Date.now();
        if (now - lastTapAt.current < 300) {
          // double-tap guard — ignore
        } else {
          lastTapAt.current = now;
          setMobileNavVisible((v) => !v);
        }
        touchStartY.current = null;
        return;
      }

      // Swipe — only if mostly vertical
      if (absDy < minSwipeDistance || dx > absDy) {
        touchStartY.current = null;
        return;
      }

      const idx = currentIndex.current;
      const el = sectionRefs.current[idx];
      if (el) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
        const atTop = el.scrollTop < 10;
        if ((dy > 0 && !atBottom) || (dy < 0 && !atTop)) {
          touchStartY.current = null;
          return;
        }
      }

      const now = performance.now();
      if (isScrolling.current || now - lastNavAt.current < scrollLockMs) {
        touchStartY.current = null;
        return;
      }

      const direction = dy > 0 ? 1 : -1;
      isScrolling.current = true;
      lastNavAt.current = now;
      goToSection(currentIndex.current + direction);
      setTimeout(() => { isScrolling.current = false; }, scrollLockMs);
      touchStartY.current = null;
      touchStartAt.current = 0;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goToSection, scrollLockMs]);

  const activeIdx = visibleSections.indexOf(location.pathname);
  const isKnownRoute = activeIdx !== -1;
  const displayIdx = Math.max(0, activeIdx);
  const activePath = visibleSections[displayIdx];
  const activeSectionLabel = SECTION_META[activePath]?.label || "Section";

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

  const sectionByPath = {
    "/": (
      <HeroSection
        info={info}
        stats={{
          projects: projects?.length ?? 0,
          skills: skills?.length ?? 0,
          testimonials: testimonials?.length ?? 0,
        }}
      />
    ),
    "/about": <AboutPage />,
    "/experience": <WorkExperiencePage />,
    "/skills": <SkillsPage />,
    "/projects": <ProjectsPage />,
    "/blog": <BlogPage />,
    "/contact": <ContactPage />,
    "/testimonials": <TestimonialsPage />,
  };

  const renderedSections = visibleSections
    .map((path) => sectionByPath[path])
    .filter(Boolean);

  const getSectionSpacingClass = (path) => {
    if (path === "/" || path === "/contact") return "";
    return "pt-6 sm:pt-8 lg:pt-10";
  };

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
      <FloatingContactButton info={info} />
      {/* Active section chip (desktop/tablet) */}
      <div className="fixed top-16 right-4 z-50 pointer-events-none hidden md:flex">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0f0f0f]/75 backdrop-blur-md px-3.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#ff4500]">
            {activeSectionLabel}
          </span>
          <span className="text-[10px] text-white/45">
            {String(displayIdx + 1).padStart(2, "0")} / {String(visibleSections.length).padStart(2, "0")}
          </span>
        </div>
      </div>
      {/* Active section chip (mobile) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none md:hidden transition-all duration-300 ${
          mobileNavVisible ? "bottom-[5.15rem] opacity-100" : "bottom-3 opacity-0"
        }`}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.32)]">
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#ff4500]">
            {activeSectionLabel}
          </span>
          <span className="text-[10px] text-white/45">
            {String(displayIdx + 1).padStart(2, "0")} / {String(visibleSections.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Sections with smooth route transition */}
      <div className="relative h-full overflow-hidden">
        {renderedSections.map((section, idx) => {
          const isActive = idx === displayIdx;
          const translate = isActive ? 0 : (idx < displayIdx ? (isTouchViewport ? -8 : -14) : (isTouchViewport ? 8 : 14));
          const scale = isActive ? 1 : (isTouchViewport ? 1 : 0.992);

          return (
            <div
              key={visibleSections[idx]}
              ref={(el) => (sectionRefs.current[idx] = el)}
              className={`section-scroll-container absolute inset-0 w-full h-full overflow-y-auto will-change-transform pb-24 lg:pb-0 ${
                isActive
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } transition-opacity duration-500 ease-out`}
              style={{
                transform: `translate3d(0, ${translate}vh, 0) scale(${scale})`,
                transition: isTouchViewport
                  ? "transform 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.34s ease-out"
                  : "transform 0.52s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease-out",
                backfaceVisibility: "hidden",
              }}
            >
              <div className={getSectionSpacingClass(visibleSections[idx])}>
                {section}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop side navigation */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 z-50 rounded-2xl border border-white/10 bg-[#0f0f0f]/60 backdrop-blur-lg p-2.5 shadow-[0_18px_35px_rgba(0,0,0,0.3)]">
        {visibleSections.map((path, idx) => (
          <div key={path} className="group relative flex items-center justify-end">
            <span
              className={`pointer-events-none absolute right-6 whitespace-nowrap rounded-lg border border-white/10 bg-black/55 px-2 py-1 text-[11px] text-white/80 backdrop-blur-sm transition-all duration-200 ${
                idx === displayIdx
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
            >
              {SECTION_META[path]?.label || `Section ${idx + 1}`}
            </span>
            <button
              onClick={() => goToSection(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === displayIdx
                  ? "bg-[#ff4500] scale-125 shadow-[0_0_0_4px_rgba(255,69,0,0.16)]"
                  : "bg-white/30 hover:bg-white/70 hover:scale-110"
              }`}
              aria-label={`Go to ${SECTION_META[path]?.label || `section ${idx + 1}`}`}
            />
          </div>
        ))}
      </nav>
    </div>
  );
}

export { PublicLayout };
export default PublicLayout;
