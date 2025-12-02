import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Code2,
} from "lucide-react";

export default function ProjectsSection({ projects }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- Logic & Helpers ---

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => (document.body.style.overflow = "unset");
  }, [selectedProject]);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProject) return;

      const images = getProjectImages(selectedProject);

      if (e.key === "Escape") closeProject();
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
      if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, currentImageIndex]);

  // Parse images helper
  const getProjectImages = (project) => {
    if (!project.image) return [];
    // Ensure it’s always an array
    return Array.isArray(project.image) ? project.image : [project.image];
  };
  // Parse technologies helper
  const getProjectTech = (project) => {
    return project.technologies?.split(",").map((t) => t.trim()) || [];
  };

  const openProject = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  // Extract unique technologies for filter
  const allTechnologies = [
    ...new Set(projects?.flatMap((p) => getProjectTech(p)) || []),
  ];

  // Filter Logic
  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) =>
          project.technologies
            ?.toLowerCase()
            .includes(activeFilter.toLowerCase())
        );

  // --- Render ---

  if (!projects?.length) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-500">
        <Layers className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-xl font-medium">No projects found.</p>
      </div>
    );
  }

  return (
    <>
      <section
        id="projects"
        className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Featured{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Projects
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              A selection of my recent work, featuring full-stack applications
              and experimental designs.
            </motion.p>
          </div>

          {/* Filters */}
          {allTechnologies.length > 0 && (
            <div className="overflow-x-auto py-4 mb-12">
              <div className="flex gap-2 min-w-max px-4">
                <button
                  onClick={() => setActiveFilter("All")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter.toLowerCase() === "all"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  All
                </button>
                {Array.from(
                  new Set(
                    allTechnologies.map((tech) => tech.toLowerCase()) // lowercase for uniqueness
                  )
                )
                  .sort() // sort alphabetically
                  .map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setActiveFilter(tech)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeFilter.toLowerCase() === tech
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {tech.charAt(0).toUpperCase() + tech.slice(1)}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) => {
                const images = getProjectImages(project);
                const techStack = getProjectTech(project);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={project.id || index}
                    onClick={() => openProject(project)}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Card Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Project
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      {/* Optional Year Display */}
                      {project.year && (
                        <span className="inline-block text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full mb-2">
                          Developed: {project.year}
                        </span>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {techStack.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md font-medium"
                          >
                            {t}
                          </span>
                        ))}
                        {techStack.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                            +{techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No projects found for this filter.
              </p>
              <button
                onClick={() => setActiveFilter("All")}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------- */}
      {/* FULL SCREEN PROJECT MODAL (IMMERSIVE VIEW)  */}
      {/* ------------------------------------------- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950 overflow-y-auto sm:overflow-hidden"
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
              <button
                onClick={closeProject}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition">
                  <ArrowLeft size={20} />
                </div>
                <span className="font-medium">Back to Projects</span>
              </button>

              <div className="flex gap-3">
                {selectedProject.github_url && (
                  <a
                    href={selectedProject.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
                    title="View Code"
                  >
                    <Github size={24} />
                  </a>
                )}
                {selectedProject.url && (
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
                    title="Live Demo"
                  >
                    <ExternalLink size={24} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left: Image Gallery (Takes priority) */}
              <div className="flex-1 relative bg-black flex items-center justify-center p-4 lg:p-12 h-[50vh] lg:h-auto">
                {/* Background Blur */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={getProjectImages(selectedProject)[currentImageIndex]}
                    className="w-full h-full object-cover blur-3xl opacity-20"
                    alt="blur-bg"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Main Image */}
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 max-w-full max-h-full"
                >
                  <img
                    src={getProjectImages(selectedProject)[currentImageIndex]}
                    alt={`Screenshot ${currentImageIndex + 1}`}
                    className="max-h-[70vh] w-auto rounded-lg shadow-2xl border border-white/10"
                  />
                </motion.div>

                {/* Gallery Controls */}
                {getProjectImages(selectedProject).length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0
                            ? getProjectImages(selectedProject).length - 1
                            : prev - 1
                        )
                      }
                      className="absolute left-4 lg:left-8 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-blue-600 transition-colors border border-white/10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === getProjectImages(selectedProject).length - 1
                            ? 0
                            : prev + 1
                        )
                      }
                      className="absolute right-4 lg:right-8 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-blue-600 transition-colors border border-white/10"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {getProjectImages(selectedProject).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex
                              ? "bg-white w-6"
                              : "bg-white/40 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Project Details (Scrollable) */}
              <div className="w-full lg:w-[400px] xl:w-[500px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 overflow-y-auto p-8 shadow-2xl z-20">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {selectedProject.title}
                    </h3>
                    {/* Year */}
                    {selectedProject.year && (
                      <span className="inline-block text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full mb-4">
                        Developed: {selectedProject.year}
                      </span>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <Code2 size={16} /> Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getProjectTech(selectedProject).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons (Redundant but useful here too) */}
                  <div className="flex flex-col gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    {selectedProject.url && (
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                      >
                        <ExternalLink size={18} /> Visit Live Site
                      </a>
                    )}
                    {selectedProject.github_url && (
                      <a
                        href={selectedProject.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <Github size={18} /> View Source Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
