# Sync Workflow Docs

Validate and synchronize workflow documentation with Claude configuration files to ensure consistency.

## Usage

```
/sync-workflow-docs [options]
```

## Options

- `validate` - Only check for discrepancies, don't make changes
- `docs-to-config` - Update .claude files based on docs/AGENT-STRATEGY.md
- `config-to-docs` - Update docs based on .claude configuration
- `full` - Bidirectional sync (default)

## Examples

- `/sync-workflow-docs` - Full bidirectional sync
- `/sync-workflow-docs validate` - Check for discrepancies only
- `/sync-workflow-docs docs-to-config` - Update configs from documentation

## Instructions

When this command is invoked:

1. **Read source files**:
   - `docs/AGENT-STRATEGY.md` - Master workflow documentation
   - `.claude/commands/*.md` - Slash command definitions
   - `.claude/skills/*/SKILL.md` - Skill definitions (if any)
   - `.claude/agents/*/AGENT.md` - Agent definitions (if any)

2. **Compare content sections**:

   **Agent Definitions:**
   - Compare agent types in AGENT-STRATEGY.md with .claude/agents/
   - Check: implementing_agent, supervisor_agent, orchestrator_agent

   **Workflows:**
   - Compare workflow steps in AGENT-STRATEGY.md with .claude/commands/
   - Check: start-issue, validate-issue, update-status, etc.

   **Capabilities:**
   - Verify agent capabilities match documentation

   **Status Definitions:**
   - Verify status values are consistent

3. **Identify discrepancies**:
   - Missing commands/agents
   - Outdated descriptions
   - Inconsistent parameters
   - Missing documentation

4. **Generate report** with findings

5. **If not validate-only**, propose or apply updates

## Output Format

```
## Documentation Sync Report

**Mode:** [Validate Only | Docs to Config | Config to Docs | Full Sync]
**Timestamp:** {current datetime}

---

### Source Files Analyzed

| File | Status | Last Modified |
|------|--------|---------------|
| docs/AGENT-STRATEGY.md | [Found/Missing] | [date] |
| .claude/commands/*.md | [X files found] | - |
| .claude/skills/*/SKILL.md | [X skills found] | - |
| .claude/agents/*/AGENT.md | [X agents found] | - |

### Discrepancies Found

#### Commands
| Command | In Docs | In .claude | Status |
|---------|---------|------------|--------|
| start-issue | Yes | [Yes/No] | [Synced/Missing/Outdated] |
| validate-issue | Yes | [Yes/No] | [Synced/Missing/Outdated] |
| ... | ... | ... | ... |

#### Agents
| Agent | In Docs | In .claude | Status |
|-------|---------|------------|--------|
| implementing_agent | Yes | [Yes/No] | [Synced/Missing/Outdated] |
| supervisor_agent | Yes | [Yes/No] | [Synced/Missing/Outdated] |
| ... | ... | ... | ... |

#### Skills
| Skill | In Docs | In .claude | Status |
|-------|---------|------------|--------|
| [skill name] | [Yes/No] | [Yes/No] | [Status] |

### Content Differences

{For each discrepancy:}
**{item name}**
- Documentation says: [content]
- Config says: [content]
- Recommendation: [action]

---

### Proposed Updates

{If not validate-only:}

1. [ ] Create `.claude/agents/implementing-agent/AGENT.md`
2. [ ] Update description in `.claude/commands/start-issue.md`
3. [ ] ...

### Summary

- **Total discrepancies:** X
- **Critical (blocking):** X
- **Warnings:** X
- **Info:** X

### Next Steps

{Based on mode and findings}
```

## Related Files

- @docs/AGENT-STRATEGY.md
- @CLAUDE.md
