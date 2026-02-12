# HumanLayer FIC Methodology Reference

> Reference for [HumanLayer's Advanced Context Engineering](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents).

## The Problem

AI coding tools struggle in complex codebases - context fills with exploration noise before real work begins, and quality degrades as limits approach.

## The Solution: Frequent Intentional Compaction

Structure work into phases producing **compacted artifacts**:
- Keep context at 40-60% utilization
- Convert verbose operations into structured summaries
- Transfer state via artifacts, not raw context

## Three Phases

| Phase | Goal | Output |
|-------|------|--------|
| **Research** | Understand codebase (don't propose changes) | Research artifact: files, patterns, dependencies, risks |
| **Plan** | Precise implementation steps | Plan artifact: files to modify, steps, verification criteria |
| **Implement** | Execute with fresh context | Working code |

## Human Leverage Points

> "A bad line of research could result in thousands of bad lines of code."

| Review Point | Effort | Impact |
|--------------|--------|--------|
| Research summary | 10 min | Catches wrong direction |
| Plan review | 20 min | Prevents cascading errors |
| Code review | 60 min | Catches remaining bugs |

## Subagent Patterns

| Agent | Purpose | Returns | Avoids |
|-------|---------|---------|--------|
| Codebase Locator | Find files by topic | File lists by category | Analysis, suggestions |
| Codebase Analyzer | Document implementation | Docs with file:line refs | Critiques, recommendations |

## Linear Adaptation

| HumanLayer | This Project |
|------------|--------------|
| `thoughts/` directory | Linear comments |
| File artifacts | `<!-- RESEARCH-ARTIFACT -->` / `<!-- PLAN-ARTIFACT -->` |
| `research_codebase` | `/research-issue` |
| `create_plan` | `/plan-issue` |
| `implement_plan` | `/implement-plan` |

**Benefits:** Visibility in Linear UI, automatic traceability, selective loading via MCP, familiar review interface.

## Using Full HumanLayer Tooling

```bash
# Clone reference repo
git clone https://github.com/humanlayer/advanced-context-engineering-for-coding-agents

# Key files to reference:
# - .claude/commands/research_codebase.md
# - .claude/commands/create_plan.md
# - .claude/commands/implement_plan.md
# - .claude/agents/codebase-*.md
```

## References

- [HumanLayer GitHub](https://github.com/humanlayer/humanlayer)
- [ACE Repository](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents)
- [FIC Methodology](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)
