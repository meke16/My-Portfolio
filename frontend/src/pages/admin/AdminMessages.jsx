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

function isImageAttachment(a) {
  const type = String(a?.mimeType || "").toLowerCase();
  const url = String(a?.url || "").toLowerCase();
  return type.startsWith("image/") || url.startsWith("data:image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
}

function ChatBubble({ text, time, isMe, source, attachments = [] }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${isMe
        ? "bg-blue-600 text-white rounded-br-sm"
        : "bg-white/[0.07] text-gray-200 rounded-bl-sm"
        }`}>
        {source === "email" && !isMe && (
          <p className="text-[10px] text-gray-400 mb-1 font-mono">via email reply</p>
        )}
        {text}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachments.map((a, i) => (
              <div key={`${a.url || a.name}-${i}`} className="rounded-lg border border-white/15 bg-black/15 p-2">
                {isImageAttachment(a) && a.url && (
                  <a href={a.url} target="_blank" rel="noreferrer" className="block mb-2">
                    <img
                      src={a.url}
                      alt={a.name || `attachment-${i + 1}`}
                      className="max-h-48 w-auto rounded-md border border-white/10"
                      loading="lazy"
                    />
                  </a>
                )}
                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline break-all text-blue-200 hover:text-blue-100"
                  >
                    {a.name || `Attachment ${i + 1}`}
                  </a>
                ) : (
                  <p className="text-xs break-all text-gray-300">{a.name || `Attachment ${i + 1}`}</p>
                )}
                {a.mimeType && <p className="text-[10px] text-gray-400 mt-0.5">{a.mimeType}</p>}
              </div>
            ))}
          </div>
        )}
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
    await updateDoc(doc(db, "messages", id), { read: true }).catch(() => { });
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
      }).catch(() => { });

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
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-[3px] border-white/20 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            <Mail className="w-10 h-10" strokeWidth={3} />
            Transmission Hub
          </h1>
          <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-wider">
            Inbound communication stream
            {messages.length > 0 && (
              <span className="text-white/40"> · {messages.length} Records{unread > 0 && <span className="text-accent underline font-black"> · {unread} Unread</span>}</span>
            )}
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading || !db}
          className="inline-flex items-center gap-3 px-8 py-4 border-[2.5px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-brutalist-white-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} strokeWidth={3} />
          Sync Stream
        </button>
      </div>

      {error && <div className="border-[2.5px] border-red-500 bg-red-950/30 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 shadow-brutalist-white-sm">{error}</div>}
      {!db && <p className="text-red-500 font-black uppercase tracking-widest text-[10px]">Critical Error: Database link inactive.</p>}

      {loading ? (
        <div className="flex items-center justify-center py-24 border-[3px] border-white/20 border-dashed bg-[#0a0a0a]">
          <p className="text-white/20 font-black uppercase tracking-[0.2em] animate-pulse text-xs italic">Establishing secure link…</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="border-[3px] border-white bg-[#111111] py-24 text-center shadow-brutalist-white">
          <Inbox className="w-16 h-16 text-white opacity-10 mx-auto mb-6" strokeWidth={2} />
          <p className="text-white/30 font-black uppercase tracking-widest italic">Archive empty. No inbound transmissions detected.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8" style={{ height: "calc(100vh - 240px)" }}>
          {/* Inbox list */}
          <div className="lg:w-[min(100%,360px)] flex flex-col border-[3px] border-white bg-[#111111] shadow-brutalist-white overflow-hidden shrink-0">
            <div className="px-6 py-4 border-b-[3px] border-white bg-white text-black text-[11px] font-black uppercase tracking-widest italic">Inbound Queue</div>
            <ul className="overflow-y-auto flex-1 scrollbar-custom bg-[#0a0a0a]">
              {messages.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => openMessage(m)}
                    className={`w-full text-left px-6 py-6 border-b-[2px] border-white/10 transition-all relative group ${selected?.id === m.id ? "bg-white/5 translate-x-[2px] translate-y-[2px] border-l-[6px] border-l-accent" : "hover:bg-white/[0.03]"
                      }`}>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`font-black uppercase tracking-tight truncate text-sm italic ${m.read ? "text-white/30" : "text-white"}`}>
                        {m.name || "UNIDENTIFIED SOURCE"}
                      </span>
                      {!m.read && <span className="shrink-0 w-3 h-3 bg-accent shadow-brutalist-accent" />}
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 truncate mt-1 uppercase italic tracking-tighter">{m.subject || m.message?.slice(0, 50) || "(NO SUBJECT)"}</p>
                    <p className="text-[9px] font-black text-white/20 mt-3 uppercase tracking-widest">{formatWhen(m.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat panel */}
          <div className="flex-1 min-w-0 flex flex-col border-[3px] border-white bg-[#111111] shadow-brutalist-white overflow-hidden relative">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-[#0a0a0a]">
                <div className="w-24 h-24 border-[3px] border-white/20 bg-white/5 flex items-center justify-center shadow-brutalist-white-sm mb-6">
                  <Mail className="w-10 h-10 text-white opacity-10" />
                </div>
                <p className="text-white/20 font-black uppercase tracking-[0.2em] text-xs italic">Select record from inbound queue to initiate inspection</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b-[3px] border-white/20 bg-[#161616] shrink-0">
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white uppercase italic tracking-tight">{selected.name}</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <a href={`mailto:${selected.email}`} className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">{selected.email}</a>
                      {selected.conversationId && (
                        <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 tracking-tighter">CID: {selected.conversationId}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" disabled={busyId === selected.id} onClick={() => setDeleteTargetId(selected.id)}
                      className="p-3 border-[2px] border-white bg-[#0a0a0a] text-red-500 hover:bg-red-600 hover:text-white shadow-brutalist-white-sm transition-all active:shadow-none disabled:opacity-50">
                      <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <button type="button" onClick={() => { setSelected(null); setThread([]); }}
                      className="p-3 border-[2px] border-white text-white hover:bg-white hover:text-black transition-all shadow-brutalist-white-sm active:shadow-none bg-[#0a0a0a]">
                      <X className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Thread */}
                <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 bg-[#0a0a0a] scrollbar-custom">
                  {thread.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-8 py-6 border-[2.5px] border-white shadow-brutalist-white-sm relative overflow-hidden ${msg.direction === "outbound"
                        ? "bg-white text-black"
                        : "bg-[#161616] text-white"
                        }`}>
                        {msg.source === "email" && msg.direction !== "outbound" && (
                          <div className="absolute top-0 left-0 right-0 bg-accent text-white text-[8px] font-black uppercase text-center py-0.5 tracking-widest">VIA EMAIL RELAY</div>
                        )}
                        <p className="text-sm font-bold whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                          <div className="mt-6 grid gap-4">
                            {msg.attachments.map((a, i) => (
                              <div key={`${a.url || a.name}-${i}`} className="border-[2px] border-white/20 bg-black/40 p-4 space-y-3">
                                {isImageAttachment(a) && a.url && (
                                  <a href={a.url} target="_blank" rel="noreferrer" className="block border-[2px] border-white shadow-brutalist-white-sm overflow-hidden bg-black/20">
                                    <img src={a.url} alt={a.name} className="max-h-80 w-full object-contain grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
                                  </a>
                                )}
                                <div className="flex items-center justify-between gap-4">
                                  <a href={a.url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase underline tracking-tighter truncate opacity-40 hover:opacity-100">
                                    {a.name || "ATTACHED_FILE_LOG"}
                                  </a>
                                  {a.mimeType && <span className="text-[8px] font-black uppercase opacity-20 shrink-0">{a.mimeType}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <p className={`text-[9px] font-black uppercase tracking-widest mt-6 opacity-30 italic ${msg.direction === "outbound" ? "text-right" : ""}`}>
                          {formatWhen(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-8 py-8 border-t-[3px] border-white/20 bg-[#161616] flex gap-6 items-end shrink-0">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="TRANSMIT RESPONSE…"
                    className="flex-1 px-6 py-5 border-[2.5px] border-white bg-[#0a0a0a] font-black uppercase text-xs tracking-tight text-white outline-none focus:bg-[#050505] shadow-brutalist-white-sm transition-all resize-none placeholder:text-white/10"
                  />
                  <button type="button" onClick={handleReply} disabled={replying || !replyText.trim()}
                    className="p-5 border-[2.5px] border-white bg-white text-black shadow-brutalist-accent active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0">
                    <Send className="w-6 h-6" strokeWidth={3} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-[4px]">
          <div className="w-full max-w-md border-[3px] border-white bg-[#111111] p-10 shadow-brutalist-white-lg">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Purge document record?</h3>
            <p className="text-sm font-bold text-gray-500 mt-6 uppercase leading-relaxed tracking-tighter">Warning: Terminal deletion. Communication history will be erased from central archive.</p>
            <div className="flex justify-end gap-4 mt-12 pt-8 border-t-[2px] border-white/10 border-dashed">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={Boolean(busyId)}
                className="px-8 py-4 border-[2px] border-white bg-transparent text-white text-[11px] font-black uppercase tracking-widest shadow-brutalist-white-sm active:shadow-none hover:bg-white hover:text-black transition-all"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
                disabled={Boolean(busyId)}
                className="px-8 py-4 border-[2px] border-white bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-brutalist-white-sm active:shadow-none transition-all"
              >
                {busyId ? "Purging…" : "Purge Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
