# Sync Base Template

Update the current repository to match the latest version of the base-web-app template while preserving domain-specific functionality.

## Usage

```
/sync-base-template [mode]
```

## Modes

- `review` - Show what would change without modifying files (default)
- `update` - Apply infrastructure updates, preserving domain logic
- `report` - Generate detailed comparison report

**Default:** `review` (safe mode - no modifications)

## Examples

- `/sync-base-template` - Preview changes (review mode)
- `/sync-base-template update` - Apply template updates
- `/sync-base-template report` - Generate detailed diff report

## Instructions

### Phase 1: Fetch Latest Template

1. **Clone or update base-web-app repository**:

   **SECURITY: Path Validation**
   - Validate temp directory path before any operations
   - Must be under `.claude/temp/` (reject paths with `..`, absolute paths, or symlinks)
   - Use same validation rules as `/sync-dev-plan` command (see lines 30-76)
   - Reject suspicious patterns that could lead to path traversal

   **Clone/Update Process:**
   - Check if temp directory exists: `.claude/temp/base-web-app/`
   - If exists and is a git repo: Run `git pull` to update
   - If doesn't exist: Run `git clone https://github.com/vetpartners/base-web-app.git .claude/temp/base-web-app`
   - Checkout main branch: `git checkout main`
   - Verify clone succeeded before proceeding

   **Path Validation Function:**
   ```javascript
   function validateTemplatePath(path) {
     // Must be under .claude/temp/
     if (!path.startsWith('.claude/temp/')) {
       throw new Error('Template path must be under .claude/temp/');
     }

     // No path traversal patterns
     if (path.includes('..') || path.includes('/../')) {
       throw new Error('Path traversal detected');
     }

     // No absolute paths
     if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) {
       throw new Error('Absolute paths not allowed');
     }

     // Check if symlink (use fs.lstatSync)
     const stats = fs.lstatSync(path);
     if (stats.isSymbolicLink()) {
       throw new Error('Symlinks not allowed');
     }

     return true;
   }
   ```

2. **Get template version info**:
   - Read `.claude/temp/base-web-app/package.json` to get version
   - Get latest commit hash: `git rev-parse HEAD`
   - Store for reporting

### Phase 2: Classify Files

Categorize all files into update strategies:

#### Category 1: Infrastructure Files (Full Update)

These files should be completely replaced from template:

**Build & Configuration:**
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript node configuration
- `.gitignore` - Git ignore patterns
- `.eslintrc.cjs` - ESLint configuration (if exists)
- `vitest.config.ts` - Vitest test configuration (if exists)

**Package Management:**
- `package.json` - Dependencies and scripts (see special handling below)

**Base Documentation:**
- `CLAUDE.md` - Claude Code instructions template
- `README.md` - Project README (if not customized)

**Claude Code Workflow Files:**
- `.claude/README.md` - Claude Code configuration documentation
- `.claude/settings.json` - Claude Code settings
- `.claude/agents/*` - All agent definitions (ontology-developer, ui-developer, feature-developer, supervisor)
- `.claude/commands/*` - All workflow commands (start-issue, validate-issue, etc.)
- `.claude/skills/*` - All skill definitions (ontology-patterns, design-system-patterns, issue-workflow)

**Base Components (shadcn/ui):**
- `client/src/components/ui/*` - All shadcn/ui components (if not customized)

#### Category 2: Domain-Specific Files (Preserve Completely)

These files contain domain logic and should NEVER be updated:

**Domain Schema & Logic:**
- Custom Object Types in `shared/schema.ts` (beyond User/Organization/Session)
- Custom storage methods in `server/storage.ts`
- Custom API routes in `server/routes.ts`
- Custom React pages in `client/src/pages/*`
- Custom components in `client/src/components/*` (except ui/)
- Custom hooks in `client/src/hooks/*`

**Environment & Secrets:**
- `.env`, `.env.local`, `.env.production` - Never touch
- Any files with credentials or environment-specific config

