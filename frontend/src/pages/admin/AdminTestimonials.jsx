import React, { useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Plus, Pencil, Trash2, X, Quote } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import ImageUploadField from "../../components/admin/ImageUploadField";

const emptyForm = { name: "", role: "", quote: "", avatar: "" };

export default function AdminTestimonials() {
  const { db, testimonials, reload } = useFirestorePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name || "",
      role: t.role || "",
      quote: t.quote || "",
      avatar: t.avatar || "",
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
    if (!db || !form.name.trim() || !form.quote.trim()) return;
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      quote: form.quote.trim(),
      avatar: form.avatar.trim(),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "testimonials", editing.id), payload);
      } else {
        await addDoc(collection(db, "testimonials"), payload);
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
      await deleteDoc(doc(db, "testimonials", deleteId));
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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">External Validation</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">Social proof index and testimonial management</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-3 px-6 py-3.5 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Register Endorsement
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="border-[3px] border-white bg-[#111111] py-20 text-center shadow-brutalist-white">
          <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">Zero endorsements documented.</p>
          <p className="text-[10px] text-white/10 mt-2 font-bold uppercase tracking-widest">Initiate primary social validation entry.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="border-[2.5px] border-white bg-[#111111] p-8 flex flex-col gap-6 shadow-brutalist-white hover:shadow-brutalist-white-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
                <Quote className="w-10 h-10 text-white opacity-10 shrink-0" strokeWidth={3} />
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="p-2 border-[2px] border-white bg-[#161616] text-blue-400 hover:bg-blue-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(t.id)}
                    className="p-2 border-[2px] border-white bg-[#161616] text-red-500 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <p className="text-gray-300 font-bold text-sm leading-relaxed italic border-l-[3px] border-white/10 pl-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-4 pt-6 border-t-[2px] border-white/10 border-dashed">
                {t.avatar ? (
                  <div className="w-14 h-14 border-[2px] border-white shadow-brutalist-white-sm overflow-hidden bg-black">
                    <img src={t.avatar} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
                  </div>
                ) : (
                  <div className="w-14 h-14 border-[2px] border-white bg-[#0a0a0a] flex items-center justify-center text-white text-xs font-black shadow-brutalist-white-sm uppercase italic">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-black uppercase tracking-tight italic">{t.name}</p>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px]">
          <div className="w-full max-w-lg border-[3px] border-white bg-[#111111] shadow-brutalist-white-lg">
            <div className="flex items-center justify-between p-6 border-b-[3px] border-white/20 bg-[#111111] sticky top-0 z-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {editing ? "Modify endorsement" : "New endorsement draft"}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Source Identity *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. JANE DOE"
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all uppercase placeholder:text-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Designation / Affiliation</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. CTO AT ACME INC"
                  className="w-full px-4 py-4 border-[2px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase placeholder:text-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Transmission Payload (Quote) *</label>
                <textarea
                  required
                  rows={4}
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="Primary social verification content..."
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-none placeholder:text-white/10"
                />
              </div>
              <div className="p-6 border-[2px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm">
                <ImageUploadField
                  folder="testimonials"
                  value={form.avatar}
                  onChange={(url) => setForm({ ...form, avatar: url })}
                />
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-4 tracking-widest">Optional visual identity verification.</p>
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t-[2px] border-white/20 border-dashed">
                <button
                  type="button"
                  onClick={close}
                  className="px-8 py-4 border-[2.5px] border-white bg-transparent text-white text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-brutalist-white-sm"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  {editing ? "Commit Update" : "Index Endorsement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-[2px]">
          <div className="w-full max-w-md border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-lg">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Purge endorsement record?</h3>
            <p className="text-sm font-bold text-gray-500 mt-4 uppercase leading-relaxed">Warning: Irreversible clearance from validation index.</p>
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
