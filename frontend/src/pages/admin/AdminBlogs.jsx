import React, { useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { Plus, Pencil, Trash2, X, CalendarDays, Star } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import ImageUploadField from "../../components/admin/ImageUploadField";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  readTime: "",
  coverImage: "",
  slug: "",
  publishedAt: "",
  externalUrl: "",
  featured: false,
};

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function AdminBlogs() {
  const { db, blogs, reload } = useFirestorePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const sortedBlogs = [...(Array.isArray(blogs) ? blogs : [])].sort((a, b) => {
    const da = new Date(a?.publishedAt || 0).getTime();
    const dbb = new Date(b?.publishedAt || 0).getTime();
    return dbb - da;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      readTime: post.readTime || "",
      coverImage: post.coverImage || "",
      slug: post.slug || "",
      publishedAt: toDateInputValue(post.publishedAt),
      externalUrl: post.externalUrl || "",
      featured: Boolean(post.featured),
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
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      category: form.category.trim(),
      readTime: form.readTime.trim(),
      coverImage: form.coverImage.trim(),
      slug: form.slug.trim(),
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : "",
      externalUrl: form.externalUrl.trim(),
      featured: Boolean(form.featured),
    };

    try {
      if (editing) {
        try {
          await updateDoc(doc(db, "blogs", editing.id), payload);
        } catch (err) {
          // Document doesn't exist in Firestore yet — create it with the same id
          if (err?.code === "not-found" || (err?.message && err.message.includes("No document"))) {
            await setDoc(doc(db, "blogs", editing.id), payload);
          } else {
            throw err;
          }
        }
      } else {
        await addDoc(collection(db, "blogs"), payload);
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
      await deleteDoc(doc(db, "blogs", deleteId));
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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Dispatch Archive</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">Editorial content distribution index</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-3 px-6 py-3.5 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Initialize dispatch
        </button>
      </div>

      {sortedBlogs.length === 0 ? (
        <div className="border-[3px] border-white bg-[#111111] py-20 text-center shadow-brutalist-white">
          <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">No editorial assets indexed.</p>
          <p className="text-[10px] text-white/10 mt-2 font-bold uppercase tracking-widest">Draft your first professional dispatch.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedBlogs.map((post) => (
            <article
              key={post.id}
              className="group border-[2.5px] border-white bg-[#111111] p-6 flex flex-col sm:flex-row gap-6 shadow-brutalist-white hover:shadow-brutalist-white-lg transition-all"
            >
              <div className="shrink-0">
                {post.coverImage ? (
                  <div className="w-32 h-32 border-[2px] border-white shadow-brutalist-white-sm overflow-hidden bg-black">
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-[2px] border-white bg-[#0a0a0a] flex items-center justify-center text-4xl font-black text-white shadow-brutalist-white-sm uppercase italic">
                    {post.title?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-xl text-white uppercase tracking-tight italic">{post.title}</h3>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-accent text-white px-3 py-1 border-[1.5px] border-white shadow-brutalist-white-sm uppercase tracking-widest">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="p-2 border-[2px] border-white bg-[#161616] text-blue-400 hover:bg-blue-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(post.id)}
                      className="p-2 border-[2px] border-white bg-[#161616] text-red-500 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                  {post.category && <span className="bg-white text-black px-2 py-0.5 border border-white tracking-tighter">{post.category}</span>}
                  {post.readTime && <span className="border-l border-white/10 pl-4 italic">Metrics: {post.readTime}</span>}
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1.5 border-l border-white/10 pl-4">
                      <CalendarDays className="w-3.5 h-3.5" strokeWidth={3} />
                      Log: {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-gray-400 line-clamp-2 leading-relaxed">{post.excerpt || post.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px]">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-[3px] border-white bg-[#111111] shadow-brutalist-white-lg">
            <div className="flex items-center justify-between p-6 border-b-[3px] border-white/20 bg-[#111111] sticky top-0 z-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {editing ? "Modify editorial" : "New dispatch draft"}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Dispatch Identity *</label>
                <input
                  required
                  placeholder="e.g. THE FUTURE OF NEURAL INTERFACES"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all uppercase placeholder:text-white/10"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Categorization</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. ENGINEERING"
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase placeholder:text-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Transmission latency</label>
                  <input
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    placeholder="e.g. 10 MIN READ"
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Activation log date</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Access fragment (Slug)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. neural-interface-v1"
                    className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="p-6 border-[2px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm">
                <ImageUploadField
                  label={<span className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary visual asset</span>}
                  folder="blogs"
                  value={form.coverImage}
                  onChange={(url) => setForm({ ...form, coverImage: url })}
                  helperText={<span className="text-[9px] font-bold text-gray-500 uppercase">Input stream requirement: PNG/JPG/WebP. High-fidelity only.</span>}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">External distribution target</label>
                <input
                  value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="https://medium.com/..."
                  className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm placeholder:text-white/10"
                />
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Redirect transmission if specified</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Executive Summary (Excerpt)</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the core narrative payload..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-none placeholder:text-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary Narrative Payload (Content)</label>
                <textarea
                  rows={8}
                  placeholder="Transmit your knowledge..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-y placeholder:text-white/10"
                />
              </div>

              <label className="flex items-center justify-between gap-4 border-[2px] border-white p-6 cursor-pointer bg-accent/5 hover:bg-accent/10 transition-colors shadow-brutalist-accent">
                <div>
                  <span className="text-xs font-black uppercase text-white tracking-widest italic">Promote to Featured dispatch</span>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Primary sequence activation</p>
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
                  {editing ? "Commit Update" : "Publish Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-[2px]">
          <div className="w-full max-w-md border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-lg">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Purge dispatch document?</h3>
            <p className="text-sm font-bold text-gray-500 mt-4 uppercase leading-relaxed">Warning: Irreversible data removal from content stream.</p>
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
