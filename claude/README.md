# Claude Code Configuration

> **Note:** This is a template configuration. Customize the commands, skills, and agents to match your project's specific needs.

This directory contains Claude Code extensions for the multi-agent development workflow described in `docs/AGENT-STRATEGY.md`.

## What This Provides

This configuration enables AI-assisted development with:
- **Specialized subagents** for ontology, UI, and feature development
- **Slash commands** for starting work, validation, and status updates
- **Domain skills** that provide automatic context for schemas, APIs, and components
- **Linear integration** for issue tracking and dependency management

## Getting Started

1. **Review the workflow:** Read `docs/AGENT-STRATEGY.md` to understand the multi-agent approach
2. **Set up Linear:** Follow `docs/setup/LINEAR-SETUP.md` for issue tracking setup
3. **Customize agents:** Update agent files in `agents/` to match your project's architecture
4. **Define patterns:** Add project-specific code patterns to `docs/agent-system/PATTERNS.md`
5. **Start working:** Use `/start-issue {ISSUE_ID}` to begin implementation

## Directory Structure

```
.claude/
├── commands/           # Slash commands (explicit invocation)
│   ├── research-issue.md      # RPI Phase 1: Research codebase
│   ├── plan-issue.md          # RPI Phase 2: Create implementation plan
│   ├── implement-plan.md      # RPI Phase 3: Execute plan
│   ├── start-issue.md         # Traditional: Start simple issue
│   ├── validate-issue.md
│   ├── update-status.md
│   ├── request-supervisor-help.md
│   ├── supervisor-review.md
│   └── sync-workflow-docs.md
│
├── skills/             # Domain knowledge (automatic use)
│   ├── ontology-patterns/SKILL.md
│   ├── design-system-patterns/SKILL.md
│   └── issue-workflow/SKILL.md
│
├── agents/             # Specialized subagents (delegated work)
│   ├── ontology-developer/AGENT.md
│   ├── ui-developer/AGENT.md
│   ├── feature-developer/AGENT.md
│   ├── supervisor/AGENT.md
│   ├── codebase-analyzer.md   # Code analysis for research
│   └── codebase-locator.md    # File discovery for research
│
└── README.md           # This file
```

## How It Works

### Slash Commands (`/command-name`)

Explicitly invoked workflows. Type `/` in Claude Code to see available commands.

#### Research-Plan-Implement Workflow (Recommended for Complex Issues)

| Command | Purpose |
| --- | --- |
| `/research-issue` | Phase 1: Research codebase with subagent isolation |
| `/plan-issue` | Phase 2: Create compacted implementation plan |
| `/implement-plan` | Phase 3: Execute plan with fresh context |

#### Traditional Workflow (Simple Issues)

| Command | Purpose |
| --- | --- |
| `/start-issue` | Begin a simple Linear issue assignment |
| `/validate-issue` | Run validation before review |
| `/update-status` | Update Linear issue status |
| `/request-supervisor-help` | Get guidance when stuck |
| `/supervisor-review` | Request pre-UAT review |
| `/sync-workflow-docs` | Validate doc/config sync |
| `/sync-base-template` | Sync repo with base-web-app |
| `/sync-dev-plan` | Sync dev plan with requirements |

**Usage Examples:**

```
# RPI Workflow (complex issues)
/research-issue TEAM-123          # Research codebase
/plan-issue TEAM-123              # Create plan from research
/implement-plan TEAM-123          # Execute plan

# Traditional Workflow (simple issues)
/start-issue TEAM-123
/validate-issue TEAM-123
/update-status TEAM-123 complete
/request-supervisor-help TEAM-123 Need guidance on API structure
/supervisor-review TEAM-123 focus on schema compliance
```

**Note:** Commands use Linear issue IDs (e.g., TEAM-123) for issue tracking. See `docs/setup/LINEAR-SETUP.md` for setup.

### Skills (Automatic)

Domain knowledge Claude uses automatically when relevant. No explicit invocation needed.

