import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "../hooks/useReducedMotion";


const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23444'%3EPhoto%3C/text%3E%3C/svg%3E";

function socialHref(platform, value) {
  const v = String(value ?? "").trim();
  if (!v) return "#";
  if (/^https?:\/\//i.test(v)) return v;
  const slug = v.replace(/^@/, "").replace(/^\//, "");
  switch (platform) {
    case "github": return `https://github.com/${slug}`;
    case "linkedin": return `https://linkedin.com/in/${slug}`;
    case "twitter": return `https://twitter.com/${slug}`;
    case "facebook": return `https://facebook.com/${slug}`;
    case "tiktok": return `https://tiktok.com/@${slug}`;
    case "instagram": return `https://instagram.com/${slug}`;
    default: return v;
  }
}

const SOCIAL_ICONS = {
  github: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  linkedin: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
  facebook: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  instagram: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"/><circle cx="12" cy="12" r="4" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  tiktok: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
};

function TypingName({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [text, reduced]);

  useEffect(() => {
    if (done) {
      setShowCursor(false);
      return;
    }
    const blink = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(blink);
  }, [done]);

  return (
    <span className="inline-flex items-center gap-0 font-mono bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 sm:px-5 sm:py-2.5">
      <span className="text-[#ff4500] select-none text-2xl sm:text-3xl lg:text-4xl font-light leading-none mt-0.5">`</span>
      <span className="text-white text-2xl sm:text-3xl lg:text-4xl font-semibold leading-none">{displayed}</span>
      <span className="text-[#ff4500] select-none text-2xl sm:text-3xl lg:text-4xl font-light leading-none mt-0.5">`</span>
      <span
        className="inline-block w-0.5 h-7 sm:h-8 lg:h-9 bg-[#ff4500] ml-0.5"
        style={{ opacity: showCursor ? 1 : 0, transition: "opacity 100ms" }}
      />
    </span>
  );
}

function HeroSection({ info, stats = {} }) {
  const photoCardRef = React.useRef(null);
  const [photoTransform, setPhotoTransform] = React.useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale3d(1, 1, 1)"
  );

  const handlePhotoMove = (event) => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const card = photoCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 22;
    const rotateY = (x - 0.5) * 22;
    const translateX = (x - 0.5) * 14;
    const translateY = (y - 0.5) * 14;

    setPhotoTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px) scale3d(1.015, 1.015, 1.015)`
    );
  };

  const handlePhotoLeave = () => {
    setPhotoTransform(
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale3d(1, 1, 1)"
    );
  };

  const socials = (info?.socials && typeof info.socials === "object" && !Array.isArray(info.socials))
    ? info.socials : {};

  const activeSocials = Object.entries(socials).filter(([, v]) => v);

  return (
    <section className="min-h-screen flex items-center bg-[#0a0a0a] relative overflow-hidden pt-12">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      {/* Orange glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#ff4500]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left space-y-5">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ff4500]/30 bg-[#ff4500]/5 text-xs text-[#ff4500] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
              Available for work
            </div>

            <div className="space-y-2">
              <p className="text-[#888] text-xs font-mono tracking-widest uppercase">
                Hello, I'm
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
                <TypingName text={info?.name || "Your Name"} />
              </h1>
              <h2 className="text-lg sm:text-xl font-semibold text-[#ff4500]">
                {info?.title || "Full Stack Developer"}
              </h2>
            </div>

            <p className="text-[#999] text-sm sm:text-[15px] leading-relaxed max-w-xl mx-auto lg:mx-0">
              {info?.bio || "I design and build practical web products that feel polished, load fast, and stay easy to maintain. My focus is turning messy requirements into clear, usable experiences."}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/projects"
                className="px-5 py-2.5 bg-[#ff4500] text-white font-semibold text-sm rounded-md hover:bg-[#cc3700] transition-colors duration-200 shadow-[0_10px_25px_rgba(255,69,0,0.18)]">
                Explore projects
              </Link>
              <Link to="/contact"
                className="px-5 py-2.5 border border-white/15 text-white font-semibold text-sm rounded-md hover:bg-white/5 hover:border-white/30 transition-all duration-200">
                Start a conversation
              </Link>
              {info?.resume_url && (
                <a
                  href={info.resume_url}
                  download
                  className="px-5 py-2.5 flex items-center gap-2 border border-[#ff4500]/30 text-[#ff4500] font-semibold text-sm rounded-md hover:bg-[#ff4500]/10 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-6-6m6 6l6-6M5 20h14"/></svg>
                  Resume
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-2xl mx-auto lg:mx-0">
              <Link
                to="/projects"
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff4500]/35 hover:bg-[#ff4500]/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/60"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#666] font-mono">Projects</p>
                <p className="mt-1 text-white text-lg font-bold">{String(stats.projects ?? 0).padStart(2, "") + "+"}</p>
              </Link>
              <Link
                to="/skills"
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff4500]/35 hover:bg-[#ff4500]/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/60"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#666] font-mono">Skills</p>
                <p className="mt-1 text-white text-lg font-bold">25+</p>
              </Link>
              <Link
                to="/testimonials"
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff4500]/35 hover:bg-[#ff4500]/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/60"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#666] font-mono">Testimonials</p>
                <p className="mt-1 text-white text-lg font-bold">{String(stats.testimonials ?? 0).padStart(2, "") + "+"}</p>
              </Link>
            </div>

            {/* Socials */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-3 justify-center lg:justify-start pt-1">
                <span className="text-[10px] text-[#555] font-mono">FIND ME ON</span>
                <div className="h-px w-8 bg-[#333]" />
                <div className="flex gap-2">
                  {activeSocials.map(([platform, value]) => (
                    SOCIAL_ICONS[platform] && (
                      <a key={platform}
                        href={socialHref(platform, value)}
                        target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-white/10 text-[#666] hover:text-[#ff4500] hover:border-[#ff4500]/40 transition-all duration-200"
                        title={platform}>
                        {SOCIAL_ICONS[platform]}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — photo */}
          <div
            ref={photoCardRef}
            onMouseMove={handlePhotoMove}
            onMouseLeave={handlePhotoLeave}
            className="relative flex-shrink-0 w-64 h-[19rem] sm:w-72 sm:h-[21rem] lg:w-96 lg:h-[33rem] [perspective:1000px] transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: photoTransform }}
          >
            {/* Orange border frame */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[#ff4500] to-transparent opacity-40 blur-sm" />
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #1c0a00 0%, #110400 60%, #0a0a0a 100%)",
                boxShadow: "0 0 40px rgba(255,69,0,0.15), 0 0 80px rgba(255,69,0,0.07)"
              }}
            >
              <img
                src={info?.profile_image || PLACEHOLDER_AVATAR}
                alt={info?.name || "Profile"}
                className="absolute inset-0 w-full h-full object-contain object-center"
                onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
              />
            </div>
            {/* Decorative corner accent */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border-r-2 border-b-2 border-[#ff4500]/50 rounded-br-lg" />
            <div className="absolute -top-2 -left-2 w-12 h-12 border-l-2 border-t-2 border-[#ff4500]/20 rounded-tl-lg" />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#444] font-mono tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#ff4500]/50 to-transparent animate-pulse" />
        </div>
      </div>

    </section>
  );
}

export { HeroSection };
export default HeroSection;
