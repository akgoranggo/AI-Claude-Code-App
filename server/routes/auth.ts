/**
 * Authentication Routes
 *
 * Handles user authentication, session management, and user info endpoints.
 */

import type { Express, Request, Response, RequestHandler } from "express";
import { sendError, ErrorCodes } from "../errors";

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express, _requireAuth: RequestHandler): void {
  /**
   * GET /api/auth/user
   * Get the currently authenticated user
   */
  app.get("/api/auth/user", (req: Request, res: Response) => {
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
}
