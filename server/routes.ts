/**
 * API Routes - Express Route Definitions
 *
 * This file demonstrates the Ontology → API pattern:
 * - Object Types → CRUD endpoints (GET, POST, PATCH, DELETE)
 * - Actions → Custom POST endpoints with business logic
 * - Links → Nested resources or junction table endpoints
 *
 * Add your routes following these patterns when defining new Object Types.
 */

import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { expressLogger } from "./logger";
import { registerOpenApiRoutes } from "./openapi";
import { registerAuthRoutes, registerOrganizationRoutes, registerUserRoutes } from "./routes/index";
import { createV1Router } from "./routes/v1/index";

// =============================================================================
// Pagination Constants (exported for use in route modules)
// =============================================================================

/** Default page size for list endpoints */
export const DEFAULT_PAGE_SIZE = 50;
/** Maximum page size allowed */
export const MAX_PAGE_SIZE = 100;

/**
 * Parse and validate pagination parameters.
 * Ensures limit and offset are non-negative integers within bounds.
 *
 * @param limitParam - Raw limit query parameter
 * @param offsetParam - Raw offset query parameter
 * @returns Validated { limit, offset } with safe defaults
 */
export function parsePaginationParams(
  limitParam: string | undefined,
  offsetParam: string | undefined
): { limit: number; offset: number } {
  const parsedLimit = parseInt(limitParam || "", 10);
  const parsedOffset = parseInt(offsetParam || "", 10);

  // Use Math.max to handle NaN (which becomes 0) and negative values
  const limit = Math.min(
    Math.max(isNaN(parsedLimit) ? DEFAULT_PAGE_SIZE : parsedLimit, 1),
    MAX_PAGE_SIZE
  );
  const offset = Math.max(isNaN(parsedOffset) ? 0 : parsedOffset, 0);

  return { limit, offset };
}

// Helper to check if running in Replit
const isReplit = () => !!process.env.REPL_ID;

// Use structured logger (exported for use in route modules)
export const log = (message: string, level: "info" | "error" = "info") => {
  if (level === "error") {
    expressLogger.error(message);
  } else {
    expressLogger.info(message);
  }
};

export async function registerRoutes(_server: Server, app: Express) {
  // ============================================================================
  // API DOCUMENTATION
  // ============================================================================

  // Register OpenAPI/Swagger documentation (no auth required)
  registerOpenApiRoutes(app);

  // ============================================================================
  // AUTHENTICATION SETUP
  // ============================================================================

  if (isReplit()) {
    await setupAuth(app);
  } else {
    // Local dev: Use a simple middleware that sets a mock user
    app.use((req, _res, next) => {
      if (!req.user) {
        req.user = {
          claims: {
            sub: "local-dev-user",
            email: process.env.PGUSER || "developer@example.com",
            first_name: "Local",
            last_name: "Developer",
          },
        };
      }
      next();
    });

    // Local dev: Add mock login/logout routes
    app.get("/api/login", (_req, res) => {
      res.redirect("/");
    });

    app.get("/api/logout", (_req, res) => {
      res.redirect("/");
    });
  }

  // Auth check middleware for protected routes
  const requireAuth: RequestHandler = isReplit() ? isAuthenticated : (_req, _res, next) => next();

  // ============================================================================
  // REGISTER ROUTE MODULES
  // ============================================================================

  // Authentication routes
  registerAuthRoutes(app, requireAuth);

  // Object Type routes (non-versioned, for backwards compatibility)
  registerOrganizationRoutes(app, requireAuth);
  registerUserRoutes(app, requireAuth);

  // Versioned API routes (v1)
  // Use /api/v1/* for versioned endpoints
  app.use("/api/v1", createV1Router(requireAuth));

  // ============================================================================
  // ADD YOUR ROUTES HERE
  // ============================================================================
  //
  // To add new Object Types, create a route module in server/routes/:
  //
  // 1. Create server/routes/myobject.ts
  // 2. Export registerMyObjectRoutes(app, requireAuth)
  // 3. Add to server/routes/index.ts
  // 4. Register here: registerMyObjectRoutes(app, requireAuth)
  //
  // Follow these patterns when adding routes:
  //
  // CRUD Routes (Object Type):
  //   GET    /api/{resources}        - List all
  //   GET    /api/{resources}/:id    - Get one
  //   POST   /api/{resources}        - Create
  //   PATCH  /api/{resources}/:id    - Update
  //   DELETE /api/{resources}/:id    - Delete
  //
  // Action Routes:
  //   POST   /api/{resources}/:id/{action} - Perform action (e.g., /api/items/:id/complete)
  //
  // Link Routes (Many-to-Many):
  //   GET    /api/{resources}/:id/{relation}  - List related (e.g., /api/items/:id/followers)
  //   POST   /api/{resources}/:id/{relation}  - Add relation (e.g., follow an item)
  //   DELETE /api/{resources}/:id/{relation}  - Remove relation (e.g., unfollow)
  //
}
