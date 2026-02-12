# Propose Template Improvements

Analyze the current repository's codebase and propose improvements to the base-web-app template based on superior features, patterns, and best practices that can be abstracted for general use.

> **Implementation Type:** This is a prompt-based command. When invoked, Claude Code will execute the instructions below step-by-step using available tools (Bash, Read, Grep, Glob, etc.). This is not a standalone script but rather guidance for AI-assisted analysis and proposal creation.

## Usage

```
/propose-template-improvements [mode]
```

## Modes

- `analyze` - Analyze and generate report of potential improvements (default)
- `create-issues` - Create GitHub issues for approved improvements
- `report` - Generate detailed comparison report only

**Default:** `analyze` (safe mode - no issue creation)

## Examples

- `/propose-template-improvements` - Analyze and show potential improvements
- `/propose-template-improvements create-issues` - Create GitHub issues after analysis
- `/propose-template-improvements report` - Generate detailed comparison report

## Purpose

This command helps capture and contribute best practices from any given app back into the base-web-app template for all projects to benefit from. It identifies patterns and features that are:

- **Superior** to what exists in base-web-app
- **Abstract** enough to work as a starting template
- **Compatible** with existing base-web-app functionality
- **Not app-specific** domain logic

## Instructions

### Phase 1: Fetch Base Template and Issues

1. **Clone or update base-web-app repository**:

   **SECURITY: Path Validation**
   - Validate temp directory path before any operations
   - Must be under `.claude/temp/` (reject paths with `..`, absolute paths, or symlinks)
   - Reject suspicious patterns that could lead to path traversal

   **Clone/Update Process:**
   ```bash
   set -euo pipefail

   # Validate path is safe (prevents TOCTOU race conditions)
   TEMP_DIR=".claude/temp"
   TARGET_DIR="${TEMP_DIR}/base-web-app"

   # Create temp directory if needed
   mkdir -p "$TEMP_DIR" || exit 1

   # Check for symlink attacks AFTER creation
   if [[ -L "$TEMP_DIR" ]]; then
     echo "Error: Symlink detected in temp directory"
     exit 1
   fi

   # Validate canonical path resolves within allowed directory
   CANONICAL_TARGET=$(realpath -m "$TARGET_DIR")
   ALLOWED_PREFIX=$(pwd)/.claude/temp/
   if [[ ! "$CANONICAL_TARGET" =~ ^${ALLOWED_PREFIX} ]]; then
     echo "Error: Path resolves outside allowed directory"
     echo "  Canonical: $CANONICAL_TARGET"
     echo "  Allowed prefix: $ALLOWED_PREFIX"
     exit 1
   fi

   # Now safe to proceed with git operations
   if [[ -d "$TARGET_DIR" ]]; then
     cd "$TARGET_DIR" || exit 1
     git pull origin main || exit 1
     cd - > /dev/null || exit 1
   else
     git clone https://github.com/vetpartners/base-web-app.git "$TARGET_DIR" || exit 1
   fi
   ```

2. **Fetch open issues from base-web-app**:
   ```bash
   # Get all open issues (limit 500 to be thorough)
   gh api repos/vetpartners/base-web-app/issues \
     --paginate --limit 500 \
     -X GET \
     -F state=open \
     -F per_page=100 \
     --jq '.[] | {number, title, body, labels: [.labels[].name]}' \
     || { echo "Error: Failed to fetch GitHub issues"; exit 1; }
   ```

   Store issue data for duplicate detection:
   - Issue numbers
   - Issue titles (for similarity comparison)
   - Issue labels
   - Issue bodies (for feature matching)

3. **Get template version info**:
   ```bash
   cd .claude/temp/base-web-app || exit 1
   COMMIT_HASH=$(git rev-parse HEAD) || exit 1
   VERSION=$(jq -r '.version' package.json) || exit 1
   cd - > /dev/null || exit 1
   echo "Template version: ${VERSION} (${COMMIT_HASH})"
   ```

