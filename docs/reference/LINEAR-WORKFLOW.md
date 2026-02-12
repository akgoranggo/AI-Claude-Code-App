# Linear Workflow Reference

> **Linear-Specific Workflow** - Status management, dependencies, views, and best practices for Linear integration.

## Purpose

This document consolidates all Linear-specific workflow information including status management, dependency tracking, project views, and best practices. For core concepts (phases, issue types), see [CONCEPTS.md](./CONCEPTS.md).

---

## Status Workflow

### Workflow States

Your Linear team should have these workflow states configured:

| State | Type | When to Use |
|-------|------|-------------|
| **Backlog** | Backlog | Planned but dependencies not complete, or future phase |
| **Todo** | Unstarted | Dependencies complete, ready to assign |
| **In Progress** | Started | Agent actively working (includes iterations) |
| **In Review** | Started | Code complete, automated checks passed, ready for UAT |
| **Done** | Completed | UAT approved, merged to main |

### State Transitions

```
Backlog → Todo → In Progress → In Review → Done
           ↑           ↓
           └───────────┘
         (iteration cycle)
```

**Transition Details:**

1. **Backlog → Todo**: When dependencies are complete (blocker relationships resolved)
2. **Todo → In Progress**: When `/start-issue` command is used
3. **In Progress → In Review**: When agent marks code complete (automated checks pass)
4. **In Review → In Progress**: When reviewer requests changes (iteration)
5. **In Review → Done**: When UAT approved and merged to main
6. **Done**: Automatically unblocks dependent issues via Linear's blocker relationships

### State Meanings

**Backlog:**
- Issue is planned but dependencies aren't complete
- Or: Issue is planned for a future phase
- Agent should NOT start these items

**Todo:**
- All dependencies are complete
- Issue is ready to be assigned
- Use `/start-issue {ISSUE_ID}` to begin

**In Progress:**
- Agent is actively working on implementation
- May include multiple iteration cycles
- Use Linear MCP `update_issue` to set this state

**In Review:**
- Code is complete on feature branch
- All automated checks pass (TypeScript, lint, tests)
- Ready for human UAT review
- Agent marks complete, you start review

**Done:**
- UAT approved by human reviewer
- Changes merged to main branch
- Issue is considered complete
- Automatically unblocks dependent issues

### Updating Status

**Via Slash Commands:**
```bash
# Update status programmatically
/update-status ENG-123 in-progress

# With notes
/update-status ENG-123 in-review tests passing, ready for UAT

# Mark complete
/update-status ENG-123 done merged to main via PR #42
```

**Via Linear UI:**
- Drag issues between columns in project board view
- Change state field in issue detail view

**Via Linear MCP (in command implementations):**
```typescript
await linearMcp.update_issue({
  id: "ENG-123",
  state: "In Progress"
});
```

**Status Update Methods Summary:**
1. **Linear UI**: Drag issues between columns or change status field
2. **`/update-status` command**: Quick CLI updates with optional comments
3. **Linear MCP in code**: Agents use `update_issue` function directly

---

## Working with Dependencies

### Blocker Relationships

Linear's blocker relationships enforce dependency order and ensure work is done in the correct sequence.

**Setting up blockers:**
1. Identify prerequisite issues
2. Add "Blocked by" relations to dependent issues
3. Linear will prevent work until blockers are resolved

**Example dependency chain:**
```
ENG-10: Core Auth Schema (no blockers)
    ↓ blocks
ENG-11: User Management API (blocked by ENG-10)
    ↓ blocks
FRONTEND-20: User Dashboard (blocked by ENG-11)
```

Note: Issues can depend on issues from other teams (e.g., FRONTEND-20 depends on ENG-11)

### Checking Dependencies

Before starting work:

```bash
/start-issue ENG-11
```

The command will:
1. Fetch the issue using Linear MCP `get_issue`
2. Check `blockedBy` relationships
3. Verify all blockers are in "Done" state
4. If any blocker is not done, report and exit
5. If all clear, proceed with setup

### Setting Up Dependencies in Linear

**Method 1: Issue Detail View**
1. Open the dependent issue (e.g., ENG-12)
2. Go to Relations section
3. Add "Blocked by" relation to prerequisite issues (e.g., ENG-10)
4. The blocking issue will automatically show "Blocks" relation

**Method 2: Linear MCP (when creating issues)**
```typescript
await linearMcp.create_issue({
  title: "User Dashboard",
  team: "PROJ",
  labels: ["3-TRACER-BULLETS"],
  blockedBy: ["ENG-10", "ENG-11"] // Issue IDs or identifiers
});
```

