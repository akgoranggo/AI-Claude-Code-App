# Project Setup Guide

> **One-Time Setup** - Initial project configuration for AI-enabled multi-agent development.

## Purpose

This guide walks project leads through setting up a new project using the base-web-app template. The template includes all documentation, Claude Code configurations, and folder structures. You'll customize it for your project and set up Linear integration.

**Audience:** Project leads, DevOps engineers

**See also:** [LINEAR-SETUP.md](./LINEAR-SETUP.md) for Linear workspace configuration

---

## Prerequisites

Before starting, ensure you have:

1. **Development Environment**
   - Node.js 18+ and npm
   - Git
   - Your preferred code editor (VS Code, etc.)
   - PostgreSQL (local or cloud)

2. **Access & Accounts**
   - GitHub account with repository access
   - Claude Code CLI installed
   - Linear account (for issue tracking)

3. **Knowledge Requirements**
   - Familiarity with TypeScript/React projects
   - Basic understanding of the 6-phase workflow (see [reference/CONCEPTS.md](../reference/CONCEPTS.md))

---

## What's Already Included

The base-web-app template provides:

**✅ Documentation Structure:**
- Complete `docs/` hierarchy (setup, workflow, agent-system, reference)
- All guides and reference materials
- Track-specific implementation guides

**✅ Claude Code Configuration:**
- `.claude/commands/` - All slash commands configured
- `.claude/skills/` - Pattern libraries (ontology, design-system, issue-workflow)
- `.claude/agents/` - Specialized agent configurations

**✅ Application Foundation:**
- Full-stack TypeScript setup (React + Express + PostgreSQL)
- Authentication system
- Ontology-driven architecture
- 50+ shadcn/ui components

---

## Setup Overview

```
1. Clone & Initialize Repository
   ↓
2. Customize for Your Project
   ↓
3. Install Dependencies
   ↓
4. Set Up Linear Integration (→ LINEAR-SETUP.md)
   ↓
5. Verify Setup
```

**Estimated time:** 1-2 hours (including Linear setup)

---

## Step 1: Clone & Initialize Repository

### Clone the Base Template

```bash
# Clone the base-web-app template
git clone https://github.com/your-org/base-web-app.git my-project
cd my-project

# Remove template git history and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit from base-web-app template"

# Create your project repository on GitHub, then:
git remote add origin https://github.com/your-org/my-project.git
git branch -M main
git push -u origin main
```

### Verify Directory Structure

The template includes these directories (no need to create them):

```
my-project/
├── .claude/                          # Claude Code configuration
│   ├── commands/                     # Slash commands
│   ├── skills/                       # Pattern libraries
│   └── agents/                       # Agent configurations
├── docs/                             # Documentation
│   ├── setup/                        # Setup guides (you're here!)
│   ├── workflow/                     # Daily operations
│   ├── agent-system/                 # Implementation guides
│   │   └── tracks/                   # Track-specific guides
│   └── reference/                    # Quick references
├── client/                           # React frontend
├── server/                           # Express backend
└── shared/                           # Shared TypeScript types
```

---

## Step 2: Customize for Your Project

### Update Project Metadata

**Edit `package.json`:**
```bash
# Update project name, description, repository URL
```

**Key fields to update:**
- `name` - Your project name
- `description` - Brief project description
- `repository.url` - Your GitHub repository URL
- `author` - Your name/organization

### Review Existing Configuration

**Understand the track organization:**

The system uses **three parallel tracks** for organizing work:

**1-ONTOLOGY (Track 1):**
- Database schemas (Object Types)
- Relationships (Links)
- Operations (Actions)
- Storage methods
- API endpoints implementing actions
- Foundation layer that other tracks depend on

**2-DESIGN-SYSTEM (Track 2):**
- UI components
- Design tokens
- Styling system
- Accessibility patterns
- Can be developed in parallel with Track 1