### Phase 2: Analyze Current Repository

Systematically analyze the current repository to identify superior patterns:

#### 2.1 Build & Configuration Patterns

**Files to analyze:**
- `vite.config.ts` - Vite configuration optimizations
- `tsconfig.json` - TypeScript configuration improvements
- `vitest.config.ts` - Testing configuration enhancements
- `.eslintrc.cjs` - Linting rules and plugins
- `package.json` - Scripts, dependencies, configurations

**Look for:**
- Build optimizations (chunk splitting, tree shaking, etc.)
- Better type checking configurations
- Additional useful scripts
- Performance monitoring setup
- Security-focused configurations
- Better dev experience tooling

**Example patterns:**
```typescript
// Superior pattern: Advanced Vite chunk splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
          }
        }
      }
    }
  }
});
```

#### 2.2 Testing Patterns

**Files to analyze:**
- `**/*.test.ts` - Test files
- `**/*.test.tsx` - Component test files
- `vitest.config.ts` - Test configuration
- Test utilities and helpers

**Look for:**
- Better test organization patterns
- Useful test utilities (factories, mocks, helpers)
- Coverage configuration improvements
- E2E testing patterns
- Integration test patterns
- API mocking strategies

**Example patterns:**
```typescript
// Superior pattern: Test data factories
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: ulid(),
    email: `test-${ulid()}@example.com`,
    role: 'user',
    ...overrides
  };
}
```

#### 2.3 Database & Storage Patterns

**Files to analyze:**
- `shared/schema.ts` - Schema patterns (excluding domain-specific tables)
- `server/storage.ts` - Storage implementation patterns
- `server/db.ts` - Database connection and configuration
- Migration patterns

**Look for:**
- Better schema organization patterns
- Useful database utilities
- Connection pooling improvements
- Transaction patterns
- Better error handling for DB operations
- Pagination patterns
- Search optimization patterns
- Audit logging patterns

**Example patterns:**
```typescript
// Superior pattern: Generic pagination with total count
interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

async function getPaginated<T>(
  query: SelectQueryBuilder<T>,
  limit: number,
  offset: number
): Promise<PaginatedResult<T>> {
  const [data, countResult] = await Promise.all([
    query.limit(limit).offset(offset),
    query.count()
  ]);
  return {
    data,
    total: countResult[0].count,
    limit,
    offset
  };
}
```

#### 2.4 API & Route Patterns

**Files to analyze:**
- `server/routes.ts` - Route patterns (excluding domain-specific routes)
- Middleware implementations
- Error handling patterns
- Authentication patterns

**Look for:**
- Better error handling middleware
- Rate limiting patterns
- Request validation patterns
- Response formatting patterns
- Security headers middleware
- CORS configuration improvements
- API versioning patterns

**Example patterns:**
```typescript
// Superior pattern: Standardized error responses
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
  }
  // ... handle other errors
});
```

#### 2.5 Frontend Patterns

**Files to analyze:**
- `client/src/lib/*` - Utility functions and helpers
- `client/src/hooks/*` - Custom React hooks (excluding domain-specific)
- `client/src/components/ui/*` - UI component enhancements
- React patterns and state management

**Look for:**
- Useful custom hooks
- Better form handling patterns
- Error boundary implementations
- Loading state patterns
- Optimistic update patterns
- Better TypeScript patterns
- Accessibility improvements

**Example patterns:**
```typescript
// Superior pattern: Generic useAsync hook
function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    setState({ data: null, loading: true, error: null });

    asyncFunction()
      .then(data => mounted && setState({ data, loading: false, error: null }))
      .catch(error => mounted && setState({ data: null, loading: false, error }));

    return () => { mounted = false; };
  }, dependencies);

  return state;
}
```

#### 2.6 Development Workflow Patterns

**Files to analyze:**
- `.claude/commands/*` - Custom commands
- `.claude/skills/*` - Custom skills
- `.claude/agents/*` - Custom agent configurations
- Git hooks and workflows
- Documentation patterns

