# High-Intensity Parallel Development Workflow

> **Orchestration Strategy** - Managing 8+ AI agents in parallel with minimal dead time.

## Purpose

This guide describes how to orchestrate multiple AI agents working in parallel, maximize throughput, minimize context-switching overhead, and actively shepherd agents through development stages.

**Audience:** Project leads actively orchestrating AI agents

**Reality:** You're managing 8+ agents at different stages simultaneously, running slash commands to progress them through implementation → testing → validation → PR creation, context-switching rapidly between terminals, and coordinating their progression through the development pipeline.

---

## Core Principle: Maximize Agent Throughput

**The goal is continuous agent productivity through active pipeline management.**

### Key Mindset Shifts

- **Always have agents running** - If you have capacity, start another agent
- **Actively progress agents through stages** - Run commands to move them forward
- **Respond to interrupts immediately** - Agent questions block progress
- **Review progressively, not in batches** - UAT as soon as agents complete
- **Context switch efficiently** - Linear dashboard is your source of truth
- **Pipeline management** - Track which stage each agent is in, advance them systematically

### What This Feels Like

You're **actively managing a multi-stage development pipeline** with:
- 8+ Claude Code terminal instances at different pipeline stages
- Multiple git worktrees with different branches
- Agents at different stages: implementing → testing → validating → creating PR → waiting for review
- Constant terminal scanning to see which agents finished their current stage
- Running slash commands to progress agents to next stage
- Context switching between terminals to shepherd progress
- Rapid-fire decision making about priorities
- Progressive UAT reviews as agents complete validation

**This is intense, active work requiring sustained focus for 2-6 hour blocks.**

---

## Agent Development Pipeline

**Understanding the stages agents progress through:**

```
/start-issue → Implementing → /write-tests → Testing → /run-tests → Passed?
                                                                        ↓
                                                                       YES
                                                                        ↓
                              /validate-issue → Validated?
                                                      ↓
                                                     YES
                                                      ↓
                              /create-pr → PR Created → Update status "In Review"
                                                ↓
                                        GitHub Claude Review
                                                ↓
                                          Has Comments?
                                                ↓
                                               YES → Triage → /address-pr-comments → Re-Review
                                                ↓                                         ↓
                                               NO ←──────────────────────────────────────┘
                                                ↓
                                        (Code Approved)
                                                ↓
                                    /add-uat → UAT Instructions Added
                                                ↓
                                          Human UAT Review
                                                ↓
                                          Changes Needed?
                                                ↓
                                        YES → Agent Fixes → Push → GitHub Re-Review → Loop
                                                ↓
                                               NO
                                                ↓
                                    Merge → Done → /start-issue (next)
```

**Each stage requires you to run a command to progress the agent forward.**

Agents don't run continuously - they complete a stage and wait for your next command.

**Two critical gates:**
1. **GitHub Claude Review** - Code must pass automated review before UAT instructions are added
2. **Human UAT** - Feature must work correctly before merge

**Any changes during UAT automatically trigger GitHub Claude re-review before merge.**

---

## Session Structure

### Three Phases of a Development Session

```
Launch Phase (20-30 min)
    ↓
Active Pipeline Management (2-6 hours)
    ↓
Shutdown Phase (15-20 min)
```

---

## Launch Phase (20-30 min)

**Goal:** Get 8+ agents actively implementing as quickly as possible.

### Pre-Session Preparation

**Before opening any terminals:**

1. **Open Linear workspace** in browser
2. **Review project boards** - Identify ready-to-start issues
3. **Plan initial assignments** - Decide which 8-10 issues to start
4. **Check dependencies** - Verify no unexpected blockers appeared overnight
5. **Prioritize** - Order by: unblocks others > high priority > balanced across tracks

**Decision:** Which issues to start first?
- Look for: `status: "Todo" AND NOT has:blockedBy`
- Balance: 2-3 Track 1, 2-3 Track 2, 2-3 Track 3 (if dependencies met)
- Spread: Different features to minimize merge conflicts

**Time:** 5 minutes

---

### Rapid Agent Deployment

**Launch agents in parallel as fast as possible:**

```powershell
# Terminal 1
/start-issue ENG-101

# Terminal 2 (open new window while Terminal 1 agent works)
/start-issue ENG-102

# Terminal 3
/start-issue FRONTEND-45

# ... continue until 8+ agents running
```

**Pattern:**
1. Open terminal, run `/start-issue TEAM-XXX`
2. While agent 1 fetches issue and starts implementing, open new terminal
3. Start agent 2, open new terminal
4. Continue until all planned issues started

**Time:** 15-20 minutes for 8 agents

---

### Terminal Organization

**Critical for efficient context switching:**

#### Naming Strategy

Name each terminal window/tab with the issue ID:
- `ENG-101 - Resource CRUD`
- `FRONTEND-45 - ResourceList component`
- `INT-12 - Resource feature integration`

**How to name terminals:**
- **Windows Terminal:** Right-click tab → Rename
- **PowerShell:** Set window title: `$host.ui.RawUI.WindowTitle = "ENG-101"`
- **VS Code:** Terminal split names
- **tmux:** Rename pane: `Ctrl+b ,`

#### Layout Strategy

**Option 1: Tiled Windows**
- 4x2 grid of terminal windows on ultrawide monitor
- See all agents at once
- Good for: Monitoring overall progress

**Option 2: Tabbed Terminals**
- One terminal app with 8+ tabs
- Switch with Ctrl+Tab or hotkeys
- Good for: Focused work on one agent at a time

**Option 3: Multiple Virtual Desktops**
- Desktop 1: Linear dashboard + 2-3 terminals
- Desktop 2: 3-4 terminals
- Desktop 3: 3-4 terminals
- Good for: Separating tracks or feature areas

**Choose based on your monitor setup and preference.**

---

### Launch Checklist

