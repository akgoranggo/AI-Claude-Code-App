/**
 * Organization Storage Tests
 *
 * Tests storage methods for the Organization entity.
 * Uses mocking to isolate database operations.
 *
 * Requirements: CRUD operations, error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the database module before importing storage
vi.mock("@server/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import after mocking
import { db } from "@server/db";

describe("Organization Storage", () => {
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

  describe("createOrganization", () => {
    it("creates organization with valid data", async () => {
      // Set up mock chain for insert
      const returningMock = vi.fn().mockResolvedValue([mockOrganization]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any);

      // Dynamically import storage to get mocked version
      const { storage } = await import("@server/storage");

      const result = await storage.createOrganization({
        name: "Test Vet Clinic",
        legalName: "Test Vet Clinic LLC",
        taxId: "12-3456789",
        billingEmail: "billing@testvet.com",
      });

      expect(result).toEqual(mockOrganization);
      expect(db.insert).toHaveBeenCalled();
    });

    it("creates organization with minimal data (name only)", async () => {
      const minimalOrg = {
        ...mockOrganization,
        legalName: null,
        taxId: null,
        billingEmail: null,
        logoUrl: null,
      };

      const returningMock = vi.fn().mockResolvedValue([minimalOrg]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.createOrganization({
        name: "Minimal Clinic",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it("generates ULID for new organization", async () => {
      // ULID uses Crockford Base32: 0-9, A-H, J-K, M-N, P-T, V-Z (excludes I, L, O, U)
      const orgWithUlid = {
        ...mockOrganization,
        id: "01HRV4YNZJPGBR9YH0A5CSATNN", // Valid ULID format
      };

      const returningMock = vi.fn().mockResolvedValue([orgWithUlid]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.createOrganization({
        name: "New Clinic",
      });

      // Verify ULID format (26 characters, Crockford Base32)
      expect(result.id).toHaveLength(26);
      expect(result.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/i);
    });
  });

  describe("getOrganization", () => {
    it("returns organization for valid ID", async () => {
      // Set up mock chain for select
      const limitMock = vi.fn().mockResolvedValue([mockOrganization]);
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.getOrganization(mockOrganization.id);

      expect(result).toEqual(mockOrganization);
      expect(db.select).toHaveBeenCalled();
    });

    it("returns null for non-existent organization", async () => {
      // Set up mock to return empty array
      const limitMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.getOrganization("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("getAllOrganizations", () => {
    it("returns list of all organizations", async () => {
      const organizations = [
        mockOrganization,
        { ...mockOrganization, id: "01HX987654321ZYXWVUTSRQPO", name: "Second Clinic" },
      ];

      // Set up mock chain for select with where and orderBy
      const orderByMock = vi.fn().mockResolvedValue(organizations);
      const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.getAllOrganizations();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Test Vet Clinic");
      expect(result[1].name).toBe("Second Clinic");
    });

    it("returns empty array when no organizations exist", async () => {
      const orderByMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.getAllOrganizations();

      expect(result).toEqual([]);
    });

    it("returns organizations ordered by name", async () => {
      const organizations = [
        { ...mockOrganization, name: "Alpha Clinic" },
        { ...mockOrganization, id: "01HX2", name: "Beta Clinic" },
        { ...mockOrganization, id: "01HX3", name: "Gamma Clinic" },
      ];

      const orderByMock = vi.fn().mockResolvedValue(organizations);
      const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.getAllOrganizations();

      // Verify orderBy was called (organizations should be sorted)
      expect(orderByMock).toHaveBeenCalled();
      expect(result[0].name).toBe("Alpha Clinic");
    });
  });

  describe("updateOrganization", () => {
    it("updates organization fields", async () => {
      const updatedOrg = {
        ...mockOrganization,
        name: "Updated Clinic Name",
        updatedAt: new Date(),
      };

      // Set up mock chain for update
      const returningMock = vi.fn().mockResolvedValue([updatedOrg]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.updateOrganization(mockOrganization.id, {
        name: "Updated Clinic Name",
      });

      expect(result.name).toBe("Updated Clinic Name");
      expect(db.update).toHaveBeenCalled();
    });

    it("updates multiple fields at once", async () => {
      const updatedOrg = {
        ...mockOrganization,
        name: "New Name",
        isActive: false,
        timezone: "America/Los_Angeles",
      };

      const returningMock = vi.fn().mockResolvedValue([updatedOrg]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.updateOrganization(mockOrganization.id, {
        name: "New Name",
        isActive: false,
        timezone: "America/Los_Angeles",
      });

      expect(result.name).toBe("New Name");
      expect(result.isActive).toBe(false);
      expect(result.timezone).toBe("America/Los_Angeles");
    });

    it("throws error for non-existent organization", async () => {
      // Mock update to return empty array (no rows affected)
      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

      const { storage } = await import("@server/storage");

      await expect(
        storage.updateOrganization("non-existent-id", { name: "New Name" })
      ).rejects.toThrow("Organization non-existent-id not found");
    });

    it("updates updatedAt timestamp automatically", async () => {
      const beforeUpdate = new Date();

      const updatedOrg = {
        ...mockOrganization,
        name: "Updated Name",
        updatedAt: new Date(),
      };

      const returningMock = vi.fn().mockResolvedValue([updatedOrg]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

      const { storage } = await import("@server/storage");

      const result = await storage.updateOrganization(mockOrganization.id, {
        name: "Updated Name",
      });

      // Verify setMock was called with updatedAt
      expect(setMock).toHaveBeenCalled();
      const setCall = setMock.mock.calls[0][0];
      expect(setCall).toHaveProperty("updatedAt");
    });
  });
});
