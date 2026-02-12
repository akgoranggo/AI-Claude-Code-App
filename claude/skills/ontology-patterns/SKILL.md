---
name: ontology-patterns
description: Patterns for 1-ONTOLOGY work including database schemas, storage methods, and API endpoints
---

# Ontology Development Patterns

Patterns for 1-ONTOLOGY work: schemas, storage methods, API endpoints.

## Schema Pattern (shared/schema.ts)

```typescript
export const entity = appSchema.table("entity", {
  // Primary key
  id: varchar("id").primaryKey().default(sql`generate_ulid()`),

  // Foreign keys
  organizationId: varchar("organization_id").notNull().references(() => organization.id),

  // Core fields
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("Active"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  orgIdx: index("idx_entity_org").on(table.organizationId),
}));

// Zod schemas
export const insertEntitySchema = createInsertSchema(entity).omit({ id: true, createdAt: true, updatedAt: true });
export type Entity = typeof entity.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;
```

## Storage Pattern (server/storage.ts)

```typescript
// In IStorage interface
createEntity(data: InsertEntity): Promise<Entity>;
getEntityById(id: string): Promise<Entity | null>;
getEntitiesByOrganization(orgId: string, limit?: number, offset?: number): Promise<Entity[]>;
updateEntity(id: string, data: Partial<InsertEntity>): Promise<Entity | null>;
deleteEntity(id: string): Promise<boolean>;

// In DatabaseStorage class
async createEntity(data: InsertEntity): Promise<Entity> {
  const [result] = await db.insert(entity).values(data).returning();
  return result;
}

async getEntityById(id: string): Promise<Entity | null> {
  const [result] = await db.select().from(entity).where(eq(entity.id, id)).limit(1);
  return result || null;
}

async getEntitiesByOrganization(orgId: string, limit = 50, offset = 0): Promise<Entity[]> {
  return db.select().from(entity)
    .where(eq(entity.organizationId, orgId))
    .orderBy(desc(entity.createdAt))
    .limit(limit).offset(offset);
}
```

## API Pattern (server/routes.ts)

```typescript
// List with pagination
app.get("/api/entities", requireAuth, async (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) return res.status(400).json({ error: "Organization context required" });

  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  const entities = await storage.getEntitiesByOrganization(contextId, limit, offset);
  res.json(entities);
});

// Create with validation
app.post("/api/entities", requireAuth, async (req, res) => {
  const result = insertEntitySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues });

  const entity = await storage.createEntity(result.data);
  res.status(201).json(entity);
});

// Update with ownership check
app.patch("/api/entities/:id", requireAuth, async (req, res) => {
  const existing = await storage.getEntityById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  if (existing.organizationId !== getContextId(req)) return res.status(403).json({ error: "Access denied" });

  const updated = await storage.updateEntity(req.params.id, req.body);
  res.json(updated);
});

// Action endpoint
app.post("/api/entities/:id/complete", requireAuth, async (req, res) => {
  const result = await storage.completeEntity(req.params.id);
  res.json(result);
});
```

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Table | singular, snake_case | `user`, `schedule_block` |
| Junction | `entity1_entity2` | `user_role` |
| API | plural, kebab-case | `/api/users` |
| Action | `POST /:id/{verb}` | `/api/tasks/:id/complete` |

## Security Checklist

- Validate all input with Zod
- Check resource ownership before returning data
- Validate pagination (limit 1-100, offset ≥ 0)
- Handle unique constraint errors (409)
- Use parameterized queries (Drizzle handles this)
