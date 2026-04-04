import React from "react";
import { Link } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";

function AboutPage() {
  const { info } = useFirestorePortfolio();

  return (
    <section className="min-h-screen pt-28 pb-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-300/90 font-semibold">
            About
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">
            About {info?.name || "me"}
          </h1>
          <p className="mt-5 text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {info?.bio ||
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

export { AboutPage };
export default AboutPage;
