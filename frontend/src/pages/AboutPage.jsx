import React from "react";
import { Link } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";

function AboutPage() {
  const { info, about } = useFirestorePortfolio();

  return (
    <section className="min-h-screen pt-28 pb-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-300/90 font-semibold">
            About
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">
            {about?.headline || `About ${info?.name || "me"}`}
          </h1>
          <p className="mt-5 text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {about?.overview ||
              "I build modern web experiences with a strong focus on user experience, performance, and maintainable architecture."}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-gray-500 text-sm">Role</p>
              <p className="text-white font-medium mt-1">
                {info?.title || "Full Stack Developer"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-white font-medium mt-1 break-all">{info?.email || "—"}</p>
            </div>
          </div>

          {Array.isArray(about?.journey) && about.journey.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-white mb-5">My journey</h2>
              <div className="space-y-4">
                {about.journey.map((item, idx) => (
                  <div
                    key={`${item.title}-${idx}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-white font-medium">{item.title}</h3>
                      {item.period && (
                        <span className="text-xs rounded-full px-2.5 py-1 bg-blue-500/20 text-blue-300">
                          {item.period}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-300 mt-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mt-10">
            {Array.isArray(about?.focusAreas) && about.focusAreas.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-white font-medium mb-3">Focus areas</h3>
                <ul className="space-y-2">
                  {about.focusAreas.map((item, idx) => (
                    <li key={`${item}-${idx}`} className="text-gray-300 text-sm">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(about?.principles) && about.principles.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-white font-medium mb-3">Principles</h3>
                <ul className="space-y-2">
                  {about.principles.map((item, idx) => (
                    <li key={`${item}-${idx}`} className="text-gray-300 text-sm">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-white text-sm font-medium hover:bg-blue-500"
            >
              View projects
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-lg border border-white/15 px-5 py-2.5 text-white text-sm font-medium hover:bg-white/5"
            >
              Contact me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
