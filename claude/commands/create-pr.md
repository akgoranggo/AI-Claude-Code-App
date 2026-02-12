# Create Pull Request

Create a GitHub pull request with a description under 4000 characters. Can be used with or without a Linear issue ID.

## Usage

```
/create-pr [LINEAR_ISSUE_ID]
```

**Note:** The Linear issue ID is optional. If omitted, the PR will be created based on the current git branch and commits.

## Examples

- `/create-pr` - Create PR from current branch without Linear issue
- `/create-pr TEAM-123` - Create PR linked to Linear issue TEAM-123
- `/create-pr TEAM-456` - Create PR linked to Linear issue TEAM-456

## Instructions

When this command is invoked:

1. **Check if Linear issue ID provided**:
   - If provided: Parse the Linear issue ID (e.g., "TEAM-123")
   - If not provided: Skip to step 4 (git information gathering)

2. **Fetch the Linear issue** (only if ID provided):
   - Use Linear MCP `get_issue` to retrieve issue details
   - Extract: title, description, labels, branch name

3. **Extract Linear issue details** (only if ID provided):
   - Title/objective from the Linear issue
   - Branch name from `branchName` field
   - Acceptance criteria from description
   - Track from labels (1-ONTOLOGY, 2-DESIGN-SYSTEM, 3-TRACER-BULLETS)

4. **Gather git information** (run in parallel):

   ```bash
   git status
   git diff main...HEAD --stat
   git log main..HEAD --oneline
   git branch --show-current
   ```

5. **Check PR readiness**:
   - If Linear issue: Verify current branch matches Linear issue branch (warn if mismatch, but allow proceeding)
   - Verify branch has commits ahead of main
   - Verify no uncommitted changes (warn if present)

6. **Generate PR title and description** (must be <= 4000 characters):

   **With Linear issue:**
   - Use Linear issue metadata for title and description
   - Keep summary concise (3-5 bullet points max)
   - Include acceptance criteria from Linear

   **Without Linear issue:**
   - Generate title from branch name and recent commits
   - Create summary from commit messages and git diff
   - List key files changed
   - Keep summary concise (3-5 bullet points max)

   - Use abbreviated file lists if many files changed
   - Always include the footer

7. **Create the PR** using gh CLI with HEREDOC:

   ```bash
   gh pr create --title "{PR_TITLE}" --body "$(cat <<'EOF'
   {PR_BODY}
   EOF
   )"
   ```

8. **Report the PR URL** to the user

## PR Title Format

### With Linear Issue

```
{LINEAR_ISSUE_ID}: {Brief description from objective}
```

Examples:
- `TEAM-123: Add staff user schema and storage methods`
- `TEAM-456: Implement design tokens and base components`

### Without Linear Issue

Generate a descriptive title from:
1. Branch name (convert kebab-case to readable text)
2. First commit message (if branch name is generic)
3. Main change from git diff

Examples:
- `Add generate-linear-issues command`
- `Fix authentication bug in login flow`
- `Update documentation for PR creation`

## PR Body Template (keep under 4000 chars)

### With Linear Issue

```markdown
## Summary

{2-4 bullet points describing what this PR does}

## Linear Issue

- **ID:** {LINEAR_ISSUE_ID}
- **Track:** {1-ONTOLOGY | 2-DESIGN-SYSTEM | 3-TRACER-BULLETS}
- **Phase:** {Phase from issue}

## Changes

{Brief list of key changes - max 10 items, group if more}

## Acceptance Criteria

{Checklist from Linear issue - abbreviate if needed}

## Testing

{Brief testing notes or reference to UAT section}

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Without Linear Issue

```markdown
## Summary

{2-4 bullet points describing what this PR does, derived from commits and diff}

## Changes

{Brief list of key changes from git diff - max 10 items, group if more}

## Commits

{List of commit messages from git log main..HEAD}

## Testing

{If mentioned in commits or obvious from changes}

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Character Limit Strategy

If the description exceeds 4000 characters:

1. **Shorten summary** to 2-3 bullets
2. **Abbreviate changes** list:
   - Group files by directory
   - Use "X files in {dir}/" format
3. **Truncate acceptance criteria** (if Linear issue):
   - Show first 5 items
   - Add "See Linear issue for full list"
4. **Truncate commits list** (if no Linear issue):
   - Show first 10 commits
   - Add "... and X more commits"
5. **Remove optional sections** (Testing notes)
6. **Never truncate**: Linear Issue ID (if provided), Track, Phase, or footer

