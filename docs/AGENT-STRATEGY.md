# AI Agent Development Orchestration System

> **Strategy Overview** - High-level architecture and approach for multi-agent development.

## Purpose

This document describes the **strategy and architecture** for orchestrating multiple AI coding agents working in parallel using Claude Code's multi-agent system. For detailed implementation guides, see the [Documentation Hub](#documentation-hub) below.

**Note:** This workflow is designed for **Windows development using PowerShell**. If you're using a different shell, adapt the commands accordingly.

---

## Quick Links

**Setting up your project?** → [setup/PROJECT-SETUP.md](./setup/PROJECT-SETUP.md)
**Managing daily work?** → [workflow/DAILY-WORKFLOW.md](./workflow/DAILY-WORKFLOW.md)
**AI agent starting work?** → [agent-system/QUICK-START.md](./agent-system/QUICK-START.md)
**Reviewing agent work?** → [workflow/REVIEW-GUIDE.md](./workflow/REVIEW-GUIDE.md)

---

## Overview

This system enables parallel development with multiple AI agents working on independent issues simultaneously, using Linear for issue tracking and Claude Code for AI orchestration.

### Key Capabilities

- **Parallel Development** - Multiple agents work on different issues at the same time
- **Specialized Agents** - Domain-specific expertise (data layer, UI, features)
- **Linear Integration** - Issue tracking, dependencies, status management, traceability
- **Git Isolation** - Each issue uses its own feature branch via git worktrees
- **Human Oversight** - You review all changes before merging to main

### How It Works

1. **You plan work in Linear** - Define issues with dependencies and track labels
2. **Agents start issues** - Use `/start-issue ENG-123` to begin work
3. **Agents implement** - Follow track-specific patterns and validation checklists
4. **You review with UAT** - Test functionality before merging
5. **PRs created automatically** - `/create-pr ENG-123` generates pull request
6. **You merge** - Approve and merge to main branch

---

## Project Management: Linear Integration

**All work items, dependencies, and status tracking are managed in Linear.**

### 6-Phase Workflow

Projects follow a **phased approach** that progressively refines requirements into implementation:

| Phase | Focus | Artifacts Created |
|-------|-------|-------------------|
| **Phase 1: Strategic Planning** | Project vision and architecture | Linear project metadata, Architecture doc, Glossary doc |
| **Phase 2: User Research** | Personas and metrics | Persona documents, Success Metrics doc |
| **Phase 3: Requirements Capture** | User stories and decisions | User story issues, Decision issues |
| **Phase 4: Technical Design** | Specifications and milestones | Specification issues, Milestones |
| **Phase 5: Implementation Planning** | Implementation tasks | Implementation issues (3-track) |
| **Phase 6: Development Execution** | Implementation and UAT | Code, Tests, PRs, UAT reviews |

**See:** [reference/CONCEPTS.md](./reference/CONCEPTS.md) for complete workflow details

### Issue Types

**5 types of issues used in this workflow:**

1. **User Story Issues** (`user-story` label) - Business requirements
2. **Specification Issues** (`design` label) - Technical design
3. **Decision Issues** (`decision` label) - Architectural decisions
4. **Implementation Issues** (track labels) - Executable work
5. **Out of Scope Issues** (`out-of-scope-v1` label) - Deferred features

**See:** [reference/CONCEPTS.md](./reference/CONCEPTS.md) for complete issue type definitions

### Traceability Chain

**How artifacts link together:**

```
User Story Issue (TEAM-USER-010)
  ↓ "satisfies" relation
Specification Issue (ENG-SPEC-5)
  ↓ "implements" relation
Implementation Issues (ENG-15, FRONTEND-12, INT-8)
  ↓ validates against
UAT Review (Comments on implementation issues)
  ↓ confirms
User Story Acceptance Criteria ✓
```

**Setup Guide:** [setup/LINEAR-SETUP.md](./setup/LINEAR-SETUP.md)

---

## Claude Code Multi-Agent Architecture

