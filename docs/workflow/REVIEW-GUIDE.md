# UAT Review Guide

> **User Acceptance Testing** - How to review and test agent work effectively.

## Purpose

This guide explains how to conduct User Acceptance Testing (UAT) reviews of work completed by AI agents. UAT focuses on verifying that the implementation satisfies requirements from a user's perspective, not code quality.

**Audience:** Human reviewers, project leads

**Time:** 5-15 minutes per review

---

## UAT Philosophy

### What UAT IS

UAT verifies that work enables the **intended user experience**:

- **Ontology correctness**: Does the data model match domain requirements?
- **UI/UX validation**: Does the interface work as users expect?
- **Data usage**: Does the feature use the right data in the right way?
- **User workflow**: Can users complete their tasks?
- **Business logic**: Do actions have correct effects?

### What UAT IS NOT

UAT does NOT review:

- **Code quality** (agents handle this via automated checks)
- **Code style** (enforced by linters)
- **TypeScript types** (verified by type checker)
- **Test coverage** (agents write tests, automated checks verify)
- **Performance optimizations** (unless requirements specify)

**Key principle:** Trust the agent on code quality. Focus on whether the feature works correctly from a user's perspective.

---

## Two-Stage Review Process

**IMPORTANT:** All PRs go through two review stages before merge:

### Stage 1: Automated PR Review (GitHub Claude)

**Happens automatically after `/create-pr`**

- **Who:** GitHub Claude integration
- **When:** 1-2 minutes after PR creation
- **Focus:** Code quality, patterns, potential bugs, security
- **Duration:** Automatic (instant)
- **Output:** Review comments on GitHub PR
- **Must handle before Human UAT**

**This catches:**
- Logic errors
- Security vulnerabilities
- Code quality issues
- Pattern violations
- Type safety problems

**See:** [DAILY-WORKFLOW.md](./DAILY-WORKFLOW.md) section "P1: PR Review Comments" for detailed handling

---

### Stage 2: Human UAT Review (You)

**Only begins after PR Review comments addressed**

- **Who:** Human reviewer (project lead)
- **When:** After GitHub Claude approves PR
- **Focus:** User experience, requirements satisfaction, business logic
- **Duration:** 5-20 minutes depending on track
- **Output:** Approve/merge or request changes

**This verifies:**
- Feature works as specified
- User workflows function correctly
- Data model matches requirements
- UI/UX meets expectations
- Business logic is correct

**This guide focuses on Stage 2 (Human UAT).**

---

## Human UAT Workflow

### Step 1: Verify PR Review Complete

**Before starting UAT:**

1. **Check GitHub PR status**
   - Look for GitHub Claude's review
   - Verify status is "Approved" or comments addressed
   - If unaddressed critical comments exist, send back for PR review iteration

2. **Don't UAT if PR review incomplete**
   - Wastes your time finding issues GitHub already flagged
   - Creates duplicate feedback
   - Slows overall throughput

**If PR has unaddressed comments:**
```
PR still has unaddressed review comments. Please handle those first via /address-pr-comments before UAT.
```

**Time:** 30 seconds to verify

---

### Step 2: Initial Review

**Once PR review is complete:**

1. **Open the Linear issue**
   - Read the issue description to understand objectives
   - Check acceptance criteria
   - Review linked specification and user story issues

2. **Find UAT instructions**
   - Agents add UAT instructions as a Linear comment
   - Comment will be titled "UAT Instructions" or similar
   - Instructions explain how to test the implementation

3. **Set up your environment**
   - Pull the feature branch: `git checkout TEAM-XXX-feature-name`
   - Install dependencies (if needed): `npm install`
   - Start dev server: `npm run dev`
   - Open browser to http://localhost:3000

4. **Follow UAT instructions step-by-step**
   - Execute each step exactly as written
   - Note any deviations from expected behavior
   - Take screenshots if issues found

**Time investment:** 5-10 minutes for first review

---

### Step 2: Evaluate the Work

**Check each aspect based on track:**

#### Track 1 (1-ONTOLOGY): Data Layer Review

