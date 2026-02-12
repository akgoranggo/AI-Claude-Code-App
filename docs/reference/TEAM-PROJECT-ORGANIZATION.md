# Team and Project Organization

> **Reference Guide** - How teams and projects interact in the agentic workflow

## Purpose

This guide explains how Linear teams and projects work together in multi-team environments. Understanding this relationship is critical for effectively organizing work across multiple teams.

**Audience:** Project leads, workspace administrators

---

## Core Concepts

### Teams vs. Projects

**Teams** and **Projects** serve different purposes in Linear:

| Aspect | Teams | Projects |
|--------|-------|----------|
| **Purpose** | Organizational units | Cross-functional initiatives |
| **Structure** | Permanent, skill-based | Temporary, goal-based |
| **Examples** | Backend, Frontend, Design | User Auth, Payment System |
| **Issue Ownership** | Issues belong to ONE team | Projects group issues from MANY teams |
| **Issue Numbering** | Team-specific (BACKEND-1, FRONTEND-1) | N/A - issues keep team prefix |
| **Workflow States** | Team-specific configuration | N/A - uses team's workflow |
| **Scope** | Ongoing responsibilities | Specific deliverable or milestone |

### Mental Model

```
Workspace (Organization)
│
├── Teams (Functional Units)
│   │
│   ├── Backend Team
│   │   ├── Issues: BACKEND-1, BACKEND-2, BACKEND-3, ...
│   │   ├── Workflow: Backlog → Todo → In Progress → In Review → Done
│   │   └── Responsibilities: APIs, databases, storage
│   │
│   ├── Frontend Team
│   │   ├── Issues: FRONTEND-1, FRONTEND-2, FRONTEND-3, ...
│   │   ├── Workflow: Backlog → Todo → In Progress → In Review → Done
│   │   └── Responsibilities: UI components, client-side logic
│   │
│   └── Integration Team
│       ├── Issues: INT-1, INT-2, INT-3, ...
│       ├── Workflow: Backlog → Todo → In Progress → In Review → Done
│       └── Responsibilities: E2E features, orchestration
│
└── Projects (Cross-Functional Initiatives)
    │
    ├── Project: User Authentication
    │   ├── BACKEND-12: Auth API endpoints (Track 1)
    │   ├── BACKEND-15: Session storage (Track 1)
    │   ├── FRONTEND-8: Login form component (Track 2)
    │   ├── FRONTEND-9: Auth context provider (Track 2)
    │   └── INT-3: E2E auth flow (Track 3)
    │
    └── Project: Payment System
        ├── BACKEND-24: Payment schema (Track 1)
        ├── BACKEND-27: Payment API (Track 1)
        ├── FRONTEND-14: Checkout UI (Track 2)
        ├── FRONTEND-16: Payment form (Track 2)
        └── INT-7: E2E checkout flow (Track 3)
```

---

## How Teams and Projects Work Together

### 1. Projects Group Cross-Team Work

A project represents a complete feature or initiative that requires collaboration across multiple teams:

**Example: User Authentication Project**
- **Backend team** implements database schemas and API endpoints (Track 1)
- **Frontend team** builds login forms and auth UI components (Track 2)
- **Integration team** connects everything into E2E auth flows (Track 3)

All these issues belong to the same **project** but different **teams**.

### 2. Issues Belong to Teams, Not Projects

When creating an issue, you must specify:
- **Team:** Which team will work on it (determines issue prefix)
- **Project:** Which project it contributes to (groups related work)

**Example:**
```
Issue: BACKEND-45
Title: "Implement JWT authentication endpoints"
Team: Backend
Project: User Authentication
Track: 1-ONTOLOGY
```

### 3. Track Labels Organize by Work Type

Track labels cut across teams and help organize work by type:

- **Track 1 (ONTOLOGY):** Typically Backend team, but can be any team
- **Track 2 (DESIGN-SYSTEM):** Typically Frontend team, but can be any team
- **Track 3 (TRACER-BULLETS):** Integration team or cross-functional

