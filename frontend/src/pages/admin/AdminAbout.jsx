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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">About page content</h1>
        <p className="text-gray-400 mt-1">
          Manage the public About page sections. Stored in Firestore document{" "}
          <code className="text-gray-300">content/about</code>.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Core intro
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
            <label className="block text-sm text-gray-400 mb-1">Overview</label>
            <textarea
              rows={5}
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">My journey</h2>
          <p className="text-xs text-gray-500">
            One line per item. Format: <code>Title - Period | Description</code>
          </p>
          <textarea
            rows={7}
            value={form.journeyText}
            onChange={(e) => setForm({ ...form, journeyText: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y font-mono text-sm"
          />
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Focus areas</h2>
            <p className="text-xs text-gray-500">One item per line.</p>
            <textarea
              rows={7}
              value={form.focusAreasText}
              onChange={(e) => setForm({ ...form, focusAreasText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y"
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Principles</h2>
            <p className="text-xs text-gray-500">One item per line.</p>
            <textarea
              rows={7}
              value={form.principlesText}
              onChange={(e) => setForm({ ...form, principlesText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-y"
            />
          </section>
        </div>

        <div className="flex items-center justify-between gap-4">
          {msg ? (
            <p className={`text-sm ${msg.includes("Failed") ? "text-red-400" : "text-emerald-400"}`}>
              {msg}
            </p>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={saving || !db}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save about content
          </button>
        </div>
      </form>
    </div>
  );
}
