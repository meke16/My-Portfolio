import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { FolderKanban, Wrench, User, Upload, Loader2, Mail } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import { seedFirestoreFromJson } from "../../lib/seedFirestoreFromJson";

function StatCard({ title, value, icon: Icon, color, bg, to }) {
  const inner = (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 transition-all hover:border-gray-700 hover:bg-gray-900 cursor-pointer h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { db, info, projects, skills, reload } = useFirestorePortfolio();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgUnread, setMsgUnread] = useState(0);

  useEffect(() => {
    if (!db) {
      setMsgTotal(0);
      setMsgUnread(0);
      return;
    }
    getDocs(collection(db, "messages"))
      .then((snap) => {
        const list = snap.docs.map((d) => d.data());
        setMsgTotal(snap.size);
        setMsgUnread(list.filter((m) => !m.read).length);
      })
      .catch(() => {
        setMsgTotal(0);
        setMsgUnread(0);
      });
  }, [db, reload]);

  const runSeed = async () => {
    if (
      !window.confirm(
        "Import bundled src/data/*.json into Firestore?\n\n" +
          "- Merges profile into info/main.\n" +
          "- Adds every skill and project again (duplicates if you run this twice).\n\n" +
          "Continue?"
      )
    ) {
      return;
    }
    if (!db) return;
    setSeeding(true);
    setSeedMsg("");
    try {
      await seedFirestoreFromJson(db);
      setSeedMsg("Imported. Reloading...");
      await reload();
      setSeedMsg("Done.");
    } catch (e) {
      setSeedMsg(e?.message || "Import failed. Check Firestore rules and console.");
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(""), 6000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back{info?.name ? `, ${info.name}` : ""}. Data lives in Firestore.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Projects"
          value={projects?.length ?? 0}
          icon={FolderKanban}
          color="text-blue-400"
          bg="bg-blue-500/10"
          to="/admin/projects"
        />
        <StatCard
          title="Skills"
          value={skills?.length ?? 0}
          icon={Wrench}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          to="/admin/skills"
        />
        <StatCard
          title="Messages"
          value={msgUnread > 0 ? `${msgUnread} unread` : msgTotal}
          icon={Mail}
          color="text-orange-400"
          bg="bg-orange-500/10"
          to="/admin/messages"
        />
        <StatCard
          title="Profile"
          value={info?.name ? "Ready" : "Incomplete"}
          icon={User}
          color="text-violet-400"
          bg="bg-violet-500/10"
          to="/admin/profile"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            Profile status
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Name</dt>
              <dd className="text-white font-medium truncate">{info?.name || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Title</dt>
              <dd className="text-white truncate">{info?.title || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-white truncate">{info?.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Bio</dt>
              <dd className="text-white">{info?.bio ? "Set" : "—"}</dd>
            </div>
          </dl>
          <Link
            to="/admin/profile"
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            Edit profile →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            Migrate bundled JSON
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Push the default <code className="text-gray-400">admin_info.json</code>,{" "}
            <code className="text-gray-400">projects.json</code>, and{" "}
            <code className="text-gray-400">skills.json</code> from{" "}
            <code className="text-gray-400">src/data/</code> into Firestore. Use once on a new
            project or after clearing collections.
          </p>
          <button
            type="button"
            disabled={seeding || !db}
            onClick={runSeed}
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import JSON to Firestore
          </button>
          {seedMsg && <p className="text-sm text-gray-400 mt-3">{seedMsg}</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            Recent projects
          </h2>
          <ul className="space-y-3">
            {(projects || []).slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-800/80 bg-gray-900/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {p.technologies || "No technologies"}
                  </p>
                </div>
              </li>
            ))}
            {(!projects || projects.length === 0) && (
              <p className="text-gray-500 text-sm">No projects yet.</p>
            )}
          </ul>
          <Link
            to="/admin/projects"
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            Manage projects →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-emerald-400" />
            Skills snapshot
          </h2>
          <ul className="space-y-2">
            {(skills || []).slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                {s.logo ? (
                  <img src={s.logo} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                    {s.name?.charAt(0)}
                  </span>
                )}
                <span className="flex-1 text-gray-200 truncate">{s.name}</span>
                <span className="text-gray-500 tabular-nums">{s.proficiency}%</span>
              </li>
            ))}
            {(!skills || skills.length === 0) && (
              <p className="text-gray-500 text-sm">No skills yet.</p>
            )}
          </ul>
          <Link
            to="/admin/skills"
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            Manage skills →
          </Link>
        </div>
      </div>
    </div>
  );
}