**Focus areas:**
- **Schema correctness**: Fields match specification?
- **Relationships work**: Foreign keys, junction tables correct?
- **API endpoints respond**: CRUD operations work as expected?
- **Actions execute**: Business logic has correct effects?
- **Data validation**: Invalid inputs rejected with clear errors?

**Example checks:**
```bash
# Test API endpoint
curl http://localhost:5000/api/resources
curl -X POST http://localhost:5000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Resource","type":"room"}'

# Test action endpoint
curl -X POST http://localhost:5000/api/resources/123/activate
```

#### Track 2 (2-DESIGN-SYSTEM): UI Component Review

**Focus areas:**
- **Visual correctness**: Component looks right?
- **Interactive behavior**: Clicks, hovers, focus states work?
- **Responsive design**: Works on mobile, tablet, desktop?
- **Accessibility**: Keyboard navigation works? Screen reader labels present?
- **Error states**: Invalid inputs show helpful errors?

**Example checks:**
- Resize browser window (mobile → desktop)
- Tab through form fields (keyboard navigation)
- Submit with invalid data (error messages appear?)
- Check console for errors (F12 → Console tab)

#### Track 3 (3-TRACER-BULLETS): End-to-End Feature Review

**Focus areas:**
- **Complete user workflow**: Can user accomplish their goal?
- **Integration points**: UI components connect to API correctly?
- **Data flow**: Data appears where expected?
- **Error handling**: Graceful failures with user-friendly messages?
- **Edge cases**: Empty states, loading states, error states work?

**Example workflow:**
1. Navigate to feature page
2. Complete user task (e.g., "Create a resource")
3. Verify data persists (refresh page, data still there?)
4. Test related features (e.g., "Edit the resource")
5. Verify effects (e.g., "Deactivate resource" removes from list?)

---

### Step 3: Provide Feedback

**If issues found, provide specific, actionable feedback:**

#### Good Feedback Examples

**Example 1: Ontology Issue**
```
Issue: The /api/resources endpoint doesn't validate organizationId

Expected: POST requests without organizationId should return 400 Bad Request
Actual: Request succeeds and creates resource with null organizationId

Impact: Users can create resources not scoped to their organization

Fix: Add Zod validation requiring organizationId in insert schema
```

**Example 2: UI Issue**
```
Issue: Resource form doesn't show validation errors

Steps to reproduce:
1. Navigate to /resources/new
2. Leave "name" field empty
3. Click "Create"

Expected: Form shows "Name is required" error message
Actual: Form submits, API returns 400, but no user-facing error

Fix: Add error state handling in ResourceForm component
```

**Example 3: Workflow Issue**
```
Issue: Can't edit resource after deactivating

Steps to reproduce:
1. Create a resource
2. Click "Deactivate"
3. Try to click "Edit"

Expected: Can still edit deactivated resources (per spec TEAM-SPEC-005)
Actual: Edit button is disabled for deactivated resources

Fix: Remove disabled condition from Edit button
```

#### Bad Feedback Examples

❌ "This doesn't work" (too vague)
❌ "The code is messy" (not UAT concern)
❌ "Use async/await instead of .then()" (code quality, not UAT)
❌ "Add more comments" (not UAT concern)

---

### Step 4: Decide: Iterate or Approve

**Move to "In Progress" (iteration needed) if:**

- Functionality doesn't match requirements
- User workflows are broken
- API endpoints return wrong data
- UI components don't work as specified
- Business logic has incorrect behavior

**Move to "Done" (approved) if:**

- All acceptance criteria met
- User workflows work correctly
- Data model matches specification
- UI components function as expected
- Edge cases handled appropriately

**Gray areas (use judgment):**

- **Minor UI tweaks** (button placement, spacing): Usually acceptable unless spec is explicit
- **Performance concerns**: Only iterate if performance is unusably slow
- **Additional features**: Out of scope - create new issue instead
- **Code style preferences**: Not UAT concern - approve if functional

---

## Iteration Workflow

**Important:** Agents run locally via the `claude code` CLI on your machine. They do not automatically trigger from Linear status changes. You must explicitly invoke agents using commands like `/start-issue TEAM-XXX`.

