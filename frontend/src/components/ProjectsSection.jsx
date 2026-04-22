import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Github, ExternalLink, ChevronLeft, ChevronRight, Code2, Layers } from "lucide-react";

function ProjectsSection({ projects }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!selectedProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev || ""; };
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e) => {
      const imgs = getImages(selectedProject);
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") setCurrentImageIndex((p) => (p === 0 ? imgs.length - 1 : p - 1));
      if (e.key === "ArrowRight") setCurrentImageIndex((p) => (p === imgs.length - 1 ? 0 : p + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject]);

  const getImages = (p) => !p.image ? [] : Array.isArray(p.image) ? p.image : [p.image];
  const getTech = (p) => p.technologies?.split(",").map((t) => t.trim()) || [];

  const open = (p) => { setSelectedProject(p); setCurrentImageIndex(0); };
  const close = () => { setSelectedProject(null); setCurrentImageIndex(0); };

  const allTech = [...new Set(projects?.flatMap(getTech) || [])];
  const sorted = [...(projects || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const filtered = activeFilter === "All"
    ? sorted
    : sorted.filter((p) => p.technologies?.toLowerCase().includes(activeFilter.toLowerCase()));
  const featuredCount = projects?.filter((p) => p.featured).length || 0;

  if (!projects?.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <Layers className="w-12 h-12 text-[#333]" />
        <p className="text-[#555] font-mono">No projects yet.</p>
      </div>
    );

  return (
    <>
      <section className="min-h-screen py-16 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#ff4500]/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">What I've built</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Projects</h2>
            <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
            <p className="mt-4 text-sm md:text-base text-[#8f8f8f] leading-relaxed max-w-2xl">
              A focused look at the work that best shows how I think, build, and polish product experiences.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-[#a8a8a8]">
                {projects.length} total projects
              </span>
              <span className="px-3 py-1 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 text-xs font-mono text-[#ff9a72]">
                {featuredCount} featured
              </span>
            </div>
          </div>

          {/* Filters */}
          {allTech.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {['All', ...allTech.sort()].map((tech) => (
                <button key={tech} onClick={() => setActiveFilter(tech)}
                  className={`px-4 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-200 ${
                    activeFilter.toLowerCase() === tech.toLowerCase()
                      ? "bg-[#ff4500] text-white"
                      : "border border-white/[0.08] text-[#666] hover:text-white hover:border-white/20"
                  }`}>
                  {tech}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
            <AnimatePresence>
              {filtered?.map((project, idx) => {
                const images = getImages(project);
                const tech = getTech(project);
                const isFeatured = Boolean(project.featured);
                return (
                  <motion.div key={project.id || idx} layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
                    onClick={() => open(project)}
                    className="group rounded-2xl border border-white/[0.07] bg-[#111] overflow-hidden cursor-pointer hover:border-[#ff4500]/30 transition-all duration-300 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-[#0d0d0d]">
                      {images[0] ? (
                        <img src={images[0]} alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Code2 className="w-10 h-10 text-[#333]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#ff4500] text-white text-xs font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Open →
                      </div>
                      {isFeatured && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 border border-[#ff4500]/25 text-[#ffb08d] text-[10px] font-mono uppercase tracking-[0.18em]">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-bold text-sm group-hover:text-[#ff4500] transition-colors">
                          {project.title}
                        </h3>
                        {project.year && (
                          <span className="text-xs text-[#555] font-mono shrink-0">{project.year}</span>
                        )}
                      </div>
                      <p className="text-[#8a8a8a] text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {tech.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-[#ff4500]/10 text-[#ff6a33] rounded font-mono">{t}</span>
                        ))}
                        {tech.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-white/5 text-[#555] rounded font-mono">+{tech.length - 3}</span>
                        )}
                      </div>
                      <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-[#777]">
                        <span>Open case study</span>
                        <span className="text-[#ff4500]">View details</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#555] font-mono mb-4">No projects match this filter.</p>
              <button onClick={() => setActiveFilter("All")}
                className="text-[#ff4500] text-sm hover:underline font-mono">Clear filter</button>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* Modal rendered via portal */}
      {selectedProject &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="project-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a]"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.07] bg-[#0a0a0a]/95 backdrop-blur-md"
              >
                <button
                  onClick={close}
                  className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="flex gap-2">
                  {selectedProject.github_url && (
                    <a href={selectedProject.github_url} target="_blank" rel="noreferrer"
                      className="p-2 text-[#666] hover:text-white transition-colors" title="Source code">
                      <Github size={18} />
                    </a>
                  )}
                  {selectedProject.url && (
                    <a href={selectedProject.url} target="_blank" rel="noreferrer"
                      className="p-2 text-[#666] hover:text-[#ff4500] transition-colors" title="Live demo">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Image panel */}
              <div className="flex-1 relative bg-[#050505] flex items-center justify-center p-6 lg:p-12 min-h-[40vh] lg:min-h-0">
                <div className="absolute inset-0 overflow-hidden">
                  <img src={getImages(selectedProject)[currentImageIndex]}
                    className="w-full h-full object-cover blur-3xl opacity-10" alt="" />
                </div>
                <motion.img key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={getImages(selectedProject)[currentImageIndex]}
                  alt={`Screenshot ${currentImageIndex + 1}`}
                  className="relative z-10 max-h-[65vh] w-auto rounded-lg border border-white/[0.07] shadow-2xl" />

                {getImages(selectedProject).length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex((p) => p === 0 ? getImages(selectedProject).length - 1 : p - 1)}
                      className="absolute left-4 z-20 p-2.5 rounded-md bg-black/60 text-white hover:bg-[#ff4500] transition-colors border border-white/10"
                      aria-label="Previous image">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentImageIndex((p) => p === getImages(selectedProject).length - 1 ? 0 : p + 1)}
                      className="absolute right-4 z-20 p-2.5 rounded-md bg-black/60 text-white hover:bg-[#ff4500] transition-colors border border-white/10"
                      aria-label="Next image">
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20" role="tablist" aria-label="Image thumbnails">
                      {getImages(selectedProject).map((_, i) => (
                        <button key={i} onClick={() => setCurrentImageIndex(i)}
                          className={`h-1 rounded-full transition-all duration-200 ${i === currentImageIndex ? "w-6 bg-[#ff4500]" : "w-1.5 bg-white/30"}`}
                          role="tab"
                          aria-selected={i === currentImageIndex}
                          aria-label={`View image ${i + 1}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Details panel */}
              <div className="w-full lg:w-[380px] bg-[#0f0f0f] border-t lg:border-t-0 lg:border-l border-white/[0.07] overflow-y-auto p-5 sm:p-6">
                <div className="space-y-5">
                  <div>
                    {selectedProject.featured && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#ff9a72] mb-3">
                        Featured project
                      </span>
                    )}
                    <h3 className="text-xl font-black text-white mb-2">{selectedProject.title}</h3>
                    {selectedProject.year && (
                      <span className="text-xs font-mono text-[#ff4500] bg-[#ff4500]/10 px-2.5 py-1 rounded">
                        {selectedProject.year}
                      </span>
                    )}
                    <p className="text-[#888] text-sm leading-relaxed mt-3">{selectedProject.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-[#0b0b0b] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-mono">Stack</p>
                      <p className="mt-1 text-white text-sm font-semibold">{getTech(selectedProject).length || 0} tools</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#0b0b0b] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-mono">Media</p>
                      <p className="mt-1 text-white text-sm font-semibold">{getImages(selectedProject).length || 0} images</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#555] mb-3 flex items-center gap-2">
                      <Code2 size={12} /> Tech stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getTech(selectedProject).map((t) => (
                        <span key={t} className="px-3 py-1 bg-[#ff4500]/10 text-[#ff6a33] text-xs font-mono rounded border border-[#ff4500]/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-6 border-t border-white/[0.07]">
                    {selectedProject.url && (
                      <a href={selectedProject.url} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#ff4500] text-white rounded-md font-semibold text-sm hover:bg-[#cc3700] transition-colors">
                        <ExternalLink size={15} /> Live site
                      </a>
                    )}
                    {selectedProject.github_url && (
                      <a href={selectedProject.github_url} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 text-white rounded-md font-semibold text-sm hover:bg-white/5 transition-colors">
                        <Github size={15} /> Source code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export { ProjectsSection };
export default ProjectsSection;
