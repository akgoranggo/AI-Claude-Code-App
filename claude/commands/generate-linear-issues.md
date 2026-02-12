# Generate Linear Issues

Generate Linear issues from a Linear Development Plan document for a specified project.

## Prerequisites

**REQUIRED: Your project must have a Linear Development Plan document.**

Before using this command:
1. Create a Linear document titled `[Project Name] — Development Plan`
2. Attach it to your Linear project
3. Use the template provided in `docs/reference/TEMPLATES.md`

See `docs/reference/TEMPLATES.md` for complete instructions and templates.

## Usage

```
/generate-linear-issues {PROJECT_NAME} {MODE}
```

**Modes:**
- `plan` - Dry run: report what issues would be created without creating them
- `generate` - Create all issues from scratch (fails if issues already exist)
- `update` - Add only missing issues that don't exist yet

## Examples

- `/generate-linear-issues "My Project" plan` - Preview what would be created
- `/generate-linear-issues "My Project" generate` - Create all issues fresh
- `/generate-linear-issues "My Project" update` - Add missing issues only

## Instructions

When this command is invoked:

### 1. Parse Command Parameters

Extract:
- `PROJECT_NAME` - The Linear project name (required)
- `MODE` - One of: plan, generate, update (required)

Validate that both parameters are provided.

### 2. Fetch Linear Project

Use Linear MCP tools to find the project:

```typescript
// List all projects and find by name
const projects = await linearMcp.list_projects({
  query: PROJECT_NAME,
  limit: 10
});

// Find exact match or closest match
const project = projects.find(p =>
  p.name.toLowerCase() === PROJECT_NAME.toLowerCase()
);

if (!project) {
  throw new Error(`Project "${PROJECT_NAME}" not found. Available projects: ${projects.map(p => p.name).join(", ")}`);
}
```

Get the team information:

```typescript
const team = await linearMcp.get_team({
  query: project.teams[0].id
});
```

### 3. Read Development Plan from Linear

Fetch the Linear Development Plan document for the project:

```typescript
// List documents for the project
const projectDocuments = await linearMcp.list_documents({
  projectId: project.id,
  limit: 50
});

// Find the Development Plan document
const devPlanDoc = projectDocuments.find(doc =>
  doc.title.includes("Development Plan") ||
  doc.title.includes(project.name)
);

if (!devPlanDoc) {
  throw new Error(
    `No Development Plan document found for project "${PROJECT_NAME}".\n\n` +
    `Required: Create a Linear document titled "[Project Name] — Development Plan" and attach it to the project.\n\n` +
    `Instructions:\n` +
    `1. Go to your Linear project\n` +
    `2. Navigate to Documents tab → New Document\n` +
    `3. Use the template from docs/reference/TEMPLATES.md\n` +
    `4. Fill in your project details\n` +
    `5. Attach document to the project\n\n` +
    `See docs/reference/TEMPLATES.md for detailed setup instructions.`
  );
}

// Fetch the full document content
const devPlan = await linearMcp.get_document({
  id: devPlanDoc.id
});
```

Parse the development plan to extract:
- **Business Requirements** - User stories from Section 1 (US-001, US-002, etc.)
- **Phases** - Identify sections like "Phase 0", "Phase 1", etc.
- **Phase Implements** - Which user stories each phase implements
- **Object Types** - Tables/schemas mentioned in each phase
- **Storage Methods** - CRUD operations mentioned
- **API Endpoints** - REST endpoints mentioned
- **UI Components** - Pages/components mentioned
- **Dependencies** - Which phases depend on others

Use the `development-plan-parser` skill (automatically loaded) to help with this parsing.

### 4. Generate Issue Definitions

For each phase, create issue definitions following the three-track structure:

#### Track 1: ONTOLOGY Issues (1-ONTOLOGY label)

For each Object Type in a phase, create an issue:

**Title:** `[Phase X] {ObjectName} Schema & Storage`

