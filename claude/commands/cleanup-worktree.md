# Cleanup Worktree

Remove a worktree and its feature branch after a Linear issue has been merged to main.

## Usage

```
/cleanup-worktree {LINEAR_ISSUE_ID}
```

## Examples

- `/cleanup-worktree TEAM-123`
- `/cleanup-worktree TEAM-456`

## Instructions

When this command is invoked:

1. **Parse the Linear issue ID** from the command (e.g., "TEAM-123")

2. **Fetch the Linear issue** to get the branch name:
   - Use Linear MCP `get_issue` to retrieve issue details
   - Extract the branch name from the `branchName` field

3. **Verify the branch is merged**:
   - Run `git branch --merged main` to list branches merged into main
   - Check if the feature branch is in the list
   - If NOT merged, warn the user and abort (unless they confirm)

4. **Verify Linear issue status**:
   - Check that the Linear issue status is "Done"
   - If not Done, warn the user

5. **Remove the worktree**:

   ```bash
   git worktree remove ../{repo-name}-{LINEAR_ISSUE_ID}
   ```

   - If the worktree doesn't exist, report and continue to branch deletion

6. **Delete the feature branch** (local and remote):

   ```bash
   # Delete local branch
   git branch -d {BRANCH_NAME}

   # Delete remote branch (if exists)
   git push origin --delete {BRANCH_NAME}
   ```

7. **Clean up stale references**:

   ```bash
   git worktree prune
   ```

8. **Report results**

## Output Format

On success:

```
## Cleanup Complete: {LINEAR_ISSUE_ID}

**Removed worktree:** ../{repo-name}-{LINEAR_ISSUE_ID}
**Deleted branch:** {BRANCH_NAME}
**Remote branch:** Deleted (or: No remote branch found)

Issue {LINEAR_ISSUE_ID} fully cleaned up.
```

On error (not merged):

```
## Warning: Branch Not Merged

The branch {BRANCH_NAME} has not been merged into main.

If you're sure you want to delete it anyway, run:
   git worktree remove ../{repo-name}-{LINEAR_ISSUE_ID}
   git branch -D {BRANCH_NAME}  # Force delete

Otherwise, merge the branch first:
   git checkout main
   git merge {BRANCH_NAME}
```

On error (worktree has uncommitted changes):

```
## Warning: Uncommitted Changes

The worktree at ../{repo-name}-{LINEAR_ISSUE_ID} has uncommitted changes.

Please commit or stash changes before cleanup:
   cd ../{repo-name}-{LINEAR_ISSUE_ID}
   git status
   git stash  # or git commit
```

## Safety Checks

- Will NOT delete a branch that hasn't been merged (use `-D` flag manually to force)
- Will NOT remove a worktree with uncommitted changes
- Always runs `git worktree prune` to clean up stale references

## Related Commands

- `/start-issue` - Start working on a Linear issue
- `/create-worktree` - Create a worktree without starting work
- `/update-status` - Update Linear issue status