**3-TRACER-BULLETS (Track 3):**
- Complete end-to-end features
- Integrates Track 1 APIs + Track 2 components
- May include feature-specific orchestration endpoints
- Depends on foundation items from both tracks

**Review included commands:**

The template includes these slash commands in `.claude/commands/`:
- `/start-issue` - Begin working on Linear issue
- `/validate-issue` - Run validation checks
- `/update-status` - Update Linear issue status
- `/create-pr` - Create pull request
- `/request-supervisor-help` - Get guidance when stuck
- `/supervisor-review` - Request pre-UAT review
- `/write-tests` - Generate tests
- `/run-tests` - Run test suite
- `/add-uat` - Add UAT instructions
- Plus additional workflow commands

**See:** [reference/COMMANDS.md](../reference/COMMANDS.md) for complete list

### Review Documentation

**Navigate the documentation hub:**

Open `docs/README.md` to see the complete documentation structure. Key documents to review:

**For you (Project Lead):**
- `docs/workflow/DAILY-WORKFLOW.md` - Your daily orchestration routine
- `docs/reference/CONCEPTS.md` - Core concepts (6-phase workflow, issue types, tracks)
- `docs/reference/LINEAR-WORKFLOW.md` - Linear status management

**For AI agents:**
- `docs/agent-system/AGENT-GUIDE.md` - Core implementation principles
- `docs/agent-system/PATTERNS.md` - Code patterns to follow
- `docs/agent-system/tracks/` - Track-specific implementation guides

**All documentation is already created** - review and customize for your project as needed.

---

## Step 3: Install Dependencies

### Install Node Packages

```bash
# Install all dependencies
npm install

# Verify installation
npm run check
```

### Set Up Database

**Create environment file:**
```bash
# Copy example environment
cp .env.example .env

# Edit .env with your database connection details
```

**Initialize database:**
```bash
# Push schema to database (development)
npm run db:push

# Or generate and run migrations (production)
npm run db:generate
npm run db:migrate

# Optional: Seed with example data
npm run db:seed
```

### Verify Application Runs

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Backend API at http://localhost:5000
```

---

## Step 4: Set Up Linear Integration

**This is a critical step that must be completed before creating issues.**

Follow the detailed guide:
- **[LINEAR-SETUP.md](./LINEAR-SETUP.md)** - Configure project in existing Linear workspace

Summary of what you'll do:
1. Identify Linear teams that will work on your project (varies by org structure)
2. Verify workflow states across all teams (Backlog, Todo, In Progress, In Review, Done)
3. Verify workspace-level track labels (1-ONTOLOGY, 2-DESIGN-SYSTEM, 3-TRACER-BULLETS)
4. Create a project or cycle that will group issues from multiple teams
5. Set up Linear MCP server (security critical)
6. Verify MCP connection

**Key Insight:** Projects are cross-functional and span multiple teams. Your project will contain issues from different teams (e.g., ENG-1, PLATFORM-12, OPS-5), all grouped under one project. Team structure varies by organization.

**Estimated time:** 20-30 minutes

---

## Step 5: Verify Setup

### Quick Verification Checklist

**Application:**
- [ ] Dependencies installed (`npm install` succeeded)
- [ ] TypeScript compiles (`npm run check` passes)
- [ ] Database initialized and running
- [ ] Development server runs (`npm run dev`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responds at http://localhost:5000

**Repository:**
- [ ] Git repository initialized
- [ ] Initial commit created
- [ ] Remote origin configured (optional, for team projects)

**Claude Code:**
- [ ] Commands visible (type `/` in Claude Code)
- [ ] Skills loaded (check `.claude/skills/`)
- [ ] Agents configured (check `.claude/agents/`)

**Linear Integration:**
- [ ] All participating teams identified (varies by org structure)
- [ ] Team keys noted for all teams
- [ ] Workflow states verified across all teams
- [ ] Workspace-level track labels verified
- [ ] Project or cycle created (will group multi-team issues)
- [ ] Linear MCP server configured
- [ ] MCP connection verified (test below)

### Test the Setup

**Test 1: Application Runs**
```bash
# Start development server
npm run dev