### The Subagent Model

Claude Code uses a **subagent architecture** where specialized agents are delegated tasks based on their expertise:

1. **You assign Linear issues** - Using slash commands (`/start-issue ENG-123`)
2. **Claude delegates to specialized subagents** - Based on track label and work type
3. **Subagents work with domain expertise** - Each has specific tools and knowledge
4. **Skills provide automatic context** - Domain knowledge applied when relevant
5. **Commands standardize workflows** - Consistent processes for common operations
6. **Status tracking in Linear** - Issue states, labels, and relationships

### Three-Track Development System

All implementation work is organized into three specialized tracks:

| Track | Label | Focus | Dependencies |
|-------|-------|-------|--------------|
| **Track 1** | `1-ONTOLOGY` | Data models, storage, API endpoints | None |
| **Track 2** | `2-DESIGN-SYSTEM` | UI components, design tokens, styling | None |
| **Track 3** | `3-TRACER-BULLETS` | End-to-end features | Track 1 + Track 2 |

**Key Insight:** Tracks 1 and 2 can be developed in parallel, Track 3 integrates them.

**See:** [reference/CONCEPTS.md](./reference/CONCEPTS.md) for complete track definitions

### Extension Points

**Three types of Claude Code extensions power this workflow:**

| Extension Type | Location | Purpose | Invocation |
|---------------|----------|---------|------------|
| **Commands** | `.claude/commands/` | Explicit workflows (slash commands) | Type `/command-name` |
| **Skills** | `.claude/skills/` | Domain knowledge (patterns, conventions) | Automatic when relevant |
| **Agents** | `.claude/agents/` | Specialized subagents for delegation | Automatic via Task tool |

**Reference:** [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)

---

## Key Advantages

### For Project Leads

- **Parallel Development** - Multiple issues progress simultaneously
- **Predictable Patterns** - All agents follow the same conventions
- **Linear Integration** - All tracking in one place (Linear workspace)
- **Traceability** - Direct links from user story → spec → implementation
- **Quality Control** - Automated validation before review
- **UAT Focus** - Review functionality, not code

### For AI Agents

- **Clear Guidance** - Track-specific patterns and validation checklists
- **Automatic Context** - Skills inject relevant knowledge
- **Isolated Work** - Git worktrees prevent conflicts
- **Validation Built-in** - Check work before marking complete
- **Supervisor Help** - Escalate when stuck

### For Development Teams

- **Consistent Code** - Patterns enforced across all agents
- **Reduced Conflicts** - Isolated branches and clear file ownership
- **Fast Onboarding** - New agents follow existing patterns
- **Scalable** - Add more agents without coordination overhead
- **Maintainable** - Clear structure and documentation

---

## Repository Structure

```
<project-root>/
├── docs/
│   ├── README.md                           # Documentation hub (navigation)
│   ├── AGENT-STRATEGY.md                   # This file (strategy overview)
│   │
│   ├── setup/                              # For project leads (one-time setup)
│   │   ├── PROJECT-SETUP.md               # Initial project configuration
│   │   ├── LINEAR-SETUP.md                # Linear project setup
│   │   └── ONBOARDING-CHECKLIST.md        # Step-by-step verification
│   │
│   ├── workflow/                           # For humans managing work (daily ops)
│   │   ├── DAILY-WORKFLOW.md              # Daily orchestration guide
│   │   ├── REVIEW-GUIDE.md                # UAT review process
│   │   └── TROUBLESHOOTING.md             # Common issues and solutions
│   │
│   ├── agent-system/                       # For AI agents (per-task implementation)
│   │   ├── QUICK-START.md                 # Agent entry point (start here)
│   │   ├── AGENT-GUIDE.md                 # Core implementation principles
│   │   ├── PATTERNS.md                    # Code patterns to follow
│   │   ├── VALIDATION-CHECKLIST.md        # Pre-completion checks
│   │   ├── UAT-ENABLEMENT.md              # Preparing UAT instructions
│   │   └── tracks/                        # Track-specific guides
│   │       ├── TRACK-1-ONTOLOGY.md       # Data layer implementation
│   │       ├── TRACK-2-DESIGN-SYSTEM.md  # UI layer implementation
│   │       └── TRACK-3-TRACER-BULLETS.md # Integration layer
│   │
│   └── reference/                          # Quick lookups (all users)
│       ├── CONCEPTS.md                    # 6-phase workflow, issue types, tracks
│       ├── COMMANDS.md                    # Slash command reference
│       ├── LINEAR-WORKFLOW.md             # Status, dependencies, views
│       └── TEMPLATES.md                   # Issue templates, PR templates
│
├── .claude/                                # Claude Code configuration
│   ├── commands/                           # Slash commands
│   ├── skills/                             # Domain knowledge
│   ├── agents/                             # Specialized subagents
│   └── README.md                           # Configuration guide
│
└── <your-source-directories>/              # Project source code
```

