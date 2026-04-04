import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { FolderKanban, Wrench, User, Mail, ArrowRight } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";

function StatCard({ title, value, icon: Icon, color, bg, to }) {
  const inner = (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer h-full min-h-36">
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              {title}
            </p>
            <p className="text-3xl font-bold text-white mt-2 tabular-nums leading-none truncate">
              {value}
            </p>
          </div>
          <div
            className={`rounded-xl p-3 ring-1 ring-inset ring-white/10 transition-transform duration-200 group-hover:scale-105 ${bg}`}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="inline-flex items-center text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
          Open {title.toLowerCase()}
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { db, info, projects, skills, reload } = useFirestorePortfolio();
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-transparent to-violet-500/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-300/90 font-semibold">
              Portfolio admin
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight mt-2">Dashboard</h1>
            <p className="text-gray-300/80 mt-2 max-w-2xl">
              Welcome back{info?.name ? `, ${info.name}` : ""}. Data lives in Firestore.
            </p>
          </div>
          {info?.profile_image ? (
            <img
              src={info.profile_image}
              alt={info?.name ? `${info.name} profile` : "Profile"}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-2 ring-white/15 bg-white/5"
            />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 ring-2 ring-white/15 flex items-center justify-center text-lg sm:text-xl font-semibold text-white">
              {info?.name?.trim()?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 hover:bg-white/10"
          >
            Manage projects
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 hover:bg-white/10"
          >
            Review inbox
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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

      <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            Recent projects
          </h2>
          <ul className="space-y-3">
            {(projects || []).slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/20"
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
