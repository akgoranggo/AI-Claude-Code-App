# Documentation Hub

Welcome to the documentation for the AI-enabled multi-agent development system. This README helps you find the right documentation for your role and task.

---

## Quick Navigation by Role

### 👤 For Project Leads

**Setting up a new project?**
- Start here: [setup/PROJECT-SETUP.md](setup/PROJECT-SETUP.md) - Initial project configuration
- Then: [setup/LINEAR-SETUP.md](setup/LINEAR-SETUP.md) - Linear project setup
- Checklist: [setup/ONBOARDING-CHECKLIST.md](setup/ONBOARDING-CHECKLIST.md) - Verify everything works

**Daily work?**
- [workflow/DAILY-WORKFLOW.md](workflow/DAILY-WORKFLOW.md) - Daily orchestration routine
- [reference/COMMANDS.md](reference/COMMANDS.md) - Quick command reference

**Problems?**
- [workflow/TROUBLESHOOTING.md](workflow/TROUBLESHOOTING.md) - Common issues and solutions

---

### 🤖 For AI Agents

**Starting a new issue?**
- Start here: [agent-system/QUICK-START.md](agent-system/QUICK-START.md) - Your entry point

**Implementing code?**
- [agent-system/AGENT-GUIDE.md](agent-system/AGENT-GUIDE.md) - Core principles and guidelines
- [agent-system/PATTERNS.md](agent-system/PATTERNS.md) - Code patterns to follow
- **Track-specific guides:**
  - [agent-system/tracks/TRACK-1-ONTOLOGY.md](agent-system/tracks/TRACK-1-ONTOLOGY.md) - Schema, storage, API
  - [agent-system/tracks/TRACK-2-DESIGN-SYSTEM.md](agent-system/tracks/TRACK-2-DESIGN-SYSTEM.md) - Components, styling
  - [agent-system/tracks/TRACK-3-TRACER-BULLETS.md](agent-system/tracks/TRACK-3-TRACER-BULLETS.md) - End-to-end features

**Before marking complete?**
- [agent-system/VALIDATION-CHECKLIST.md](agent-system/VALIDATION-CHECKLIST.md) - Self-validation checklist
- [agent-system/UAT-ENABLEMENT.md](agent-system/UAT-ENABLEMENT.md) - Making work testable

---

### 👨‍💻 For Code Reviewers

**Reviewing agent work?**
- [workflow/REVIEW-GUIDE.md](workflow/REVIEW-GUIDE.md) - UAT review process
- [agent-system/VALIDATION-CHECKLIST.md](agent-system/VALIDATION-CHECKLIST.md) - What to check
- [agent-system/PATTERNS.md](agent-system/PATTERNS.md) - Expected code patterns

**Testing requirements?**
- [agent-system/UAT-ENABLEMENT.md](agent-system/UAT-ENABLEMENT.md) - UAT standards

---

### 🏗️ For Architects & Technical Leads

**Understanding the system?**
- [AGENT-STRATEGY.md](AGENT-STRATEGY.md) - Multi-agent orchestration architecture
- [reference/CONCEPTS.md](reference/CONCEPTS.md) - Foundational concepts (6-phase workflow, issue types, tracks)

**Managing Linear workflow?**
- [reference/LINEAR-WORKFLOW.md](reference/LINEAR-WORKFLOW.md) - Status management, dependencies
- [reference/TEAM-PROJECT-ORGANIZATION.md](reference/TEAM-PROJECT-ORGANIZATION.md) - Multi-team coordination
- [reference/TEMPLATES.md](reference/TEMPLATES.md) - Issue and PR templates

---

## Reference Materials

### Core Concepts
- [reference/CONCEPTS.md](reference/CONCEPTS.md) - **Single source of truth** for:
  - 6-Phase Workflow (Strategic Planning → Development Execution)
  - Issue Types (Specification, Decision, Implementation)
  - Development Plan Documents (Business Requirements + Technical Design)
  - Track Organization (1-ONTOLOGY, 2-DESIGN-SYSTEM, 3-TRACER-BULLETS)
  - Traceability Chain (how artifacts link together)

