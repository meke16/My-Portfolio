import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  collection, getDocs, updateDoc, deleteDoc, doc,
  addDoc, serverTimestamp, query, where,
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

function ChatBubble({ text, time, isMe, source }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
        isMe
          ? "bg-blue-600 text-white rounded-br-sm"
          : "bg-white/[0.07] text-gray-200 rounded-bl-sm"
      }`}>
        {source === "email" && !isMe && (
          <p className="text-[10px] text-gray-400 mb-1 font-mono">via email reply</p>
        )}
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
  const [messages, setMessages] = useState([]);   // inbox roots
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const bottomRef = useRef(null);

  // Load inbox: one entry per conversation (first inbound message)
  const load = useCallback(async () => {
    if (!db) { setLoading(false); setMessages([]); return; }
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "messages"));
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data(), read: Boolean(d.data().read) }));
      const seen = new Set();
      const roots = all
        .filter((m) => m.direction !== "outbound")
        .sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt))
        .filter((m) => {
          const key = m.conversationId || m.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      setMessages(roots);
    } catch (e) {
      setError(e?.message || "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Load full thread for selected conversation
  const loadThread = useCallback(async (msg) => {
    if (!db || !msg.conversationId) { setThread([msg]); return; }
    try {
      const q = query(collection(db, "messages"), where("conversationId", "==", msg.conversationId));
      const snap = await getDocs(q);
      const sorted = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => timeValue(a.createdAt) - timeValue(b.createdAt));
      setThread(sorted);
    } catch {
      setThread([msg]);
    }
  }, [db]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, selected?.id]);

  const markRead = async (id) => {
    if (!db) return;
    await updateDoc(doc(db, "messages", id), { read: true }).catch(() => {});
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
    setSelected((s) => s?.id === id ? { ...s, read: true } : s);
  };

  const openMessage = (msg) => {
    setSelected(msg);
    setReplyText("");
    loadThread(msg);
    if (!msg.read) markRead(msg.id);
  };

  const handleDelete = async (id) => {
    if (!db) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelected((s) => s?.id === id ? null : s);
      setThread([]);
      setDeleteTargetId((currentId) => (currentId === id ? null : currentId));
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
    setReplyText("");

    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversationId: selected.conversationId,
      direction: "outbound",
      message: text,
      createdAt: { seconds: Date.now() / 1000 },
    };
    setThread((prev) => [...prev, optimistic]);

    try {
      // Save outbound message to Firestore (n8n can also read this)
      await addDoc(collection(db, "messages"), {
        conversationId: selected.conversationId,
        direction: "outbound",
        fromEmail: import.meta.env.VITE_SMTP_USER || "",
        toEmail: selected.email,
        name: selected.name,
        email: selected.email,
        subject: `Re: ${selected.subject || "your message"} [CID:${selected.conversationId}]`,
        message: text,
        source: "dashboard",
        read: true,
        createdAt: serverTimestamp(),
      });

      // Send email — subject contains [CID:xxx] so n8n can thread replies back
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected.name,
          email: selected.email,
          subject: `Re: ${selected.subject || "your message"} [CID:${selected.conversationId}]`,
          message: text,
          replyTo: selected.email,
        }),
      }).catch(() => {});

      // Reload thread to replace optimistic entry with real doc
      loadThread(selected);
    } catch {
      setError("Failed to save reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }
  };

  const unread = messages.filter((m) => !m.read).length;
  const isDeleteModalOpen = Boolean(deleteTargetId);

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
                    {selected.conversationId && (
                      <p className="text-[10px] text-gray-600 font-mono mt-0.5">CID: {selected.conversationId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={busyId === selected.id} onClick={() => setDeleteTargetId(selected.id)}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => { setSelected(null); setThread([]); }}
                      className="text-gray-500 hover:text-white text-sm">✕</button>
                  </div>
                </div>

                {/* Thread */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {thread.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      text={msg.message}
                      time={formatWhen(msg.createdAt)}
                      isMe={msg.direction === "outbound"}
                      source={msg.source}
                    />
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !busyId && setDeleteTargetId(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Delete message?</h3>
            <p className="mt-2 text-sm text-gray-400">This action is permanent and cannot be undone.</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={Boolean(busyId)}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
                disabled={Boolean(busyId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
              >
                {busyId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
