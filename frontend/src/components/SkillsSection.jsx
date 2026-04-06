import React from "react";

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
        <div className="mb-10">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">What I work with</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Skills</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
        </div>

        {[{ key: "hard", title: "Hard Skills", order: hardCategoryOrder }, { key: "soft", title: "Soft Skills", order: softCategoryOrder }]
          .map((section) => {
            const typeMap = groupedByTypeAndCategory[section.key] || {};
            const categories = [
              ...section.order.filter((c) => Array.isArray(typeMap[c]) && typeMap[c].length > 0),
              ...Object.keys(typeMap).filter((c) => !section.order.includes(c)),
            ];
            if (!categories.length) return null;

            return (
              <div key={section.key} className="mb-10 last:mb-0">
                <div className="mb-5 flex items-center gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-white">{section.title}</h3>
                  <span className="h-px w-12 bg-[#ff4500]/40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const catSkills = typeMap[category];
                    return (
                      <div key={`${section.key}-${category}`} className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-6 h-6 rounded-md bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                            <span className="text-[#ff4500] text-[10px] font-black">{category[0]}</span>
                          </div>
                          <h4 className="text-white font-bold text-sm">{category}</h4>
                          <span className="ml-auto text-[10px] text-[#555] font-mono">{catSkills.length} skills</span>
                        </div>

                        <div className="space-y-4">
                          {catSkills.map((skill) => (
                            <div key={skill.id || skill.name}>
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
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${skill.proficiency}%`, backgroundColor: barColor(skill.proficiency) }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

export { SkillsSection };
export default SkillsSection;
