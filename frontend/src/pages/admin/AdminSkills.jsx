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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Skills</h1>
          <p className="text-gray-400 mt-1">Group skills by category and keep proficiency current.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!db}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add skill
        </button>
      </div>

      {skills.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center text-gray-500">
            No skills yet. Import JSON from the dashboard or add one here.
          </div>
        ) : (
        <div className="space-y-10">
          {[{ key: "hard", title: "Hard Skills" }, { key: "soft", title: "Soft Skills" }].map((section) => {
            const categories = Object.keys(groupedSkills[section.key] || {});
            if (!categories.length) return null;
            return (
              <div key={section.key} className="space-y-6">
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                {categories.map((cat) => {
                  const list = groupedSkills[section.key][cat] || [];
                  if (!list.length) return null;
                  return (
                    <div key={`${section.key}-${cat}`}>
                      <h3 className="text-lg font-semibold text-white mb-4">{cat}</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {list.map((skill) => (
                          <div
                            key={skill.id}
                             className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-3"
                          >
                            {skill.logo ? (
                              <img
                                src={skill.logo}
                                alt=""
                                className="w-10 h-10 object-contain shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                                {skill.name?.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-white truncate">{skill.name}</h4>
                                <div className="flex shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(skill)}
                                     className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteId(skill.id)}
                                     className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Proficiency</span>
                                  <span>{skill.proficiency}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Edit skill" : "New skill"}
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
                <label className="block text-sm text-gray-400 mb-1">Skill type</label>
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
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                >
                  <option value="hard">Hard skill</option>
                  <option value="soft">Soft skill</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
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
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {typeCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
                </select>
              </div>
              {categoryMode === "new" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">New category name</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder={form.skillType === "soft" ? "Communication, Leadership..." : "Frontend, Backend, Tools..."}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <ImageUploadField
                  label="Logo"
                  folder="skills"
                  value={form.logo}
                  onChange={(url) => setForm({ ...form, logo: url })}
                  helperText="Upload the skill logo instead of pasting a URL."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Proficiency: {form.proficiency}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.proficiency}
                  onChange={(e) =>
                    setForm({ ...form, proficiency: Number(e.target.value) })
                  }
                  className="w-full accent-blue-600"
                />
              </div>
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
                  {editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Delete skill?</h3>
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
