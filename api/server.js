// server.js
import http from 'http';
import { contactHandler } from './api/contact.js';
import { portfolioHandler } from './api/portfolio.js';

const server = http.createServer(async (req, res) => {
  // CORS: Allow your frontend (you will update this URL later)
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
     res.writeHead(200);
     res.end();
     return;
  }

  if (url.pathname === '/api/contact') {
    return contactHandler(req, res);
  }

  if (url.pathname === '/api/portfolio') {
    return portfolioHandler(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
});

// Render assigns a port automatically via process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});