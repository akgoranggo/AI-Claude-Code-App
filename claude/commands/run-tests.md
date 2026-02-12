# Run Tests

Run tests for the current Linear issue or the entire project.

## Usage

```
/run-tests [scope]
```

## Scope Options

- `/run-tests` - Run all tests
- `/run-tests TEAM-001` - Run tests related to a specific Linear issue
- `/run-tests schema` - Run only schema tests
- `/run-tests storage` - Run only storage tests
- `/run-tests api` - Run only API tests
- `/run-tests components` - Run only component tests
- `/run-tests hooks` - Run only hook tests

## Instructions

When this command is invoked:

1. **Parse the scope** from the command (default: all tests)

2. **Determine test pattern** based on scope:
   - `all`: No filter, run all tests
   - `TEAM-XXX`: Determine affected files from Linear issue, run related tests
   - `schema`: `tests/schema/**/*.test.ts`
   - `storage`: `tests/storage/**/*.test.ts`
   - `api`: `tests/api/**/*.test.ts`
   - `components`: `client/src/components/**/*.test.tsx`
   - `hooks`: `client/src/hooks/**/*.test.ts`

3. **Run the appropriate test command**:

   ```bash
   # All tests
   npm run test

   # Filtered tests
   npx vitest run --reporter=verbose {pattern}

   # Watch mode (for development)
   npx vitest {pattern}
   ```

4. **Analyze results**:
   - Count passed/failed/skipped tests
   - Identify failing test files
   - Check for coverage gaps if running coverage

5. **Report results** in a structured format

## Output Format

```
## Test Results

**Scope:** [all | TEAM-XXX | schema | storage | api | components | hooks]
**Status:** [PASS | FAIL]

### Summary

| Metric | Count |
|--------|-------|
| Total Tests | X |
| Passed | X |
| Failed | X |
| Skipped | X |

### Failed Tests (if any)

1. **tests/schema/organization.test.ts**
   - `Organization Schema > validates correct data`
   - Error: Expected true, received false

### Coverage (if available)

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| schema.ts | 85% | 70% | 90% | 85% |

### Next Steps

- [ ] Fix failing tests
- [ ] Add missing test coverage
- [ ] Run `/validate-issue` when tests pass
```

## Test Writing Guidance

If tests are missing, guide the agent to:

1. **Read the testing patterns skill**:

   ```
   Read .claude/skills/testing-patterns/SKILL.md
   ```

2. **Create tests following patterns** for:
   - Schema validation (1-ONTOLOGY)
   - Storage methods (1-ONTOLOGY)
   - API routes (1-ONTOLOGY)
   - React components (2-DESIGN-SYSTEM, 3-TRACER-BULLETS)
   - React hooks (3-TRACER-BULLETS)

3. **Use test utilities** from `tests/utils/test-helpers.ts`

## Related Commands

- `/validate-issue` - Full validation including tests
- `/start-issue` - Start a Linear issue

## Related Skills

- `testing-patterns` - Test writing patterns and examples
