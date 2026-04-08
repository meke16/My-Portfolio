import React, { useState } from "react";
import { StaggerContainer } from "./StaggerContainer";

function Tooltip({ visible, children, label, proficiency, level }) {
  return (
    <div className="relative group">
      {children}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0 invisible"}`}>
        <div className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-xl whitespace-nowrap">
          <p className="text-xs font-medium text-white">{label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#ff4500] font-mono">{proficiency}%</span>
            <span className="text-[10px] text-[#888] font-mono">{level}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45 -translate-y-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillRow({ skill, levelLabel, barColor }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Tooltip
      visible={hovered}
      label={skill.name}
      proficiency={skill.proficiency}
      level={levelLabel(skill.proficiency)}
    >
      <div
        className="transition-transform duration-300 hover:translate-x-1 cursor-default"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            {skill.logo && (
              <img src={skill.logo} alt={skill.name}
                className="w-5 h-5 object-contain opacity-80"
                onError={(e) => { e.target.style.display = "none"; }} />
            )}
            <span className="text-sm font-medium text-[#ddd]">{skill.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555] font-mono">{levelLabel(skill.proficiency)}</span>
            <span className="text-xs font-mono text-[#ff4500]">{skill.proficiency}%</span>
          </div>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 hover:brightness-110"
            style={{ width: `${skill.proficiency}%`, backgroundColor: barColor(skill.proficiency) }}
          />
        </div>
      </div>
    </Tooltip>
  );
}

function SkillsSection({ skills }) {
  if (!skills?.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-[#555] text-lg font-mono">No skills added yet.</p>
      </div>
    );

  const groupedByTypeAndCategory = skills.reduce((acc, skill) => {
    const type = String(skill.skillType || "hard").toLowerCase() === "soft" ? "soft" : "hard";
    const cat = skill.category || "Other";
    if (!acc[type]) acc[type] = {};
    if (!acc[type][cat]) acc[type][cat] = [];
    acc[type][cat].push(skill);
    return acc;
  }, { hard: {}, soft: {} });

  const hardCategoryOrder = ["Frontend", "Backend", "Framework", "Database", "Tools", "Other"];
  const softCategoryOrder = [
    "Communication",
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Adaptability",
    "Time Management",
    "Other",
  ];

  const levelLabel = (p) => {
    if (p >= 90) return "Expert";
    if (p >= 75) return "Advanced";
    if (p >= 55) return "Intermediate";
    return "Beginner";
  };

  const barColor = (p) => {
    if (p >= 90) return "#ff4500";
    if (p >= 75) return "#ff6a33";
    if (p >= 55) return "#ff8c66";
    return "#555";
  };

  return (
    <section className="min-h-screen py-16 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff4500]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">What I work with</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Skills</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
          <p className="mt-4 text-sm md:text-base text-[#8f8f8f] leading-relaxed">
            A mix of technical and interpersonal strengths. The balance matters because good software is both useful and easy to work with.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-[#a8a8a8]">
              {skills.filter((s) => String(s.skillType || "hard").toLowerCase() === "hard").length} hard skills
            </span>
            <span className="px-3 py-1 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 text-xs font-mono text-[#ff9a72]">
              {skills.filter((s) => String(s.skillType || "hard").toLowerCase() === "soft").length} soft skills
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {[{ key: "hard", title: "Hard Skills", order: hardCategoryOrder }, { key: "soft", title: "Soft Skills", order: softCategoryOrder }]
            .map((section) => {
              const typeMap = groupedByTypeAndCategory[section.key] || {};
              const categories = [
                ...section.order.filter((c) => Array.isArray(typeMap[c]) && typeMap[c].length > 0),
                ...Object.keys(typeMap).filter((c) => !section.order.includes(c)),
              ];
              if (!categories.length) return null;

              return (
                <div key={section.key} className="space-y-4">
                  <div className="mb-1 flex items-center gap-3">
                    <h3 className="text-xl md:text-2xl font-bold text-white">{section.title}</h3>
                    <span className="h-px w-12 bg-[#ff4500]/40" />
                  </div>

                  <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-5">
                    {categories.map((category) => {
                      const catSkills = typeMap[category];
                      return (
                        <div key={`${section.key}-${category}`} className="rounded-2xl border border-white/[0.07] bg-[#111] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4500]/30 hover:shadow-[0_12px_30px_rgba(255,69,0,0.12)]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-md bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                              <span className="text-[#ff4500] text-[10px] font-black">{category[0]}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm">{category}</h4>
                            <span className="ml-auto text-[10px] text-[#555] font-mono">{catSkills.length} skills</span>
                          </div>

                          <div className="space-y-4">
                            {catSkills.map((skill) => (
                              <SkillRow key={skill.id || skill.name} skill={skill} levelLabel={levelLabel} barColor={barColor} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </StaggerContainer>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

export { SkillsSection };
export default SkillsSection;
