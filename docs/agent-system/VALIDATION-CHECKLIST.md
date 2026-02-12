# Agent Validation Checklist

Run through this checklist before marking your Linear issue as "In Review".

---

## 1. Code Quality

- [ ] TypeScript compiles without errors: `npm run check`
- [ ] No `any` types (use `unknown` if truly needed)
- [ ] No `console.log` statements (use proper error handling)
- [ ] No commented-out code left in files
- [ ] Follows PATTERNS.md exactly

---

## 2. Schema (if applicable)

- [ ] Uses `pgTable()` with correct table name (singular, snake_case)
- [ ] ULID primary key: `id: varchar("id").primaryKey().default(sql\`generate_ulid()\`)`
- [ ] Foreign keys use `.references()` with correct cascade behavior
- [ ] Indexes on commonly queried columns (name format: `idx_{table}_{column}`)
- [ ] Insert schema created with proper omissions (id, createdAt, updatedAt)
- [ ] Type exports at bottom of schema section
- [ ] Header comment describing Object Type

---

## 3. Storage (if applicable)

- [ ] Interface method(s) added to `IStorage`
- [ ] Implementation(s) added to `DatabaseStorage` class
- [ ] Methods return `Promise<T | null>` for single entity gets
- [ ] Methods return `Promise<T[]>` for list queries
- [ ] Update methods set `updatedAt: new Date()`
- [ ] Proper error handling (throw for not found in mutations)
- [ ] Methods ordered alphabetically within entity section

---

## 4. API Routes (if applicable)

- [ ] RESTful endpoint structure (GET, POST, PATCH, DELETE)
- [ ] Actions use `POST /:id/{verb}` pattern
- [ ] Request body validated with Zod schema
- [ ] Proper HTTP status codes (200, 201, 400, 403, 404, 409, 500)
- [ ] Error responses include error message
- [ ] Clinic context checked where required
- [ ] Staff user context checked where required
- [ ] **Security: Resource ownership validated** (403 for cross-clinic access)
- [ ] **Security: Query param auth fallbacks gated behind dev mode**
- [ ] Pagination params validated (NaN, negative values handled)
- [ ] Rate limiting on search/expensive endpoints
- [ ] Unique constraint violations return 409 Conflict

---

## 5. React Components (if applicable)

- [ ] Mobile-first design (works on 375px width)
- [ ] Touch targets minimum 44px (buttons, list items)
- [ ] Uses shadcn/ui components from `@/components/ui/`
- [ ] Proper loading states with Loader2 spinner
- [ ] Error states handled and displayed
- [ ] TypeScript props interface defined
- [ ] Accessible (proper aria labels, keyboard navigation)

---

## 6. React Hooks (if applicable)

- [ ] Uses TanStack Query for data fetching
- [ ] Query keys are arrays and descriptive
- [ ] Mutations invalidate relevant queries on success
- [ ] Loading and error states exposed
- [ ] Follows `use{Entity}` naming convention

---

## 7. Tests (if applicable)

- [ ] Tests exist for new storage methods
- [ ] Tests cover happy path and error cases
- [ ] Test data cleaned up after each test
- [ ] Tests are isolated (don't depend on each other)
- [ ] Test file follows naming convention: `{feature}.test.ts`

---

## 8. Documentation

- [ ] JSDoc comments on public functions/interfaces
- [ ] Comments explaining "why" for complex logic
- [ ] No unnecessary comments for obvious code
- [ ] Linear issue updated with completion notes (as comment)

---

## 9. Git Hygiene

- [ ] On correct feature branch: `feature/{ISSUE-ID}-{short-name}`
- [ ] Commits are atomic with clear messages
- [ ] No unrelated changes included
- [ ] No secrets or credentials committed

---

## 10. Linear Issue Completion

- [ ] All acceptance criteria met
- [ ] Files listed in "Files to Modify" have been modified
- [ ] Files listed in "Files NOT to Modify" remain unchanged
- [ ] Dependencies were actually complete before starting
- [ ] Linear issue status updated to "In Review"

---

## Quick Commands

```bash
# Run all checks
npm run check           # TypeScript type checking

# Individual checks (if configured)
npm run lint            # ESLint
npm run test            # Vitest
npm run build           # Production build

# Development
npm run dev             # Start dev servers
npm run db:push         # Push schema changes
npm run db:studio       # Open Drizzle Studio
```

---

## Status Flow Reminder

```
Ready -> In Progress -> In Review -> In UAT Review -> Complete
                          ^                 |
                          |                 v
                          +---- In Progress (iteration)
```

When all checks pass, update:

1. Linear issue status to "In Review" (using Linear MCP `update_issue`)
2. Notify: "Issue ready for UAT review"
