// api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function getPortfolioData() {
  const res = await fetch(`${API_BASE}/portfolio.php`);
  if (!res.ok) throw new Error("Failed to load portfolio");
  return res.json();
}

export async function sendContactForm(formData) {
  const res = await fetch(`${API_BASE}/contact.php`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to send contact form");
  return res.json();
}
