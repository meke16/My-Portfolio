import React, { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Mail, Trash2, RefreshCw, Inbox } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";

function sortByCreatedAtDesc(messages) {
  return [...messages].sort((a, b) => {
    const ta = timeValue(a.createdAt);
    const tb = timeValue(b.createdAt);
    return tb - ta;
  });
}

function timeValue(createdAt) {
  if (!createdAt) return 0;
  if (typeof createdAt?.seconds === "number") return createdAt.seconds;
  if (typeof createdAt?.toMillis === "function") return createdAt.toMillis() / 1000;
  if (createdAt instanceof Date) return createdAt.getTime() / 1000;
  return 0;
}

function formatWhen(createdAt) {
  if (!createdAt) return "—";
  try {
    if (typeof createdAt?.seconds === "number") {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    if (typeof createdAt?.toDate === "function") {
      return createdAt.toDate().toLocaleString();
    }
  } catch {
    /* ignore */
  }
  return "—";
}

export default function AdminMessages() {
  const { db } = useFirestorePortfolio();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!db) {
      setLoading(false);
      setMessages([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "messages"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        read: Boolean(d.data().read),
      }));
      setMessages(sortByCreatedAtDesc(list));
    } catch (e) {
      setError(e?.message || "Could not load messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    if (!db) return;
    setBusyId(id);
    try {
      await updateDoc(doc(db, "messages", id), { read: true });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
      setSelected((s) => (s?.id === id ? { ...s, read: true } : s));
    } catch (e) {
      setError(e?.message || "Could not mark as read.");
    } finally {
      setBusyId(null);
    }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (!msg.read) markRead(msg.id);
  };

  const handleDelete = async (id) => {
    if (!db || !window.confirm("Delete this message permanently?")) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelected((s) => (s?.id === id ? null : s));
    } catch (e) {
      setError(e?.message || "Could not delete.");
    } finally {
      setBusyId(null);
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-400" />
            Messages
          </h1>
           <p className="text-gray-400 mt-1">
             Contact form submissions from your portfolio
            {messages.length > 0 && (
              <span className="text-gray-400">
                {" "}
                · {messages.length} total
                {unread > 0 && (
                  <span className="text-blue-400 font-medium"> · {unread} unread</span>
                )}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading || !db}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!db && (
        <p className="text-amber-400 text-sm">Firebase is not configured.</p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading messages…</p>
      ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No messages yet.</p>
          <p className="text-gray-600 text-sm mt-2">
            Submissions from the public contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[420px]">
            <div className="lg:w-[min(100%,380px)] flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Inbox
            </div>
            <ul className="overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-12rem)]">
              {messages.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => openMessage(m)}
                    className={`w-full text-left px-4 py-3 border-b border-white/10 transition-colors ${
                      selected?.id === m.id
                        ? "bg-blue-600/15 border-l-2 border-l-blue-500"
                        : "border-l-2 border-l-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-medium truncate ${
                          m.read ? "text-gray-400" : "text-white"
                        }`}
                      >
                        {m.name || "Anonymous"}
                      </span>
                      {!m.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {m.subject || m.message?.slice(0, 60) || "(no subject)"}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      {formatWhen(m.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

           <div className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6 min-h-[320px]">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Select a message to read
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selected.name}</h2>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-blue-400 hover:text-blue-300 break-all"
                    >
                      {selected.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-gray-500 hover:text-white text-sm shrink-0"
                  >
                    Close
                  </button>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Subject
                  </p>
                  <p className="text-blue-300 font-medium">{selected.subject || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Message
                  </p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>
                <p className="text-xs text-gray-600">{formatWhen(selected.createdAt)}</p>
                <button
                  type="button"
                  disabled={busyId === selected.id}
                  onClick={() => handleDelete(selected.id)}
                  className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete message
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
