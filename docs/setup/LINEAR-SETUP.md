# Linear Project Setup Guide

> **Security-Critical Setup** - Configure new project in existing Linear workspace with secure MCP server integration.

## Purpose

This guide walks through setting up a new project within an existing Linear workspace that is already configured for the agentic workflow. You'll identify the contributing team(s), verify workflow configuration, create a project, and connect Claude Code via the Linear MCP server.

**Key Assumption:** Your organization already has a Linear workspace configured with the agentic workflow (teams, workflow states, and track labels). You're setting up a new project within this existing workspace.

**Audience:** Project leads

**Prerequisites:** Complete [PROJECT-SETUP.md](./PROJECT-SETUP.md) first

---

## Prerequisites

Before setting up Linear integration:

1. **Linear Workspace Access**
   - Access to an existing Linear workspace at [linear.app](https://linear.app)
   - The workspace should already have teams, workflow states, and track labels configured
   - You need permission to create projects and assign them to teams

2. **Linear API Key**
   - Navigate to Settings → API → Personal API Keys
   - Create a new API key with full access
   - Save this key securely - you'll need it for MCP configuration

3. **Claude Code with MCP Support**
   - Ensure you're using Claude Code (CLI) version with MCP server support
   - Linear MCP server should be available in your Claude Code installation

---

## Setup Overview

```
1. Identify Linear Team(s)
   ↓
2. Verify Workflow States
   ↓
3. Verify Track Labels
   ↓
4. Create Project or Cycle
   ↓
5. Set Up Linear MCP Server (SECURITY CRITICAL)
   ↓
6. Verify MCP Connection
```

**Estimated time:** 20-30 minutes

---

## Step 1: Identify Linear Teams

**Key Concept:** In Linear, projects are cross-functional initiatives that span multiple teams. Your project will likely involve several teams, each contributing issues in their area of expertise.

### Understanding Teams vs. Projects

- **Teams:** Organizational units with any structure your organization uses
  - Each team has its own issue sequence: ENG-1, PLATFORM-1, OPS-1, etc.
  - Issues belong to exactly ONE team
  - Teams have specialized skills/responsibilities

- **Projects:** Cross-functional initiatives that group related work
  - Projects contain issues from MULTIPLE teams
  - Example: "User Auth" project might have ENG-12, PLATFORM-8, PRODUCT-15
  - Projects are the primary organizing principle for your work

### Identify Teams for Your Project

1. **In Linear, view available teams:**
   - Check the team switcher in the top-left corner
   - Or navigate to Settings → Teams to see all teams

2. **Identify which teams will contribute to your project:**
   - List all teams that will work on this initiative
   - Examples might include: Engineering, Platform, Product, Data, Operations, etc.
   - Your organization's team structure is unique - the workflow adapts to it
   - Teams can work on any combination of tracks based on their responsibilities

3. **Note team keys for all involved teams:**
   - Each team has a unique key (e.g., "ENG", "PLATFORM", "OPS", "DATA")
   - These keys become issue prefixes: ENG-1, PLATFORM-1, OPS-1, DATA-1
   - You'll specify the team when creating each issue

4. **Verify team access:**
   - Ensure you're a member of all relevant teams (or have cross-team visibility)
   - Verify you have permission to create issues and projects in these teams

**If no suitable teams exist:** Contact your workspace administrator. Most organizations will already have teams set up by functional area.

### Understanding Tracks vs. Teams

**Critical Concept:** Track labels describe the TYPE OF WORK, not which team should do it.

**Track Definitions:**

| Track | What It Means | Examples | Any Team Can Do This |
|-------|---------------|----------|---------------------|
| **1-ONTOLOGY** | Data layer work | Schemas, storage, APIs, data models | ✅ Platform team, Data team, Engineering team, etc. |
| **2-DESIGN-SYSTEM** | Presentation layer | UI components, styling, layouts, design tokens | ✅ Product team, Frontend team, Engineering team, etc. |
| **3-TRACER-BULLETS** | Integration work | E2E features, workflows, orchestration | ✅ Any team working on complete features |

**How to decide which team owns an issue:**
1. Which team has the expertise for this work?
2. Where will the code primarily live in your codebase?
3. Which team has capacity and availability?
4. Does your organization have conventions (e.g., "Platform team owns all APIs")?

**Examples of team/track mapping:**
- A full-stack Engineering team might work on all 3 tracks
- A Platform team might work primarily on Track 1, occasionally Track 3
- An Operator team might work on Track 2 (operator UIs) and Track 3 (operator workflows)
- An Advanced Engineer team might work on all tracks but focus on complex problems

See [reference/TEAM-PROJECT-ORGANIZATION.md](../reference/TEAM-PROJECT-ORGANIZATION.md) for detailed examples of different team structures.

---

## Step 2: Verify Workflow States (All Teams)

**Important:** For multi-team projects to work smoothly, ALL teams in your workspace should use the same standardized workflow states. This ensures consistent status tracking and dependencies across teams.

### Required Workflow States

All teams working on agentic workflow projects should have these 5 states:

| State Name | Type | Description |
|------------|------|-------------|
| **Backlog** | Backlog | Planned but not ready to start |
| **Todo** | Unstarted | Dependencies complete, ready to assign |
| **In Progress** | Started | Agent actively working on implementation |
| **In Review** | Started | Code complete, awaiting UAT review |
| **Done** | Completed | UAT approved, merged to main |

**How to verify:**
1. **Check each team** that will work on your project
2. Go to Team Settings → Workflow for each team
3. Confirm all 5 states exist with correct types
4. Review state transitions (see [reference/LINEAR-WORKFLOW.md](../reference/LINEAR-WORKFLOW.md))

**Critical:** All teams participating in the agentic workflow must use these same 5 states. This ensures consistent status tracking across teams and enables cross-team dependencies.

**If states are missing or incorrectly configured:** Contact your workspace administrator. This is a workspace-level standard that should be applied to all teams using the agentic workflow.

---

## Step 3: Verify Track Labels (Workspace-Level)

**Important:** Track labels MUST be workspace-scoped (not team-scoped) so they're available to all teams working on projects. This ensures consistent labeling across all teams.

### Required Track Labels

| Label Name | Color | Description |
|------------|-------|-------------|
| **1-ONTOLOGY** | Blue | Database schemas, storage methods, API endpoints |
| **2-DESIGN-SYSTEM** | Purple | UI components, design tokens, layouts |
| **3-TRACER-BULLETS** | Green | End-to-end features connecting ontology and UI |

**How to verify:**
1. Go to workspace-level Settings → Labels (NOT team-specific labels)
2. Confirm all three track labels exist and are workspace-scoped
3. Verify these labels are available when creating issues in any team

**Critical:** These labels must be workspace-scoped so issues from different teams (e.g., ENG-12, PLATFORM-8, OPS-15) can all use the same track labels. This enables filtering and organizing work across teams by track.

**If labels are missing:** Contact your workspace administrator to create them at the workspace level. Do not create team-specific versions of these labels.

**Additional labels that may exist:**
- `user-story` - For Phase 3 user story issues
- `design` - For Phase 4 specification issues
- `decision` - For architectural decision issues
- `out-of-scope-v1` - For deferred features

**See:** [reference/CONCEPTS.md](../reference/CONCEPTS.md) for issue type details

---

## Step 4: Create Project or Cycle

**Key Concept:** Your project will group issues from multiple teams. All teams you identified in Step 1 will create issues that belong to this project.

Create a Linear Project or Cycle to organize your cross-team work:

**Project:**
- For long-running feature development
- No fixed timeline
- Good for multi-month initiatives
- Groups issues from all participating teams

**Cycle:**
- For time-boxed sprints (1-2 weeks typical)
- Fixed start and end dates
- Good for agile workflows
- Can span multiple teams

**How to create:**
1. Go to Projects (or Cycles) → New Project
2. Fill in project details:
   - Name (e.g., "User Authentication", "Payment System")
   - Summary (one-sentence description)
   - Description (full project vision and scope)
   - Lead (assign yourself as project lead)
   - Target date (if applicable)
3. Note: You don't assign teams to a project - instead, issues from various teams will be assigned to this project

**Multi-Team Organization:**
- Your project will contain issues like: ENG-45, PLATFORM-23, OPS-12
- All issues share the same project but belong to different teams
- Use track labels and filters to view work by track or team
- Dependencies can exist between issues from different teams

---

## Step 5: Set Up Linear MCP Server

### ⚠️ CRITICAL: Security Requirements

**NEVER store your Linear API key in any file.** You must set it as a system environment variable.

### Setting LINEAR_API_KEY in System Environment Variables

Choose the instructions for your operating system:

#### Windows (PowerShell - Recommended)

```powershell
# Set user environment variable (persists across restarts)
[System.Environment]::SetEnvironmentVariable('LINEAR_API_KEY', 'lin_api_xxxxxxxxxxxxx', 'User')

# Verify it was set
$env:LINEAR_API_KEY

# Restart your terminal for changes to take effect
```

#### Windows (Command Prompt)

```cmd
# Set user environment variable (persists across restarts)
setx LINEAR_API_KEY "lin_api_xxxxxxxxxxxxx"

# Restart your terminal for changes to take effect
```

#### macOS/Linux (Bash)

```bash
# Add to ~/.bashrc or ~/.bash_profile
echo 'export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxx"' >> ~/.bashrc

# Reload the configuration
source ~/.bashrc

# Verify it was set
echo $LINEAR_API_KEY
```

#### macOS/Linux (Zsh)

```bash
# Add to ~/.zshrc
echo 'export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxx"' >> ~/.zshrc

# Reload the configuration
source ~/.zshrc

# Verify it was set
echo $LINEAR_API_KEY
```

**Important:**
- Replace `lin_api_xxxxxxxxxxxxx` with your actual Linear API key
- After setting the variable, **restart your terminal** or IDE for changes to take effect
- Never commit API keys to version control

### Configure Claude Code Settings

After setting the system environment variable, check your `.claude/.mcp.json is configured with the correct command and environment variable reference for the Linear MCP server.:

**Location:** `.claude/.mcp.json` (or global settings)

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-linear"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    }
  }
}
```

**Important:** The `"${LINEAR_API_KEY}"` syntax references the system environment variable you set above. This ensures the API key is NEVER stored in any file.

Then, install the Linear MCP server:

```bash  
claude mcp add --transport http linear-server https://mcp.linear.app/mcp
```

### 🔒 Security Best Practices

**1. ALWAYS use system environment variables:**
   - ✅ Good: Set `LINEAR_API_KEY` in system environment (see instructions above)
   - ✅ Good: Reference in config: `"LINEAR_API_KEY": "${LINEAR_API_KEY}"`
   - ❌ BAD: `"LINEAR_API_KEY": "lin_api_xxxxxxxxxxxxx"` (hardcoded in file)
   - ❌ BAD: Storing keys in `.env` files that might be committed

**2. API Key Scoping:**
   - Use **personal API keys** for individual development
   - For team projects, consider **team-scoped tokens** if available
   - Grant minimum required permissions (read/write to specific teams)

**3. Key Rotation Policy:**
   - Rotate API keys every 90 days or when:
     - Team member leaves with access
     - Key is accidentally exposed
     - Security audit recommends it
   - Linear Settings → API → Delete old key → Create new key

---

## Step 6: Verify MCP Connection

### Test the Linear MCP connection:

1. **Start Claude Code**
   ```bash
   claude
   ```

2. **Test with a simple query**

   Type in chat:
   ```
   List my Linear teams
   ```

   Claude should be able to access your Linear workspace and return your teams.

3. **Test creating an issue** (optional)

   Try asking:
   ```
   Create a test issue in Linear with title "Test Issue" in team <team name>
   ```

   Check Linear to verify the issue was created.

### If the connection fails, check:

- API key is correct and has proper permissions in Linear
- MCP server is installed: `claude mcp add --transport http linear-server https://mcp.linear.app/mcp`
- Network connectivity to Linear API
- Environment variable is set and terminal was restarted
- `.claude/.mcp.json` syntax is correct

---

## Troubleshooting

### MCP Connection Fails

**Problem:** Claude Code can't access Linear workspace

**Solutions:**

1. **Verify environment variable:**
   ```bash
   # Windows PowerShell
   $env:LINEAR_API_KEY

   # macOS/Linux
   echo $LINEAR_API_KEY
   ```
   Should output your API key (not empty)

2. **Restart terminal/IDE:**
   - Environment variables don't take effect until terminal is restarted
   - Close and reopen your terminal or IDE completely

3. **Check MCP configuration:**
   - Open `.claude/.mcp.json`
   - Verify syntax matches example above exactly
   - Check for typos in `LINEAR_API_KEY`

4. **Verify API key permissions:**
   - Go to Linear Settings → API
   - Check your API key has full access
   - Try creating a new key if issues persist

5. **Test MCP server directly:**
   ```bash
   # Test the MCP server installation
   claude mcp add --transport http linear-server https://mcp.linear.app/mcp
   ```

### API Key Accidentally Committed

**Problem:** You committed your API key to version control

**IMMEDIATE ACTIONS:**

1. **Revoke the key in Linear:**
   - Go to Linear Settings → API
   - Delete the compromised key immediately

2. **Create a new key:**
   - Generate a fresh API key
   - Update your system environment variable

3. **Remove from git history:**
   ```bash
   # If you just committed (not pushed):
   git reset --soft HEAD~1
   git restore --staged .claude/.mcp.json

   # If already pushed, use git-filter-repo or BFG Repo-Cleaner
   # Then force push (destructive - coordinate with team)
   ```

4. **Verify .gitignore:**
   ```bash
   # Add to .gitignore if missing
   echo ".claude/.mcp.json" >> .gitignore
   git add .gitignore
   git commit -m "Add .claude/.mcp.json to gitignore"
   ```

### Wrong Team or Project

**Problem:** MCP connects but can't find your issues

**Solutions:**

1. **Verify team key:**
   - Check your team key in Linear settings (Settings → Teams)
   - Ensure you're using the correct key when working with issues (e.g., "PROJ")

2. **Check project association:**
   - Issues must be assigned to a project or cycle
   - Verify project exists and you have access
   - Ask in Claude Code: "Show me projects in team PROJ"

3. **Test with team listing:**
   ```
   In Claude Code: "List all teams in my Linear workspace"
   ```

4. **Verify team membership:**
   - Ensure you're a member of the team
   - Contact workspace admin if you need to be added

---

## Next Steps

Once Linear is set up:

1. **Create first project** (Phase 1)
   - Use Linear Documents for Architecture and Glossary
   - See [reference/CONCEPTS.md](../reference/CONCEPTS.md) for Phase 1 details

2. **Create initial issues**
   - Start with user story issues (Phase 3)
   - Use templates from [reference/TEMPLATES.md](../reference/TEMPLATES.md)
   - Follow [reference/LINEAR-WORKFLOW.md](../reference/LINEAR-WORKFLOW.md)

3. **Test with `/start-issue`**
   - Create a pilot issue in Linear
   - Use `/start-issue TEAM-1` in Claude Code (replace TEAM with your actual team key, e.g., ENG-1, OPS-1)
   - Verify the command works end-to-end

4. **Complete onboarding**
   - Follow [ONBOARDING-CHECKLIST.md](./ONBOARDING-CHECKLIST.md)
   - Verify all setup steps

---

## Related Documentation

- **Project Setup:** [PROJECT-SETUP.md](./PROJECT-SETUP.md) - General project configuration
- **Onboarding Checklist:** [ONBOARDING-CHECKLIST.md](./ONBOARDING-CHECKLIST.md) - Verification steps
- **Core Concepts:** [reference/CONCEPTS.md](../reference/CONCEPTS.md) - 6-phase workflow and issue types
- **Linear Workflow:** [reference/LINEAR-WORKFLOW.md](../reference/LINEAR-WORKFLOW.md) - Status management and dependencies
- **Templates:** [reference/TEMPLATES.md](../reference/TEMPLATES.md) - Issue templates
- **Commands:** [reference/COMMANDS.md](../reference/COMMANDS.md) - Slash command reference
