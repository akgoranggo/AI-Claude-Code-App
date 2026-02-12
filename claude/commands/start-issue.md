# Start Issue

Assign an issue to an agent and begin implementation on a feature branch.

## Usage

```
/start-issue {LINEAR_ISSUE_ID} [additional context]
```

## Examples

- `/start-issue TEAM-123`
- `/start-issue TEAM-123 focus on schema definitions first`

## Instructions

When this command is invoked:

1. **Parse the Linear issue ID** from the command (e.g., "TEAM-123")

2. **Fetch the Linear issue**:
   - Use the Linear MCP `get_issue` tool to retrieve issue details
   - Extract: title, description, labels, status, blocker relationships, branch name (from branchName field)

3. **Check for worktree and create if needed**:
   - Run `git worktree list` to check if a worktree exists at `../{repo-name}-{LINEAR_ISSUE_ID}`
   - If the worktree does NOT exist:
     - Use the branch name from the Linear issue's `branchName` field
     - If no branch name exists, generate one: `feature/{ISSUE_ID}-{kebab-case-title}`
     - Create the worktree: `git worktree add -b {BRANCH_NAME} ../{repo-name}-{LINEAR_ISSUE_ID} main`
     - Report that the worktree was created
   - If the worktree already exists:
     - Report that using existing worktree
     - Checkout the feature branch if not already on it

4. **Read essential context files**:
   - `docs/agent-system/AGENT-GUIDE.md` - Agent instructions
   - `docs/agent-system/PATTERNS.md` - Code patterns to follow
   - `docs/agent-system/VALIDATION-CHECKLIST.md` - Validation requirements
   - `docs/agent-system/UAT-ENABLEMENT.md` - UAT enablement requirements
   - **Linear Development Plan document** - Project specifications (fetch from Linear documents)

5. **Verify dependencies**:
   - Check the Linear issue's `blockedBy` relationships
   - Use Linear MCP `get_issue` for each blocker to check its status
   - If any blocker is not in "Done" state, report the blocker and do not proceed

6. **Update status in Linear**:
   - Use Linear MCP `update_issue` to set the issue state to "In Progress"
   - Update the issue's `assignee` field to the current agent (use "me" for self-assignment)

7. **Provide implementation context**:
   - Summarize the issue objective from the description
   - Identify the track from labels (1-ONTOLOGY, 2-DESIGN-SYSTEM, 3-TRACER-BULLETS)
   - Extract scope and acceptance criteria from the issue description
   - Reference relevant patterns from PATTERNS.md based on the track
   - Include any additional context provided by the user

8. **Remind about deliverables**:
   - Code implementation
   - Tests (use `/write-tests` when implementation is complete)
   - UAT instructions (add as a comment to the Linear issue before completion)

9. **Begin implementation** following the issue specifications

## Error Handling

If errors occur during issue startup, handle them gracefully:

### Linear MCP Not Available

**Symptoms:**
- "Could not connect to Linear MCP server"
- "Linear MCP tool not found"
- Timeout when calling Linear functions

**Solutions:**
1. **Check MCP Configuration:**
   ```bash
   # Verify settings exist
   cat .claude/settings.local.json
   ```
   Ensure Linear MCP server is configured in `mcpServers.linear`

2. **Verify API Key:**
   ```bash
   # Check environment variable is set
   echo $LINEAR_API_KEY
   ```
   If empty, add to your shell profile: `export LINEAR_API_KEY="lin_api_..."`

3. **Test MCP Server:**
   ```bash
   # Verify Linear MCP server can be invoked
   npx -y @modelcontextprotocol/server-linear --version
   ```

4. **Restart Claude Code:** Exit and restart to reload MCP configuration

### Issue Not Found

**Symptoms:**
- "Issue TEAM-123 not found"
- "Invalid issue ID"

**Solutions:**
1. Verify issue exists in Linear workspace (check Linear UI)
2. Confirm issue ID format is correct (e.g., "TEAM-123", not "TEAM-123" or "#123")
3. Ensure your API key has access to the team (check Linear team settings)
4. Try listing issues: Use Linear MCP `list_issues` to confirm connection

### Blocked by Dependencies

**Symptoms:**
- "Cannot start issue TEAM-123: blocked by TEAM-001, TEAM-002"

**Solutions:**
1. Check blocker status in Linear UI
2. Complete or unblock prerequisite issues first
3. If blocker is incorrectly set, remove the blocker relationship in Linear
4. Work on a different issue that's not blocked

### Branch/Worktree Issues

**Symptoms:**
- "Branch already exists"
- "Worktree path already exists"

**Solutions:**
1. **Check existing worktrees:**
   ```bash
   git worktree list
   ```

2. **If worktree exists but is stale:**
   ```bash
   # Remove old worktree
   git worktree remove ../repo-TEAM-123
   # Or use /cleanup-worktree command
   /cleanup-worktree TEAM-123
   ```

3. **If branch exists:**
   - Checkout existing branch: `git checkout feature/TEAM-123-...`
   - Or use existing worktree if it's still valid

### Network/Connectivity Issues

**Symptoms:**
- Timeout errors
- "Cannot reach Linear API"

**Solutions:**
1. Check internet connectivity
2. Verify Linear API status: https://status.linear.app
3. Check firewall/proxy settings
4. Try again in a few minutes (transient network issues)

**Fallback:** If Linear is unavailable, defer status updates and work on implementation. Update Linear manually when connectivity is restored.

---

## Output Format

```
## Starting Issue: {LINEAR_ISSUE_ID}

**Title:** [Issue title]

**Objective:** [Summary from issue description]

**Track:** [1-ONTOLOGY | 2-DESIGN-SYSTEM | 3-TRACER-BULLETS]

**Dependencies:** [List blockedBy issues with status]

**Branch:** {branch-name}

**Relevant Patterns:**
- [Pattern references based on track]

**Status:** Updated to In Progress, assigned to current agent

---

### Deliverables Checklist

Before this issue can be marked complete:

- [ ] **Code Implementation** - All acceptance criteria met
- [ ] **Tests** - Run `/write-tests {LINEAR_ISSUE_ID}` to generate and document tests
- [ ] **UAT Instructions** - Add as a comment to the Linear issue (see UAT-ENABLEMENT.md for template)
  - Prerequisites (commands to run)
  - How to access the feature
  - Test scenarios with expected results
  - Verification checklist

---

Beginning implementation...
```

## Related Files

- @docs/agent-system/AGENT-GUIDE.md
- @docs/agent-system/PATTERNS.md
- @docs/agent-system/UAT-ENABLEMENT.md
- @docs/reference/LINEAR-WORKFLOW.md
- @docs/reference/CONCEPTS.md
