# Sync Development Plan

> **⚠️ DEPRECATED: This command is for legacy local markdown files only**
>
> **Use Linear Documents Instead:** This command is deprecated. All projects should use Linear documents for business requirements and development plans. See `docs/setup/LINEAR-SETUP.md` for setup instructions and `docs/reference/TEMPLATES.md` for templates.
>
> **This command will be removed in a future version.** It is only kept for backwards compatibility with projects that have not yet migrated to Linear documents.

Generate or update the development plan from business requirements, intelligently preserving existing technical implementation details.

## Usage

```
/sync-dev-plan [mode]
```

## Modes

- `generate` - Create new DEVELOPMENT-PLAN.md from BUSINESS-REQUIREMENTS.md (overwrites existing)
- `update` - Update DEVELOPMENT-PLAN.md from BUSINESS-REQUIREMENTS.md (preserves implementation details)
- `review` - Compare documents and show what would change (no modifications)

**Default:** `update` if DEVELOPMENT-PLAN.md exists, otherwise `generate`

## Examples

- `/sync-dev-plan` - Auto-detect mode based on file existence
- `/sync-dev-plan generate` - Create fresh development plan
- `/sync-dev-plan update` - Update existing plan preserving technical details
- `/sync-dev-plan review` - Preview changes without modifying files

## Instructions

### Phase 1: Read Source Documents

**Security: File Path Validation**
- **Only allow paths in `docs/` directory** to prevent path traversal attacks
- **Validate file extensions:** Only `.md` files
- **File size limit:** Reject files > 5MB to prevent DoS attacks
- **Recommended maximum:** 2,000 lines / 100KB per document for optimal performance
- **Reject suspicious patterns:** `..`, absolute paths outside project root, symbolic links
- **Symlink detection:** Use `fs.lstat()` to detect symlinks, reject if `isSymbolicLink()` returns true
- **Example valid paths:** `docs/BUSINESS-REQUIREMENTS.md`, `docs/DEVELOPMENT-PLAN.md`
- **Example invalid paths:** `../../../etc/passwd`, `/etc/hosts`, `docs/../server/config.json`

**Validation Function (Pseudocode):**
```javascript
function validateDocPath(filePath) {
  // Must be under docs/ directory (relative path)
  if (!filePath.startsWith('docs/')) {
    throw new Error('Invalid path: Must be under docs/ directory');
  }

  // Must have .md extension
  if (!filePath.endsWith('.md')) {
    throw new Error('Invalid extension: Only .md files allowed');
  }

  // No path traversal patterns
  if (filePath.includes('..') || filePath.includes('/../')) {
    throw new Error('Path traversal detected: .. not allowed');
  }

  // No absolute paths (Unix or Windows)
  if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
    throw new Error('Absolute paths not allowed');
  }

  // Check if file is a symlink (reject if true)
  const stats = fs.lstatSync(filePath);
  if (stats.isSymbolicLink()) {
    throw new Error('Symlinks not allowed');
  }

  // Check file size before processing
  if (stats.size > 5 * 1024 * 1024) { // 5MB
    throw new Error('File too large: Maximum 5MB allowed');
  }

  return true; // Validation passed
}
```

