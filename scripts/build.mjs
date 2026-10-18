import { mkdir, copyFile, cp, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");
await cp("src", "dist/src", { recursive: true });
console.log(
  "Static build ready in dist/. Use SERVE_DIST=1 npm start for route fallback and the local form mock.",
);