## Output Format

### With Linear Issue

```
## Creating Pull Request for {LINEAR_ISSUE_ID}

**Branch:** {branch_name}
**Commits:** {X commits ahead of main}
**Files Changed:** {count}

### PR Details

**Title:** {title}

**Description:** ({character_count}/4000 characters)
{preview of description}

### Result

✅ PR created successfully!
**URL:** {pr_url}

### Next Steps

- [ ] Request code review
- [ ] Address review feedback
- [ ] Merge when approved
- [ ] Update Linear issue status to Done
```

### Without Linear Issue

```
## Creating Pull Request

**Branch:** {branch_name}
**Commits:** {X commits ahead of main}
**Files Changed:** {count}

### PR Details

**Title:** {title}

**Description:** ({character_count}/4000 characters)
{preview of description}

### Result

✅ PR created successfully!
**URL:** {pr_url}

### Next Steps

- [ ] Request code review
- [ ] Address review feedback
- [ ] Merge when approved
```

## Error Handling

If errors occur during PR creation, handle them gracefully:

### Linear MCP Not Available (only when Linear issue ID provided)

**Symptoms:**
- "Could not connect to Linear MCP server"
- Timeout when calling `get_issue`

**Solutions:**
1. Check MCP configuration in `.claude/settings.local.json`
2. Verify `LINEAR_API_KEY` environment variable is set
3. Test connection: `npx -y @modelcontextprotocol/server-linear --version`
4. Restart Claude Code to reload MCP configuration
5. **Fallback:** Create PR without Linear metadata (treat as if no issue ID provided)

### Issue Not Found (only when Linear issue ID provided)

**Symptoms:**
- "Issue TEAM-123 not found"
- "Cannot fetch issue details"

**Solutions:**
1. Verify issue exists in Linear workspace (check Linear UI)
2. Confirm issue ID format is correct (e.g., "TEAM-123")
3. Ensure API key has access to the team
4. **Fallback:** Create PR without Linear metadata (treat as if no issue ID provided)

### Git/Branch Issues

**No commits ahead of main:**
- **Error:** "Nothing to create PR for. Make commits first."
- **Solution:** Commit your changes before creating PR
- **Check:** `git log main..HEAD` should show commits

**Uncommitted changes:**
- **Warning:** "You have uncommitted changes. Commit or stash before creating PR."
- **Solution:** Run `git status`, then commit or stash changes
- **Check:** `git status` should show clean working tree

**Wrong branch (only when Linear issue ID provided):**
- **Warning:** "Current branch {X} doesn't match Linear issue branch {Y}"
- **Note:** This is a warning, not an error. The PR can still be created.
- **Solution (optional):** Switch to correct branch: `git checkout {correct-branch}`
- **Or:** Update Linear issue's `branchName` field to match current branch

**Branch not pushed:**
- **Error:** "Branch has no upstream"
- **Solution:** Push branch first: `git push -u origin HEAD`

### GitHub CLI Issues

**Not authenticated:**
- **Error:** "gh CLI not authenticated"
- **Solution:** Run `gh auth login` and follow prompts
- **Verify:** `gh auth status` should show authenticated

**PR already exists:**
- **Error:** "A pull request for branch already exists"
- **Solution:** Get existing PR URL: `gh pr view`
- **Or:** Update existing PR instead of creating new one

**No push access:**
- **Error:** "Resource not accessible by integration"
- **Solution:** Verify you have write access to repository
- **Check:** Repository settings → Collaborators

### Description Too Long

**Symptoms:**
- PR description truncated
- GitHub API error about field length

**Solutions:**
1. Shorten summary to 2-3 bullet points
2. Abbreviate changes list (group by directory)
3. Truncate acceptance criteria (show first 5 items + "See Linear for full list")
4. Remove optional sections (Testing notes)
5. **Never truncate:** Linear issue ID, track, or footer

**Validation:** Description must be ≤ 4000 characters

### Network/Connectivity Issues

**Symptoms:**
- Timeout errors
- "Cannot reach GitHub API"

**Solutions:**
1. Check internet connectivity
2. Verify GitHub status: https://www.githubstatus.com
3. Check firewall/proxy settings
4. Try again in a few minutes
5. **Fallback:** Create PR manually in GitHub UI

## Related Commands

- `/validate-issue` - Run before creating PR
- `/update-status` - Update Linear issue status after merge

## Related Files

- @docs/reference/LINEAR-WORKFLOW.md
