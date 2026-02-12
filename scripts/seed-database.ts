/**
 * Database Seeding Script
 *
 * Seeds the database with example data for development.
 * Includes automatic OAuth token fetching for Databricks Lakebase.
 *
 * Usage:
 *   npm run db:seed              # Seed data (keeps existing)
 *   npm run db:seed:fresh        # Drop and recreate with seed data
 *   npm run db:create            # Create schema only
 */

import { config } from "dotenv";
import pg from "pg";
import { randomBytes, randomUUID } from "crypto";
import { DefaultAzureCredential } from "@azure/identity";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

// =============================================================================
// ULID Generation (matches PostgreSQL function)
// =============================================================================

const ULID_ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateUlid(): string {
  const timestamp = Date.now();
  let ulid = "";

  let ts = timestamp;
  for (let i = 9; i >= 0; i--) {
    ulid = ULID_ENCODING[ts & 0x1f] + ulid;
    ts = Math.floor(ts / 32);
  }

  const random = randomBytes(10);
  for (let i = 0; i < 10; i++) {
    const byte1 = random[i];
    ulid += ULID_ENCODING[(byte1 >> 3) & 0x1f];
    if (i < 9) {
      const byte2 = random[i + 1];
      ulid += ULID_ENCODING[((byte1 & 0x07) << 2) | ((byte2 >> 6) & 0x03)];
    }
  }

  while (ulid.length < 26) {
    ulid += ULID_ENCODING[Math.floor(Math.random() * 32)];
  }

  return ulid.substring(0, 26);
}

// =============================================================================
// Lakebase OAuth Authentication
// =============================================================================

interface LakebaseCredential {
  token: string;
  expiration_time: string;
}

/**
 * Get Databricks Lakebase credential using either:
 * 1. Personal Access Token (DATABRICKS_TOKEN in .env.local)
 * 2. Azure AD authentication via DefaultAzureCredential (az login)
 */
async function getLakebaseToken(): Promise<string> {
  const workspaceUrl = process.env.DATABRICKS_WORKSPACE_URL;
  const instanceName = process.env.LAKEBASE_INSTANCE_NAME || "app-dev";

  if (!workspaceUrl) {
    throw new Error("DATABRICKS_WORKSPACE_URL is required in .env.local");
  }

  // Method 1: Use Personal Access Token if provided
  if (process.env.DATABRICKS_TOKEN) {
    console.log("[Auth] Using Databricks Personal Access Token");
    return await fetchCredentialWithToken(workspaceUrl, instanceName, process.env.DATABRICKS_TOKEN);
  }

  // Method 2: Use Azure AD authentication (requires `az login`)
  console.log("[Auth] Using Azure AD authentication (DefaultAzureCredential)");

  try {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken(
      "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"
    );

    if (!tokenResponse?.token) {
      throw new Error("Failed to obtain Azure AD token");
    }

    return await fetchCredentialWithToken(workspaceUrl, instanceName, tokenResponse.token);
  } catch (error) {
    console.error("\n[Auth] Azure AD authentication failed");
    console.error("[Auth] To fix this, either:");
    console.error("[Auth]   1. Run `az login` to authenticate with Azure CLI");
    console.error("[Auth]   2. Add DATABRICKS_TOKEN=<your-pat> to .env.local\n");
    throw error;
  }
}

/**
 * Call Databricks API to get a Lakebase database credential
 */
async function fetchCredentialWithToken(
  workspaceUrl: string,
  instanceName: string,
  authToken: string
): Promise<string> {
  const apiUrl = `${workspaceUrl}/api/2.0/database/credentials`;

  console.log(`[Auth] Requesting Lakebase credential for instance: ${instanceName}`);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instance_names: [instanceName],
      request_id: randomUUID(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Databricks API failed (${response.status}): ${errorText}`);
  }

  const credential: LakebaseCredential = await response.json();

  if (!credential.token) {
    throw new Error("Databricks API returned empty token");
  }

  const expiresAt = new Date(credential.expiration_time);
  console.log(`[Auth] Lakebase credential obtained (expires: ${expiresAt.toLocaleTimeString()})`);

  return credential.token;
}

// =============================================================================
// Configuration
// =============================================================================

interface DatabaseConfig {
  connectionString: string;
  schema: string;
}

async function getConfig(): Promise<DatabaseConfig> {
  let connectionString: string;
  let schema = "public";

  if (process.env.USE_LAKEBASE === "true") {
    // Lakebase mode - fetch OAuth token automatically
    const requiredVars = ["LAKEBASE_HOSTNAME", "LAKEBASE_DATABASE", "PGUSER"];
    const missing = requiredVars.filter((v) => !process.env[v]);

    if (missing.length > 0) {
      console.error("Missing required environment variables:", missing.join(", "));
      process.exit(1);
    }

    // Get OAuth token
    console.log("\n[Auth] Fetching Lakebase OAuth token...");
    const token = await getLakebaseToken();

    const username = process.env.PGUSER!.split("@")[0];
    schema = process.env.PGSCHEMA || process.env.LAKEBASE_SCHEMA || `app_${username}`;

    connectionString = `postgresql://${encodeURIComponent(process.env.PGUSER!)}:${encodeURIComponent(token)}@${process.env.LAKEBASE_HOSTNAME}:5432/${process.env.LAKEBASE_DATABASE}?sslmode=require`;
  } else {
    // Standard PostgreSQL mode
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set");
      process.exit(1);
    }
    connectionString = process.env.DATABASE_URL;
  }

  return { connectionString, schema };
}

