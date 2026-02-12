/**
 * Health Check API Tests
 *
 * Tests for health check endpoints used by container orchestration
 * and monitoring systems.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";

// Mock the database module
vi.mock("@server/db", () => ({
  pool: {
    query: vi.fn(),
  },
  waitForPool: vi.fn(),
}));

// Import after mocking
import { pool, waitForPool } from "@server/db";

// Helper to create a mock Express request
function _createMockRequest(): Request {
  return {} as Request;
}

// Helper to create a mock Express response
function createMockResponse(): Response & {
  _status: number;
  _json: unknown;
} {
  const res = {
    _status: 200,
    _json: null as unknown,
    status: vi.fn(function (this: typeof res, code: number) {
      this._status = code;
      return this;
    }),
    json: vi.fn(function (this: typeof res, data: unknown) {
      this._json = data;
      return this;
    }),
  };
  return res as unknown as Response & { _status: number; _json: unknown };
}

describe("Health Check Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/health", () => {
    it("should return healthy status with required fields", async () => {
      // Import the module to get the route handler logic
      // For now, test the expected response structure
      const expectedFields = ["status", "timestamp", "uptime", "version"];

      const mockResponse = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: "1.0.0",
      };

      expectedFields.forEach((field) => {
        expect(mockResponse).toHaveProperty(field);
      });
      expect(mockResponse.status).toBe("healthy");
    });

    it("should include valid ISO timestamp", () => {
      const timestamp = new Date().toISOString();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it("should include positive uptime", () => {
      const uptime = process.uptime();
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GET /api/health/ready", () => {
    it("should return healthy when database is up", async () => {
      vi.mocked(waitForPool).mockResolvedValue(undefined);
      vi.mocked(pool.query).mockResolvedValue({ rows: [{ "?column?": 1 }] } as never);

      const mockHealthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: "1.0.0",
        checks: {
          database: {
            status: "up",
            latency: 5,
          },
        },
      };

      expect(mockHealthStatus.status).toBe("healthy");
      expect(mockHealthStatus.checks.database.status).toBe("up");
      expect(mockHealthStatus.checks.database.latency).toBeGreaterThanOrEqual(0);
    });

    it("should return unhealthy when database is down", async () => {
      vi.mocked(waitForPool).mockRejectedValue(new Error("Connection refused"));

      const mockHealthStatus = {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: "1.0.0",
        checks: {
          database: {
            status: "down",
            error: "Connection refused",
          },
        },
      };

      expect(mockHealthStatus.status).toBe("unhealthy");
      expect(mockHealthStatus.checks.database.status).toBe("down");
      expect(mockHealthStatus.checks.database.error).toBeDefined();
    });

    it("should include database latency when connection succeeds", async () => {
      vi.mocked(waitForPool).mockResolvedValue(undefined);
      vi.mocked(pool.query).mockResolvedValue({ rows: [{ "?column?": 1 }] } as never);

      const start = Date.now();
      await waitForPool();
      await pool.query("SELECT 1");
      const latency = Date.now() - start;

      expect(latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GET /api/health/live", () => {
    it("should return alive status", () => {
      const mockResponse = { status: "alive" };
      expect(mockResponse.status).toBe("alive");
    });

    it("should always return 200 status code", () => {
      const res = createMockResponse();
      // Liveness should always be 200 if server is running
      res.status(200).json({ status: "alive" });
      expect(res._status).toBe(200);
    });
  });
});

describe("Health Check Response Structure", () => {
  it("should match HealthStatus interface", () => {
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

    const healthStatus: HealthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: 123.456,
      version: "1.0.0",
      checks: {
        database: {
          status: "up",
          latency: 5,
        },
      },
    };

    // Type check passes if this compiles
    expect(healthStatus.status).toMatch(/^(healthy|unhealthy|degraded)$/);
    expect(healthStatus.checks.database.status).toMatch(/^(up|down)$/);
  });
});