**Look for:**
- Useful custom Claude commands
- Better development workflows
- Documentation improvements
- Automation scripts
- Code generation patterns
- Developer tooling

#### 2.7 Security Patterns

**Files to analyze:**
- Authentication implementations
- Authorization patterns
- Input validation patterns
- CSRF protection
- Security headers

**Look for:**
- Better auth patterns
- Authorization middleware
- Input sanitization utilities
- Security best practices
- Rate limiting implementations

### Phase 3: Filter and Classify Improvements

For each identified improvement, evaluate:

#### 3.1 Exclusion Criteria (DO NOT propose)

**Architectural Changes:**
- Backend language changes (TypeScript → Python, etc.)
- Framework changes (Express → Fastify, React → Vue, etc.)
- Database changes (PostgreSQL → MongoDB, etc.)
- ORM changes (Drizzle → Prisma, etc.)

**App-Specific Features:**
- Domain-specific Object Types (e.g., `client`, `appointment`, `invoice`)
- Business logic specific to the app's domain
- Custom pages for domain workflows
- Domain-specific API endpoints
- Branding and styling specific to the app

**Examples of what NOT to propose:**
```typescript
// ❌ App-specific Object Type
export const appointment = appSchema.table("appointment", { ... });

// ❌ Domain-specific business logic
async function calculateInvoiceTotal(invoiceId: string) { ... }

// ❌ App-specific UI component
function AppointmentScheduler() { ... }
```

#### 3.2 Inclusion Criteria (DO propose)

**Infrastructure Improvements:**
- Build configuration optimizations
- Better error handling patterns
- Security enhancements
- Performance optimizations
- Testing patterns and utilities
- Development tooling

**Abstract, Reusable Patterns:**
- Generic utilities that work with any domain
- Better TypeScript patterns
- Database query patterns (pagination, search, etc.)
- API patterns (error handling, validation, etc.)
- React hooks that are domain-agnostic
- Development workflow improvements

**Examples of what TO propose:**
```typescript
// ✅ Generic pagination utility
interface PaginatedResult<T> { ... }

// ✅ Generic error handling
class ApiError extends Error { ... }

// ✅ Generic test factory pattern
function createTestEntity<T>(schema, overrides) { ... }

// ✅ Generic async hook
function useAsync<T>(...) { ... }
```

#### 3.3 Abstraction Requirements

Before proposing, ensure the feature can be abstracted:

1. **Remove domain-specific terminology**
   - Instead of "client" → use "entity" or generic examples
   - Instead of "appointment" → use generic patterns

2. **Parameterize where needed**
   - Make utilities accept generic type parameters
   - Use configuration objects for customization

3. **Document clearly**
   - Provide usage examples with generic entities
   - Show how to adapt to different domains

4. **Ensure compatibility**
   - Works with existing base-web-app architecture
   - Doesn't break existing functionality
   - Follows base-web-app conventions

### Phase 4: Check for Duplicates

For each potential improvement:

1. **Search existing issues**:
   ```bash
   # Search for similar issues
   gh search issues \
     --repo vetpartners/base-web-app \
     --match title \
     "pagination"
   ```

2. **Check issue titles for similarity**:
   - Use GitHub's search to find similar issues (let GitHub handle similarity comparison)
   - Check issue labels for related work
   - Review issue body for feature mentions
   - Manually review search results to determine if truly duplicate

3. **Check if already implemented**:
   - Search base-web-app codebase for the pattern
   - If pattern exists but is inferior, note as "enhancement"
   - If pattern exists and is similar, skip

4. **Flag for review if uncertain**:
   - When in doubt, mark as "needs review" rather than auto-create

### Phase 5: Generate Improvement Proposals

For each validated improvement, create a structured proposal:

#### Proposal Template