---

## Getting Started

### For Project Leads (First-Time Setup)

1. **Read the strategy** (this document)
2. **Set up your project** → [setup/PROJECT-SETUP.md](./setup/PROJECT-SETUP.md)
3. **Configure Linear** → [setup/LINEAR-SETUP.md](./setup/LINEAR-SETUP.md)
4. **Verify setup** → [setup/ONBOARDING-CHECKLIST.md](./setup/ONBOARDING-CHECKLIST.md)
5. **Learn daily workflow** → [workflow/DAILY-WORKFLOW.md](./workflow/DAILY-WORKFLOW.md)

### For AI Agents (Starting Work on an Issue)

1. **Start here** → [agent-system/QUICK-START.md](./agent-system/QUICK-START.md)
2. **Identify your track** (1-ONTOLOGY, 2-DESIGN-SYSTEM, or 3-TRACER-BULLETS)
3. **Read your track guide** → [agent-system/tracks/](./agent-system/tracks/)
4. **Follow patterns** → [agent-system/PATTERNS.md](./agent-system/PATTERNS.md)
5. **Validate before completing** → [agent-system/VALIDATION-CHECKLIST.md](./agent-system/VALIDATION-CHECKLIST.md)
6. **Enable UAT** → [agent-system/UAT-ENABLEMENT.md](./agent-system/UAT-ENABLEMENT.md)

### For Reviewers (Conducting UAT)

1. **Review guide** → [workflow/REVIEW-GUIDE.md](./workflow/REVIEW-GUIDE.md)
2. **Follow UAT instructions** (agent provides in Linear comment)
3. **Provide feedback** (comment in Linear issue)
4. **Approve or request changes** (update issue status)

---

## Documentation Hub

All documentation is organized by audience and purpose:

### Setup Guides (Project Leads)

- [setup/PROJECT-SETUP.md](./setup/PROJECT-SETUP.md) - Initial project configuration
- [setup/LINEAR-SETUP.md](./setup/LINEAR-SETUP.md) - Linear project setup
- [setup/ONBOARDING-CHECKLIST.md](./setup/ONBOARDING-CHECKLIST.md) - Verification checklist

### Workflow Guides (Humans Managing Work)

- [workflow/DAILY-WORKFLOW.md](./workflow/DAILY-WORKFLOW.md) - Daily orchestration
- [workflow/REVIEW-GUIDE.md](./workflow/REVIEW-GUIDE.md) - UAT review process
- [workflow/TROUBLESHOOTING.md](./workflow/TROUBLESHOOTING.md) - Common issues

### Agent Guides (AI Agents)

