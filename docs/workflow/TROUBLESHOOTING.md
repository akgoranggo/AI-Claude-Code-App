# Troubleshooting Guide

> **Common Issues & Solutions** - Quick reference for resolving frequent problems.

## Purpose

This guide provides solutions to common issues encountered when using the AI-enabled multi-agent development system. Problems are organized by category with specific solutions and links to detailed documentation.

**Audience:** All users

---

## Agent Issues

### Problem: Agent Stuck or Not Making Progress

**Symptoms:**
- Issue in "In Progress" for >2 hours with no comments
- Agent asking repeated clarifying questions
- No code commits to feature branch

**Possible causes:**
1. **Ambiguous requirements** - Issue description unclear or incomplete
2. **Missing dependencies** - Blockers not properly set or resolved
3. **Technical complexity** - Issue scope too large or technically blocked
4. **External dependency** - Waiting on API, database, or third-party service

**Solutions:**

**If requirements unclear:**
1. Read Linear issue comments to understand confusion
2. Add clarifying comment with specific guidance
3. Reference specification issue if applicable
4. Update issue description if fundamentally incomplete

**If dependencies missing:**
1. Check "Blocked by" relations in Linear
2. Verify blocker issues are actually "Done"
3. Add missing blocker relationships if found
4. Communicate timeline if blocker delayed

**If technically blocked:**
1. Use `/request-supervisor-help TEAM-XXX` to escalate
2. Consider splitting into smaller, simpler issues
3. Review if issue requires architectural decision
4. Create decision issue if needed

**Prevention:**
- Provide complete issue descriptions with clear acceptance criteria
- Link to specification and user story issues
- Set blocker relationships explicitly
- Keep issue scope focused (4 hours of agent-work max)

---

### Problem: Agent Asking Too Many Questions

**Symptoms:**
- Multiple clarifying questions per issue
- Agent seems confused about requirements
- Repeated questions about same topic

**Root cause:** Issue description lacks necessary context or clarity

**Solutions:**

1. **Improve issue descriptions:**
   - Link to specification issue (`implements TEAM-SPEC-XXX`)
   - Link to user story issues (`satisfies TEAM-USER-XXX`)
   - Include concrete examples of expected behavior
   - Specify files to modify and files to avoid

2. **Use specification issues:**
   - Don't skip Phase 4 (Technical Design)
   - Create spec issues for complex Object Types
   - Get spec approved before creating implementation issues

3. **Reference patterns:**
   - Point to similar existing code
   - Reference `docs/agent-system/PATTERNS.md` explicitly
   - Provide line number references: "See pattern in server/storage.ts:45-60"

4. **Provide examples:**
   - Include sample input/output
   - Show expected API request/response shape
   - Link to existing similar features

**Prevention:**
- Use issue templates from [reference/TEMPLATES.md](../reference/TEMPLATES.md)
- Always link specifications and user stories
- Review issue descriptions before assignment

---

## Git & Merge Issues

### Problem: Merge Conflicts

**Symptoms:**
- Pull request shows conflicts
- Git reports conflicts when merging to main
- Multiple agents working on same files

**Solutions:**

**Option 1: Agent resolves conflicts**
1. Comment in Linear issue explaining conflict
2. Request agent resolve conflicts and update PR
3. Agent will rebase branch on latest main

**Option 2: Human resolves conflicts**
1. Pull feature branch: `git checkout TEAM-XXX-feature-name`
2. Rebase on main: `git rebase main`
3. Resolve conflicts manually
4. Continue rebase: `git rebase --continue`
5. Force push: `git push --force-with-lease`