| Skill                    | When Used                         |
| ------------------------ | --------------------------------- |
| `ontology-patterns`      | Working on schemas, APIs, storage |
| `design-system-patterns` | Building UI components            |
| `issue-workflow`     | Managing Linear issues, status       |

### Subagents (Delegated)

Specialized agents for complex tasks. Claude delegates to these when appropriate.

#### Implementation Agents

| Agent                | Specialization               |
| -------------------- | ---------------------------- |
| `ontology-developer` | 1 work (schemas, APIs)       |
| `ui-developer`       | 2 work (components, styling) |
| `feature-developer`  | 3 work (full features)       |
| `supervisor`         | Review and guidance          |

#### Research Agents (Context Isolation)

| Agent                | Specialization               |
| -------------------- | ---------------------------- |
| `codebase-locator`   | Find files by topic/feature  |
| `codebase-analyzer`  | Document code implementation |

> Research agents are adapted from [HumanLayer's FIC methodology](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents). They isolate noisy exploration operations to separate contexts, returning only compacted summaries.

## Development Tracks

The workflow supports three parallel development tracks organized by Linear labels:

1. **1-ONTOLOGY**
   - Database schemas, storage methods, API endpoints
   - Uses: `ontology-developer` agent, `ontology-patterns` skill
   - Linear label: `1-ONTOLOGY`

2. **2-DESIGN-SYSTEM**
   - UI components, design tokens, styling
   - Uses: `ui-developer` agent, `design-system-patterns` skill
   - Linear label: `2-DESIGN-SYSTEM`

3. **3-TRACER-BULLETS**
   - End-to-end features integrating tracks 1 & 2
   - Uses: `feature-developer` agent
   - Linear label: `3-TRACER-BULLETS`

**Note:** Issues are tracked in Linear with appropriate track labels. See `docs/reference/CONCEPTS.md` for track organization details.

## Linear Issue Lifecycle

Linear issue states:

```
Backlog → Todo → In Progress → In Review → Done
                      ↑            ↓
                      └────────────┘
                   (iteration cycle)
```

**State Meanings:**
- **Backlog**: Planned but dependencies not complete
- **Todo**: Ready to start, no blockers
- **In Progress**: Agent actively working (includes iterations)
- **In Review**: Code complete, awaiting UAT review
- **Done**: UAT approved, merged to main

See `docs/AGENT-STRATEGY.md` for complete workflow documentation and `docs/reference/LINEAR-WORKFLOW.md` for Linear-specific details.

## Related Files

### Core Documentation
- [AGENT-STRATEGY.md](../docs/AGENT-STRATEGY.md) - Strategy overview and architecture
- [AGENT-GUIDE.md](../docs/agent-system/AGENT-GUIDE.md) - Agent development guide
- [LINEAR-SETUP.md](../docs/setup/LINEAR-SETUP.md) - Linear workspace setup
- [LINEAR-WORKFLOW.md](../docs/reference/LINEAR-WORKFLOW.md) - Linear workflow and status
- [CLAUDE.md](../CLAUDE.md) - Project-level Claude instructions

### Agent Resources
- [QUICK-START.md](../docs/agent-system/QUICK-START.md) - Agent entry point
- [PATTERNS.md](../docs/agent-system/PATTERNS.md) - Code patterns to follow
- [VALIDATION-CHECKLIST.md](../docs/agent-system/VALIDATION-CHECKLIST.md) - Pre-completion checks
- [UAT-ENABLEMENT.md](../docs/agent-system/UAT-ENABLEMENT.md) - UAT preparation

### Reference Materials
- [CONCEPTS.md](../docs/reference/CONCEPTS.md) - 6-phase workflow, issue types, tracks
- [COMMANDS.md](../docs/reference/COMMANDS.md) - Slash command reference
- [TEMPLATES.md](../docs/reference/TEMPLATES.md) - Issue and PR templates
- [HUMANLAYER-FIC.md](../docs/reference/HUMANLAYER-FIC.md) - FIC methodology reference

### Context Engineering
- [CONTEXT-MANAGEMENT.md](../docs/agent-system/CONTEXT-MANAGEMENT.md) - Frequent Intentional Compaction guide
