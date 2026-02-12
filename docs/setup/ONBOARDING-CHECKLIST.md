# Project Onboarding Checklist

> **Step-by-Step Verification** - Complete this checklist to verify your setup is working.

## Purpose

Use this checklist to verify that your base-web-app project is properly cloned, customized, and ready for development.

**Key Difference:** Unlike traditional setup where you create everything from scratch, the base-web-app template includes all documentation, Claude Code configurations, and application structure. You're verifying what exists, not creating it.

**Audience:** Project leads

**Time:** 15-30 minutes to verify

**Phases:**
1. **Repository Setup** - Clone and customize
2. **Application Setup** - Install dependencies and run
3. **Documentation Review** - Verify docs exist and work
4. **Claude Code** - Verify commands/skills/agents
5. **Linear Integration** - Connect to Linear (requires setup)
6. **Pilot Testing** - Optional end-to-end test
7. **Quick Verification** - Final checks

---

## Phase A: Repository Setup

### Clone & Initialize
- [ ] Cloned base-web-app repository
- [ ] Removed template git history (`.git` directory)
- [ ] Initialized new git repository (`git init`)
- [ ] Created initial commit
- [ ] (Optional) Created remote repository and pushed

### Project Customization
- [ ] Updated `package.json` name field
- [ ] Updated `package.json` description field
- [ ] Updated `package.json` repository URL
- [ ] Updated `package.json` author field

### Verify Directory Structure
- [ ] `.claude/` directory exists with commands, skills, agents
- [ ] `docs/` directory exists with all subdirectories
- [ ] `client/` directory exists (React frontend)
- [ ] `server/` directory exists (Express backend)
- [ ] `shared/` directory exists (TypeScript types)

---

## Phase B: Application Setup

### Dependencies
- [ ] Ran `npm install` successfully
- [ ] All packages installed without errors
- [ ] TypeScript compiles (`npm run check` passes)

### Database Setup
- [ ] Created `.env` file from `.env.example`
- [ ] Set `DATABASE_URL` in `.env`
- [ ] PostgreSQL is running
- [ ] Ran `npm run db:push` (or `db:generate` + `db:migrate`)
- [ ] Database schema created successfully
- [ ] (Optional) Ran `npm run db:seed` for example data

