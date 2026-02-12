# Code Patterns

This document defines the code patterns that all agents must follow. Consistency across the codebase enables parallel development and reduces merge conflicts.

---

## Schema Pattern (Object Types)

```typescript
// =============================================================================
// OBJECT TYPE: ExampleEntity
// Represents: Description of what this entity represents
// =============================================================================

export const exampleEntity = pgTable(
  "example_entity",
  {
    // Primary key (always first) - ULID format
    id: varchar("id")
      .primaryKey()
      .default(sql`generate_ulid()`),

    // Foreign keys (grouped together)
    clinicId: varchar("clinic_id")
      .notNull()
      .references(() => clinic.id),
    patientId: varchar("patient_id").references(() => patient.id),
    createdByStaffId: varchar("created_by_staff_id").references(() => staffUser.id),

    // Core fields (business data)
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("Active"),
    description: text("description"),

    // Optional numeric fields
    amount: decimal("amount", { precision: 10, scale: 2 }),
    quantity: integer("quantity").default(1),

    // Boolean fields
    isActive: boolean("is_active").notNull().default(true),

    // JSON fields (typed with $type)
    metadata: json("metadata").$type<{ key: string; value: string }[]>(),

    // Audit fields (always last)
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Indexes - name format: idx_{table}_{column}
    clinicIdx: index("idx_example_entity_clinic").on(table.clinicId),
    statusIdx: index("idx_example_entity_status").on(table.status),
  })
);

// Insert schema - omit auto-generated fields
export const insertExampleEntitySchema = createInsertSchema(exampleEntity).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type ExampleEntity = typeof exampleEntity.$inferSelect;
export type InsertExampleEntity = z.infer<typeof insertExampleEntitySchema>;
```

---

## Junction Table Pattern (Links)

```typescript
// =============================================================================
// LINK: ClientPatient (Many-to-Many)
// Represents: Relationship between clients and patients (household structure)
// =============================================================================

export const clientPatient = pgTable(
  "client_patient",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`generate_ulid()`),
    clientId: varchar("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "cascade" }),
    patientId: varchar("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    relationshipType: varchar("relationship_type", { length: 50 }).notNull().default("Owner"),
    isPrimaryOwner: boolean("is_primary_owner").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    clientIdx: index("idx_client_patient_client").on(table.clientId),
    patientIdx: index("idx_client_patient_patient").on(table.patientId),
    uniqueIdx: unique("idx_client_patient_unique").on(table.clientId, table.patientId),
  })
);

export const insertClientPatientSchema = createInsertSchema(clientPatient).omit({
  id: true,
  createdAt: true,
});

export type ClientPatient = typeof clientPatient.$inferSelect;
export type InsertClientPatient = z.infer<typeof insertClientPatientSchema>;
```

---

## Storage Interface Pattern

```typescript
// In server/storage.ts

// Interface method signatures (grouped by entity)
interface IStorage {
  // ========== ExampleEntity ==========
  createExampleEntity(data: InsertExampleEntity): Promise<ExampleEntity>;
  getExampleEntity(id: string): Promise<ExampleEntity | null>;
  getExampleEntitiesByClinic(clinicId: string): Promise<ExampleEntity[]>;
  updateExampleEntity(id: string, data: Partial<InsertExampleEntity>): Promise<ExampleEntity>;
  deleteExampleEntity(id: string): Promise<void>;

  // Actions
  completeExampleEntity(id: string, staffUserId: string): Promise<ExampleEntity>;
}
```

---

## Storage Implementation Pattern

```typescript
// In server/storage.ts (DatabaseStorage class)

class DatabaseStorage implements IStorage {
  // ========== ExampleEntity ==========

  async createExampleEntity(data: InsertExampleEntity): Promise<ExampleEntity> {
    const [entity] = await db.insert(exampleEntity).values(data).returning();
    return entity;
  }

  async getExampleEntity(id: string): Promise<ExampleEntity | null> {
    const [entity] = await db.select().from(exampleEntity).where(eq(exampleEntity.id, id)).limit(1);
    return entity ?? null;
  }

  async getExampleEntitiesByClinic(clinicId: string): Promise<ExampleEntity[]> {
    return db
      .select()
      .from(exampleEntity)
      .where(eq(exampleEntity.clinicId, clinicId))
      .orderBy(desc(exampleEntity.createdAt));
  }

  async updateExampleEntity(
    id: string,
    data: Partial<InsertExampleEntity>
  ): Promise<ExampleEntity> {
    const [entity] = await db
      .update(exampleEntity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(exampleEntity.id, id))
      .returning();
    if (!entity) throw new Error(`ExampleEntity ${id} not found`);
    return entity;
  }

  async deleteExampleEntity(id: string): Promise<void> {
    await db.delete(exampleEntity).where(eq(exampleEntity.id, id));
  }

  // Action: Complete
  async completeExampleEntity(id: string, staffUserId: string): Promise<ExampleEntity> {
    const [entity] = await db
      .update(exampleEntity)
      .set({
        status: "Completed",
        completedAt: new Date(),
        completedByStaffId: staffUserId,
        updatedAt: new Date(),
      })
      .where(eq(exampleEntity.id, id))
      .returning();
    if (!entity) throw new Error(`ExampleEntity ${id} not found`);
    return entity;
  }
}
```