**Linear issues & Documentation:**
- `docs/agent-system/*` - Project-specific agent docs
- `docs/BUSINESS-REQUIREMENTS.md` - Domain requirements
- `docs/DEVELOPMENT-PLAN.md` - Domain development plan
- All Linear issue files

**Custom Claude Code Extensions:**
- `.claude/settings.local.json` - User-specific local settings
- Custom commands added beyond template
- Custom skills added beyond template
- Custom agents added beyond template
- **Note:** Template workflow files are updated, but custom additions are preserved

#### Category 3: Manual Review Required Files

**IMPORTANT:** These files contain both infrastructure and domain code and require manual merging. Automated merging is too risky and error-prone.

These files will be **flagged for manual review** with side-by-side diffs:

**Hybrid Schema File (`shared/schema.ts`):**
- Contains: Base Object Types (User, Organization, Session) + Custom Object Types
- **Review needed:** Template may update base types - you must manually merge with custom types
- **Recommended approach:**
  1. Use marker comments in your schema to separate base from custom:
     ```typescript
     // === BASE TEMPLATE TYPES ===
     export const user = appSchema.table(...)
     export const organization = appSchema.table(...)
     export const session = appSchema.table(...)

     // === CUSTOM DOMAIN TYPES ===
     // Add your custom Object Types below this line
     export const client = appSchema.table(...)
     export const appointment = appSchema.table(...)
     ```
  2. Review template changes to base types
  3. Manually apply template updates to base types section
  4. Keep custom types section unchanged

**Hybrid Storage File (`server/storage.ts`):**
- Contains: Base storage interface + Custom storage methods
- **Review needed:** Template may update IStorage interface structure
- **Strategy:** Flag changes in report, manual merge required

**Hybrid Routes File (`server/routes.ts`):**
- Contains: Auth setup + Custom API routes
- **Review needed:** Template may update auth middleware
- **Strategy:** Use marker comments to separate sections:
  ```typescript
  // === BASE AUTH ROUTES ===
  app.post("/api/auth/login", ...)

  // === CUSTOM DOMAIN ROUTES ===
  app.get("/api/clients", ...)
  ```

**Hybrid App Router (`client/src/App.tsx`):**
- Contains: Base router setup + Custom routes
- **Review needed:** Template may update router configuration
- **Strategy:** Flag in report, manual merge required

**Package.json Special Handling:**
- **Semi-automated merge with validation:**
  1. Detect dependency version changes (use npm view for changelogs)
  2. Flag major version bumps (breaking changes likely)
  3. Merge strategy:
     - **Update:** Template dependencies to latest versions
     - **Preserve:** Custom dependencies not in template
     - **Preserve:** Custom scripts not in template
     - **Preserve:** name, version, description from current repo
  4. **Validation:**
     - Run `npm install --dry-run` to detect conflicts
     - Run `npm audit` to check for security issues
     - Flag peer dependency mismatches
  5. **Breaking change detection:**
     - Check for major version bumps (1.x.x → 2.x.x)
     - Search GitHub release notes for "BREAKING" keyword
     - Display warnings in report with links to changelogs

#### Category 4: Conditional Update Files

Update only if not customized (hash-based detection):

**Server Files:**
- `server/db.ts` - Update if matches template, preserve if customized
- `server/index.ts` - Update if matches template, preserve if customized

**Client Files:**
- `client/src/main.tsx` - Update if matches template, preserve if customized
- `client/index.html` - Update if matches template, preserve if customized

**UI Components:**
- `client/src/components/ui/*` - shadcn/ui components
  - Update if hash matches template (not customized)
  - Preserve if customized (hash mismatch)
  - Report which components were customized vs. updated

**Detection Strategy:**

1. **Hash calculation:**
   ```bash
   # Calculate file hash (use Bash tool)
   sha256sum ./server/db.ts | awk '{print $1}'
   ```

