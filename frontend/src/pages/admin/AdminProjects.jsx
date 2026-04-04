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

const emptyForm = {
  title: "",
  description: "",
  images: [],
  url: "",
  github_url: "",
  technologies: "",
  featured: false,
  year: "",
};

export default function AdminProjects() {
  const { db, projects, reload } = useFirestorePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setNewImageUrl("");
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
    });
    setNewImageUrl("");
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setNewImageUrl("");
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Firestore collection: projects</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add project
        </button>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 py-16 text-center text-gray-500">
            No projects yet. Add one or import JSON from the dashboard.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 flex flex-col sm:flex-row gap-4"
            >
              <div className="shrink-0">
                {Array.isArray(project.image) && project.image[0] ? (
                  <img
                    src={project.image[0]}
                    alt=""
                    className="w-28 h-28 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-lg bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {project.title?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg text-white">{project.title}</h3>
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(project)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(project.id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                {project.technologies && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.split(",").map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Edit project" : "New project"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Images (URLs)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const t = newImageUrl.trim();
                      if (!t) return;
                      setForm({ ...form, images: [...form.images, t] });
                      setNewImageUrl("");
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded max-w-full"
                    >
                      <span className="truncate max-w-[200px]">{url}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            images: form.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-red-400 shrink-0"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Live URL</label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
                  <input
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Technologies</label>
                <input
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  placeholder="React, Node, PostgreSQL"
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Comma-separated</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year / period</label>
                <input
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="2026"
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-800 p-4 cursor-pointer">
                <div>
                  <span className="text-white font-medium">Featured project</span>
                  <p className="text-xs text-gray-500 mt-0.5">Highlight on the portfolio</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-5 h-5 accent-blue-600"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Delete project?</h3>
            <p className="text-sm text-gray-500">This removes the document from Firestore.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