---

## API Route Pattern

```typescript
// In server/routes.ts or server/routes/example.ts

import { Router } from "express";
import { z } from "zod";
import { insertExampleEntitySchema } from "@shared/schema";

const router = Router();

// GET /api/examples - List all (filtered by clinic)
router.get("/", async (req, res) => {
  try {
    const clinicId = req.staffUser?.currentClinicId;
    if (!clinicId) return res.status(400).json({ error: "Clinic context required" });

    const entities = await storage.getExampleEntitiesByClinic(clinicId);
    res.json(entities);
  } catch (error) {
    console.error("GET /api/examples error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/examples/:id - Get one
router.get("/:id", async (req, res) => {
  try {
    const entity = await storage.getExampleEntity(req.params.id);
    if (!entity) return res.status(404).json({ error: "Not found" });
    res.json(entity);
  } catch (error) {
    console.error("GET /api/examples/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/examples - Create
router.post("/", async (req, res) => {
  try {
    const validated = insertExampleEntitySchema.parse(req.body);
    const entity = await storage.createExampleEntity({
      ...validated,
      clinicId: req.staffUser?.currentClinicId,
      createdByStaffId: req.staffUser?.id,
    });
    res.status(201).json(entity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("POST /api/examples error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/examples/:id - Update
router.patch("/:id", async (req, res) => {
  try {
    const validated = insertExampleEntitySchema.partial().parse(req.body);
    const entity = await storage.updateExampleEntity(req.params.id, validated);
    res.json(entity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("PATCH /api/examples/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/examples/:id - Delete
router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteExampleEntity(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/examples/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/examples/:id/complete - Action
router.post("/:id/complete", async (req, res) => {
  try {
    const staffUserId = req.staffUser?.id;
    if (!staffUserId) return res.status(401).json({ error: "Authentication required" });

    const entity = await storage.completeExampleEntity(req.params.id, staffUserId);
    res.json(entity);
  } catch (error) {
    console.error("POST /api/examples/:id/complete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
```

---

## React Component Pattern

```typescript
// In client/src/components/example/ExampleCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExampleEntity } from "@shared/schema";

interface ExampleCardProps {
  example: ExampleEntity;
  onSelect?: (id: string) => void;
  className?: string;
}

export function ExampleCard({ example, onSelect, className }: ExampleCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:bg-accent/50 min-h-[48px] transition-colors",
        className
      )}
      onClick={() => onSelect?.(example.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{example.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge
          variant={example.status === "Completed" ? "success" : "secondary"}
        >
          {example.status}
        </Badge>
      </CardContent>
    </Card>
  );
}
```

---

## Custom Hook Pattern

```typescript
// In client/src/hooks/useExamples.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExampleEntity, InsertExampleEntity } from "@shared/schema";

const API_BASE = "/api/examples";

async function fetchExamples(): Promise<ExampleEntity[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch examples");
  return res.json();
}

async function createExample(data: InsertExampleEntity): Promise<ExampleEntity> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create example");
  return res.json();
}

export function useExamples() {
  return useQuery({
    queryKey: ["examples"],
    queryFn: fetchExamples,
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examples"] });
    },
  });
}

export function useCompleteExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to complete example");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examples"] });
    },
  });
}
```

---

## Page Component Pattern

```typescript
// In client/src/pages/ExampleList.tsx

import { useState } from "react";
import { useExamples, useCreateExample } from "@/hooks/useExamples";
import { ExampleCard } from "@/components/example/ExampleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";

export default function ExampleList() {
  const { data: examples, isLoading, error } = useExamples();
  const createExample = useCreateExample();
  const [newName, setNewName] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        Error loading examples: {error.message}
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createExample.mutateAsync({ name: newName });
    setNewName("");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Examples</h1>
        <div className="flex gap-2">
          <Input
            placeholder="New example name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={handleCreate}
            disabled={createExample.isPending || !newName.trim()}
          >
            {createExample.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {examples?.map((example) => (
          <ExampleCard key={example.id} example={example} />
        ))}
      </div>
    </div>
  );
}
```