```markdown
## Improvement: [Short Title]

**Category:** [Build/Testing/Database/API/Frontend/Workflow/Security]
**Priority:** [High/Medium/Low]
**Effort:** [Small/Medium/Large]

### Current State (base-web-app)

Describe how this is currently handled in base-web-app, or note if missing entirely.

```typescript
// Current implementation (if exists)
```

### Proposed Improvement

Clear description of the improvement and why it's beneficial.

**Benefits:**
- Benefit 1
- Benefit 2
- Benefit 3

### Implementation Example

```typescript
// Example code from current repo (abstracted)
// Remove domain-specific details
// Add comments explaining the pattern
```

### Source Reference

- File: `path/to/file.ts` in current repo
- Lines: 123-145

### Integration Points

Files in base-web-app that would need updates:
- `file1.ts` - Add utility
- `file2.ts` - Update to use utility
- `CLAUDE.md` - Document pattern

### Testing Strategy

How to test this improvement:
- [ ] Unit tests for utility
- [ ] Integration tests for patterns
- [ ] Validation in template sync

### Related Issues

- Issue #123 - Related feature
- Issue #456 - Prerequisite

### Breaking Changes

None / List any breaking changes and migration path
```

#### MECE Principle (Mutually Exclusive, Collectively Exhaustive)

**Ensure proposals are MECE:**

1. **Mutually Exclusive** - No overlap between proposals:
   - Each improvement addresses a distinct concern
   - No duplicate functionality across proposals
   - Clear boundaries between related improvements

2. **Collectively Exhaustive** - Cover all identified improvements:
   - All superior patterns are captured
   - Related improvements are grouped logically
   - No gaps in coverage

**Example of MECE breakdown:**

Instead of:
- ❌ "Improve error handling" (too broad, overlaps with others)
- ❌ "Add API validation" (overlaps with error handling)
- ❌ "Better database queries" (too broad)

Do this:
- ✅ "Add standardized API error response format" (specific, distinct)
- ✅ "Add Zod schema validation middleware" (specific, distinct)
- ✅ "Add generic pagination utility with total count" (specific, distinct)
- ✅ "Add database query retry logic for transient errors" (specific, distinct)

**Grouping related improvements:**

If improvements are tightly coupled, create a single issue with multiple components:
```markdown
## Add API Error Handling Framework

This improvement adds a comprehensive error handling framework with three components:

### Component 1: ApiError class hierarchy
[details]

### Component 2: Error handling middleware
[details]

### Component 3: Client-side error response types
[details]

All three components work together and should be implemented as a unit.
```

#### Scoping Guidelines

**Well-scoped improvement = can be implemented in a single focused PR**

**Too large (split into multiple):**
- "Improve entire testing infrastructure"
- "Refactor all database queries"
- "Upgrade authentication system"

**Well-scoped:**
- "Add test data factory pattern with examples"
- "Add pagination utility for list endpoints"
- "Add rate limiting middleware for sensitive routes"

**Too small (combine related):**
- "Fix typo in comment" (too trivial)
- "Add type to one function" (too trivial)

### Phase 6: Generate Report

Create a comprehensive report showing all findings:

