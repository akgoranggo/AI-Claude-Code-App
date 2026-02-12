# UAT Enablement Guide

> **Making Work Testable** - How agents enable User Acceptance Testing.

## Purpose

This guide defines how agents must enable User Acceptance Testing (UAT) for every Linear issue. UAT allows human reviewers to manually verify that implemented features work correctly before merging.

**Audience:** AI agents (primary), human reviewers (reference)

---

## Core Principle

**Every Linear issue MUST include UAT enablement.**

This means:

1. **Clear instructions** for how a human reviewer can test the feature
2. **The means** to perform that testing (UI pages, API endpoints, database access)
3. **Expected outcomes** for each test scenario

**UAT instructions are added as a Linear comment when work is complete.**

---

## UAT Requirements by Track

### Track 1: 1-ONTOLOGY (Schema, Storage, API)

#### What UAT Must Enable

Reviewers need to verify:
- Database schema matches specification
- Storage methods work correctly
- API endpoints respond properly
- Data validation works
- Error handling is correct

#### UAT Means Required

- Database migration/push commands
- API endpoints accessible via curl
- Drizzle Studio for database inspection
- Seed data (if needed)

#### UAT Template

````markdown
## UAT Instructions

### Prerequisites
```bash
npm run db:push       # Apply schema changes
npm run db:seed       # Load test data (if applicable)
npm run dev           # Start server
```

### Database Verification
1. Open Drizzle Studio: `npm run db:studio`
2. Navigate to `{table_name}` table
3. Verify:
   - [ ] Table exists with correct columns
   - [ ] Column types match specification
   - [ ] Foreign keys reference correct tables
   - [ ] Seed data appears correctly

### API Testing

#### List {Resources}
```bash
curl http://localhost:5000/api/{resources}
```
**Expected:** Returns JSON array of {resource} objects

#### Create {Resource}
```bash
curl -X POST http://localhost:5000/api/{resources} \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1", "field2": "value2"}'
```
**Expected:** Returns created {resource} with generated ULID

#### Get Single {Resource}
```bash
curl http://localhost:5000/api/{resources}/{id}
```
**Expected:** Returns single {resource} object or 404

#### Update {Resource}
```bash
curl -X PATCH http://localhost:5000/api/{resources}/{id} \
  -H "Content-Type: application/json" \
  -d '{"field1": "updated_value"}'
```
**Expected:** Returns updated {resource}

### Validation Testing
```bash
# Test missing required field
curl -X POST http://localhost:5000/api/{resources} \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected:** Returns 400 with validation error message

### Verification Checklist
- [ ] Database table exists with correct schema
- [ ] All API endpoints respond correctly
- [ ] Data validation rejects invalid inputs
- [ ] Error messages are clear
- [ ] Data persists correctly (refresh Drizzle Studio)
````

---

### Track 2: 2-DESIGN-SYSTEM (Components, UI)

#### What UAT Must Enable

Reviewers need to verify:
- Component renders without errors
- Visual styling is correct
- Interactive behavior works
- Responsive design adapts
- Accessibility standards met

#### UAT Means Required

- Component accessible via URL route
- Demo page showing component states
- Component used in context (actual page)
- Browser DevTools for inspection

#### UAT Template

````markdown
## UAT Instructions

### Prerequisites
```bash
npm run dev           # Start development server
```

### Component Access
**Option 1:** Navigate to demo page: `http://localhost:3000/dev/{component-name}`
**Option 2:** View in context: `http://localhost:3000/{feature-page}`

### Visual Verification
- [ ] Component renders without errors
- [ ] Styling matches specification
- [ ] All variants display correctly (primary, secondary, etc.)
- [ ] Colors use design tokens (no hardcoded values)
- [ ] Spacing is consistent with design system

### Interactive Testing

#### Click Interactions
1. Click interactive elements (buttons, links)
2. **Expected:** Visual feedback appears (hover, active states)
3. **Expected:** Actions trigger correctly

#### Keyboard Navigation
1. Press Tab to navigate through component
2. **Expected:** Focus indicators visible
3. **Expected:** Focus order makes sense
4. Press Enter/Space on focused elements
5. **Expected:** Actions trigger as expected

#### Form Inputs (if applicable)
1. Enter text in input fields
2. Submit with invalid data
3. **Expected:** Validation messages appear
4. **Expected:** Error states display clearly

### Responsive Testing
1. Open DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
2. Test on:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1280px width
3. Verify:
   - [ ] Layout adapts appropriately
   - [ ] Text remains readable
   - [ ] Touch targets minimum 44px
   - [ ] No horizontal scrolling (unless intentional)

### Accessibility Testing
1. Tab through component with keyboard only
2. **Expected:** All interactive elements reachable
3. **Expected:** Focus order logical
4. Check color contrast (DevTools > Accessibility tab)
5. **Expected:** Contrast ratio meets WCAG AA (4.5:1)