**Example:**
- Issue ENG-12 is blocked by ENG-10
- In ENG-12: Add "Blocked by" → ENG-10
- In ENG-10: Automatically shows "Blocks" → ENG-12

### Unblocking Issues

When you mark an issue as "Done":
1. Linear automatically updates its "blocks" relationships
2. Dependent issues can now be started
3. Use Linear project views to see newly unblocked items
4. Check Blocked Issues View (filter: `has:blockedBy`) to find work ready to start

**Workflow:**
- Issue ENG-10 marked "Done"
- ENG-11 (blocked by ENG-10) automatically moves from Backlog to Todo
- `/update-status` command can report newly unblocked issues

---

## Creating and Managing Issues

### Issue Structure

Each Linear issue should follow this structure:

**Title Format:**
```
[Brief, descriptive title]
```

**Description Template:**
```markdown
## Objective

[What this issue accomplishes]

## Scope

**Schema (if applicable):**
- Object Types to add/modify
- Fields and relationships

**Storage Methods (if applicable):**
- List of storage methods to implement

**API Endpoints (if applicable):**
- List of endpoints to create

**UI Components (if applicable):**
- Components to build
- Pages to create

**Tests:**
- Test requirements

## Reference Materials

- Link to development plan phase
- Link to PATTERNS.md
- Link to related issues

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## UAT Instructions

[Added as a comment when implementation is complete]
```

### Required Fields

For each issue:

1. **Title**: Clear, concise description of work
2. **Description**: Use template above
3. **Labels**: Add appropriate label:
   - Issue types: `user-story`, `design`, `decision`, `out-of-scope-v1`
   - Implementation tracks: `1-ONTOLOGY`, `2-DESIGN-SYSTEM`, `3-TRACER-BULLETS`
4. **Project/Cycle**: Assign to your project or cycle
5. **State**: Start with "Backlog" or "Todo"
6. **Estimate** (optional): Story points or time estimate
7. **Priority** (optional): Urgency level
8. **Relations**: Link to specifications and user stories (for implementation issues)

### Creating Issues via Linear MCP

**Example: Create Implementation Issue**
```typescript
await linearMcp.create_issue({
  title: "Implement User Schema",
  description: "...", // Use template above
  team: "PROJ",
  labels: ["1-ONTOLOGY"],
  project: "Project Name or ID",
  state: "Backlog",
  implements: "ENG-SPEC-5", // Link to spec
  satisfies: ["ENG-USER-10", "ENG-USER-15"], // Link to user stories
  blockedBy: ["ENG-10"] // Dependencies
});
```

---

## Linear Project Views

Organize work with Linear's project views optimized for the 6-phase workflow.

### Recommended Views

#### 1. Planning Board (Board View) - Phases 1-5

**Configuration:**
- **Columns:** Backlog, Draft, Under Review, Approved, Done
- **Filter by labels:** `user-story`, `design`, `decision`
- **Purpose:** Track requirements, specifications, and decisions
- **Usage:** Review and approve specs before implementation

#### 2. Implementation Board (Board View) - Phase 6

**Configuration:**
- **Columns:** Backlog, Todo, In Progress, In Review, Done
- **Filter by labels:** `1-ONTOLOGY`, `2-DESIGN-SYSTEM`, `3-TRACER-BULLETS`
- **Purpose:** Track implementation work
- **Usage:** Daily standup, sprint planning, active work management

#### 3. By Phase (Board View) - Timeline View

**Configuration:**
- **Group by:** Milestone
- **Columns:** One per milestone (Phase 0, Phase 1, Phase 2, etc.)
- **Purpose:** See work distribution across phases
- **Usage:** Long-term planning, milestone tracking

#### 4. By Track (Board View) - Work Stream View

**Configuration:**
- **Group by:** Label
- **Columns:** 1-ONTOLOGY, 2-DESIGN-SYSTEM, 3-TRACER-BULLETS
- **Filter by status:** "In Progress" or "Todo"
- **Purpose:** See active work by track
- **Usage:** Identify bottlenecks in specific tracks

#### 5. User Stories (List View) - Requirements View

**Configuration:**
- **Filter by label:** `user-story`
- **Sort by:** Priority (High → Low)
- **Columns:** Title, Priority, Complexity, Linked Specs
- **Purpose:** Review all requirements
- **Usage:** Requirements review meetings, stakeholder demos