**Description:**
```markdown
## Objective

Implement the {ObjectName} Object Type including schema definition, storage methods, and API endpoints.

## Scope

**Schema (shared/schema.ts):**
- Add Object Type: {tableName}
- Fields: {list fields from plan}
- Relationships: {list foreign keys}
- Indexes: {suggested indexes}

**Storage Methods (server/storage.ts):**
- create{ObjectName}(data: Insert{ObjectName}): Promise<{ObjectName}>
- get{ObjectName}ById(id: string): Promise<{ObjectName} | null>
- get{ObjectName}s{ByScope}(): Promise<{ObjectName}[]>
- update{ObjectName}(id: string, data: Partial<Insert{ObjectName}>): Promise<{ObjectName}>
- delete{ObjectName}(id: string): Promise<void>

**API Endpoints (server/routes.ts):**
- GET /api/{resources} - List all
- GET /api/{resources}/:id - Get by ID
- POST /api/{resources} - Create
- PATCH /api/{resources}/:id - Update
- DELETE /api/{resources}/:id - Delete

**Tests (server/__tests__/{resource}.test.ts):**
- Test all CRUD operations
- Test validation rules
- Test authorization/scoping

## Files to Modify

| File | Action |
|------|--------|
| `shared/schema.ts` | Add {ObjectName} table definition |
| `server/storage.ts` | Add IStorage methods and implementation |
| `server/routes.ts` | Add API endpoints |
| `server/__tests__/{resource}.test.ts` | Add test suite |

## Files NOT to Modify

- Client files (unless specified in scope)
- Other unrelated schema definitions

## Reference Materials

1. [Development Plan](linear://document/{devPlanDoc.id}) - Phase {N} section
2. `docs/agent-system/PATTERNS.md` - Schema, Storage, and API patterns
3. `docs/examples/` - Reference implementations

## Acceptance Criteria

- [ ] Schema definition added with proper types and constraints
- [ ] All storage methods implemented and working
- [ ] All CRUD API endpoints implemented
- [ ] Request validation with Zod schemas
- [ ] Authorization checks in place
- [ ] Tests written and passing (>80% coverage)
- [ ] TypeScript compiles with no errors
- [ ] Lint passes with no warnings
- [ ] Follows PATTERNS.md exactly
```

**Labels:** `1-ONTOLOGY`

**Project:** {project.id}

**Blocked By:** Issues from previous phases (if applicable)

**Estimate:** {calculate based on complexity: 3-8 points}

#### Track 2: DESIGN-SYSTEM Issues (2-DESIGN-SYSTEM label)

For UI components mentioned in a phase:

**Title:** `[Phase X] {ComponentName} UI Components`

**Description:**
```markdown
## Objective

Build UI components for {feature area} including {list components}.

## Scope

**Components (client/src/components/):**
- {ComponentName}List - Display list of items
- {ComponentName}Card - Individual item card
- {ComponentName}Form - Create/edit form
- {ComponentName}Detail - Detail view

**Pages (client/src/pages/):**
- {ComponentName}ListPage - Main list page
- {ComponentName}DetailPage - Detail page with actions

**Styling:**
- Use shadcn/ui components as base
- Follow mobile-first responsive design
- Minimum touch targets: 44px
- Accessibility: ARIA labels, keyboard navigation

## Files to Modify

| File | Action |
|------|--------|
| `client/src/components/{domain}/` | Add new components |
| `client/src/pages/` | Add page components |
| `client/src/App.tsx` | Register routes |

## Files NOT to Modify

- Backend files
- Unrelated components

## Reference Materials

1. [Development Plan](linear://document/{devPlanDoc.id}) - Phase {N} UI specifications
2. `docs/agent-system/PATTERNS.md` - React component patterns
3. `docs/examples/component-example.tsx` - Reference component

## Acceptance Criteria

- [ ] All components implemented
- [ ] Mobile-responsive (tested at 375px, 768px, 1024px)
- [ ] Touch targets meet 44px minimum
- [ ] Accessible (ARIA, keyboard nav)
- [ ] Uses design system components
- [ ] TypeScript compiles with no errors
- [ ] Components render without errors
- [ ] Follows PATTERNS.md exactly
```

**Labels:** `2-DESIGN-SYSTEM`

**Project:** {project.id}

**Blocked By:** None (can develop in parallel with Track 1)

**Estimate:** {calculate based on complexity: 3-8 points}

#### Track 3: TRACER-BULLETS Issues (3-TRACER-BULLETS label)

For complete features that integrate ontology and UI:

**Title:** `[Phase X] {FeatureName} End-to-End Feature`

