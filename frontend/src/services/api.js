// api.js

// 1. Automatically determine the API URL based on the environment
const API_BASE = import.meta.env.PROD 
  ? "https://portfolio-fpeg.onrender.com/api"  // Used when deployed (Production)
  : "http://localhost:4000/api";               // Used when running locally (Development)

export async function getPortfolioData() {
  // console.log("Fetching from:", API_BASE); // Helpful for debugging
  const res = await fetch(`${API_BASE}/portfolio`);
  if (!res.ok) throw new Error("Failed to load portfolio");
  return res.json();
}

export async function sendContactForm(formData) {
  const plain = Object.fromEntries(formData.entries());

  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plain),
  });

  if (!res.ok) throw new Error("Failed to send contact form");
  return res.json();
}