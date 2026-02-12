import express, { type Request, Response, NextFunction } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { registerHealthRoutes } from "./health";
import { serveStatic } from "./static";
import { createServer } from "http";
import { closeDatabase } from "./db";
import { expressLogger, httpLogger } from "./logger";
import { errorHandler } from "./errors";
import { randomUUID } from "crypto";

const app = express();
const httpServer = createServer(app);

// Track server state for graceful shutdown
let isShuttingDown = false;

// Type augmentations are in server/types.d.ts

// CORS configuration
// IMPORTANT: Set CORS_ORIGIN in production to your frontend URL (e.g., https://yourapp.com)
// Fail loudly in production if CORS_ORIGIN is not configured to prevent security vulnerabilities
const corsOrigin = process.env.CORS_ORIGIN;

if (process.env.NODE_ENV === "production" && !corsOrigin) {
  throw new Error(
    "CORS_ORIGIN environment variable must be set in production. " +
      "Allowing all origins with credentials is a security vulnerability."
  );
}

const corsOptions = {
  origin: corsOrigin || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : false),
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// CSP nonce generation middleware
app.use((_req, res, next) => {
  res.locals.cspNonce = randomUUID();
  next();
});

// Security headers middleware with CSP nonces
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Required for shadcn/ui and CSS-in-JS
        scriptSrc: [
          "'self'",
          // Allow scripts with nonce for inline scripts
          (_req: IncomingMessage, res: ServerResponse) =>
            `'nonce-${(res as Response).locals.cspNonce}'`,
        ],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting middleware
// Configurable via environment variables for different deployment environments
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // Default: 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10), // Default: 100 req/window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", apiLimiter);

// Body parsing middleware with size limits
app.use(
  express.json({
    limit: "1mb", // Prevent large payload attacks
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Legacy logging utility (for backwards compatibility)
export function log(message: string, source = "express") {
  if (source === "error") {
    expressLogger.error(message);
  } else {
    expressLogger.info({ source }, message);
  }
}

// Constants for request ID validation
const MAX_REQUEST_ID_LENGTH = 128;

/**
 * Sanitize request ID to prevent header injection attacks.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Returns null if the ID is invalid or too long.
 */
function sanitizeRequestId(id: string | undefined): string | null {
  if (!id) return null;
  // Limit length and only allow safe characters (UUID format + common ID formats)
  const sanitized = id.slice(0, MAX_REQUEST_ID_LENGTH);
  // Only allow alphanumeric, hyphens, underscores, and periods
  if (!/^[a-zA-Z0-9._-]+$/.test(sanitized)) {
    return null;
  }
  return sanitized;
}

// Request ID middleware (must run before httpLogger to set req.id)
app.use((req, res, next) => {
  // Generate or use existing request ID (sanitized to prevent header injection)
  const providedId = sanitizeRequestId(req.headers["x-request-id"] as string);
  const requestId = providedId || randomUUID();
  req.requestId = requestId;
  req.id = requestId; // pino-http uses req.id for request tracking
  res.setHeader("x-request-id", requestId);
  next();
});

// HTTP request logging middleware using pino-http
app.use(httpLogger);

(async () => {
  // Register health check routes first (no auth required)
  // Pass function to check shutdown status
  registerHealthRoutes(app, () => isShuttingDown);

  // Graceful shutdown middleware - reject new requests during shutdown
  app.use((_req, res, next) => {
    if (isShuttingDown) {
      res.set("Connection", "close");
      return res.status(503).json({
        error: "Service unavailable",
        code: "SERVICE_SHUTTING_DOWN",
        message: "Server is shutting down",
      });
    }
    next();
  });

  await registerRoutes(httpServer, app);

  // Error handling middleware (using standardized error handler)
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  // Setup static serving in production, Vite dev server in development
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  // Use 127.0.0.1 on Windows (0.0.0.0 with reusePort causes ENOTSUP)
  const host = process.platform === "win32" ? "127.0.0.1" : "0.0.0.0";
  httpServer.listen(port, host, () => {
    log(`🚀 Server running on http://${host}:${port}`);
  });

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string) => {
    log(`${signal} received. Starting graceful shutdown...`);
    isShuttingDown = true;

    // Stop accepting new connections
    httpServer.close(async () => {
      log("HTTP server closed");

      try {
        // Close database connections
        await closeDatabase();
        log("Database connections closed");
        process.exit(0);
      } catch (error) {
        log(`Error during shutdown: ${error}`, "error");
        process.exit(1);
      }
    });

    // Force shutdown after timeout (30 seconds)
    setTimeout(() => {
      log("Forcing shutdown after timeout", "error");
      process.exit(1);
    }, 30000);
  };

  // Register shutdown handlers
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();