2. **Hash storage:**
   - Maintain `.claude/template-hashes.json` with known template file hashes
   - Format:
     ```json
     {
       "templateVersion": "1.0.0",
       "templateCommit": "abc123def",
       "lastUpdated": "2026-01-07T10:00:00Z",
       "files": {
         "server/db.ts": {
           "hash": "a1b2c3d4e5f6...",
           "version": "1.0.0",
           "note": "Base template version"
         },
         "client/src/components/ui/button.tsx": {
           "hash": "f6e5d4c3b2a1...",
           "version": "1.0.0",
           "note": "shadcn/ui button"
         }
       }
     }
     ```
   - Update hashes when template sync runs successfully
   - Use for future sync operations to detect customizations

3. **Comparison logic:**
   - If current file hash matches stored template hash → Safe to update
   - If hash differs → File was customized, flag for manual review
   - If hash not in storage → Unknown, default to manual review

4. **Fallback:**
   - If `.claude/template-hashes.json` doesn't exist, create it on first sync
   - For first sync, assume all Category 4 files need manual review

### Phase 3: Generate Change Report

Create detailed report showing:

```markdown
## Base Template Sync Report

**Template Source:** https://github.com/vetpartners/base-web-app.git
**Template Version:** [version from package.json]
**Template Commit:** [commit hash]
**Generated:** [ISO 8601 timestamp]
**Mode:** [review | update | report]

---

### Summary

**Files to Update:** X
**Files to Preserve:** Y
**Files Requiring Manual Review:** Z

---

### Infrastructure Updates (Full Replacement)

These files will be completely replaced with template versions:

**Build & Config:**
- [ ] `vite.config.ts` - Vite build configuration
- [ ] `tsconfig.json` - TypeScript compiler options
- [ ] `.gitignore` - Git ignore patterns

**Claude Code Workflow:**
- [ ] `.claude/README.md` - Workflow documentation
- [ ] `.claude/settings.json` - Claude Code settings
- [ ] `.claude/agents/ontology-developer/AGENT.md` - Ontology agent definition
- [ ] `.claude/agents/ui-developer/AGENT.md` - UI agent definition
- [ ] `.claude/agents/feature-developer/AGENT.md` - Feature agent definition
- [ ] `.claude/agents/supervisor/AGENT.md` - Supervisor agent definition
- [ ] `.claude/commands/start-issue.md` - Start Linear issue command
- [ ] `.claude/commands/validate-issue.md` - Validation command
- [ ] `.claude/skills/ontology-patterns/SKILL.md` - Ontology patterns
- [ ] `.claude/skills/design-system-patterns/SKILL.md` - Design patterns
- [ ] ... (12 more Claude Code files)

---

### Intelligent Merges

These files contain both infrastructure and domain code:

#### `shared/schema.ts`
**Strategy:** Preserve custom Object Types, update base types

**Custom Object Types Detected:**
- `exampleEntity` (lines 45-70)
- `customTable` (lines 120-145)

**Base Types to Update:**
- `user` - Update to latest template version
- `organization` - Update to latest template version
- `session` - Update to latest template version

**Actions:**
1. Extract custom Object Types
2. Replace with template version
3. Append custom types with separator

#### `package.json`
**Strategy:** Merge dependencies, preserve custom scripts

**Dependency Updates:**
- `react`: 18.2.0 → 18.3.1
- `vite`: 5.0.0 → 5.1.0
- `drizzle-orm`: 0.28.0 → 0.29.0
- ... (X more)

**Custom Scripts Preserved:**
- `db:seed:custom` - Not in template, will preserve
- `deploy:staging` - Not in template, will preserve

**Custom Dependencies Preserved:**
- `custom-library`: 1.0.0 - Not in template, will preserve

---

### Preserved Files (No Changes)

These files contain domain-specific logic and will not be modified:

- `docs/BUSINESS-REQUIREMENTS.md` - Domain requirements
- `docs/DEVELOPMENT-PLAN.md` - Domain development plan
- `client/src/pages/CustomPage.tsx` - Domain UI
- ... (Y more)

---

### Manual Review Required

These files have been customized and need manual review:

- [ ] `server/db.ts` - Hash mismatch, possible customization
- [ ] `client/src/main.tsx` - Hash mismatch, possible customization

**Recommendation:** Manually compare these files with template versions

---

### Potential Issues

**⚠️ Breaking Changes Detected:**
- `drizzle-orm` update from 0.28 → 0.29 includes breaking API changes
- Review: https://github.com/drizzle-team/drizzle-orm/releases/tag/0.29.0

**⚠️ Conflicts:**
- None detected

---

### Next Steps

**For Review Mode (current):**
1. Review changes above
2. Run `/sync-base-template update` to apply changes
3. Test thoroughly after update

**For Update Mode:**
1. Create backup: `git stash push -m "Pre-template-sync backup"`
2. Apply updates (see Phase 4)
3. Run tests: `npm run test`
4. Run type check: `npm run check`
5. Manual review of flagged files
6. Commit: "Sync with base-web-app template [commit-hash]"

**Always:**
- Back up your work before updating
- Test thoroughly after sync
- Review all changes before committing
```

