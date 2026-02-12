# Write Tests

Generate tests for code created in a Linear issue, with documentation explaining test coverage.

## Usage

```
/write-tests {LINEAR_ISSUE_ID}
```

## Examples

- `/write-tests TEAM-001`
- `/write-tests TEAM-100`

## Instructions

When this command is invoked:

1. **Parse the Linear issue ID** from the command

2. **Read the Linear issue file** to understand scope:
   - What files were created/modified
   - What type of work (schema, storage, API, component, hook)
   - What acceptance criteria need testing
   - What business requirements are being fulfilled

3. **Read the testing patterns skill**:

   ```
   .claude/skills/testing-patterns/SKILL.md
   ```

4. **Analyze the code** that needs tests:
   - For 1-ONTOLOGY: Read schema definitions, storage methods, API routes
   - For 2-DESIGN-SYSTEM: Read component implementations
   - For 3-TRACER-BULLETS: Read pages, hooks, integrations

5. **Check for existing test files** before creating new ones:
   - Search for existing test files that cover the same code
   - If a test file exists, ADD new tests to it rather than creating a new file
   - Never overwrite existing tests - append new describe blocks or test cases
   - Check for duplicate test coverage before adding tests

6. **Generate appropriate tests** based on track:

### For 1-ONTOLOGY Linear Issues

Create these test files:

```
tests/schema/{entity}.test.ts      # Zod schema validation
tests/storage/{entity}.test.ts     # Storage method tests
tests/api/{resource}.test.ts       # API route tests
```

**Required test cases:**

- Schema validates correct data
- Schema rejects missing required fields
- Schema rejects invalid field values
- Storage creates entity
- Storage retrieves entity by ID
- Storage returns null for non-existent
- Storage updates entity
- API returns list
- API returns single entity
- API creates entity
- API handles validation errors

### For 2-DESIGN-SYSTEM Linear Issues

Create test files alongside components:

```
client/src/components/pims/{Component}.test.tsx
client/src/components/ui/{Component}.test.tsx
```

**Required test cases:**

- Component renders without crashing
- Component displays expected content
- Component handles all prop variations
- Interactive elements respond to events
- Component is accessible (has proper labels)

### For 3-TRACER-BULLETS Linear Issues

Create test files for pages and hooks:

```
client/src/pages/{Page}.test.tsx
client/src/hooks/{hook}.test.ts
```

**Required test cases:**

- Page renders with loading state
- Page renders with data
- Page renders error state
- Hook fetches data correctly
- Hook handles errors
- User interactions work (search, click, navigate)

7. **Run the tests** to verify they pass:

   ```bash
   npm run test
   ```

8. **Update Linear issue with test documentation**:
   - Add a `## Test Documentation` section to the Linear issue file
   - Document what was tested and why
   - Link tests to acceptance criteria and requirements

## Output Format

```
## Tests Generated: {LINEAR_ISSUE_ID}

### Files Modified/Created

| Test File | Action | Tests Added | Status |
|-----------|--------|-------------|--------|
| tests/schema/organization.test.ts | Created | 5 | Pass |
| tests/storage/organization.test.ts | Created | 8 | Pass |
| tests/api/organizations.test.ts | Appended | 6 | Pass |

### Test Summary

- **Total Tests Added:** 19
- **All Passing:** Yes
- **Coverage:** Schema 100%, Storage 95%, API 90%

### Test Documentation

#### Purpose
These tests verify the Organization entity implementation for TEAM-001, ensuring
data integrity, proper CRUD operations, and API contract compliance.

#### Requirements Coverage

| Requirement | Test Case | Rationale |
|-------------|-----------|-----------|
| Organizations must have unique names | `rejects duplicate organization name` | Prevents data conflicts in multi-tenant system |
| Organizations have Active/Inactive status | `validates status enum values` | Ensures only valid statuses are persisted |
| API returns 404 for missing resources | `GET /api/organizations/:id returns 404` | Proper REST semantics for client error handling |

#### Test Cases with Rationale

**Schema Tests** (tests/schema/organization.test.ts)
| Test | Why It Matters |
|------|----------------|
| validates correct organization data | Ensures valid data passes through without errors |
| rejects organization without name | Name is required for display and identification |
| rejects invalid status values | Prevents invalid state in the database |
| allows optional fields to be omitted | Confirms flexibility for partial data entry |

**Storage Tests** (tests/storage/organization.test.ts)
| Test | Why It Matters |
|------|----------------|
| creates organization with valid data | Core create functionality works |
| retrieves organization by ID | Core read functionality works |
| returns null for non-existent organization | Graceful handling of missing data |
| updates organization fields | Core update functionality works |
| generates ULID for new records | Ensures unique, time-sortable IDs |

**API Tests** (tests/api/organizations.test.ts)
| Test | Why It Matters |
|------|----------------|
| GET /api/organizations returns list | List endpoint contract |
| GET /api/organizations/:id returns single | Detail endpoint contract |
| POST /api/organizations creates new | Create endpoint contract |
| POST /api/organizations validates body | Input validation prevents bad data |

#### Edge Cases Covered

- Empty string inputs
- Missing required fields
- Invalid enum values
- Non-existent IDs
- Duplicate unique constraints

#### Not Covered (Out of Scope)

- Performance/load testing
- Integration with other entities (covered in dependent Linear issues)

### Next Steps

- [ ] Review test documentation for completeness
- [ ] Verify all acceptance criteria have corresponding tests
- [ ] Run `/validate-issue {LINEAR_ISSUE_ID}`
```

## File Handling Rules

**CRITICAL: Never duplicate or overwrite existing tests**

1. **Before creating a test file**, check if it already exists:

   ```bash
   ls tests/schema/{entity}.test.ts
   ls tests/storage/{entity}.test.ts
   ```

2. **If file exists**, read it first and:
   - Add new `describe` blocks for new functionality
   - Add new `it` cases within existing `describe` blocks if appropriate
   - Never remove or modify existing tests

3. **If file doesn't exist**, create it following the patterns in the testing skill

4. **Use clear separation** when appending:
   ```typescript
   // ============================================
   // Tests added for TEAM-XXX: [Linear Issue Title]
   // ============================================
   describe("New Feature", () => {
     // new tests here
   });
   ```

## Test Quality Guidelines

Generated tests should:

1. **Be specific** - Test one thing per test case
2. **Be readable** - Clear test names describing what's tested
3. **Be independent** - Tests don't depend on each other
4. **Cover edge cases** - Empty inputs, invalid data, error conditions
5. **Use meaningful assertions** - Check actual behavior, not implementation
6. **Be documented** - Each test should have a clear rationale

## Documentation Requirements

Every test file should include:

1. **File header comment** explaining what's being tested
2. **Describe block comments** explaining the test group purpose
3. **Complex test comments** explaining non-obvious assertions

Example:

```typescript
/**
 * Organization Schema Tests
 *
 * Tests Zod validation for the Organization entity.
 * Ensures data integrity before database operations.
 *
 * Related: TEAM-001 Organization Schema
 * Requirements: ORG-1, ORG-2, ORG-3
 */
describe("Organization Schema", () => {
  // Tests for insertOrganizationSchema validation
  describe("insertOrganizationSchema", () => {
    it("validates correct organization data", () => {
      // Valid org should pass all validation rules
      // ...
    });
  });
});
```

## Related Commands

- `/run-tests` - Run tests
- `/validate-issue` - Full validation

## Related Skills

- `testing-patterns` - Test writing patterns and examples
