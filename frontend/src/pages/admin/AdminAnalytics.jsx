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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Track visitor activity on your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          {["24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {selectedVisitors.size > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <span className="text-blue-300 text-sm">
            {selectedVisitors.size} visitor{selectedVisitors.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedVisitors(new Set())}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Unique Visitors</p>
              <p className="text-2xl font-bold text-white">{visitors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Page Views</p>
              <p className="text-2xl font-bold text-white">{totalViews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Time on Page</p>
              <p className="text-2xl font-bold text-white">{formatDuration(avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Visitors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/10">
                <th className="text-left py-3 pr-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1 hover:text-white">
                    {selectedVisitors.size === visitors.length && visitors.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 pr-4">Last Seen</th>
                <th className="text-left py-3 pr-4">Device</th>
                <th className="text-left py-3 pr-4">Location</th>
                <th className="text-left py-3 pr-4">Pages</th>
                <th className="text-left py-3">Time</th>
                <th className="text-left py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No visitors recorded yet
                  </td>
                </tr>
              ) : (
                visitors.slice(0, 50).map((visitor) => (
                  <tr 
                    key={visitor.sessionId} 
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 pr-4">
                      <button 
                        onClick={() => toggleSelect(visitor.sessionId)}
                        className="p-1 hover:text-white"
                      >
                        {selectedVisitors.has(visitor.sessionId) ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </td>
                    <td 
                      className="py-3 pr-4 whitespace-nowrap text-gray-400 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      {formatTimeAgo(visitor.lastSeen)}
                    </td>
                    <td 
                      className="py-3 pr-4 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">
                          {visitor.device?.browser} {visitor.device?.os}
                          {visitor.device?.isMobile && <span className="text-gray-500 ml-1">(mobile)</span>}
                        </span>
                      </div>
                    </td>
                    <td 
                      className="py-3 pr-4 text-gray-300 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      {visitor.location?.city ? `${visitor.location.city}, ` : ""}{visitor.location?.country || "—"}
                    </td>
                    <td 
                      className="py-3 pr-4 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      <span className="text-gray-300">{visitor.pageCount} pages</span>
                    </td>
                    <td 
                      className="py-3 text-gray-300 cursor-pointer"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      {formatDuration(visitor.totalDuration)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteVisitor(visitor)}
                        disabled={deleting}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        title="Delete this visitor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {visitors.length > 50 && (
          <p className="text-center text-gray-500 text-sm mt-4">Showing 50 of {visitors.length} visitors</p>
        )}
      </div>

      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">Visitor Details</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Session: {selectedVisitor.sessionId.slice(0, 20)}...
                </p>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 border-b border-white/10 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Device</p>
                  <p className="text-gray-200 mt-1">
                    {selectedVisitor.device?.browser} / {selectedVisitor.device?.os}
                    {selectedVisitor.device?.isMobile && " (Mobile)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Time</p>
                  <p className="text-gray-200 mt-1">{formatDuration(selectedVisitor.totalDuration)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="text-gray-200 mt-1">
                    {selectedVisitor.location?.city ? `${selectedVisitor.location.city}, ` : ""}
                    {selectedVisitor.location?.country || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">IP Address</p>
                  <p className="text-gray-200 mt-1">{selectedVisitor.location?.ip || "—"}</p>
                </div>
              </div>
              {selectedVisitor.location?.timezone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Timezone</p>
                  <p className="text-gray-200 mt-1">{selectedVisitor.location.timezone}</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <h4 className="text-sm font-semibold text-white mb-3">Pages Visited</h4>
              <div className="space-y-2">
                {selectedVisitor.pages.filter(p => p.views > 0).map((page, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-gray-200 font-medium">{page.page}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {page.views} view{page.views > 1 ? "s" : ""} • {formatDuration(page.duration)} spent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">{formatDuration(page.duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}