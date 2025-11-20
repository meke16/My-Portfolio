

const API_BASE = "/api";

export async function getPortfolioData() {
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
