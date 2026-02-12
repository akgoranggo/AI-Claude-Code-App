import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";
import { createLakebaseTokenManager } from "./lakebase-connection";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "crypto";
import {
  isLocalDevWithPAT as checkIsLocalDevWithPAT,
  isLocalDev as checkIsLocalDev,
  hasAzureADConfig,
} from "./env-utils";

/**
 * Database Connection Setup
 *
 * Supports three modes:
 * 1. Lakebase with Managed Identity (Azure production - automatic token refresh)
 * 2. Lakebase with Service Principal (local dev - automatic token refresh)
 * 3. Standard PostgreSQL/Neon (Replit - DATABASE_URL)
 */

let pool: Pool;
let tokenRefreshInterval: NodeJS.Timeout | null = null;
let lakebaseTokenManagerInstance: Awaited<ReturnType<typeof createLakebaseTokenManager>> | null =
  null;
let createPoolFunction: (() => Promise<Pool>) | null = null;
let poolReadyPromise: Promise<void> | null = null;
let poolReadyResolve: (() => void) | null = null;

// Determine schema name - matches logic in seed-database.ts
function getSchemaName(): string {
  // 1. Explicit override
  if (process.env.PGSCHEMA) {
    console.log(`[Database] Using PGSCHEMA from env: ${process.env.PGSCHEMA}`);
    return process.env.PGSCHEMA;
  }

  // 2. Lakebase schema (same as seed script)
  if (process.env.LAKEBASE_SCHEMA) {
    console.log(`[Database] Using LAKEBASE_SCHEMA from env: ${process.env.LAKEBASE_SCHEMA}`);
    return process.env.LAKEBASE_SCHEMA;
  }

  // 3. Derive from PGUSER (same as seed script - no NODE_ENV check needed for Lakebase)
  if (process.env.USE_LAKEBASE === "true" && process.env.PGUSER) {
    const username = process.env.PGUSER.split("@")[0];
    const schemaName = `pims_${username}`;
    console.log(`[Database] Derived schema from PGUSER for Lakebase: ${schemaName}`);
    return schemaName;
  }

  // 4. Local dev without Lakebase
  if (checkIsLocalDev() && process.env.PGUSER) {
    const username = process.env.PGUSER.split("@")[0];
    const schemaName = `pims_${username}`;
    console.log(`[Database] Derived schema from PGUSER for local dev: ${schemaName}`);
    return schemaName;
  }

  console.log(`[Database] Using default schema: pims`);
  return "pims";
}

const useManagedIdentity = process.env.USE_MANAGED_IDENTITY === "true";

// Use shared utilities for consistent environment detection
const isLocalDevWithPAT = checkIsLocalDevWithPAT();

/**
 * Determines if Lakebase connection can be established.
 * True when DATABRICKS_WORKSPACE_URL is set and either:
 * - Local PAT mode: DATABRICKS_TOKEN is available for local development
 * - Azure AD mode: Full Azure AD configuration (tenant ID, client ID, Key Vault)
 */
const hasServicePrincipal =
  !!process.env.DATABRICKS_WORKSPACE_URL && (isLocalDevWithPAT || hasAzureADConfig());

