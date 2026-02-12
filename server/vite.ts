/**
 * Vite Development Server Integration
 */

import type { Express } from "express";
import type { Server } from "http";
import type { ViteDevServer } from "vite";
import { log } from "./index";

export async function setupVite(server: Server, app: Express) {
  const { createServer: createViteServer } = await import("vite");

  const vite: ViteDevServer = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  log("Vite development server attached");
}
