---
name: issue-workflow
description: Multi-agent workflow including Linear issue lifecycle, status tracking, and three-track development system
---

# Linear Issue Workflow

Knowledge for managing Linear issues in the multi-agent development workflow.

## Three-Track System

| Track | Label | Focus | Files |
|-------|-------|-------|-------|
| **1-ONTOLOGY** | `1-ONTOLOGY` | Schemas, storage, APIs | `shared/schema.ts`, `server/storage.ts`, `server/routes.ts` |
| **2-DESIGN-SYSTEM** | `2-DESIGN-SYSTEM` | Components, styling, accessibility | `client/src/components/` |
| **3-TRACER-BULLETS** | `3-TRACER-BULLETS` | End-to-end features | `client/src/pages/`, integrations |

**Dependencies:** Track 3 depends on Track 1 & 2. Track 1 & 2 can run in parallel.

## Linear Status Workflow

```
Backlog → Todo → In Progress → In Review → Done
              ↓         ↑
              └─────────┘ (iteration)
```

| Status | Meaning |
|--------|---------|
| **Backlog** | Planned, dependencies incomplete |
| **Todo** | Ready to start, no blockers |
| **In Progress** | Agent actively working |
| **In Review** | Code complete, awaiting UAT |
| **Done** | UAT approved, merged |

## Issue Lifecycle

```
/start-issue TEAM-123         → Status: In Progress
    ↓ (implement)
/validate-issue TEAM-123      → Verify completeness
    ↓
/create-pr TEAM-123           → Create GitHub PR
    ↓
/update-status TEAM-123 in-review → Status: In Review
    ↓ (GitHub review + UAT)
/update-status TEAM-123 done  → Status: Done
```

## Dependency Management

- Use Linear's **"Blocked by"** relations
- `/start-issue` validates all blockers are "Done"
- Track 3 issues should block on related Track 1 & 2 issues

## Linear MCP Operations

```typescript
// Fetch issue
get_issue({ issueId: "TEAM-123" })

// Update status
update_issue({ issueId: "TEAM-123", stateId: "in-review" })

// Add comment
create_comment({ issueId: "TEAM-123", body: "..." })

// Check blockers
get_issue({ issueId: "TEAM-123", includeRelations: true })
```

## Commands by Stage

| Stage | Commands |
|-------|----------|
| Start | `/start-issue`, `/create-worktree` |
| Implement | `/request-supervisor-help`, `/write-tests` |
| Validate | `/validate-issue`, `/supervisor-review` |
| Complete | `/create-pr`, `/add-uat`, `/update-status` |
| Cleanup | `/cleanup-worktree` |

## RPI Workflow (Complex Issues)

For 3+ files or unfamiliar areas:
```
/research-issue → /plan-issue → /implement-plan
```
See `CONTEXT-MANAGEMENT.md` for details.