if (process.env.USE_LAKEBASE === "true" && useManagedIdentity) {
  // MODE 1: LAKEBASE WITH MANAGED IDENTITY (Azure production)
  console.log("[Database] 🔐 Connecting to Databricks Lakebase with Managed Identity");

  const credential = new DefaultAzureCredential();
  const schemaName = getSchemaName();

  const createManagedIdentityPool = async () => {
    try {
      console.log("[Database] Getting Azure AD token via managed identity...");
      const tokenResponse = await credential.getToken(
        "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"
      );

      if (!tokenResponse || !tokenResponse.token) {
        throw new Error("Failed to obtain Azure AD token via managed identity");
      }

      console.log("[Database] ✅ Got Azure AD token, requesting database credential...");

      const databricksApiUrl = `${process.env.DATABRICKS_WORKSPACE_URL}/api/2.0/sql/warehouses/databases/${process.env.LAKEBASE_INSTANCE_NAME}/credentials`;

      const response = await fetch(databricksApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResponse.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: randomUUID() }),
      });

      if (!response.ok) {
        if (process.env.PGPASSWORD) {
          console.log("[Database] 📌 Using PGPASSWORD as fallback");
          return new Pool({
            host: process.env.LAKEBASE_HOSTNAME || process.env.PGHOST,
            port: parseInt(process.env.PGPORT || "5432"),
            database:
              process.env.LAKEBASE_DATABASE || process.env.PGDATABASE || "databricks_postgres",
            user: "token",
            password: process.env.PGPASSWORD,
            ssl: { rejectUnauthorized: true },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            options: `-c search_path="${schemaName}"`,
          });
        }
        throw new Error("Databricks API failed and no PGPASSWORD fallback");
      }

      const data: any = await response.json();

      return new Pool({
        host: process.env.LAKEBASE_HOSTNAME || process.env.PGHOST,
        port: parseInt(process.env.PGPORT || "5432"),
        database: process.env.LAKEBASE_DATABASE || process.env.PGDATABASE || "databricks_postgres",
        user: "token",
        password: data.credential?.password || process.env.PGPASSWORD,
        ssl: { rejectUnauthorized: true },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        options: `-c search_path="${schemaName}"`,
      });
    } catch (error) {
      console.error("[Database] Error in managed identity auth:", error);
      if (process.env.PGPASSWORD) {
        console.log("[Database] 📌 Falling back to PGPASSWORD");
        return new Pool({
          host: process.env.LAKEBASE_HOSTNAME || process.env.PGHOST,
          port: parseInt(process.env.PGPORT || "5432"),
          database:
            process.env.LAKEBASE_DATABASE || process.env.PGDATABASE || "databricks_postgres",
          user: "token",
          password: process.env.PGPASSWORD,
          ssl: { rejectUnauthorized: true },
          max: 10,
          options: `-c search_path="${schemaName}"`,
        });
      }
      throw error;
    }
  };

  console.log("[Database] ⚡ Initializing connection in background...");

  // Create promise that resolves when pool is ready
  poolReadyPromise = new Promise<void>((resolve) => {
    poolReadyResolve = resolve;
  });

  createManagedIdentityPool()
    .then((initialPool) => {
      pool = initialPool;
      Object.assign(db, drizzle(pool, { schema }));
      console.log("[Database] ✅ Connection established successfully");

      // Signal that pool is ready
      if (poolReadyResolve) {
        poolReadyResolve();
      }

      tokenRefreshInterval = setInterval(
        async () => {
          console.log("[Database] 🔄 Refreshing database credential...");
          try {
            const oldPool = pool;
            pool = await createManagedIdentityPool();
            Object.assign(db, drizzle(pool, { schema }));
            await oldPool.end();
          } catch (error) {
            console.error("[Database] ❌ Error refreshing credential:", error);
          }
        },
        50 * 60 * 1000
      );
    })
    .catch((error) => {
      console.error("[Database] ❌ Failed to initialize connection:", error);
      process.exit(1);
    });

  pool = new Pool({
    host: process.env.LAKEBASE_HOSTNAME || process.env.PGHOST,
    port: parseInt(process.env.PGPORT || "5432"),
    database: process.env.LAKEBASE_DATABASE || "databricks_postgres",
    user: "token",
    password: process.env.PGPASSWORD || "placeholder",
    ssl: { rejectUnauthorized: true },
    max: 10,
  });
} else if (process.env.USE_LAKEBASE === "true" && hasServicePrincipal) {
  // MODE 2: LAKEBASE WITH SERVICE PRINCIPAL (local dev + production)
  console.log("[Database] 🔐 Connecting to Databricks Lakebase with Service Principal");

  const schemaName = getSchemaName();
  console.log(`[Database] 🎯 Target schema: ${schemaName}`);

  // Initialize pool asynchronously (non-blocking)
  console.log("[Database] ⚡ Initializing connection in background...");

  // Create promise that resolves when pool is ready
  poolReadyPromise = new Promise<void>((resolve) => {
    poolReadyResolve = resolve;
  });

  createLakebaseTokenManager()
    .then(async (lakebaseTokenManager) => {
      if (!lakebaseTokenManager) {
        throw new Error("Failed to create Lakebase token manager");
      }

      lakebaseTokenManagerInstance = lakebaseTokenManager;

      const createLakebasePool = async () => {
        const token = await lakebaseTokenManager!.getToken();

        const username = checkIsLocalDev()
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
          maxUses: 7500,
          options: `-c search_path="${schemaName}"`,
        });

        newPool.on("connect", async (client) => {
          try {
            await client.query(`SET search_path TO "${schemaName}"`);
            console.log(`[Database] ✅ Connection established with schema: ${schemaName}`);
          } catch (err) {
            console.error(`[Database] ❌ Failed to set search_path:`, err);
          }
        });

        return newPool;
      };

      createPoolFunction = createLakebasePool;
      const initialPool = await createLakebasePool();
      pool = initialPool;
      Object.assign(db, drizzle(pool, { schema }));

      console.log("[Database] ✅ Connection established successfully");
      console.log(
        "[Database] 🔄 Lazy token refresh enabled - tokens will refresh automatically on expiration"
      );

      // Signal that pool is ready
      if (poolReadyResolve) {
        poolReadyResolve();
      }
    })
    .catch((error) => {
      console.error("[Database] ❌ Failed to initialize connection:", error);
      process.exit(1);
    });

  // Initialize pool to a placeholder that will be replaced asynchronously
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool = {
    _isPlaceholder: true,
    query: () => {
      throw new Error("Database not ready yet");
    },
  } as unknown as Pool;
} else if (process.env.USE_LAKEBASE === "true") {
  // MODE 3: LAKEBASE WITH MANUAL TOKEN
  console.log("[Database] 🔐 Connecting to Databricks Lakebase with manual token");

  if (!process.env.PGHOST || !process.env.PGPASSWORD) {
    throw new Error("Lakebase connection requires PGHOST and PGPASSWORD");
  }

  const username = process.env.PGUSER || "token";
  const schemaName = getSchemaName();

  console.log(`[Database] 🎯 Target schema: ${schemaName}`);

  pool = new Pool({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || "5432"),
    database: process.env.PGDATABASE || "databricks_postgres",
    user: username,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: true },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    options: `-c search_path="${schemaName}"`,
  });

  pool.on("connect", async (client: any) => {
    try {
      await client.query(`SET search_path TO "${schemaName}"`);
      console.log(`[Database] ✅ Connection established with schema: ${schemaName}`);
    } catch (err) {
      console.error(`[Database] ❌ Failed to set search_path:`, err);
    }
  });

  pool.on("error", (err: any) => {
    console.error("[Database] Unexpected pool error:", err);

    if (err.message?.includes("authentication") || err.message?.includes("token")) {
      console.error("\n⚠️  LAKEBASE AUTHENTICATION ERROR - Token likely expired");
      console.error("Get a fresh token from: databricks auth token\n");
    }
  });

  console.log(`[Database] Connected to ${process.env.PGHOST}`);

  // Pool is ready immediately for manual token mode
  poolReadyPromise = Promise.resolve();
} else {
  // MODE 4: STANDARD POSTGRESQL (Replit/Neon)
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. For Lakebase, set USE_LAKEBASE=true.");
  }

  console.log("[Database] 🔐 Connecting to PostgreSQL with DATABASE_URL");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Pool is ready immediately for DATABASE_URL mode
  poolReadyPromise = Promise.resolve();
}