**Example filters:**
- "Show me all Track 1 issues in the User Auth project" → Might include BACKEND-12, BACKEND-15
- "Show me all Backend team issues" → All issues across all projects from Backend team
- "Show me all issues in User Auth project" → All teams' issues for this project

---

## The Workflow Adapts to ANY Team Structure

### Critical Concept: Tracks ≠ Teams

**The most important thing to understand:** Track labels describe the TYPE OF WORK, not which team should do it.

| Concept | What It Means |
|---------|---------------|
| **Tracks** | Categories of work (Ontology, Design System, Tracer Bullets) |
| **Teams** | Your organization's structure (whatever it is) |
| **The Relationship** | Any team can work on any track |

**There is NO "correct" team structure for this workflow.** The workflow adapts to:
- Traditional Backend/Frontend/Integration teams
- Advanced Engineer/Operator Engineer/Operator teams
- Platform/Product/Data teams
- Single full-stack Engineering team
- Specialized teams (ML, Security, DevOps, etc.)
- Any other structure your organization uses

### Track Definitions (Team-Independent)

| Track | Work Type | Any Team Can Do This |
|-------|-----------|---------------------|
| **1-ONTOLOGY** | Data layer work: schemas, storage, APIs, data models | Platform, Data, Engineering, Backend, Advanced, etc. |
| **2-DESIGN-SYSTEM** | Presentation layer: UI components, styling, layouts | Product, Frontend, Engineering, Operator, etc. |
| **3-TRACER-BULLETS** | Integration: E2E features, workflows, orchestration | Any team working on complete features |

**The track label describes WHAT KIND OF WORK it is, not WHO does it.**

---

## Team Structure Examples

### Example Structure 1: Skill-Based Teams

**Teams:** Advanced Engineer, Operator Engineer, Operator

**How tracks map:**
- **Advanced Engineer Team:** All tracks, focusing on complex/novel problems
  - Track 1: Complex data models, performance-critical APIs
  - Track 2: Reusable UI frameworks, design systems
  - Track 3: Complex orchestration, multi-service integration

- **Operator Engineer Team:** Primarily Track 1 and Track 3
  - Track 1: Operational data schemas, monitoring APIs
  - Track 3: Automation workflows, deployment pipelines

- **Operator Team:** Primarily Track 2 and Track 3
  - Track 2: Operator-facing UI components, dashboards
  - Track 3: End-to-end operator workflows

**Example project issues:**
```
Project: Deployment Automation
├── ADVANCED-10: Deployment state machine (Track 1)
├── ADVANCED-11: Rollback algorithm (Track 1)
├── OPENG-15: Deployment status API (Track 1)
├── OPENG-16: Deployment automation service (Track 3)
├── OPS-20: Deployment dashboard UI (Track 2)
└── OPS-21: Manual rollback workflow (Track 3)
```

### Example Structure 2: Platform/Product Split

**Teams:** Platform, Product

**How tracks map:**
- **Platform Team:** Primarily Track 1, some Track 3
  - Track 1: Core infrastructure, APIs, data models
  - Track 3: Platform frameworks, SDK integrations

- **Product Team:** Primarily Track 2, some Track 3
  - Track 2: Customer-facing UI, design system
  - Track 3: End-to-end product features

**Example project issues:**
```
Project: User Management
├── PLATFORM-30: User schema and storage (Track 1)
├── PLATFORM-31: User management API (Track 1)
├── PLATFORM-32: Authentication framework (Track 3)
├── PRODUCT-40: User profile component (Track 2)
├── PRODUCT-41: User settings UI (Track 2)
└── PRODUCT-42: Profile editing flow (Track 3)
```

### Example Structure 3: Single Full-Stack Team

**Teams:** Engineering (just one team)

**How tracks map:**
- **Engineering Team:** All three tracks
  - Track 1: Database schemas, APIs
  - Track 2: UI components, styling
  - Track 3: Complete features

