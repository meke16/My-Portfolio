// portfolio.js
import { pool } from "./db.js";

export async function portfolioHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  try {
    const infoResult = await pool.query(
      "SELECT * FROM admin_info ORDER BY id DESC LIMIT 1"
    );
    const skillsResult = await pool.query(
      "SELECT * FROM skills ORDER BY id ASC"
    );
    const projectsResult = await pool.query(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      info: infoResult.rows[0] || null,
      skills: skillsResult.rows,
      projects: projectsResult.rows
    });

  } catch (err) {
    res.json({
      success: false,
      message: "Error fetching portfolio data: " + err.message,
    });
  }
}
