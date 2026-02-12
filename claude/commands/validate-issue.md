# Validate Linear Issue

Run the full validation checklist for a completed Linear issue before marking as ready for review.

## Usage

```
/validate-issue {LINEAR_ISSUE_ID}
```

## Examples

- `/validate-issue TEAM-002`

## Instructions

When this command is invoked:

1. **Parse the Linear issue ID** from the command (e.g., "TEAM-002")

2. **Read the validation checklist**:
   - `docs/agent-system/VALIDATION-CHECKLIST.md`

3. **Check for required tests**:
   - Identify what tests should exist based on Linear issue track:
     - 1-ONTOLOGY: Schema tests, storage tests, API tests
     - 2-DESIGN-SYSTEM: Component tests
     - 3-TRACER-BULLETS: Page tests, hook tests
   - If tests are missing, FAIL validation and recommend:
     ```
     Run /write-tests {LINEAR_ISSUE_ID} to generate tests
     ```

4. **Run automated checks** (in order):

   ```bash
   npm run check      # TypeScript type checking
   npm run lint       # ESLint
   npm run test       # Vitest - ALL tests must pass
   npm run build      # Production build
   ```

5. **Verify test coverage**:
   - Run `npm run test:coverage`
   - New code should have reasonable test coverage
   - Flag files with 0% coverage

6. **Check pattern compliance**:
   - Read `docs/agent-system/PATTERNS.md`
   - Verify code follows established patterns
   - Check naming conventions
   - Verify file structure

7. **Check requirements compliance**:
   - Read the Linear issue file for acceptance criteria
   - Verify each criterion is met
   - Reference `docs/reference/CONCEPTS.md (Linear development plan)` for technical specs
   - Reference `docs/reference/CONCEPTS.md (Linear user stories)` for user stories

8. **Verify UAT enablement** (REQUIRED):
   - Check that Linear issue file contains `## UAT Instructions` section
   - Verify UAT section includes:
     - Prerequisites (commands to run before testing)
     - How to access the feature (URL, command, or path)
     - Test scenarios with expected results
     - Verification checklist
   - If UAT section is missing or incomplete, FAIL validation
   - Reference `docs/agent-system/UAT-ENABLEMENT.md` for required format

9. **Validate UAT instructions work**:
   - Run the prerequisite commands
   - Verify the access path works (URL loads, command runs)
   - If UAT instructions don't work, FAIL validation

10. **Generate validation report** with pass/fail for each category

## Validation Gate Requirements

**BLOCKING (must pass to proceed):**

- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no errors
- [ ] ALL tests pass (0 failures)
- [ ] Required tests exist for new code
- [ ] UAT Instructions section exists in Linear issue
- [ ] UAT instructions are complete (prerequisites, access, scenarios, checklist)
- [ ] UAT instructions are functional (can be executed)

**WARNING (should fix before PR):**

- [ ] ESLint warnings < 5
- [ ] Test coverage > 70% for new files
- [ ] Build succeeds

## Output Format

```
## Validation Report: {LINEAR_ISSUE_ID}

**Overall Status:** [PASS | WARNINGS | FAIL]

### Automated Checks

| Check | Status | Details |
|-------|--------|---------|
| TypeScript | [Pass/Fail] | [Any errors] |
| ESLint | [Pass/Fail] | [Error/warning count] |
| Tests Exist | [Pass/Fail] | [Missing test files] |
| Tests Pass | [Pass/Fail] | [X passed, Y failed] |
| Test Coverage | [Pass/Warn] | [Coverage %] |
| Build | [Pass/Fail] | [Build output] |

### Test Summary

| Test Suite | Tests | Passed | Failed |
|------------|-------|--------|--------|
| Schema | X | X | 0 |
| Storage | X | X | 0 |
| API | X | X | 0 |
| Components | X | X | 0 |

### Pattern Compliance

- [ ] Schema patterns followed
- [ ] Storage method patterns followed
- [ ] API route patterns followed
- [ ] Component patterns followed
- [ ] Naming conventions followed

### Requirements Compliance

- [ ] [Acceptance criterion 1]
- [ ] [Acceptance criterion 2]
- [ ] ...

### UAT Enablement

| Check | Status | Details |
|-------|--------|---------|
| UAT Section Exists | [Pass/Fail] | [Found/Missing] |
| Prerequisites Listed | [Pass/Fail] | [Commands provided] |
| Access Path Provided | [Pass/Fail] | [URL/command] |
| Test Scenarios | [Pass/Fail] | [X scenarios documented] |
| Verification Checklist | [Pass/Fail] | [X items] |
| Instructions Functional | [Pass/Fail] | [Tested/Not tested] |

### Issues Found

1. [Issue description] - [Severity: Critical/Warning/Info]

### Recommendations

- [Action needed to resolve issues]

### Next Steps

If FAIL:
- [ ] Fix failing TypeScript/lint errors
- [ ] Run `/write-tests {ISSUE-ID}` if tests missing
- [ ] Fix failing tests
- [ ] Add UAT Instructions section if missing (see UAT-ENABLEMENT.md)
- [ ] Re-run `/validate-issue {ISSUE-ID}`

If PASS:
- [ ] Update status to "In Review": `/update-status {ISSUE-ID} "In Review"`
- [ ] Create PR or request supervisor review
```

## UAT Validation Details

When checking UAT enablement, the validator should:

1. **Search for UAT section** in Linear issue file:

   ```
   grep "## UAT Instructions" in Linear issue description or comments
   ```

2. **Check for required subsections**:
   - `### Prerequisites` - Commands to run
   - `### How to Access` or similar - URL or path
   - `### Test Scenarios` or similar - Step-by-step tests
   - `### Verification Checklist` - Checkable items

3. **Test that instructions work**:
   - For 1-ONTOLOGY: Run curl commands, check API responses
   - For 2-DESIGN-SYSTEM: Verify URL loads, component renders
   - For 3-TRACER-BULLETS: Navigate to page, verify it loads

4. **If UAT section missing**, provide template:

   ````markdown
   ## UAT Instructions

   ### Prerequisites

   ```bash
   npm run db:push
   npm run dev
   ```
   ````

   ### How to Access

   [URL or command to reach the feature]

   ### Test Scenarios

   #### Scenario 1: [Happy Path]
   1. [Step]
   2. [Step]
      **Expected:** [Result]

   ### Verification Checklist
   - [ ] [Criterion 1]
   - [ ] [Criterion 2]

   ```

   ```

## Related Commands

- `/write-tests` - Generate tests for issue
- `/run-tests` - Run tests
- `/update-status` - Update issue status

## Related Files

- @docs/agent-system/VALIDATION-CHECKLIST.md
- @docs/agent-system/PATTERNS.md
- @docs/agent-system/UAT-ENABLEMENT.md
- @.claude/skills/testing-patterns/SKILL.md
