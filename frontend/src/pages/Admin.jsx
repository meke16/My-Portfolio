import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ── Auth Guard ──────────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}

// ── Login ───────────────────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = err?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else {
        setError("Sign-in failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-white text-center">Admin Login</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/profile", label: "Profile" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/messages", label: "Messages" },
];

function Sidebar({ onLogout }) {
  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col py-6 px-4 gap-2">
      <h2 className="text-white font-bold text-lg mb-4 px-2">⚡ Admin</h2>
      {navItems.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      <button
        onClick={onLogout}
        className="mt-auto px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg text-left"
      >
        Logout
      </button>
    </aside>
  );
}

// ── Dashboard Overview ───────────────────────────────────────────────────────
function Dashboard() {
  const [counts, setCounts] = useState({ skills: 0, projects: 0, messages: 0 });
  useEffect(() => {
    Promise.all([
      getDocs(collection(db, "skills")),
      getDocs(collection(db, "projects")),
      getDocs(collection(db, "messages")),
    ]).then(([s, p, m]) =>
      setCounts({ skills: s.size, projects: p.size, messages: m.size })
    );
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Skills", count: counts.skills },
          { label: "Projects", count: counts.projects },
          { label: "Messages", count: counts.messages },
        ].map(({ label, count }) => (
          <div key={label} className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-400">{count}</p>
            <p className="text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────────────
function Profile() {
  const [form, setForm] = useState({
    name: "", title: "", bio: "", email: "", phone: "", location: "",
    profile_image: "",
    socials: { github: "", linkedin: "", twitter: "", facebook: "", tiktok: "", instagram: "" },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "info", "main")).then((snap) => {
      if (snap.exists()) setForm((f) => ({ ...f, ...snap.data() }));
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSocial = (e) =>
    setForm({ ...form, socials: { ...form.socials, [e.target.name]: e.target.value } });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `profile/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setForm((f) => ({ ...f, profile_image: url }));
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await setDoc(doc(db, "info", "main"), form);
    setMsg("Saved!");
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      <form onSubmit={handleSave} className="space-y-4 max-w-xl">
        {["name", "title", "email", "phone", "location"].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        ))}
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Bio"
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <div>
          <p className="text-gray-400 text-sm mb-2">Profile Image</p>
          {form.profile_image && (
            <img src={form.profile_image} alt="profile" className="w-20 h-20 rounded-full object-cover mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-gray-400 text-sm" />
          {uploading && <p className="text-blue-400 text-sm mt-1">Uploading...</p>}
        </div>
        <p className="text-gray-400 text-sm font-medium">Social Links</p>
        {Object.keys(form.socials).map((key) => (
          <input
            key={key}
            name={key}
            value={form.socials[key]}
            onChange={handleSocial}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1) + " URL"}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        ))}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {msg && <p className="text-green-400 text-sm">{msg}</p>}
      </form>
    </div>
  );
}

// ── Skills ───────────────────────────────────────────────────────────────────
const SKILL_CATEGORIES = ["Language", "Framework", "Database", "Tools", "Other"];

function Skills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ name: "", category: "Language", proficiency: 80, logo: "" });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getDocs(collection(db, "skills")).then((snap) =>
      setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      await updateDoc(doc(db, "skills", editId), form);
    } else {
      await addDoc(collection(db, "skills"), form);
    }
    setForm({ name: "", category: "Language", proficiency: 80, logo: "" });
    setEditId(null);
    setSaving(false);
    load();
  };

  const handleEdit = (skill) => {
    setForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency, logo: skill.logo || "" });
    setEditId(skill.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "skills", id));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Skills</h1>
      <form onSubmit={handleSave} className="flex flex-wrap gap-3 mb-8 items-end">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Skill name"
          required
          className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          {SKILL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          type="number"
          min={0}
          max={100}
          value={form.proficiency}
          onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })}
          placeholder="Proficiency (0-100)"
          className="w-36 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <input
          value={form.logo}
          onChange={(e) => setForm({ ...form, logo: e.target.value })}
          placeholder="Logo URL"
          className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 w-64"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {editId ? "Update" : "Add Skill"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ name: "", category: "Language", proficiency: 80, logo: "" }); }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Cancel
          </button>
        )}
      </form>
      <div className="space-y-2">
        {skills.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-3">
              {s.logo && <img src={s.logo} alt={s.name} className="w-6 h-6 object-contain" />}
              <span className="text-white font-medium">{s.name}</span>
              <span className="text-gray-400 text-sm">{s.category}</span>
              <span className="text-blue-400 text-sm">{s.proficiency}%</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(s)} className="text-sm text-yellow-400 hover:text-yellow-300">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────
const emptyProject = { title: "", description: "", image: [], tech: [], github: "", live: "", featured: false };

function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [techInput, setTechInput] = useState("");

  const load = () =>
    getDocs(collection(db, "projects")).then((snap) =>
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

  useEffect(() => { load(); }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = await Promise.all(
      files.map(async (file) => {
        const r = ref(storage, `projects/${Date.now()}_${file.name}`);
        await uploadBytes(r, file);
        return getDownloadURL(r);
      })
    );
    setForm((f) => ({ ...f, image: [...f.image, ...urls] }));
    setUploading(false);
  };

  const addTech = () => {
    if (techInput.trim()) {
      setForm((f) => ({ ...f, tech: [...f.tech, techInput.trim()] }));
      setTechInput("");
    }
  };

  const removeTech = (i) =>
    setForm((f) => ({ ...f, tech: f.tech.filter((_, idx) => idx !== i) }));

  const removeImage = (i) =>
    setForm((f) => ({ ...f, image: f.image.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      await updateDoc(doc(db, "projects", editId), form);
    } else {
      await addDoc(collection(db, "projects"), form);
    }
    setForm(emptyProject);
    setEditId(null);
    setSaving(false);
    load();
  };

  const handleEdit = (p) => {
    setForm({ title: p.title, description: p.description, image: p.image || [], tech: p.tech || [], github: p.github || "", live: p.live || "", featured: p.featured || false });
    setEditId(p.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "projects", id));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Projects</h1>
      <form onSubmit={handleSave} className="space-y-3 max-w-xl mb-8 bg-gray-800 p-5 rounded-xl">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          required
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <input
          value={form.github}
          onChange={(e) => setForm({ ...form, github: e.target.value })}
          placeholder="GitHub URL"
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <input
          value={form.live}
          onChange={(e) => setForm({ ...form, live: e.target.value })}
          placeholder="Live URL"
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          <input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
            placeholder="Add tech (press Enter)"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button type="button" onClick={addTech} className="px-3 py-2 bg-gray-600 text-white rounded-lg">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tech.map((t, i) => (
            <span key={i} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-sm flex items-center gap-1">
              {t}
              <button type="button" onClick={() => removeTech(i)} className="text-blue-200 hover:text-white">×</button>
            </span>
          ))}
        </div>
        <div>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-gray-400 text-sm" />
          {uploading && <p className="text-blue-400 text-sm mt-1">Uploading...</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.image.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="accent-blue-500"
          />
          Featured project
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
            {editId ? "Update" : "Add Project"}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(emptyProject); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg">
            <div>
              <p className="text-white font-medium">{p.title}</p>
              <p className="text-gray-400 text-sm line-clamp-1">{p.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(p)} className="text-sm text-yellow-400 hover:text-yellow-300">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Messages ─────────────────────────────────────────────────────────────────
function Messages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () =>
    getDocs(collection(db, "messages")).then((snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))
    );

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await updateDoc(doc(db, "messages", id), { read: true });
    load();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "messages", id));
    setSelected(null);
    load();
  };

  const open = (msg) => {
    setSelected(msg);
    if (!msg.read) markRead(msg.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          {messages.length === 0 && <p className="text-gray-400">No messages yet.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => open(m)}
              className={`cursor-pointer px-4 py-3 rounded-lg border transition-colors ${
                selected?.id === m.id
                  ? "border-blue-500 bg-gray-800"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-medium ${m.read ? "text-gray-300" : "text-white"}`}>{m.name}</p>
                {!m.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
              <p className="text-gray-400 text-sm truncate">{m.subject}</p>
            </div>
          ))}
        </div>
        {selected && (
          <div className="w-96 bg-gray-800 rounded-xl p-5 space-y-3 self-start">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-semibold">{selected.name}</p>
                <p className="text-gray-400 text-sm">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <p className="text-blue-300 font-medium">{selected.subject}</p>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{selected.message}</p>
            <button
              onClick={() => handleDelete(selected.id)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Shell ───────────────────────────────────────────────────────────────
export default function Admin() {
  const user = useAuth();
  const navigate = useNavigate();

  if (user === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (!user) return <Login />;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="skills" element={<Skills />} />
          <Route path="projects" element={<Projects />} />
          <Route path="messages" element={<Messages />} />
        </Routes>
      </main>
    </div>
  );
}
