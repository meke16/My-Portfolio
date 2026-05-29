import React, { useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  Star,
  X,
} from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import ImageUploadField from "../../components/admin/ImageUploadField";

const emptyForm = {
  title: "",
  description: "",
  images: [],
  url: "",
  github_url: "",
  technologies: "",
  featured: false,
  year: "",
  order: "",
};

export default function AdminProjects() {
  const { db, projects, reload } = useFirestorePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    const imgs = Array.isArray(p.image) ? p.image : p.image ? [p.image] : [];
    setForm({
      title: p.title || "",
      description: p.description || "",
      images: imgs,
      url: p.url || "",
      github_url: p.github_url || "",
      technologies: p.technologies || "",
      featured: Boolean(p.featured),
      year: p.year || "",
      order: p.order ?? "",
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.images.filter(Boolean),
      url: form.url.trim(),
      github_url: form.github_url.trim(),
      technologies: form.technologies.trim(),
      featured: form.featured,
      year: form.year.trim(),
      order: form.order ? Number(form.order) : 0,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "projects", editing.id), payload);
      } else {
        await addDoc(collection(db, "projects"), payload);
      }
      await reload();
      close();
    } catch (err) {
      window.alert(err?.message || "Save failed");
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null || !db) return;
    try {
      await deleteDoc(doc(db, "projects", deleteId));
      await reload();
      setDeleteId(null);
    } catch (err) {
      window.alert(err?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[3px] border-white/20 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Projects</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">Inventory of technical deployments</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-3 px-6 py-3.5 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Add new project
        </button>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="border-[3px] border-white bg-[#111111] py-20 text-center shadow-brutalist-white">
            <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">No assets indexed.</p>
            <p className="text-[10px] text-white/10 mt-2 font-bold uppercase tracking-widest">Initialize your first collection.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="group border-[2.5px] border-white bg-[#111111] p-6 flex flex-col sm:flex-row gap-6 shadow-brutalist-white hover:shadow-brutalist-white-lg transition-all"
            >
              <div className="shrink-0">
                {Array.isArray(project.image) && project.image[0] ? (
                  <div className="w-32 h-32 border-[2px] border-white shadow-brutalist-white-sm overflow-hidden bg-black">
                    <img
                      src={project.image[0]}
                      alt=""
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-[2px] border-white bg-[#0a0a0a] flex items-center justify-center text-4xl font-black text-white shadow-brutalist-white-sm uppercase italic">
                    {project.title?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-xl text-white uppercase tracking-tight italic">{project.title}</h3>
                    {project.featured && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-accent text-white px-3 py-1 border-[1.5px] border-white shadow-brutalist-white-sm uppercase tracking-widest">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border-[2px] border-white bg-[#161616] text-white hover:bg-white hover:text-black shadow-brutalist-white-sm transition-all active:shadow-none"
                      >
                        <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border-[2px] border-white bg-[#161616] text-white hover:bg-white hover:text-black shadow-brutalist-white-sm transition-all active:shadow-none"
                      >
                        <Github className="w-4 h-4" strokeWidth={2.5} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(project)}
                      className="p-2 border-[2px] border-white bg-[#161616] text-blue-400 hover:bg-blue-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(project.id)}
                      className="p-2 border-[2px] border-white bg-[#161616] text-red-400 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-400 line-clamp-2 leading-relaxed">{project.description}</p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Priority Index: {project.order ?? 0}</span>
                  {project.year && <span className="text-[10px] font-black text-white/30 uppercase tracking-widest border-l border-white/10 pl-4">Deployment: {project.year}</span>}
                </div>
                {project.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.split(",").map((t, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black px-2.5 py-1 border-[1.5px] border-white bg-white text-black uppercase tracking-widest"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-[3px] border-white bg-[#111111] shadow-brutalist-white-lg">
            <div className="flex items-center justify-between p-6 border-b-[3px] border-white/20 bg-[#111111] sticky top-0 z-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {editing ? "Modify deployment" : "Initial deployment"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="p-2 border-[2px] border-white text-white hover:bg-white hover:text-black transition-all shadow-brutalist-white-sm active:shadow-none"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Project Identity *</label>
                <input
                  required
                  placeholder="e.g. CORE INFRASTRUCTURE"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all uppercase placeholder:text-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Briefing</label>
                <textarea
                  rows={4}
                  placeholder="Technical summary of the deployment..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-none placeholder:text-white/10"
                />
              </div>
              <div className="p-6 border-[2px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm">
                <ImageUploadField
                  folder="projects"
                  multiple
                  values={form.images}
                  onValuesChange={(images) => setForm({ ...form, images })}
                />
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-4 tracking-widest">Input stream: PNG/JPG. Priority 0 = Primary manifest image.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Deployment</label>
                  <input
                    placeholder="https://..."
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase placeholder:text-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Source control</label>
                  <input
                    placeholder="https://github.com/..."
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Technical stack</label>
                <input
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  placeholder="REACT, TYPESCRIPT, FIREBASE"
                  className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase placeholder:text-white/10"
                />
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Comma-delimited sequence</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Timeline</label>
                  <input
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Sort priority index</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm"
                  />
                </div>
              </div>
              <label className="flex items-center justify-between gap-4 border-[2px] border-white p-6 cursor-pointer bg-accent/5 hover:bg-accent/10 transition-colors shadow-brutalist-accent">
                <div>
                  <span className="text-xs font-black uppercase text-white tracking-widest italic">Promote to Featured</span>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">High-visibility placement activation</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-6 h-6 border-[2.5px] border-white bg-black accent-accent shadow-brutalist-white-sm"
                />
              </label>
              <div className="flex justify-end gap-4 pt-6 border-t-[2px] border-white/20 border-dashed">
                <button
                  type="button"
                  onClick={close}
                  className="px-8 py-4 border-[2.5px] border-white bg-transparent text-white text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-brutalist-white-sm"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  {editing ? "Update Database" : "Commit Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-[2px]">
          <div className="w-full max-w-md border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-lg">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Purge document?</h3>
            <p className="text-sm font-bold text-gray-500 mt-4 uppercase leading-relaxed">Warning: Irreversible data removal from core infrastructure.</p>
            <div className="flex justify-end gap-4 mt-10">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-8 py-4 border-[2px] border-white bg-transparent text-white text-[10px] font-black uppercase tracking-widest shadow-brutalist-white-sm"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-8 py-4 border-[2px] border-white bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-brutalist-white-sm"
              >
                Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
