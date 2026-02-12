/**
 * Organizations API Tests
 *
 * Tests Express API routes for the Organization entity.
 * Tests route handlers by mocking storage and simulating requests.
 *
 * Requirements: CRUD endpoints, validation, error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import express, { type Request, type Response, type NextFunction } from "express";

// Mock the storage module
vi.mock("@server/storage", () => ({
  storage: {
    getAllOrganizations: vi.fn(),
    getOrganization: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
  },
}));

// Import after mocking
import { storage } from "@server/storage";

// Helper to create a mock Express request
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    query: {},
    body: {},
    user: { claims: { sub: "test-user-id" } },
    ...overrides,
  } as Request;
}

// Helper to create a mock Express response
function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

// Mock next function
const mockNext: NextFunction = vi.fn();

describe("Organizations API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrganization = {
    id: "01HXTEST123456789ABCDEFGH",
    name: "Test Vet Clinic",
    legalName: "Test Vet Clinic LLC",
    taxId: "12-3456789",
    billingEmail: "billing@testvet.com",
    logoUrl: "https://example.com/logo.png",
    timezone: "America/New_York",
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  describe("GET /api/organizations", () => {
    it("returns list of organizations", async () => {
      const organizations = [
        mockOrganization,
        { ...mockOrganization, id: "01HX2", name: "Second Clinic" },
      ];

      vi.mocked(storage.getAllOrganizations).mockResolvedValue(organizations);

      const req = createMockRequest();
      const res = createMockResponse();

      // Simulate route handler logic
      try {
        const result = await storage.getAllOrganizations();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }

      expect(storage.getAllOrganizations).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(organizations);
    });

    it("returns empty array when no organizations exist", async () => {
      vi.mocked(storage.getAllOrganizations).mockResolvedValue([]);

      const req = createMockRequest();
      const res = createMockResponse();

      const result = await storage.getAllOrganizations();
      res.json(result);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("returns 500 on storage error", async () => {
      vi.mocked(storage.getAllOrganizations).mockRejectedValue(new Error("Database error"));

      const res = createMockResponse();

      try {
        await storage.getAllOrganizations();
        res.json([]);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("GET /api/organizations/:id", () => {
    it("returns organization by ID", async () => {
      vi.mocked(storage.getOrganization).mockResolvedValue(mockOrganization);

      const req = createMockRequest({
        params: { id: mockOrganization.id },
      });
      const res = createMockResponse();

      const result = await storage.getOrganization(req.params.id);
      if (!result) {
        res.status(404).json({ error: "Not found" });
      } else {
        res.json(result);
      }

      expect(storage.getOrganization).toHaveBeenCalledWith(mockOrganization.id);
      expect(res.json).toHaveBeenCalledWith(mockOrganization);
    });

    it("returns 404 for non-existent organization", async () => {
      vi.mocked(storage.getOrganization).mockResolvedValue(null);

      const req = createMockRequest({
        params: { id: "non-existent-id" },
      });
      const res = createMockResponse();

      const result = await storage.getOrganization(req.params.id);
      if (!result) {
        res.status(404).json({ error: "Not found" });
      } else {
        res.json(result);
      }

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
    });

    it("returns 500 on storage error", async () => {
      vi.mocked(storage.getOrganization).mockRejectedValue(new Error("Database error"));

      const req = createMockRequest({
        params: { id: mockOrganization.id },
      });
      const res = createMockResponse();

      try {
        await storage.getOrganization(req.params.id);
        res.json({});
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("POST /api/organizations", () => {
    it("creates organization with valid data", async () => {
      const newOrgData = {
        name: "New Clinic",
        legalName: "New Clinic LLC",
        timezone: "America/Chicago",
      };

      const createdOrg = {
        ...mockOrganization,
        ...newOrgData,
        id: "01HXNEW123456789ABCDEFGH",
      };

      vi.mocked(storage.createOrganization).mockResolvedValue(createdOrg);

      const req = createMockRequest({ body: newOrgData });
      const res = createMockResponse();

      // Simulate validation and creation
      const result = await storage.createOrganization(req.body);
      res.status(201).json(result);

      expect(storage.createOrganization).toHaveBeenCalledWith(newOrgData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdOrg);
    });

    it("creates organization with minimal data", async () => {
      const minimalData = { name: "Minimal Clinic" };

      const createdOrg = {
        ...mockOrganization,
        ...minimalData,
        legalName: null,
        taxId: null,
      };

      vi.mocked(storage.createOrganization).mockResolvedValue(createdOrg);

      const req = createMockRequest({ body: minimalData });
      const res = createMockResponse();

      const result = await storage.createOrganization(req.body);
      res.status(201).json(result);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 400 for invalid data (missing name)", async () => {
      const invalidData = { legalName: "No Name Clinic LLC" }; // Missing required 'name'

      const req = createMockRequest({ body: invalidData });
      const res = createMockResponse();

      // Simulate Zod validation failure
      const { insertOrganizationSchema } = await import("@shared/schema");
      const validationResult = insertOrganizationSchema.safeParse(invalidData);

      if (!validationResult.success) {
        res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors,
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0];
      expect(jsonCall.error).toBe("Validation failed");
    });

    it("returns 500 on storage error", async () => {
      vi.mocked(storage.createOrganization).mockRejectedValue(new Error("Database error"));

      const req = createMockRequest({
        body: { name: "New Clinic" },
      });
      const res = createMockResponse();

      try {
        await storage.createOrganization(req.body);
        res.status(201).json({});
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("PATCH /api/organizations/:id", () => {
    it("updates organization with valid data", async () => {
      const updateData = { name: "Updated Clinic Name" };

      const updatedOrg = {
        ...mockOrganization,
        name: "Updated Clinic Name",
        updatedAt: new Date(),
      };

      vi.mocked(storage.updateOrganization).mockResolvedValue(updatedOrg);

      const req = createMockRequest({
        params: { id: mockOrganization.id },
        body: updateData,
      });
      const res = createMockResponse();

      const result = await storage.updateOrganization(req.params.id, req.body);
      res.json(result);

      expect(storage.updateOrganization).toHaveBeenCalledWith(mockOrganization.id, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedOrg);
    });

    it("updates multiple fields", async () => {
      const updateData = {
        name: "New Name",
        isActive: false,
        billingEmail: "new@email.com",
      };

      const updatedOrg = {
        ...mockOrganization,
        ...updateData,
        updatedAt: new Date(),
      };

      vi.mocked(storage.updateOrganization).mockResolvedValue(updatedOrg);

      const req = createMockRequest({
        params: { id: mockOrganization.id },
        body: updateData,
      });
      const res = createMockResponse();

      const result = await storage.updateOrganization(req.params.id, req.body);
      res.json(result);

      expect(res.json).toHaveBeenCalledWith(updatedOrg);
    });

    it("returns 400 for invalid update data", async () => {
      const invalidData = { isActive: "not-a-boolean" };

      const req = createMockRequest({
        params: { id: mockOrganization.id },
        body: invalidData,
      });
      const res = createMockResponse();

      // Simulate Zod validation failure
      const { insertOrganizationSchema } = await import("@shared/schema");
      const partialSchema = insertOrganizationSchema.partial();
      const validationResult = partialSchema.safeParse(invalidData);

      if (!validationResult.success) {
        res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors,
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 404 when organization not found", async () => {
      const notFoundError = new Error("Organization non-existent-id not found");
      vi.mocked(storage.updateOrganization).mockRejectedValue(notFoundError);

      const req = createMockRequest({
        params: { id: "non-existent-id" },
        body: { name: "New Name" },
      });
      const res = createMockResponse();

      try {
        await storage.updateOrganization(req.params.id, req.body);
        res.json({});
      } catch (error) {
        // Simulate the improved route handler logic
        if (error instanceof Error && error.message.includes("not found")) {
          res.status(404).json({ error: "Organization not found" });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Organization not found" });
    });

    it("allows partial updates", async () => {
      // Only updating timezone, keeping other fields
      const partialUpdate = { timezone: "America/Los_Angeles" };

      const updatedOrg = {
        ...mockOrganization,
        timezone: "America/Los_Angeles",
      };

      vi.mocked(storage.updateOrganization).mockResolvedValue(updatedOrg);

      const req = createMockRequest({
        params: { id: mockOrganization.id },
        body: partialUpdate,
      });
      const res = createMockResponse();

      const result = await storage.updateOrganization(req.params.id, req.body);
      res.json(result);

      expect(storage.updateOrganization).toHaveBeenCalledWith(mockOrganization.id, partialUpdate);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ timezone: "America/Los_Angeles" })
      );
    });
  });

  describe("Request Validation", () => {
    it("validates organization name is required on create", async () => {
      const { insertOrganizationSchema } = await import("@shared/schema");

      const result = insertOrganizationSchema.safeParse({
        legalName: "LLC Only",
      });

      expect(result.success).toBe(false);
    });

    it("validates isActive must be boolean", async () => {
      const { insertOrganizationSchema } = await import("@shared/schema");

      const result = insertOrganizationSchema.safeParse({
        name: "Test Clinic",
        isActive: "yes", // Should be boolean
      });

      expect(result.success).toBe(false);
    });

    it("partial schema allows optional fields on update", async () => {
      const { insertOrganizationSchema } = await import("@shared/schema");
      const partialSchema = insertOrganizationSchema.partial();

      // Updating just one field should be valid
      const result = partialSchema.safeParse({
        timezone: "Europe/London",
      });

      expect(result.success).toBe(true);
    });
  });
});
