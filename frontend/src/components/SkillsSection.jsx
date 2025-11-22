import React from "react";

export default function SkillsSection({ skills }) {
  if (!skills?.length)
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No skills added yet.</p>
        </div>
      </div>
    );

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  // Preferred category order
  const categoryOrder = [
    "Frontend",
    "Backend",
    "Framework",
    "Database",
    "Tools",
    "Other",
  ];

  const getProficiencyColor = (proficiency) => {
    if (proficiency >= 90) return "from-green-500 to-emerald-600";
    if (proficiency >= 80) return "from-blue-500 to-cyan-600";
    if (proficiency >= 70) return "from-purple-500 to-indigo-600";
    if (proficiency >= 60) return "from-yellow-500 to-orange-500";
    return "from-gray-400 to-gray-500";
  };

  const getProficiencyLevel = (proficiency) => {
    if (proficiency >= 90) return "Expert";
    if (proficiency >= 80) return "Advanced";
    if (proficiency >= 70) return "Intermediate";
    if (proficiency >= 60) return "Beginner";
    return "Novice";
  };

  const categoryColors = {
    Frontend: "blue",
    Backend: "green",
    Framework: "purple",
    Database: "orange",
    Tools: "red",
    Other: "gray",
  };

  return (
    <section
      id="skills"
      className="py-20 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            My{" "}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skills
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
          <div className="w-24 h-1 bg-linear-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {categoryOrder.map((category) => {
            const categorySkills = skillsByCategory[category];
            if (!categorySkills?.length) return null;
            const color = categoryColors[category] || "gray";

            return (
              <div
                key={category}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 transition-transform duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(128,0,255,0.5)] hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 bg-${color}-500/10 rounded-lg flex items-center justify-center mr-4`}
                  >
                    <span className={`text-${color}-500 font-bold`}>
                      {category[0]}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category}
                  </h3>
                </div>

                <div className="space-y-6">
                  {categorySkills.map((skill, index) => (
                    <div
                      key={skill.name}
                      className="group relative overflow-hidden rounded-xl p-3 transition-all duration-500 cursor-pointer"
                    >
                      {/* Glow background on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl pointer-events-none"></div>

                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                            <img
                              src={skill.logo}
                              alt={skill.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {skill.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {getProficiencyLevel(skill.proficiency)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative z-10">
                        <div
                          className={`h-full rounded-full bg-linear-to-r ${getProficiencyColor(
                            skill.proficiency
                          )} transition-all duration-1000 ease-out transform origin-left group-hover:scale-y-125`}
                          style={{
                            width: `${skill.proficiency}%`,
                            transitionDelay: `${index * 100}ms`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 relative z-10">
                        <span>0%</span>
                        <span className="font-semibold">{skill.proficiency}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