```markdown
# Template Improvement Proposals

**Source Repository:** [current repo name]
**Base Template:** https://github.com/vetpartners/base-web-app.git
**Template Version:** [version]
**Template Commit:** [commit hash]
**Analysis Date:** [ISO 8601 timestamp]
**Mode:** [analyze | create-issues | report]

---

## Executive Summary

**Total Improvements Identified:** X
**High Priority:** Y
**Medium Priority:** Z
**Low Priority:** W

**Categories:**
- Build & Configuration: X improvements
- Testing: Y improvements
- Database & Storage: Z improvements
- API & Routes: W improvements
- Frontend: V improvements
- Development Workflow: U improvements
- Security: T improvements

**Estimated Impact:**
- Performance improvements: X proposals
- Developer experience: Y proposals
- Code quality: Z proposals
- Security: W proposals

---

## High Priority Improvements

### 1. [Improvement Title]

**Category:** Testing
**Effort:** Medium
**Priority:** High

[Full proposal using template above]

---

### 2. [Improvement Title]

...

---

## Medium Priority Improvements

...

---

## Low Priority Improvements

...

---

## Excluded Items

These items were analyzed but excluded from proposals:

### App-Specific Features (not abstract enough)
- Feature 1: Reason for exclusion
- Feature 2: Reason for exclusion

### Architectural Changes (too divergent)
- Change 1: Reason for exclusion
- Change 2: Reason for exclusion

### Already Exists in Template
- Pattern 1: Already implemented in base-web-app
- Pattern 2: Similar implementation exists

### Duplicate of Existing Issues
- Proposal: Duplicate of issue #123
- Proposal: Duplicate of issue #456

---

## Next Steps

**For Analyze Mode (current):**
1. Review proposals above
2. Validate that abstractions are appropriate
3. Check MECE principle applied correctly
4. Run `/propose-template-improvements create-issues` to create GitHub issues

**For Create-Issues Mode:**
1. Review and confirm proposals
2. Create GitHub issues with appropriate labels
3. Link related issues
4. Add to project board if applicable

---

## Analysis Details

**Files Analyzed:** [count]
**Patterns Identified:** [count]
**Patterns Excluded:** [count]
**Duplicate Check:** [count] existing issues reviewed

**Analysis Time:** [duration]
```

### Phase 7: Create GitHub Issues (create-issues mode only)

Only execute if mode is `create-issues`:

1. **Confirm with user**:
   Ask user to review the report and confirm before creating issues.

2. **For each approved improvement**:

   ```bash
   # Create issue with gh CLI
   gh issue create \
     --repo vetpartners/base-web-app \
     --title "Add generic pagination utility with total count" \
     --body "$(cat improvement-proposal.md)" \
     --label "enhancement" \
     --label "from-app-analysis"
   ```

3. **Add appropriate labels**:
   - `enhancement` - For all improvements
   - `from-app-analysis` - Tag for tracking
   - Category labels: `build`, `testing`, `database`, `api`, `frontend`, `workflow`, `security`
   - Priority labels: `priority-high`, `priority-medium`, `priority-low`
   - Effort labels: `effort-small`, `effort-medium`, `effort-large`

4. **Link related issues**:
   ```bash
   # Add comment linking related issues
   gh issue comment 123 --repo vetpartners/base-web-app \
     --body "Related to #456 and #789"
   ```

5. **Create project board tracking** (optional):
   If project board exists for "Template Improvements":
   ```bash
   # Add to project board
   gh project item-add [project-number] \
     --owner vetpartners \
     --url https://github.com/vetpartners/base-web-app/issues/123
   ```

6. **Report results**:
   ```markdown
   ## Issues Created

   Successfully created X GitHub issues:

   - #123: Add generic pagination utility - https://github.com/vetpartners/base-web-app/issues/123
   - #124: Add standardized error handling - https://github.com/vetpartners/base-web-app/issues/124
   - ...

   **Labels Applied:**
   - `enhancement`: All issues
   - `from-app-analysis`: All issues
   - Category and priority labels as appropriate

   **Next Steps:**
   1. Review created issues on GitHub
   2. Add to sprint/milestone as appropriate
   3. Assign to team members
   4. Prioritize in backlog
   ```

## Advanced Filtering Techniques

### Code Similarity Detection

Use AST-based analysis when available, fallback to pattern matching:

```bash
# Find similar patterns in base template
grep -r "function.*Paginated" .claude/temp/base-web-app/server/

# Check if pattern already exists
grep -r "interface PaginatedResult" .claude/temp/base-web-app/
```

### Domain-Specific Detection

Identify domain-specific code by:

1. **Table names in schema.ts**:
   - If table name is not `user`, `organization`, `session` → domain-specific
   - Exception: Generic utility tables like `audit_log`, `notification`

