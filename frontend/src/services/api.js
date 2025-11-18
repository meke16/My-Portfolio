// api.js
// const API_BASE = import.meta.env.VITE_API_URL || "http://cher-portfolio.test/api";

const API_BASE = "/api";

export async function getPortfolioData() {
  const res = await fetch(`${API_BASE}/portfolio`);
  if (!res.ok) throw new Error("Failed to load portfolio");
  return res.json();
}

export async function sendContactForm(formData) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to send contact form");
  return res.json();
}