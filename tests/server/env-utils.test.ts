import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isLocalDevWithPAT, isLocalDev, hasAzureADConfig } from "../../server/env-utils";

describe("env-utils", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    // Clear relevant vars
    delete process.env.NODE_ENV;
    delete process.env.KEY_VAULT_NAME;
    delete process.env.DATABRICKS_TOKEN;
    delete process.env.DATABRICKS_WORKSPACE_URL;
    delete process.env.AZURE_TENANT_ID;
    delete process.env.DATABRICKS_CLIENT_ID;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isLocalDev", () => {
    it("returns true when NODE_ENV is development and KEY_VAULT_NAME is not set", () => {
      process.env.NODE_ENV = "development";
      expect(isLocalDev()).toBe(true);
    });

    it("returns false when NODE_ENV is development but KEY_VAULT_NAME is set", () => {
      process.env.NODE_ENV = "development";
      process.env.KEY_VAULT_NAME = "my-keyvault";
      expect(isLocalDev()).toBe(false);
    });

    it("returns false when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";
      expect(isLocalDev()).toBe(false);
    });

    it("returns false when NODE_ENV is not set", () => {
      expect(isLocalDev()).toBe(false);
    });
  });

  describe("isLocalDevWithPAT", () => {
    it("returns true when all conditions are met", () => {
      process.env.NODE_ENV = "development";
      process.env.DATABRICKS_TOKEN = "test-token";
      process.env.DATABRICKS_WORKSPACE_URL = "https://workspace.example.com";
      expect(isLocalDevWithPAT()).toBe(true);
    });

    it("returns false when NODE_ENV is not development", () => {
      process.env.NODE_ENV = "production";
      process.env.DATABRICKS_TOKEN = "test-token";
      process.env.DATABRICKS_WORKSPACE_URL = "https://workspace.example.com";
      expect(isLocalDevWithPAT()).toBe(false);
    });

    it("returns false when KEY_VAULT_NAME is set (production-like environment)", () => {
      process.env.NODE_ENV = "development";
      process.env.KEY_VAULT_NAME = "my-keyvault";
      process.env.DATABRICKS_TOKEN = "test-token";
      process.env.DATABRICKS_WORKSPACE_URL = "https://workspace.example.com";
      expect(isLocalDevWithPAT()).toBe(false);
    });

    it("returns false when DATABRICKS_TOKEN is not set", () => {
      process.env.NODE_ENV = "development";
      process.env.DATABRICKS_WORKSPACE_URL = "https://workspace.example.com";
      expect(isLocalDevWithPAT()).toBe(false);
    });

    it("returns false when DATABRICKS_WORKSPACE_URL is not set", () => {
      process.env.NODE_ENV = "development";
      process.env.DATABRICKS_TOKEN = "test-token";
      expect(isLocalDevWithPAT()).toBe(false);
    });

    it("returns false when both PAT and workspace URL are missing", () => {
      process.env.NODE_ENV = "development";
      expect(isLocalDevWithPAT()).toBe(false);
    });
  });

  describe("hasAzureADConfig", () => {
    it("returns true with full production config", () => {
      process.env.NODE_ENV = "production";
      process.env.AZURE_TENANT_ID = "test-tenant-id";
      process.env.KEY_VAULT_NAME = "my-keyvault";
      process.env.DATABRICKS_CLIENT_ID = "test-client-id";
      expect(hasAzureADConfig()).toBe(true);
    });

    it("returns true for local dev with only AZURE_TENANT_ID", () => {
      process.env.NODE_ENV = "development";
      process.env.AZURE_TENANT_ID = "test-tenant-id";
      expect(hasAzureADConfig()).toBe(true);
    });

    it("returns false when AZURE_TENANT_ID is missing in production", () => {
      process.env.NODE_ENV = "production";
      process.env.KEY_VAULT_NAME = "my-keyvault";
      process.env.DATABRICKS_CLIENT_ID = "test-client-id";
      expect(hasAzureADConfig()).toBe(false);
    });

    it("returns false when KEY_VAULT_NAME is missing in production", () => {
      process.env.NODE_ENV = "production";
      process.env.AZURE_TENANT_ID = "test-tenant-id";
      process.env.DATABRICKS_CLIENT_ID = "test-client-id";
      expect(hasAzureADConfig()).toBe(false);
    });

    it("returns false when DATABRICKS_CLIENT_ID is missing in production", () => {
      process.env.NODE_ENV = "production";
      process.env.AZURE_TENANT_ID = "test-tenant-id";
      process.env.KEY_VAULT_NAME = "my-keyvault";
      expect(hasAzureADConfig()).toBe(false);
    });

    it("returns false for local dev without AZURE_TENANT_ID", () => {
      process.env.NODE_ENV = "development";
      expect(hasAzureADConfig()).toBe(false);
    });

    it("returns false when no config is present", () => {
      expect(hasAzureADConfig()).toBe(false);
    });
  });
});
