import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { FolderKanban, Wrench, User, Mail, ArrowRight } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";

function StatCard({ title, value, icon: Icon, color, bg, to }) {
  const inner = (
    <div className="group border-[2.5px] border-white bg-[#111111] p-6 transition-all duration-200 shadow-brutalist-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutalist-white-lg cursor-pointer h-full min-h-36">
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {title}
            </p>
            <p className="text-4xl font-black text-white mt-2 tabular-nums leading-none truncate tracking-tighter italic">
              {value}
            </p>
          </div>
          <div
            className={`border-[2px] border-white p-3 transition-transform duration-200 group-hover:rotate-3 shadow-brutalist-white-sm ${bg}`}
          >
            <Icon className={`w-5 h-5 ${color}`} strokeWidth={3} />
          </div>
        </div>
        <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-accent transition-colors">
          Open {title}
          <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={3} />
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
    <div className="space-y-10 pb-10">
      {/* Welcome Hero Card */}
      <div className="relative border-[3px] border-white bg-[#111111] p-8 md:p-12 shadow-brutalist-white-lg overflow-hidden">
        {/* Accent corner */}
        <div className="absolute top-0 right-0 w-32 h-32 border-l-[3px] border-b-[3px] border-white/20 bg-accent/5"></div>

        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-black">
            PORTFOLIO CENTRAL COMMAND
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-3 uppercase italic">
            Dashboard
          </h1>
          <p className="text-gray-400 font-bold mt-4 max-w-2xl text-lg leading-relaxed">
            Welcome back{info?.name ? `, ${info.name}` : ""}. Mainframe status: SYNCED. Hardware: CLOUD_FIRESTORE.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-3 border-[2.5px] border-white bg-white px-6 py-3.5 text-[11px] font-black text-black uppercase tracking-widest shadow-brutalist-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Manage projects
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </Link>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-3 border-[2.5px] border-white bg-[#0a0a0a] px-6 py-3.5 text-[11px] font-black text-white uppercase tracking-widest shadow-brutalist-white-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Review inbox
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Projects"
          value={projects?.length ?? 0}
          icon={FolderKanban}
          color="text-white"
          bg="bg-blue-600/20"
          to="/admin/projects"
        />
        <StatCard
          title="Skills"
          value={skills?.length ?? 0}
          icon={Wrench}
          color="text-white"
          bg="bg-emerald-600/20"
          to="/admin/skills"
        />
        <StatCard
          title="Messages"
          value={msgUnread > 0 ? `${msgUnread}` : msgTotal}
          icon={Mail}
          color="text-white"
          bg="bg-orange-600/20"
          to="/admin/messages"
        />
        <StatCard
          title="Profile"
          value={info?.name ? "Active" : "Miss"}
          icon={User}
          color="text-white"
          bg="bg-violet-600/20"
          to="/admin/profile"
        />
      </div>

      <div className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white">
        <div className="flex items-center justify-between mb-8 border-b-[2.5px] border-white/10 pb-4">
          <h2 className="text-xl font-black text-white uppercase flex items-center gap-3 italic">
            <User className="w-6 h-6" strokeWidth={3} />
            Profile Identity
          </h2>
          <Link
            to="/admin/profile"
            className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
          >
            Edit Profile →
          </Link>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 border-[2px] border-white bg-[#161616] shadow-brutalist-white-sm">
            <dt className="text-[10px] font-black uppercase text-white/30 tracking-widest">Full Name</dt>
            <dd className="text-white font-black mt-2 truncate italic">{info?.name || "—"}</dd>
          </div>
          <div className="p-5 border-[2px] border-white bg-[#161616] shadow-brutalist-white-sm">
            <dt className="text-[10px] font-black uppercase text-white/30 tracking-widest">Auth Title</dt>
            <dd className="text-white font-black mt-2 truncate italic">{info?.title || "—"}</dd>
          </div>
          <div className="p-5 border-[2px] border-white bg-[#161616] shadow-brutalist-white-sm">
            <dt className="text-[10px] font-black uppercase text-white/30 tracking-widest">Comm Link</dt>
            <dd className="text-white font-black mt-2 truncate italic">{info?.email || "—"}</dd>
          </div>
          <div className="p-5 border-[2px] border-white bg-[#161616] shadow-brutalist-white-sm">
            <dt className="text-[10px] font-black uppercase text-white/30 tracking-widest">Narrative Status</dt>
            <dd className="text-white font-black mt-2 italic">{info?.bio ? "ACTIVE" : "MISSING"}</dd>
          </div>
        </dl>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white">
          <div className="flex items-center justify-between mb-8 border-b-[2.5px] border-white/10 pb-4">
            <h2 className="text-xl font-black text-white uppercase flex items-center gap-3 italic">
              <FolderKanban className="w-6 h-6" strokeWidth={3} />
              Featured projects
            </h2>
            <Link
              to="/admin/projects"
              className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
            >
              All projects →
            </Link>
          </div>
          <ul className="space-y-4">
            {(projects || []).slice(0, 4).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 p-4 border-[2px] border-white bg-[#161616] hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white uppercase truncate italic">{p.title}</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider truncate mt-1">
                    {p.technologies || "Legacy Stack"}
                  </p>
                </div>
                <div className="w-2 h-2 bg-accent shadow-brutalist-accent"></div>
              </li>
            ))}
            {(!projects || projects.length === 0) && (
              <p className="text-white/20 font-bold uppercase text-xs italic">Zero collections found.</p>
            )}
          </ul>
        </div>

        <div className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white">
          <div className="flex items-center justify-between mb-8 border-b-[2.5px] border-white/10 pb-4">
            <h2 className="text-xl font-black text-white uppercase flex items-center gap-3 italic">
              <Wrench className="w-6 h-6" strokeWidth={3} />
              Technical Arsenal
            </h2>
            <Link
              to="/admin/skills"
              className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
            >
              All skills →
            </Link>
          </div>
          <ul className="space-y-3">
            {(skills || []).slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center gap-4 p-3 border-[2px] border-white bg-[#161616]">
                <div className="w-10 h-10 border-[1.5px] border-white bg-[#0a0a0a] p-1.5 shadow-brutalist-white-sm">
                  {s.logo ? (
                    <img src={s.logo} alt="" className="w-full h-full object-contain filter invert opacity-80" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs font-black text-white">
                      {s.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="flex-1 font-black uppercase text-xs tracking-wider text-white truncate italic">{s.name}</span>
                <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 border border-accent/20">
                  {s.proficiency}%
                </span>
              </li>
            ))}
            {(!skills || skills.length === 0) && (
              <p className="text-white/20 font-bold uppercase text-xs italic">No assets indexed.</p>
            )}
          </ul>
        </div>
      </div>
    </div>

  );
}