2. **API endpoint paths**:
   - If path is not `/api/auth/*` → domain-specific
   - Exception: Generic patterns like `/api/health`, `/api/status`

3. **Business logic keywords**:
   - Terms like "invoice", "patient", "booking", etc. → domain-specific
   - Generic terms like "search", "filter", "paginate" → potentially generic

### Abstraction Quality Check

Before proposing, verify abstraction quality:

```typescript
// ❌ Poor abstraction (still domain-specific)
interface ClientPaginatedResult {
  clients: Client[];
  total: number;
}

// ✅ Good abstraction (generic)
interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
```

## Error Handling

### Template Fetch Failures

**Recovery Strategy:**
1. **Retry with exponential backoff:** Wait 2s, 4s, 8s between retries (max 3 attempts)
2. **Fall back to cached version:** If local copy exists but pull fails, use existing version with warning
3. **Manual intervention:** If all retries fail, prompt user to manually clone

```bash
# Implement retry logic
for attempt in 1 2 3; do
  if git pull origin main; then
    break
  else
    if [ $attempt -lt 3 ]; then
      echo "Retry $attempt failed, waiting $((2**attempt))s..."
      sleep $((2**attempt))
    else
      echo "Warning: Using cached version (last updated: $(git log -1 --format=%cd))"
      break
    fi
  fi
done
```

**Error Message:**
```
Error: Failed to fetch base-web-app template.

Suggestions:
1. Check internet connection
2. Verify repository URL: https://github.com/vetpartners/base-web-app.git
3. Try manual clone: git clone https://github.com/vetpartners/base-web-app.git .claude/temp/base-web-app
4. Check GitHub authentication
```

### GitHub API Issues

**Recovery Strategy:**
1. **Check rate limit before operations:** Preemptively verify API quota available
2. **Handle rate limiting gracefully:** If rate limited, show time until reset and wait/abort
3. **Reduce API calls:** Cache issue data locally, only fetch if cache older than 1 hour

```bash
# Check rate limit before API operations
RATE_LIMIT=$(gh api rate_limit --jq '.rate.remaining')
if [ "$RATE_LIMIT" -lt 10 ]; then
  RESET_TIME=$(gh api rate_limit --jq '.rate.reset')
  echo "Warning: Only $RATE_LIMIT API calls remaining"
  echo "Rate limit resets at: $(date -d @$RESET_TIME)"
  read -p "Continue? (y/n) " -n 1 -r
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

**Error Message:**
```
Error: Failed to fetch issues from GitHub.

Suggestions:
1. Check GitHub authentication: gh auth status
2. Login to GitHub CLI: gh auth login
3. Verify repository access
4. Check API rate limits: gh api rate_limit
```

### Analysis Failures

**Recovery Strategy:**
1. **Continue on partial failures:** Don't abort entire analysis if one file fails
2. **Track failures separately:** Report excluded files at end with reasons
3. **Graceful degradation:** Complete analysis with available files, note gaps

```bash
# Continue analysis even if some files fail
FAILED_FILES=()
for file in $(find . -name "*.ts"); do
  if ! analyze_file "$file" 2>/dev/null; then
    FAILED_FILES+=("$file")
    echo "Warning: Skipping $file (analysis failed)"
    continue
  fi
done

