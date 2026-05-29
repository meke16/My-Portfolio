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
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[3px] border-white/20 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Identity Matrix</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">Core profile configuration and nexus points</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Basic Information */}
        <section className="border-[3px] border-white bg-[#111111] shadow-brutalist-white p-10 space-y-10">
          <div className="flex items-center gap-5 border-b-[2px] border-white/10 pb-6">
            <User className="w-8 h-8 text-white" strokeWidth={3} />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Biometric Metadata</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Legal Identity *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-6 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all uppercase placeholder:text-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Professional Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. SYSTEMS ARCHITECT"
                className="w-full px-6 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all uppercase placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary Communication Link *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-6 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Persona Narrative (Bio)</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-6 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all resize-none placeholder:text-white/10"
            />
          </div>
        </section>

        {/* Visual Identity */}
        <section className="border-[3px] border-white bg-[#111111] shadow-brutalist-white p-10 space-y-8">
          <div className="flex items-center gap-5 border-b-[2px] border-white/10 pb-6">
            <Image className="w-8 h-8 text-white" strokeWidth={3} />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Visual Authentication</h2>
          </div>
          <div className="p-8 border-[2px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm">
            <ImageUploadField
              label={<span className="text-[10px] font-black uppercase tracking-widest text-white/40">Portrait Payload</span>}
              folder="profile"
              value={form.profile_image}
              onChange={(url) => setForm({ ...form, profile_image: url })}
              helperText={<span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Resolution should be optimized for portal display.</span>}
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className="border-[3px] border-white bg-[#111111] shadow-brutalist-white p-10 space-y-10">
          <div className="flex items-center gap-5 border-b-[2px] border-white/10 pb-6">
            <LinkIcon className="w-8 h-8 text-white" strokeWidth={3} />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Nexus Points</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Phone Numbers */}
            <div className="space-y-8">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-between">
                Vocal Interface Channels
                <span className="text-[9px] text-white/30 italic">{form.phones.filter(Boolean).length} Active</span>
              </label>
              <div className="space-y-6">
                {form.phones.map((p, i) => (
                  <div key={i} className="flex gap-4">
                    <input
                      value={p}
                      onChange={(e) => updatePhone(i, e.target.value)}
                      placeholder="+X XXX XXX XXXX"
                      className="flex-1 px-5 py-3 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all placeholder:text-white/10"
                    />
                    {form.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, phones: form.phones.filter((_, j) => j !== i) })
                        }
                        className="p-3 border-[2px] border-white bg-[#0a0a0a] text-red-500 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, phones: [...form.phones, ""] })}
                className="inline-flex items-center gap-3 px-6 py-3 border-[2.5px] border-white bg-white text-black text-[10px] font-black uppercase tracking-widest hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-brutalist-white-sm active:shadow-none transition-all"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Expand Interface
              </button>
            </div>

            {/* Locations */}
            <div className="space-y-8">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-between">
                Geospatial Latent Bases
                <span className="text-[9px] text-white/30 italic">{form.locations.filter(Boolean).length} Active</span>
              </label>
              <div className="space-y-6">
                {form.locations.map((loc, i) => (
                  <div key={i} className="flex gap-4">
                    <input
                      value={loc}
                      onChange={(e) => updateLoc(i, e.target.value)}
                      placeholder="e.g. ADDIS ABABA, ETHIOPIA"
                      className="flex-1 px-5 py-3 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all uppercase placeholder:text-white/10"
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
                        className="p-3 border-[2px] border-white bg-[#0a0a0a] text-red-500 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, locations: [...form.locations, ""] })}
                className="inline-flex items-center gap-3 px-6 py-3 border-[2.5px] border-white bg-white text-black text-[10px] font-black uppercase tracking-widest hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-brutalist-white-sm active:shadow-none transition-all"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Add physical base
              </button>
            </div>
          </div>

          <div className="p-8 border-[2.5px] border-white bg-blue-600/5 space-y-6 shadow-brutalist-white-sm">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Direct Synchronous Link (Telegram)</label>
            <input
              value={form.socials.telegram || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  socials: { ...form.socials, telegram: e.target.value },
                })
              }
              placeholder="@YOUR_UID"
              className="w-full px-6 py-4 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none focus:bg-[#161616] shadow-brutalist-white-sm transition-all"
            />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Essential: Powers the persistent floating interface uplink.</p>
          </div>
        </section>

        {/* Social Matrix */}
        <section className="border-[3px] border-white bg-[#111111] shadow-brutalist-white p-10 space-y-10">
          <div className="flex items-center gap-5 border-b-[2px] border-white/10 pb-6">
            <LinkIcon className="w-8 h-8 text-white" strokeWidth={3} />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Social Network Indices</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {Object.keys(emptySocials).filter(k => k !== "telegram").map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">{key}</label>
                <input
                  value={form.socials[key] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...form.socials, [key]: e.target.value },
                    })
                  }
                  placeholder={`https://${key}.com/your-uid`}
                  className="w-full px-5 py-3 border-[2.5px] border-white bg-[#0a0a0a] font-black text-white outline-none shadow-brutalist-white-sm focus:shadow-none transition-all placeholder:text-white/5"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Status & Actions */}
        <div className="flex items-center justify-between gap-8 p-10 border-[3px] border-white bg-black text-white shadow-brutalist-accent sticky bottom-6 z-20">
          <div className="flex-1">
            {msg && (
              <p className={`text-[12px] font-black uppercase tracking-widest italic ${msg.includes("fail") ? "text-red-500" : "text-accent"}`}>
                {msg}
              </p>
            )}
            {!msg && <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 italic">Waiting for parity commit…</p>}
          </div>
          <button
            type="submit"
            disabled={saving || !db}
            className="inline-flex items-center gap-4 px-10 py-5 border-[2.5px] border-white bg-white text-black text-[13px] font-black uppercase tracking-widest hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] active:shadow-none disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> : null}
            Commit to Mainframe
          </button>
        </div>
      </form>
    </div>

  );
}
