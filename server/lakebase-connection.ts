/**
 * Lakebase Connection Manager with OAuth Token Refresh
 *
 * Handles automatic token generation and refresh for Databricks Lakebase
 * connections using Azure Service Principal authentication.
 */

import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { randomUUID } from "crypto";
import { isLocalDevWithPAT, isLocalDev } from "./env-utils";

interface LakebaseConfig {
  workspaceUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId?: string; // Optional - not needed for PAT mode
  hostname: string;
  database: string;
  instanceName?: string;
}

interface TokenCache {
  token: string;
  expiresAt: Date;
}

class LakebaseTokenManager {
  private config: LakebaseConfig;
  private tokenCache: TokenCache | null = null;
  private readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

  constructor(config: LakebaseConfig) {
    this.config = config;
  }

  /**
   * Get a valid OAuth token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    const now = new Date();

    // Return cached token if still valid (with buffer for refresh)
    if (this.tokenCache) {
      const expiresWithBuffer = new Date(
        this.tokenCache.expiresAt.getTime() - this.TOKEN_REFRESH_BUFFER_MS
      );
      if (now < expiresWithBuffer) {
        return this.tokenCache.token;
      }
    }

    // Generate new token from Databricks
    console.log("[Lakebase] Generating new database credential...");
    const credential = await this.generateToken();

    // Cache token with expiration time from Databricks
    this.tokenCache = {
      token: credential.token,
      expiresAt: credential.expirationTime,
    };

    console.log(
      `[Lakebase] Database credential cached until ${this.tokenCache.expiresAt.toISOString()}`
    );
    return credential.token;
  }

  /**
   * Generate a new Lakebase database credential
   */
  private async generateToken(): Promise<{ token: string; expirationTime: Date }> {
    try {
      // Use shared utility for consistent detection
      if (isLocalDevWithPAT()) {
        const databricksToken = process.env.DATABRICKS_TOKEN;
        if (!databricksToken) {
          throw new Error("DATABRICKS_TOKEN not found despite isLocalDevWithPAT() returning true");
        }
        console.log(
          "[Lakebase] LOCAL DEV MODE: Using Databricks Personal Access Token from .env.local"
        );
        return await this.generateTokenWithPAT(databricksToken);
      }

      // Step 1: Get Azure AD token for Databricks
      let azureTokenResponse;

      if (isLocalDev()) {
        console.log("[Lakebase] LOCAL DEV MODE: Using DefaultAzureCredential");
        const credential = new DefaultAzureCredential();
        azureTokenResponse = await credential.getToken(
          "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"
        );
      } else {
        // Validate required credentials for production mode
        if (!this.config.tenantId || !this.config.clientSecret) {
          throw new Error(
            "Missing Azure AD credentials for production mode: AZURE_TENANT_ID and client secret are required"
          );
        }
        console.log("[Lakebase] PRODUCTION MODE: Using Service Principal authentication");
        const credential = new ClientSecretCredential(
          this.config.tenantId,
          this.config.clientId,
          this.config.clientSecret
        );
        azureTokenResponse = await credential.getToken(
          "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"
        );
      }

      if (!azureTokenResponse || !azureTokenResponse.token) {
        throw new Error("Failed to obtain Azure AD token");
      }

      console.log("[Lakebase] Azure AD token obtained successfully");
      return await this.generateTokenWithAzureAD(azureTokenResponse.token, isLocalDev());
    } catch (error) {
      console.error("[Lakebase] Error generating database credential:", error);

      if (isLocalDev()) {
        console.error("");
        console.error("[Lakebase] ❌ Azure AD authentication failed for local development");
        console.error("[Lakebase] SOLUTION: Use a Databricks Personal Access Token instead");
        console.error("[Lakebase] Steps:");
        console.error("[Lakebase]   1. Go to Databricks → Settings → Developer → Access Tokens");
        console.error("[Lakebase]   2. Click 'Generate New Token'");
        console.error("[Lakebase]   3. Copy the token");
        console.error("[Lakebase]   4. Add to .env.local: DATABRICKS_TOKEN=<your-token>");
        console.error("[Lakebase]   5. Restart the dev server");
      }

      throw new Error(
        `Failed to generate Lakebase database credential: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async generateTokenWithPAT(
    databricksToken: string
  ): Promise<{ token: string; expirationTime: Date }> {
    const instanceName = this.config.instanceName || "pims-dev";
    const databricksApiUrl = `${this.config.workspaceUrl}/api/2.0/database/credentials`;

    console.log(`[Lakebase] Calling Databricks API with PAT for instance: ${instanceName}`);

    const response = await fetch(databricksApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${databricksToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_names: [instanceName],
        request_id: randomUUID(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Databricks authentication failed (${response.status}). Please check your DATABRICKS_TOKEN is valid and not expired. Details: ${errorText}`
        );
      }
      throw new Error(`Databricks API call failed (${response.status}): ${errorText}`);
    }

    const lakebaseCredential = await response.json();

    if (!lakebaseCredential.token) {
      throw new Error("Databricks API returned empty token");
    }

