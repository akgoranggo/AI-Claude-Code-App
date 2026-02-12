# Update Status

Update the status of a issue in Linear.

## Usage

```
/update-status {LINEAR_ISSUE_ID} {STATUS} [notes]
```

## Valid Statuses

- `backlog` - Planned but not ready
- `todo` or `ready` - Available for assignment
- `in-progress` - Currently being worked on
- `in-review` - Code complete, ready for review
- `done` or `complete` - Completed and merged

## Examples

- `/update-status TEAM-123 in-progress`
- `/update-status TEAM-123 done`
- `/update-status TEAM-123 in-review tests passing, ready for UAT`

## Instructions

When this command is invoked:

1. **Parse parameters**:
   - Linear issue ID (e.g., "TEAM-123")
   - New status (normalize to Linear state)
   - Optional notes

2. **Normalize status to Linear state**:
   - `backlog` -> `Backlog`
   - `todo` or `ready` -> `Todo`
   - `in-progress` -> `In Progress`
   - `in-review` -> `In Review`
   - `done` or `complete` -> `Done`

3. **Validate status transition** (recommended but not enforced):
   - Backlog/Todo -> In Progress
   - In Progress -> In Review
   - In Review -> Done, In Progress (iteration)
   - Done -> (final state, should not transition out)

4. **Update Linear issue**:
   - Use Linear MCP `update_issue` to set the issue state
   - If notes provided, add them as a comment using `create_comment`

5. **Check for unblocked issues** (if transitioning to Done):
   - Use Linear MCP `get_issue` with `includeRelations: true` to get the issue's relations
   - Find all issues where this issue is in their `blockedBy` list
   - Report which issues are now potentially unblocked

6. **Report changes made**

## Error Handling

If errors occur during status updates, handle them gracefully:

### Linear MCP Not Available

**Symptoms:**
- "Could not connect to Linear MCP server"
- Timeout when calling `update_issue`

**Solutions:**
1. Check MCP configuration in `.claude/settings.local.json`
2. Verify `LINEAR_API_KEY` environment variable is set
3. Test connection: `npx -y @modelcontextprotocol/server-linear --version`
4. Restart Claude Code to reload MCP configuration
5. **Fallback:** Update status manually in Linear UI if MCP is unavailable

### Invalid Status Value

**Symptoms:**
- "Invalid state name"
- Status update fails silently

**Solutions:**
1. **Use valid status strings:**
   - Valid: `backlog`, `todo`, `in-progress`, `in-review`, `done`
   - Invalid: `wip`, `pending`, `finished`, `completed`
2. Check team workflow states in Linear settings
3. Ensure state names match exactly (case-insensitive in command, but normalized correctly)

### Issue Not Found

**Symptoms:**
- "Issue TEAM-123 not found"
- "Cannot update issue: not found"

**Solutions:**
1. Verify issue ID is correct (check Linear UI)
2. Confirm API key has access to the team
3. Try fetching issue first: Use `get_issue` to verify it exists

### Permission Denied

**Symptoms:**
- "Insufficient permissions to update issue"
- "API key does not have write access"

**Solutions:**
1. Check API key permissions in Linear settings
2. Ensure key has write access to the team
3. Verify you're not trying to update an archived or deleted issue
4. Generate new API key with proper permissions if needed

### Invalid State Transition

**Symptoms:**
- Update succeeds but state doesn't change
- "Cannot transition from X to Y"

**Solutions:**
1. **Check valid transitions:**
   - Backlog → Todo, In Progress
   - Todo → In Progress
   - In Progress → In Review, Todo (back to queue)
   - In Review → Done, In Progress (iteration)
   - Done → (final state, avoid transitioning out)
2. If transition is blocked, update in steps (e.g., Done → In Progress → In Review)
3. Check team workflow settings in Linear for custom restrictions

### Network/Connectivity Issues

**Symptoms:**
- Timeout errors
- "Cannot reach Linear API"

**Solutions:**
1. Check internet connectivity
2. Verify Linear API status: https://status.linear.app
3. Try again in a few minutes
4. **Fallback:** Update status manually in Linear UI and continue work

---

## Output Format

```
## Status Updated: {LINEAR_ISSUE_ID}

**Title:** {issue title}
**New Status:** {STATUS}
**Notes:** {notes or "None"}
**Timestamp:** {current datetime}

### Linear Issue Updated

Issue state changed to: {new_status}
{If notes: "Comment added with update notes"}

### Status Transition

{previous_status} -> {new_status}

{If done: "**Potentially Unblocked Issues:** {list of issues that were blocked by this}"}
```

## Related Files

- @docs/reference/LINEAR-WORKFLOW.md
