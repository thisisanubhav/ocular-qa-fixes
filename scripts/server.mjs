import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { validateContact } from "../src/core.js";
const root = resolve(process.env.SERVE_DIST === "1" ? "dist" : ".");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/contact") {
      res.setHeader("Content-Type", "application/json");
      if (req.method !== "POST") {
        res.writeHead(405, { Allow: "POST" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 65536) {
          res.writeHead(413);
          res.end(JSON.stringify({ error: "Request too large" }));
          return;
        }
      }
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }
      if (
        !payload ||
        typeof payload !== "object" ||
        [
          "firstName",
          "lastName",
          "email",
          "jobTitle",
          "company",
          "companyType",
          "subject",
          "otherInterest",
          "otherUseCase",
        ].some(
          (k) => payload[k] !== undefined && typeof payload[k] !== "string",
        ) ||
        !Array.isArray(payload.interests) ||
        !Array.isArray(payload.useCases)
      ) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid payload" }));
        return;
      }
      const errors = validateContact(payload);
      if (Object.keys(errors).length) {
        res.writeHead(422);
        res.end(JSON.stringify({ errors }));
        return;
      }
      // Deliberately no email, persistence, or outbound connection. This is a local mock.
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, mode: "mock", received: payload }));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    let file = resolve(root, "." + pathname);
    if (!file.startsWith(root + sep) && file !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    // Only expose application files and the review evidence, never Git or local scripts.
    if (
      !(
        pathname.startsWith("/src/") ||
        pathname.startsWith("/evidence/") ||
        pathname === "/index.html"
      ) &&
      extname(pathname)
    ) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    if (pathname.split("/").some((part) => part.startsWith("."))) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    try {
      if (!(await stat(file)).isFile()) file = resolve(root, "index.html");
    } catch {
      if (extname(pathname)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      file = resolve(root, "index.html");
    }
    const content = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch {
    res.writeHead(500);
    res.end("Unable to serve this request.");
  }
});
const port = Number(process.env.PORT) || 3000;
server.listen(port, "127.0.0.1", () =>
  console.log(`Ocular local preview: http://localhost:${port}`),
);
