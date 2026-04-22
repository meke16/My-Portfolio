import React, { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { User, Image, Link as LinkIcon, Plus, Trash2, Loader2 } from "lucide-react";

import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import ImageUploadField from "../../components/admin/ImageUploadField";

const emptySocials = {
  github: "",
  linkedin: "",
  twitter: "",
  facebook: "",
  tiktok: "",
  instagram: "",
  telegram: "",
  whatsapp: "",
};

export default function AdminProfile() {
  const { db, info, reload } = useFirestorePortfolio();
  const [form, setForm] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    profile_image: "",
    phones: [""],
    locations: [""],
    socials: { ...emptySocials },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const phones = info?.phones?.length ? info.phones : [""];
    const locations = info?.locations?.length ? info.locations : [""];
    setForm({
      name: info?.name ?? "",
      title: info?.title ?? "",
      bio: info?.bio ?? "",
      email: info?.email ?? "",
      profile_image: info?.profile_image ?? "",
      phones,
      locations,
      socials: { ...emptySocials, ...info?.socials },
    });
  }, [info]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);
    setMsg("");
    const payload = {
      name: form.name.trim(),
      title: form.title.trim(),
      bio: form.bio.trim(),
      email: form.email.trim(),
      profile_image: form.profile_image.trim(),
      phones: form.phones.map((p) => p.trim()).filter(Boolean),
      locations: form.locations.map((l) => l.trim()).filter(Boolean),
      socials: Object.fromEntries(
        Object.entries(form.socials).map(([k, v]) => [k, String(v).trim()])
      ),
    };
    try {
      await setDoc(doc(db, "info", "main"), payload, { merge: true });
      await reload();
      setMsg("Saved to Firestore.");
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updatePhone = (i, v) => {
    const next = [...form.phones];
    next[i] = v;
    setForm({ ...form, phones: next });
  };
  const updateLoc = (i, v) => {
    const next = [...form.locations];
    next[i] = v;
    setForm({ ...form, locations: next });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-gray-400 mt-1">Edit the core identity and contact details shown on your portfolio.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            Basic information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title / tagline</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-400" />
            Images
          </h2>
          <ImageUploadField
            label="Profile image"
            folder="profile"
            value={form.profile_image}
            onChange={(url) => setForm({ ...form, profile_image: url })}
            helperText="Upload a square portrait for the profile card."
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <div className="space-y-3">
            <label className="block text-sm text-gray-400">Phone numbers</label>
            {form.phones.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p}
                  onChange={(e) => updatePhone(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                />
                {form.phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, phones: form.phones.filter((_, j) => j !== i) })
                    }
                    className="p-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm({ ...form, phones: [...form.phones, ""] })}
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Add phone
            </button>
          </div>
          <div className="space-y-3">
            <label className="block text-sm text-gray-400">Locations</label>
            {form.locations.map((loc, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={loc}
                  onChange={(e) => updateLoc(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
                />
                {form.locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        locations: form.locations.filter((_, j) => j !== i),
                      })
                    }
                    className="p-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm({ ...form, locations: [...form.locations, ""] })}
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Add location
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-sky-400" />
            Social handles or URLs
          </h2>
          {Object.keys(emptySocials).map((key) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-1 capitalize">{key}</label>
              <input
                value={form.socials[key] || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socials: { ...form.socials, [key]: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-blue-500 outline-none"
              />
            </div>
          ))}
        </section>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {msg && (
            <p
              className={`text-sm ${msg.includes("fail") ? "text-red-400" : "text-emerald-400"}`}
            >
              {msg}
            </p>
          )}
          <button
            type="submit"
            disabled={saving || !db}
            className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save to Firestore
          </button>
        </div>
      </form>
    </div>
  );
}