# In browser: http://localhost:3000
# Should see the application home page
```

**Test 2: Claude Code Commands**
```bash
# Start Claude Code
claude-code

# In the chat, type:
/
```

You should see all commands listed including `/start-issue`, `/create-pr`, `/validate-issue`, etc.

**Test 3: Linear MCP Connection**

In Claude Code, ask:
```
List my Linear teams
```

Claude should be able to access your Linear workspace and return your team(s).

**Test 4: Documentation Navigation**

Open `docs/README.md` and verify:
- [ ] All links work (no 404s)
- [ ] Documentation renders correctly
- [ ] Track guides are accessible

---

## Next Steps

Once setup is complete:

1. **Review System Documentation**
   - Read [docs/README.md](../README.md) - Documentation hub
   - Review [reference/CONCEPTS.md](../reference/CONCEPTS.md) - 6-phase workflow
   - Understand [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md) - Your orchestration routine

2. **Create Project Structure** (Phase 1: Strategic Planning)
   - Create Linear project with description
   - Create Architecture document (in Linear Docs)
   - Create Glossary document (in Linear Docs)
   - See [reference/CONCEPTS.md](../reference/CONCEPTS.md) for Phase 1 details

3. **Start Development**
   - Follow the 6-phase workflow
   - Begin Phase 3: Create user stories
   - Progress to Phase 4: Create specifications
   - Generate Phase 5: Implementation issues
   - Use `/start-issue` to begin work

4. **Optional: Run Pilot Test**
   - Follow [ONBOARDING-CHECKLIST.md](./ONBOARDING-CHECKLIST.md)
   - Create 1-2 pilot implementation issues
   - Test full workflow end-to-end
   - Verify UAT instructions and review process

---

## Troubleshooting

### Application Won't Start

**Problem:** `npm run dev` fails

**Solutions:**
1. Run `npm install` to ensure dependencies are installed
2. Check Node.js version (`node --version` - need 18+)
3. Verify `.env` file exists with correct `DATABASE_URL`
4. Ensure PostgreSQL is running
5. Check for port conflicts (3000, 5000)

### Claude Code Can't Find Commands

**Problem:** Commands don't appear when typing `/`

**Solutions:**
1. Verify you're in the project root directory
2. Check `.claude/commands/` directory exists with `.md` files
3. Restart Claude Code
4. Verify Claude Code version supports commands

### Linear MCP Connection Fails

**Problem:** Claude Code can't access Linear workspace

**Solutions:**
1. Verify `LINEAR_API_KEY` environment variable is set
2. Restart terminal/IDE after setting environment variable
3. Check `.claude/.mcp.json` has correct MCP configuration
4. Verify API key has correct permissions in Linear
5. See [LINEAR-SETUP.md](./LINEAR-SETUP.md) for detailed troubleshooting

### Database Connection Errors

**Problem:** Can't connect to PostgreSQL

**Solutions:**
1. Verify PostgreSQL is installed and running
2. Check `DATABASE_URL` in `.env` file
3. Test connection: `psql $DATABASE_URL`
4. Ensure database exists or run `npm run db:push` to create schema
5. Check firewall/network settings for cloud databases

---

## Related Documentation

- **Linear Setup:** [LINEAR-SETUP.md](./LINEAR-SETUP.md) - Linear workspace configuration
- **Onboarding Checklist:** [ONBOARDING-CHECKLIST.md](./ONBOARDING-CHECKLIST.md) - Step-by-step verification
- **Daily Workflow:** [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md) - Daily operations
- **Core Concepts:** [reference/CONCEPTS.md](../reference/CONCEPTS.md) - 6-phase workflow
- **Commands:** [reference/COMMANDS.md](../reference/COMMANDS.md) - Slash command reference
