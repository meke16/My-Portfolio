import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>
  )},
  { to: "/about", label: "About", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  )},
  { to: "/experience", label: "Experience", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v6"/></svg>
  )},
  { to: "/skills", label: "Skills", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
  )},
  { to: "/projects", label: "Projects", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
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
  const { theme, toggleTheme } = useTheme();
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
          <div className="flex items-center justify-end lg:justify-center h-12">
            <div ref={navRef} className="relative flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/80 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)]">

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
                className="relative z-10 ml-2 flex items-center gap-2 px-5 py-2 bg-[#ff4500] text-white text-sm font-semibold rounded-xl hover:bg-[#cc3700] hover:shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                Get In Touch
              </Link>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="relative z-10 ml-1 p-2 rounded-xl text-[#8a8a8a] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        mobileNavVisible ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-around rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/90 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.4)] px-1 py-1.5">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className="relative flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-200 group"
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

      {/* ── Mobile theme toggle (floating) ────────────────── */}
      <button
        onClick={toggleTheme}
        className="lg:hidden fixed bottom-24 right-5 z-50 p-3 rounded-full border border-white/[0.08] bg-[#0f0f0f]/90 backdrop-blur-xl text-[#8a8a8a] hover:text-white hover:border-[#ff4500]/35 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        )}
      </button>
    </>
  );
}

export default Navbar;