**Prevention:**
- Review and merge PRs promptly (don't let queue grow)
- Coordinate related issues (don't assign overlapping work)
- Use feature flags for large changes affecting many files
- Consider git worktrees for parallel development

**See:** [Git Worktrees Guide] (if applicable in your setup)

---

### Problem: Branch Naming Issues

**Symptoms:**
- Branch name doesn't match Linear issue ID
- Multiple branches for same issue
- Can't find feature branch

**Root cause:** Manual branch creation instead of using `/start-issue`

**Solutions:**

1. **Always use `/start-issue TEAM-XXX`** to create branches
   - Command generates consistent branch names
   - Command creates git worktrees (if configured)
   - Command updates Linear status automatically

2. **If branch already exists with wrong name:**
   ```bash
   # Rename local branch
   git branch -m old-name TEAM-XXX-new-name

   # Delete old remote branch
   git push origin --delete old-name

   # Push renamed branch
   git push -u origin TEAM-XXX-new-name
   ```

3. **If multiple branches exist:**
   - Identify correct branch (latest commits)
   - Delete other branches
   - Update PR to point to correct branch

**Branch naming convention:**
- Format: `TEAM-{issue-number}-{short-description}`
- Example: `TEAM-123-add-resource-schema`
- Lowercase, hyphens for spaces
- Max 50 characters

---

## Linear Integration Issues

### Problem: Linear MCP Connection Fails

**Symptoms:**
- Commands can't fetch Linear issues
- Error: "Cannot connect to Linear API"
- Commands timeout when accessing Linear

**Solutions:**

**Verify environment variable:**
```bash
# Windows PowerShell
$env:LINEAR_API_KEY

# macOS/Linux
echo $LINEAR_API_KEY
```

Should output your API key (not empty or "undefined")

**If empty:**
1. Set environment variable (see [setup/LINEAR-SETUP.md](../setup/LINEAR-SETUP.md))
2. **Restart terminal/IDE completely** (required for changes to take effect)
3. Verify again

**If still failing:**

1. **Check API key permissions** in Linear:
   - Go to Linear Settings → API
   - Verify key has full access to workspace
   - Try creating new key if issues persist

2. **Verify MCP configuration** in `.claude/.mcp.json`:
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-linear"],
         "env": {
           "LINEAR_API_KEY": "${LINEAR_API_KEY}"
         }
       }
     }
   }
   ```

3. **Test MCP server installation:**
   ```bash
   claude mcp add --transport http linear-server https://mcp.linear.app/mcp
   ```

4. **Check network connectivity:**
   - Verify internet connection
   - Check firewall settings (allow npx)
   - Try accessing api.linear.app in browser

**See:** [setup/LINEAR-SETUP.md](../setup/LINEAR-SETUP.md) for complete setup instructions

---

### Problem: Issue Status Not Updating

**Symptoms:**
- `/update-status` command succeeds but Linear still shows old status
- Issue status in Linear doesn't match expected state
- Dependency relationships not working

**Solutions:**

1. **Refresh Linear view:**
   - Press Cmd/Ctrl + R to reload Linear web app
   - Close and reopen Linear desktop app
   - Check if status appears correct after refresh

2. **Verify correct state names:**
   - Check your team's workflow states in Linear Settings → Workflow
   - Use exact state names (case-sensitive)
   - Valid states: "Backlog", "Todo", "In Progress", "In Review", "Done"

3. **Check update command syntax:**
   ```bash
   # Correct
   /update-status TEAM-123 in-progress

   # Incorrect (wrong state name)
   /update-status TEAM-123 in_progress
   ```

4. **Verify Linear MCP permissions:**
   - API key must have write access
   - Check key hasn't expired
   - Regenerate key if needed

**Prevention:**
- Use lowercase with hyphens for state names in commands
- Verify state changes in Linear after running commands
- Set up Linear notifications to track status changes

---

### Problem: Dependencies Not Unblocking

**Symptoms:**
- Marked issue as "Done" but dependent issues still "Blocked"
- "Blocked by" relationships not automatically clearing
- Can't start issues that should be unblocked

**Root cause:** Linear blocker relationships not set up correctly

**Solutions:**

1. **Check blocker relationships in Linear:**
   - Open blocking issue (the "Done" one)
   - Check "Blocks" section - should list dependent issues
   - Open dependent issue - check "Blocked by" section

2. **If relationships missing:**
   - Add "Blocked by" relation to dependent issue
   - Specify blocking issue ID: TEAM-XXX
   - Linear will automatically update both sides

3. **If issue actually still blocked:**
   - Verify blocking issue is truly "Done" (not "In Review")
   - Check if multiple blockers exist - all must be "Done"
   - Review if blocker is correct (was the relationship set up wrong?)

4. **Manual unblock:**
   - If blocker relationship incorrect, remove it
   - Move dependent issue from "Backlog" to "Todo"
   - Add comment explaining why unblocking

**Prevention:**
- Set "Blocked by" relationships when creating issues
- Use Linear project view filtered by: `has:blockedBy` to monitor
- Verify blockers before assigning work with `/start-issue`

---

## Quality Issues

### Problem: Tests Failing

**Symptoms:**
- PR shows failing tests
- TypeScript compilation errors
- Lint errors blocking merge

**Solutions:**

**TypeScript errors:**
1. Agent should fix types and re-run `npm run check`
2. If agent confused, provide specific guidance:
   - "Add type annotation to function parameter at line X"
   - "Import missing type from shared/schema.ts"

**Test failures:**
1. Agent should fix test logic and re-run `npm run test`
2. If test expectations wrong, clarify requirements
3. If agent can't fix after 2 iterations, use `/request-supervisor-help`

**Lint errors:**
1. Agent should run `npm run lint` and fix issues
2. Most lint errors auto-fix with proper code formatting

**Prevention:**
- Agents should run automated checks before marking "In Review"
- Consider adding pre-commit hooks to catch issues early
- Use `/validate-issue TEAM-XXX` before requesting review

---

### Problem: Code Quality Issues in Review

**Symptoms:**
- Reviewing code and notice poor quality
- Tempted to request changes for style/structure
- Code works but "doesn't look right"

**Remember:** UAT reviews focus on functional correctness, not code quality

**Solutions:**

**If functional issue:**
- Provide feedback and request iteration (this is appropriate)

**If code quality issue:**
- Check if TypeScript passes (`npm run check`)
- Check if lint passes (automated checks)
- Check if tests pass
- If all pass, **approve the PR** - trust automated quality checks

**If serious quality concern:**
- Pattern violations (doesn't follow PATTERNS.md)
- Security issues (hardcoded credentials, SQL injection risk)
- Performance issues (infinite loops, memory leaks)

Then request changes with specific technical guidance.

**Prevention:**
- Improve PATTERNS.md with better examples
- Use supervisor reviews for complex issues: `/supervisor-review TEAM-XXX`
- Trust that agents follow patterns without micro-management

---

## UAT Review Issues

### Problem: Can't Reproduce UAT Steps

**Symptoms:**
- Following UAT instructions but feature doesn't work as described
- Steps incomplete or unclear
- Can't find feature in UI

**Solutions:**

1. **Verify correct branch:**
   ```bash
   git branch  # Check current branch
   git checkout TEAM-XXX-feature-name  # Switch if needed
   ```

2. **Verify dev environment running:**
   ```bash
   npm run dev  # Should show Vite on :3000, Express on :5000
   ```

3. **Check for missing dependencies:**
   ```bash
   npm install  # Install any new packages
   ```

4. **Check database state:**
   ```bash
   npm run db:studio  # Open Drizzle Studio
   # Verify test data exists
   ```

5. **Request clearer UAT instructions:**
   - Comment in Linear: "UAT steps unclear, please provide more detail"
   - Specify which step is confusing
   - Ask for screenshots or examples

**Prevention:**
- Agents should test UAT instructions before submitting
- UAT instructions should be reproducible from clean state
- Include setup steps (seed data, login, navigation)

---

### Problem: Iteration Taking Too Long

**Symptoms:**
- Multiple iteration cycles (>3) for same issue
- Agent seems confused about feedback
- Same problems recurring

**Root cause:** Feedback not specific enough or requirements unclear

**Solutions:**

1. **Provide more specific feedback:**
   - ❌ "This doesn't work"
   - ✅ "The API endpoint returns 500 when organizationId is null. Add validation to require organizationId in the Zod schema at line 45."

2. **Reference existing patterns:**
   - "Follow the pattern in server/routes.ts lines 78-95"
   - "Use the same validation approach as in ItemList.tsx:123"

3. **Escalate after 3 iterations:**
   - Use `/request-supervisor-help TEAM-XXX`
   - Supervisor can provide architectural guidance
   - May indicate issue scope too complex

4. **Consider specification gap:**
   - If agent repeatedly misunderstands, spec may be ambiguous
   - Update specification issue
   - Get spec re-approved before continuing

**Prevention:**
- Provide all feedback at once (don't drip-feed)
- Be specific about expectations
- Reference code examples from codebase
- Set clear success criteria in first feedback comment

---

## Command Issues

### Problem: `/start-issue` Command Fails

**Symptoms:**
- Command reports "Issue not found"
- Command reports "Issue is blocked"
- Command doesn't update Linear status

**Solutions:**

**"Issue not found":**
1. Verify issue ID format: `TEAM-123` (not just `123`)
2. Check issue exists in Linear workspace
3. Verify Linear MCP connection working

**"Issue is blocked":**
1. Check "Blocked by" relationships in Linear
2. Verify all blocker issues are "Done"
3. If blockers incorrect, update relationships
4. If blockers valid, wait for blockers to complete

**Status not updating:**
1. Verify Linear MCP connection
2. Check API key permissions (must have write access)
3. Refresh Linear to see if status actually updated

**Prevention:**
- Verify issue status is "Todo" before using `/start-issue`
- Check dependencies in Linear first
- Ensure Linear MCP configured correctly

---

## Related Documentation

- **Daily Workflow:** [DAILY-WORKFLOW.md](./DAILY-WORKFLOW.md) - Workflow context for common issues
- **Review Guide:** [REVIEW-GUIDE.md](./REVIEW-GUIDE.md) - UAT review process
- **Linear Setup:** [setup/LINEAR-SETUP.md](../setup/LINEAR-SETUP.md) - MCP configuration
- **Project Setup:** [setup/PROJECT-SETUP.md](../setup/PROJECT-SETUP.md) - Initial setup
- **Commands:** [reference/COMMANDS.md](../reference/COMMANDS.md) - Command reference
- **Core Concepts:** [reference/CONCEPTS.md](../reference/CONCEPTS.md) - Workflow and issue types
