/**
 * Web App Template - Database Schema
 *
 * This schema uses pgSchema to define tables within a specific PostgreSQL schema.
 * The schema name is determined at runtime from environment variables:
 * - Dev: pims_<username> (e.g., pims_johndoe)
 * - Prod: pims
 *
 * ID Format: All primary keys use ULIDs (Universally Unique Lexicographically Sortable Identifiers)
 * - 26 characters, Crockford's Base32 encoding
 * - Time-sortable (first 10 chars = timestamp, last 16 = randomness)
 * - Requires the generate_ulid() PostgreSQL function
 */

import { pgSchema, varchar, text, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// SCHEMA DEFINITION
// =============================================================================

/**
 * Determine the PostgreSQL schema name from environment variables.
 * This must match the logic in drizzle.config.ts and drizzle-with-auth.ts
 */
function getSchemaName(): string {
  // 1. Explicit override
  if (process.env.PGSCHEMA) {
    return process.env.PGSCHEMA;
  }

  // 2. Lakebase schema
  if (process.env.LAKEBASE_SCHEMA) {
    return process.env.LAKEBASE_SCHEMA;
  }

  // 3. Derive from PGUSER for Lakebase
  if (process.env.USE_LAKEBASE === "true" && process.env.PGUSER) {
    const username = process.env.PGUSER.split("@")[0];
    return `pims_${username}`;
  }

  // 4. Local dev without Lakebase
  const isLocalDev = process.env.NODE_ENV === "development" && !process.env.KEY_VAULT_NAME;
  if (isLocalDev && process.env.PGUSER) {
    const username = process.env.PGUSER.split("@")[0];
    return `pims_${username}`;
  }

  // 5. Default
  return "pims";
}

/**
 * The PostgreSQL schema for application tables.
 * IMPORTANT: This must be exported for drizzle-kit to properly track schema ownership.
 */
export const appSchemaName = getSchemaName();
export const appSchema = pgSchema(appSchemaName);

// =============================================================================
// OBJECT TYPE: Organization
// Represents: Top-level organizational entity (company, team, tenant)
// =============================================================================

export const organization = appSchema.table("organization", {
  // Primary key (always first) - ULID format
  id: varchar("id")
    .primaryKey()
    .default(sql`generate_ulid()`),

  // Core fields (business data)
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }),
  billingEmail: varchar("billing_email", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  timezone: varchar("timezone", { length: 50 }).notNull().default("America/New_York"),

  // Boolean fields
  isActive: boolean("is_active").notNull().default(true),

  // Audit fields (always last)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

  // Soft delete - null means not deleted
  deletedAt: timestamp("deleted_at"),
});

// Insert schema - omit auto-generated fields, add validation refinements
export const insertOrganizationSchema = createInsertSchema(organization, {
  // Require non-empty name
  name: (schema) => schema.min(1, "Organization name is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true, // Managed by soft delete, not user-settable
});

// =============================================================================
// OBJECT TYPE: User
// Represents: System users who can authenticate and perform actions
// =============================================================================

export const user = appSchema.table(
  "user",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`generate_ulid()`),
    email: varchar("email", { length: 255 }).unique().notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    profileImageUrl: varchar("profile_image_url", { length: 500 }),
    role: varchar("role", { length: 50 }).notNull().default("user"),

    // LINK: User → Organization (Many-to-One) - Organization membership
    organizationId: varchar("organization_id").references(() => organization.id),

    // LINK: User → User (Many-to-One) - Organizational hierarchy
    reportsToUserId: varchar("reports_to_user_id").references((): any => user.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    orgIdx: index("idx_user_organization").on(table.organizationId),
    emailIdx: index("idx_user_email").on(table.email),
  })
);

export const insertUserSchema = createInsertSchema(user).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// =============================================================================
// SUPPORTING TABLE: Session Storage
// Session management for authentication
// =============================================================================

export const session = appSchema.table(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: varchar("sess", { length: 10000 }).notNull(), // JSON string
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// =============================================================================
// SUPPORTING TABLE: Audit Log
// Tracks all entity changes for compliance and debugging
// =============================================================================

/**
 * Audit actions that can be logged
 */
export const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "soft_delete",
  "restore",
  "login",
  "logout",
  "action",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const auditLog = appSchema.table(
  "audit_log",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`generate_ulid()`),

    // What changed
    entityType: varchar("entity_type", { length: 100 }).notNull(), // e.g., "organization", "user"
    entityId: varchar("entity_id", { length: 50 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(), // create, update, delete, etc.

    // Who made the change
    userId: varchar("user_id", { length: 50 }),
    userEmail: varchar("user_email", { length: 255 }),

    // Change details
    previousData: jsonb("previous_data"), // State before change
    newData: jsonb("new_data"), // State after change
    changedFields: jsonb("changed_fields"), // List of fields that changed

    // Context
    requestId: varchar("request_id", { length: 50 }), // Correlation ID
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),

    // Timestamp
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("idx_audit_log_entity").on(table.entityType, table.entityId),
    userIdx: index("idx_audit_log_user").on(table.userId),
    createdAtIdx: index("idx_audit_log_created_at").on(table.createdAt),
  })
);

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Organization = typeof organization.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type UpdateOrganization = Partial<InsertOrganization> & { deletedAt?: Date | null };

export type User = typeof user.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// =============================================================================
// EXTENDED TYPES WITH RELATIONS
// =============================================================================

export type UserWithOrganization = User & {
  organization?: Organization | null;
  reportsTo?: User | null;
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const USER_ROLES = ["admin", "manager", "user"] as const;

export type UserRole = (typeof USER_ROLES)[number];