---

## Test Pattern

```typescript
// In server/__tests__/example.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../db";
import { exampleEntity } from "@shared/schema";
import { storage } from "../storage";

describe("ExampleEntity Storage", () => {
  const testClinicId = "01HTEST000000000000CLINIC";
  let createdIds: string[] = [];

  beforeEach(() => {
    createdIds = [];
  });

  afterEach(async () => {
    // Clean up test data
    for (const id of createdIds) {
      await db.delete(exampleEntity).where(eq(exampleEntity.id, id));
    }
  });

  it("creates an example entity", async () => {
    const entity = await storage.createExampleEntity({
      clinicId: testClinicId,
      name: "Test Example",
    });
    createdIds.push(entity.id);

    expect(entity.id).toBeDefined();
    expect(entity.name).toBe("Test Example");
    expect(entity.status).toBe("Active");
    expect(entity.clinicId).toBe(testClinicId);
  });

  it("retrieves example by ID", async () => {
    const created = await storage.createExampleEntity({
      clinicId: testClinicId,
      name: "Retrieve Test",
    });
    createdIds.push(created.id);

    const retrieved = await storage.getExampleEntity(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.name).toBe("Retrieve Test");
  });

  it("returns null for non-existent ID", async () => {
    const result = await storage.getExampleEntity("nonexistent");
    expect(result).toBeNull();
  });

  it("updates an example entity", async () => {
    const created = await storage.createExampleEntity({
      clinicId: testClinicId,
      name: "Before Update",
    });
    createdIds.push(created.id);

    const updated = await storage.updateExampleEntity(created.id, {
      name: "After Update",
    });

    expect(updated.name).toBe("After Update");
    expect(updated.updatedAt).not.toEqual(created.updatedAt);
  });

  it("completes an example entity", async () => {
    const created = await storage.createExampleEntity({
      clinicId: testClinicId,
      name: "To Complete",
    });
    createdIds.push(created.id);

    const completed = await storage.completeExampleEntity(created.id, "01HTEST000000000000STAFF");

    expect(completed.status).toBe("Completed");
    expect(completed.completedAt).toBeDefined();
  });
});
```

---

## Constants Pattern

```typescript
// In shared/schema.ts (bottom of file)

// Status constants for ExampleEntity
export const EXAMPLE_STATUSES = ["Active", "InProgress", "Completed", "Cancelled"] as const;

export type ExampleStatus = (typeof EXAMPLE_STATUSES)[number];

// Urgency constants (reusable)
export const URGENCY_LEVELS = ["Low", "Normal", "High", "Urgent"] as const;

export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
```

---

## Import Order Convention

```typescript
// 1. Node built-ins
import { readFile } from "fs/promises";

// 2. External packages
import { Router } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

// 3. Shared imports (aliased)
import { exampleEntity, insertExampleEntitySchema } from "@shared/schema";
import type { ExampleEntity } from "@shared/schema";

// 4. Internal imports
import { db } from "../db";
import { storage } from "../storage";

// 5. Relative imports
import { validateRequest } from "./middleware";
```

---

## Error Handling Pattern

```typescript
// Custom error class for business logic errors
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "BusinessError";
  }
}

// Usage in storage
async completeExampleEntity(id: string, staffUserId: string): Promise<ExampleEntity> {
  const entity = await this.getExampleEntity(id);
  if (!entity) {
    throw new BusinessError("Entity not found", "NOT_FOUND", 404);
  }
  if (entity.status === "Completed") {
    throw new BusinessError("Entity already completed", "ALREADY_COMPLETED", 400);
  }
  // ... complete logic
}

// Usage in routes
router.post("/:id/complete", async (req, res) => {
  try {
    const entity = await storage.completeExampleEntity(req.params.id, req.staffUser.id);
    res.json(entity);
  } catch (error) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
    }
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

## Audit Trail Pattern

```typescript
// For entities that need audit trails
export const exampleStatusChange = pgTable(
  "example_status_change",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`generate_ulid()`),
    exampleEntityId: varchar("example_entity_id")
      .notNull()
      .references(() => exampleEntity.id, { onDelete: "cascade" }),
    fromStatus: varchar("from_status", { length: 50 }).notNull(),
    toStatus: varchar("to_status", { length: 50 }).notNull(),
    changedByStaffId: varchar("changed_by_staff_id")
      .notNull()
      .references(() => staffUser.id),
    reason: text("reason"),
    changedAt: timestamp("changed_at").defaultNow(),
  },
  (table) => ({
    entityIdx: index("idx_example_status_change_entity").on(table.exampleEntityId),
  })
);
```
