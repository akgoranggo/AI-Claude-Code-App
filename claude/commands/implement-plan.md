# Implement Plan

Execute an approved plan with fresh context, using the plan as single source of truth.

## Usage

```
/implement-plan {LINEAR_ISSUE_ID} [--phase=N] [--resume]
```

**Flags:**
- `--phase=N` - Execute only phase N
- `--resume` - Continue from last completed phase (checks `[x]` markers)

## Instructions

### 1. Verify Worktree

```bash
git worktree list | grep {LINEAR_ISSUE_ID}
```

If missing: `/create-worktree {LINEAR_ISSUE_ID}`

### 2. Fetch Plan Artifact Only

```
Linear MCP: list_comments({issueId})
  → Filter for `<!-- PLAN-ARTIFACT:{LINEAR_ISSUE_ID} -->`
```

**CRITICAL:** Do NOT load research artifact - plan contains everything needed.

**If no plan:** Error - run `/research-issue` then `/plan-issue` first.

### 3. Load Referenced Files

From plan's "Files to Modify", read each file completely.
Also load `docs/agent-system/PATTERNS.md` if exists.

### 4. Execute Phases

For each phase:

**a) Announce:**
```markdown
## Starting Phase {N}: {Name}
Files: {list} | Steps: {count}
```

**b) Execute steps literally.** If reality differs from plan:
```markdown
## Mismatch Detected
**Expected:** {from plan}
**Found:** {in codebase}
Options: 1) Adapt 2) Update plan 3) Abort
```
Wait for user input.

**c) Verify after each phase:**
```bash
npm run check && npm run test
```
Do NOT proceed until passing.

**d) Mark completed steps** with `[x]` in the plan.

### 5. Checkpoint for Long Implementations

If 4+ phases, after every 2 phases:
```markdown
## Progress Checkpoint
Completed: Phase 1, 2 | Remaining: Phase 3, 4
Files modified: {list}
```

If context exceeds 60%: Commit, then `/implement-plan {ID} --resume` in new session.

### 6. Final Verification

```bash
npm run check && npm run test
```

### 7. Report Completion

```markdown
## Implementation Complete: {LINEAR_ISSUE_ID}

**Phases:** [x] Phase 1 [x] Phase 2
**Files:** {list with changes}
**Verification:** check ✓ test ✓

**Manual verification needed:** {from plan success criteria}

**Next:**
1. `/write-tests {ID}` if needed
2. `/validate-issue {ID}`
3. `/create-pr {ID}`
```

## Context Target

Under 60% throughout. Start fresh (~7%), leave room for implementation work.

## Related

- `/research-issue` - Phase 1
- `/plan-issue` - Phase 2
- `/validate-issue` - Post-implementation
