# Agent Development Guide

> **Note:** This is a template guide. Replace placeholders like `[PROJECT_NAME]`, `[brief description]`, and examples with your project-specific information.

## Your Role

You are an AI coding agent working on **[PROJECT_NAME]**. Multiple agents work in parallel on different Linear issues across three tracks. This guide ensures consistency and quality across all agent contributions.

## Prerequisites

Before working on this project, ensure you have the following installed and configured:

| Tool              | Purpose                       | Installation                                                                      |
| ----------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| Node.js (v18+)    | Runtime                       | [nodejs.org](https://nodejs.org)                                                  |
| GitHub CLI (`gh`) | PR creation, issue management | `winget install GitHub.cli` (Windows) or [cli.github.com](https://cli.github.com) |

### GitHub CLI Setup

The GitHub CLI is required for creating pull requests via `/create-pr`:

```bash
# Install (Windows)
winget install GitHub.cli

# Install (macOS)
brew install gh

# Install (Linux)
# See https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate (required)
gh auth login
```

---

## Project Context

[PROJECT_NAME] is [brief description]:

- [Key feature or goal 1]
- [Key feature or goal 2]
- Uses an **ontology-driven architecture** (Object Types, Links, Actions)
- Is built with React + TypeScript frontend, Express + TypeScript backend, PostgreSQL + Drizzle ORM

### Repository Structure

```
project-root/
├── shared/schema.ts        # Drizzle ORM schema (Object Types, Links)
├── server/
│   ├── storage.ts          # DatabaseStorage class (IStorage interface)
│   ├── routes.ts           # Express API routes
│   └── middleware/         # Auth and RBAC middleware
├── client/src/
│   ├── pages/              # React page components
│   ├── components/         # Reusable UI components
│   └── hooks/              # Custom React hooks
└── docs/
    ├── [SPEC-DOCS]         # Technical specifications (optional)
    └── agent-system/       # Agent orchestration
```

---

## Before You Start ANY Linear Issue

1. **Read the Linear issue completely** (fetched automatically via Linear MCP)
2. **Check dependencies** — don't start if blockers aren't complete (checked automatically)
3. **You're working on a feature branch with its own worktree** — Branch name from Linear's `branchName` field
   - You have your own branch (isolated from main)
   - Changes won't conflict with other issues
   - You can build and test independently
4. **Read related files** — understand current state before making changes
5. **Check PATTERNS.md** — follow established code patterns exactly (if available)

---

## Core Principles

### 1. Follow the Ontology-Driven Architecture

The domain model is defined through three core concepts:

| Concept                   | Database                        | API                                 | Frontend                |
| ------------------------- | ------------------------------- | ----------------------------------- | ----------------------- |
| **Object Types** (nouns)  | Tables in `shared/schema.ts`    | CRUD endpoints `/api/{resource}`    | List/Detail pages       |
| **Links** (relationships) | Foreign keys or junction tables | Nested responses or link endpoints  | Dropdowns, multi-select |
| **Actions** (verbs)       | Methods in `server/storage.ts`  | `POST /api/{resource}/:id/{action}` | Action buttons          |

### 2. Schema Patterns

Always use these patterns when defining Object Types:

```typescript
// Schema definition pattern
export const exampleEntity = pgTable(
  "example_entity",
  {
    // Primary key (always first)
    id: varchar("id")
      .primaryKey()
      .default(sql`generate_ulid()`),

    // Foreign keys (grouped)
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id),

    // Core fields
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("Active"),

    // Audit fields (always last)
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    organizationIdx: index("idx_example_entity_organization").on(table.organizationId),
  })
);
```

### 3. Security First

All API endpoints must implement proper security:

```typescript
// 1. Validate tenant/organization context (dev mode only allows query param fallback)
function getContextId(req: ContextRequest): string | undefined {
  if (req.contextId) return req.contextId;
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return req.query.contextId as string | undefined;
  }
  return undefined;
}

// 2. Validate resource ownership before returning data
if (contextId && record.contextId !== contextId) {
  return res.status(403).json({ error: "Access denied to this resource" });
}

// 3. Validate pagination parameters
const limit = Math.min(Math.max(parsedLimit || 50, 1), 100);
const offset = Math.max(parsedOffset || 0, 0);

// 4. Handle unique constraint violations
if (isUniqueConstraintError(error)) {
  return res.status(409).json({ error: "Email already exists" });
}
```

### 4. No Side Effects

- Your issue is scoped — don't change files outside your scope
- If you find a bug elsewhere, note it in a Linear issue comment, don't fix it
- If you need something from another issue, wait for it

### 5. Self-Validate Before Completion

- **Use the validation command:** `/validate-issue {ISSUE_ID}` (if available)
- **OR manually:** Run the validation checklist in `VALIDATION-CHECKLIST.md` (if available)
- All tests must pass
- Code must compile with no TypeScript errors
- Lint must pass

### 6. Mobile-First UI Design

Design for mobile and tablet use cases where applicable:

**Touch Target Minimums:**

- Buttons: `min-h-[44px] min-w-[44px]` (Apple HIG)
- List items: `min-h-[48px]` with adequate spacing
- Form inputs: `min-h-[44px]`

**Considerations by Device:**

- **Mobile/Tablet**: Large touch targets, minimal scrolling, one-handed operation where possible
- **Desktop**: Keyboard-first navigation, dense data tables acceptable where appropriate

---

## File Ownership Rules

| Path                     | When You Can Modify                            |
| ------------------------ | ---------------------------------------------- |
| `shared/schema.ts`       | Only if WI explicitly includes schema work     |
| `server/storage.ts`      | Only for storage methods in your WI scope      |
| `server/routes.ts`       | Only for routes in your WI scope               |
| `server/middleware/*.ts` | Only if WI explicitly includes middleware work |
| `client/src/components/` | Only for components in your WI scope           |
| `client/src/pages/`      | Only for pages in your WI scope                |
| `client/src/hooks/`      | Only for hooks in your WI scope                |

---

## Conflict Avoidance

Multiple agents may work on the same files. To avoid conflicts:

1. **Schema additions** — Always ADD to the end of sections
2. **Storage methods** — Keep methods in alphabetical order within section
3. **Imports** — Use consistent ordering (external, internal, relative)
4. **Tests** — One test file per feature, named consistently
5. **Index files** — Add exports at the end, sorted alphabetically

---

## Track-Specific Guidance

**For comprehensive guidance on each track, see the dedicated track guides:**

### 1-ONTOLOGY (Track 1)

**See: [tracks/TRACK-1-ONTOLOGY.md](./tracks/TRACK-1-ONTOLOGY.md)**

Focus on data foundation:

- Schema definitions (Object Types)
- Foreign keys and junction tables (Links)
- Storage methods (IStorage interface + DatabaseStorage)
- API endpoints (CRUD + Action endpoints)
- Data validation with Zod

**Track 1 guide includes:** Schema patterns with references to PATTERNS.md, storage method patterns, API endpoint patterns, validation requirements, and common pitfalls with examples.

### 2-DESIGN-SYSTEM (Track 2)

**See: [tracks/TRACK-2-DESIGN-SYSTEM.md](./tracks/TRACK-2-DESIGN-SYSTEM.md)**

Focus on UI foundation:

- Design tokens (colors, typography, spacing)
- Base components (shadcn/ui customizations)
- Mobile-first responsive design
- Accessibility (ARIA, keyboard navigation)
- Component documentation

**Track 2 guide includes:** Component patterns, custom hook patterns, page patterns, validation requirements, common pitfalls, and complete shadcn/ui component reference.

### 3-TRACER-BULLETS (Track 3)

**See: [tracks/TRACK-3-TRACER-BULLETS.md](./tracks/TRACK-3-TRACER-BULLETS.md)**

Focus on end-to-end features:

- Connect ontology (Track 1) with UI (Track 2)
- Complete user workflows
- Integration with business logic
- User-facing pages and flows

**Track 3 guide includes:** Feature integration patterns, multi-step workflow patterns, data orchestration patterns, validation requirements, and critical pitfalls to avoid (like creating new backend logic).

---

## When You're Stuck

1. Check if the answer is in `PATTERNS.md` (if available)
2. Check if there are examples in the codebase or `docs/examples/` (if available)
3. Check the existing codebase for precedent
4. **Use the supervisor help command:** `/request-supervisor-help {ISSUE_ID} [your question]` (if available)
5. If truly blocked, add `// TODO: BLOCKED - [reason]` and document in the issue

---

## Naming Conventions

| Item             | Convention                  | Example                                     |
| ---------------- | --------------------------- | ------------------------------------------- |
| Database tables  | Singular, snake_case        | `user`, `order`, `product_category`         |
| Junction tables  | `entity1_entity2`           | `user_role`, `order_item`                   |
| API endpoints    | Plural, kebab-case          | `/api/users`, `/api/orders`                 |
| Action endpoints | `POST /:id/{verb}`          | `/api/orders/:id/complete`                  |
| React pages      | PascalCase                  | `UserDashboard.tsx`, `OrderDetail.tsx`      |
| React components | PascalCase                  | `OrderCard.tsx`, `UserForm.tsx`             |
| Custom hooks     | camelCase with `use` prefix | `useOrders.ts`, `useUserSearch.ts`          |
| Storage methods  | camelCase, verb first       | `createUser`, `getOrdersByOrganization`     |

---

## Key Files to Reference

- Project specification documents (if available) — Technical specifications and requirements
- `docs/agent-system/PATTERNS.md` — Code patterns to follow (if available)
- `docs/agent-system/VALIDATION-CHECKLIST.md` — Pre-completion checklist (if available)
- `docs/agent-system/UAT-ENABLEMENT.md` — UAT enablement requirements (if available)
- `shared/schema.ts` — Current schema definitions
- `server/storage.ts` — Current storage interface and implementation

---

## Documentation Requirements

- Add JSDoc comments on all public functions/interfaces
- Add comments explaining "why" for complex logic
- Update relevant docs if behavior differs from spec
- Do NOT add comments for obvious code

---

## UAT Enablement (REQUIRED)

**Every Linear issue MUST enable User Acceptance Testing.** This is non-negotiable.

### What UAT Enablement Means

1. **Provide testable means** — The reviewer must be able to actually test your work
2. **Write clear instructions** — Step-by-step guide for manual testing
3. **Define expected outcomes** — What should happen for each test scenario

### UAT by Track

| Track            | UAT Means                                    | Example                                        |
| ---------------- | -------------------------------------------- | ---------------------------------------------- |
| 1-ONTOLOGY       | API endpoints, Drizzle Studio, curl commands | `curl http://localhost:5000/api/organizations` |
| 2-DESIGN-SYSTEM  | Component demo page, in-context page         | Navigate to `/dev/components` or feature page  |
| 3-TRACER-BULLETS | Full page routes, user flows                 | Navigate to feature page, interact, verify     |

### Required UAT Section in Issue

Before marking complete, ensure the Linear issue has UAT instructions added as a comment:

```markdown
## UAT Instructions

### Prerequisites

{Commands to run before testing}

### How to Access

{URL or command to reach the feature}

### Test Scenarios

{Step-by-step instructions with expected results}

### Verification Checklist

- [ ] {Testable criterion 1}
- [ ] {Testable criterion 2}
```

See [UAT-ENABLEMENT.md](./UAT-ENABLEMENT.md) for complete templates and examples by track.

---

## Completion Workflow

When your code is complete (on your feature branch):

1. **Write tests:** `/write-tests {ISSUE_ID}` (if skill available)
2. **Run validation:** `/validate-issue {ISSUE_ID}` (if skill available)
3. Ensure all checks pass:
   ```bash
   npm run check     # TypeScript type checking
   npm run lint      # ESLint
   npm run test      # All tests must pass
   ```
4. **Verify UAT instructions work** — Follow your own UAT instructions to confirm they're accurate
5. Update issue status to "In Review" (using Linear MCP `update_issue` or your issue tracker)
6. Notify: "Issue code complete, ready for review. Branch: feature/{ISSUE_ID}-..."

---

## Version Control

- **Branch naming:** `feature/{ISSUE_ID}-{short-description}`
- **Commit messages:** Clear, descriptive, reference issue ID
- **One logical change per commit**
- **Never commit secrets or credentials**