**Why tracks still matter:** Even with one team, categorizing work by type is useful for:
- Organizing the backlog ("Let's do all Track 1 work first")
- Understanding dependencies ("Track 3 issues need Track 1 and Track 2 done")
- Progress tracking ("We're 80% done with Track 1, 40% done with Track 2")

**Example project issues:**
```
Project: Admin Dashboard
├── ENG-10: Admin user schema (Track 1)
├── ENG-11: Admin permissions API (Track 1)
├── ENG-12: Dashboard layout component (Track 2)
├── ENG-13: Navigation component (Track 2)
└── ENG-14: User management page (Track 3)
```

### Example Structure 4: Many Specialized Teams

**Teams:** Data, ML, Backend, Frontend, Mobile, DevOps, Security

**How tracks map:** Each team works on the tracks relevant to their domain
- **Data Team:** Exclusively Track 1 (schemas, pipelines, warehousing)
- **ML Team:** Track 1 (model storage), Track 3 (ML pipelines)
- **Backend Team:** Track 1 (APIs), Track 3 (service orchestration)
- **Frontend Team:** Track 2 (web UI), Track 3 (web features)
- **Mobile Team:** Track 2 (mobile UI), Track 3 (mobile features)
- **DevOps Team:** Track 1 (infrastructure as code), Track 3 (CI/CD)
- **Security Team:** All tracks (security cuts across all layers)

**Example project issues:**
```
Project: Recommendations System
├── DATA-50: User behavior schema (Track 1)
├── DATA-51: Clickstream pipeline (Track 1)
├── ML-60: Recommendation model storage (Track 1)
├── ML-61: Model training pipeline (Track 3)
├── BACKEND-70: Recommendations API (Track 1)
├── BACKEND-71: API caching layer (Track 1)
├── FRONTEND-80: Recommendation carousel (Track 2)
├── FRONTEND-81: Recommendations page (Track 3)
├── MOBILE-90: Recommendation cards (Track 2)
├── MOBILE-91: In-app recommendations (Track 3)
├── DEVOPS-100: Model deployment pipeline (Track 3)
└── SECURITY-110: PII handling in recommendations (Track 1, 2, 3)
```

---

## How to Decide Which Team Owns an Issue

Since tracks don't prescribe teams, how do you decide?

### Decision Framework

Ask these questions in order:

1. **Expertise:** Which team has the knowledge/skills for this work?
2. **Code Location:** Where will this code primarily live?
3. **Ownership:** Which team owns the area this touches?
4. **Capacity:** Which team has bandwidth?
5. **Convention:** Does your org have established patterns?

### Examples of Decision-Making