- [ ] Linear workspace open in browser
- [ ] 8-10 issues identified and prioritized
- [ ] All terminals named with issue IDs
- [ ] All agents started with `/start-issue`
- [ ] Linear shows all issues in "In Progress" status
- [ ] Pipeline tracking ready (spreadsheet, notepad, or mental model)

**End state:** 8+ agents actively implementing, you're ready to manage the pipeline.

---

## Active Pipeline Management (2-6 hours)

**This is where the real work happens.**

You're now managing 8+ parallel agents through development stages. Your job is to:
1. Track which stage each agent is in
2. Progress agents to next stage when ready
3. Respond to questions and errors immediately
4. Review completed work progressively
5. Assign new work when agents complete

---

### The Pipeline Management Loop

**Repeat this cycle continuously:**

```
1. Pipeline Scan (2-3 min)
      ↓
2. Identify Actions Needed (30 sec)
      ↓
3. Execute Highest Priority Actions (5-30 min)
      ↓
4. Update Tracking (30 sec)
      ↓
[Repeat]
```

---

### 1. Pipeline Scan (2-3 min)

**Scan all agents to determine their current stage:**

#### Terminal Scan Strategy

**Quickly check each terminal (15-30 sec per agent):**

1. **Alt+Tab to terminal** (or click tab)
2. **Scroll to most recent output**
3. **Categorize agent state:**
   - 🔄 **Implementing** - Agent is actively writing code
   - ✅ **Implementation Done** - Agent finished, ready for `/write-tests`
   - 🧪 **Writing Tests** - Agent is writing tests
   - ✅ **Tests Written** - Agent finished, ready for `/run-tests`
   - 🔍 **Validating** - Agent running validation checklist
   - ✅ **Validation Done** - Agent finished, ready for `/add-uat`
   - 📝 **UAT Ready** - UAT instructions added, ready for `/create-pr`
   - 📋 **PR Created** - Pull request created, awaiting GitHub review
   - 🤖 **PR Under Review** - GitHub Claude reviewing code
   - 💬 **PR Has Comments** - Review comments need triage (high priority)
   - 🔧 **Addressing PR Comments** - Agent fixing review issues
   - ✅ **PR Approved by GitHub** - Ready for human UAT
   - ❓ **Questioning** - Agent asking for clarification
   - ❌ **Errored** - Agent hit an error
   - ⏸️ **Iterating UAT** - Agent addressing human UAT feedback

4. **Note what action is needed** for each agent

**Time:** 2-3 minutes for 8 agents

#### Pipeline Tracking

**Keep a mental model or quick note:**

```
ENG-101: ✅ Implementation Done → Run /write-tests
ENG-102: 🔄 Implementing → Wait
FRONTEND-45: ❓ Questioning → Answer question
ENG-103: 🧪 Writing Tests → Wait
FRONTEND-46: ✅ Tests Written → Run /run-tests
INT-12: 📋 PR Created → Human UAT needed
ENG-104: ✅ Validation Done → Run /add-uat
FRONTEND-47: 🔄 Implementing → Wait
```

**This quick scan tells you exactly what to do next.**

---

### 2. Identify Actions Needed (30 sec)

**Based on pipeline scan, build priority stack:**

| Priority | State | Action | Impact |
|----------|-------|--------|--------|
| **P0 - Immediate** | ❓ Questioning | Answer immediately | Unblocks agent |
| **P0 - Immediate** | ❌ Errored | Debug and fix | Prevent wasted work |
| **P1 - High** | 💬 PR Has Comments | Triage review comments | Unblock PR approval, prevent rework |
| **P1 - High** | ✅ PR Approved by GitHub | Human UAT review | Unblock dependencies, free capacity |
| **P2 - Medium** | ✅ Stage Complete | Run next command | Keep agent moving |
| **P3 - Low** | 🔄 Actively Working | Monitor progress | Catch issues early |
| **P4 - Background** | All agents busy | Brief planning | Prepare next moves |

**Decision:** What to do next? **Always handle highest priority item first.**

**Note:** PR review comments must be triaged before human UAT. Don't skip to UAT if GitHub Claude found issues.

---

### 3. Execute Highest Priority Actions

#### P0: Agent Asking Question

**When an agent needs clarification:**

