# Create Worktree

Create a git worktree with a feature branch for a Linear issue, enabling parallel development.

## Usage

```
/create-worktree {LINEAR_ISSUE_ID}
```

## Examples

- `/create-worktree TEAM-001`
- `/create-worktree TEAM-100`

## Instructions

When this command is invoked:

1. **Parse the Linear issue ID** from the command (e.g., "TEAM-001")

2. **Get the branch name from Linear**:
   - Use Linear MCP `get_issue` to fetch the issue
   - Extract the branch name from the `branchName` field
   - If no branch name exists, generate one: `feature/{ISSUE_ID}-{kebab-case-title}`

3. **Create the worktree** by running:

   ```bash
   git worktree add -b {BRANCH_NAME} ../pims-{LINEAR_ISSUE_ID} main
   ```

   For example, for TEAM-001 with branch `feature/TEAM-001-organization-schema`:

   ```bash
   git worktree add -b feature/TEAM-001-organization-schema ../pims-TEAM-001 main
   ```

4. **Report the result**:
   - If successful, provide instructions for opening a Claude session in the worktree
   - If the branch/worktree already exists, provide appropriate error handling

## Output Format

On success:

```
## Worktree Created: {LINEAR_ISSUE_ID}

**Branch:** {BRANCH_NAME}
**Location:** ../pims-{LINEAR_ISSUE_ID}

To start working on this Linear issue:

1. Open a new terminal
2. Run: cd ../pims-{LINEAR_ISSUE_ID} && claude
3. Use: /start-issue {LINEAR_ISSUE_ID}

Or open the folder in a new VS Code window:
   code ../pims-{LINEAR_ISSUE_ID}
```

On error (branch exists):

```
## Worktree Already Exists

The branch {BRANCH_NAME} already exists. Options:

1. Use existing worktree: cd ../pims-{LINEAR_ISSUE_ID}
2. Remove and recreate:
   git worktree remove ../pims-{LINEAR_ISSUE_ID}
   git branch -D {BRANCH_NAME}
   /create-worktree {LINEAR_ISSUE_ID}
```

## Notes

- Worktrees are created in the parent directory (../pims-{ISSUE-ID})
- Each worktree is isolated, allowing parallel work on different branches
- Always base new branches on `main` for clean feature branches
