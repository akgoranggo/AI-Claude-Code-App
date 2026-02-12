/**
 * API v1 Routes
 *
 * This module provides versioned API routes under /api/v1/ prefix.
 *
 * Usage:
 * When you need to introduce breaking changes, create a new version
 * (e.g., v2/) and keep v1 for backwards compatibility.
 *
 * Example migration path:
 * 1. Current: /api/organizations → works
 * 2. Add: /api/v1/organizations → same as current
 * 3. Later: /api/v2/organizations → new breaking changes
 * 4. Deprecate /api/organizations and /api/v1 after migration period
 */

import { Router, Request, Response, RequestHandler } from "express";
import { storage } from "../../storage";
import { insertOrganizationSchema } from "@shared/schema";
import { z } from "zod";
import {
  handleZodError,
  handleNotFound,
  handleInternalError,
  handleConflict,
  isUniqueConstraintError,
  sendError,
  ErrorCodes,
} from "../../errors";

/**
 * Create the v1 API router
 */
export function createV1Router(requireAuth: RequestHandler): Router {
  const router = Router();

  // ============================================================================
  // AUTH ROUTES
  // ============================================================================

  router.get("/auth/user", (req: Request, res: Response) => {
    const user = req.user as {
      claims?: {
        sub?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
    };

    if (!user?.claims) {
      return sendError(
        res,
        401,
        ErrorCodes.UNAUTHORIZED,
        "Not authenticated",
        undefined,
        req.requestId
      );
    }

    res.json({
      id: user.claims.sub,
      email: user.claims.email,
      firstName: user.claims.first_name,
      lastName: user.claims.last_name,
      profileImageUrl: user.claims.profile_image_url,
    });
  });

  // ============================================================================
  // ORGANIZATION ROUTES
  // ============================================================================

  router.get("/organizations", requireAuth, async (req: Request, res: Response) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      handleInternalError(res, error, req.requestId);
    }
  });

  router.get(
    "/organizations/:id",
    requireAuth,
    async (req: Request<{ id: string }>, res: Response) => {
      try {
        const organization = await storage.getOrganization(req.params.id);
        if (!organization) {
          return handleNotFound(res, "Organization", req.requestId);
        }
        res.json(organization);
      } catch (error) {
        handleInternalError(res, error, req.requestId);
      }
    }
  );

  router.post("/organizations", requireAuth, async (req: Request, res: Response) => {
    try {
      const validated = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(validated);
      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error, req.requestId);
      }
      if (isUniqueConstraintError(error)) {
        return handleConflict(res, "Organization with this name already exists", req.requestId);
      }
      handleInternalError(res, error, req.requestId);
    }
  });

  router.patch(
    "/organizations/:id",
    requireAuth,
    async (req: Request<{ id: string }>, res: Response) => {
      try {
        const validated = insertOrganizationSchema.partial().parse(req.body);
        const organization = await storage.updateOrganization(req.params.id, validated);
        res.json(organization);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return handleZodError(res, error, req.requestId);
        }
        if (error instanceof Error && error.message.includes("not found")) {
          return handleNotFound(res, "Organization", req.requestId);
        }
        if (isUniqueConstraintError(error)) {
          return handleConflict(res, "Organization with this name already exists", req.requestId);
        }
        handleInternalError(res, error, req.requestId);
      }
    }
  );

  // ============================================================================
  // USER ROUTES
  // ============================================================================

  router.get("/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      handleInternalError(res, error, req.requestId);
    }
  });

  router.get("/users/:id", requireAuth, async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return handleNotFound(res, "User", req.requestId);
      }
      res.json(user);
    } catch (error) {
      handleInternalError(res, error, req.requestId);
    }
  });

  return router;
}
