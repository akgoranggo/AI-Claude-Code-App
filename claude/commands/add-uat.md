# Add UAT Instructions

Add UAT (User Acceptance Testing) instructions to an existing Linear issue that's already in development.

## Usage

```
/add-uat {LINEAR_ISSUE_ID}
```

## Examples

- `/add-uat TEAM-001`
- `/add-uat TEAM-100`

## Instructions

When this command is invoked:

1. **Parse the Linear issue ID** from the command

2. **Read the Linear issue from Linear**:
   - Use Linear MCP `get_issue` to fetch the issue details
   - Extract description, scope, acceptance criteria

3. **Check if UAT instructions already exist**:
   - Use Linear MCP `list_comments` to check for existing UAT comments
   - If UAT instructions exist, report and offer to update/expand them
   - If missing, proceed to generate them

4. **Read the UAT Guide** for templates:
   - `docs/agent-system/UAT-ENABLEMENT.md`

5. **Analyze the Linear issue** to understand what needs UAT:
   - Read the Objective and Scope sections
   - Identify what was implemented (schema, API, component, page)
   - Read the Acceptance Criteria

6. **Analyze the implementation** (if code exists):
   - For 1-ONTOLOGY: Check `shared/schema.ts`, `server/storage.ts`, `server/routes.ts`
   - For 2-DESIGN-SYSTEM: Check `client/src/components/`
   - For 3-TRACER-BULLETS: Check `client/src/pages/`, `client/src/hooks/`
   - Identify actual endpoints, routes, and components created

7. **Generate UAT Instructions** appropriate to the track:

### For 1-ONTOLOGY Linear Issues

````markdown
## UAT Instructions

### Prerequisites

```bash
npm run db:push    # Apply schema changes
npm run db:seed    # Load test data (if applicable)
npm run dev        # Start development server
```
````

### Database Verification

1. Open Drizzle Studio: `npm run db:studio`
2. Navigate to the `{table_name}` table
3. Verify:
   - [ ] Table exists with correct columns
   - [ ] Column types match schema definition
   - [ ] Default values are applied correctly

### API Verification

#### List {Resource}

```bash
curl http://localhost:5000/api/{resource}
```

**Expected:** JSON array of {resource} objects

#### Get Single {Resource}

```bash
curl http://localhost:5000/api/{resource}/{id}
```

**Expected:** Single {resource} object, or 404 if not found

#### Create {Resource}

```bash
curl -X POST http://localhost:5000/api/{resource} \
  -H "Content-Type: application/json" \
  -d '{sample_json}'
```

**Expected:** Created {resource} with generated ID

### Verification Checklist

- [ ] Database table created with all specified columns
- [ ] GET list endpoint returns array
- [ ] GET single endpoint returns object or 404
- [ ] POST creates new record
- [ ] PATCH updates existing record
- [ ] Invalid data returns 400 with error message

````

### For 2-DESIGN-SYSTEM Linear Issues

```markdown
## UAT Instructions

### Prerequisites
```bash
npm run dev        # Start development server
````

### How to Access

Navigate to: http://localhost:3000/{demo-path-or-page-using-component}

### Visual Verification

1. Open the page in browser
2. Verify:
   - [ ] Component renders without errors
   - [ ] Styling matches design specifications
   - [ ] Colors use design tokens (inspect with DevTools)

### Interactive Testing

1. **Click/tap interactions:**
   - [ ] Buttons respond with visual feedback
   - [ ] Hover states appear on desktop

2. **Keyboard navigation:**
   - [ ] Tab focuses interactive elements
   - [ ] Focus ring is visible

### Responsive Testing

1. Open DevTools > Device Toolbar
2. Test at tablet size (768px)
3. Verify:
   - [ ] Layout adapts appropriately
   - [ ] Touch targets are minimum 44px

### Verification Checklist

- [ ] Component renders correctly
- [ ] All variants/states work
- [ ] Responsive design works
- [ ] Accessibility basics (focus, labels)

````

### For 3-TRACER-BULLETS Linear Issues

```markdown
## UAT Instructions

### Prerequisites
```bash
npm run db:push    # Apply any schema changes
npm run db:seed    # Load test data
npm run dev        # Start development server
````

### How to Access

Navigate to: http://localhost:3000/{page-path}

### User Flow Testing

#### Flow 1: {Primary Flow Name}

1. Navigate to {starting point}
2. {Action step}
3. **Expected:** {Expected result}
4. {Next action}
5. **Expected:** {Expected result}

#### Flow 2: {Secondary Flow Name}

1. {Steps...}

### State Testing

#### Loading State

1. Open DevTools > Network > Slow 3G
2. Refresh page
3. **Expected:** Loading indicator appears

#### Empty State

1. {How to trigger empty state}
2. **Expected:** Empty state message with appropriate guidance

#### Error State

1. Stop backend server
2. Trigger data fetch
3. **Expected:** Error message displays gracefully

### Verification Checklist

- [ ] Page loads with data
- [ ] Primary user flow works end-to-end
- [ ] Loading state displays
- [ ] Empty state displays
- [ ] Error handling works
- [ ] Mobile/tablet layout works

```

8. **Add the UAT instructions** as a comment to the Linear issue:
   - Use Linear MCP `create_comment` to add UAT instructions
   - Include all sections: Prerequisites, Access, Scenarios, Checklist

9. **Report what was added**

## Output Format

```

## UAT Instructions Added: {LINEAR_ISSUE_ID}

**Track:** {1-ONTOLOGY | 2-DESIGN-SYSTEM | 3-TRACER-BULLETS}

**Implementation Detected:**

- {What was found in the codebase}

**UAT Section Added:**

- Prerequisites: {X commands}
- Access Path: {URL or command}
- Test Scenarios: {X scenarios}
- Verification Items: {X checklist items}

**Location:** Added as comment to Linear issue

### Next Steps

- [ ] Review generated UAT instructions for accuracy
- [ ] Test the UAT instructions yourself
- [ ] Adjust any endpoints, URLs, or commands as needed
- [ ] Run `/validate-issue {LINEAR_ISSUE_ID}` when ready

```

## Customization

After generating UAT instructions, you should:

1. **Verify URLs/paths** match actual implementation
2. **Add specific test data** if needed
3. **Add edge cases** specific to your implementation
4. **Update sample curl payloads** with real field names

## Related Commands

- `/validate-issue` - Validates UAT section exists
- `/start-issue` - Starts Linear issue (reminds about UAT)
- `/write-tests` - Generate automated tests

## Related Files

- @docs/agent-system/UAT-ENABLEMENT.md - Complete UAT templates and examples
```