### Phase 4: Apply Updates (Update Mode Only)

Only execute if mode is `update`:

1. **Detect git worktree usage**:
   ```bash
   # Check if running in a worktree
   git rev-parse --git-common-dir
   ```

   **If in worktree:**
   - Display warning: "You are in a git worktree. Template sync should be run from the main worktree."
   - Recommend: `cd` to main repository directory before running sync
   - **Reject sync in worktree** to avoid conflicts with Linear issue branches

2. **Create safety backup**:

   **Robust backup strategy (multi-layered):**
   ```bash
   # Layer 1: Create backup branch
   BACKUP_BRANCH="backup/pre-sync-$(date +%Y%m%d-%H%M%S)"
   git branch $BACKUP_BRANCH

   # Layer 2: Stash including untracked files
   git stash push -u -m "Pre-template-sync backup $(date +%Y-%m-%d-%H-%M-%S)"

   # Verify backup created successfully
   git stash list | head -1
   ```

   **Rollback instructions (saved to `.claude/temp/rollback-instructions.md`):**
   ```markdown
   # Rollback Instructions

   If sync fails, use these steps to restore:

   ## Option 1: Restore from backup branch (Recommended)
   git reset --hard $BACKUP_BRANCH
   git clean -fd  # Remove untracked files

   ## Option 2: Restore from stash
   git reset --hard HEAD  # Discard all changes
   git stash pop  # Restore backup

   ## Option 3: Selective restore
   git checkout $BACKUP_BRANCH -- <file>  # Restore specific file
   ```

3. **Apply infrastructure file updates**:

   **SECURITY: Validate all file paths before copying**
   - Source path must be under `.claude/temp/base-web-app/`
   - Destination path must be under project root (no `..`, absolute paths, or symlinks)
   - Use Read tool to load source file, Write/Edit tool to update destination
   - Never use `cp` or `mv` commands directly (use Claude Code tools instead)

   **Files to update:**
   - For each file in Category 1 (Infrastructure Files):
     - Validate source path: `validateTemplatePath(sourcePath)`
     - Validate destination path: Must be within project root
     - Use Read tool on source: `.claude/temp/base-web-app/{file}`
     - Use Write tool on destination: `./{file}`
     - Preserve file permissions

   **Specific files:**
   - Build config: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `.gitignore`
   - Documentation: `CLAUDE.md`
   - Claude Code workflow: `.claude/README.md`, `.claude/settings.json`
   - Claude Code agents: All files in `.claude/agents/` (ontology-developer, ui-developer, feature-developer, supervisor)
   - Claude Code commands: All files in `.claude/commands/` (start-issue, validate-issue, etc.)
   - Claude Code skills: All files in `.claude/skills/` (ontology-patterns, design-system-patterns, issue-workflow)
   - **Note:** Custom additions to .claude/ beyond template are preserved (detected by comparing file lists)