**Description:**
```markdown
## Objective

Implement complete end-to-end {feature name} workflow integrating backend APIs and frontend UI.

## Business Context

**Implements:** {User story IDs from Development Plan}

**From Development Plan:** [Link to Development Plan document, section]

**Example:**
**Implements:** US-001 (Resource Management)
**From Development Plan:** [{Project} — Development Plan](linear://document/{devPlanDoc.id}#phase-1) § Phase 1

## Scope

**Backend Integration:**
- Consume APIs from Track 1: {list endpoints}
- Add feature-specific orchestration if needed
- Handle error states and edge cases

**Frontend Integration:**
- Use components from Track 2: {list components}
- Implement complete user workflows
- Add loading and error states

**User Workflows:**
1. {Workflow 1}: {description}
2. {Workflow 2}: {description}

**Business Logic:**
- {Logic item 1}
- {Logic item 2}

## Files to Modify

| File | Action |
|------|--------|
| `client/src/pages/` | Integrate components into workflows |
| `server/routes.ts` | Add orchestration endpoints (if needed) |
| `client/src/App.tsx` | Configure routes |

## Files NOT to Modify

- Core schema definitions (should be in Track 1)
- Base UI components (should be in Track 2)

## Reference Materials

1. [Development Plan](linear://document/{devPlanDoc.id}) - Phase {N} feature specifications and user stories
2. `docs/agent-system/PATTERNS.md` - Integration patterns
3. `docs/examples/` - Reference implementations (if available)

## Acceptance Criteria

- [ ] All user workflows implemented
- [ ] APIs integrated correctly
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] User story acceptance criteria from Development Plan validated in UAT
- [ ] End-to-end testing completed
- [ ] TypeScript compiles with no errors
- [ ] Follows PATTERNS.md exactly
```

**Labels:** `3-TRACER-BULLETS`

**Project:** {project.id}

**Blocked By:** Track 1 issues (schemas/APIs), Track 2 issues (components)

**Estimate:** {calculate based on complexity: 5-13 points}

### 5. Set Up Dependencies

Establish blocker relationships:

1. **Phase Dependencies:**
   - Phase N issues blocked by Phase N-1 issues
   - Track 3 issues blocked by Track 1 and Track 2 issues from same phase

2. **Within-Track Dependencies:**
   - Issues that reference other Object Types should be blocked by those Object Types

### 6. Execute Based on Mode

#### Mode: PLAN

For plan mode, output the issues that would be created WITHOUT creating them:

```markdown
## Issue Generation Plan for Project: {PROJECT_NAME}

### Summary

- **Total Issues:** {count}
  - Track 1 (ONTOLOGY): {count}
  - Track 2 (DESIGN-SYSTEM): {count}
  - Track 3 (TRACER-BULLETS): {count}

### Issues by Phase

#### Phase 0 - Platform Setup
- [ ] TEAM-001: [Phase 0] Initial Setup (1-ONTOLOGY)
  - Dependencies: None
  - Estimate: 5 points

#### Phase 1 - {Phase Name}
- [ ] TEAM-002: [Phase 1] {ObjectName1} Schema & Storage (1-ONTOLOGY)
  - Dependencies: TEAM-001
  - Estimate: 5 points
- [ ] TEAM-003: [Phase 1] {ObjectName2} Schema & Storage (1-ONTOLOGY)
  - Dependencies: TEAM-001, TEAM-002
  - Estimate: 5 points
- [ ] TEAM-010: [Phase 1] {ComponentName} UI Components (2-DESIGN-SYSTEM)
  - Dependencies: None
  - Estimate: 5 points
- [ ] TEAM-020: [Phase 1] {FeatureName} Feature (3-TRACER-BULLETS)
  - Dependencies: TEAM-002, TEAM-003, TEAM-010
  - Estimate: 8 points

[... continue for all phases ...]

### Dependency Graph

```
TEAM-001 (Platform Setup)
    ├─→ TEAM-002 (Object1)
    │      └─→ TEAM-020 (Feature1)
    ├─→ TEAM-003 (Object2)
    │      └─→ TEAM-020 (Feature1)
    └─→ TEAM-010 (Components)
           └─→ TEAM-020 (Feature1)
```

### Next Steps

Run with mode `generate` to create these issues:
```
/generate-linear-issues "{PROJECT_NAME}" generate
```

Or run with mode `update` to add only missing issues:
```
/generate-linear-issues "{PROJECT_NAME}" update
```
```

#### Mode: GENERATE

For generate mode:

1. **Check for existing issues:**
   ```typescript
   const existingIssues = await linearMcp.list_issues({
     project: project.id,
     limit: 250
   });

   if (existingIssues.length > 0) {
     throw new Error(`Project already has ${existingIssues.length} issues. Use 'update' mode to add missing issues, or manually delete existing issues first.`);
   }
   ```