    console.log("[Lakebase] ✅ Databricks Lakebase credential generated successfully");
    return {
      token: lakebaseCredential.token,
      expirationTime: new Date(lakebaseCredential.expiration_time),
    };
  }

  private async generateTokenWithAzureAD(
    azureToken: string,
    _isLocalDev: boolean
  ): Promise<{ token: string; expirationTime: Date }> {
    const instanceName = this.config.instanceName || "pims-dev";
    const databricksApiUrl = `${this.config.workspaceUrl}/api/2.0/database/credentials`;

    console.log(`[Lakebase] Calling Databricks API for instance: ${instanceName}`);

    const response = await fetch(databricksApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${azureToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_names: [instanceName],
        request_id: randomUUID(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Databricks API call failed (${response.status}): ${errorText}`);
    }

    const lakebaseCredential = await response.json();

    if (!lakebaseCredential.token) {
      throw new Error("Databricks API returned empty token");
    }

    console.log("[Lakebase] ✅ Databricks Lakebase credential generated successfully");
    return {
      token: lakebaseCredential.token,
      expirationTime: new Date(lakebaseCredential.expiration_time),
    };
  }

  /**
   * Get a PostgreSQL connection string with current OAuth token
   */
  async getConnectionString(): Promise<string> {
    const token = await this.getToken();
    const { hostname, database, clientId } = this.config;

    let username: string;
    if (isLocalDev()) {
      username = process.env.PGUSER || process.env.USER_EMAIL || clientId;
      console.log(`[Lakebase] Local dev username: ${username}`);
    } else {
      username = clientId;
    }

    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(token);

    return `postgresql://${encodedUsername}:${encodedPassword}@${hostname}:5432/${database}?sslmode=require`;
  }

  clearCache(): void {
    this.tokenCache = null;
    console.log("[Lakebase] Token cache cleared");
  }
}

/**
 * Create and configure Lakebase token manager from environment variables
 */
export async function createLakebaseTokenManager(): Promise<LakebaseTokenManager | null> {
  if (process.env.USE_LAKEBASE !== "true") {
    return null;
  }

  const localDevMode = isLocalDev();
  const hasLocalPAT = isLocalDevWithPAT();

  const baseRequiredVars = hasLocalPAT
    ? ["DATABRICKS_WORKSPACE_URL", "LAKEBASE_HOSTNAME", "LAKEBASE_DATABASE"]
    : ["DATABRICKS_WORKSPACE_URL", "AZURE_TENANT_ID", "LAKEBASE_HOSTNAME", "LAKEBASE_DATABASE"];

  const productionRequiredVars = [...baseRequiredVars, "DATABRICKS_CLIENT_ID", "KEY_VAULT_NAME"];

  const requiredVars = localDevMode ? baseRequiredVars : productionRequiredVars;
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error("[Lakebase] Missing required environment variables:", missing.join(", "));
    throw new Error(`Missing Lakebase configuration: ${missing.join(", ")}`);
  }

  let clientSecret = "";
  let clientId = "";

  if (localDevMode) {
    console.log("[Lakebase] LOCAL DEV MODE: Using DefaultAzureCredential");
    clientId = process.env.DATABRICKS_CLIENT_ID || "local-dev-user";
  } else {
    console.log("[Lakebase] PRODUCTION MODE: Retrieving client secret from Key Vault...");

    try {
      const keyVaultUrl = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`;
      const credential = new DefaultAzureCredential();
      const secretClient = new SecretClient(keyVaultUrl, credential);

      const secret = await secretClient.getSecret("databricks-client-secret");

      if (!secret.value) {
        throw new Error("Client secret value is empty");
      }

      clientSecret = secret.value;
      clientId = process.env.DATABRICKS_CLIENT_ID!;
      console.log("[Lakebase] Successfully retrieved client secret from Key Vault");
    } catch (error) {
      console.error("[Lakebase] Failed to retrieve client secret from Key Vault:", error);

      if (process.env.DATABRICKS_CLIENT_SECRET) {
        console.log("[Lakebase] Falling back to DATABRICKS_CLIENT_SECRET environment variable");
        clientSecret = process.env.DATABRICKS_CLIENT_SECRET;
        clientId = process.env.DATABRICKS_CLIENT_ID!;
      } else {
        throw new Error("Failed to retrieve client secret from Key Vault");
      }
    }
  }

  const config: LakebaseConfig = {
    workspaceUrl: process.env.DATABRICKS_WORKSPACE_URL!,
    clientId: clientId,
    clientSecret: clientSecret,
    tenantId: process.env.AZURE_TENANT_ID, // Optional - not needed for PAT mode
    hostname: process.env.LAKEBASE_HOSTNAME!,
    database: process.env.LAKEBASE_DATABASE!,
    instanceName: process.env.LAKEBASE_INSTANCE_NAME,
  };

  console.log("[Lakebase] Initializing token manager for", config.hostname);
  console.log(`[Lakebase] Mode: ${localDevMode ? "LOCAL DEVELOPMENT" : "PRODUCTION"}`);

  return new LakebaseTokenManager(config);
}

export { LakebaseTokenManager };
