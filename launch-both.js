import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local first, then .env (local overrides defaults)
dotenv.config({ path: ".env.local" });
dotenv.config();

// Configuration
const config = {
  expressPort: process.env.PORT || "5000",
  vitePort: "3000",
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  databaseUrl: process.env.DATABASE_URL,
};

// Verify required environment variables
// DATABASE_URL is only required if not using Lakebase (USE_LAKEBASE=true)
if (!config.databaseUrl && process.env.USE_LAKEBASE !== "true") {
  console.error("❌ ERROR: DATABASE_URL is not set");
  console.error(
    "Please create a .env.local file with DATABASE_URL=your-postgres-connection-string"
  );
  console.error("Or set USE_LAKEBASE=true with LAKEBASE_HOSTNAME and LAKEBASE_DATABASE");
  process.exit(1);
}

console.log("🚀 Starting Development Servers...");
console.log(`📦 Express API will run on port ${config.expressPort}`);
console.log(`⚡ Vite dev server will run on port ${config.vitePort}`);

// Start Vite standalone on port 3000
console.log("🚀 Starting Vite dev server...");

const vite = spawn("npx", ["vite", "--port", config.vitePort], {
  cwd: __dirname,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "development",
  },
  shell: true,
});

// Wait for Vite to start, then start Express
setTimeout(() => {
  console.log("🚀 Starting Express API server...");

  // Start Express API server (no Vite middleware)
  const express = spawn("npx", ["tsx", "server/index.ts"], {
    cwd: __dirname,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      SESSION_SECRET: config.sessionSecret,
      DATABASE_URL: config.databaseUrl,
      PORT: config.expressPort,
    },
    shell: true,
  });

  // Handle termination
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down servers...");
    vite.kill();
    express.kill();
    process.exit();
  });

  express.on("exit", (code) => {
    console.log(`Express server exited with code ${code}`);
    vite.kill();
    process.exit(code || 0);
  });

  vite.on("exit", (code) => {
    console.log(`Vite server exited with code ${code}`);
  });
}, 3000); // Wait 3 seconds for Vite to start
