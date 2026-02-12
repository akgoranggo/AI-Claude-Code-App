# Address PR Comments

Fetch the latest comment from a GitHub PR (especially from Claude Code reviewer bot) and implement all identified bug fixes and recommended improvements.

## Usage

```
/address-pr-comments [PR_NUMBER]
```

## Examples

- `/address-pr-comments` - Address comments on the PR for the current branch
- `/address-pr-comments 42` - Address comments on PR #42

## Instructions

When this command is invoked:

1. **Determine the PR number**:
   - If PR_NUMBER is provided, use it
   - Otherwise, get the PR for the current branch: `gh pr view --json number -q .number`

2. **Fetch PR comments** (run in parallel):

   ```bash
   gh pr view {PR_NUMBER} --json comments -q '.comments[] | select(.author.login | contains("claude") or contains("bot")) | {author: .author.login, body: .body, createdAt: .createdAt}'
   gh pr view {PR_NUMBER} --json reviews -q '.reviews[] | select(.author.login | contains("claude") or contains("bot")) | {author: .author.login, body: .body, state: .state, submittedAt: .submittedAt}'
   ```

3. **Identify the latest Claude Code reviewer comment**:
   - Look for comments/reviews from users with "claude" or "bot" in their username
   - Sort by timestamp (createdAt/submittedAt) to find the most recent
   - If no bot comments found, look for the latest human review comment

4. **Parse the comment** to extract:

   **Bug Fixes** (usually marked with severity):
   - Critical issues
   - Major issues
   - Minor issues
   - Look for sections like "Issues Found", "Bugs", "Required Fixes", "Should Fix", "Must Fix"

   **Improvements** (usually recommendations):
   - Code quality improvements
   - Pattern compliance fixes
   - Security enhancements
   - Performance optimizations
   - Look for sections like "Recommendations", "Improvements", "Suggestions", "Nice to Have"

5. **Create a todo list** with all identified items:
   - Use TodoWrite to create tasks for each bug fix and improvement
   - Prioritize: Critical bugs → Major bugs → Minor bugs → Improvements
   - Include file locations in task descriptions

6. **Implement each item systematically**:

   For each bug fix or improvement:

   a. **Mark the todo as in_progress**

   b. **Read the relevant files** mentioned in the issue

   c. **Understand the context**:
   - What is the current implementation?
   - What is the specific issue or improvement needed?
   - What patterns should be followed?

   d. **Implement the fix/improvement**:
   - Make focused, precise changes
   - Follow existing code patterns
   - Add comments if the logic is complex

   e. **Verify the change**:
   - Read the modified section to confirm correctness
   - Check if it addresses the comment

   f. **Mark the todo as completed**

   g. **Move to next item**

7. **Run validation checks** after all implementations:

   ```bash
   npm run check     # TypeScript compilation
   npm run test      # Tests (if available)
   npm run build     # Build verification
   ```

8. **Report completion**

## Output Format

```
## Addressing PR Comments for PR #{PR_NUMBER}

**Latest Review By:** {reviewer_name}
**Review Date:** {timestamp}
**Items Found:** {count} bug fixes, {count} improvements

---

### Items to Address

{TodoWrite output showing all tasks}

---

### Implementation Progress

{As each item is implemented, show:}

✅ **{Item #}:** {Description}
   - File: {file:line}
   - Change: {brief description of what was done}

---

### Validation Results

**TypeScript:** {Pass/Fail}
**Tests:** {Pass/Fail}
**Build:** {Pass/Fail}

---

### Summary

✅ Implemented {X} bug fixes
✅ Implemented {Y} improvements
{If failures:}
⚠️  {Z} validation checks failed - see details above

### Next Steps

- [ ] Review the changes
- [ ] Run additional manual testing
- [ ] Commit changes: `git add . && git commit -m "Address PR review comments"`
- [ ] Push updates: `git push`
- [ ] Request re-review on the PR
```

## Parsing Strategies

### Common Review Comment Formats

**Table Format:**

```
| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | Description | Critical | file.ts:123 |
```

**List Format:**

```
- [Critical] Description (file.ts:123)
- [Major] Description (file.ts:456)
```

**Sections Format:**

```
## Issues Found

### Security
- Issue 1
- Issue 2

### Code Quality
- Issue 3
```

**Checkbox Format:**

```
### Required Fixes
- [ ] Fix issue 1 in file.ts
- [ ] Fix issue 2 in file.ts
```

### Extraction Tips

- Look for keywords: "bug", "issue", "error", "fix", "critical", "major", "minor"
- Look for file references: `file.ts:line` or `file.ts`
- Look for severity indicators: Critical, Major, Minor, High, Medium, Low, Nice to Have, Must Fix, Should Fix, Required Fixes
- Look for improvement keywords: "recommend", "suggest", "consider", "improve", "enhance"
- Extract context around each issue (2-3 sentences)

## Error Handling

- **No PR found**: "No PR found for current branch. Create a PR first with `/create-pr` or specify a PR number."
- **No comments found**: "No comments found on PR #{number}. Nothing to address."
- **No bot comments found**: "No Claude Code reviewer comments found. Using latest human review comment instead."
- **Validation fails**: "Validation checks failed. Review the errors above and fix before committing."
- **Cannot parse comment**: "Could not parse review comment format. Please manually review the comment."

## Implementation Guidelines

### Code Changes

- Make minimal, focused changes that directly address the comment
- Preserve existing code style and patterns
- Don't over-engineer or add unnecessary features
- If unsure about a fix, use AskUserQuestion to clarify

### When to Skip Items

- If a comment is unclear, note it and ask user for clarification
- If a suggestion conflicts with project patterns, note it and ask user
- If an improvement is out of scope, mark it as pending and ask user

### Committing Changes

- Do NOT automatically commit - let user review first
- Provide a suggested commit message that summarizes the changes
- Group related fixes in the commit message

## Related Commands

- `/create-pr` - Create a PR before using this command
- `/supervisor-review` - Request review before addressing comments
- `/validate-issue` - Validate changes after implementation

## Related Files

- `.claude/commands/create-pr.md`
- `.claude/commands/supervisor-review.md`
- `docs/agent-system/PATTERNS.md`
