# Azure Databricks Lakebase Authentication Implementation Guide

This document describes how to implement OAuth authentication for Azure Databricks Lakebase in a Node.js/TypeScript web application. The implementation supports both local development and production environments with automatic token refresh.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Implementation](#implementation)
  - [Dependencies](#dependencies)
  - [Token Manager Class](#token-manager-class)
  - [Database Connection Setup](#database-connection-setup)
  - [Schema Management](#schema-management)
- [Authentication Flows](#authentication-flows)
  - [Local Development](#local-development)
  - [Production (Azure Hosted)](#production-azure-hosted)
- [Token Refresh Strategy](#token-refresh-strategy)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)

---

## Overview

Databricks Lakebase uses PostgreSQL wire protocol with OAuth token authentication. This implementation:

1. **Local Development**: Uses Personal Access Tokens (PAT) or Azure CLI credentials
2. **Production**: Uses Azure Service Principal with secrets stored in Azure Key Vault
3. **Alternative**: Supports Azure Managed Identity for App Service deployments

The OAuth tokens expire (typically within 1 hour), so the implementation includes automatic token refresh with a 5-minute buffer before expiration.

---

## Prerequisites

- Azure subscription with Databricks workspace
- Databricks Lakebase instance provisioned
- For production: Azure Service Principal with access to Databricks
- For production: Azure Key Vault for secret storage

---

## Environment Variables

### Base Variables (Required for All Modes)

```env
USE_LAKEBASE=true
DATABRICKS_WORKSPACE_URL=https://adb-1234567890123456.7.azuredatabricks.net
AZURE_TENANT_ID=your-azure-tenant-id
LAKEBASE_HOSTNAME=instance-xxxxx.database.azuredatabricks.net
LAKEBASE_DATABASE=databricks_postgres
LAKEBASE_INSTANCE_NAME=your-lakebase-instance
```

### Local Development Variables

```env
# Option 1: Personal Access Token (Recommended)
DATABRICKS_TOKEN=dapi1234567890abcdef

# Option 2: User credentials (for per-developer schemas)
PGUSER=developer@company.com

# Optional: Override schema name
LAKEBASE_SCHEMA=pims_devname
```

### Production Variables

```env
# Service Principal authentication
DATABRICKS_CLIENT_ID=your-service-principal-client-id
KEY_VAULT_NAME=your-keyvault-name

# The client secret is stored in Key Vault as: databricks-client-secret

# Alternative: Managed Identity (for Azure App Service)
USE_MANAGED_IDENTITY=true
```

---

## Implementation

### Dependencies

```json
{
  "dependencies": {
    "@azure/identity": "^4.13.0",
    "@azure/keyvault-secrets": "^4.10.0",
    "pg": "^8.16.3",
    "drizzle-orm": "^0.30.0"
  }
}
```

### Token Manager Class

This class handles OAuth token generation and caching with automatic refresh.

```typescript
// lakebase-connection.ts

import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { randomUUID } from "crypto";

interface LakebaseConfig {
  workspaceUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
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
    const isLocalDev =
      process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;

    // For local dev, check if user provided a Databricks Personal Access Token
    if (isLocalDev && process.env.DATABRICKS_TOKEN) {
      console.log("[Lakebase] LOCAL DEV: Using Databricks Personal Access Token");
      return await this.generateTokenWithPAT(process.env.DATABRICKS_TOKEN);
    }

    // Get Azure AD token for Databricks
    let azureTokenResponse;

    if (isLocalDev) {
      // Use DefaultAzureCredential for local development (Azure CLI, VS Code, etc.)
      console.log("[Lakebase] LOCAL DEV: Using DefaultAzureCredential");
      const credential = new DefaultAzureCredential();
      azureTokenResponse = await credential.getToken(
        "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"
      );
    } else {
      // Use Service Principal for production
      console.log("[Lakebase] PRODUCTION: Using Service Principal authentication");
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

    return await this.generateTokenWithAzureAD(azureTokenResponse.token);
  }

  /**
   * Generate Lakebase credential using a Personal Access Token
   */
  private async generateTokenWithPAT(
    databricksToken: string
  ): Promise<{ token: string; expirationTime: Date }> {
    const instanceName = this.config.instanceName || "default";
    const databricksApiUrl = `${this.config.workspaceUrl}/api/2.0/database/credentials`;

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
      throw new Error(`Databricks API call failed (${response.status}): ${errorText}`);
    }

    const lakebaseCredential = await response.json();

    if (!lakebaseCredential.token) {
      throw new Error("Databricks API returned empty token");
    }

    return {
      token: lakebaseCredential.token,
      expirationTime: new Date(lakebaseCredential.expiration_time),
    };
  }

  /**
   * Generate Lakebase credential using an Azure AD token
   */
  private async generateTokenWithAzureAD(
    azureToken: string
  ): Promise<{ token: string; expirationTime: Date }> {
    const instanceName = this.config.instanceName || "default";
    const databricksApiUrl = `${this.config.workspaceUrl}/api/2.0/database/credentials`;

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

    const isLocalDev =
      process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;

    // Use email for local dev (per-developer schemas), client ID for production
    const username = isLocalDev
      ? process.env.PGUSER || process.env.USER_EMAIL || clientId
      : clientId;

    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(token);

    return `postgresql://${encodedUsername}:${encodedPassword}@${hostname}:5432/${database}?sslmode=require`;
  }

  clearCache(): void {
    this.tokenCache = null;
    console.log("[Lakebase] Token cache cleared");
  }
}

export { LakebaseTokenManager };
```

### Factory Function to Create Token Manager

```typescript
/**
 * Create and configure Lakebase token manager from environment variables
 */
export async function createLakebaseTokenManager(): Promise<LakebaseTokenManager | null> {
  if (process.env.USE_LAKEBASE !== "true") {
    return null;
  }

  const isLocalDev =
    process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;

  // Validate required environment variables
  const baseRequiredVars = [
    "DATABRICKS_WORKSPACE_URL",
    "AZURE_TENANT_ID",
    "LAKEBASE_HOSTNAME",
    "LAKEBASE_DATABASE",
  ];

  const productionRequiredVars = [
    ...baseRequiredVars,
    "DATABRICKS_CLIENT_ID",
    "KEY_VAULT_NAME",
  ];

  const requiredVars = isLocalDev ? baseRequiredVars : productionRequiredVars;
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing Lakebase configuration: ${missing.join(", ")}`);
  }

  let clientSecret = "";
  let clientId = "";

  if (isLocalDev) {
    // Local dev doesn't need client secret
    clientId = process.env.DATABRICKS_CLIENT_ID || "local-dev-user";
  } else {
    // Production: Retrieve client secret from Key Vault
    console.log("[Lakebase] Retrieving client secret from Key Vault...");

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
      // Fallback to environment variable if Key Vault fails
      if (process.env.DATABRICKS_CLIENT_SECRET) {
        console.log("[Lakebase] Falling back to DATABRICKS_CLIENT_SECRET env var");
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
    tenantId: process.env.AZURE_TENANT_ID!,
    hostname: process.env.LAKEBASE_HOSTNAME!,
    database: process.env.LAKEBASE_DATABASE!,
    instanceName: process.env.LAKEBASE_INSTANCE_NAME,
  };

  return new LakebaseTokenManager(config);
}
```

### Database Connection Setup

```typescript
// db.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { createLakebaseTokenManager, LakebaseTokenManager } from "./lakebase-connection";

let pool: Pool;
let lakebaseTokenManager: LakebaseTokenManager | null = null;
let createPoolFunction: (() => Promise<Pool>) | null = null;

/**
 * Determine schema name based on environment
 */
function getSchemaName(): string {
  // 1. Explicit override
  if (process.env.PGSCHEMA) {
    return process.env.PGSCHEMA;
  }

  // 2. Lakebase schema override
  if (process.env.LAKEBASE_SCHEMA) {
    return process.env.LAKEBASE_SCHEMA;
  }

  // 3. Derive from PGUSER for per-developer schemas
  if (process.env.USE_LAKEBASE === "true" && process.env.PGUSER) {
    const username = process.env.PGUSER.split("@")[0];
    return `myapp_${username}`;
  }

  // 4. Default schema
  return "myapp";
}

/**
 * Initialize database connection with automatic token refresh
 */
async function initializeDatabase() {
  if (process.env.USE_LAKEBASE !== "true") {
    // Standard PostgreSQL connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    return drizzle(pool, { schema });
  }

  // Lakebase connection with token refresh
  const tokenManager = await createLakebaseTokenManager();
  if (!tokenManager) {
    throw new Error("Failed to create Lakebase token manager");
  }

  lakebaseTokenManager = tokenManager;
  const schemaName = getSchemaName();

  async function createLakebasePool(): Promise<Pool> {
    const token = await tokenManager!.getToken();

    const isLocalDev =
      process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;

    const username = isLocalDev
      ? process.env.PGUSER || "local-dev-user"
      : process.env.DATABRICKS_CLIENT_ID;

    const newPool = new Pool({
      host: process.env.LAKEBASE_HOSTNAME,
      port: parseInt(process.env.PGPORT || "5432"),
      database: process.env.LAKEBASE_DATABASE || "databricks_postgres",
      user: username,
      password: token,
      ssl: { rejectUnauthorized: true },
      max: 20,
      min: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      options: `-c search_path="${schemaName}"`,
    });

    // Set search_path on each new connection
    newPool.on("connect", async (client) => {
      await client.query(`SET search_path TO "${schemaName}"`);
    });

    return newPool;
  }

  createPoolFunction = createLakebasePool;
  pool = await createLakebasePool();

  console.log(`[Database] Connected to Lakebase with schema: ${schemaName}`);
  return drizzle(pool, { schema });
}

/**
 * Handle authentication errors by recreating the connection pool
 */
export async function handleAuthError(error: any): Promise<boolean> {
  // PostgreSQL error code 28P01 = invalid_password (token expired)
  if (error?.code !== "28P01") {
    return false;
  }

  console.log("[Database] Authentication error detected, recreating pool...");

  if (!createPoolFunction || !lakebaseTokenManager) {
    return false;
  }

  // Clear cached token and recreate pool
  lakebaseTokenManager.clearCache();

  const oldPool = pool;
  pool = await createPoolFunction();

  // Close old pool gracefully
  oldPool?.end().catch((err: Error) => {
    console.warn("[Database] Error closing old pool:", err.message);
  });

  return true;
}

/**
 * Gracefully close database connections
 */
export async function closeDatabase(): Promise<void> {
  if (lakebaseTokenManager) {
    lakebaseTokenManager.clearCache();
  }
  await pool?.end();
}

// Initialize and export
export const db = await initializeDatabase();
export { pool };
```

### Schema Management

The implementation supports per-developer schemas for local development:

```typescript
// Schema naming convention:
// - Local dev: myapp_<username> (derived from PGUSER email)
// - Production: myapp (or override with PGSCHEMA/LAKEBASE_SCHEMA)

// Example: developer@company.com -> myapp_developer
```

---

## Authentication Flows

### Local Development

**Option 1: Personal Access Token (Recommended)**

1. Go to Databricks workspace -> Settings -> Developer -> Access Tokens
2. Generate a new token
3. Add to `.env.local`:
   ```env
   DATABRICKS_TOKEN=dapi1234567890abcdef
   ```

**Option 2: Azure CLI/DefaultAzureCredential**

1. Install Azure CLI and login: `az login`
2. The app will automatically use your Azure CLI credentials

**Flow Diagram:**
```
Developer -> PAT/Azure CLI -> Databricks API -> OAuth Token -> PostgreSQL Pool
```

### Production (Azure Hosted)

**Service Principal Authentication**

1. Create Azure Service Principal with Databricks access
2. Store client secret in Azure Key Vault as `databricks-client-secret`
3. Configure environment variables:
   ```env
   DATABRICKS_CLIENT_ID=<service-principal-id>
   KEY_VAULT_NAME=<your-keyvault>
   AZURE_TENANT_ID=<tenant-id>
   ```

**Flow Diagram:**
```
App Service -> Key Vault (get secret) -> ClientSecretCredential -> Azure AD Token
-> Databricks API -> OAuth Token -> PostgreSQL Pool
```

**Alternative: Managed Identity**

For Azure App Service with system-assigned managed identity:

```env
USE_MANAGED_IDENTITY=true
```

No explicit credentials needed - Azure provides identity automatically.

---

## Token Refresh Strategy

The implementation uses multiple strategies to handle token expiration:

1. **Proactive Refresh**: Tokens are refreshed 5 minutes before expiration
2. **Cache Management**: Tokens are cached with expiration tracking
3. **Error Recovery**: Auth errors (code `28P01`) trigger automatic pool recreation

```typescript
// Token refresh buffer: refresh 5 minutes before expiry
private readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

// Check if token needs refresh
if (this.tokenCache) {
  const expiresWithBuffer = new Date(
    this.tokenCache.expiresAt.getTime() - this.TOKEN_REFRESH_BUFFER_MS
  );
  if (now < expiresWithBuffer) {
    return this.tokenCache.token; // Use cached token
  }
}
// Otherwise, generate new token
```

---

## Error Handling

### Authentication Error Recovery

```typescript
// Wrap database operations to handle token expiration
async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (await handleAuthError(error)) {
      // Retry once after pool recreation
      return await operation();
    }
    throw error;
  }
}

// Usage
const result = await executeWithRetry(() => db.select().from(users));
```

### Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `28P01` | Invalid password (token expired) | Clear cache and recreate pool |
| `28000` | Invalid authorization | Check credentials configuration |
| `3D000` | Database does not exist | Verify `LAKEBASE_DATABASE` |

---

## Troubleshooting

### Local Development Issues

**"Failed to obtain Azure AD token"**
- Ensure you're logged into Azure CLI: `az login`
- Or use a Personal Access Token instead (recommended)

**"Databricks API call failed"**
- Verify `DATABRICKS_WORKSPACE_URL` is correct
- Check that your PAT or Azure identity has workspace access
- Verify `LAKEBASE_INSTANCE_NAME` matches your Lakebase instance

### Production Issues

**"Failed to retrieve client secret from Key Vault"**
- Ensure App Service has Key Vault access (via Managed Identity or RBAC)
- Verify the secret name is `databricks-client-secret`
- Check Key Vault firewall rules allow App Service access

**"Authentication error detected, recreating pool"**
- This is normal behavior when tokens expire
- If happening frequently, check token refresh timing

### Connection String Format

The PostgreSQL connection string format for Lakebase:

```
postgresql://{username}:{oauth-token}@{hostname}:5432/{database}?sslmode=require
```

- Username: Email (local dev) or Service Principal ID (production)
- Password: OAuth token from Databricks API
- SSL is required for all Lakebase connections

---

## Security Best Practices

1. **Never commit tokens or secrets** to source control
2. **Use Key Vault** for production secret storage
3. **Rotate Service Principal secrets** regularly
4. **Use per-developer schemas** to isolate local development
5. **Enable SSL** (`sslmode=require`) for all connections
6. **Implement proper error handling** to avoid token leakage in logs
