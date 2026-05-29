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
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="border-b-[3px] border-white/20 pb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Professional Log</h1>
        <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">
          Managing Firestore document: <code className="bg-white/5 text-white/50 px-2 py-0.5 border border-white/10 uppercase tracking-tighter">content/workExperience</code>
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white space-y-6">
          <div className="flex items-center gap-3 border-b-[2.5px] border-white/20 pb-4">
            <BriefcaseBusiness className="w-6 h-6 text-white" strokeWidth={3} />
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Executive Summary</h2>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary Headline</label>
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all uppercase placeholder:text-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Contextual Narrative</label>
            <textarea
              rows={3}
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all resize-y placeholder:text-white/10"
            />
          </div>
        </section>

        <section className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white space-y-8">
          <div className="flex items-center justify-between gap-6 border-b-[2.5px] border-white/20 pb-4">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Deployment History</h2>
            <button
              type="button"
              onClick={addExperience}
              className="inline-flex items-center gap-2 px-6 py-3 border-[2.5px] border-white bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-brutalist-accent active:shadow-none hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Register Entry
            </button>
          </div>

          <div className="grid gap-8">
            {form.experiences.map((exp, idx) => (
              <article key={exp.id} className="border-[2.5px] border-white bg-[#0a0a0a] p-8 space-y-8 shadow-brutalist-white-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white flex items-center justify-center -rotate-45 translate-x-8 -translate-y-8 shadow-brutalist-white-sm">
                  <span className="text-black font-black text-sm rotate-45 mt-6 ml-[-4px] italic">{idx + 1}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Record Segment {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-white bg-[#161616] text-red-500 text-[9px] font-black uppercase tracking-widest shadow-brutalist-white-sm hover:bg-red-600 hover:text-white active:shadow-none transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Purge Record
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Designation</label>
                    <input
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-black text-white outline-none focus:bg-white/5 shadow-brutalist-white-sm uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Organization</label>
                    <input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-black text-white outline-none focus:bg-white/5 shadow-brutalist-white-sm uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Timeframe</label>
                    <input
                      value={exp.period}
                      onChange={(e) => updateExperience(exp.id, { period: e.target.value })}
                      placeholder="e.g. 2026 - PRESENT"
                      className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-black text-white outline-none focus:bg-white/5 shadow-brutalist-white-sm uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Coordinates</label>
                    <input
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="e.g. REMOTE / SYNC LABS"
                      className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-black text-white outline-none focus:bg-white/5 shadow-brutalist-white-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Contract Class</label>
                  <input
                    value={exp.type}
                    onChange={(e) => updateExperience(exp.id, { type: e.target.value })}
                    placeholder="e.g. DEPLOYMENT CONTRACT"
                    className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-black text-white outline-none focus:bg-white/5 shadow-brutalist-white-sm uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Executive Summary</label>
                  <textarea
                    rows={3}
                    value={exp.summary}
                    onChange={(e) => updateExperience(exp.id, { summary: e.target.value })}
                    className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-black text-white outline-none focus:bg-white/5 shadow-brutalist-white-sm resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Key Deliverables (SEQUENTIAL)</label>
                  <textarea
                    rows={4}
                    value={exp.highlightsText}
                    onChange={(e) => updateExperience(exp.id, { highlightsText: e.target.value })}
                    className="w-full px-4 py-4 border-[2px] border-white bg-transparent font-bold text-white outline-none shadow-brutalist-white-sm resize-y font-mono text-xs uppercase"
                  />
                </div>
              </article>
            ))}

            {form.experiences.length === 0 && (
              <div className="text-center py-20 border-[3px] border-white/20 border-dashed bg-[#0a0a0a]">
                <p className="text-white/20 font-black uppercase tracking-[0.2em] text-xs italic">Zero records in stack. Initiate primary deployment entry.</p>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t-[3px] border-white/20 border-dashed">
          <div className="min-h-[20px]">
            {msg && (
              <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border-[2px] ${msg.includes("Failed") ? "bg-red-950/30 border-red-500 text-red-500" : "bg-emerald-950/30 border-emerald-500 text-emerald-500"}`}>{msg}</p>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-none px-10 py-4 border-[2.5px] border-white bg-transparent text-white text-[11px] font-black uppercase tracking-widest shadow-brutalist-white-sm active:shadow-none hover:bg-white hover:text-black transition-all"
            >
              Defaults
            </button>
            <button
              type="submit"
              disabled={saving || !db}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-10 py-4 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> : null}
              Commit Entry
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