- [agent-system/QUICK-START.md](./agent-system/QUICK-START.md) - **Start here**
- [agent-system/AGENT-GUIDE.md](./agent-system/AGENT-GUIDE.md) - Core principles
- [agent-system/PATTERNS.md](./agent-system/PATTERNS.md) - Code patterns
- [agent-system/VALIDATION-CHECKLIST.md](./agent-system/VALIDATION-CHECKLIST.md) - Pre-completion checks
- [agent-system/UAT-ENABLEMENT.md](./agent-system/UAT-ENABLEMENT.md) - Preparing UAT instructions
- [agent-system/tracks/TRACK-1-ONTOLOGY.md](./agent-system/tracks/TRACK-1-ONTOLOGY.md) - Data layer guide
- [agent-system/tracks/TRACK-2-DESIGN-SYSTEM.md](./agent-system/tracks/TRACK-2-DESIGN-SYSTEM.md) - UI layer guide
- [agent-system/tracks/TRACK-3-TRACER-BULLETS.md](./agent-system/tracks/TRACK-3-TRACER-BULLETS.md) - Integration layer guide

### Reference Materials (All Users)

- [reference/CONCEPTS.md](./reference/CONCEPTS.md) - 6-phase workflow, issue types, tracks
- [reference/COMMANDS.md](./reference/COMMANDS.md) - Slash command reference
- [reference/LINEAR-WORKFLOW.md](./reference/LINEAR-WORKFLOW.md) - Status workflow, dependencies
- [reference/TEMPLATES.md](./reference/TEMPLATES.md) - Issue templates, PR templates

---

## When to Use This Approach

### Ideal For

- **Complex web applications** with clear domain models
- **Teams wanting AI assistance** with human oversight
- **Projects with multiple work streams** (data, UI, features)
- **Organizations using Linear** for project management
- **Development requiring traceability** from requirements to implementation

### Not Ideal For

- **Simple scripts or utilities** (overhead too high)
- **Exploratory prototypes** (structure premature)
- **Single-developer projects** (parallel benefits lost)
- **Projects without clear ontology** (track system breaks down)

---

## Success Metrics

**How to measure effectiveness:**

1. **Parallel Efficiency** - Multiple issues completed per day
2. **First-Pass Quality** - Issues passing UAT without iteration
3. **Traceability** - All implementation issues link to specs and user stories
4. **Pattern Adherence** - Code follows PATTERNS.md conventions
5. **Conflict Rate** - Minimal merge conflicts despite parallel work

---

## Scaling Considerations

### Adding More Agents

- Each agent can work on one issue at a time
- Track 1 and Track 2 can have multiple agents in parallel
- Track 3 agents need Track 1 + Track 2 complete first
- Use git worktrees for full isolation

### Managing Bottlenecks

- **Review capacity** - Most common bottleneck (UAT takes time)
- **Track 3 starvation** - Ensure Track 1 + 2 stay ahead
- **Specification backlog** - Keep specs ahead of implementation
- **Dependency chains** - Break large features into smaller issues

---

## Customization

**Adapt this system to your project:**

- Replace placeholder `<PROJECT-NAME>` with your actual project name
- Adapt file paths to match your project structure
- Modify code patterns in PATTERNS.md for your tech stack
- Adjust track definitions if your domain differs significantly
- Create project-specific commands and skills as needed

---

## Support and Troubleshooting

**Stuck? Check these resources:**

1. **Troubleshooting Guide** → [workflow/TROUBLESHOOTING.md](./workflow/TROUBLESHOOTING.md)
2. **Command Reference** → [reference/COMMANDS.md](./reference/COMMANDS.md)
3. **Linear Workflow** → [reference/LINEAR-WORKFLOW.md](./reference/LINEAR-WORKFLOW.md)
4. **Agent Help** → Use `/request-supervisor-help ENG-123` command

---

## Related Resources

- **Claude Code Documentation**: https://docs.anthropic.com/en/docs/claude-code
- **Linear API Documentation**: https://developers.linear.app/docs
- **Git Worktrees**: https://git-scm.com/docs/git-worktree

---

## Document History

**Version 2.0** - Documentation refactor (January 2026)
- Split into audience-specific guides
- Eliminated redundancy
- Added comprehensive track guides
- Improved accessibility (no file over 700 lines)

**Version 1.0** - Initial multi-agent orchestration system
- Linear integration
- 6-phase workflow
- 3-track development system