#### 6. Specifications (List View) - Design Review

**Configuration:**
- **Filter by label:** `design`
- **Sort by:** State (Draft → Under Review → Approved)
- **Columns:** Title, State, Linked User Stories, Review Status
- **Purpose:** Track specification approval
- **Usage:** Design review meetings, technical planning

#### 7. Traceability (List View) - Full Chain View

**Configuration:**
- **Show:** All issues with relations
- **Columns:** Title, Type (label), Implements, Satisfies, Status
- **Purpose:** Verify traceability from user story → spec → implementation
- **Usage:** Quality audits, UAT planning, compliance checks

#### 8. Decisions (List View) - Decision Tracking

**Configuration:**
- **Filter by label:** `decision`
- **Sort by:** State (Open → Resolved)
- **Purpose:** Track key decisions and outcomes
- **Usage:** Architecture review, stakeholder meetings

#### 9. By Assignee (Board View) - Capacity View

**Configuration:**
- **Group by:** Assignee
- **Columns:** Unassigned, Agent 1, Agent 2, Human Reviewer, etc.
- **Purpose:** See work distribution across team members
- **Usage:** Load balancing, assignment planning

#### 10. Out of Scope (List View) - Deferred Features

**Configuration:**
- **Filter by label:** `out-of-scope-v1`
- **Sort by:** Priority
- **Purpose:** Track explicitly deferred features
- **Usage:** Future planning, v2 roadmap

#### 11. Blocked Issues (List View) - Dependency Tracking

**Configuration:**
- **Filter:** `has:blockedBy`
- **Columns:** Title, Blocked By, Status
- **Purpose:** Shows all issues waiting on dependencies
- **Usage:** Check which issues are ready to start

---

## Best Practices

### Phased Approach

1. **Follow the 6 Phases:** Don't skip phases - each builds on the previous
   - Phase 1: Strategic Planning (project structure)
   - Phase 2: User Research (personas, metrics)
   - Phase 3: Requirements (user stories, decisions)
   - Phase 4: Technical Design (specs, milestones)
   - Phase 5: Implementation Planning (three-track issues)
   - Phase 6: Development Execution (implementation)

2. **Progressive Refinement:** Review and approve before moving forward
   - User stories reviewed by stakeholders before specs
   - Specifications approved by SMEs before implementation
   - Decisions documented before making commitments

3. **Traceability from Day 1:** Always link related items
   - Specs link to user stories (via "satisfies" relation)
   - Implementation issues link to specs (via "implements" relation)
   - Implementation issues link to user stories (via "satisfies" relation)

### Issue Creation Best Practices

**User Stories:**
1. Keep atomic - one story per capability
2. Include persona reference
3. Write specific acceptance criteria
4. Prioritize ruthlessly (not everything is High)

**Specifications:**
1. One spec per Object Type
2. Include all proposed fields, links, actions
3. List open questions explicitly
4. Get SME approval before marking "Approved"
5. Link to all user stories it satisfies

**Implementation Issues:**
1. Link to specification and user stories (relations)
2. Set blocker relationships correctly
3. Use track labels consistently
4. Assign to correct milestone
5. Include clear acceptance criteria

**Decisions:**
1. Document options with pros/cons
2. Tag decision maker and stakeholders
3. Update with outcome once decided
4. Reference in related issues

### Traceability Management

1. **Always Link Relations:** Use Linear's native relations feature
   - Specs: Add "satisfies" relation to user stories
   - Implementation: Add "implements" to spec, "satisfies" to stories

2. **Validate Regularly:** Run `/validate-traceability` after Phase 5
   - Checks all implementation issues link to specs
   - Checks all specs link to user stories
   - Reports orphaned issues

3. **Fix Orphans Immediately:** Issues without links are hard to prioritize
   - Orphaned implementation issues: Add spec and story links
   - Orphaned specs: Link to user stories they address
   - Use Traceability View to find orphans

4. **Use Relations in PRs:** Pull request descriptions should show full chain
   - `/create-pr` command automatically includes traceability links
   - Reviewers can verify work against original requirements

### Dependency Management

1. **Create Foundation First:** Track 1 and 2 items before Track 3
   - Track 1 (1-ONTOLOGY): Data models, storage, APIs
   - Track 2 (2-DESIGN-SYSTEM): Components, design tokens
   - Track 3 (3-TRACER-BULLETS): End-to-end features using Track 1 + 2

2. **Approve Specs Before Implementation:** No implementation until spec is "Approved"
   - Specs must be in "Approved" state
   - All open questions resolved
   - SME sign-off obtained

