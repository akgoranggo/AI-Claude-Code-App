# Context Management Guide

> Implements **Frequent Intentional Compaction (FIC)** from [HumanLayer](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents), adapted for Linear-based workflows.

## Core Principle

Context window contents are the ONLY lever affecting output quality. Prioritize:
1. **Correctness** - Wrong info produces bugs
2. **Completeness** - Missing info causes failures
3. **Minimal noise** - Excess details degrade focus

## The RPI Workflow

```
/research-issue TEAM-123     →  RESEARCH-ARTIFACT comment  (<30% context)
        ↓
/plan-issue TEAM-123         →  PLAN-ARTIFACT comment      (<40% context)
        ↓  ★ Human review
/implement-plan TEAM-123     →  Working code               (<60% context)
```

**Why it works:**

| Approach | Research | Planning | Implement | Total |
|----------|----------|----------|-----------|-------|
| Traditional | 40% | +15% | +50% | 105% OVERFLOW |
| RPI | 5% | +5% | +52% | 62% HEALTHY |

## Compaction Techniques

### 1. Subagent Isolation

Delegate exploration to Task tool - returns only summaries:
```
Bad:  Grep results [2000 lines] → 40% context before coding
Good: Subagent returns "3 files, CRUD pattern, follow User entity" → 2%
```

### 2. Artifact-Based State Transfer

| Phase | Input | Output |
|-------|-------|--------|
| Research | Issue description | `RESEARCH-ARTIFACT` comment |
| Plan | Research artifact only | `PLAN-ARTIFACT` comment |
| Implement | Plan artifact only | Working code |

### 3. Selective Comment Loading

```
get_issue(id)      → title, description, labels (no comments)
list_comments(id)  → filter for <!-- PLAN-ARTIFACT:ID --> only
```

### 4. Progress Checkpointing

For 4+ phases, checkpoint after every 2. If context >60%, commit and `/implement-plan ID --resume`.

## When to Use RPI vs Direct

**Use RPI:** 3+ files, unfamiliar code, Track 3, multiple acceptance criteria
**Use Direct:** Single file, known patterns, simple bug fixes

## Context Health Signs

**Healthy:** Confident about files, clear patterns, specific file:line refs
**Degraded:** Uncertainty, repeating searches, vague responses, wrong assumptions

**Recovery:** Checkpoint → commit → fresh session with `--resume`

## Linear Artifact Format

```markdown
<!-- RESEARCH-ARTIFACT:TEAM-123 -->
...content...
<!-- /RESEARCH-ARTIFACT -->

<!-- PLAN-ARTIFACT:TEAM-123 -->
...content...
<!-- /PLAN-ARTIFACT -->
```

## References

- [HumanLayer ACE](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents)
- Commands: `/research-issue`, `/plan-issue`, `/implement-plan`