**Document Size Limits and Performance:**
- **Recommended maximum:** 2,000 lines (~100KB) per document
- **Absolute maximum:** 5MB file size (hard limit for security)
- **If exceeded (>2000 lines):**
  - Display warning: "Document is large (X lines). Processing may take longer (~Y seconds estimated)"
  - Continue processing (don't fail)
  - Consider suggesting document split in review report
- **Performance estimates:**
  - Small (<500 lines): ~5-10 seconds
  - Medium (500-2000 lines): ~10-30 seconds
  - Large (>2000 lines): ~30-60+ seconds
- **Context window considerations:**
  - Typical document pair: ~3,000-5,000 tokens
  - Large documents (>5,000 lines): May require chunked processing
  - If context limit approached: Process section-by-section

**Timeout Configuration:**
- **Processing timeout:** 120 seconds (2 minutes) maximum
- **If timeout exceeded:**
  1. Save partial progress to temporary file (`.sync-dev-plan-partial.md`)
  2. Display error: "Processing timeout exceeded. Document may be too large or complex."
  3. **Suggestions:**
     - Split document into smaller sections
     - Use `--continue-from-partial` flag to resume
     - Increase timeout with `--timeout=300` (5 minutes max)
  4. Provide option to retry with `--force` flag (bypasses timeout)
- **Timeout checkpoints:**
  - After each major section processed
  - Check elapsed time, abort gracefully if exceeded
  - Allow user interrupt (Ctrl+C) at checkpoints

1. **Read BUSINESS-REQUIREMENTS.md**:
   - **Path:** `docs/BUSINESS-REQUIREMENTS.md` (validate before reading)
   - Extract: Executive summary, vision, goals, personas, user stories
   - Extract: Project phases, timeline, modules, glossary
   - Extract: Success metrics, scope boundaries, key decisions

2. **If mode is update or auto-detect, read existing DEVELOPMENT-PLAN.md**:
   - **Path:** `docs/DEVELOPMENT-PLAN.md` (validate before reading)
   - Identify sections with technical implementation details
   - Preserve: Schema definitions, storage methods, API endpoints, frontend code examples
   - Preserve: Custom content not derivable from business requirements

### Phase 2: Map Business to Technical

Create mapping between business requirements and technical implementation:

**Personas → User Roles:**
- Map each persona to potential user role/permissions
- Identify authentication/authorization requirements

**User Stories → Features:**
- Group stories by module/domain area
- Identify Object Types (nouns), Links (relationships), Actions (verbs)
- Derive CRUD operations and custom actions

**Modules → Implementation Phases:**
- Map business modules to development phases
- Identify dependencies between modules
- Suggest parallel vs. sequential implementation

**Business Rules → Validation:**
- Extract validation rules from acceptance criteria
- Identify data constraints and business logic

### Phase 3: Generate/Update Content

#### Sections to ALWAYS UPDATE from Business Requirements:

> Note: Section references below assume the standard BUSINESS-REQUIREMENTS.md template structure.
> Adapt section identification based on actual document structure using headings and content patterns.

1. **Executive Summary & Vision** (from "Executive Summary" and "Vision & Goals" sections)
2. **User Personas** (from "User Personas" section)
3. **Project Phases Overview** (from "Project Phases & Timeline" section)
4. **Product Scope** (from "Scope by Version" section)
5. **Success Metrics** (from "Success Metrics" section)
6. **Glossary** (from "Glossary" section)

**Section Matching Algorithm (Priority Order):**

For each required section, use this algorithm to find its location in BUSINESS-REQUIREMENTS.md. Apply in order, use first successful match:

**1. Exact Match (100% confidence)**
   - Remove leading numbers and `#` symbols
   - Normalize whitespace to single spaces
   - Case-insensitive comparison
   - Example: "## 1. Executive Summary" → "executive summary"
   - **Action:** Use immediately if found

**2. Single Fuzzy Match with Keyword Validation (>70% confidence)**
   - Calculate similarity score using common substrings
   - **Requirements (ALL must be met):**
     - Similarity score > 70%
     - No other section scores > 70% (uniqueness check)
     - Section-specific keyword validation passes:
       - "User Personas" must contain "persona" OR "role"
       - "Success Metrics" must contain "metric" OR "kpi" OR "measure"
       - "Executive Summary" must contain "executive" OR "summary" OR "overview"
   - Example VALID: "Executive Overview" matches "Executive Summary" (score: 75%, contains "overview", unique)
   - Example INVALID: "User Experience" (score: 72%, missing "persona"/"role")
   - **Action:** Use with logged warning about fuzzy match

**3. Multiple High Matches (Ambiguity Error)**
   - If multiple sections score > 70%
   - **Action:** FAIL with ambiguity error
   - **Error message:** "Multiple sections match '[Section Name]': [List all candidates with scores]"
   - **Suggestion:** "Manually resolve ambiguity or use exact heading names"

**4. Best Match with Manual Review Flag (60-70% confidence)**
   - Single best match scores 60-70%
   - **Action:** Flag for manual review, do NOT auto-apply
   - **Review report:** "Section '[Name]' has potential match '[Candidate]' (score: X%) - requires manual verification"

**5. Keyword Search Fallback**
   - Search for 2+ keywords in section headings
   - **Keywords by section:**
     - "Executive Summary" → ["executive", "summary", "overview"]
     - "User Personas" → ["persona", "user", "role", "actor"]
     - "Success Metrics" → ["metric", "success", "kpi", "measure"]
   - **Action:** Use if unique match, flag if multiple matches

**6. Content Pattern Matching (Last Resort)**
   - Scan section content for distinctive patterns
   - Example: Glossary → table with "Term | Definition" headers
   - Example: Personas → lists with "Primary Responsibilities:"
   - **Action:** Use with warning, flag for verification

**7. No Match Found**
   - All matching attempts score < 60% or fail
   - **Action:** Skip section, add to error report
   - **Error report:** "Could not find '[Section Name]'. Tried: exact, fuzzy, keyword, pattern matching. Best candidate: '[Name]' (score: X%)"
   - **Suggestions:** Add heading "## [Section Name]" to BUSINESS-REQUIREMENTS.md

**Logging:**
- Log all match attempts and scores for debugging
- Include in review mode report: "Section 'User Personas' matched via fuzzy match (score: 85%)"

#### Sections to PRESERVE (update mode only):

1. **Implementation Quick Reference** - Keep existing code patterns
2. **Schema Quick Reference** - Keep existing table definitions
3. **Ontology Baseline** - Keep existing Object Type definitions
4. **Ontology Extensions** - Keep detailed schema/storage/route code
5. **Phase-by-Phase Build Plan** - Keep detailed implementation code examples
6. **Integration Strategy** - Keep technical integration details
7. **Quality, Security, Reliability** - Keep technical checklists
8. **Appendix: Implementation Mapping** - Keep code-to-concept mappings

#### Sections to MERGE INTELLIGENTLY:

These sections contain both business context and technical details. Use HTML comment markers to distinguish content types:

**Content Marker Strategy:**
- Wrap business context in `<!-- BUSINESS-CONTEXT -->...<!-- /BUSINESS-CONTEXT -->`
- Wrap technical details in `<!-- TECHNICAL-DETAIL -->...<!-- /TECHNICAL-DETAIL -->`
- Update business context blocks, preserve technical detail blocks
- If no markers exist, use pattern matching (see rules below)

**Marker Handling Rules:**
1. **Marker Placement:**
   - Markers must be on their own line (not inline)
   - Opening and closing markers must match
   - Valid: `<!-- BUSINESS-CONTEXT -->` on line 1, content on lines 2-5, `<!-- /BUSINESS-CONTEXT -->` on line 6
   - Invalid: `<!-- BUSINESS-CONTEXT -->Content<!-- /BUSINESS-CONTEXT -->` (inline)

2. **Nested Markers:**
   - Nested markers NOT allowed
   - If encountered: Treat inner marker as plain text content
   - Example: Content between outer markers, ignore `<!-- INNER -->` tags

3. **Malformed Markers:**
   - Unclosed opening marker: Log warning, treat remaining section as unmarked
   - Orphan closing marker: Log warning, ignore the closing tag
   - Typos in marker name: Ignore, treat as regular HTML comment

4. **Auto-Adding Markers:**
   - **Generate mode:** Do NOT auto-add markers (clean output)
   - **Update mode (new sections):** Add `<!-- Updated: ... -->` marker only
   - **Update mode (existing sections):** Add markers if user explicitly runs with `--add-markers` flag
   - **Manual addition:** User can add markers to existing documents for finer control

5. **Marker Priority:**
   - Explicit markers override pattern matching
   - If section has markers: Use them exclusively, ignore pattern rules
   - If section has no markers: Fall back to intelligent detection rules (see below)

1. **High-Level Architecture**:

   **Update (Business Context):**
   - Generic architectural descriptions (high-level data flow, conceptual layers)
   - Example: "The frontend communicates with the backend via REST API"
   - Example: "Users authenticate before accessing protected resources"
   - **Pattern:** Short sentences, no specific library/tool names, no code

   **Preserve (Technical Details):**
   - Specific technology implementations, library names, version numbers
   - Example: "Uses TanStack Query for data fetching with 5-minute stale time"
   - Example: "Passport.js with session-based auth using connect-pg-simple for session storage"
   - **Pattern:** Library names, version numbers, configuration values, code blocks
   - **Pattern:** File paths, specific API endpoints, class/function names

2. **Feature Set**:

   **Update (Business Context):**
   - High-level user workflows and capabilities (what users can do)
   - Example: "Users can create, edit, and delete tasks"
   - Example: "Managers can assign tasks to team members"
   - **Pattern:** User-facing verbs (create, view, edit, delete, assign)

   **Preserve (Technical Details):**
   - Implementation specifics, optimization strategies, edge cases
   - Example: "Uses optimistic updates with rollback on failure"
   - Example: File paths (`client/src/pages/TaskList.tsx`), component names, API endpoints
   - **Pattern:** Technical terms (optimistic updates, caching, debouncing)
   - **Pattern:** Paths, URLs, code references

3. **Rollout & Migration Plan**:

   **Update (Business Context):**
   - Timeline, phases, rollout percentages (when and to whom)
   - Example: "Phase 1: Internal testing (Week 1-2)"
   - Example: "Deploy to 10% of users first"
   - **Pattern:** Dates, percentages, phase names, stakeholder groups

   **Preserve (Technical Details):**
   - Deployment commands, migration scripts, environment config
   - Example: Migration scripts, SQL commands, bash scripts
   - Example: `kubectl apply -f deployment.yaml`, environment variables
   - **Pattern:** Code blocks, command-line syntax, SQL queries, file names

**Intelligent Detection Rules (when markers absent):**
- Contains code block → Preserve
- Contains library/tool name (e.g., "React", "PostgreSQL") → Preserve
- Contains file path or URL → Preserve
- Generic description with no specifics → Update
- When uncertain → Flag for manual review in report

### Phase 4: Generate Output

**For `review` mode:**
```markdown
## Development Plan Sync Review

**Source:** docs/BUSINESS-REQUIREMENTS.md
**Target:** docs/DEVELOPMENT-PLAN.md
**Mode:** [Generate | Update | Review]
**Timestamp:** {ISO 8601: YYYY-MM-DDTHH:MM:SSZ}

---

### Changes Summary

**Sections to be Created/Updated:**
- [ ] Implementation Quick Reference
- [ ] Product Scope (updated from business requirements)
- [ ] User Personas (updated from business requirements)
- ...

**New Content Detected:**
- New persona: [Persona Name] → Will generate user role implementation
- New module: [Module Name] → Will create ontology extension area
- New user story: [Story ID] → Will add to feature set
- ...

**Preserved Content:**
- Schema definitions: X tables
- Storage methods: X methods
- API endpoints: X routes
- Code examples: X blocks
- ...

### Detailed Changes

#### Product Scope
**Action:** Update
**Source:** BUSINESS-REQUIREMENTS.md "Scope by Version" section
**Changes:**
- Add capability: [New capability]
- Update business value metrics

#### User Personas
**Action:** Update
**Source:** BUSINESS-REQUIREMENTS.md "User Personas" (fuzzy match, score: 85%)
**Changes:**
- Add persona: "Veterinary Technician" (found in §3.2)
- Update persona: "Clinic Administrator" - added responsibility "manage inventory"
- No conflicts with existing ontology

**Example detailed output:**
```markdown
#### User Personas
**Action:** Update
**Source:** BUSINESS-REQUIREMENTS.md "User Personas" section
**Match Quality:** Fuzzy match (score: 85%)
**Changes:**
- Add persona: [Persona Name]
- Update persona: [Persona Name] - new responsibilities
```

#### Ontology Extensions
**Action:** Preserve + Append
**Changes:**
- Preserve existing: [ObjectType1], [ObjectType2]
- Add placeholder for: [NewModule] based on new user stories

---

### Recommendations

1. **Review New Placeholders:** Following sections have placeholder content that needs technical details:
   - Ontology Extension: [Module Name]
   - Phase X Build Plan: [Phase Name]

2. **Human Review Needed:** Following sections have conflicting information:
   - [Section name]: Business requirements changed timeline, but dev plan has detailed implementation
   - [Section name]: New persona conflicts with existing role structure

3. **Next Steps:**
   - Review changes above
   - Run `/sync-dev-plan update` (same mode) to apply changes
   - Fill in technical details for new placeholders
   - Resolve any conflicting sections manually
```

**For `generate` or `update` mode:**
- Apply changes to docs/DEVELOPMENT-PLAN.md
- Add comment blocks to indicate generated vs. preserved content
- Report summary of changes made

## Mapping Rules

### Personas → Object Types & Roles

For each persona in BUSINESS-REQUIREMENTS.md:
- Suggest user role/permission level
- Identify primary Object Types they interact with
- List required Actions based on their responsibilities

### User Stories → Ontology Elements

Parse user stories in format: "As a [persona], I can [action] so that [benefit]"

Extract:
- **Object Type:** Noun in the action (e.g., "create a task" → Task)
- **Action:** Verb in the action (e.g., "create", "assign", "complete")
- **Link:** Relationships implied (e.g., "assign to user" → Task-User link)

### Modules → Implementation Phases

Map business modules to development phases:
- Identify dependencies between modules
- Suggest parallel tracks using 1-ONTOLOGY, 2-DESIGN-SYSTEM, 3-TRACER-BULLETS pattern
- Derive implementation phases with appropriate technical detail

### Business Rules → Validation & Constraints

Extract from acceptance criteria and glossary:
- Required fields → `.notNull()` in schema
- Unique constraints → Add to schema
- Business logic → Describe in Actions section
- Validation rules → Zod schema validation

## Output Structure

### For New DEVELOPMENT-PLAN.md (generate mode):

1. Fill all template placeholders with content from BUSINESS-REQUIREMENTS.md
2. Add `[TODO: Add technical implementation details]` for sections needing developer input
3. Pre-populate ontology sections based on user story analysis
4. Include all examples and code templates from the template

### For Updated DEVELOPMENT-PLAN.md (update mode):

1. Preserve all code blocks verbatim
2. Preserve all detailed implementation sections
3. Update only high-level business context sections
4. Add new sections for new modules/personas as placeholders
5. **Add update markers** at the top of updated sections:
   - **Format:** `<!-- Updated: YYYY-MM-DD | Previous: YYYY-MM-DD | Hash: abc123 -->`
   - **Placement:** Immediately after the section heading, on its own line
   - **Version tracking:** Replace existing update marker (don't accumulate)
   - **Marker replacement algorithm:**
     1. After section heading, scan next 5 lines
     2. Match pattern: `<!-- Updated: \d{4}-\d{2}-\d{2}` (regex)
     3. If found: Replace entire line with new marker
     4. If not found: Insert new marker as first line after heading
     5. Preserve other comment types (user comments, PRESERVED markers, etc.)
     6. Example:
        ```markdown
        ## User Personas
        <!-- Updated: 2026-01-06 | Previous: none | Hash: a1b2c3d4 -->  ← Replace this line
        <!-- Custom user note -->  ← Preserve this
        ```
   - **Hash calculation specification:**
     - **Input:** Section content only (exclude heading and comment markers)
     - **Normalization steps (in order):**
       1. **Extract content:** All text after section heading until next heading or end of document
       2. **Remove HTML comments:** Strip all `<!-- ... -->` blocks (including update/preserved markers)
       3. **Normalize line endings:** Convert all CRLF (`\r\n`) to LF (`\n`)
       4. **Trim each line:** Remove leading and trailing whitespace from each line
       5. **Remove empty boundaries:** Remove blank lines at start and end of section
       6. **Preserve internal structure:** Keep multiple newlines within content (don't collapse)
       7. **Normalize markdown formatting:** Treat `**bold**` and `__bold__` as equivalent (optional, for robustness)
     - **Algorithm:** SHA-256 hash, first 8 hexadecimal characters (lowercase)
     - **Cross-platform consistency:**
       - Use same normalization on Windows (CRLF) and Unix (LF)
       - Hash of normalized content should be identical across platforms
     - **Example:**
       ```
       Raw content: "## Vision\r\n\r\nOur vision is to...\r\n  \r\n"
       After step 1: "\r\n\r\nOur vision is to...\r\n  \r\n"
       After step 2: "\r\n\r\nOur vision is to...\r\n  \r\n" (no comments)
       After step 3: "\n\nOur vision is to...\n  \n"
       After step 4: "\n\nOur vision is to...\n\n"
       After step 5: "Our vision is to..."
       SHA-256: "a1b2c3d4e5f6..." → Hash: "a1b2c3d4"
       ```
   - **Example initial update:** `<!-- Updated: 2026-01-06 | Previous: none | Hash: a1b2c3d4 -->`
   - **Example subsequent update:** `<!-- Updated: 2026-01-15 | Previous: 2026-01-06 | Hash: e5f6g7h8 -->`
   - **Change detection:** If hash matches, skip update (no changes detected)

6. **Add preservation markers** at the top of preserved sections with technical details:
   - **Format:** `<!-- PRESERVED: Original implementation details | Last verified: YYYY-MM-DD -->`
   - **Placement:** Immediately after the section heading, on its own line
   - **Update on verification:** Update the "Last verified" date each sync to indicate content was checked
   - **Only for:** Sections with code examples, schema definitions, or technical specifications
   - **Example:** `<!-- PRESERVED: Original implementation details | Last verified: 2026-01-06 -->`

## Validation Checks

Before finalizing, verify:

**File Existence Checks:**
- [ ] BUSINESS-REQUIREMENTS.md exists and is readable
- [ ] DEVELOPMENT-PLAN.md exists (for update mode) or will be created (for generate mode)

**Content Mapping Checks:**
- [ ] All personas from BUSINESS-REQUIREMENTS.md are represented in development plan
      - Each persona in BUSINESS-REQUIREMENTS.md §3 has a section in DEVELOPMENT-PLAN.md "Feature Set"
      - Each persona maps to at least one user role in ontology baseline
      - Persona names appear in user story mappings or action definitions
      - Example: "Clinic Administrator" persona → "Admin" role + Actions section lists admin-specific actions
      - **How to Verify:**
        ```bash
        # Count personas in business requirements
        grep -c "^### [0-9]\+\.[0-9]\+ " docs/BUSINESS-REQUIREMENTS.md
        # Count persona sections in dev plan Feature Set
        grep -c "Persona:" docs/DEVELOPMENT-PLAN.md
        # Should match or dev plan count >= business req count
        ```

- [ ] All modules from business requirements have corresponding development phases
      - Each module in BUSINESS-REQUIREMENTS.md §5 has a phase in DEVELOPMENT-PLAN.md §9-10
      - Module names match or are clearly related (e.g., "Task Management" → "Phase 1: Core Task Features")
      - Dependencies between modules are reflected in phase ordering
      - **How to Verify:**
        ```bash
        # Extract module names from §5 (adjust grep pattern to your structure)
        grep "^## 5\." docs/BUSINESS-REQUIREMENTS.md -A 100 | grep "^### "
        # Cross-reference with phase names in DEVELOPMENT-PLAN.md §9-10
        grep "^### Phase [0-9]" docs/DEVELOPMENT-PLAN.md
        # Manually verify 1:1 or logical grouping
        ```

- [ ] All user stories map to features or ontology elements in the plan
      - Stories in BUSINESS-REQUIREMENTS.md §5 appear in DEVELOPMENT-PLAN.md "Feature Set" or phase descriptions
      - Key nouns from stories map to Object Types in ontology
      - Key verbs from stories map to Actions in ontology
      - Example: "As a manager, I can assign tasks" → Task object type + "assign" action
      - **How to Verify:**
        ```bash
        # Extract story IDs (e.g., "US-001", "M1-01")
        grep -o "\[M[0-9]-[0-9]\{2\}\]" docs/BUSINESS-REQUIREMENTS.md | sort -u > /tmp/stories.txt
        # Search for each story ID in DEVELOPMENT-PLAN.md
        while read story; do
          grep -q "$story" docs/DEVELOPMENT-PLAN.md || echo "Missing: $story"
        done < /tmp/stories.txt
        ```

**Consistency Checks:**
- [ ] Timeline and phases are consistent between both documents
- [ ] Glossary terms are consistent between both documents
- [ ] Section references are accurate and sections exist

**Preservation Checks (update mode only):**
- [ ] No code examples were accidentally removed
- [ ] Technical implementation details remain intact
- [ ] All placeholder sections are clearly marked with `[TODO]` tags

## Error Handling

Handle these scenarios gracefully with actionable suggestions:

- **Source file missing:**
  ```
  Error: docs/BUSINESS-REQUIREMENTS.md not found.

  Suggestions:
  1. Create from template: Copy docs/BUSINESS-REQUIREMENTS.md template to your docs/ folder
  2. Check path: Ensure you're running from project root
  3. Verify file name: Should be exactly "BUSINESS-REQUIREMENTS.md" (case-sensitive on Unix systems)
  ```

- **Source file empty:**
  ```
  Error: docs/BUSINESS-REQUIREMENTS.md is empty or contains only template placeholders.

  Suggestions:
  1. Fill in business requirements: Replace [placeholder] text with actual content
  2. Minimum required sections: Executive Summary, User Personas, Scope
  3. See example: docs/AI-PROMPTS.md for guidance on writing requirements
  ```

- **Target file corrupted (update mode):**
  ```
  Warning: docs/DEVELOPMENT-PLAN.md appears malformed (missing expected sections or invalid markdown).

  Suggestions:
  1. Use generate mode: Run `/sync-dev-plan generate` to create fresh dev plan
  2. Validate markdown: Check for unclosed code blocks, malformed tables, or broken headings
  3. Restore from backup: Check git history with `git log docs/DEVELOPMENT-PLAN.md`
  4. Manual fix: Open file and ensure major sections (Ontology, Phases) have proper headings
  ```

- **Target file missing (update mode):**
  ```
  Info: No existing DEVELOPMENT-PLAN.md found. Automatically switching to `generate` mode.

  This will create a new development plan from scratch.
  ```

- **Write permission failure:**
  ```
  Error: Cannot write to docs/DEVELOPMENT-PLAN.md.

  Suggestions:
  1. Check file permissions: Run `ls -la docs/DEVELOPMENT-PLAN.md` (Unix) or check Properties (Windows)
  2. Close the file: Ensure DEVELOPMENT-PLAN.md is not open in an editor or viewer
  3. Check disk space: Run `df -h` (Unix) or check drive properties (Windows)
  4. Try with sudo: If needed, run with elevated permissions (use caution)
  ```

- **Ambiguous section structure:**
  ```
  Warning: Could not identify [section name] in BUSINESS-REQUIREMENTS.md.

  Matching attempts:
  - Exact match: No heading found matching "[section name]"
  - Fuzzy match: Best candidate "[closest heading]" (score: 65%, below 70% threshold)
  - Keyword match: No headings contain required keywords

  Suggestions:
  1. Add heading: Insert "## [Section Name]" in BUSINESS-REQUIREMENTS.md
  2. Use standard template: Ensure document follows template structure (see docs/BUSINESS-REQUIREMENTS.md)
  3. Run with --verbose: Use verbose mode to see all section candidates found
  4. Skip this section: The sync will continue without this section (review mode will show impact)

  Action taken: Skipping this section for now. Check review report for details.
  ```

- **Document size limit:**
  ```
  Warning: BUSINESS-REQUIREMENTS.md is very large (X lines, Y characters).

  Suggestions:
  1. For files >5000 lines: Consider splitting into multiple focused documents
  2. Performance impact: Large documents may take longer to process (estimated: ~Xs)
  3. Token limits: Very large documents might exceed AI context limits
  4. Continue anyway: Sync will proceed but may be slower
  ```

## Related Files

- @docs/BUSINESS-REQUIREMENTS.md - Source document (business requirements input, also serves as template)
- @docs/DEVELOPMENT-PLAN.md - Target document (technical development plan output, also serves as template)
- @docs/REQUIREMENTS-TEMPLATE.md - Alternative template for creating BUSINESS-REQUIREMENTS.md (if exists)
- @docs/AI-PROMPTS.md - Related prompt templates and examples

**Note:** BUSINESS-REQUIREMENTS.md and DEVELOPMENT-PLAN.md in this repository contain placeholder content and serve as templates. Copy and fill in with project-specific content.

## Notes

**Philosophy:** The development plan is a living document that bridges business requirements and technical implementation. When syncing:

- **Business context flows down:** From BUSINESS-REQUIREMENTS.md to DEVELOPMENT-PLAN.md
- **Technical details stay put:** Implementation code, schemas, and patterns remain in DEVELOPMENT-PLAN.md
- **Bidirectional glossary:** Domain terms should be consistent across both documents

**When to use each mode:**

- **generate:** Starting a new project, or business requirements were completely rewritten
- **update:** Incrementally incorporating business requirement changes into existing plan
- **review:** Before a major sync, to see impact of changes