1. **Switch to that terminal**
2. **Read the question** carefully (don't skim)
3. **Check context** - Review Linear issue, spec, user story
4. **Provide specific answer** - Not "figure it out" but actionable guidance
5. **Update Linear** if question reveals ambiguous requirements

**Example:**
```
Agent: "Should the Resource.status field allow null values or default to 'active'?"

Bad response: "Whatever makes sense"
Good response: "Default to 'active' per TEAM-SPEC-005, line 23. Add .notNull().default('active') to schema."
```

**Time:** 3-5 minutes
**Goal:** Unblock agent immediately, prevent back-and-forth

**Next:** Agent continues current stage, you return to pipeline scan

---

#### P0: Agent Errored

**When an agent hits an error:**

1. **Switch to that terminal**
2. **Read the error message** completely
3. **Check recent changes** - Did another agent introduce a breaking change?
4. **Verify environment** - Is dev server running? Database accessible?
5. **Provide fix or guidance** - Specific solution, not "debug it"

**Common errors:**
- **Type errors:** Another agent changed a type - coordinate fix
- **Database errors:** Migration needed - run `npm run db:push`
- **Import errors:** File moved/renamed - update imports across agents
- **Merge conflicts:** Multiple agents editing same file - resolve immediately

**Time:** 5-15 minutes
**Goal:** Get agent back to productive work

**Next:** Agent resumes current stage, you return to pipeline scan

---

#### P1: PR Review Comments (GitHub Claude Review)

**When GitHub Claude has reviewed a PR and left comments:**

**This is a critical gate. Don't proceed to Human UAT until PR review issues are addressed.**

**Why it matters:**
- Automated review catches issues humans would find anyway
- Faster iteration (minutes vs hours for human review)
- Improves code quality before human eyes see it
- Prevents wasted UAT time on code that needs fixes

**Workflow:**

##### Step 1: Check for PR Comments (1-2 min after PR creation)

After running `/create-pr` and `/update-status in-review`:

1. **Wait 1-2 minutes** for GitHub Claude to review
2. **Check GitHub PR** for review comments
3. **Categorize status:**
   - ✅ **No comments / Approved** → Proceed to Human UAT
   - 💬 **Has comments** → Triage needed (continue below)

**Time:** 1-2 minutes

---

##### Step 2: Triage Review Comments (3-5 min)

**Read all PR review comments and categorize each:**

**Category A: Critical Issues (Must address before merge)**
- Security vulnerabilities
- Logic errors or bugs
- Incorrect implementation of requirements
- Breaking changes
- Type safety violations

**Category B: Code Quality Issues (Should address now)**
- Code duplication
- Poor error handling
- Missing validation
- Inconsistent patterns
- Performance concerns

**Category C: Style/Minor Issues (Can defer)**
- Formatting nitpicks
- Variable naming preferences
- Comment suggestions
- Minor refactorings

**Category D: Out of Scope (Create separate issues)**
- Suggested enhancements beyond current requirements
- "While you're here" refactorings
- Feature additions

**Time:** 3-5 minutes to read and categorize

---

##### Step 3: Decide How to Proceed

**Three decision paths:**

**Path 1: Address All Comments (Default approach)**

Use this when:
- Most comments are Category A or B
- Total fix time < 30 minutes estimated
- Comments are clear and actionable

**Action:**
```bash
/address-pr-comments ENG-101
```

**Agent will:**
1. Read all PR review comments
2. Make changes to address each one
3. Push updated code to PR branch
4. GitHub Claude will re-review automatically
5. Agent reports when complete

**Time:** 5-30 minutes depending on comment complexity

**Next:** Wait for re-review, check for new comments, repeat if needed

---

**Path 2: Address Some, Defer Others**

Use this when:
- Mix of critical (A/B) and minor (C/D) comments
- Some comments are out of scope
- Want to merge critical fix quickly

**Action:**
```
Let's address the critical issues now. For comments 3, 5, and 7:
- Comment 3: Skip, out of scope for this issue
- Comment 5: Will create separate issue ENG-XXX to track
- Comment 7: Style nitpick, can defer

/address-pr-comments ENG-101 [provide specific guidance on which to address]
```

**Agent will:**
1. Address only the specified comments
2. Respond to other comments explaining deferral
3. Create Linear issues for deferred items (if needed)
4. Push updated code

**Time:** 5-20 minutes

**Manual follow-up:**
- Create Linear issues for deferred comments
- Link them to current issue
- Add to backlog with appropriate priority

---

**Path 3: Ignore/Defer All Comments**

Use this when:
- All comments are minor (Category C)
- Comments are stylistic preferences
- Comments require significant refactoring beyond issue scope
- Time pressure to deliver critical fix

**Action:**
```
These comments are all minor style issues. Creating tracking issue ENG-XXX to address as cleanup.
```

**You do:**
1. Respond to each comment on GitHub explaining deferral
2. Create Linear issue to track cleanup
3. Link to original issue and PR
4. Proceed to Human UAT

**Time:** 3-5 minutes

**Warning:** Use sparingly. Habitually deferring code quality issues creates technical debt.

---

##### Step 4: Handle Re-Review Cycle

**After agent addresses comments:**

1. **GitHub Claude re-reviews automatically**
2. **Check for new comments** (1-2 min wait)
3. **Repeat triage if new issues found**
4. **Loop until approved or deferred**

**Typical iteration:**
- Round 1: Address 5 comments → Re-review finds 2 new issues
- Round 2: Address 2 comments → Re-review approves
- **Total time:** 10-40 minutes

---

##### Step 5: Proceed to Human UAT

**Only proceed when:**
- ✅ GitHub Claude approved PR, OR
- 📝 You've explicitly decided to defer remaining comments and documented why

**Don't skip to Human UAT with unaddressed critical comments.** It wastes reviewer time.

---

##### Common Scenarios

**Scenario 1: Clean PR (No Comments)**

```
[Pipeline scan shows PR created]
[Check GitHub after 2 min]
GitHub Claude: ✅ Approved
→ Proceed directly to Human UAT
```

**Time:** 2 minutes

---

**Scenario 2: Minor Issues (Quick Fix)**

```
[Pipeline scan shows PR created]
[Check GitHub after 2 min]
GitHub Claude: 💬 3 comments (all code quality)
[Triage: All valid, quick fixes]
→ /address-pr-comments ENG-101
[Agent fixes in 10 min, pushes]
[GitHub re-reviews]
GitHub Claude: ✅ Approved
→ Proceed to Human UAT
```

**Time:** 15 minutes total

---

**Scenario 3: Major Issues (Longer Iteration)**

```
[Pipeline scan shows PR created]
[Check GitHub after 2 min]
GitHub Claude: 💬 7 comments (logic errors, validation missing)
[Triage: Critical issues, need fixing]
→ /address-pr-comments ENG-101
[Agent fixes in 25 min, pushes]
[GitHub re-reviews]
GitHub Claude: 💬 2 new comments (edge cases)
→ /address-pr-comments ENG-101
[Agent fixes in 10 min, pushes]
[GitHub re-reviews]
GitHub Claude: ✅ Approved
→ Proceed to Human UAT
```

**Time:** 45 minutes total (but saved hours of human UAT iteration)

---

**Scenario 4: Mixed Issues (Selective Addressing)**

```
[Pipeline scan shows PR created]
[Check GitHub after 2 min]
GitHub Claude: 💬 6 comments
[Triage: 3 critical, 2 style, 1 out-of-scope]
→ /address-pr-comments ENG-101
   "Address comments 1, 2, 3 (critical issues).
    Skip 4, 5 (style - create issue ENG-XXX).
    Skip 6 (out of scope for this PR)."
[Agent addresses 3 critical, responds to others]
[Create Linear issue ENG-XXX for deferred items]
[GitHub re-reviews]
GitHub Claude: ✅ Approved
→ Proceed to Human UAT
```

**Time:** 20 minutes + 5 min to create tracking issue

---

##### Tracking PR Review Status

**Add to your pipeline tracking:**

```
ENG-101: 💬 PR Has Comments (3 comments, triaging...)
ENG-102: 🔧 Addressing PR Comments (agent working...)
ENG-103: ✅ PR Approved (ready for human UAT)
```

**Update as you progress through review cycles.**

---

##### Best Practices

**DO:**
- ✅ Check for PR comments 1-2 min after `/create-pr`
- ✅ Address critical (A/B) comments immediately
- ✅ Triage comments before deciding to address
- ✅ Document why you're deferring comments
- ✅ Create tracking issues for deferred work
- ✅ Wait for re-review after each fix cycle

**DON'T:**
- ❌ Skip to Human UAT with unaddressed critical comments
- ❌ Ignore all comments without triaging
- ❌ Address comments manually (use `/address-pr-comments`)
- ❌ Merge PRs with GitHub Claude's "Request Changes" status
- ❌ Defer Category A (critical) issues

---

##### Time Investment

**Typical time per PR:**
- Clean PR (no comments): 2 minutes
- Minor issues (1-3 comments): 10-20 minutes
- Moderate issues (4-7 comments): 20-40 minutes
- Major issues (8+ comments): 40-60 minutes

**ROI:** Every minute spent here saves 3-5 minutes in Human UAT iteration.

---

#### P1: Human UAT Review (PR Approved by GitHub)

**When an agent has completed all pre-UAT stages:**

**Don't defer this.** Review immediately to:
- Unblock dependent issues
- Free up agent capacity for new work
- Provide feedback while context is fresh

**Quick UAT Process:**

1. **Switch to agent's terminal**
2. **Find UAT instructions** (agent added as Linear comment)
3. **Check out agent's branch** (likely already in worktree)
4. **Follow UAT steps** exactly as written
5. **Decide: Approve or Request Changes**

**Time budgets:**
- Track 1 (API): 5-10 minutes
- Track 2 (UI): 10-15 minutes
- Track 3 (Feature): 15-20 minutes

**If approved:**
```
1. Comment approval in Linear
2. Merge PR
3. Update status to "Done"
4. Check for newly unblocked issues
5. Immediately assign agent to next issue: /start-issue ENG-XXX
```

**If changes needed:**
```
1. Comment specific feedback in Linear
2. Update status to "In Progress"
3. Agent will iterate (stays on same issue)
```

**See:** [REVIEW-GUIDE.md](./REVIEW-GUIDE.md) for detailed UAT process

**Time:** 10-20 minutes (don't rush, but don't batch)
**Goal:** Clear "In Review" queue continuously, keep agents moving

---

#### P2: Agent at Stage Boundary (Ready for Next Command)

**When an agent completes a pipeline stage:**

These are the most common transitions:

##### Agent Finished Implementation → Run Tests

**Agent says:** "Implementation complete. Ready for testing."

**You do:**
```
/write-tests ENG-101
```

**Agent will:** Write tests for the implementation

**Time:** 30 seconds to issue command
**Wait time:** 5-15 minutes while agent writes tests

---

##### Agent Finished Writing Tests → Run Tests

**Agent says:** "Tests written. Ready to run."

**You do:**
```
/run-tests
```

**Agent will:** Run tests and report results

**Time:** 30 seconds to issue command
**Wait time:** 1-5 minutes while tests run

**If tests fail:**
- Agent reports failures
- You decide: Fix tests? Fix code? Both?
- Agent iterates until tests pass

---

##### Tests Passed → Validate

**Agent says:** "All tests passing."

**You do:**
```
/validate-issue ENG-101
```

**Agent will:** Run through VALIDATION-CHECKLIST.md systematically

**Time:** 30 seconds to issue command
**Wait time:** 5-10 minutes while agent validates

**If validation fails:**
- Agent reports issues found
- You decide: Fix immediately or iterate?
- Agent addresses issues until validation passes

---

##### Validation Passed → Add UAT Instructions

**Agent says:** "Validation complete. All checks passed."

**You do:**
```
/add-uat ENG-101
```

**Agent will:** Write step-by-step UAT instructions as Linear comment

**Time:** 30 seconds to issue command
**Wait time:** 3-5 minutes while agent writes UAT

---

##### UAT Instructions Added → Create PR

**Agent says:** "UAT instructions added to Linear."

**You do:**
Complete each of the validation steps yourself to verify. If any fail, are missing details, or are unclear, provide feedback in Linear and have agent iterate. Once UAT instructions are solid and you can complete them successfully, run:
```
/create-pr ENG-101
```

**Agent will:** Create GitHub PR with traceability links, summary, test plan

**Time:** 30 seconds to issue command
**Wait time:** 2-3 minutes while agent creates PR

---

##### PR Created → Update Status → GitHub Review

**Agent says:** "Pull request created: #42"

**You do:**
```
/update-status ENG-101 in-review
```

**Agent will:** Update Linear issue to "In Review" status

**Time:** 30 seconds to issue command

**Next:**
1. **Wait 1-2 minutes** for GitHub Claude to review PR
2. **Check GitHub PR** for review comments
3. **If comments exist** → Triage and address (see "P1: PR Review Comments" section above)
4. **If approved** → Proceed to Human UAT
5. **Agent terminal can be reassigned** to next issue while you wait for reviews

---

#### P3: Agent Actively Working

**When an agent is in the middle of a stage:**

**Usually: Do nothing.** Let agent work.

**Optionally: Monitor progress** if you're concerned:
- Skim recent output
- Check for warning signs (repeated errors, confusion)
- Verify agent is on track with spec

**Time:** 1-2 minutes
**Goal:** Catch issues early, but don't micromanage

---

#### P4: All Agents Busy

**When all agents are actively working and don't need intervention:**

**This is rare but happens.** Use this time for:

##### Quick Planning (5-10 min)

- **Queue next issues** - Identify 3-5 ready-to-start issues from Linear
- **Prioritize** - Order them by importance and dependencies
- **Check for blockers** - Ensure specs are ready, dependencies met

When agents complete, you'll know exactly what to assign next.

##### Brief Research (10-15 min)

- **Investigate technical unknowns** - Answer questions before agents hit them
- **Evaluate libraries** - Research tools agents might need
- **Prototype risky approaches** - Validate assumptions

Keep it brief and interruptible.

##### Environment Maintenance (5 min)

- **Pull latest main** - Keep your main branch updated
- **Check database state** - Verify migrations applied
- **Monitor test output** - If tests running in background

**Don't get deep into work** - agents will need you soon.

---

### Pipeline Management Strategy

**How to efficiently progress 8 agents:**

#### Batch Similar Commands

**When multiple agents are at the same stage:**

```
ENG-101: ✅ Implementation Done → Run /write-tests
ENG-103: ✅ Implementation Done → Run /write-tests
ENG-106: ✅ Implementation Done → Run /write-tests
```

**Efficient approach:**
1. Switch to ENG-101 terminal → `/write-tests ENG-101`
2. Switch to ENG-103 terminal → `/write-tests ENG-103`
3. Switch to ENG-106 terminal → `/write-tests ENG-106`
4. All three now writing tests in parallel

**Time:** 2-3 minutes to progress all three

**Benefit:** Maximize parallelism, minimize context switching

---

#### Stagger Agent Starts

**Don't start all 8 agents simultaneously.**

**Better approach:** Stagger by 2-3 minutes
- Start agents 1-2
- Wait 2 min, start agents 3-4
- Wait 2 min, start agents 5-6
- Wait 2 min, start agents 7-8

**Why:** Prevents all agents hitting stage boundaries simultaneously, which would overwhelm you with commands to run.

**Result:** Continuous flow of stage completions instead of synchronized waves

---

#### Track Dependencies Between Agents

**If Agent B needs Agent A's work:**

```
ENG-101 (Track 1 API) → Must complete before INT-12 (Track 3 feature)
```

**Priority:** Progress ENG-101 faster through stages
- Run its commands immediately when ready
- Don't let it wait
- UAT it as soon as PR created

**Result:** Unblock INT-12 sooner

---

### Context Switching Protocol

**You'll switch terminals constantly. Make it efficient:**

#### Quick Context Recovery

**When switching to a terminal:**

1. **Read terminal title** - `ENG-101 - Resource CRUD API`
2. **Scroll to latest output** - See where agent is
3. **Check for questions** - Any prompts waiting?
4. **Identify stage** - Implementing? Testing? Validating?
5. **Determine action** - What command to run next?

**Recovery time target:** 20-30 seconds to decide what to do

---

#### Terminal Navigation Shortcuts

**Keyboard-driven workflow:**

- `Ctrl+Tab` - Next terminal
- `Ctrl+Shift+Tab` - Previous terminal
- `Alt+1`, `Alt+2`, etc. - Jump to specific terminal (if configured)
- `Ctrl+Shift+T` - New terminal

**Goal:** Never use mouse to switch terminals. Too slow.

---

### Context Window Management

**Agents have limited context windows. Watch for warnings.**

#### When Agents Approach Limits

**Signs:**
- "Approaching context limit" warnings
- Slower responses
- Degraded output quality

**Common in:**
- Long implementation sessions (>90 minutes on one issue)
- Complex issues with many iterations
- Issues requiring extensive file reading

#### Handle Context Limits

**Option 1: Summarize and Continue**

```
Please summarize our progress and I'll continue with fresh context:
- What we've completed
- What remains
- Key decisions made
```

Agent creates summary → Start new conversation → Paste summary → Continue

**Time:** 3-5 minutes

---

**Option 2: Push to Completion**

```
Let's finish the current file before context reset.
Focus on completing [specific task] in this session.
```

Get to natural stopping point, then reset if needed.

---

**Option 3: Restart Fresh**

Agent documents status in Linear → Close terminal → Open new terminal → `/start-issue ENG-XXX` → Agent reads Linear history → Continues

**Time:** 5-10 minutes

---

## Continuous Agent Assignment

**Critical pattern: Don't let agents sit idle after completing work.**

### Immediate Reassignment After UAT Approval

**When you approve an agent's work:**

1. **Merge PR and mark "Done"** (30 seconds)
2. **Check Linear "Todo" column** for next issue (30 seconds)
3. **Immediately assign next issue in same terminal:**
   ```
   Excellent work on ENG-101! Moving to next issue.
   /start-issue ENG-105
   ```
4. **Agent begins new implementation** (no downtime)

**Total handoff time:** 1-2 minutes

**Result:** Agent never sits idle. Continuous productivity.

---

### Queuing Next Issues

**Proactive approach: Know what's next before agents finish.**

**During brief planning moments:**
- Review "Todo" column in Linear
- Identify 5-8 issues ready to start (one per agent)
- Prioritize and order them
- When agent completes UAT, immediately assign from queue

**Example queue:**
```
Next to assign (in order):
1. ENG-105 (Track 1, high priority, unblocks INT-15)
2. FRONTEND-48 (Track 2, ready to start)
3. ENG-106 (Track 1, continuation of completed feature)
4. FRONTEND-49 (Track 2, design system work)
5. INT-15 (Track 3, waiting for ENG-105)
6. ENG-107 (Track 1, new feature)
7. FRONTEND-50 (Track 2, component work)
8. INT-16 (Track 3, feature integration)
```

**When agent completes:** Grab next from queue, assign immediately.

---

### Managing Agent Capacity

**Track which agents are available for new work:**

| Terminal | Current Issue | Stage | Status | Action |
|----------|---------------|-------|--------|--------|
| Terminal 1 | ENG-101 | PR Created | UAT Needed | Review → Assign ENG-105 |
| Terminal 2 | ENG-102 | Implementing | Busy | Wait |
| Terminal 3 | FRONTEND-45 | Tests Written | Ready | Run /run-tests |
| Terminal 4 | ENG-103 | Validating | Busy | Wait |
| Terminal 5 | FRONTEND-46 | Implementation Done | Ready | Run /write-tests |
| Terminal 6 | INT-12 | Writing Tests | Busy | Wait |
| Terminal 7 | ENG-104 | UAT Added | Ready | Run /create-pr |
| Terminal 8 | FRONTEND-47 | Questioning | Blocked | Answer question |

**Target: Always have ≥6 of 8 agents making progress.**

---

### When to Stop Assigning

**Don't assign new work if:**

1. **Approaching end of session** (within 30 min of planned shutdown)
   - Better to finish strong than leave more in-flight work
   - Exception: Quick issues likely to complete

2. **Todo queue is empty** (no ready-to-start issues)
   - Don't force-start blocked or under-specified issues
   - Use time to write specs for next batch

3. **Too many agents active** (you're overwhelmed)
   - Let current work complete
   - Reduce to manageable number

4. **High merge conflict risk** (multiple agents editing same files)
   - Coordinate completion order
   - Wait for one to finish before starting related work

---

### Maximizing Throughput

**The math:**

- **Without continuous assignment:**
  - 8 agents, 4-hour session
  - Each completes 1 issue (2 hours), then sits idle (2 hours)
  - **Result:** 8 issues completed

- **With continuous assignment:**
  - 8 agents, 4-hour session
  - Each completes 2 issues (2 hours each), immediate handoff
  - **Result:** 16 issues completed

**2x throughput from the same session just by eliminating idle time.**

---

## Orchestration Loop Example

**Real-world 30-minute cycle:**

### Minute 0-3: Pipeline Scan
```
ENG-101: 📋 PR Created → Human UAT needed
ENG-102: 🔄 Implementing → Wait
FRONTEND-45: ✅ Implementation Done → Run /write-tests
ENG-103: 🧪 Writing Tests → Wait
FRONTEND-46: ✅ Tests Written → Run /run-tests
INT-12: 🔍 Validating → Wait
ENG-104: ✅ Validation Done → Run /add-uat
FRONTEND-47: ❓ Questioning → Answer needed
```

### Minute 3-4: Prioritize
- **P0:** FRONTEND-47 asking question (immediate)
- **P1:** ENG-101 PR created (UAT needed)
- **P2:** FRONTEND-45 ready for /write-tests
- **P2:** FRONTEND-46 ready for /run-tests
- **P2:** ENG-104 ready for /add-uat
- **P3:** 3 agents busy (wait)

### Minute 4-7: Handle P0 - Answer Question
- Switch to FRONTEND-47 terminal
- Read question: "Should ResourceList show deactivated resources by default?"
- Check spec TEAM-SPEC-005: "List endpoints filter out deactivated by default"
- Answer: "Filter out deactivated by default per spec."
- Agent continues implementing

### Minute 7-17: Handle P1 - UAT ENG-101
- Switch to ENG-101 terminal
- Read UAT instructions from Linear
- Check out worktree branch
- Test API endpoints with curl
- Verify data validation
- **Decision: Approved** ✅
- Merge PR, update Linear to "Done"
- Immediately assign next issue: `/start-issue ENG-105`

### Minute 17-18: Handle P2 - Progress Three Agents
- Switch to FRONTEND-45 → `/write-tests FRONTEND-45`
- Switch to FRONTEND-46 → `/run-tests`
- Switch to ENG-104 → `/add-uat ENG-104`
- All three now progressing in parallel

### Minute 18-30: Next Pipeline Scan
- Quick scan shows all agents busy
- ENG-102 finished implementing → Ready for `/write-tests`
- INT-12 finished validating → Ready for `/add-uat`
- Run both commands (1 min)
- All agents busy again
- Brief planning: identify next 3 issues to queue (5 min)
- FRONTEND-46 tests fail → Debug with agent (6 min)
- Tests fixed and passing

**Cycle continues...**

---

## Shutdown Phase (15-20 min)

**End of session - clean up in-flight work.**

### 1. Complete In-Flight Reviews

**Don't leave UAT reviews pending:**

- Review all issues with PR created (in "In Review" status)
- For each: Approve and merge, OR provide specific feedback
- Goal: Clear "In Review" queue completely

**If you must leave reviews pending:**
- Add comment: "Will review first thing tomorrow morning"
- Set Linear due date for yourself

**Time:** 10-15 minutes

---

### 2. Document Agent State

**For each active agent still in-flight, add Linear comment:**

```markdown
End of session status:

**Current Stage:** Writing tests (60% complete)

**Completed:**
- ✅ Schema definitions (shared/schema.ts)
- ✅ Storage methods (server/storage.ts)
- ✅ API route handlers (server/routes.ts)

**In Progress:**
- 🚧 Unit tests for storage methods

**Next Steps:**
1. Finish writing tests
2. Run /run-tests
3. Run /validate-issue
4. Run /add-uat
5. Run /create-pr

**Blockers:** None

**ETA:** ~1 hour remaining tomorrow
```

**Why:** You (or another agent) can resume efficiently tomorrow.

**Time:** 1-2 minutes per agent (10-15 min total)

---

### 3. Plan Tomorrow's Priorities

**Quick planning session:**

1. **What's ready for assignment tomorrow?**
   - Check "Todo" column in Linear
   - Verify dependencies resolved
   - Prioritize based on project milestones

2. **What's in-flight?**
   - Note which agents are mid-implementation
   - Estimate completion times
   - Plan for reviews

3. **What's blocking progress?**
   - Technical blockers needing research
   - Ambiguous requirements needing clarification
   - External dependencies

4. **Create checklist:**
   ```
   Tomorrow morning:
   - [ ] Resume 4 in-flight issues from today
   - [ ] Review 2 PRs from late today
   - [ ] Start 4 new issues (specs ready)
   - [ ] Research authentication approach (blocker for next feature)
   ```

**Time:** 5 minutes

---

### Shutdown Checklist

- [ ] All "In Review" issues handled (approved or feedback provided)
- [ ] All in-flight agents have status comments in Linear
- [ ] Tomorrow's priorities identified
- [ ] No agents stuck in error states
- [ ] Linear dashboard reflects reality
- [ ] Git worktrees in clean state (no uncommitted work)

**End state:** You can walk away with confidence.

---

## Multi-Terminal Management

### PowerShell-Specific Tips

**Windows Terminal configuration:**

1. **Keyboard shortcuts:**
   - `Ctrl+Shift+T` - New tab
   - `Ctrl+Tab` - Next tab
   - `Ctrl+Shift+Tab` - Previous tab
   - `Ctrl+Shift+W` - Close tab
   - `Ctrl+Shift+D` - Duplicate tab

2. **Set terminal title in PowerShell:**
   ```powershell
   $host.ui.RawUI.WindowTitle = "ENG-101 - Resource CRUD"
   ```

3. **Create startup script for agent sessions:**
   ```powershell
   # agent-session.ps1
   param([string]$IssueId)

   $host.ui.RawUI.WindowTitle = "$IssueId"
   Set-Location "C:\Users\YourName\Documents\repos\your-project"
   Write-Host "Starting agent session for $IssueId" -ForegroundColor Green
   ```

### VS Code Terminal Integration

**If using VS Code as your terminal:**

1. **Split terminals** - Each agent gets a split
2. **Name terminals** - Click dropdown → Rename
3. **Terminal groups** - Group by track
4. **Kill terminal** - Ctrl+W when done with agent

**Limitation:** VS Code terminals tied to VS Code instance. If working across multiple worktrees, need multiple VS Code windows.

---

## Metrics That Matter

**Track these to measure orchestration effectiveness:**

### Agent Utilization
**Formula:** `(Agents actively progressing / Total agents) * 100`

**Target:** >80%

**What it measures:** Are agents spending time productively, or waiting for commands?

**How to improve:**
- Run stage transition commands immediately when ready
- Don't batch - progress agents as they complete stages
- Scan terminals frequently (every 10-15 min)

---

### Stage Transition Time
**Formula:** `Time from "agent completes stage" to "you run next command"`

**Target:** <5 minutes

**What it measures:** How quickly you progress agents through pipeline

**How to improve:**
- Frequent pipeline scans
- Batch similar commands
- Keep queue of next issues ready

---

### Throughput
**Formula:** `Issues completed / Day`

**Target:** 5-10 issues/day for small issues, 2-4 for complex

**What it measures:** Overall system productivity

**How to improve:**
- More agents in parallel (if manageable)
- Faster stage transitions
- Continuous assignment (no idle time)
- Better issue sizing

---

### Parallel Efficiency
**Formula:** `Issues worked in parallel / Total issues worked`

**Target:** >60%

**What it measures:** Are you getting parallelism benefits?

**How to improve:**
- Reduce dependencies (more Track 1 + Track 2 work)
- Better worktree management
- Minimize merge conflicts through file ownership

---

### Iteration Rate
**Formula:** `Issues requiring iteration / Total issues completed`

**Target:** <30%

**What it measures:** Quality of specs and agent guidance

**How to improve:**
- Better issue descriptions
- More detailed acceptance criteria
- Link to relevant patterns
- Answer questions clearly the first time

---

## Common Pitfalls

### Pitfall 1: Batching Stage Transitions

**Symptom:** Letting 5 agents sit at "implementation done" for 30 minutes before running `/write-tests` on any of them

**Why it happens:** "I'll progress them all at once to save time"

**Cost:** Wasted agent capacity, delayed completions

**Solution:**
- Progress agents as soon as they complete a stage
- Don't wait to batch
- Think "continuous flow" not "batch processing"

---

### Pitfall 2: Missing Stage Completions

**Symptom:** Agent has been sitting at "ready for /run-tests" for 20 minutes and you didn't notice

**Why it happens:** Not scanning terminals frequently enough

**Cost:** Idle agent capacity, low throughput

**Solution:**
- Set timer for 10-15 min pipeline scans
- Scan more frequently during high-activity periods
- Use visual cues (terminal titles, Linear status)

---

### Pitfall 3: Skipping PR Review Comments

**Symptom:** Proceeding directly to Human UAT when GitHub Claude left review comments

**Why it happens:**
- "I'll just have the human reviewer look at it"
- "The comments seem minor, I'll skip them"
- Didn't notice GitHub added comments
- Eager to get to Human UAT quickly

**Cost:**
- Human UAT finds same issues GitHub found (wasted time)
- Multiple human UAT iteration cycles
- Human reviewer frustration ("why wasn't this caught?")
- Technical debt from deferred code quality issues
- Slower overall throughput

**Solution:**
- **Always check for PR comments** 1-2 min after `/create-pr`
- **Never skip critical (Category A/B) comments**
- **Triage comments** before deciding to proceed
- **Document why** if deferring any comments
- **Address most comments now** rather than later
- **Trust the automated review** - it's faster than human iteration

**Rule of thumb:** If GitHub Claude flagged it, it's worth fixing before Human UAT.

---

### Pitfall 4: Over-Assignment

**Symptom:** 15 agents running, you can't keep up with stage transitions

**Why it happens:** "More agents = more throughput"

**Cost:** Agents waiting for commands, context switching overhead >50%

**Solution:**
- Find your sweet spot (usually 6-10 agents)
- Quality over quantity
- Better to have 8 agents utilized 90% than 15 utilized 40%

---

### Pitfall 5: Ignoring Context Windows

**Symptom:** Agent suddenly gives degraded responses or errors

**Why it happens:** Didn't notice context window filling up

**Cost:** Poor agent output, need to restart

**Solution:**
- Watch for warnings
- Summarize after 90min sessions on complex issues
- Break large issues into smaller issues

---

### Pitfall 6: Unclear Specs

**Symptom:** Every issue requires 2-3 iteration cycles, agents asking many questions

**Why it happens:** Vague requirements, missing acceptance criteria

**Cost:** Low throughput, constant interruptions, rework

**Solution:**
- Invest in specification quality upfront
- Link issues to detailed specs
- Add examples and pattern references
- Use brief planning time to improve next batch of specs

---

## Scaling Considerations

### From 2 Agents to 8 Agents

**What changes:**
- Terminal management becomes critical
- Need frequent pipeline scans (every 10-15 min)
- More stage transitions to manage
- Less "waiting for agents" time

**Skills to develop:**
- Fast terminal switching
- Quick stage identification
- Efficient command execution
- Comfortable with rapid context switching

---

### From 8 Agents to 15+ Agents

**What changes:**
- Need automation (scripts for stage transitions?)
- Need better tracking (spreadsheet or tool)
- Coordination overhead may exceed benefits
- Risk of merge conflicts increases

**When it makes sense:**
- Very large project
- Clear file ownership boundaries
- Excellent tooling
- You've mastered 8-agent orchestration

**When to avoid:**
- Still learning the system
- High interdependency between issues
- Limited terminal/monitor setup

---

## Related Documentation

- **Review Guide:** [REVIEW-GUIDE.md](./REVIEW-GUIDE.md) - Detailed UAT review process
- **Commands Reference:** [../reference/COMMANDS.md](../reference/COMMANDS.md) - All slash commands
- **Linear Workflow:** [../reference/LINEAR-WORKFLOW.md](../reference/LINEAR-WORKFLOW.md) - Issue status management
- **Agent Quick Start:** [../agent-system/QUICK-START.md](../agent-system/QUICK-START.md) - What agents do
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common problems and solutions

---

## Appendix: Sample Schedule

**What a 4-hour orchestration session might look like:**

```
9:00-9:20   Launch Phase
            - Review Linear, plan assignments
            - Start 8 agents with /start-issue
            - All agents begin implementing

9:20-9:30   First Pipeline Scan
            - All agents still implementing
            - Brief planning: queue next 5 issues

9:30-9:45   Second Pipeline Scan
            - ENG-101 finished implementing
            - Run /write-tests ENG-101
            - FRONTEND-45 asking question
            - Answer question (5 min)

9:45-10:00  Third Pipeline Scan
            - ENG-101 finished writing tests
            - Run /run-tests
            - Tests pass
            - Run /validate-issue ENG-101
            - ENG-102 finished implementing
            - Run /write-tests ENG-102

10:00-10:15 Fourth Pipeline Scan
            - ENG-101 validation complete
            - Run /add-uat ENG-101
            - FRONTEND-46 finished implementing
            - Run /write-tests FRONTEND-46
            - ENG-103 finished implementing
            - Run /write-tests ENG-103

10:15-10:30 Fifth Pipeline Scan
            - ENG-101 UAT added
            - Run /create-pr ENG-101
            - Update status to "In Review"
            - Wait 2 min for GitHub Claude review
            - Check PR: 4 comments (2 critical, 2 style)
            - ENG-102 tests written
            - Run /run-tests
            - FRONTEND-46 tests written
            - Run /run-tests

10:30-10:45 PR Review - ENG-101
            - Triage comments (3 min)
            - Decide: Address 2 critical, defer 2 style
            - Run /address-pr-comments ENG-101
            - Agent fixes issues (8 min)
            - GitHub re-reviews, approves
            - Ready for Human UAT

10:45-11:00 Human UAT - ENG-101
            - Review PR, test API endpoints
            - Approve and merge
            - Immediately assign: /start-issue ENG-105
            - Agent begins implementing ENG-105

11:00-11:15 Sixth Pipeline Scan
            - ENG-102 tests passed, validated
            - Run /add-uat ENG-102
            - Run /create-pr ENG-102
            - Update status to "In Review"
            - Wait 2 min for GitHub review
            - Check PR: No comments, approved! ✅
            - Proceed directly to Human UAT
            - FRONTEND-46 tests passed
            - Run /validate-issue FRONTEND-46
            - INT-12 finished implementing
            - Run /write-tests INT-12

11:15-11:30 Human UAT - ENG-102 (Clean PR)
            - Review PR, test API (quick - no PR issues)
            - Approve and merge
            - Assign next issue

11:00-11:30 Continue Pipeline Management
            - Human UAT on ENG-102 (10 min)
            - Approve, merge, assign next issue
            - Progress 5 agents through stage transitions
            - Answer 2 questions
            - Debug test failure on FRONTEND-47

11:30-12:00 Continue Pipeline Management
            - 3 more agents complete implementation
            - Run /write-tests on all three
            - 2 agents ready for validation
            - Run /validate-issue on both
            - Human UAT on FRONTEND-46

12:00-12:30 Continue Pipeline Management
            - 4 agents at various stage boundaries
            - Progress each through next stage
            - Human UAT on INT-12
            - 1 agent hitting context limit
            - Summarize and continue

12:30-1:00  Shutdown Phase
            - Human UAT on last 2 PRs (15 min)
            - Document status of 6 in-flight agents (8 min)
            - Plan tomorrow's work (5 min)

Summary:
- 8 agents started
- 6 issues completed and merged
- 6 issues in-flight (various stages)
- ~4 hours total
- 50+ stage transition commands executed
- 2 PRs required GitHub review comment handling
- 1 PR clean (no comments)
- Average 10-15 min spent on PR review iterations per issue
```

**Your schedule will vary based on issue complexity, agent speeds, and PR review comment volume.**

---

This is active, demanding work requiring constant attention. Take breaks. Find your sustainable pace. Quality over quantity.
