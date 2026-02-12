# Supervisor Review

Request a thorough review of completed work before human UAT to catch issues early.

## Usage

```
/supervisor-review {LINEAR_ISSUE_ID} [focus areas]
```

## Examples

- `/supervisor-review TEAM-002`
- `/supervisor-review TEAM-002 focus on schema compliance and API patterns`
- `/supervisor-review TEAM-101 focus on accessibility and mobile responsiveness`

## Instructions

When this command is invoked:

1. **Parse parameters**:
   - Linear issue ID (e.g., "TEAM-002")
   - Optional focus areas for the review

2. **Read the Linear issue** to understand:
   - Objective and scope
   - Acceptance criteria
   - Files that were modified
   - Files that should NOT have been modified

3. **Read reference documentation**:
   - `docs/agent-system/PATTERNS.md` - Code patterns
   - `docs/agent-system/VALIDATION-CHECKLIST.md` - Validation criteria
   - `docs/reference/CONCEPTS.md (Linear development plan)` - Technical specifications

4. **Review the implementation** against each criterion:

   **Completeness Check:**
   - All acceptance criteria addressed
   - All specified files modified
   - No out-of-scope modifications

   **Pattern Compliance:**
   - Schema follows established patterns
   - Storage methods follow patterns
   - API routes follow patterns
   - Components follow patterns
   - Naming conventions followed

   **Validation Status:**
   - TypeScript compiles
   - Lint passes
   - Tests pass
   - Build succeeds

   **Ontology Compliance (for 1):**
   - Object Types correctly defined
   - Links properly established
   - Actions implemented correctly

   **Design System Compliance (for 2):**
   - Uses design tokens
   - Follows component patterns
   - Accessibility requirements met

5. **Generate detailed review report**

## Output Format

```
## Supervisor Review: {LINEAR_ISSUE_ID}

**Review Status:** [Approved for UAT | Needs Fixes | Major Issues]

**Focus Areas:** {focus areas or "General review"}

---

### Completeness Check

| Criterion | Status | Notes |
|-----------|--------|-------|
| Acceptance criteria met | [Pass/Fail] | [Details] |
| All files modified | [Pass/Fail] | [Details] |
| No out-of-scope changes | [Pass/Fail] | [Details] |

### Pattern Compliance

| Pattern | Status | Notes |
|---------|--------|-------|
| Schema patterns | [Pass/Fail/N/A] | [Details] |
| Storage patterns | [Pass/Fail/N/A] | [Details] |
| API route patterns | [Pass/Fail/N/A] | [Details] |
| Component patterns | [Pass/Fail/N/A] | [Details] |
| Naming conventions | [Pass/Fail] | [Details] |

### Validation Status

| Check | Status |
|-------|--------|
| TypeScript | [Pass/Fail] |
| Lint | [Pass/Fail] |
| Tests | [Pass/Fail] |
| Build | [Pass/Fail] |

### Specific Review

{For 1-ONTOLOGY:}
- Object Types: [Assessment]
- Links: [Assessment]
- Actions: [Assessment]

{For 2-DESIGN-SYSTEM:}
- Design Tokens: [Assessment]
- Accessibility: [Assessment]
- Responsiveness: [Assessment]

{For 3-TRACER-BULLETS:}
- API Integration: [Assessment]
- Component Composition: [Assessment]
- User Flow: [Assessment]

---

### Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | [Description] | [Critical/Major/Minor] | [File:line] |

### Required Fixes (if any)

1. [ ] [Specific fix needed]
2. [ ] [Another fix]

### Recommendations (optional improvements)

- [Suggestion for improvement]

### Verdict

{If Approved:}
**Approved for UAT.** The implementation meets all requirements and follows established patterns.

{If Needs Fixes:}
**Needs fixes before UAT.** Please address the issues listed above and request another review.

{If Major Issues:}
**Major issues found.** Consider requesting supervisor help to discuss the approach before proceeding.
```

## Related Files

- @docs/agent-system/PATTERNS.md
- @docs/agent-system/VALIDATION-CHECKLIST.md
- @docs/reference/CONCEPTS.md (Linear development plan)
