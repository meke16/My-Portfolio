import React from "react";
import { Link } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";

function AboutPage() {
  const { info, about } = useFirestorePortfolio();

  return (
    <section className="min-h-screen pt-16 pb-12 bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ff4500]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">About me</p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {about?.headline || `Who is ${info?.name?.split(" ")[0] || "I"}?`}
            </h1>
            <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
          </div>

          {/* Overview */}
          <p className="text-[#999] text-base leading-relaxed mb-8 max-w-2xl">
            {about?.overview || "I build modern web experiences with a strong focus on user experience, performance, and maintainable architecture."}
          </p>

          {/* Info cards */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
              <p className="text-xs text-[#555] font-mono uppercase tracking-wider mb-1">Role</p>
              <p className="text-white font-semibold">{info?.title || "Full Stack Developer"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
              <p className="text-xs text-[#555] font-mono uppercase tracking-wider mb-1">Email</p>
              <p className="text-white font-semibold break-all">{info?.email || "—"}</p>
            </div>
          </div>

          {/* Journey */}
          {Array.isArray(about?.journey) && about.journey.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-5 h-0.5 bg-[#ff4500]" />
                My journey
              </h2>
              <div className="space-y-3 border-l border-white/[0.07] pl-6">
                {about.journey.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#ff4500]" />
                    <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        {item.period && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#ff4500]/10 text-[#ff4500] font-mono">
                            {item.period}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[#888] text-sm leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus & Principles */}
          <div className="grid md:grid-cols-2 gap-3 mb-8">
            {Array.isArray(about?.focusAreas) && about.focusAreas.length > 0 && (
              <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#ff4500]" /> Focus areas
                </h3>
                <ul className="space-y-2">
                  {about.focusAreas.map((item, idx) => (
                    <li key={idx} className="text-[#888] text-sm flex items-center gap-2">
                      <span className="text-[#ff4500]">→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(about?.principles) && about.principles.length > 0 && (
              <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#ff4500]" /> Principles
                </h3>
                <ul className="space-y-2">
                  {about.principles.map((item, idx) => (
                    <li key={idx} className="text-[#888] text-sm flex items-center gap-2">
                      <span className="text-[#ff4500]">→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/projects"
              className="px-5 py-2.5 bg-[#ff4500] text-white text-sm font-semibold rounded-md hover:bg-[#cc3700] transition-colors">
              View projects
            </Link>
            <Link to="/contact"
              className="px-5 py-2.5 border border-white/15 text-white text-sm font-semibold rounded-md hover:bg-white/5 transition-all">
              Contact me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export { AboutPage };
export default AboutPage;
