import { pool } from "./db.js";

// FIX 1: Removed 'default' to allow 'import { contactHandler }' in server.js
export async function contactHandler(req, res) {
  
  // Handle CORS preflight
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
    // FIX 2: PostgreSQL Syntax Changes
    // 1. Changed .execute() to .query() (standard for 'pg' library)
    // 2. Changed placeholders from '?' to '$1, $2, $3, $4'
    const queryText = "INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)";
    
    await pool.query(queryText, [name, email, subject, message]);

    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error(err); // Good practice to log the actual error on the server console
    return res.json({ success: false, message: "Error sending message: " + err.message });
  }
}