3. **Apply intelligent merges**:
   - For each file in Category 3 (Intelligent Merge):
     - Execute merge strategy as defined above
     - Add separator comments to mark custom sections:
       ```typescript
       // =============================================================================
       // CUSTOM DOMAIN CODE (Preserved from template sync)
       // =============================================================================
       ```

4. **Update package.json**:
   - Merge dependencies (template versions + custom additions)
   - Merge scripts (template scripts + custom additions)
   - Preserve: name, version, description

5. **Install updated dependencies**:
   ```bash
   npm install
   ```

6. **Run validation**:
   ```bash
   npm run check    # TypeScript type checking
   npm run test     # Run test suite
   ```

7. **Report results**:
   - Show summary of changes applied
   - List any errors from validation
   - Show next steps

### Phase 5: Validation

After updates applied, verify:

- [ ] `npm install` completes successfully
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run test` passes (all tests green)
- [ ] `npm run build` succeeds
- [ ] Domain functionality preserved (manual check)

**If validation fails:**
1. Show specific errors
2. Suggest fixes or manual review
3. Offer to restore from backup: `git stash pop`

## File Comparison Utilities

### Detecting Customizations

Use git-style diff with context:

```bash
# Compare infrastructure file
diff -u .claude/temp/base-web-app/vite.config.ts ./vite.config.ts

# Calculate file hash for quick comparison
sha256sum ./server/db.ts
```

### Extracting Custom Code Sections

**Pattern: Custom Object Types in schema.ts**
```bash
# Find all table exports excluding base types
grep -n "^export const" shared/schema.ts | grep -v -E "(user|organization|session) ="
```

**Pattern: Custom Routes in routes.ts**
```bash
# Find custom API routes (not /api/auth/*)
grep -n 'app\.(get|post|patch|delete)("/api/' server/routes.ts | grep -v '"/api/auth'
```

**Pattern: Custom Storage Methods**
```bash
# Find methods not in base IStorage interface
# (Requires parsing - use AST or manual review)
```

## Error Handling

### Template Fetch Failures

```
Error: Failed to fetch base-web-app template.

Possible causes:
1. No internet connection
2. GitHub repository moved or deleted
3. Authentication required for private repo

Suggestions:
1. Check internet connection
2. Verify repository URL: https://github.com/vetpartners/base-web-app.git
3. Try manual clone: git clone https://github.com/vetpartners/base-web-app.git
4. If private repo: Ensure SSH key or token configured
```

### Merge Conflicts

```
Warning: Merge conflicts detected in [file].

Conflicts found:
- Line 45: Both template and custom code modified same section

Actions:
1. Saved conflict markers in file (search for <<<<<<)
2. Flagged for manual resolution
3. Do NOT proceed with automatic merge

Next steps:
1. Open [file] in editor
2. Resolve conflicts between <<<<<<< and >>>>>>>
3. Remove conflict markers
4. Re-run validation
```

### Validation Failures

```
Error: Validation failed after template sync.

TypeScript errors:
- shared/schema.ts:45 - Type 'X' is not assignable to type 'Y'
- server/storage.ts:120 - Property 'customMethod' does not exist

Suggestions:
1. Review TypeScript errors above
2. Check if template API breaking changes affect custom code
3. Update custom code to match new template APIs
4. Restore backup if needed: git stash pop