### Commands & Workflow
- [reference/COMMANDS.md](reference/COMMANDS.md) - Slash command reference
- [reference/LINEAR-WORKFLOW.md](reference/LINEAR-WORKFLOW.md) - Linear status, dependencies, views
- [reference/TEAM-PROJECT-ORGANIZATION.md](reference/TEAM-PROJECT-ORGANIZATION.md) - Multi-team project coordination
- [reference/TEMPLATES.md](reference/TEMPLATES.md) - All issue and PR templates

---

## Documentation Structure

```
docs/
├── README.md                          ← You are here
├── AGENT-STRATEGY.md                  ← Architecture overview
│
├── setup/                             ← One-time setup (project leads)
│   ├── PROJECT-SETUP.md
│   ├── LINEAR-SETUP.md
│   └── ONBOARDING-CHECKLIST.md
│
├── workflow/                          ← Daily operations (humans)
│   ├── DAILY-WORKFLOW.md
│   ├── REVIEW-GUIDE.md
│   └── TROUBLESHOOTING.md
│
├── agent-system/                      ← Implementation (AI agents)
│   ├── QUICK-START.md
│   ├── AGENT-GUIDE.md
│   ├── PATTERNS.md
│   ├── VALIDATION-CHECKLIST.md
│   ├── UAT-ENABLEMENT.md
│   └── tracks/
│       ├── TRACK-1-ONTOLOGY.md
│       ├── TRACK-2-DESIGN-SYSTEM.md
│       └── TRACK-3-TRACER-BULLETS.md
│
└── reference/                         ← Quick lookups (all users)
    ├── CONCEPTS.md                    ← Single source of truth
    ├── COMMANDS.md
    ├── LINEAR-WORKFLOW.md
    ├── TEAM-PROJECT-ORGANIZATION.md
    └── TEMPLATES.md
```

---

## Document Status

**Phase 1: Structure Created** ✅
- [x] Directory structure established
- [x] Placeholder files created
- [x] Navigation hub (this file) created

**Phase 2: Content Migration** 🚧
- [ ] Extract and consolidate reference/CONCEPTS.md
- [ ] Extract reference/COMMANDS.md, LINEAR-WORKFLOW.md, TEMPLATES.md
- [ ] Create setup guides
- [ ] Create workflow guides
- [ ] Create agent system guides
- [ ] Refactor AGENT-STRATEGY.md
- [ ] Archive legacy mega-files

**Phase 3: Cross-Reference Update** ⏳
- [ ] Update `.claude/commands/` references
- [ ] Update `.claude/skills/` references
- [ ] Update `.claude/agents/` references
- [ ] Test all links

---

## Key Principles

### Audience Separation
- **setup/** → Project leads (one-time)
- **workflow/** → Humans managing work (daily)
- **agent-system/** → AI agents implementing (per-task)
- **reference/** → Quick lookups (all users)

### Single Source of Truth
- Core concepts defined **once** in `reference/CONCEPTS.md`
- All other documents link to canonical reference
- No duplication

### Accessibility
- No file over 700 lines
- 75% of files under 300 lines
- Quick-reference materials under 100 lines

---

## Need Help?

**Can't find what you need?**
1. Check your role section above
2. Search this README for keywords
3. Check [workflow/TROUBLESHOOTING.md](workflow/TROUBLESHOOTING.md)
4. Ask in team chat

**Found an issue?**
- Documentation bug: Create issue with label `documentation`
- Missing information: Comment on relevant doc file
- Unclear content: Suggest improvement

---

## Change Log

### 2026-01-12: Documentation Refactor Complete (Phases 1-7)
- **Phase 1-5:** Created audience-specific documentation structure
- **Phase 6:** Refactored AGENT-STRATEGY.md (2,184 → 367 lines), archived LINEAR-INTEGRATION.md and UAT-GUIDE.md
- **Phase 7:** Updated all cross-references in .claude/commands/, .claude/skills/, .claude/agents/, and .claude/README.md
- **Result:** 19 focused documents (no file over 700 lines), eliminated redundancy, clear audience separation
- **Next:** Phase 8 (validation and testing)
