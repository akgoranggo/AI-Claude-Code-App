/**
 * Environment Utilities
 *
 * Shared utilities for detecting environment configuration modes.
 * Used by db.ts and lakebase-connection.ts to ensure consistent behavior.
 */

/**
 * Checks if running in local development mode with a Databricks Personal Access Token.
 * When true, Azure AD authentication (AZURE_TENANT_ID) is not required.
 *
 * @returns true if in local dev mode with PAT available
 */
export function isLocalDevWithPAT(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.KEY_VAULT_NAME &&
    !!process.env.DATABRICKS_TOKEN &&
    !!process.env.DATABRICKS_WORKSPACE_URL
  );
}

/**
 * Checks if running in local development mode (regardless of PAT).
 *
 * @returns true if NODE_ENV is development and no KEY_VAULT_NAME
 */
export function isLocalDev(): boolean {
  return process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;
}

/**
 * Checks if Azure AD configuration is available for Lakebase authentication.
 * - Production: requires AZURE_TENANT_ID, KEY_VAULT_NAME, and DATABRICKS_CLIENT_ID
 * - Local dev without PAT: requires only AZURE_TENANT_ID (uses DefaultAzureCredential)
 *
 * @returns true if Azure AD authentication can be used
 */
export function hasAzureADConfig(): boolean {
  const hasFullProductionConfig =
    !!process.env.AZURE_TENANT_ID &&
    !!process.env.KEY_VAULT_NAME &&
    !!process.env.DATABRICKS_CLIENT_ID;

  const hasLocalDevAzureConfig = isLocalDev() && !!process.env.AZURE_TENANT_ID;

  return hasFullProductionConfig || hasLocalDevAzureConfig;
}
