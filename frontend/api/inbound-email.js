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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Optional shared secret to verify requests come from your n8n instance
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (secret && req.headers["x-webhook-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { from, subject, text, html } = req.body || {};

  // Debug: log exactly what n8n sent
  console.log("inbound-email body:", JSON.stringify({ from, subject, text: text?.slice(0, 100) }));
  console.log("full body keys:", Object.keys(req.body || {}));

  const conversationId = extractCid(subject);
  console.log("extracted CID:", conversationId, "from subject:", subject);

  // temporarily skip validation to debug
  // if (!from || (!text && !html)) return res.status(400).json({ error: "Missing fields" });
  if (!conversationId) {
    // No CID found — not a reply to a known conversation, ignore
    return res.status(200).json({ ok: true, skipped: "no CID in subject" });
  }

  const body = text || html?.replace(/<[^>]+>/g, " ").trim();
  // Strip quoted reply text (lines starting with ">")
  const cleanBody = body.split("\n").filter((l) => !l.startsWith(">")).join("\n").trim();

  try {
    const db = getDb();
    await db.collection("messages").add({
      conversationId,
      direction: "inbound",
      source: "email",
      fromEmail: from,
      email: from,
      subject: subject || "",
      message: cleanBody,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ ok: true, conversationId });
  } catch (err) {
    console.error("inbound-email error:", err);
    return res.status(500).json({ error: "Failed to save" });
  }
}