### Verification Checklist
- [ ] Component renders correctly
- [ ] All interactive states work (hover, focus, active, disabled)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Accessibility standards met
````

---

### Track 3: 3-TRACER-BULLETS (End-to-End Features)

#### What UAT Must Enable

Reviewers need to verify:
- Complete user workflow functions
- Data flows from UI to API to database
- All steps in workflow work correctly
- Error handling at all integration points
- Feature works on multiple devices

#### UAT Means Required

- Full page routes in application
- End-to-end user flows accessible
- Test data seeded (if needed)
- Network tab for API verification

#### UAT Template

````markdown
## UAT Instructions

### Prerequisites
```bash
npm run db:push       # Apply schema
npm run db:seed       # Load test data
npm run dev           # Start server
```

### Page Access
Navigate to: `http://localhost:3000/{page-path}`

### User Flow Testing

#### Happy Path: {Primary User Workflow}
1. Start at: `http://localhost:3000/{starting-page}`
2. Action: {what to do - e.g., "Click 'Create Resource' button"}
3. **Expected:** {what should happen - e.g., "Form appears"}
4. Action: {next step - e.g., "Fill in name: 'Test Resource'"}
5. **Expected:** {expected result}
6. Action: {continue workflow}
7. **Expected:** {final result - e.g., "Redirect to /resources, see 'Test Resource' in list"}

#### Error Path: {Invalid Input or Failure Scenario}
1. Action: {trigger error - e.g., "Submit form with empty required field"}
2. **Expected:** {error feedback - e.g., "Validation error appears: 'Name is required'"}
3. Action: {correct the error}
4. **Expected:** {successful outcome}

#### Edge Case: {Empty State or Special Condition}
1. Action: {create edge case - e.g., "Delete all resources"}
2. **Expected:** {appropriate handling - e.g., "Empty state message appears"}

### State Verification

#### Loading State
1. Open DevTools (F12) → Network tab
2. Enable "Slow 3G" throttling
3. Trigger data fetch (refresh or navigate)
4. **Expected:** Loading spinner/skeleton appears

#### Error State
1. Stop backend server (Ctrl+C in server terminal)
2. Trigger action requiring API
3. **Expected:** Error message displays gracefully
4. Restart server: `npm run dev`

### Data Integration
1. Open DevTools → Network tab
2. Perform workflow actions
3. Verify:
   - [ ] Correct API endpoints called
   - [ ] Request payloads are correct
   - [ ] Response data displays in UI
   - [ ] Data persists (refresh page, data still there)

### Mobile Testing
1. Open DevTools → Device Toolbar (Ctrl+Shift+M)
2. Select "iPhone 12 Pro" or similar mobile device
3. Repeat happy path workflow
4. Verify:
   - [ ] All elements visible and accessible
   - [ ] Touch targets work
   - [ ] Forms are usable
   - [ ] Navigation works

### Verification Checklist
- [ ] Complete user workflow functions end-to-end
- [ ] Happy path works without errors
- [ ] Error handling graceful at all steps
- [ ] Loading states appear during async operations
- [ ] Empty states display appropriately
- [ ] Data persists correctly
- [ ] Feature works on mobile and desktop
````

---

## Adding UAT Instructions to Linear

### When to Add

Add UAT instructions as a **Linear comment** when:
- Implementation is complete
- All automated checks pass (TypeScript, tests, lint)
- Ready to move issue to "In Review" status

### How to Add

1. **Create comment in Linear issue**
2. **Title:** "UAT Instructions"
3. **Content:** Use appropriate template for your track
4. **Customize:** Replace placeholders with actual values
5. **Test:** Verify instructions work before posting

**Example comment:**
```markdown
## UAT Instructions

### Prerequisites
... (follow template)
```

### What to Include

**Always include:**
- Prerequisites (commands to run)
- How to access feature (URL, navigation steps)
- Test scenarios (happy path, error path, edge cases)
- Expected outcomes for each step
- Verification checklist

**Never assume:**
- Reviewer knows how to access feature
- Reviewer knows what "correct" looks like
- Reviewer can figure out edge cases

**Make instructions reproducible:**
- Anyone should be able to follow and get same results
- No ambiguity about what to test
- Clear expected outcomes

---

## UAT Checklist for Agents

Before adding UAT instructions, verify:

### Track 1 (Ontology)
- [ ] Database migration/push command works
- [ ] Seed data script runs (if applicable)
- [ ] All API endpoints accessible
- [ ] Curl commands in instructions are correct
- [ ] Expected responses match actual responses
- [ ] Invalid inputs properly rejected

