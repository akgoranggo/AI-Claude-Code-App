# Slash Commands Reference

> **Quick Reference** - All available Claude Code slash commands for this project.

## Overview

Slash commands standardize common workflows in Claude Code. Type `/` in Claude Code to see available commands. All commands are defined in `.claude/commands/` directory.

## Commands by Workflow Phase

### Phase 1-5: Strategic Planning & Preparation

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/sync-dev-plan` | `/sync-dev-plan` | Synchronize development plan from Linear documents | After updating development plan in Linear |
| `/generate-linear-issues` | `/generate-linear-issues [project-name]` | Generate Linear issues from development plan | Phase 5: Converting approved specs to implementation issues |

### Phase 6: Development Execution

#### Research-Plan-Implement Workflow (Recommended for Complex Issues)

> **Context Engineering**: These commands implement the [HumanLayer FIC methodology](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents) for optimal context management. Use this workflow for complex issues touching 3+ files.

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/research-issue` | `/research-issue ENG-123` | Research codebase using subagents, produce compacted research artifact | Phase 1: Before planning complex implementations |
| `/plan-issue` | `/plan-issue ENG-123` | Create detailed implementation plan from research | Phase 2: After research is reviewed |
| `/implement-plan` | `/implement-plan ENG-123` | Execute plan with fresh context | Phase 3: After plan is approved |
| `/implement-plan` | `/implement-plan ENG-123 --phase=2` | Implement specific phase only | For large implementations |
| `/implement-plan` | `/implement-plan ENG-123 --resume` | Continue from last checkpoint | After context high / fresh session |

**RPI Workflow Sequence:**
```
/research-issue ENG-123     → Research artifact in Linear comment
    ↓ (human reviews)
/plan-issue ENG-123         → Plan artifact in Linear comment
    ↓ (human approves)
/implement-plan ENG-123     → Execute with fresh context
```

See [CONTEXT-MANAGEMENT.md](../agent-system/CONTEXT-MANAGEMENT.md) and [HUMANLAYER-FIC.md](./HUMANLAYER-FIC.md) for details.

#### Starting Work (Traditional - Simple Issues)

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/start-issue` | `/start-issue ENG-123` | Fetch Linear issue, check dependencies, create worktree, update status to "In Progress" | Beginning work on simple implementation issues |
| `/start-issue` | `/start-issue ENG-123 focus on schema first` | Start issue with additional context | When you want to provide specific guidance to the agent |
| `/create-worktree` | `/create-worktree ENG-123` | Create git worktree for parallel work | When manually setting up worktrees for multiple issues |

#### During Implementation

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/request-supervisor-help` | `/request-supervisor-help ENG-123` | Call supervisor agent for guidance | When stuck or unsure about approach |
| `/request-supervisor-help` | `/request-supervisor-help ENG-123 I'm unsure about API structure` | Request help with specific question | When you need guidance on a specific aspect |
| `/write-tests` | `/write-tests ENG-123` | Generate tests for implementation | After code implementation is complete |
| `/run-tests` | `/run-tests` | Run test suite | After writing tests or making changes |

#### Before Completion

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/validate-issue` | `/validate-issue ENG-123` | Run full validation checklist against specs and user stories | Before marking issue "In Review" |
| `/supervisor-review` | `/supervisor-review ENG-123` | Request supervisor agent review | Optional: Before human UAT for early validation |
| `/supervisor-review` | `/supervisor-review ENG-123 focus on API patterns` | Request focused supervisor review | When you want specific aspects reviewed |

#### Creating Pull Requests

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/create-pr` | `/create-pr ENG-123` | Create GitHub PR with traceability links to specs and user stories | After validation passes and work is ready for merge |
| `/address-pr-comments` | `/address-pr-comments ENG-123` | Address review comments on PR | After GitHub Claude code review |

#### After PR Approval

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/add-uat` | `/add-uat ENG-123` | Add UAT instructions to issue | After GitHub Claude approves PR, before human UAT |

#### Status Management

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/update-status` | `/update-status ENG-123 in-review` | Update Linear issue state | When transitioning between states |
| `/update-status` | `/update-status ENG-123 done merged to main` | Update status with comment | When completing work with additional context |

#### Cleanup

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/cleanup-worktree` | `/cleanup-worktree ENG-123` | Remove git worktree after merge | After PR is merged |

### System Maintenance

| Command | Usage | Purpose | When to Use |
|---------|-------|---------|-------------|
| `/sync-workflow-docs` | `/sync-workflow-docs` | Full sync and validation of workflow documentation | After updating workflow documentation |
| `/sync-workflow-docs` | `/sync-workflow-docs validate` | Validate docs without syncing | To check for discrepancies |
| `/sync-base-template` | `/sync-base-template` | Sync updates from base template repository | When base template has updates |
| `/propose-template-improvements` | `/propose-template-improvements` | Suggest improvements to issue templates | When you notice template issues |

---

## Command Categories

### Issue Lifecycle Commands

#### RPI Workflow (Complex Issues - Recommended)

For issues touching 3+ files or unfamiliar areas:

```
1. /create-worktree ENG-123
   ↓
2. /research-issue ENG-123
   ↓ (human reviews research)
3. /plan-issue ENG-123
   ↓ (human approves plan)
4. /implement-plan ENG-123
   ↓
5. /write-tests ENG-123
   ↓
