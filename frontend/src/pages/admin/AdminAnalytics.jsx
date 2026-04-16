import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";
import { BarChart3, Users, Clock, Monitor, Globe, ArrowRight, Calendar } from "lucide-react";

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
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

export default function AdminAnalytics() {
  const { db } = useFirestorePortfolio();
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [deviceStats, setDeviceStats] = useState({ browser: {}, os: {}, mobile: 0 });
  const [geoStats, setGeoStats] = useState({});
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    loadAnalytics();
  }, [db, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 365;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const q = query(
        collection(db, "analytics"),
        where("timestamp", ">=", since),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      const pageViewsList = data.filter(x => x.type === "pageview");
      const durations = data.filter(x => x.type === "page_duration");

      const unique = new Set(data.map(x => x.sessionId)).size;
      const totalDurations = durations.reduce((acc, x) => acc + (x.durationSeconds || 0), 0);
      const avgDur = durations.length > 0 ? totalDurations / durations.length : 0;

      const pageCounts = {};
      pageViewsList.forEach(x => {
        pageCounts[x.page] = (pageCounts[x.page] || 0) + 1;
      });
      const topPagesList = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, count]) => ({ page, count }));

      const browserStats = {};
      const osStats = {};
      let mobileCount = 0;
      const geoCounts = {};

      data.forEach(x => {
        if (x.device) {
          if (x.device.browser) browserStats[x.device.browser] = (browserStats[x.device.browser] || 0) + 1;
          if (x.device.os) osStats[x.device.os] = (osStats[x.device.os] || 0) + 1;
          if (x.device.isMobile) mobileCount++;
        }
        if (x.location?.country) {
          geoCounts[x.location.country] = (geoCounts[x.location.country] || 0) + 1;
        }
      });

      setTotalViews(pageViewsList.length);
      setUniqueVisitors(unique);
      setAvgDuration(avgDur);
      setRecentActivity(data.slice(0, 20));
      setTopPages(topPagesList);
      setDeviceStats({ browser: browserStats, os: osStats, mobile: mobileCount });
      setGeoStats(geoCounts);
    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
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

  const topCountries = Object.entries(geoStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Track visitor activity on your portfolio</p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Unique Visitors</p>
              <p className="text-2xl font-bold text-white">{uniqueVisitors}</p>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Top Pages
          </h2>
          <div className="space-y-3">
            {topPages.length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet</p>
            ) : (
              topPages.map((item, idx) => (
                <div key={item.page} className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                  <span className="flex-1 text-gray-200 text-sm truncate">{item.page}</span>
                  <span className="text-gray-400 text-sm tabular-nums">{item.count} views</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-400" />
            Top Countries
          </h2>
          <div className="space-y-3">
            {topCountries.length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet</p>
            ) : (
              topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="flex-1 text-gray-200 text-sm">{country}</span>
                  <span className="text-gray-400 text-sm tabular-nums">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-violet-400" />
            Browsers
          </h2>
          <div className="space-y-2">
            {Object.entries(deviceStats.browser).length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet</p>
            ) : (
              Object.entries(deviceStats.browser)
                .sort((a, b) => b[1] - a[1])
                .map(([browser, count]) => (
                  <div key={browser} className="flex items-center gap-3">
                    <span className="flex-1 text-gray-200 text-sm">{browser}</span>
                    <span className="text-gray-400 text-sm">{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-orange-400" />
            Operating Systems
          </h2>
          <div className="space-y-2">
            {Object.entries(deviceStats.os).length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet</p>
            ) : (
              Object.entries(deviceStats.os)
                .sort((a, b) => b[1] - a[1])
                .map(([os, count]) => (
                  <div key={os} className="flex items-center gap-3">
                    <span className="flex-1 text-gray-200 text-sm">{os}</span>
                    <span className="text-gray-400 text-sm">{count}</span>
                  </div>
                ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Mobile vs Desktop</span>
              <span className="text-gray-300">
                {deviceStats.mobile} mobile
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-400" />
          Recent Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/10">
                <th className="text-left py-3 pr-4">Time</th>
                <th className="text-left py-3 pr-4">Page</th>
                <th className="text-left py-3 pr-4">Type</th>
                <th className="text-left py-3 pr-4">Device</th>
                <th className="text-left py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No activity recorded yet
                  </td>
                </tr>
              ) : (
                recentActivity.slice(0, 15).map((item) => (
                  <tr key={item.id} className="border-b border-white/5 text-gray-300">
                    <td className="py-3 pr-4 whitespace-nowrap">{formatDate(item.timestamp)}</td>
                    <td className="py-3 pr-4">{item.page}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.type === "pageview" ? "bg-blue-500/20 text-blue-400" : "bg-violet-500/20 text-violet-400"
                      }`}>
                        {item.type === "pageview" ? "view" : `${Math.round(item.durationSeconds || 0)}s`}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">
                      {item.device?.browser} {item.device?.os}
                    </td>
                    <td className="py-3 text-gray-400">
                      {item.location?.city ? `${item.location.city}, ` : ""}{item.location?.country || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}