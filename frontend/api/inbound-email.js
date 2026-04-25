// n8n webhook target — POST /api/inbound-email
// n8n workflow: Gmail/IMAP trigger → HTTP Request node → this endpoint
//
// Expected body from n8n:
// { from, to, subject, text, html }
// n8n extracts these from the raw email node automatically.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

// Extract [CID:xxxxxxxx] from subject line
function extractCid(subject = "") {
  const m = subject.match(/\[CID:([a-z0-9]+)\]/i);
  return m ? m[1] : null;
}

function toTextFromHtml(html = "") {
  return String(html)
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n")
    .replace(/<\s*li\b[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function decodeQuotedPrintable(input = "") {
  if (!input) return "";
  const noSoftBreaks = input
    // Soft line breaks in quoted-printable: "=\n" or "=\r\n"
    .replace(/=\r?\n/g, "")
    // Keep literal equals signs encoded as =3D
    .replace(/=3D/gi, "=");

  return noSoftBreaks.replace(/=([0-9A-F]{2})/gi, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return _;
    }
  });
}

function stripQuotedHistory(raw = "") {
  const lines = String(raw).replace(/\r\n?/g, "\n").split("\n");
  const out = [];

  for (const line of lines) {
    const l = line.trim();

    // Stop when previous thread headers start.
    if (
      /^On\s.+wrote:\s*$/i.test(l) ||
      /^From:\s/i.test(l) ||
      /^Sent:\s/i.test(l) ||
      /^To:\s/i.test(l) ||
      /^Subject:\s/i.test(l) ||
      /^-{2,}\s*Original Message\s*-{2,}$/i.test(l)
    ) {
      break;
    }

    // Ignore quoted lines from previous messages.
    if (/^>+\s?/.test(l)) continue;

    out.push(line);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeAttachments(body = {}) {
  const raw = body.attachments || body.attachment || body.files || [];
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((a) => {
      if (!a || typeof a !== "object") return null;

      const name = a.fileName || a.filename || a.name || "attachment";
      const mimeType = a.mimeType || a.contentType || a.type || "application/octet-stream";
      const size = Number(a.size || a.fileSize || a.bytes || 0) || null;
      const url = a.url || a.downloadUrl || a.link || "";
      const contentId = a.contentId || a.cid || "";

      // If n8n sends base64 data, keep a small data URL for preview/download.
      const base64 = typeof a.data === "string" ? a.data.trim() : "";
      const smallDataUrl = base64 && base64.length <= 200000
        ? `data:${mimeType};base64,${base64}`
        : "";

      return {
        name,
        mimeType,
        size,
        url: url || smallDataUrl,
        contentId,
      };
    })
    .filter(Boolean)
    .filter((a) => a.url || a.name || a.contentId);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Optional shared secret to verify requests come from your n8n instance
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (secret && req.headers["x-webhook-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const from = req.body?.from || req.body?.From || "";
  const subject = req.body?.subject || req.body?.Subject || "";
  const text = req.body?.text || req.body?.Text || "";
  const html = req.body?.html || req.body?.Html || "";
  const attachments = normalizeAttachments(req.body || {});

  if (!from || (!text && !html && attachments.length === 0)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const conversationId = extractCid(subject);
  console.log("CID:", conversationId, "| subject:", subject?.slice(0, 80));

  if (!conversationId) {
    return res.status(200).json({ ok: true, skipped: "no CID in subject" });
  }

  const rawBody = text || toTextFromHtml(html);
  const decodedBody = decodeQuotedPrintable(rawBody);
  const cleanBody = stripQuotedHistory(decodedBody);

  if (!cleanBody && attachments.length === 0) {
    return res.status(200).json({ ok: true, skipped: "empty clean body" });
  }

  try {
    const db = getDb();
    await db.collection("messages").add({
      conversationId,
      direction: "inbound",
      source: "email",
      fromEmail: from,
      email: from,
      subject: subject || "",
      message: cleanBody || "(attachment)",
      attachments,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log("saved to Firestore OK, conversationId:", conversationId);
    return res.status(200).json({ ok: true, conversationId });
  } catch (err) {
    console.error("inbound-email error:", err);
    return res.status(500).json({ error: "Failed to save" });
  }
}
