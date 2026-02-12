# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an enterprise web application template built on an ontology-driven architecture. The codebase is a full-stack TypeScript monorepo with React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

**Use this template to build new web applications with AI assistance.**

## Build & Development Commands

```bash
# Development
npm run dev              # Start both Vite (port 3000) and Express (port 5000) concurrently
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push schema directly to database (development)
npm run db:generate      # Generate migration from schema changes
npm run db:migrate       # Run migrations (production)
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed          # Seed database with example data
npm run db:seed:fresh    # Drop and recreate database with seed data

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode

# Production
npm run build            # Build frontend (Vite) + bundle server (esbuild) to dist/
npm run start            # Run production server from dist/index.js
```

## Architecture

### Ontology-Driven Design

The domain model is defined through three core concepts that map directly to code:

| Concept                   | Database                        | API                                 | Frontend                |
| ------------------------- | ------------------------------- | ----------------------------------- | ----------------------- |
| **Object Types** (nouns)  | Tables in `shared/schema.ts`    | CRUD endpoints `/api/{resource}`    | List/Detail pages       |
| **Links** (relationships) | Foreign keys or junction tables | Nested responses or link endpoints  | Dropdowns, multi-select |
| **Actions** (verbs)       | Methods in `server/storage.ts`  | `POST /api/{resource}/:id/{action}` | Action buttons          |

### Key Files

- `shared/schema.ts` - Drizzle ORM schema definitions (Object Types, Links), Zod validation schemas, type exports
- `server/routes.ts` - Express API routes, authentication setup, CRUD and action endpoints
- `server/storage.ts` - Data access layer implementing `IStorage` interface with Drizzle queries
- `server/db.ts` - Database connection configuration
- `client/src/App.tsx` - React router setup with Wouter
- `client/src/components/ui/` - shadcn/ui components (50+ accessible components)

### Data Flow

```
Frontend (React + TanStack Query)
       ↓ HTTP/JSON
Backend (Express + Passport.js)
       ↓ Drizzle ORM
PostgreSQL (Lakebase or Neon)
```

## Naming Conventions

- **Database tables**: Singular, lowercase (`user`, `item`, `comment`)
- **Junction tables**: `object1_object2` (`item_follower`, `user_project`)
- **API endpoints**: Plural (`/api/items`, `/api/users`)
- **Action endpoints**: `POST /api/{resource}/:id/{verb}` (`/api/items/:id/complete`)
- **React pages**: PascalCase (`TaskList.tsx`, `ItemDetail.tsx`)
- **Custom hooks**: camelCase with `use` prefix (`useTasks.ts`)

## Database

- Uses ULID for primary keys (time-sortable, 26-character unique IDs)
- Two deployment modes:
  - Standard PostgreSQL via `DATABASE_URL`
  - Azure Databricks Lakebase with `USE_LAKEBASE=true` (includes OAuth token refresh)
- Local development can use mock auth based on `PGUSER` environment variable

## Adding Features

When implementing new functionality, follow this pattern:

1. **Schema** (`shared/schema.ts`): Add table definition with appropriate columns and relations
2. **Storage** (`server/storage.ts`): Add methods to `IStorage` interface and `DatabaseStorage` class
3. **Routes** (`server/routes.ts`): Add API endpoints using the storage methods
4. **Pages** (`client/src/pages/`): Create React components for list/detail views
5. **Router** (`client/src/App.tsx`): Register new routes

### Example: Adding a New Object Type

```typescript
// 1. Schema (shared/schema.ts)
export const task = appSchema.table("task", {
  id: varchar("id").primaryKey().default(sql`generate_ulid()`),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  createdById: varchar("created_by_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Storage (server/storage.ts)
async createTask(data: InsertTask): Promise<Task> {
  const [result] = await db.insert(task).values(data).returning();
  return result;
}

// 3. Routes (server/routes.ts)
app.post("/api/tasks", requireAuth, async (req, res) => {
  const validated = insertTaskSchema.parse(req.body);
  const task = await storage.createTask(validated);
  res.status(201).json(task);
});
```

## Security Best Practices

### API Security

- Always verify resource ownership before returning data
- Validate all input with Zod schemas
- Use rate limiting for search and expensive endpoints
- Return specific HTTP status codes (400, 403, 404, 409, 500)

### Code Patterns

```typescript
// Validate pagination with safe defaults
const limit = Math.min(Math.max(parsedLimit || DEFAULT, 1), MAX);
const offset = Math.max(parsedOffset || 0, 0);

// Handle unique constraint violations
if (isUniqueConstraintError(error)) {
  return res.status(409).json({ error: "Email already exists" });
}
```

## Code Quality Standards

### Constants

- Extract magic numbers to named constants with JSDoc comments
- Group related constants together at the top of files
- Use `as const` for readonly arrays

### Error Handling

- Return specific HTTP status codes
- Include descriptive error messages
- Handle database constraint violations gracefully

### Testing

- Write tests for storage methods and API endpoints
- Test edge cases: empty results, not found, validation errors

## Documentation

- `docs/REQUIREMENTS-TEMPLATE.md` - Template for defining ontologies (Object Types, Links, Actions)
- `docs/AI-PROMPTS.md` - Prompt templates for AI-assisted development

## Current Schema

The template includes these base Object Types:

| Object Type      | Purpose                                    |
| ---------------- | ------------------------------------------ |
| **User**         | System users with authentication and roles |
| **Organization** | Top-level multi-tenant entity              |
| **Session**      | Authentication session storage             |

Add your domain-specific Object Types following the patterns in `shared/schema.ts`.
