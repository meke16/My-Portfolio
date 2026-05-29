import React, { useMemo, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import ImageUploadField from "../../components/admin/ImageUploadField";

const emptyForm = { name: "", logo: "", category: "", skillType: "hard", proficiency: 70 };
const NEW_CATEGORY_VALUE = "__new__";

export default function AdminSkills() {
  const { db, skills, reload } = useFirestorePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryMode, setCategoryMode] = useState("existing");
  const [deleteId, setDeleteId] = useState(null);

  const groupedSkills = useMemo(() => {
    const grouped = { hard: {}, soft: {} };
    (skills || []).forEach((s) => {
      const type = String(s.skillType || "hard").toLowerCase() === "soft" ? "soft" : "hard";
      const category = s.category || "Other";
      if (!grouped[type][category]) grouped[type][category] = [];
      grouped[type][category].push(s);
    });
    return grouped;
  }, [skills]);

  const categoriesByType = useMemo(() => {
    const hard = Object.keys(groupedSkills.hard || {}).sort((a, b) => a.localeCompare(b));
    const soft = Object.keys(groupedSkills.soft || {}).sort((a, b) => a.localeCompare(b));
    return { hard, soft };
  }, [groupedSkills]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCategoryMode("existing");
    setOpen(true);
  };

  const openEdit = (s) => {
    const type = String(s.skillType || "hard").toLowerCase() === "soft" ? "soft" : "hard";
    const cat = s.category || "";
    const isKnownCategory = (categoriesByType[type] || []).includes(cat);

    setEditing(s);
    setForm({
      name: s.name || "",
      logo: s.logo || "",
      category: cat,
      skillType: type,
      proficiency: Number(s.proficiency) || 70,
    });
    setCategoryMode(isKnownCategory ? "existing" : "new");
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setCategoryMode("existing");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      logo: form.logo.trim(),
      category: form.category.trim() || "Other",
      skillType: form.skillType === "soft" ? "soft" : "hard",
      proficiency: Math.min(100, Math.max(0, Number(form.proficiency) || 0)),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "skills", editing.id), payload);
      } else {
        await addDoc(collection(db, "skills"), payload);
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
      await deleteDoc(doc(db, "skills", deleteId));
      await reload();
      setDeleteId(null);
    } catch (err) {
      window.alert(err?.message || "Delete failed");
    }
  };

  const typeCategories = categoriesByType[form.skillType] || [];
  const categorySelectValue = categoryMode === "new"
    ? NEW_CATEGORY_VALUE
    : (form.category || "");

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[3px] border-white/20 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Skills Arsenal</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">Technical capability indexing</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-3 px-6 py-3.5 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Register new skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="border-[3px] border-white bg-[#111111] py-20 text-center shadow-brutalist-white">
          <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">No assets indexed.</p>
          <p className="text-[10px] text-white/10 mt-2 font-bold uppercase tracking-widest">Initialize your professional stack.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {[{ key: "hard", title: "Core Technologies" }, { key: "soft", title: "Interpersonal Stack" }].map((section) => {
            const categories = Object.keys(groupedSkills[section.key] || {});
            if (!categories.length) return null;
            return (
              <div key={section.key} className="space-y-8">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight border-l-[6px] border-white pl-4">
                  {section.title}
                </h2>
                {categories.map((cat) => {
                  const list = groupedSkills[section.key][cat] || [];
                  if (!list.length) return null;
                  return (
                    <div key={`${section.key}-${cat}`} className="space-y-4">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">{cat}</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {list.map((skill) => (
                          <div
                            key={skill.id}
                            className="group border-[2px] border-white bg-[#111111] p-5 flex gap-4 shadow-brutalist-white hover:shadow-brutalist-white-lg transition-all"
                          >
                            <div className="shrink-0">
                              {skill.logo ? (
                                <div className="w-12 h-12 border-[1.5px] border-white bg-[#0a0a0a] p-2 shadow-brutalist-white-sm">
                                  <img
                                    src={skill.logo}
                                    alt=""
                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100 invert"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 border-[1.5px] border-white bg-black flex items-center justify-center text-lg font-black text-white shadow-brutalist-white-sm uppercase italic">
                                  {skill.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-black text-sm text-white uppercase truncate tracking-tight italic">{skill.name}</h4>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(skill)}
                                    className="p-1.5 border-[1.5px] border-white bg-[#161616] text-white hover:bg-white hover:text-black transition-all shadow-brutalist-white-sm active:shadow-none"
                                  >
                                    <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteId(skill.id)}
                                    className="p-1.5 border-[1.5px] border-white bg-[#161616] text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-brutalist-white-sm active:shadow-none"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                                  <span>Efficiency</span>
                                  <span className="text-accent">{skill.proficiency}%</span>
                                </div>
                                <div className="h-2.5 border-[1.5px] border-white bg-[#0a0a0a] overflow-hidden p-[1px]">
                                  <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: `${skill.proficiency}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px]">
          <div className="w-full max-w-md border-[3px] border-white bg-[#111111] shadow-brutalist-white-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b-[3px] border-white/20 bg-[#111111] sticky top-0 z-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {editing ? "Modify Skill" : "Define Skill"}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Archetype</label>
                <select
                  value={form.skillType}
                  onChange={(e) => {
                    setCategoryMode("existing");
                    setForm({
                      ...form,
                      skillType: e.target.value,
                      category: "",
                    });
                  }}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase"
                >
                  <option value="hard">TECHNICAL ASSET</option>
                  <option value="soft">COGNITIVE ASSET</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Classification</label>
                <select
                  value={categorySelectValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === NEW_CATEGORY_VALUE || value === "") {
                      setCategoryMode(value === NEW_CATEGORY_VALUE ? "new" : "existing");
                      setForm({ ...form, category: "" });
                      return;
                    }
                    setCategoryMode("existing");
                    setForm({ ...form, category: value });
                  }}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm uppercase"
                >
                  <option value="">SELECT INDEX</option>
                  {typeCategories.map((category) => (
                    <option key={category} value={category}>{category.toUpperCase()}</option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ NEW CLASSIFICATION</option>
                </select>
              </div>
              {categoryMode === "new" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">New Index Identity</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. INFRASTRUCTURE"
                    className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm uppercase"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Skill Identity *</label>
                <input
                  required
                  placeholder="e.g. REACT.JS"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm uppercase"
                />
              </div>
              <div className="p-6 border-[2px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm">
                <ImageUploadField
                  folder="skills"
                  value={form.logo}
                  onChange={(url) => setForm({ ...form, logo: url })}
                />
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-4 tracking-widest">Input stream requirement: SVG/PNG.</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Efficiency rating
                  </label>
                  <span className="text-xs font-black text-accent bg-accent/5 px-2 py-1 border border-white/10">{form.proficiency}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.proficiency}
                  onChange={(e) =>
                    setForm({ ...form, proficiency: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-[#0a0a0a] border border-white/20 appearance-none cursor-pointer accent-white"
                />
              </div>
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
                  {editing ? "Update Ledger" : "Commit Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-[2px]">
          <div className="w-full max-w-md border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-lg">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Purge Skill?</h3>
            <p className="text-sm font-bold text-gray-500 mt-4 uppercase leading-relaxed">Warning: Irreversible deletion of professional asset.</p>
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