Template version: [version]
Breaking changes: [link to changelog if detected]
```

## Security Considerations

**Path Validation:**
- Never allow template sync to modify files outside project directory
- Validate all file paths before copying
- Reject paths containing `..`, absolute paths, or symlinks

**Sensitive Files:**
- Never update or read: `.env`, `.env.local`, `.env.production`
- Never commit: Credentials, secrets, API keys
- Preserve: `.gitignore` patterns that block sensitive files

**Backup Strategy:**
- Always create git stash before modifications
- Verify backup created successfully before proceeding
- Provide easy rollback: `git stash pop`

## Testing This Command

Before using `/sync-base-template` in production, validate it thoroughly:

### 1. Test on a Sandbox Repository

```bash
# Create a test repository
git clone https://github.com/vetpartners/base-web-app.git test-sync
cd test-sync

# Add fake custom code
echo "export const customTable = appSchema.table(...);" >> shared/schema.ts
git add . && git commit -m "Add custom code for testing"

# Run sync in review mode
/sync-base-template review

# Verify classification is correct
# - customTable should be preserved
# - Base files should be marked for update
```

### 2. Validation Checklist

After running sync in `update` mode on a test repository:

- [ ] `npm install` completes successfully
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run test` passes (all tests green)
- [ ] `npm run build` succeeds
- [ ] Custom code is preserved (manually verify custom Object Types, routes, etc.)
- [ ] Infrastructure files are updated (check vite.config.ts, tsconfig.json)
- [ ] .claude/ workflow files are updated to latest template versions
- [ ] Custom .claude/ additions are preserved

### 3. Edge Cases to Test

Test these scenarios to ensure robustness:

- **Empty custom sections:** Repo with no custom code (should update all infrastructure)
- **Conflicting changes:** Modify a base template file, then sync (should flag for review)
- **Deleted template files:** Remove a template file, then sync (should restore it)
- **New custom files:** Add custom files not in template (should be preserved)
- **Version drift:** Use old base-web-app version, sync to latest (should handle major updates)
- **Worktree scenario:** Run sync from a git worktree (should reject or warn)

### 4. Rollback Test

Verify the backup and rollback strategy works:

```bash
# After sync in update mode
git log  # Should show backup branch created
git branch | grep backup  # Should see backup/pre-sync-TIMESTAMP

# Test rollback
git reset --hard backup/pre-sync-TIMESTAMP
npm install && npm run check  # Should work with restored state
```

## Related Files

- @.claude/commands/sync-dev-plan.md - Similar sync pattern for documentation
- @CLAUDE.md - Project instructions that may be updated by sync
- @.claude/README.md - Claude Code workflow documentation (updated by sync)
- @.claude/template-hashes.json - Hash storage for customization detection (created by sync)
- @docs/DEVELOPMENT-PLAN.md - Domain documentation (preserved)
- @docs/BUSINESS-REQUIREMENTS.md - Domain requirements (preserved)
- @shared/schema.ts - Hybrid file requiring manual review
- @server/storage.ts - Hybrid file requiring manual review
- @server/routes.ts - Hybrid file requiring manual review
- @package.json - Semi-automated merge with validation

**Important:** Add `.claude/temp/` to `.gitignore` to prevent committing template clone:

```gitignore
# .gitignore
.claude/temp/
.claude/template-hashes.json  # Optional: exclude if you want to version it
```

## Notes

**Philosophy:** This command treats the base-web-app repository as a living template. Infrastructure evolves (dependencies, build config, base components), but domain logic is sacred and must be preserved.

**When to sync:**
- After major base-web-app releases
- To get workflow improvements (updated .claude/ agents, commands, skills)
- When adding new shadcn/ui components
- To get security updates in dependencies
- To adopt new build optimizations
- To sync with updated development patterns and best practices

**When NOT to sync:**
- If you've heavily customized infrastructure (fork instead)
- If template changes conflict with domain requirements
- Before understanding what will change (always review first)

**Best practices:**
1. Always run in `review` mode first
2. Read the change report carefully
3. Back up your work (automatic in update mode)
4. Test thoroughly after sync
5. Commit template sync separately from feature work

**Handling version drift:**
- If your repo is very old, consider incremental syncs
- Review changelogs between versions
- Test after each major version bump
- When in doubt, manual merge is safer than automatic
