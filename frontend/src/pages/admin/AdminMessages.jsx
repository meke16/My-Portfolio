import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  collection, getDocs, updateDoc, deleteDoc, doc, arrayUnion,
} from "firebase/firestore";
import { Mail, Trash2, RefreshCw, Inbox, Send } from "lucide-react";
import { useFirestorePortfolio } from "../../context/FirestorePortfolioContext";

function timeValue(c) {
  if (!c) return 0;
  if (typeof c?.seconds === "number") return c.seconds;
  if (typeof c?.toMillis === "function") return c.toMillis() / 1000;
  if (c instanceof Date) return c.getTime() / 1000;
  return 0;
}

function formatWhen(c) {
  if (!c) return "—";
  try {
    if (typeof c?.seconds === "number") return new Date(c.seconds * 1000).toLocaleString();
    if (typeof c?.toDate === "function") return c.toDate().toLocaleString();
  } catch { /* ignore */ }
  return "—";
}

function ChatBubble({ text, time, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
        isMe
          ? "bg-blue-600 text-white rounded-br-sm"
          : "bg-white/[0.07] text-gray-200 rounded-bl-sm"
      }`}>
        {text}
        <p className={`text-[10px] mt-1 ${isMe ? "text-blue-200/70 text-right" : "text-gray-500"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const { db } = useFirestorePortfolio();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    if (!db) { setLoading(false); setMessages([]); return; }
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "messages"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data(), read: Boolean(d.data().read) }))
        .sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));
      setMessages(list);
    } catch (e) {
      setError(e?.message || "Could not load messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => { load(); }, [load]);

  // Scroll to bottom when thread changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.replies?.length, selected?.id]);

  const markRead = async (id) => {
    if (!db) return;
    await updateDoc(doc(db, "messages", id), { read: true }).catch(() => {});
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
    setSelected((s) => s?.id === id ? { ...s, read: true } : s);
  };

  const openMessage = (msg) => {
    setSelected(msg);
    setReplyText("");
    if (!msg.read) markRead(msg.id);
  };

  const handleDelete = async (id) => {
    if (!db || !window.confirm("Delete this message permanently?")) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelected((s) => s?.id === id ? null : s);
    } catch (e) {
      setError(e?.message || "Could not delete.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    const text = replyText.trim();
    const sentAt = new Date().toISOString();

    // Optimistically add to UI
    const newReply = { text, sentAt };
    const updatedSelected = { ...selected, replies: [...(selected.replies || []), newReply] };
    setSelected(updatedSelected);
    setMessages((prev) => prev.map((m) => m.id === selected.id ? updatedSelected : m));
    setReplyText("");

    try {
      // Save reply to Firestore
      await updateDoc(doc(db, "messages", selected.id), {
        replies: arrayUnion(newReply),
      });
      // Send email in background
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected.name,
          email: selected.email,
          subject: `Re: ${selected.subject || "your message"}`,
          message: text,
          replyTo: selected.email,
        }),
      }).catch(() => {});
    } catch {
      setError("Reply saved locally but failed to persist.");
    } finally {
      setReplying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  // Build chat thread: original message first, then replies interleaved
  const thread = selected ? [
    { text: selected.message, time: formatWhen(selected.createdAt), isMe: false },
    ...(selected.replies || []).map((r) => ({
      text: r.text,
      time: new Date(r.sentAt).toLocaleString(),
      isMe: true,
    })),
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-400" />
            Messages
          </h1>
          <p className="text-gray-400 mt-1">
            Contact form submissions
            {messages.length > 0 && (
              <span> · {messages.length} total{unread > 0 && <span className="text-blue-400 font-medium"> · {unread} unread</span>}</span>
            )}
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading || !db}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      {!db && <p className="text-amber-400 text-sm">Firebase is not configured.</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading messages…</p>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6" style={{ height: "calc(100vh - 220px)" }}>
          {/* Inbox list */}
          <div className="lg:w-[min(100%,320px)] flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500">Inbox</div>
            <ul className="overflow-y-auto flex-1">
              {messages.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => openMessage(m)}
                    className={`w-full text-left px-4 py-3 border-b border-white/10 transition-colors border-l-2 ${
                      selected?.id === m.id ? "bg-blue-600/15 border-l-blue-500" : "border-l-transparent hover:bg-white/5"
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-medium truncate text-sm ${m.read ? "text-gray-400" : "text-white"}`}>
                        {m.name || "Anonymous"}
                      </span>
                      {!m.read && <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{m.subject || m.message?.slice(0, 50) || "(no subject)"}</p>
                    <p className="text-[11px] text-gray-600 mt-1">{formatWhen(m.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat panel */}
          <div className="flex-1 min-w-0 flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Select a message</div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
                  <div>
                    <p className="font-semibold text-white">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-xs text-blue-400 hover:text-blue-300">{selected.email}</a>
                    {selected.subject && <p className="text-xs text-gray-500 mt-0.5">{selected.subject}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={busyId === selected.id} onClick={() => handleDelete(selected.id)}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
                  </div>
                </div>

                {/* Thread */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {thread.map((bubble, i) => (
                    <ChatBubble key={i} {...bubble} />
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-white/10 flex gap-2 items-end shrink-0">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply… (Enter to send, Shift+Enter for newline)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-600"
                  />
                  <button type="button" onClick={handleReply} disabled={replying || !replyText.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