### Track 2 (Design System)
- [ ] Component accessible via URL or page
- [ ] All component states visible (hover, focus, disabled)
- [ ] Responsive behavior works (tested manually)
- [ ] Keyboard navigation works
- [ ] No console errors when component used

### Track 3 (Tracer Bullets)
- [ ] Full user workflow completable
- [ ] Seed data includes what's needed for testing
- [ ] All pages in workflow exist and route correctly
- [ ] Error states trigger appropriately
- [ ] Empty states display when expected
- [ ] Data persists after workflow completion

---

## Common Mistakes to Avoid

### 1. Vague Instructions

**Bad:**
```markdown
Test the feature by using the app.
```

**Good:**
```markdown
1. Navigate to http://localhost:3000/resources
2. Click "Create Resource" button
3. Expected: Form appears with name and type fields
```

---

### 2. Missing Prerequisites

**Bad:**
```markdown
## UAT Instructions
Navigate to /resources
```

**Good:**
```markdown
## UAT Instructions

### Prerequisites
```bash
npm run db:push
npm run db:seed
npm run dev
```

Navigate to http://localhost:3000/resources
```

---

### 3. No Expected Outcomes

**Bad:**
```markdown
1. Click the button
2. Fill in the form
```

**Good:**
```markdown
1. Click "Create Resource" button
2. **Expected:** Form modal opens
3. Fill in name: "Test Room"
4. Click "Save"
5. **Expected:** Redirect to /resources, "Test Room" appears in list
```

---

### 4. Not Testing Error Cases

**Bad:**
```markdown
(Only includes happy path)
```

**Good:**
```markdown
### Error Path: Invalid Input
1. Click "Create Resource"
2. Leave name field empty
3. Click "Save"
4. **Expected:** Validation error "Name is required" appears
```

---

### 5. Instructions Don't Work

**Bad:**
```markdown
Navigate to /demo/component
(Page doesn't actually exist)
```

**Good:**
```markdown
(Before posting UAT instructions, test them yourself to verify they work)
```

---

## Examples by Track

### Track 1 Example: Resource API

```markdown
## UAT Instructions

### Prerequisites
```bash
npm run db:push && npm run db:seed && npm run dev
```

### API Testing

#### Create Resource
```bash
curl -X POST http://localhost:5000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "Conference Room A", "type": "room", "organizationId": "01HXXX..."}'
```
**Expected:** Returns resource with generated ULID

#### List Resources
```bash
curl http://localhost:5000/api/resources
```
**Expected:** Array including "Conference Room A"

### Verification
- [ ] POST creates resource
- [ ] GET /api/resources lists all
- [ ] GET /api/resources/:id retrieves one
- [ ] Invalid POST returns 400
```

---

### Track 2 Example: ResourceCard Component

```markdown
## UAT Instructions

### Prerequisites
```bash
npm run dev
```

### Component Access
Navigate to: http://localhost:3000/resources

### Visual Verification
- [ ] Each resource displays in a card
- [ ] Card shows name, type, and active status
- [ ] Hover effect appears (shadow elevation)
- [ ] "Activate"/"Deactivate" button displays based on status

### Interactive Testing
1. Click "Deactivate" on active resource
2. **Expected:** Button becomes "Activate", card shows inactive state
3. Refresh page
4. **Expected:** State persists

### Mobile Testing
1. DevTools → Device Toolbar → iPhone 12 Pro
2. **Expected:** Cards stack vertically, touch targets 44px+
```

---

### Track 3 Example: Resource Management Flow

```markdown
## UAT Instructions

### Prerequisites
```bash
npm run db:push && npm run db:seed && npm run dev
```

### Complete Workflow

#### Create Resource
1. Navigate to http://localhost:3000/resources
2. Click "Create Resource"
3. **Expected:** Form modal opens
4. Fill in:
   - Name: "Test Room"
   - Type: "room"
5. Click "Create"
6. **Expected:** Modal closes, "Test Room" appears in list

#### Edit Resource
1. Click "Edit" on "Test Room"
2. Change name to "Updated Room"
3. Click "Save"
4. **Expected:** Name updates in list

#### Delete Resource
1. Click "Delete" on "Updated Room"
2. Confirm deletion
3. **Expected:** Resource removed from list

### Verification
- [ ] Can create, edit, and delete resources
- [ ] Changes persist after page refresh
- [ ] Error messages display for invalid inputs
```

---

## Related Documentation

- **Quick Start:** [QUICK-START.md](./QUICK-START.md) - When to add UAT instructions
- **Track Guides:** [tracks/](./tracks/) - Track-specific UAT requirements
- **Review Guide:** [workflow/REVIEW-GUIDE.md](../workflow/REVIEW-GUIDE.md) - How reviewers use UAT instructions
- **Validation:** [VALIDATION-CHECKLIST.md](./VALIDATION-CHECKLIST.md) - UAT enablement checks
