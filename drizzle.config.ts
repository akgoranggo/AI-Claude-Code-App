import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from both .env and .env.local
// .env.local takes precedence (for local overrides like PGUSER)
config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Drizzle Kit Configuration
 * Supports both:
 * 1. Standard PostgreSQL with DATABASE_URL (Replit/Neon)
 * 2. Databricks Lakebase with USE_LAKEBASE=true (Local dev/Azure)
 */

// Determine schema name dynamically
function getSchemaName(): string {
  // If explicitly set, use that
  if (process.env.PGSCHEMA) {
    return process.env.PGSCHEMA;
  }

  // For local dev with PGUSER set, use per-developer schema
  const isLocalDev = process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;
  if (isLocalDev && process.env.PGUSER) {
    const username = process.env.PGUSER.split("@")[0]; // Extract username from email
    return `pims_${username}`;
  }

  // Default to shared schema
  return "pims";
}

const schemaName = getSchemaName();
console.log(`[Drizzle Config] Using schema: ${schemaName}`);

let connectionUrl: string;

if (process.env.USE_LAKEBASE === "true") {
  // For Lakebase: Construct connection URL from components
  // Note: Drizzle Kit commands use this for migrations, so we need a full URL with token
  if (!process.env.LAKEBASE_HOSTNAME || !process.env.LAKEBASE_DATABASE) {
    throw new Error(
      "For Lakebase, set LAKEBASE_HOSTNAME and LAKEBASE_DATABASE. " +
        "Also set PGPASSWORD with a valid OAuth token (or DATABASE_URL with full connection string)."
    );
  }

  // Check if DATABASE_URL is already provided (with token)
  if (process.env.DATABASE_URL) {
    connectionUrl = process.env.DATABASE_URL;
  } else if (process.env.PGPASSWORD) {
    // Build URL from components
    // For local dev, use PGUSER as username
    // For production with manual token, use "token" as username
    const username = process.env.PGUSER || "token";
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(process.env.PGPASSWORD);
    connectionUrl = `postgresql://${encodedUsername}:${encodedPassword}@${process.env.LAKEBASE_HOSTNAME}:5432/${process.env.LAKEBASE_DATABASE}?sslmode=require`;
  } else {
    throw new Error(
      "For Drizzle Kit with Lakebase, provide either:\n" +
        "1. DATABASE_URL with token, or\n" +
        "2. PGPASSWORD with current OAuth token (get from: databricks auth token)\n" +
        "Note: Tokens expire in 1 hour!"
    );
  }
} else {
  // Standard PostgreSQL (Replit/Neon)
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Ensure the database is provisioned.");
  }
  connectionUrl = process.env.DATABASE_URL;
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
  // Use schemaFilter to only manage tables in our specific PostgreSQL schema.
  // The schema name (e.g., pims_vkennedy) is determined dynamically.
  // This works correctly because:
  // 1. schema.ts exports pgSchema with the correct name
  // 2. All tables are defined using pimsSchema.table() instead of pgTable()
  // See: https://github.com/drizzle-team/drizzle-orm/issues/2632
  schemaFilter: [schemaName],
});
