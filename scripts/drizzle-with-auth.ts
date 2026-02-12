#!/usr/bin/env npx tsx
/**
 * Drizzle Kit Wrapper with Automatic Lakebase OAuth Authentication
 *
 * This script fetches an OAuth token from Databricks before running drizzle-kit commands.
 * It eliminates the need to manually copy/paste tokens for local development.
 *
 * Usage:
 *   npx tsx scripts/drizzle-with-auth.ts push
 *   npx tsx scripts/drizzle-with-auth.ts generate
 *   npx tsx scripts/drizzle-with-auth.ts migrate
 *   npx tsx scripts/drizzle-with-auth.ts studio
 */

import { spawn } from "child_process";
import { config } from "dotenv";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "crypto";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

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
  console.log("I m in Check1");
  const workspaceUrl = process.env.DATABRICKS_WORKSPACE_URL;
  const instanceName = process.env.LAKEBASE_INSTANCE_NAME || "pims-dev";

  if (!workspaceUrl) {
    throw new Error("DATABRICKS_WORKSPACE_URL is required in .env.local");
  }

  // Method 1: Use Personal Access Token if provided
  if (process.env.DATABRICKS_TOKEN) {
    console.log("[Auth] Using Databricks Personal Access Token from .env.local");
    return await fetchCredentialWithToken(workspaceUrl, instanceName, process.env.DATABRICKS_TOKEN);
  }

  // Method 2: Use Azure AD authentication (requires `az login`)
  console.log("[Auth] Using Azure AD authentication (DefaultAzureCredential)");
  console.log("[Auth] If this fails, run `az login` first or add DATABRICKS_TOKEN to .env.local");

  try {
    const credential = new DefaultAzureCredential();

    // Get Azure AD token for Databricks
    console.log("[Auth] Requesting Azure AD token for Databricks...");
    const tokenResponse = await credential.getToken(
      "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"
    );

    if (!tokenResponse?.token) {
      throw new Error("Failed to obtain Azure AD token");
    }

    console.log("[Auth] Azure AD token obtained successfully");
    return await fetchCredentialWithToken(workspaceUrl, instanceName, tokenResponse.token);
  } catch (error) {
    console.error("\n[Auth] ❌ Azure AD authentication failed");
    console.error("[Auth] To fix this, either:");
    console.error("[Auth]   1. Run `az login` to authenticate with Azure CLI");
    console.error("[Auth]   2. Add DATABRICKS_TOKEN=<your-pat> to .env.local");
    console.error(
      "[Auth]      (Get PAT from: Databricks → Settings → Developer → Access Tokens)\n"
    );
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
  console.log("I m in Check2");
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
  console.log(
    `[Auth] ✅ Lakebase credential obtained (expires: ${expiresAt.toLocaleTimeString()})`
  );

  return credential.token;
}

/**
 * Run drizzle-kit with the authenticated environment
 */
async function runDrizzleKit(args: string[]): Promise<void> {
 console.log("I m in Check3");
  
  // Check if Lakebase mode
  if (process.env.USE_LAKEBASE !== "true") {
    console.log("[Auth] Not using Lakebase, running drizzle-kit directly");
    return runCommand("drizzle-kit", args);
  }

  // Validate required Lakebase env vars
  const requiredVars = ["LAKEBASE_HOSTNAME", "LAKEBASE_DATABASE", "PGUSER"];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error(`[Auth] Missing required environment variables: ${missing.join(", ")}`);
    console.error("[Auth] Make sure these are set in .env.local");
    process.exit(1);
  }

  try {
    // Get OAuth token
    console.log("[Auth] Fetching Lakebase OAuth token...\n");
    const token = await getLakebaseToken();

    // Determine schema name (same logic as drizzle.config.ts)
    let schemaName = process.env.PGSCHEMA;
    if (!schemaName && process.env.PGUSER) {
      const username = process.env.PGUSER.split("@")[0];
      schemaName = `pims_${username}`;
    }
    schemaName = schemaName || "pims";

    // Build connection URL with search_path to set the schema
    const username = encodeURIComponent(process.env.PGUSER!);
    const password = encodeURIComponent(token);
    const host = process.env.LAKEBASE_HOSTNAME;
    const database = process.env.LAKEBASE_DATABASE;

    // Include options to set search_path - this tells PostgreSQL which schema to use
    const connectionUrl = `postgresql://${username}:${password}@${host}:5432/${database}?sslmode=require&options=-c%20search_path%3D${schemaName}`;

    console.log(`[Auth] Using PostgreSQL schema: ${schemaName}`);

    // Run drizzle-kit with the token injected
    console.log(`[Auth] Running: drizzle-kit ${args.join(" ")}\n`);

    return runCommand("drizzle-kit", args, {
      DATABASE_URL: connectionUrl,
      PGPASSWORD: token,
      PGSCHEMA: schemaName,
    });
  } catch (error) {
    console.error("[Auth] Failed to obtain Lakebase credential:", error);
    process.exit(1);
  }
}

/**
 * Spawn a child process and wait for it to complete
 */
function runCommand(
  command: string,
  args: string[],
  extraEnv: Record<string, string> = {}
): Promise<void> {

  console.log("I m in Check4");

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        ...extraEnv,
      },
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: npx tsx scripts/drizzle-with-auth.ts <command>");
  console.log("Commands: push, generate, migrate, studio");
  process.exit(1);
}

runDrizzleKit(args)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