// =============================================================================
// Database Connection
// =============================================================================

async function createConnection(config: DatabaseConfig): Promise<pg.Client> {
  const client = new pg.Client({ connectionString: config.connectionString });

  console.log(`\nConnecting to database...`);
  console.log(`   Schema: ${config.schema}`);

  await client.connect();
  console.log("Connected successfully!\n");

  if (config.schema !== "public") {
    await client.query(`SET search_path TO "${config.schema}", public`);
  }

  return client;
}

// =============================================================================
// Create Schema
// =============================================================================

async function createSchema(client: pg.Client, schemaName: string): Promise<void> {
  console.log("Creating schema and ULID function...\n");

  // Create schema if it doesn't exist
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  console.log(`Schema "${schemaName}" created`);

  // Create ULID generation function
  // Databricks Lakebase compatible version:
  // - Uses INTEGER casts for SUBSTR() compatibility
  // - Uses RANDOM() instead of gen_random_bytes() (pgcrypto not available)
  await client.query(`
    CREATE OR REPLACE FUNCTION "${schemaName}".generate_ulid() RETURNS TEXT AS $$
    DECLARE
      -- Crockford's Base32 alphabet (excludes I, L, O, U to avoid confusion)
      encoding TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
      timestamp_ms BIGINT;
      ulid TEXT := '';
      i INTEGER;
    BEGIN
      -- Get current timestamp in milliseconds
      timestamp_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

      -- Encode timestamp (first 10 characters)
      -- Cast to INTEGER for SUBSTR compatibility
      FOR i IN REVERSE 9..0 LOOP
        ulid := ulid || SUBSTR(encoding, (((timestamp_ms >> (i * 5)) & 31) + 1)::INTEGER, 1);
      END LOOP;

      -- Generate 16 random characters using RANDOM() (Lakebase compatible)
      FOR i IN 1..16 LOOP
        ulid := ulid || SUBSTR(encoding, (FLOOR(RANDOM() * 32)::INTEGER) + 1, 1);
      END LOOP;

      RETURN ulid;
    END;
    $$ LANGUAGE plpgsql VOLATILE;
  `);
  console.log(`ULID function created\n`);
}

// =============================================================================
// Seed Data
// =============================================================================

async function seedData(client: pg.Client): Promise<void> {
  console.log("Seeding database with example data...\n");

  // Create example organization
  const orgId = generateUlid();
  const orgResult = await client.query(
    `
    INSERT INTO organization (id, name, legal_name, billing_email, timezone, is_active)
    VALUES ($1, 'Acme Corporation', 'Acme Corp, Inc.', 'billing@acme.example.com', 'America/New_York', true)
    ON CONFLICT DO NOTHING
    RETURNING id
  `,
    [orgId]
  );

  let actualOrgId: string;
  if (orgResult.rows.length > 0) {
    actualOrgId = orgResult.rows[0].id;
  } else {
    const existingOrg = await client.query(`SELECT id FROM organization LIMIT 1`);
    actualOrgId = existingOrg.rows[0]?.id || orgId;
  }
  console.log(`Organization ready: ${actualOrgId}`);

  // Create example users
  const userId1 = generateUlid();
  const userId2 = generateUlid();

  const user1Result = await client.query(
    `
    INSERT INTO "user" (id, email, first_name, last_name, role, organization_id)
    VALUES ($1, 'admin@example.com', 'Admin', 'User', 'admin', $2)
    ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
    RETURNING id
  `,
    [userId1, actualOrgId]
  );
  const actualUserId1 = user1Result.rows[0].id;

  const user2Result = await client.query(
    `
    INSERT INTO "user" (id, email, first_name, last_name, role, organization_id)
    VALUES ($1, 'user@example.com', 'Regular', 'User', 'user', $2)
    ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
    RETURNING id
  `,
    [userId2, actualOrgId]
  );
  const actualUserId2 = user2Result.rows[0].id;

  console.log("Created/updated 2 example users");
  console.log(`  - Admin: ${actualUserId1}`);
  console.log(`  - User: ${actualUserId2}`);

  console.log("\nDatabase seeded successfully!\n");
}

// =============================================================================
// Drop Data
// =============================================================================

async function dropData(client: pg.Client): Promise<void> {
  console.log("Dropping existing data...\n");

  await client.query('DELETE FROM "user"');
  await client.query("DELETE FROM organization");

  console.log("Existing data dropped\n");
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const createSchemaOnly = args.includes("--create-schema");
  const dropFirst = args.includes("--drop-first");

  const dbConfig = await getConfig();
  const client = await createConnection(dbConfig);

  try {
    if (createSchemaOnly || dropFirst) {
      await createSchema(client, dbConfig.schema);
    }

    if (!createSchemaOnly) {
      if (dropFirst) {
        await dropData(client);
      }
      await seedData(client);
    }

    console.log("All done!");
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