### When You Request Changes

1. **Add detailed comment** in Linear issue with specific feedback
2. **Update issue status** to "In Progress"
3. **Return to claude code CLI** and delegate work back to agent via `/start-issue TEAM-XXX`
4. **Set expectation** for iteration cycle (agent work typically completes in minutes to hours)

**Example comment:**
```markdown
Requested changes:

1. **Issue**: Resource form doesn't validate organizationId
   - **Fix**: Add required validation to Zod schema
   - **Reference**: See lines 45-60 in shared/schema.ts for pattern

2. **Issue**: Deactivate action doesn't update UI
   - **Fix**: Trigger refetch after successful POST to /api/resources/:id/deactivate
   - **Reference**: See pattern in ItemList.tsx lines 78-85

I will invoke the agent via `/start-issue TEAM-XXX` to address these issues.
```

### When Agent Completes Iteration

1. **You invoke agent** via `claude` CLI with `/start-issue TEAM-XXX`
2. **Agent updates code** based on your feedback (runs on your local machine)
3. **Agent adds comment** explaining changes made in Linear
4. **Agent updates issue status** back to "In Review"
5. **You review again** (should be faster - verify fixes only)

**Iteration reviews typically take 3-5 minutes** since you're verifying specific fixes, not full re-review.

---

## Multi-Iteration Workflow

**If multiple iteration cycles are needed:**

### Iteration 1
- **You:** Review → Request changes (3 issues) → Update status to "In Progress"
- **You:** Run `/start-issue TEAM-XXX` in claude code CLI to invoke agent
- **Agent:** Fixes issues → Comments in Linear → Updates status to "In Review"
- **You:** Review again → 2 issues fixed, 1 persists, 1 new issue found

### Iteration 2
- **You:** Request changes (2 issues remaining) → Update status to "In Progress"
- **You:** Run `/start-issue TEAM-XXX` again to invoke agent
- **Agent:** Fixes remaining issues → Comments → Updates status to "In Review"
- **You:** Review → All issues resolved → Approve