2. **Create all issues:**
   - Create issues in dependency order (Phase 0, then Phase 1, etc.)
   - Within each phase, create Track 1 first, then Track 2, then Track 3
   - Store created issue IDs to set up blocker relationships

3. **Set blocker relationships:**
   ```typescript
   // For each issue with dependencies
   await linearMcp.update_issue({
     id: issueId,
     blockedBy: [blockerId1, blockerId2, ...]
   });
   ```

4. **Output summary:**
   ```markdown
   ## Issues Created Successfully

   Created {count} issues in project "{PROJECT_NAME}":

   - Track 1 (ONTOLOGY): {count} issues
   - Track 2 (DESIGN-SYSTEM): {count} issues
   - Track 3 (TRACER-BULLETS): {count} issues

   View issues in Linear: {project.url}

   ### Next Steps

   1. Review issues in Linear project board
   2. Adjust priorities and estimates as needed
   3. Start work with: `/start-issue {FIRST_ISSUE_ID}`
   ```

#### Mode: UPDATE

For update mode:

1. **Fetch existing issues:**
   ```typescript
   const existingIssues = await linearMcp.list_issues({
     project: project.id,
     limit: 250
   });
   ```

2. **Compare with plan:**
   - Parse DEVELOPMENT-PLAN.md
   - Generate list of expected issues
   - Compare titles to identify missing issues
   - Account for issues that may have different IDs but same title

3. **Create only missing issues:**
   - Create issues that don't exist
   - Set up blocker relationships to existing issues

4. **Output summary:**
   ```markdown
   ## Issues Updated

   Analyzed project "{PROJECT_NAME}":

   - Existing issues: {count}
   - Missing issues: {count}
   - Created issues: {count}

   ### Created Issues

   - TEAM-XXX: [Phase Y] {Title} (1-ONTOLOGY)
   - TEAM-YYY: [Phase Y] {Title} (2-DESIGN-SYSTEM)

   [... list all created issues ...]

   View issues in Linear: {project.url}
   ```

### 7. Error Handling

Handle common errors gracefully:

#### Project Not Found

```markdown
**Error:** Project "{PROJECT_NAME}" not found.

**Available Projects:**
- Project A
- Project B
- Project C

**Solution:** Use one of the available project names or create a new project in Linear first.
```

#### Invalid Mode

```markdown
**Error:** Invalid mode "{MODE}". Must be one of: plan, generate, update

**Usage:** /generate-linear-issues "{PROJECT_NAME}" {plan|generate|update}
```

#### Development Plan Not Found

```markdown
**Error:** No Development Plan document found for project "{PROJECT_NAME}".

**Solution:**
1. Go to your Linear project
2. Navigate to Documents tab → New Document
3. Set title: "[Project Name] — Development Plan"
4. Use the template from `docs/reference/TEMPLATES.md`
5. Fill in your project details
6. Attach document to the project

See `docs/reference/TEMPLATES.md` for complete template and instructions.
```

#### Development Plan Incomplete

```markdown
**Warning:** Development Plan appears to be incomplete or uses placeholder values.

**Detected Issues:**
- Contains placeholder text like "[Project Name]"
- Missing phase definitions
- No Object Types defined

**Recommendation:** Complete your Development Plan before generating issues.

**How to fix:**
1. Open the Development Plan document in Linear
2. Replace placeholder values with your project details
3. Define phases, Object Types, and dependencies
4. Save the document

**Continue anyway?** Use `--force` flag to proceed with current content (not recommended).
```

#### Linear API Errors

```markdown
**Error:** Failed to create issue: {error message}

**Possible Causes:**
- Linear API rate limit exceeded
- Invalid API key or permissions
- Network connectivity issues

**Solution:**
1. Check your Linear API key in .claude/settings.local.json
2. Verify you have write access to the project
3. Wait a few minutes if rate limited
4. Try again
```

#### Duplicate Issues (Generate Mode)

```markdown
**Error:** Cannot use 'generate' mode - project already has issues.

**Options:**
1. Use 'update' mode to add only missing issues:
   `/generate-linear-issues "{PROJECT_NAME}" update`

2. Manually delete existing issues in Linear, then use 'generate'

3. Create a new project in Linear and use 'generate' mode with that project
```

