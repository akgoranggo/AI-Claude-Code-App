# Research Issue

Research the codebase for a Linear issue, producing a compacted artifact for planning.

## Usage

```
/research-issue {LINEAR_ISSUE_ID}
```

## Instructions

### 1. Fetch Issue (Minimal Context)

Use Linear MCP `get_issue` to retrieve title, description, acceptance criteria, and labels.
Do NOT fetch comments yet.

### 2. Formulate Research Questions

**1-ONTOLOGY:** Existing schemas? Storage patterns? API patterns? Validation?
**2-DESIGN-SYSTEM:** Similar components? Design tokens? Interaction patterns? Accessibility?
**3-TRACER-BULLETS:** APIs to consume? Components to compose? Similar pages? Data flow?

### 3. Delegate to Subagent

**CRITICAL**: Use Task tool with Explore subagent to isolate search operations:

```
Task: Explore codebase for {ISSUE_ID}
Subagent: Explore
Prompt: |
  Research for Linear issue {ISSUE_ID}: "{ISSUE_TITLE}"
  Track: {TRACK_LABEL}

  Questions: {RESEARCH_QUESTIONS}

  Return ONLY a compacted summary (<200 lines):
  - Relevant file paths (max 10-15)
  - Key patterns with file:line references
  - Dependencies identified
  - Recommended approach (1-2 sentences)

  DO NOT return raw search results or full file contents.
```

### 4. Post Research Artifact

Use Linear MCP `create_comment`:

```markdown
<!-- RESEARCH-ARTIFACT:{LINEAR_ISSUE_ID} -->
## Research Summary

**Issue:** {ISSUE_TITLE} | **Track:** {TRACK_LABEL} | **Date:** {TIMESTAMP}

### Relevant Files
| File | Purpose |
|------|---------|
| `path/file.ts` | Why relevant |

### Patterns Found
**Pattern Name** (`file.ts:123`) - Brief description

### Dependencies
- **Requires:** schemas, APIs, components needed
- **Consumed by:** what might use this

### Risks
- Key risks or considerations

### Recommended Approach
High-level strategy (2-3 sentences).

### Open Questions
- [ ] Questions needing human input before planning
<!-- /RESEARCH-ARTIFACT -->
```

### 5. Report Completion

```markdown
## Research Complete: {LINEAR_ISSUE_ID}

Research posted to Linear. Key files: {top 3-5 files}

**Open questions:** {list or "None"}

**Next:** Review in Linear, then `/plan-issue {LINEAR_ISSUE_ID}`
```

## Context Target

Under 30% after research. All exploration delegated to subagents.

## Related

- `/plan-issue` - Phase 2: Create plan
- `/implement-plan` - Phase 3: Execute plan
