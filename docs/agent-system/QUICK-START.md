# Agent Quick Start Guide

> **Start Here** - Your first steps when assigned a Linear issue.

## You Are Starting an Issue

When you begin work on a Linear issue via `/start-issue TEAM-XXX`, follow this guide to orient yourself and start implementation efficiently.

---

## Step 1: Identify Your Track

Check the issue labels in Linear to determine which track you're on:

| Label | Track | Focus |
|-------|-------|-------|
| **1-ONTOLOGY** | Track 1 | Database schemas, storage methods, API endpoints |
| **2-DESIGN-SYSTEM** | Track 2 | UI components, design tokens, styling |
| **3-TRACER-BULLETS** | Track 3 | End-to-end features integrating Track 1 + Track 2 |

**Your track determines which patterns to follow and which guide to read next.**

---

## Step 2: Read Your Track Guide

Go directly to the track-specific guide:

- **Track 1:** [tracks/TRACK-1-ONTOLOGY.md](./tracks/TRACK-1-ONTOLOGY.md)
- **Track 2:** [tracks/TRACK-2-DESIGN-SYSTEM.md](./tracks/TRACK-2-DESIGN-SYSTEM.md)
- **Track 3:** [tracks/TRACK-3-TRACER-BULLETS.md](./tracks/TRACK-3-TRACER-BULLETS.md)

Each track guide contains:
- When to use this track
- Patterns to follow (with references to PATTERNS.md)
- Validation requirements
- Common pitfalls
- Examples

**Read your track guide completely before starting implementation.**

---

## Step 3: Review Core Documentation

Read these documents in order:

### 1. Issue Description
- Open the Linear issue
- Read objectives and acceptance criteria
- Check "Scope" section for what to implement
- Note "Files to Modify" and "Files NOT to Modify"
- Review linked specification and user story issues

### 2. Patterns
- [PATTERNS.md](./PATTERNS.md) - Code patterns to follow
- Your track guide will reference specific sections
- Follow patterns exactly - don't deviate without reason

### 3. Validation Checklist
- [VALIDATION-CHECKLIST.md](./VALIDATION-CHECKLIST.md) - Pre-completion checks
- Review before marking work complete
- All items must pass before moving to "In Review"

### 4. Agent Guide (Optional)
- [AGENT-GUIDE.md](./AGENT-GUIDE.md) - Core implementation principles
- Read if you need clarification on general practices
- Covers tool usage, code quality, error handling

---

## Step 4: Implementation Workflow

Follow this checklist:

### Before Starting
- [ ] Read track guide completely
- [ ] Read issue description and acceptance criteria
- [ ] Review linked specification issue
- [ ] Check PATTERNS.md for relevant patterns
- [ ] Verify no blocker issues remain

### During Implementation
- [ ] Follow patterns from PATTERNS.md exactly
- [ ] Implement all items in "Scope" section
- [ ] Write tests for new code
- [ ] Run `npm run check` (TypeScript)
- [ ] Run `npm run test` (tests)
- [ ] Keep issue scope focused (don't add extra features)

### Before Creating PR
- [ ] Run through VALIDATION-CHECKLIST.md
- [ ] All automated checks pass
- [ ] Tests written and passing
- [ ] All acceptance criteria met

### Create PR
- [ ] Create pull request via `/create-pr TEAM-XXX`
- [ ] Update issue status to "In Review"

### After PR Created
- [ ] Wait for GitHub Claude code review
- [ ] Address any PR comments via `/address-pr-comments TEAM-XXX`
- [ ] Iterate until GitHub Claude approves

### After PR Approval
- [ ] Prepare UAT instructions (see UAT-ENABLEMENT.md)
- [ ] Add UAT instructions as Linear comment via `/add-uat TEAM-XXX`
- [ ] Human reviewer conducts UAT
- [ ] Address any UAT feedback
- [ ] Merge when both code review and UAT approved

---

## Step 5: Prepare for UAT

Before marking work complete, you must enable User Acceptance Testing:

1. **Read:** [UAT-ENABLEMENT.md](./UAT-ENABLEMENT.md)
2. **Write UAT instructions** specific to your track
3. **Add as comment** to Linear issue
4. **Format:** Step-by-step instructions for human reviewer

**UAT instructions must enable the reviewer to verify your work without reading code.**

---

## Common Questions

### Q: What if requirements are unclear?

**A:** Ask clarifying questions in the Linear issue comments. Reference the specific part of the description that's ambiguous.

### Q: What if I'm stuck on a technical problem?

**A:** Use `/request-supervisor-help TEAM-XXX` to escalate for architectural guidance.

### Q: What if the issue scope seems too large?

**A:** Comment in Linear suggesting how to split into smaller issues. Wait for human guidance before proceeding.

### Q: What if I need to deviate from patterns?

**A:** Explain your reasoning in a Linear comment and ask for approval before deviating.

### Q: What if automated checks fail?

**A:** Fix the issues before marking work complete. Don't move to "In Review" with failing checks.

### Q: What files can I modify?

**A:** Check the issue's "Files to Modify" and "Files NOT to Modify" sections. When in doubt, ask in comments.

---

## Key Principles

**1. Follow Patterns Exactly**
- PATTERNS.md is your source of truth
- Don't reinvent patterns that already exist
- Copy and adapt from existing code

**2. Keep Scope Focused**
- Only implement what's in the issue scope
- Don't add "nice to have" features
- Create separate issues for enhancements

**3. Enable UAT**
- Every issue must enable testing
- UAT instructions must be reproducible
- Think from user's perspective, not code perspective

**4. Trust Automated Checks**
- TypeScript, tests, and lint are mandatory
- All must pass before "In Review"
- Don't compromise on code quality

**5. Communicate Proactively**
- Ask questions early (don't guess)
- Comment on progress regularly
- Explain decisions that deviate from patterns

---

## Reference Documentation

**Core Guides:**
- [AGENT-GUIDE.md](./AGENT-GUIDE.md) - Implementation principles
- [PATTERNS.md](./PATTERNS.md) - Code patterns
- [VALIDATION-CHECKLIST.md](./VALIDATION-CHECKLIST.md) - Pre-completion checks
- [UAT-ENABLEMENT.md](./UAT-ENABLEMENT.md) - Preparing for UAT

**Track Guides:**
- [tracks/TRACK-1-ONTOLOGY.md](./tracks/TRACK-1-ONTOLOGY.md)
- [tracks/TRACK-2-DESIGN-SYSTEM.md](./tracks/TRACK-2-DESIGN-SYSTEM.md)
- [tracks/TRACK-3-TRACER-BULLETS.md](./tracks/TRACK-3-TRACER-BULLETS.md)

**Reference Materials:**
- [../reference/CONCEPTS.md](../reference/CONCEPTS.md) - 6-phase workflow, issue types
- [../reference/COMMANDS.md](../reference/COMMANDS.md) - Slash commands
- [../reference/LINEAR-WORKFLOW.md](../reference/LINEAR-WORKFLOW.md) - Linear workflow

---

## Workflow Summary

```
1. Read Track Guide → 2. Read Issue + Specs → 3. Review Patterns
                                ↓
                    4. Implement Following Patterns
                                ↓
              5. Write Tests → 6. Run Checks → 7. Validate
                                ↓
                    8. Prepare UAT Instructions
                                ↓
                  9. Create PR → 10. Update Status
```

**Now go to your track guide and start implementation.**