### 8. Validation & Quality Checks

Before creating issues, validate:

1. **Development Plan Quality:**
   - [ ] Has clearly defined phases
   - [ ] Phases include Object Type definitions
   - [ ] Phases reference BUSINESS-REQUIREMENTS.md
   - [ ] Acceptance criteria are specific

2. **Issue Completeness:**
   - [ ] All issues have titles
   - [ ] All issues have descriptions
   - [ ] All issues have labels (track)
   - [ ] Dependencies are valid (no circular deps)

3. **Consistency:**
   - [ ] Object Type names match across references
   - [ ] API endpoint patterns are consistent
   - [ ] File paths match repository structure

If validation fails, report issues and ask user to fix the DEVELOPMENT-PLAN.md before proceeding.

## Output Format

The output format depends on the mode:

### Plan Mode Output

```markdown
## Issue Generation Plan for Project: {PROJECT_NAME}

### Summary
- Total Issues: {count}
- By Track: 1-ONTOLOGY ({count}), 2-DESIGN-SYSTEM ({count}), 3-TRACER-BULLETS ({count})
- By Phase: Phase 0 ({count}), Phase 1 ({count}), ...

### Detailed Issue List

[For each phase, list all issues with title, track, dependencies, estimate]

### Dependency Graph

[Visual representation of dependencies]

### Next Steps

[Instructions for generate or update mode]
```

### Generate Mode Output

```markdown
## Issues Created Successfully ✓

Created {count} issues in project "{PROJECT_NAME}":

### Summary
- Track 1 (ONTOLOGY): {count} issues
- Track 2 (DESIGN-SYSTEM): {count} issues
- Track 3 (TRACER-BULLETS): {count} issues

### Created Issues

[List all created issues with IDs and titles]

### View in Linear
{project.url}

### Next Steps

1. Review issues in Linear project board
2. Adjust priorities/estimates as needed
3. Start first issue: `/start-issue {FIRST_ISSUE_ID}`
```

### Update Mode Output

```markdown
## Issues Updated ✓

Analyzed and updated project "{PROJECT_NAME}":

### Summary
- Existing issues: {count}
- Missing issues found: {count}
- Created issues: {count}

### Newly Created Issues

[List only newly created issues with IDs and titles]

### Skipped (Already Exist)

[List issues that were not created because they already exist]

### View in Linear
{project.url}

### Next Steps

1. Review new issues in Linear
2. Verify blocker relationships are correct
3. Start work on unblocked issues
```

## Related Files

- **Linear Development Plan document** - Primary source for issue generation, includes both business requirements and technical design (created in Linear)
- @docs/reference/TEMPLATES.md - Development Plan template, workflow, and issue templates
- @docs/agent-system/PATTERNS.md - Referenced in issue descriptions
- @.claude/skills/development-plan-parser/SKILL.md - Parsing logic helper

## Advanced Usage

### Dry Run with Detailed Output

```
/generate-linear-issues "My Project" plan --verbose
```

Shows full issue descriptions in the plan, not just titles.

### Force Generation (Skip Validation)

```
/generate-linear-issues "My Project" generate --force
```

Proceeds even if DEVELOPMENT-PLAN.md has placeholder values.

### Specific Phases Only

```
/generate-linear-issues "My Project" generate --phases=1,2
```

Only creates issues for Phase 1 and Phase 2, skipping others.

## Tips for Best Results

1. **Create Linear Development Plan document first** - See `docs/reference/TEMPLATES.md` for template and instructions
2. **Fill in all placeholders** - Replace "[Project Name]" and other placeholders with your project details. Define Object Types clearly.
3. **Review the plan output** - Always run with `plan` mode first to review what will be created
4. **Start with a clean project** - Use `generate` mode on a new project, or `update` mode if project exists
5. **Review dependencies** - Check the dependency graph in plan mode to ensure logical order
6. **Adjust in Linear** - After generation, refine estimates and priorities directly in Linear
7. **Keep plan synced** - If you update the Linear Development Plan document, run `update` mode to add new issues

## Maintenance

When the Linear Development Plan document is updated:

1. Run `/generate-linear-issues "{PROJECT_NAME}" plan` to see what's new
2. Run `/generate-linear-issues "{PROJECT_NAME}" update` to add missing issues
3. Manually update existing issue descriptions in Linear if specs changed

**Note:** Linear document versioning allows you to track changes to your Development Plan over time.
