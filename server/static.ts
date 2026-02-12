/**
 * Static File Serving for Production
 */

import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "./index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  // Serve static files from the dist/public directory
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });

  log(`Serving static files from ${distPath}`);
}
