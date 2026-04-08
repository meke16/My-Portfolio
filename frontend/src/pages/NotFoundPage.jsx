import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-6">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff4500]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-flex items-center gap-1 font-mono bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 mb-8">
          <span className="text-[#ff4500] select-none font-light">`</span>
          <span className="text-white text-xl font-semibold">404</span>
          <span className="text-[#ff4500] select-none font-light">`</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black text-white mb-4">
          Page not found
        </h1>
        <p className="text-[#888] text-lg leading-relaxed mb-10">
          The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/"
            className="px-6 py-3 bg-[#ff4500] text-white font-semibold text-sm rounded-md hover:bg-[#cc3700] transition-colors duration-200">
            Go home
          </Link>
          <Link to="/projects"
            className="px-6 py-3 border border-white/15 text-white font-semibold text-sm rounded-md hover:bg-white/5 hover:border-white/30 transition-all duration-200">
            View projects
          </Link>
        </div>
      </div>
    </section>
  );
}

export { NotFoundPage };
export default NotFoundPage;
