import React, { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { BriefcaseBusiness, Loader2, Plus, Trash2 } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import { defaultWorkExperience, normalizeWorkExperience } from "../../contentSchemas";

function toHighlightsText(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function fromHighlightsText(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toFormState(content) {
  return {
    headline: content.headline || "",
    intro: content.intro || "",
    experiences: (content.experiences || []).map((exp) => ({
      id: exp.id || `exp-${Date.now()}`,
      role: exp.role || "",
      company: exp.company || "",
      period: exp.period || "",
      location: exp.location || "",
      type: exp.type || "",
      summary: exp.summary || "",
      highlightsText: toHighlightsText(exp.highlights),
    })),
  };
}

const emptyExperience = () => ({
  id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role: "",
  company: "",
  period: "",
  location: "",
  type: "",
  summary: "",
  highlightsText: "",
});

export default function AdminWorkExperience() {
  const { db, workExperience, reload } = useFirestorePortfolio();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState(() => toFormState(workExperience));

  useEffect(() => {
    setForm(toFormState(workExperience));
  }, [workExperience]);

  const addExperience = () => {
    setForm((prev) => ({ ...prev, experiences: [...prev.experiences, emptyExperience()] }));
  };

  const updateExperience = (id, patch) => {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  };

  const removeExperience = (id) => {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((item) => item.id !== id),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);
    setMsg("");

    try {
      const payload = normalizeWorkExperience({
        headline: form.headline,
        intro: form.intro,
        experiences: form.experiences.map((exp) => ({
          id: exp.id,
          role: exp.role,
          company: exp.company,
          period: exp.period,
          location: exp.location,
          type: exp.type,
          summary: exp.summary,
          highlights: fromHighlightsText(exp.highlightsText),
        })),
      });
      await setDoc(doc(db, "content", "workExperience"), payload, { merge: true });
      await reload();
      setMsg("Work & experience content saved.");
    } catch (err) {
      setMsg(err?.message || "Failed to save work & experience content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(toFormState(defaultWorkExperience));
    setMsg("Loaded default content. Click Save to apply.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Work & Experience</h1>
        <p className="text-gray-400 mt-1">
          Manage the Work & Experience page content stored in Firestore document
          <code className="text-gray-300"> content/workExperience</code>.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BriefcaseBusiness className="w-5 h-5 text-blue-400" />
            Page intro
          </h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Headline</label>
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Intro</label>
            <textarea
              rows={3}
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Experience entries</h2>
            <button
              type="button"
              onClick={addExperience}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
            >
              <Plus className="w-4 h-4" />
              Add entry
            </button>
          </div>

          <div className="space-y-4">
            {form.experiences.map((exp, idx) => (
              <article key={exp.id} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-white font-medium">Entry {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Role</label>
                    <input
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Company</label>
                    <input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Period</label>
                    <input
                      value={exp.period}
                      onChange={(e) => updateExperience(exp.id, { period: e.target.value })}
                      placeholder="2023 - Present"
                      className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Location</label>
                    <input
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="Remote / City"
                      className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Type</label>
                  <input
                    value={exp.type}
                    onChange={(e) => updateExperience(exp.id, { type: e.target.value })}
                    placeholder="Full-time, Contract, Internship"
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Summary</label>
                  <textarea
                    rows={3}
                    value={exp.summary}
                    onChange={(e) => updateExperience(exp.id, { summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Highlights (one per line)</label>
                  <textarea
                    rows={4}
                    value={exp.highlightsText}
                    onChange={(e) => updateExperience(exp.id, { highlightsText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y"
                  />
                </div>
              </article>
            ))}

            {form.experiences.length === 0 && (
              <p className="text-gray-500 text-sm">No entries yet. Add your first experience.</p>
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {msg ? (
            <p className={`text-sm ${msg.includes("Failed") ? "text-red-400" : "text-emerald-400"}`}>{msg}</p>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Load defaults
            </button>
            <button
              type="submit"
              disabled={saving || !db}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
