import React, { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";

function WorkExperiencePage() {
  const { workExperience } = useFirestorePortfolio();
  const [content, setContent] = useState(workExperience);

  useEffect(() => {
    setContent(workExperience);
  }, [workExperience]);

  return (
    <section className="min-h-screen pt-16 pb-12 bg-[#0a0a0a] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-[#ff4500]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">Career timeline</p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {content.headline || "Work & Experience"}
            </h1>
            <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
            {content.intro && (
              <p className="mt-4 text-[#999] text-base leading-relaxed max-w-3xl">{content.intro}</p>
            )}
          </div>

          {content.experiences.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-[#111] p-8 text-center text-[#777]">
              No experience entries yet.
            </div>
          ) : (
            <div className="space-y-4 border-l border-white/[0.08] pl-6">
              {content.experiences.map((exp, index) => (
                <article key={exp.id || index} className="relative rounded-xl border border-white/[0.07] bg-[#111] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff4500]/30 hover:shadow-[0_10px_25px_rgba(255,69,0,0.12)]">
                  <div className="absolute -left-[25px] top-6 w-2.5 h-2.5 rounded-full bg-[#ff4500]" />
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-white text-lg font-semibold">{exp.role || "Role"}</h2>
                      <p className="text-[#ff8a50] text-sm font-medium">{exp.company || "Company"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {exp.type && (
                        <span className="px-2.5 py-1 rounded-full bg-[#ff4500]/10 text-[#ff8a50] text-xs font-mono">
                          {exp.type}
                        </span>
                      )}
                      {exp.period && (
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[#aaa] text-xs font-mono">
                          {exp.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {exp.location && (
                    <p className="text-[#777] text-sm mb-3 inline-flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      {exp.location}
                    </p>
                  )}

                  {exp.summary && <p className="text-[#999] text-sm leading-relaxed mb-3">{exp.summary}</p>}

                  {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5">
                      {exp.highlights.map((h, i) => (
                        <li key={`${exp.id}-h-${i}`} className="text-[#8e8e8e] text-sm flex items-start gap-2">
                          <span className="text-[#ff4500] mt-0.5">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { WorkExperiencePage };
export default WorkExperiencePage;
