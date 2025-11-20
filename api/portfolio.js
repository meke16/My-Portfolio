// portfolio.js
import { pool } from "./db.js";

export async function portfolioHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  try {
    const [infoRows] = await pool.query(
      "SELECT * FROM admin_info ORDER BY id DESC LIMIT 1"
    );
    const info = infoRows[0] || null;

    const [skills] = await pool.query("SELECT * FROM skills ORDER BY id ASC");

    const [projects] = await pool.query(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      info,
      skills,
      projects,
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Error fetching portfolio data: " + err.message,
    });
  }
}

export default async function handler(req, res) {
  try {
    const [infoRows] = await pool.execute("SELECT * FROM admin_info ORDER BY id DESC LIMIT 1");
    const [skills] = await pool.execute("SELECT * FROM skills ORDER BY id ASC");
    const [projects] = await pool.execute("SELECT * FROM projects ORDER BY created_at DESC");

    return res.json({ success: true, info: infoRows[0], skills, projects });
  } catch (err) {
    return res.json({ success: false, message: "Error fetching portfolio: " + err.message });
  }
}
