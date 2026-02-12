/**
 * Organization Routes
 *
 * CRUD endpoints for the Organization object type.
 */

import type { Express, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertOrganizationSchema } from "@shared/schema";
import {
  handleZodError,
  handleNotFound,
  handleInternalError,
  handleConflict,
  isUniqueConstraintError,
} from "../errors";

/**
 * Register organization routes
 */
export function registerOrganizationRoutes(app: Express, requireAuth: RequestHandler): void {
  /**
   * GET /api/organizations
   * List all organizations
   */
  app.get("/api/organizations", requireAuth, async (req: Request, res: Response) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      handleInternalError(res, error, req.requestId);
    }
  });

  /**
   * GET /api/organizations/:id
   * Get organization by ID
   */
  app.get(
    "/api/organizations/:id",
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

  /**
   * POST /api/organizations
   * Create organization
   */
  app.post("/api/organizations", requireAuth, async (req: Request, res: Response) => {
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

  /**
   * PATCH /api/organizations/:id
   * Update organization
   */
  app.patch(
    "/api/organizations/:id",
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

  /**
   * DELETE /api/organizations/:id
   * Soft delete an organization
   */
  app.delete(
    "/api/organizations/:id",
    requireAuth,
    async (req: Request<{ id: string }>, res: Response) => {
      try {
        // Soft delete: set isActive to false and record deletion timestamp
        const organization = await storage.updateOrganization(req.params.id, {
          isActive: false,
          deletedAt: new Date(),
        });
        res.json(organization);
      } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
          return handleNotFound(res, "Organization", req.requestId);
        }
        handleInternalError(res, error, req.requestId);
      }
    }
  );
}
