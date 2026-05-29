import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where, writeBatch, deleteDoc, doc } from "firebase/firestore";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import { BarChart3, Users, Clock, Monitor, Trash2, X, CheckSquare, Square } from "lucide-react";

function formatDuration(seconds) {
  if (!seconds || seconds < 60) return `${Math.round(seconds || 0)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${Math.round(seconds % 60)}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Unknown";
  return timestamp.toDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeAgo(timestamp) {
  if (!timestamp?.toDate) return "";
  const now = new Date();
  const then = timestamp.toDate();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

export default function AdminAnalytics() {
  const { db } = useFirestorePortfolio();
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedVisitors, setSelectedVisitors] = useState(new Set());
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    loadAnalytics();
  }, [db, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setSelectedVisitors(new Set());
    try {
      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 365;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const q = query(
        collection(db, "analytics"),
        where("timestamp", ">=", since),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data(), ref: d.ref }));

      setAllData(data);

      const sessions = {};
      data.forEach(item => {
        if (!sessions[item.sessionId]) {
          sessions[item.sessionId] = {
            sessionId: item.sessionId,
            firstSeen: item.timestamp,
            lastSeen: item.timestamp,
            device: item.device,
            location: item.location,
            pages: [],
            totalDuration: 0,
            dataIds: [],
          };
        }
        if (item.timestamp > sessions[item.sessionId].lastSeen) {
          sessions[item.sessionId].lastSeen = item.timestamp;
        }
        sessions[item.sessionId].dataIds.push(item.id);
        if (item.page) {
          const existingPage = sessions[item.sessionId].pages.find(p => p.page === item.page);
          if (existingPage) {
            if (item.type === "page_duration") {
              existingPage.duration += item.durationSeconds || 0;
              existingPage.views++;
            }
          } else {
            sessions[item.sessionId].pages.push({
              page: item.page,
              duration: item.type === "page_duration" ? (item.durationSeconds || 0) : 0,
              views: item.type === "pageview" ? 1 : 0,
            });
          }
        }
        if (item.type === "page_duration") {
          sessions[item.sessionId].totalDuration += item.durationSeconds || 0;
        }
      });

      const visitorList = Object.values(sessions).map(v => ({
        ...v,
        pageCount: v.pages.filter(p => p.views > 0).length,
        totalDuration: v.totalDuration,
      })).sort((a, b) => (b.lastSeen?.toMillis?.() || 0) - (a.lastSeen?.toMillis?.() || 0));

      const totalPageViews = data.filter(x => x.type === "pageview").length;
      const durations = data.filter(x => x.type === "page_duration");
      const totalDur = durations.reduce((acc, x) => acc + (x.durationSeconds || 0), 0);
      const avgDur = durations.length > 0 ? totalDur / durations.length : 0;

      setVisitors(visitorList);
      setTotalViews(totalPageViews);
      setAvgDuration(avgDur);
    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisitor = async (visitor) => {
    if (!db) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      const visitorData = allData.filter(d => d.sessionId === visitor.sessionId);
      visitorData.forEach(d => batch.delete(d.ref));
      await batch.commit();
      loadAnalytics();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!db || selectedVisitors.size === 0) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      const toDelete = allData.filter(d => selectedVisitors.has(d.sessionId));
      toDelete.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setSelectedVisitors(new Set());
      loadAnalytics();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVisitors.size === visitors.length) {
      setSelectedVisitors(new Set());
    } else {
      setSelectedVisitors(new Set(visitors.map(v => v.sessionId)));
    }
  };

  const toggleSelect = (sessionId) => {
    const newSelected = new Set(selectedVisitors);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedVisitors(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!db) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Firebase not configured</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[3px] border-white/20 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Visitor Log Intel</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">Metrics and surveillance data</p>
        </div>
        <div className="flex items-center gap-3 border-[2.5px] border-white p-1.5 bg-[#111111] shadow-brutalist-white-sm">
          {["24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range
                ? "bg-white text-black"
                : "text-white/20 hover:text-white"
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {selectedVisitors.size > 0 && (
        <div className="flex items-center gap-4 px-6 py-4 border-[2.5px] border-white bg-accent/5 shadow-brutalist-white-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {selectedVisitors.size} Targets Selected
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 border-[2px] border-white bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-brutalist-white-sm active:shadow-none transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" strokeWidth={3} />
            Purge Cluster
          </button>
          <button
            onClick={() => setSelectedVisitors(new Set())}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white underline"
          >
            Abort selection
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 border-[2px] border-white bg-blue-600/10 text-blue-400 shadow-brutalist-white-sm">
              <Users className="w-8 h-8" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Unique Assets</p>
              <p className="text-4xl font-black text-white tracking-tighter italic">{visitors.length}</p>
            </div>
          </div>
        </div>
        <div className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 border-[2px] border-white bg-emerald-600/10 text-emerald-400 shadow-brutalist-white-sm">
              <BarChart3 className="w-8 h-8" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Aggregate Hits</p>
              <p className="text-4xl font-black text-white tracking-tighter italic">{totalViews}</p>
            </div>
          </div>
        </div>
        <div className="border-[3px] border-white bg-[#111111] p-8 shadow-brutalist-white-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 border-[2px] border-white bg-violet-600/10 text-violet-400 shadow-brutalist-white-sm">
              <Clock className="w-8 h-8" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Mean Exposure</p>
              <p className="text-4xl font-black text-white tracking-tighter italic">{formatDuration(avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-[3px] border-white bg-[#111111] shadow-brutalist-white overflow-hidden">
        <div className="px-8 py-6 border-b-[3px] border-white bg-white flex items-center justify-between">
          <h2 className="text-sm font-black text-black uppercase tracking-widest italic">Active surveillance log</h2>
          <span className="text-[9px] font-black text-black/50 uppercase tracking-tighter italic">Showing {Math.min(visitors.length, 50)} of {visitors.length} indexed records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#161616] border-b-[2.5px] border-white/20">
                <th className="py-6 px-8 w-10">
                  <button onClick={toggleSelectAll} className="p-1 border-[2px] border-white bg-[#0a0a0a] text-white shadow-brutalist-white-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                    {selectedVisitors.size === visitors.length && visitors.length > 0 ? (
                      <CheckSquare className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Square className="w-4 h-4" strokeWidth={3} />
                    )}
                  </button>
                </th>
                <th className="py-6 px-4 text-[11px] font-black uppercase tracking-widest text-white/20">Timestamp</th>
                <th className="py-6 px-4 text-[11px] font-black uppercase tracking-widest text-white/20">Hardware Class</th>
                <th className="py-6 px-4 text-[11px] font-black uppercase tracking-widest text-white/20">Coordinates</th>
                <th className="py-6 px-4 text-[11px] font-black uppercase tracking-widest text-white/20">Page Depth</th>
                <th className="py-6 px-4 text-[11px] font-black uppercase tracking-widest text-white/20">Duration</th>
                <th className="py-6 px-8 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y-[1.5px] divide-white/5 bg-[#111111]">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <p className="text-white/20 font-black uppercase tracking-[0.2em] text-xs italic">Zero activity signatures detected in current timeframe.</p>
                  </td>
                </tr>
              ) : (
                visitors.slice(0, 50).map((visitor) => (
                  <tr
                    key={visitor.sessionId}
                    className="group hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-5 px-8">
                      <button
                        onClick={() => toggleSelect(visitor.sessionId)}
                        className="p-1 border-[2px] border-white bg-[#0a0a0a] text-white shadow-brutalist-white-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                      >
                        {selectedVisitors.has(visitor.sessionId) ? (
                          <div className="bg-white p-0.5"><CheckSquare className="w-3.5 h-3.5 text-black" strokeWidth={3} /></div>
                        ) : (
                          <Square className="w-4 h-4" strokeWidth={3} />
                        )}
                      </button>
                    </td>
                    <td
                      className="py-5 px-4 whitespace-nowrap text-[12px] font-black uppercase tracking-tight text-white/80 group-hover:text-white cursor-pointer italic"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      {formatTimeAgo(visitor.lastSeen)}
                    </td>
                    <td
                      className="py-5 px-4 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      <div className="flex items-center gap-4">
                        <Monitor className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" strokeWidth={2.5} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80">
                          {visitor.device?.browser} · {visitor.device?.os}
                          {visitor.device?.isMobile && <span className="bg-white text-black px-2 py-0.5 text-[8px] ml-3 tracking-tighter font-black italic">MOBILE</span>}
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      {visitor.location?.city ? `${visitor.location.city}, ` : ""}<span className="text-white/80">{visitor.location?.country || "UNKNOWN"}</span>
                    </td>
                    <td
                      className="py-5 px-4 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest text-white italic underline decoration-white/10 underline-offset-4 group-hover:decoration-white/40 transition-all">{visitor.pageCount} Targets</span>
                    </td>
                    <td
                      className="py-5 px-4 text-[12px] font-black text-white group-hover:text-accent transition-colors cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      {formatDuration(visitor.totalDuration)}
                    </td>
                    <td className="py-5 px-8 text-right">
                      <button
                        onClick={() => handleDeleteVisitor(visitor)}
                        disabled={deleting}
                        className="p-2.5 border-[2px] border-white bg-[#0a0a0a] text-red-500 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none disabled:opacity-50"
                        title="Purge record"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVisitor && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-[3px] p-4">
          <div className="bg-[#111111] border-[3px] border-white max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-brutalist-white-lg">
            <div className="flex items-center justify-between p-8 border-b-[3px] border-white/20 bg-[#111111] sticky top-0 z-10">
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Record Inspection</h3>
                <p className="text-[10px] font-black text-white/20 uppercase mt-2 tracking-[0.2em] italic">
                  Cluster ID: <span className="text-white/40">{selectedVisitor.sessionId}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-3 border-[2px] border-white text-white hover:bg-white hover:text-black transition-all shadow-brutalist-white-sm active:shadow-none"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>

            <div className="p-8 border-b-[2.5px] border-white/10 bg-[#0a0a0a] flex flex-wrap items-center gap-10 overflow-x-auto">
              <div className="shrink-0 space-y-2">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Hardware Architecture</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight italic">
                  {selectedVisitor.device?.browser} / {selectedVisitor.device?.os}
                  {selectedVisitor.device?.isMobile && <span className="text-accent ml-2">· MOBILE_ACTIVE</span>}
                </p>
              </div>
              <div className="shrink-0 space-y-2 border-l-[2px] border-white/10 pl-10">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total Exposure</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight italic">{formatDuration(selectedVisitor.totalDuration)}</p>
              </div>
              <div className="shrink-0 space-y-2 border-l-[2px] border-white/10 pl-10">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Physical Coordinates</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight italic">
                  {selectedVisitor.location?.city ? `${selectedVisitor.location.city}, ` : ""}
                  {selectedVisitor.location?.country || "UNKNOWN_ORIGIN"}
                </p>
              </div>
              <div className="shrink-0 space-y-2 border-l-[2px] border-white/10 pl-10">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Network ID</p>
                <p className="text-[11px] font-black text-white tracking-tight italic">{selectedVisitor.location?.ip || "MASKED"}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-custom bg-[#050505]">
              <div className="border-l-[4px] border-accent pl-8">
                <h4 className="text-base font-black text-white uppercase tracking-widest mb-8 italic underline decoration-white/10 underline-offset-8">Sequence of Operations</h4>
                <div className="grid gap-6">
                  {selectedVisitor.pages.filter(p => p.views > 0).map((page, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-6 border-[2.5px] border-white bg-[#111111] shadow-brutalist-white-sm group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                      <div>
                        <p className="text-white font-black uppercase text-sm tracking-tight italic">{page.page}</p>
                        <p className="text-[10px] font-black text-white/30 mt-2 uppercase tracking-[0.1em]">
                          Hits: {page.views} · Latency: {formatDuration(page.duration)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black text-base uppercase tracking-tighter italic">{formatDuration(page.duration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}