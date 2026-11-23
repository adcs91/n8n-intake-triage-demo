// Mock of the Gumroad sales API + an Airtable-like upsert endpoint.
// Purpose: exercise cursor pagination, a 429 with Retry-After, and idempotent writes
// before any real token exists. No dependencies.
const http = require("node:http");
const fs = require("node:fs");
const LOG = "C:/Users/33540/ego/jie-dan-20261123-1345/mock-calls.log";

const sales = [];
for (let i = 1; i <= 7; i++) {
  sales.push({
    id: "sale_" + String(1000 + i),
    email: "buyer" + i + "@example.com",
    product_id: "prod_demo",
    product_name: "Template pack",
    price: (i * 500),
    currency: "usd",
    created_at: "2026-11-2" + (i % 9) + "T0" + (i % 9) + ":12:00Z",
  });
}
// two duplicate rows on purpose: same sale id delivered twice by the cursor
sales.push({ ...sales[0] });
sales.push({ ...sales[3] });

const store = new Map();
let call = 0;

function log(line) {
  fs.appendFileSync(LOG, new Date().toISOString() + " " + line + "\n");
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:7071");
  if (url.pathname === "/v2/sales") {
    call++;
    log("GET /v2/sales call=" + call + " page_key=" + (url.searchParams.get("page_key") || "-"));
    if (call === 1) {
      res.writeHead(429, { "content-type": "application/json", "retry-after": "1" });
      return res.end(JSON.stringify({ success: false, message: "rate limited" }));
    }
    const pageKey = url.searchParams.get("page_key") || "";
    if (pageKey === "") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ success: true, sales: sales.slice(0, 5), next_page_key: "page2" }));
    }
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ success: true, sales: sales.slice(5), next_page_key: null }));
  }
  if (url.pathname === "/airtable/upsert" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let rows = [];
      try { rows = JSON.parse(body).records || []; } catch { /* ignore */ }
      let inserted = 0, updated = 0;
      for (const r of rows) {
        if (store.has(r.sale_id)) updated++; else { store.set(r.sale_id, r); inserted++; }
      }
      log("POST /airtable/upsert in=" + rows.length + " inserted=" + inserted + " updated=" + updated + " total=" + store.size);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ inserted, updated, total: store.size }));
    });
    return;
  }
  if (url.pathname === "/state") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ records: [...store.values()], total: store.size }));
  }
  res.writeHead(404); res.end("not found");
});

server.listen(7071, "127.0.0.1", () => console.log("mock listening on 7071"));
