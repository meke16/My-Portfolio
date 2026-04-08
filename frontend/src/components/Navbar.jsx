import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>
  )},
  { to: "/about", label: "About", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/></svg>
  )},
  { to: "/experience", label: "Experience", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 6V5a2 2 0 012-2h2a2 2 0 012 2v1m-7 0h8a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8a2 2 0 012-2zm0 0V6h8v0"/></svg>
  )},
  { to: "/skills", label: "Skills", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 6l2.25 4.5L19 11l-3.5 3.25L16.5 19 12 16.75 7.5 19l1-4.75L5 11l4.75-.5L12 6z"/></svg>
  )},
  { to: "/projects", label: "Projects", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"/><path d="M8 13h8"/></svg>
  )},
  { to: "/blog", label: "Blog", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M7 7h10M7 12h10M7 17h6"/><path d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>
  )},
  { to: "/testimonials", label: "Testimonials", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M7 8h10M7 12h7M7 16h4"/><path d="M5 4h14a1 1 0 011 1v14l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 011-1z"/></svg>
  )},
  { to: "/contact", label: "Contact", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  )},
];

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function useScrollDirection() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current && y > 60;
      setVisible(!goingDown);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [activeIdx, setActiveIdx] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 6, width: 60 });
  const navRef = useRef(null);
  const location = useLocation();
  const scrollProgress = useScrollProgress();
  const mobileNavVisible = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const idx = NAV_ITEMS.findIndex((item) => {
      if (item.to === "/") return location.pathname === "/";
      return location.pathname.startsWith(item.to);
    });
    setActiveIdx(idx !== -1 ? idx : 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!navRef.current) return;
    const links = navRef.current.querySelectorAll("[data-nav-link]");
    const link = links[activeIdx];
    if (!link) return;
    requestAnimationFrame(() => {
      setIndicatorStyle({ left: link.offsetLeft, width: link.offsetWidth });
    });
  }, [activeIdx]);

  return (
    <>
      {/* ── Scroll progress bar ─────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
        <div
          className="h-full bg-[#ff4500] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* ── Desktop navbar ──────────────────────────────── */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 lg:block hidden ${
        scrolled ? "pt-2" : "pt-4"
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-12">
            <div
              ref={navRef}
              className="relative flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/80 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] max-w-full overflow-x-auto scrollbar-none"
            >

              {/* Sliding active indicator */}
              <div
                className="absolute top-1.5 h-[calc(100%-12px)] rounded-xl bg-[#ff4500]/12 border border-[#ff4500]/20 transition-all duration-300 ease-out"
                style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }}
              />

              {NAV_ITEMS.map((item, idx) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  data-nav-link
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(-1)}
                  className={({ isActive }) =>
                    `relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive ? "text-[#ffd8c8]" : "text-[#8a8a8a]"
                    } ${!isActive && hoveredIdx === idx ? "text-white" : ""}`
                  }
                >
                  <span className={`transition-transform duration-200 ${
                    activeIdx === idx ? "text-[#ff4500] scale-110" : ""
                  } ${activeIdx !== idx && hoveredIdx === idx ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}

              <div className="ml-2 h-5 w-px bg-white/[0.06]" />

              <Link
                to="/contact"
                className="relative z-10 ml-2 flex items-center gap-2 px-4 py-2 bg-[#ff4500] text-white text-sm font-semibold rounded-xl hover:bg-[#cc3700] hover:shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        mobileNavVisible ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="mx-3 mb-3">
          <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/90 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.4)] px-1 py-1.5 scrollbar-none">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className="relative flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-xl transition-all duration-200 group"
                >
                  {/* Active top glow */}
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#ff4500] rounded-full" />
                  )}
                  {/* Icon */}
                  <span className={`transition-all duration-200 ${
                    isActive
                      ? "text-[#ff4500] -translate-y-0.5"
                      : "text-[#555] group-hover:text-[#888]"
                  }`}>
                    {item.icon}
                  </span>
                  {/* Label */}
                  <span className={`text-[10px] font-medium mt-0.5 transition-colors duration-200 ${
                    isActive ? "text-[#ff4500]" : "text-[#444] group-hover:text-[#666]"
                  }`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
