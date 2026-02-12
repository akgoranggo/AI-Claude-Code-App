/**
 * Storage Layer - Data Access Interface
 *
 * This layer abstracts database operations and provides a clean API for routes.
 * All database queries should go through this layer.
 *
 * Pattern: Interface-based design allows for easy mocking in tests and
 * potential swapping of database implementations.
 */

import { db } from "./db";
import { eq, isNull, and } from "drizzle-orm";
import {
  organization,
  user,
  type Organization,
  type InsertOrganization,
  type UpdateOrganization,
  type User,
  type InsertUser,
} from "@shared/schema";

// =============================================================================
// Types
// =============================================================================

/**
 * Type for upserting users - includes id since upsert needs it for conflict resolution
 */
type UpsertUser = InsertUser & { id: string };

/**
 * Paginated result type for list endpoints.
 * Includes total count to support UI pagination controls.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Storage Interface
 * Defines all data access methods available to the application.
 *
 * Add your Object Type CRUD methods here following this pattern:
 * - create{ObjectType}(data): Create a new record
 * - get{ObjectType}(id): Get a single record by ID
 * - getAll{ObjectType}s(): List all records
 * - update{ObjectType}(id, data): Update a record
 * - delete{ObjectType}(id): Delete a record
 */
export interface IStorage {
  // ========== Organization ==========
  createOrganization(data: InsertOrganization): Promise<Organization>;
  getAllOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | null>;
  updateOrganization(id: string, data: UpdateOrganization): Promise<Organization>;

  // ========== User ==========
  upsertUser(user: UpsertUser): Promise<void>;
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
}

/**
 * Database Storage Implementation
 * Implements all storage methods using Drizzle ORM
 */
class DatabaseStorage implements IStorage {
  // ===========================================================================
  // ORGANIZATION
  // ===========================================================================

  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const [entity] = await db.insert(organization).values(data).returning();
    if (!entity) throw new Error("Failed to create organization");
    return entity;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return db
      .select()
      .from(organization)
      .where(isNull(organization.deletedAt))
      .orderBy(organization.name);
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const [entity] = await db
      .select()
      .from(organization)
      .where(and(eq(organization.id, id), isNull(organization.deletedAt)))
      .limit(1);
    return entity ?? null;
  }

  async updateOrganization(id: string, data: UpdateOrganization): Promise<Organization> {
    const [entity] = await db
      .update(organization)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organization.id, id))
      .returning();
    if (!entity) throw new Error(`Organization ${id} not found`);
    return entity;
  }

  // ===========================================================================
  // USER
  // ===========================================================================

  async upsertUser(userData: UpsertUser): Promise<void> {
    await db
      .insert(user)
      .values(userData)
      .onConflictDoUpdate({
        target: user.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      });
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(user).orderBy(user.firstName);
  }

  async getUserById(id: string): Promise<User | null> {
    const [result] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return result || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [result] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return result || null;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
