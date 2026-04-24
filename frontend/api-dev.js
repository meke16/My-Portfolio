// Local dev server for api/ functions — run with: node api-dev.js
import "dotenv/config";
import http from "http";
import handler from "./api/send-email.js";

const PORT = 3001;

http
  .createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" });
      return res.end();
    }

    if (req.method === "POST" && req.url === "/api/send-email") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", async () => {
        try { req.body = JSON.parse(body); } catch { req.body = {}; }

        // Wrap raw res to match Vercel's res.status().json() API
        const vRes = Object.assign(res, {
          status(code) { res.statusCode = code; return vRes; },
          json(data) {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(data));
          },
        });

        await handler(req, vRes);
      });
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not found" }));
    }
  })
  .listen(PORT, () => console.log(`API dev server running on http://localhost:${PORT}`));
