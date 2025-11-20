import express from "express";
import dotenv from "dotenv";
import { contactHandler } from "./api/contact.js";
import { portfolioHandler } from "./api/portfolio.js";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for all origins
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200); // preflight
  next();
});

// Routes
app.post("/api/contact", contactHandler);
app.get("/api/portfolio", portfolioHandler);

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
