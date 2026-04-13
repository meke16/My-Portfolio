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
import UploadToCpanelButton from "../../components/admin/UploadToCpanelButton";

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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Blog Posts</h1>
          <p className="text-gray-400 mt-1">Create and manage blog content shown on the public Blog page.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add post
        </button>
      </div>

      {sortedBlogs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center text-gray-500">
          No blog posts yet. Add your first post.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBlogs.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row gap-4"
            >
              <div className="shrink-0">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="w-28 h-28 rounded-lg object-cover" />
                ) : (
                  <div className="w-28 h-28 rounded-lg bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {post.title?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg text-white">{post.title}</h3>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(post.id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {post.category && <span>{post.category}</span>}
                  {post.readTime && <span>• {post.readTime}</span>}
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt || post.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Edit blog post" : "New blog post"}
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Engineering"
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Read time</label>
                  <input
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    placeholder="6 min read"
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Published date</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="shipping-better-frontends"
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Cover image URL</label>
                <div className="flex gap-2">
                  <input
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                  <UploadToCpanelButton
                    folder="blogs"
                    label="Upload"
                    onUploaded={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
                    onError={(error) => window.alert(error?.message || "Upload failed")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">External URL</label>
                <input
                  value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">If set, the "Read article" button links here instead.</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Excerpt</label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-800 p-4 cursor-pointer">
                <div>
                  <span className="text-white font-medium">Featured post</span>
                  <p className="text-xs text-gray-500 mt-0.5">Pinned at the top of the Blog page</p>
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
            <h3 className="text-lg font-semibold text-white">Delete blog post?</h3>
            <p className="text-sm text-gray-500">This removes the post from Firestore.</p>
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
