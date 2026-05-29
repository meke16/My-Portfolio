import React, { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { BookOpen, Loader2 } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import { normalizeAboutContent } from "../../contentSchemas";

function toTextarea(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function parseTextarea(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseJourney(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [left, description] = line.split("|").map((part) => part?.trim());
      const [title, period] = String(left || "")
        .split(" - ")
        .map((part) => part?.trim());
      return {
        title: title || "",
        period: period || "",
        description: description || "",
      };
    })
    .filter((item) => item.title || item.description);
}

export default function AdminAbout() {
  const { db, about, reload } = useFirestorePortfolio();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    headline: "",
    overview: "",
    journeyText: "",
    focusAreasText: "",
    principlesText: "",
  });

  useEffect(() => {
    setForm({
      headline: about?.headline || "",
      overview: about?.overview || "",
      journeyText: (about?.journey || [])
        .map((item) => `${item.title}${item.period ? ` - ${item.period}` : ""} | ${item.description || ""}`)
        .join("\n"),
      focusAreasText: toTextarea(about?.focusAreas),
      principlesText: toTextarea(about?.principles),
    });
  }, [about]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);
    setMsg("");
    const payload = normalizeAboutContent({
      headline: form.headline,
      overview: form.overview,
      journey: parseJourney(form.journeyText),
      focusAreas: parseTextarea(form.focusAreasText),
      principles: parseTextarea(form.principlesText),
    });

    try {
      await setDoc(doc(db, "content", "about"), payload, { merge: true });
      await reload();
      setMsg("About content saved.");
    } catch (err) {
      setMsg(err?.message || "Failed to save about content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      <div className="border-b-[3px] border-white/20 pb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Institutional Archive</h1>
        <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">
          Managing Firestore document: <code className="bg-white/5 text-white/50 px-2 py-0.5 border border-white/10 uppercase tracking-tighter">content/about</code>
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white space-y-6">
          <div className="flex items-center gap-3 border-b-[2.5px] border-white/20 pb-4">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={3} />
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Core Protocol</h2>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary Headline</label>
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all placeholder:text-white/10 uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Executive Overview</label>
            <textarea
              rows={5}
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-y placeholder:text-white/10"
            />
          </div>
        </section>

        <section className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white space-y-6">
          <div className="flex items-center justify-between border-b-[2.5px] border-white/20 pb-4">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Operational Journey</h2>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Protocol: Title - Period | Description</span>
          </div>
          <textarea
            rows={7}
            value={form.journeyText}
            onChange={(e) => setForm({ ...form, journeyText: e.target.value })}
            className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-y font-mono text-sm uppercase tracking-tight"
          />
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white space-y-6">
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight border-b-[2.5px] border-white/20 pb-4">Strategic Focus</h2>
            <textarea
              rows={7}
              placeholder="ONE ITEM PER LINE..."
              value={form.focusAreasText}
              onChange={(e) => setForm({ ...form, focusAreasText: e.target.value })}
              className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-y"
            />
          </section>

          <section className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white space-y-6">
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight border-b-[2.5px] border-white/20 pb-4">Core Principles</h2>
            <textarea
              rows={7}
              placeholder="ONE ITEM PER LINE..."
              value={form.principlesText}
              onChange={(e) => setForm({ ...form, principlesText: e.target.value })}
              className="w-full px-4 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-y"
            />
          </section>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t-[3px] border-white/20 border-dashed">
          <div className="min-h-[20px]">
            {msg && (
              <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border-[2px] ${msg.includes("Failed") ? "bg-red-950/30 border-red-500 text-red-500" : "bg-emerald-950/30 border-emerald-500 text-emerald-500"}`}>
                {msg}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || !db}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> : null}
            Commit to Archive
          </button>
        </div>
      </form>
    </div>

  );
}
