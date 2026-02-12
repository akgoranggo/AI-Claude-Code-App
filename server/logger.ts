/**
 * Structured Logger Module
 *
 * Provides structured JSON logging with pino for production
 * and pretty-printed logs for development.
 */

import pino from "pino";
import pinoHttp from "pino-http";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Create the base logger instance
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
  base: {
    env: process.env.NODE_ENV || "development",
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: string) {
  return logger.child({ context });
}

/**
 * Express middleware logger
 */
export const expressLogger = createLogger("express");

/**
 * Database logger
 */
export const dbLogger = createLogger("database");

/**
 * Auth logger
 */
export const authLogger = createLogger("auth");

/**
 * Log an HTTP request/response
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  requestId?: string,
  responseBody?: unknown
) {
  const logData: Record<string, unknown> = {
    method,
    path,
    statusCode,
    durationMs,
  };

  if (requestId) {
    logData.requestId = requestId;
  }

  // Only log response body in development for debugging
  // Optimize: avoid JSON.stringify if not needed or if it fails
  if (isDevelopment && responseBody) {
    try {
      const bodyString = JSON.stringify(responseBody);
      logData.response = bodyString.length <= 500 ? responseBody : { size: bodyString.length };
    } catch {
      logData.responseSerializationError = true;
    }
  }

  if (statusCode >= 500) {
    expressLogger.error(logData, "Request failed");
  } else if (statusCode >= 400) {
    expressLogger.warn(logData, "Request error");
  } else {
    expressLogger.info(logData, "Request completed");
  }
}

/**
 * HTTP request logger middleware using pino-http
 * Automatically logs all HTTP requests with request ID, duration, and status
 */
export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => !req.url?.startsWith("/api"), // Only log API requests
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "durationMs",
  },
});

export default logger;
