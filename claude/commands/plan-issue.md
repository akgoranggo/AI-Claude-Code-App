# Plan Issue

Create an implementation plan from research, producing a compacted artifact for implementation.

## Usage

```
/plan-issue {LINEAR_ISSUE_ID}
```

## Instructions

### 1. Fetch Issue and Research Artifact

```
Linear MCP: get_issue({issueId})
Linear MCP: list_comments({issueId})
  → Filter for `<!-- RESEARCH-ARTIFACT:{LINEAR_ISSUE_ID} -->`
```

**If no research:** Error - run `/research-issue {LINEAR_ISSUE_ID}` first.

### 2. Check Open Questions

If research has unchecked `[ ]` questions, prompt user to resolve them in Linear before continuing.

### 3. Load Minimal Context

- `docs/agent-system/PATTERNS.md` (if exists)
- Specific files from research (via subagent if many)

Do NOT load full schemas or unrelated files.

### 4. Create Plan Artifact

```markdown
<!-- PLAN-ARTIFACT:{LINEAR_ISSUE_ID} -->
## Implementation Plan

**Issue:** {ISSUE_TITLE} | **Track:** {TRACK_LABEL} | **Date:** {TIMESTAMP}

### Objective
{Single sentence}

### Files to Modify
| File | Change | Description |
|------|--------|-------------|
| `shared/schema.ts` | ADD | New table for X |

### Implementation Steps

#### Phase 1: {Name}
**Files:** `file1.ts`, `file2.ts`
- [ ] Step with specific details
- [ ] Step with specific details

**Verify:** `npm run check` passes

#### Phase 2: {Name}
**Files:** `file3.ts`
- [ ] Step with specific details

**Verify:** `npm run check && npm run test` passes

### Success Criteria
**Automated:** `npm run check`, `npm run test`, no console errors
**Manual:** {Specific testable criteria from acceptance criteria}

### Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|

### Out of Scope
- {Explicitly excluded items}
<!-- /PLAN-ARTIFACT -->
```

### 5. Quality Check

Before posting:
- Every step references specific files
- No vague steps ("update as needed")
- All acceptance criteria covered
- Plan under 200 lines

### 6. Post to Linear

```
Linear MCP: create_comment({issueId, body: PLAN_CONTENT})
```

### 7. Report Completion

```markdown
## Plan Created: {LINEAR_ISSUE_ID}

Plan posted to Linear. {N} phases, {N} files affected.

**Review required:** Verify approach and decisions in Linear.

**Next:** Once approved, `/implement-plan {LINEAR_ISSUE_ID}`
```

## Track-Specific Phases

**1-ONTOLOGY:** Schema → Storage → API → Validation
**2-DESIGN-SYSTEM:** Component → Styling → Accessibility → Docs
**3-TRACER-BULLETS:** Data integration → Components → Page → User flow

## Context Target

Under 40% after planning. Input is compacted research, output is compacted plan.

## Related

- `/research-issue` - Phase 1: Research first
- `/implement-plan` - Phase 3: Execute plan
