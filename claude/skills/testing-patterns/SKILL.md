# Testing Patterns Skill

Patterns for writing tests using Vitest and React Testing Library.

## Test File Locations

| Code Type | Location | Naming |
|-----------|----------|--------|
| Schema validation | `tests/schema/` | `{entity}.test.ts` |
| Storage methods | `tests/storage/` | `{entity}.test.ts` |
| API routes | `tests/api/` | `{resource}.test.ts` |
| React components | `client/src/components/**/*.test.tsx` | `{Component}.test.tsx` |
| Hooks | `client/src/hooks/` | `{hook}.test.ts` |

## Commands

```bash
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

## Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("{Module}", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("describes expected behavior", () => {
    // Arrange → Act → Assert
  });
});
```

## By Track

### 1-ONTOLOGY Tests

**Schema:** Validate Zod schemas
```typescript
const result = insertSchema.safeParse(data);
expect(result.success).toBe(true/false);
```

**Storage:** Mock db, test CRUD
```typescript
vi.mock("@server/db", () => ({ db: mockDb }));
const result = await storage.createEntity(data);
expect(result).toMatchObject(expected);
```

**API:** Supertest for endpoints
```typescript
const res = await request(app).get("/api/resources");
expect(res.status).toBe(200);
```

### 2-DESIGN-SYSTEM Tests

**Components:** React Testing Library
```typescript
render(<Component {...props} />);
expect(screen.getByRole("button")).toBeInTheDocument();
await userEvent.click(button);
```

**Hooks:** renderHook
```typescript
const { result } = renderHook(() => useHook());
expect(result.current.value).toBe(expected);
```

### 3-TRACER-BULLETS Tests

**Integration:** Test full flows
```typescript
// Setup → Action → Verify state changes
render(<Page />);
await userEvent.type(input, "data");
await userEvent.click(submitButton);
await waitFor(() => expect(mockApi).toHaveBeenCalled());
```

## Mocking

```typescript
// Functions
vi.fn().mockResolvedValue(data)
vi.spyOn(module, "method").mockImplementation(...)

// Modules
vi.mock("module", () => ({ fn: vi.fn() }))

// Timers
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
```

## Coverage Targets

- Statements: 80%+
- Branches: 75%+
- Critical paths: 100%
