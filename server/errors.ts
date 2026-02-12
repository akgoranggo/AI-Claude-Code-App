/**
 * Standardized Error Response Module
 *
 * Provides consistent error handling and response formatting across all API endpoints.
 */

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { expressLogger } from "./logger";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

/**
 * Application error codes
 */
export const ErrorCodes = {
  // Client errors (4xx)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  BAD_REQUEST: "BAD_REQUEST",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Send a standardized error response
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
  requestId?: string
): void {
  const errorResponse: ErrorResponse = {
    error: getErrorTitle(statusCode),
    code,
    message,
  };

  if (details !== undefined) {
    errorResponse.details = details;
  }

  if (requestId) {
    errorResponse.requestId = requestId;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Get a human-readable error title from status code
 */
function getErrorTitle(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 409:
      return "Conflict";
    case 422:
      return "Unprocessable Entity";
    case 429:
      return "Too Many Requests";
    case 500:
      return "Internal Server Error";
    case 503:
      return "Service Unavailable";
    default:
      return "Error";
  }
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(res: Response, error: z.ZodError, requestId?: string): void {
  const details = error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));

  sendError(res, 400, ErrorCodes.VALIDATION_ERROR, "Validation failed", details, requestId);
}

/**
 * Handle not found errors
 */
export function handleNotFound(res: Response, resource: string, requestId?: string): void {
  sendError(res, 404, ErrorCodes.NOT_FOUND, `${resource} not found`, undefined, requestId);
}

/**
 * Handle unauthorized errors
 */
export function handleUnauthorized(
  res: Response,
  message = "Authentication required",
  requestId?: string
): void {
  sendError(res, 401, ErrorCodes.UNAUTHORIZED, message, undefined, requestId);
}

/**
 * Handle forbidden errors
 */
export function handleForbidden(
  res: Response,
  message = "Access denied",
  requestId?: string
): void {
  sendError(res, 403, ErrorCodes.FORBIDDEN, message, undefined, requestId);
}

/**
 * Handle conflict errors (e.g., duplicate entries)
 */
export function handleConflict(res: Response, message: string, requestId?: string): void {
  sendError(res, 409, ErrorCodes.CONFLICT, message, undefined, requestId);
}

/**
 * Handle internal server errors
 */
export function handleInternalError(res: Response, error: unknown, requestId?: string): void {
  // Log the actual error for debugging
  expressLogger.error({ error, requestId }, "Internal server error");

  sendError(
    res,
    500,
    ErrorCodes.INTERNAL_ERROR,
    "An unexpected error occurred",
    undefined,
    requestId
  );
}

/**
 * Type guard for PostgreSQL errors
 */
interface PostgresError {
  code: string;
  message?: string;
  detail?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as PostgresError).code === "string"
  );
}

/**
 * Check if an error is a unique constraint violation (PostgreSQL)
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23505";
}

/**
 * Check if an error is a foreign key constraint violation (PostgreSQL)
 */
export function isForeignKeyError(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23503";
}

/**
 * Express error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details, requestId);
    return;
  }

  if (err instanceof z.ZodError) {
    handleZodError(res, err, requestId);
    return;
  }

  // Log unexpected errors
  expressLogger.error({ error: err, requestId }, "Unhandled error");

  sendError(
    res,
    500,
    ErrorCodes.INTERNAL_ERROR,
    "An unexpected error occurred",
    undefined,
    requestId
  );
}
