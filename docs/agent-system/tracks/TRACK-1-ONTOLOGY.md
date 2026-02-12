# Track 1: Ontology (Schema, Storage, API)

> **Data Layer Implementation** - Database schemas, storage methods, and API endpoints.

## Purpose

Track 1 issues implement the **data layer** of the application: Object Types (database tables), relationships between them, storage methods for data access, and API endpoints that expose this functionality to the frontend.

**Label:** `1-ONTOLOGY`

**Foundation Track:** Track 2 and Track 3 depend on Track 1 being complete.

---

## When to Use Track 1

Use Track 1 for issues that involve:

### Object Types (Database Tables)
- Creating new database tables
- Adding fields to existing tables
- Modifying table schemas
- Setting up relationships (foreign keys, junction tables)

**Example issues:**
- "Create User table with authentication fields"
- "Add organization relationship to Resource table"
- "Create junction table for user_project many-to-many"

### Storage Methods (Data Access Layer)
- CRUD operations (Create, Read, Update, Delete)
- Query methods for data retrieval
- Methods implementing business logic
- Data validation at storage layer

**Example issues:**
- "Implement getUserById and getUserByEmail storage methods"
- "Add createResource method with organization scoping"
- "Implement search method for resources by type"

### API Endpoints (Backend Routes)
- REST API endpoints exposing storage methods
- Request/response validation
- Authentication and authorization
- Error handling

**Example issues:**
- "Create POST /api/resources endpoint"
- "Add GET /api/resources/:id endpoint with auth"
- "Implement action endpoint POST /api/resources/:id/activate"

---

## Patterns to Follow

### 1. Schema Pattern

**File:** `shared/schema.ts`

**Reference:** See [PATTERNS.md](../PATTERNS.md) - Schema Definitions section

**Key requirements:**
- Use Drizzle ORM table definitions
- Use ULID for primary keys: `varchar("id").primaryKey().default(sql\`generate_ulid()\`)`
- Include timestamps: `createdAt`, `updatedAt` with `defaultNow()`
- Foreign keys reference parent table with `.references(() => parentTable.id)`
- Export both insert and select schemas using Zod: `createInsertSchema`, `createSelectSchema`

**Example structure:**
```typescript
export const resourceTable = appSchema.table("resource", {
  id: varchar("id").primaryKey().default(sql`generate_ulid()`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  organizationId: varchar("organization_id").notNull()
    .references(() => organizationTable.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const resourceRelations = relations(resourceTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [resourceTable.organizationId],
    references: [organizationTable.id],
  }),
}));

// Zod schemas
export const insertResourceSchema = createInsertSchema(resourceTable);
export const selectResourceSchema = createSelectSchema(resourceTable);
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = z.infer<typeof selectResourceSchema>;
```

---

### 2. Storage Pattern

**File:** `server/storage.ts`

**Reference:** See [PATTERNS.md](../PATTERNS.md) - Storage Methods section

**Key requirements:**
- Add methods to `IStorage` interface first
- Implement in `DatabaseStorage` class
- Use Drizzle query builder
- Always scope by organization where applicable
- Handle errors gracefully
- Return typed results

**Example structure:**
```typescript
// In IStorage interface
interface IStorage {
  // ... existing methods
  createResource(data: InsertResource): Promise<Resource>;
  getResourceById(id: string, organizationId: string): Promise<Resource | null>;
  listResources(organizationId: string): Promise<Resource[]>;
  updateResource(id: string, organizationId: string, data: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: string, organizationId: string): Promise<void>;
}

// In DatabaseStorage class
async createResource(data: InsertResource): Promise<Resource> {
  const [resource] = await this.db
    .insert(resourceTable)
    .values(data)
    .returning();
  return resource;
}

async getResourceById(id: string, organizationId: string): Promise<Resource | null> {
  const resource = await this.db
    .select()
    .from(resourceTable)
    .where(
      and(
        eq(resourceTable.id, id),
        eq(resourceTable.organizationId, organizationId)
      )
    )
    .limit(1);
  return resource[0] || null;
}
```

---

### 3. API Route Pattern

**File:** `server/routes.ts`

**Reference:** See [PATTERNS.md](../PATTERNS.md) - API Endpoints section

**Key requirements:**
- Use `requireAuth` middleware for authenticated endpoints
- Validate request body with Zod schemas
- Check resource ownership (organization scoping)
- Return appropriate HTTP status codes (200, 201, 400, 403, 404, 500)
- Handle errors with specific messages
- Use async/await

**Example structure:**
```typescript
// CRUD endpoints
app.post("/api/resources", requireAuth, async (req, res) => {
  try {
    const validated = insertResourceSchema.parse(req.body);

    // Add organization from authenticated user
    const data = {
      ...validated,
      organizationId: req.user.organizationId,
    };

    const resource = await storage.createResource(data);
    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create resource" });
  }
});

app.get("/api/resources/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await storage.getResourceById(id, req.user.organizationId);

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

// Action endpoint
app.post("/api/resources/:id/activate", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await storage.getResourceById(id, req.user.organizationId);

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const updated = await storage.updateResource(id, req.user.organizationId, {
      isActive: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to activate resource" });
  }
});
```

---

## Validation Requirements

Before marking Track 1 work complete, verify:

### Schema Validation
- [ ] Table uses singular, lowercase name
- [ ] Primary key uses ULID with `generate_ulid()` default
- [ ] Foreign keys have proper references
- [ ] Timestamps included (`createdAt`, `updatedAt`)
- [ ] Relations defined if applicable
- [ ] Zod insert and select schemas exported
- [ ] TypeScript types exported

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Schema section