**Issue: "Implement user authentication API endpoints"**
- Track: 1-ONTOLOGY (it's API work)
- Team options: Backend team, Platform team, Engineering team, API team
- Decision factors:
  - Who owns the authentication service?
  - Who has expertise in auth patterns?
  - Who has capacity?
- Result: Assign to whichever team makes sense for YOUR organization

**Issue: "Build operator dashboard layout"**
- Track: 2-DESIGN-SYSTEM (it's UI work)
- Team options: Frontend team, Operator team, Product team, Engineering team
- Decision factors:
  - Who understands operator workflows?
  - Who owns the design system?
  - Who will maintain this long-term?
- Result: Could be Operator team (domain knowledge) OR Frontend team (UI expertise)

**Issue: "Implement end-to-end checkout flow"**
- Track: 3-TRACER-BULLETS (it's integration work)
- Team options: Integration team, full-stack team, Product team, Engineering team
- Decision factors:
  - Does the team span both frontend and backend?
  - Who owns the complete user experience?
  - Who can coordinate across systems?
- Result: Depends entirely on your organization structure

### Multiple Teams on Same Track

It's common for multiple teams to work on the same track within a project:

**Example: Track 1 (Ontology) in Payment System project**
- **Backend team:** Payment database schema (BACKEND-24)
- **Backend team:** Payment processing API (BACKEND-27)
- **Data team:** Analytics events for payments (DATA-15)

All three issues are Track 1, same project, but may belong to different teams based on responsibilities.

---

## Workflow State Standardization

### Why States Must Be Consistent Across Teams

For multi-team projects to work smoothly, **all teams must use the same 5 workflow states**:

1. **Backlog** (type: Backlog)
2. **Todo** (type: Unstarted)
3. **In Progress** (type: Started)
4. **In Review** (type: Started)
5. **Done** (type: Completed)

**Why this matters:**
- **Cross-team dependencies:** FRONTEND-8 might depend on BACKEND-12. Both teams must use the same state names.
- **Consistent reporting:** Project dashboards show status across all teams uniformly.
- **Automated workflows:** Commands like `/start-issue` and `/update-status` work across all teams.

### Team-Specific Customization

Teams can have **additional** states beyond the core 5, but the core states must exist:

**Acceptable:**
```
Backend Team: Backlog → Todo → In Progress → Code Review → In Review → Done
                                              ↑ extra state
```

**Not Acceptable:**
```
Backend Team: Planned → Ready → Doing → Testing → Complete
              ↑ completely different state names
```

---

## Label Scope: Workspace vs. Team

### Track Labels MUST Be Workspace-Scoped

For multi-team projects, track labels **must be available to all teams**:

**Correct Setup:**
- **1-ONTOLOGY**, **2-DESIGN-SYSTEM**, **3-TRACER-BULLETS** are workspace-level labels
- All teams can apply these labels to their issues
- Enables filtering across teams: "Show all Track 1 issues"

**Incorrect Setup:**
- Backend team has "1-ONTOLOGY" label
- Frontend team has separate "1-ONTOLOGY" label
- Labels are team-scoped and not shared
- Results in inconsistent labeling and broken filters

### Other Labels Can Be Team-Scoped

Additional labels (like `user-story`, `design`, `decision`) can be either workspace or team-scoped depending on your needs.

---

## Cross-Team Dependencies

### How Dependencies Work Across Teams

Issues from different teams can depend on each other:

**Example:**
```
FRONTEND-8: "Login form component"
  ↓ blocks
  ↓ depends on
BACKEND-12: "Auth API endpoints"
```

**Dependency Management:**
1. **Mark dependencies in Linear:** Use "Blocked by" and "Blocks" relations
2. **Track dependencies:** Issues move to "Todo" only when dependencies are "Done"
3. **Cross-team coordination:** Project lead monitors dependencies across teams
4. **Commands respect dependencies:** `/start-issue` checks dependencies before starting

**Best Practice:** Keep dependency chains short and make them explicit. Long dependency chains across teams increase coordination overhead.

---

## Practical Examples

**Note:** These examples use traditional Backend/Frontend/Integration team names for illustration, but the same patterns work with ANY team structure. Replace team names with your organization's actual teams (Advanced/Operator, Platform/Product, etc.).

### Example 1: Small Project (Single Team)

**Project:** Internal Admin Dashboard
**Teams:** Just Frontend team

```
Project: Admin Dashboard
├── FRONTEND-10: Dashboard layout (Track 2)
├── FRONTEND-11: User list table (Track 2)
├── FRONTEND-12: Settings page (Track 2)
└── FRONTEND-13: Navigation component (Track 2)
```

Even a single-team project uses the same organizational principles.

### Example 2: Medium Project (Two Teams)

**Project:** Notification System
**Teams:** Backend + Frontend

```
Project: Notification System
├── BACKEND-30: Notification schema (Track 1)
├── BACKEND-31: Notification API endpoints (Track 1)
├── BACKEND-32: Email service integration (Track 1)
├── FRONTEND-20: Notification bell component (Track 2)
├── FRONTEND-21: Notification list UI (Track 2)
└── FRONTEND-22: Notification preferences (Track 2)
```

Dependencies:
- FRONTEND-20 depends on BACKEND-31 (API must exist before UI can fetch data)

### Example 3: Large Project (Three+ Teams)

**Project:** E-Commerce Checkout
**Teams:** Backend + Frontend + Integration + Data

```
Project: E-Commerce Checkout
├── BACKEND-50: Order schema (Track 1)
├── BACKEND-51: Payment integration API (Track 1)
├── BACKEND-52: Inventory check API (Track 1)
├── FRONTEND-35: Shopping cart UI (Track 2)
├── FRONTEND-36: Checkout form (Track 2)
├── FRONTEND-37: Order confirmation page (Track 2)
├── INT-10: E2E checkout flow (Track 3)
├── INT-11: Payment failure handling (Track 3)
└── DATA-8: Checkout analytics events (Track 1)
```

Complex dependency graph with multiple cross-team dependencies.

---

## Commands and Multi-Team Projects

### How Commands Work Across Teams

All workflow commands work seamlessly across teams because they use **issue IDs** that include the team prefix:

**Commands:**
- `/start-issue BACKEND-45` - Works with Backend team issues
- `/start-issue FRONTEND-23` - Works with Frontend team issues
- `/update-status INT-12 in-review` - Works with Integration team issues

**The commands don't care about teams** - they work with any issue ID format.

### Viewing Multi-Team Projects

**In Linear:**
- Filter by project: "Project = User Auth" → Shows all teams' issues
- Filter by track: "Label = 1-ONTOLOGY AND Project = User Auth" → Shows Track 1 issues from all teams
- Filter by team: "Team = Backend" → Shows all Backend issues across all projects

**In Claude Code:**
- "Show me all issues in the User Auth project"
- "List Track 1 issues for User Auth project"
- "Show me all Backend team issues in User Auth"

---

## Common Pitfalls

### ❌ Pitfall 1: One Team Per Project

**Wrong thinking:** "My project needs a dedicated team"

**Reality:** Projects span multiple teams. Don't create a new team for each project.

**Correct approach:** Use existing functional teams (whatever structure your org has) and group their issues under a project.

### ❌ Pitfall 2: Team-Scoped Track Labels

**Wrong setup:** Each team creates their own "1-ONTOLOGY" label

**Problem:** Can't filter or organize work across teams by track

**Correct setup:** Track labels are workspace-level and available to all teams

### ❌ Pitfall 3: Different Workflow States Per Team

**Wrong setup:** Backend uses "Planned → Doing → Testing → Done", Frontend uses "Todo → In Progress → Review → Complete"

**Problem:** Dependencies break, status reporting is inconsistent

**Correct setup:** All teams use the same 5 core states (Backlog → Todo → In Progress → In Review → Done)

### ❌ Pitfall 4: Assigning Issues to Wrong Team

**Wrong approach:** "This is a Track 1 issue, so it must go to Backend team"

**Problem:** Rigid rules don't account for organizational structure

**Correct approach:** Consider which team has the expertise, where the code lives, and your org structure

---

## Migration from Single-Team to Multi-Team

If your organization starts with single-team projects and grows to multi-team:

### Step 1: Standardize Workflow States

Ensure all teams adopt the same 5 core workflow states.

### Step 2: Move Labels to Workspace-Level

Migrate track labels from team-scoped to workspace-scoped.

### Step 3: Update Project Structure

Projects can now contain issues from multiple teams without any code changes.

### Step 4: Document Team Responsibilities

Clarify which teams own which tracks (as guidelines, not rules).

---

## Related Documentation

- **Setup:** [setup/LINEAR-SETUP.md](../setup/LINEAR-SETUP.md) - Configure Linear for multi-team projects
- **Core Concepts:** [reference/CONCEPTS.md](./CONCEPTS.md) - 6-phase workflow and track system
- **Linear Workflow:** [reference/LINEAR-WORKFLOW.md](./LINEAR-WORKFLOW.md) - Status management and dependencies
- **Daily Workflow:** [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md) - Daily orchestration across teams
