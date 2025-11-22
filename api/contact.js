import { pool } from "./db.js"; // Ensure path is correct relative to backend folder

export async function contactHandler(req, res) {
  // Express handles req.body parsing automatically now
  const { name = "", email = "", subject = "", message = "" } = req.body;

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ success: false, message: "Please fill all required fields" });
  }

  try {
    const queryText = "INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)";
    await pool.query(queryText, [name, email, subject, message]);

    return res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact Error:", err);
    return res.status(500).json({ success: false, message: "Error sending message" });
  }
}