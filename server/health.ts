/**
 * Health Check Module
 *
 * Provides endpoints for monitoring application health and readiness.
 * - /api/health - Basic liveness check
 * - /api/health/ready - Readiness check including database connectivity
 */

import type { Express, Request, Response } from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { pool, waitForPool } from "./db";

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Read version from package.json at runtime
 * This works in both development and production builds
 */
function getPackageVersion(): string {
  // Prefer environment variable (set in Docker build)
  if (process.env.APP_VERSION) {
    return process.env.APP_VERSION;
  }

  // Fallback to reading package.json
  try {
    // In production (Docker), package.json is at /app/package.json (process.cwd())
    // In development, we're in server/ and package.json is one level up
    const pkgPath =
      process.env.NODE_ENV === "production"
        ? join(process.cwd(), "package.json")
        : join(__dirname, "..", "package.json");

    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version?: string };
    return pkg.version || "unknown";
  } catch (error) {
    console.warn("[Health] Could not read package version:", error);
    return "unknown";
  }
}

const APP_VERSION = getPackageVersion();

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: "up" | "down";
      latency?: number;
      error?: string;
    };
  };
}

/**
 * Check database connectivity by executing a simple query
 */
async function checkDatabase(): Promise<{
  status: "up" | "down";
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await waitForPool();
    await pool.query("SELECT 1");
    return {
      status: "up",
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Register health check routes
 * @param app Express application
 * @param getShuttingDownStatus Optional function to check if server is shutting down
 */
export function registerHealthRoutes(app: Express, getShuttingDownStatus?: () => boolean): void {
  /**
   * GET /api/health
   * Basic liveness probe - returns 503 if server is shutting down, 200 otherwise
   */
  app.get("/api/health", (_req: Request, res: Response) => {
    if (getShuttingDownStatus && getShuttingDownStatus()) {
      return res.status(503).json({
        status: "shutting_down",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    });
  });

  /**
   * GET /api/health/ready
   * Readiness probe - checks all dependencies including database
   */
  app.get("/api/health/ready", async (_req: Request, res: Response) => {
    if (getShuttingDownStatus && getShuttingDownStatus()) {
      return res.status(503).json({
        status: "shutting_down",
        timestamp: new Date().toISOString(),
      });
    }

    const dbCheck = await checkDatabase();

    // Don't expose error details in production for security
    const isDevelopment = process.env.NODE_ENV === "development";
    const sanitizedDbCheck = {
      status: dbCheck.status,
      ...(isDevelopment && {
        latency: dbCheck.latency,
        error: dbCheck.error,
      }),
    };

    const healthStatus: HealthStatus = {
      status: dbCheck.status === "up" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
      checks: {
        database: sanitizedDbCheck,
      },
    };

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  });

  /**
   * GET /api/health/live
   * Kubernetes-style liveness probe
   */
  app.get("/api/health/live", (_req: Request, res: Response) => {
    res.status(200).json({ status: "alive" });
  });
}
