// contact.js
import { pool } from "./db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Invalid request" });

  const { name = "", email = "", subject = "", message = "" } = req.body;

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.json({ success: false, message: "Please fill all required fields" });
  }

  try {
    await pool.execute(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );
    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    return res.json({ success: false, message: "Error sending message: " + err.message });
  }
}