**Best practices:**
- Provide all feedback at once (don't drip-feed)
- Be specific about expectations
- Reference examples from codebase
- Set clear success criteria

**When to escalate:**
- After 3 iterations with same issue
- Agent seems confused about requirements
- Use `/request-supervisor-help TEAM-XXX`

---

## Approval & Completion

### When You Approve Work

1. **Add approval comment** in Linear issue
2. **Merge the pull request** on GitHub
3. **Update issue status** to "Done" in Linear
4. **Verify newly unblocked issues** (check "Blocks" relations)

**Example approval comment:**
```markdown
UAT approved ✅

Verified:
- Resource CRUD endpoints work correctly
- Form validation catches invalid inputs
- Deactivate action updates UI immediately
- All acceptance criteria met

Merging PR #42 to main.
```

### After Merge

**The issue status change to "Done" will:**
- Automatically unblock dependent issues
- Move issue to "Done" column in project view
- Trigger PR close (if you merge via Linear)
- Update traceability chain

**Check for newly unblocked work:**
1. Go to Linear → Filter: `status: "Backlog" AND NOT has:blockedBy`
2. Review any issues that became ready to start
3. Move to "Todo" if truly ready
4. Delegate to agents via claude code CLI using `/start-issue TEAM-XXX`

---

## Common Review Scenarios

### Scenario 1: Work Exceeds Requirements

**Issue:** Agent implemented more than requested

**Example:** Issue asked for "list resources," agent also added "filter by type"

**Decision:**
- If addition is helpful and doesn't break anything → Approve
- If addition adds complexity or risk → Request removal, create new issue for enhancement
- If unsure → Ask agent to explain rationale in comment

### Scenario 2: Work Partially Complete

**Issue:** Some acceptance criteria met, others not

**Decision:**
- Request iteration to complete all criteria
- Don't approve partial work (creates ambiguity)
- If scope too large, split into multiple issues going forward

### Scenario 3: Breaking Changes

**Issue:** Work changes existing functionality

**Decision:**
- If breaking change was in specification → Approve
- If unintentional → Request fix
- If necessary but not specified → Create decision issue to document

### Scenario 4: Performance Issues

**Issue:** Feature works but is slow

**Decision:**
- If unusably slow (>3 sec for user action) → Request fix
- If acceptable but could be better → Create separate optimization issue
- If caused by test data volume → Note in comment, approve

### Scenario 5: UI Doesn't Match Design

**Issue:** UI works but looks different than expected

**Decision:**
- If specification had explicit UI design → Request changes
- If specification was vague → Decide if current UI is acceptable
- If minor differences → Usually approve (perfection not required)

---

## UAT by Track

### Track 1 (1-ONTOLOGY) Focus

**Primary checks:**
1. Schema fields match specification exactly
2. Relationships work (foreign keys, junction tables)
3. API endpoints return correct data shape
4. CRUD operations work (create, read, update, delete)
5. Actions have correct effects on data
6. Data validation rejects invalid inputs
7. Error messages are clear

**Tools:**
- API testing: `curl` or Postman
- Database inspection: Drizzle Studio (`npm run db:studio`)
- Manual testing via UI (if UI exists)

### Track 2 (2-DESIGN-SYSTEM) Focus

**Primary checks:**
1. Component renders correctly
2. Interactive elements work (buttons, inputs, dropdowns)
3. Responsive design (mobile, tablet, desktop)
4. Accessibility (keyboard navigation, labels)
5. Error states display helpful messages
6. Loading states show feedback
7. Component matches design system patterns

**Tools:**
- Browser DevTools (F12 → Elements, Console)
- Responsive mode (F12 → Toggle device toolbar)
- Keyboard-only navigation (Tab, Enter, Escape)
- Screen reader testing (optional but recommended)

### Track 3 (3-TRACER-BULLETS) Focus

**Primary checks:**
1. Complete user workflow functions
2. UI integrates with API correctly
3. Data flows from backend to frontend
4. Error handling at all integration points
5. Edge cases covered (empty states, loading, errors)
6. User can complete intended task
7. Feature satisfies user story acceptance criteria

**Tools:**
- Full user workflow testing (manual)
- Browser DevTools Network tab (verify API calls)
- Database inspection (verify data persists)
- Multiple user roles (if applicable)

---

## Review Checklist

Use this checklist for every review:

### Pre-Review
- [ ] Read issue description and acceptance criteria
- [ ] Review linked specification and user story
- [ ] Find UAT instructions comment
- [ ] Pull feature branch
- [ ] Start dev environment

### During Review
- [ ] Follow UAT instructions step-by-step
- [ ] Test happy path (expected workflow)
- [ ] Test error cases (invalid inputs, edge cases)
- [ ] Verify against acceptance criteria
- [ ] Check track-specific requirements

### Post-Review
- [ ] Document issues found with specific examples
- [ ] Provide actionable feedback
- [ ] Update issue status (In Progress or Done)
- [ ] Merge PR if approved
- [ ] Check for newly unblocked issues

---

## Time Management

**Target review times:**

| Track | First Review | Iteration Review |
|-------|--------------|------------------|
| 1-ONTOLOGY | 10-15 min | 5 min |
| 2-DESIGN-SYSTEM | 10-15 min | 5 min |
| 3-TRACER-BULLETS | 15-20 min | 5-10 min |

**If review takes much longer:**
- Issue scope may be too large (split into smaller issues next time)
- UAT instructions may be unclear (request clearer instructions)
- Testing environment may have setup issues (troubleshoot once)

---

## Related Documentation

- **Daily Workflow:** [DAILY-WORKFLOW.md](./DAILY-WORKFLOW.md) - When to conduct reviews
- **UAT Enablement:** [agent-system/UAT-ENABLEMENT.md](../agent-system/UAT-ENABLEMENT.md) - How agents prepare for UAT
- **Linear Workflow:** [reference/LINEAR-WORKFLOW.md](../reference/LINEAR-WORKFLOW.md) - Status transitions
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common review issues
- **Core Concepts:** [reference/CONCEPTS.md](../reference/CONCEPTS.md) - Issue types and tracks