6. /run-tests
   ↓
7. /validate-issue ENG-123
   ↓
8. /create-pr ENG-123
   ↓
9. /update-status ENG-123 in-review
   ↓ (GitHub Claude code review)
10. /address-pr-comments ENG-123 (if needed)
   ↓ (GitHub Claude approves)
11. /add-uat ENG-123
   ↓ (human UAT review)
12. /update-status ENG-123 done
   ↓
13. /cleanup-worktree ENG-123
```

#### Traditional Workflow (Simple Issues)

For simple schema additions, single components, or known fixes:

```
1. /start-issue ENG-123
   ↓ (implement code)
2. /write-tests ENG-123
   ↓
3. /run-tests
   ↓
4. /validate-issue ENG-123
   ↓
5. /supervisor-review ENG-123 (optional)
   ↓
6. /create-pr ENG-123
   ↓
7. /update-status ENG-123 in-review
   ↓ (GitHub Claude code review)
8. /address-pr-comments ENG-123 (if needed, may iterate)
   ↓ (GitHub Claude approves)
9. /add-uat ENG-123
   ↓ (human UAT review)
10. /update-status ENG-123 done merged to main
   ↓
11. /cleanup-worktree ENG-123
```

### Supervisor Commands

Commands that invoke the supervisor agent:

- `/request-supervisor-help` - Ask questions during implementation
- `/supervisor-review` - Request pre-UAT review

**When to use supervisor:**
- Unclear about architectural decisions
- Need guidance on patterns
- Want validation before human review
- Stuck on implementation approach

### Worktree Commands

Commands for managing parallel work:

- `/start-issue` - Automatically creates worktree
- `/create-worktree` - Manually create worktree
- `/cleanup-worktree` - Remove worktree after merge

**Git worktrees enable:**
- Working on multiple issues in parallel
- Isolated environments per issue
- Clean branch management

---

## Parameter Reference

### Issue ID Format

All issue commands accept Linear issue IDs:
- Format: `TEAM-123` (team key + issue number)
- The prefix is the **team's** key (e.g., ENG, PLATFORM, OPS), NOT the project name
- Examples: `/start-issue ENG-123`, `/start-issue PLATFORM-45`, `/start-issue OPS-12`

### Status Values

Valid status values for `/update-status`:
- `todo` - Backlog/Todo
- `in-progress` - In Progress
- `in-review` - In Review
- `done` - Done
- `canceled` - Canceled

Status strings are normalized automatically (e.g., "in progress" → "in-progress").

### Optional Context

Many commands accept additional context after required parameters:
- `/start-issue ENG-123 focus on error handling`
- `/request-supervisor-help ENG-123 how should I structure the API?`
- `/supervisor-review ENG-123 please check security patterns`
- `/update-status ENG-123 done merged via PR #42`

---

## Creating Custom Commands

To add new commands for your project:

1. Create a `.md` file in `.claude/commands/` directory
2. Write plain Markdown describing what the command should do
3. Use placeholders for parameters (e.g., `{ISSUE_ID}`)
4. Commands automatically appear when typing `/` in chat

**Command File Template:**

```markdown
# Command Name

Brief description of what this command does.

## Usage

```
/command-name {ISSUE_ID} [optional-context]
```

## Examples

- `/command-name ENG-123`
- `/command-name ENG-123 additional guidance`

## Instructions

When this command is invoked:

1. **Step 1:** Fetch issue details using Linear MCP
2. **Step 2:** Validate prerequisites
3. **Step 3:** Execute main logic
4. **Step 4:** Report results

## Output Format

[Describe expected output format]

## Related Documentation

- @docs/reference/CONCEPTS.md
- @docs/agent-system/AGENT-GUIDE.md
```

**Best Practices:**

1. **Clear Instructions:** Write step-by-step instructions
2. **Explicit Parameters:** Document required and optional parameters
3. **Output Format:** Specify expected output for consistency
4. **File References:** Use `@path/to/file.md` to reference documentation
5. **Examples:** Provide usage examples
6. **Error Handling:** Document what to do when things fail

---

### Context Engineering Commands

Commands for optimal context management:

- `/research-issue` - Research with subagent isolation
- `/plan-issue` - Create compacted plan artifact
- `/implement-plan` - Execute from fresh context

**When to use RPI workflow:**
- Complex issues touching 3+ files
- Unfamiliar codebase areas
- Track 3 (TRACER-BULLETS) features
- Issues with multiple acceptance criteria

**When to use traditional `/start-issue`:**
- Simple schema additions
- Single component work
- Bug fixes with known location
- Single, clear acceptance criterion

---

## Related Documentation

- **Core Concepts:** See [CONCEPTS.md](./CONCEPTS.md) for workflow phases and issue types
- **Linear Workflow:** See [LINEAR-WORKFLOW.md](./LINEAR-WORKFLOW.md) for status management
- **Agent Guide:** See [agent-system/AGENT-GUIDE.md](../agent-system/AGENT-GUIDE.md) for implementation patterns
- **Daily Workflow:** See [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md) for orchestration
- **Context Management:** See [agent-system/CONTEXT-MANAGEMENT.md](../agent-system/CONTEXT-MANAGEMENT.md) for FIC methodology
- **HumanLayer FIC:** See [HUMANLAYER-FIC.md](./HUMANLAYER-FIC.md) for methodology reference
