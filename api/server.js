import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Optional: clearer than manual headers
import { contactHandler } from "./contact.js";
import { portfolioHandler } from "./portfolio.js";

dotenv.config();

const app = express();

// 1. Parse JSON bodies (Essential for contact form)
app.use(express.json());

// 2. Global CORS Middleware
// This replaces the manual headers and handles preflight (OPTIONS) automatically
app.use(cors({
  origin: "*", // In production, replace '*' with your frontend URL (e.g., 'https://my-portfolio.onrender.com')
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Routes
// Express checks the method (GET vs POST) for you, so you don't need checks inside the handlers!
app.post("/api/contact", contactHandler);
app.get("/api/portfolio", portfolioHandler);

// 4. Root Route (Optional but good for checking if server is alive)
app.get("/", (req, res) => {
  res.send("Portfolio API is running...");
});

// CRITICAL FIX: Use process.env.PORT for Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});