/**
 * Gracefully close database connections
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }
    if (lakebaseTokenManagerInstance) {
      lakebaseTokenManagerInstance.clearCache();
    }
    await pool.end();
    console.log("[Database] Connection pool closed");
  } catch (error) {
    console.error("[Database] Error closing connection pool:", error);
  }
}

// Create Drizzle instance with schema (initialized synchronously, will be reassigned when pool is ready)
export const db = drizzle(pool, { schema });
export { pool };

/**
 * Wait for the database pool to be ready (for async initialization modes)
 * Returns immediately if pool is already ready
 */
export async function waitForPool(): Promise<void> {
  if (poolReadyPromise) {
    await poolReadyPromise;
  }
  // If no promise exists, pool was initialized synchronously and is ready
}

/**
 * Handle database authentication errors by recreating the connection pool
 */
export async function handleAuthError(error: any): Promise<boolean> {
  if (error?.code !== "28P01") {
    return false;
  }

  console.log("[Database] 🔄 Authentication error detected, recreating pool...");

  try {
    if (!createPoolFunction) {
      console.error("[Database] ❌ No pool creation function available");
      return false;
    }

    if (lakebaseTokenManagerInstance) {
      lakebaseTokenManagerInstance.clearCache();
    }

    const oldPool = pool;
    pool = await createPoolFunction();
    Object.assign(db, drizzle(pool, { schema }));

    console.log("[Database] ✅ Pool recreated successfully");

    oldPool?.end().catch((err: Error) => {
      console.warn("[Database] ⚠️  Error closing old pool:", err.message);
    });

    return true;
  } catch (err) {
    console.error("[Database] ❌ Failed to recreate pool:", err);
    return false;
  }
}