# Report at end
if [ ${#FAILED_FILES[@]} -gt 0 ]; then
  echo "Analysis completed with ${#FAILED_FILES[@]} files skipped"
  echo "Excluded files: ${FAILED_FILES[@]}"
fi
```

**Error Message:**
```
Error: Failed to analyze [file].

Details:
- File: path/to/file.ts
- Error: [specific error]

Suggestions:
1. Check if file is valid TypeScript
2. Verify file permissions
3. Skip file and continue analysis
```

### Issue Creation Failures

```
Error: Failed to create issue #123.

Details:
- Title: [issue title]
- Error: [specific error]

Suggestions:
1. Check GitHub authentication
2. Verify repository permissions
3. Check if issue already exists
4. Retry creation manually
```

## Testing This Command

### 1. Test on Development Repository

```bash
# Run in analyze mode (safe, no changes)
/propose-template-improvements analyze

# Review report
# Verify MECE principle applied
# Check abstractions are appropriate
# Validate no domain-specific features proposed
```

### 2. Validation Checklist

After running in `analyze` mode:

- [ ] All proposed improvements are abstract and generic
- [ ] No domain-specific Object Types proposed
- [ ] No architectural changes proposed
- [ ] Proposals are well-scoped (single PR each)
- [ ] Proposals are MECE (no overlap, complete coverage)
- [ ] Existing issues checked for duplicates
- [ ] Each proposal has clear implementation example
- [ ] Benefits clearly articulated
- [ ] Integration points identified

### 3. Edge Cases to Test

- **Minimal repo:** Repo with no custom improvements (should report "no improvements found")
- **Heavily customized:** Repo with many customizations (should filter domain-specific)
- **Architectural drift:** Repo using different tech (should exclude architectural changes)
- **Already synced:** Repo recently synced from base-web-app (should find few/no improvements)

## Security Considerations

**Path Validation:**
- Never allow analysis to access files outside project directory
- Validate all file paths before reading
- Reject paths containing `..`, absolute paths, or symlinks

**Sensitive Data:**
- Never include credentials, API keys, or secrets in proposals
- Scrub environment-specific values from code examples
- **Exclude files with secrets:**
  - `.env*` (all environment files)
  - `credentials.json`, `secrets.yaml`, `config/secrets/*`
  - `*.pem`, `*.key`, `*.p12`, `*.pfx` (certificate/key files)
  - `.aws/credentials`, `.gcp/`, `.azure/`
- **Detect secret patterns in code:**
  - Scan for variables: `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN`, `PRIVATE_KEY`, `AUTH_KEY`
  - Connection strings with embedded credentials: `postgres://user:pass@`, `mongodb://user:pass@`
  - Hardcoded tokens: Long alphanumeric strings (30+ chars) assigned to auth variables
- **Scrub sensitive values:**
  - Replace hardcoded values with `process.env.VAR_NAME` or `<REDACTED>`
  - Show pattern/structure, not actual values
  - Example: `apiKey: process.env.STRIPE_API_KEY` instead of `apiKey: "sk_live_abc123..."`

**GitHub API:**
- Use authenticated requests to avoid rate limiting
- Never expose GitHub tokens in output
- Validate repository access before creating issues

## Related Files

- @.claude/commands/sync-base-template.md - Opposite direction (template → repo)
- @CLAUDE.md - Project documentation pattern
- @shared/schema.ts - Schema patterns to analyze
- @server/storage.ts - Storage patterns to analyze
- @server/routes.ts - API patterns to analyze
- @package.json - Configuration to analyze

## Notes

**Philosophy:** This command treats the base-web-app as a continuously improving template that benefits from lessons learned across all repos using it. It's about bidirectional knowledge transfer - not just consuming the template, but contributing back.

**When to run:**
- After implementing significant infrastructure improvements
- When you've solved common problems in elegant ways
- After adding useful utilities or patterns
- When you've improved testing, security, or performance
- Periodically (e.g., quarterly) to capture accumulated improvements

**When NOT to run:**
- When repo is heavily customized with domain logic
- When architectural choices differ significantly from base-web-app
- Before understanding what the command will propose

**Best practices:**
1. Always run in `analyze` mode first
2. Review proposals carefully before creating issues
3. Ensure abstractions are high quality
4. Validate MECE principle applied
5. Check for existing similar issues
6. Provide clear, actionable proposals with examples

**Contributing back:**
- This helps the entire ecosystem improve
- Captures institutional knowledge
- Reduces duplication across projects
- Improves template for future projects
- Creates a feedback loop of continuous improvement
