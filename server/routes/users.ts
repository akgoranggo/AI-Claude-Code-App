/**
 * User Routes
 *
 * CRUD endpoints for the User object type.
 */

import type { Express, Request, Response, RequestHandler } from "express";
import { storage } from "../storage";
import { handleNotFound, handleInternalError } from "../errors";

/**
 * Register user routes
 */
export function registerUserRoutes(app: Express, requireAuth: RequestHandler): void {
  /**
   * GET /api/users
   * List all users
   */
  app.get("/api/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      handleInternalError(res, error, req.requestId);
    }
  });

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  app.get("/api/users/:id", requireAuth, async (req: Request<{ id: string }>, res: Response) => {
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
}