### Storage Validation
- [ ] Methods added to `IStorage` interface
- [ ] Methods implemented in `DatabaseStorage` class
- [ ] Organization scoping applied where needed
- [ ] Errors handled gracefully
- [ ] Return types match interface
- [ ] Query uses Drizzle query builder (not raw SQL)

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Storage section

### API Validation
- [ ] Authentication required (`requireAuth` middleware)
- [ ] Request body validated with Zod schemas
- [ ] Organization scoping checked
- [ ] Proper HTTP status codes returned
- [ ] Error messages are clear and specific
- [ ] Async/await used correctly
- [ ] All CRUD endpoints created (if applicable)

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - API section

### Testing
- [ ] Unit tests for storage methods
- [ ] Integration tests for API endpoints
- [ ] Tests cover happy path and error cases
- [ ] Tests verify organization scoping
- [ ] All tests passing (`npm run test`)

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Testing section

---

## Common Pitfalls

### 1. Forgetting Organization Scoping

**Problem:** Creating endpoints that don't check organization ownership

**Example of issue:**
```typescript
// BAD: No organization check
app.get("/api/resources/:id", requireAuth, async (req, res) => {
  const resource = await storage.getResourceById(req.params.id);
  res.json(resource);
});
```

**Solution:**
```typescript
// GOOD: Organization scoped
app.get("/api/resources/:id", requireAuth, async (req, res) => {
  const resource = await storage.getResourceById(
    req.params.id,
    req.user.organizationId  // ← Add organization check
  );

  if (!resource) {
    return res.status(404).json({ error: "Resource not found" });
  }

  res.json(resource);
});
```

---

### 2. Missing Error Handling

**Problem:** Not handling validation or database errors

**Example of issue:**
```typescript
// BAD: No error handling
app.post("/api/resources", requireAuth, async (req, res) => {
  const resource = await storage.createResource(req.body);
  res.json(resource);
});
```

**Solution:**
```typescript
// GOOD: Proper error handling
app.post("/api/resources", requireAuth, async (req, res) => {
  try {
    const validated = insertResourceSchema.parse(req.body);
    const data = { ...validated, organizationId: req.user.organizationId };
    const resource = await storage.createResource(data);
    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create resource" });
  }
});
```

---

### 3. Wrong HTTP Status Codes

**Problem:** Returning 200 for all responses

**Correct status codes:**
- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST creating new resource
- `400 Bad Request` - Invalid input (validation failed)
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource (unique constraint)
- `500 Internal Server Error` - Server/database error

---

### 4. Not Using Zod Validation

**Problem:** Skipping request validation

**Example of issue:**
```typescript
// BAD: No validation
app.post("/api/resources", requireAuth, async (req, res) => {
  const resource = await storage.createResource(req.body);
  res.json(resource);
});
```

**Solution:**
```typescript
// GOOD: Zod validation
app.post("/api/resources", requireAuth, async (req, res) => {
  try {
    const validated = insertResourceSchema.parse(req.body);  // ← Validate
    const data = { ...validated, organizationId: req.user.organizationId };
    const resource = await storage.createResource(data);
    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create resource" });
  }
});
```

---

### 5. Using Raw SQL Instead of Query Builder

**Problem:** Writing raw SQL queries

**Example of issue:**
```typescript
// BAD: Raw SQL
async getResourceById(id: string): Promise<Resource | null> {
  const result = await this.db.execute(`SELECT * FROM resource WHERE id = $1`, [id]);
  return result[0] || null;
}
```

**Solution:**
```typescript
// GOOD: Drizzle query builder
async getResourceById(id: string, organizationId: string): Promise<Resource | null> {
  const resource = await this.db
    .select()
    .from(resourceTable)
    .where(
      and(
        eq(resourceTable.id, id),
        eq(resourceTable.organizationId, organizationId)
      )
    )
    .limit(1);
  return resource[0] || null;
}
```

---

## Examples from Codebase

Reference these existing implementations as examples:

### Object Type Example
**File:** `shared/schema.ts`
**Lines:** User table definition
**What to learn:** Proper schema structure, relations, Zod exports

### Storage Method Example
**File:** `server/storage.ts`
**Method:** `getUserById`, `createUser`
**What to learn:** Query structure, organization scoping, error handling

### API Endpoint Example
**File:** `server/routes.ts`
**Endpoints:** `/api/users/*` routes
**What to learn:** Authentication, validation, status codes, error responses

---

## UAT Requirements for Track 1

When preparing UAT instructions for Track 1 work:

1. **Provide API testing commands:**
   - cURL commands for each endpoint
   - Example request bodies
   - Expected response shapes

2. **Explain how to verify data:**
   - Use Drizzle Studio (`npm run db:studio`)
   - Check that data persists correctly
   - Verify relationships work

3. **Include error case testing:**
   - Invalid inputs (validation should reject)
   - Unauthorized access (should return 403)
   - Non-existent resources (should return 404)

**See:** [UAT-ENABLEMENT.md](../UAT-ENABLEMENT.md) for Track 1 UAT template

---

## Related Documentation

- **Core Patterns:** [PATTERNS.md](../PATTERNS.md) - Complete pattern reference
- **Validation:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Pre-completion checks
- **UAT Guide:** [UAT-ENABLEMENT.md](../UAT-ENABLEMENT.md) - Preparing UAT instructions
- **Agent Guide:** [AGENT-GUIDE.md](../AGENT-GUIDE.md) - General implementation principles
- **Quick Start:** [QUICK-START.md](../QUICK-START.md) - Getting started workflow
