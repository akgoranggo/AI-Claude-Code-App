/**
 * Organization Schema Tests
 *
 * Tests Zod validation for the Organization entity.
 * Ensures data integrity before database operations.
 *
 * Requirements: Schema validation, required fields, default values
 */

import { describe, it, expect } from "vitest";
import { insertOrganizationSchema } from "@shared/schema";

describe("Organization Schema", () => {
  // Tests for insertOrganizationSchema validation
  describe("insertOrganizationSchema", () => {
    it("validates correct organization data with all fields", () => {
      // Valid org with all fields should pass validation
      const validData = {
        name: "Test Vet Clinic",
        legalName: "Test Vet Clinic LLC",
        taxId: "12-3456789",
        billingEmail: "billing@testvet.com",
        logoUrl: "https://example.com/logo.png",
        timezone: "America/Los_Angeles",
        isActive: true,
      };

      const result = insertOrganizationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test Vet Clinic");
        expect(result.data.legalName).toBe("Test Vet Clinic LLC");
        expect(result.data.timezone).toBe("America/Los_Angeles");
      }
    });

    it("validates organization with only required fields", () => {
      // Only name is required, other fields are optional
      const minimalData = {
        name: "Minimal Clinic",
      };

      const result = insertOrganizationSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Minimal Clinic");
      }
    });

    it("rejects organization without name", () => {
      // Name is required - should fail validation
      const invalidData = {
        legalName: "Test Clinic LLC",
        taxId: "12-3456789",
      };

      const result = insertOrganizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((issue) => issue.path.includes("name"));
        expect(nameError).toBeDefined();
      }
    });

    it("rejects empty string name", () => {
      // Empty name should fail validation due to .min(1) refinement
      const invalidData = {
        name: "",
      };

      const result = insertOrganizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((issue) => issue.path.includes("name"));
        expect(nameError).toBeDefined();
        expect(nameError?.message).toBe("Organization name is required");
      }
    });

    it("accepts null for optional fields", () => {
      // Optional fields can be null
      const dataWithNulls = {
        name: "Test Clinic",
        legalName: null,
        taxId: null,
        billingEmail: null,
        logoUrl: null,
      };

      const result = insertOrganizationSchema.safeParse(dataWithNulls);
      expect(result.success).toBe(true);
    });

    it("validates isActive boolean field", () => {
      // isActive should accept boolean values
      const activeOrg = {
        name: "Active Clinic",
        isActive: true,
      };

      const inactiveOrg = {
        name: "Inactive Clinic",
        isActive: false,
      };

      const activeResult = insertOrganizationSchema.safeParse(activeOrg);
      const inactiveResult = insertOrganizationSchema.safeParse(inactiveOrg);

      expect(activeResult.success).toBe(true);
      expect(inactiveResult.success).toBe(true);
    });

    it("rejects invalid isActive type", () => {
      // isActive should reject non-boolean values
      const invalidData = {
        name: "Test Clinic",
        isActive: "yes", // Should be boolean
      };

      const result = insertOrganizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("validates timezone field", () => {
      // Timezone should accept valid timezone strings
      const orgWithTimezone = {
        name: "Pacific Clinic",
        timezone: "America/Los_Angeles",
      };

      const result = insertOrganizationSchema.safeParse(orgWithTimezone);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timezone).toBe("America/Los_Angeles");
      }
    });

    it("validates billingEmail field format", () => {
      // billingEmail accepts email-like strings (no strict validation by default)
      const orgWithEmail = {
        name: "Email Clinic",
        billingEmail: "billing@clinic.com",
      };

      const result = insertOrganizationSchema.safeParse(orgWithEmail);
      expect(result.success).toBe(true);
    });

    it("validates logoUrl field", () => {
      // logoUrl should accept URL strings
      const orgWithLogo = {
        name: "Logo Clinic",
        logoUrl: "https://example.com/logo.png",
      };

      const result = insertOrganizationSchema.safeParse(orgWithLogo);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.logoUrl).toBe("https://example.com/logo.png");
      }
    });

    it("rejects name exceeding max length", () => {
      // Name has a max length of 255 characters
      const longName = "a".repeat(256);
      const invalidData = {
        name: longName,
      };

      const result = insertOrganizationSchema.safeParse(invalidData);
      // Drizzle-zod should enforce varchar length limits
      expect(result.success).toBe(false);
    });

    it("validates taxId field accepts various formats", () => {
      // TaxId should accept various tax ID formats
      const formats = [
        "12-3456789", // US EIN format
        "123456789", // Plain numbers
        "XX-XXXXXXX", // Placeholder
      ];

      for (const taxId of formats) {
        const result = insertOrganizationSchema.safeParse({
          name: "Test Clinic",
          taxId,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