3. **Small Batches:** Break large features into smaller issues
   - Target 2-5 days per issue
   - Enables parallel work
   - Reduces integration risk

4. **Clear Blockers:** Explicitly document why issue is blocked
   - Use "Blocked by" relations
   - Add comment explaining the dependency
   - Update when blocker is resolved

5. **Update Promptly:** Mark issues "Done" as soon as merged
   - Unblocks dependent issues immediately
   - Keeps project views accurate
   - Enables accurate progress tracking

### Status Updates

1. **Keep Current:** Update status as work progresses
   - Todo → In Progress: When starting work
   - In Progress → In Review: When code is complete
   - In Review → Done: When UAT approved and merged

2. **Add Comments:** Explain status changes
   - Note iterations: "Addressing review feedback on API patterns"
   - Link PRs: "PR #42 created and ready for review"
   - Explain blocks: "Blocked waiting for ENG-10 to complete"

3. **Note Iterations:** Comment when entering iteration cycle
   - In Review → In Progress: Explain what needs to change
   - Clear feedback helps agents iterate effectively

4. **Link PRs:** Add PR link in comments when created
   - `/create-pr` command does this automatically
   - Manual PRs: Add link in comment

5. **Track Spec Approval:** Move specs through Draft → Under Review → Approved
   - Draft: Initial creation, work in progress
   - Under Review: Ready for team/SME feedback
   - Approved: Ready for implementation

### Team Communication

1. **Use Comments:** Discuss implementation in Linear issue comments
   - Questions during implementation
   - Feedback during review
   - Status updates

2. **Tag People:** Use @mentions for questions
   - @mention SMEs for clarification
   - @mention reviewers when ready for UAT
   - @mention decision makers for approvals

3. **Link Issues:** Reference related issues with ENG-123 syntax
   - Linear auto-links issue references
   - Creates implicit relationships
   - Enables navigation between related work

4. **Document Decisions:** Record key decisions in decision issues
   - Options considered
   - Rationale for choice
   - Stakeholders consulted
   - Outcome

5. **Review in Linear:** Use comments on specs/stories for feedback
   - Spec review: Comment on field definitions, relationships
   - Story review: Validate acceptance criteria
   - Decision review: Provide input on options

6. **Milestone Planning:** Assign issues to milestones for timeline tracking
   - Group related work
   - Track phase progress
   - Identify timeline risks

### Offline Usage Limitations

⚠️ **Network Dependency:** Linear integration requires internet connectivity to access the Linear API.

**Impact on offline work:**
- Cannot fetch issue details
- Cannot update issue status
- Cannot check blocker relationships
- Cannot add comments or UAT instructions

**Workaround for offline development:**
1. Before going offline, fetch and read relevant issue descriptions
2. Work on implementation locally without status updates
3. When back online, update Linear issue status and add comments
4. Consider caching issue details locally for reference

**Alternative:** For projects that need offline-first workflows, consider maintaining local markdown files alongside Linear issues for redundancy.

---

## Workflow Checklist

### When Assigning Work

- [ ] Check Linear project view for issues in "Todo" status
- [ ] Verify no blockers (check Relations section)
- [ ] Use `/start-issue ENG-123` command
- [ ] Command automatically updates status to "In Progress"

### When Agent Completes Work

- [ ] Agent updates Linear issue to "In Review" via Linear MCP
- [ ] Agent adds UAT instructions as a comment
- [ ] You check Linear for "In Review" issues
- [ ] You review and provide feedback in comments
- [ ] If changes needed: Update status to "In Progress" (iteration)
- [ ] If approved: Update status to "Done" after merge

### When Dependencies Complete

- [ ] Linear automatically tracks blocker relationships
- [ ] When issue moves to "Done", dependent issues become unblocked
- [ ] Check Linear for newly unblocked issues (filter: status="Todo" and no blockers)
- [ ] These are now available for `/start-issue`

---

## Related Documentation

- **Core Concepts:** See [CONCEPTS.md](./CONCEPTS.md) for 6-phase workflow, issue types, and tracks
- **Slash Commands:** See [COMMANDS.md](./COMMANDS.md) for command reference
- **Issue Templates:** See [TEMPLATES.md](./TEMPLATES.md) for issue description templates
- **Daily Workflow:** See [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md) for daily orchestration
- **Agent Guide:** See [agent-system/AGENT-GUIDE.md](../agent-system/AGENT-GUIDE.md) for implementation guidance