### Application Runs
- [ ] Started dev server (`npm run dev`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responds at http://localhost:5000
- [ ] No console errors on startup

---

## Phase C: Documentation Review

### Verify Documentation Exists
- [ ] `docs/README.md` exists (navigation hub)
- [ ] `docs/setup/PROJECT-SETUP.md` exists
- [ ] `docs/setup/LINEAR-SETUP.md` exists
- [ ] `docs/workflow/DAILY-WORKFLOW.md` exists
- [ ] `docs/agent-system/AGENT-GUIDE.md` exists
- [ ] `docs/agent-system/PATTERNS.md` exists
- [ ] `docs/agent-system/VALIDATION-CHECKLIST.md` exists
- [ ] `docs/agent-system/UAT-ENABLEMENT.md` exists
- [ ] Track guides exist (TRACK-1, TRACK-2, TRACK-3)
- [ ] Reference docs exist (CONCEPTS, COMMANDS, LINEAR-WORKFLOW, TEMPLATES)

### Verify Documentation Links
- [ ] Opened `docs/README.md`
- [ ] All navigation links work (no 404s)
- [ ] Documentation renders correctly
- [ ] Track guides are accessible

### Customize Documentation (Optional)
- [ ] Updated examples to match your domain (if needed)
- [ ] Replaced generic placeholders with project-specific content
- [ ] Added project-specific patterns to PATTERNS.md

---

## Phase D: Claude Code Configuration

### Verify Command Files Exist
- [ ] `.claude/commands/start-issue.md` exists
- [ ] `.claude/commands/validate-issue.md` exists
- [ ] `.claude/commands/update-status.md` exists
- [ ] `.claude/commands/create-pr.md` exists
- [ ] `.claude/commands/request-supervisor-help.md` exists
- [ ] `.claude/commands/supervisor-review.md` exists
- [ ] `.claude/commands/write-tests.md` exists
- [ ] `.claude/commands/run-tests.md` exists
- [ ] `.claude/commands/add-uat.md` exists
- [ ] Additional workflow commands exist

### Verify Skill Files Exist
- [ ] `.claude/skills/ontology-patterns/SKILL.md` exists
- [ ] `.claude/skills/design-system-patterns/SKILL.md` exists
- [ ] `.claude/skills/issue-workflow/SKILL.md` exists

### Verify Agent Files Exist
- [ ] `.claude/agents/ontology-developer/AGENT.md` exists
- [ ] `.claude/agents/ui-developer/AGENT.md` exists
- [ ] `.claude/agents/feature-developer/AGENT.md` exists
- [ ] `.claude/agents/supervisor/AGENT.md` exists

### Test Claude Code
- [ ] Started Claude Code in project directory
- [ ] Typed `/` to see command list
- [ ] All commands appear in list
- [ ] Commands load without errors

---

## Phase E: Linear Integration

### Linear Workspace Access
- [ ] Have access to existing Linear workspace
- [ ] Identified ALL teams that will work on project (varies by org structure)
- [ ] Noted team keys for all teams (e.g., "ENG", "PLATFORM", "OPS", "DATA")
- [ ] Verified membership or access to all participating teams

### Workflow States Verification (All Teams)
- [ ] Verified ALL teams have state: **Backlog** (type: Backlog)
- [ ] Verified ALL teams have state: **Todo** (type: Unstarted)
- [ ] Verified ALL teams have state: **In Progress** (type: Started)
- [ ] Verified ALL teams have state: **In Review** (type: Started)
- [ ] Verified ALL teams have state: **Done** (type: Completed)

### Track Labels Verification (Workspace-Level)
- [ ] Verified workspace-level label: **1-ONTOLOGY** (blue)
- [ ] Verified workspace-level label: **2-DESIGN-SYSTEM** (purple)
- [ ] Verified workspace-level label: **3-TRACER-BULLETS** (green)
- [ ] Confirmed labels are available to ALL teams (not team-scoped)

### Issue Type Labels (Optional)
- [ ] Verified label: **user-story**
- [ ] Verified label: **design**
- [ ] Verified label: **decision**
- [ ] Verified label: **out-of-scope-v1**

### Project/Cycle Creation (Multi-Team)
- [ ] Created Linear Project or Cycle
- [ ] Added project metadata (name, summary, description)
- [ ] Assigned project lead
- [ ] Understood project will contain issues from multiple teams

### Linear MCP Server Setup
- [ ] Obtained Linear API key
- [ ] Set `LINEAR_API_KEY` environment variable
- [ ] Verified environment variable is set (echoed value)
- [ ] Restarted terminal/IDE
- [ ] Installed MCP server: `claude mcp add --transport http linear-server https://mcp.linear.app/mcp`

### Verify Linear MCP Connection
- [ ] Started Claude Code
- [ ] Asked: "List my Linear teams"
- [ ] Claude returned your teams
- [ ] Created test issue (optional)
- [ ] Verified test issue appears in Linear

---

## Phase F: Pilot Testing (Optional)

### Create Pilot Issues
- [ ] Created 1-2 pilot issues in Linear
- [ ] Issues have track labels (1-ONTOLOGY, 2-DESIGN-SYSTEM, or 3-TRACER-BULLETS)
- [ ] Issues have clear descriptions
- [ ] Issues assigned to project/cycle

### Test Issue Workflow
- [ ] Used `/start-issue TEAM-1` command
- [ ] Command fetched issue from Linear
- [ ] Command checked dependencies
- [ ] Command created git worktree (if needed)
- [ ] Command updated issue status to "In Progress"

### Test Implementation Workflow
- [ ] Agent completed pilot work
- [ ] Used `/validate-issue TEAM-1`
- [ ] Used `/add-uat TEAM-1`
- [ ] Used `/create-pr TEAM-1`
- [ ] PR created successfully
- [ ] Used `/update-status TEAM-1 in-review`

### Test Review Workflow
- [ ] Reviewed pilot work
- [ ] Provided feedback in Linear comments
- [ ] Agent iterated based on feedback
- [ ] Approved and merged PR
- [ ] Used `/update-status TEAM-1 done`
- [ ] Issue status updated to "Done" in Linear

---

## Phase G: Quick Verification Tests

### Test 1: Command Availability
```bash
# Start Claude Code and type:
/

# Expected: See all commands listed
```
- [ ] All commands visible
- [ ] No error messages

### Test 2: Linear MCP Connection
```bash
# In Claude Code, ask:
List my Linear teams
```
- [ ] Claude accessed Linear successfully
- [ ] Returned correct team names

### Test 3: Issue Fetch
```bash
# In Claude Code, use:
/start-issue TEAM-1
```
- [ ] Issue fetched from Linear
- [ ] Issue description displayed
- [ ] Dependencies checked
- [ ] Status updated

### Test 4: Documentation Links
- [ ] Opened `docs/README.md`
- [ ] Clicked all navigation links
- [ ] All links work (no 404s)
- [ ] Documents render correctly

### Test 5: Git Worktree
- [ ] Created worktree via `/start-issue`
- [ ] Worktree directory exists
- [ ] Git branch created correctly
- [ ] Can switch between worktrees

---

## Success Criteria

**Core requirements (must pass):**

- [ ] **Repository:** Cloned, customized, and initialized
- [ ] **Application:** Dependencies installed, database running, dev server works
- [ ] **Documentation:** All docs exist and links verified
- [ ] **Claude Code:** Commands, skills, and agents accessible
- [ ] **Linear:** Team, states, labels created; MCP connected

**Optional (recommended):**

- [ ] **Pilot Test:** At least 1 issue completed end-to-end
- [ ] **Quick Tests:** All 5 verification tests passed

---

## Next Steps

Once all checks pass:

1. **Follow 6-Phase Workflow**
   - See [reference/CONCEPTS.md](../reference/CONCEPTS.md)
   - Start with Phase 1: Strategic Planning
   - Progress through all 6 phases

2. **Create Real Issues**
   - Follow Phase 3: Requirements Capture
   - Create user story issues
   - Create specification issues (Phase 4)
   - Generate implementation issues (Phase 5)

3. **Begin Development**
   - Follow [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md)
   - Assign issues using `/start-issue`
   - Monitor progress in Linear
   - Review and approve work

---

## Troubleshooting

**If any check fails:**

1. **Review setup guides:**
   - [PROJECT-SETUP.md](./PROJECT-SETUP.md) - Full setup instructions
   - [LINEAR-SETUP.md](./LINEAR-SETUP.md) - Linear integration details

2. **Common issues by phase:**

   **Repository problems:**
   - Ensure you cloned from the correct repository
   - Verify `.git` directory was removed and recreated
   - Check that all template files are present

   **Application problems:**
   - Run `npm install` if packages missing
   - Verify Node.js 18+ (`node --version`)
   - Check `.env` file exists with `DATABASE_URL`
   - Ensure PostgreSQL is running
   - Check for port conflicts (3000, 5000)

   **Claude Code problems:**
   - Verify you're in project root directory
   - Restart Claude Code after changes
   - Check Claude Code version is up-to-date

   **Linear MCP problems:**
   - Verify `LINEAR_API_KEY` environment variable is set
   - Restart terminal/IDE after setting env var
   - Check `.claude/.mcp.json` configuration
   - Verify API key has correct permissions

3. **Get detailed help:**
   - See troubleshooting sections in [PROJECT-SETUP.md](./PROJECT-SETUP.md)
   - Review error messages carefully
   - Check project-specific documentation

---

## Maintenance Checklist

**Periodic maintenance (quarterly):**

- [ ] Rotate Linear API key (security)
- [ ] Review and update documentation
- [ ] Update command files with lessons learned
- [ ] Refine PATTERNS.md based on experience
- [ ] Update VALIDATION-CHECKLIST.md as tests evolve
- [ ] Check for Claude Code updates
- [ ] Verify all links still work

---

## Related Documentation

- **Project Setup:** [PROJECT-SETUP.md](./PROJECT-SETUP.md) - Initial configuration
- **Linear Setup:** [LINEAR-SETUP.md](./LINEAR-SETUP.md) - Linear integration
- **Core Concepts:** [reference/CONCEPTS.md](../reference/CONCEPTS.md) - 6-phase workflow
- **Daily Workflow:** [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md) - Daily operations
- **Commands:** [reference/COMMANDS.md](../reference/COMMANDS.md) - Command reference
