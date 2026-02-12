# Foundational Concepts

> **Single Source of Truth** - Core concepts defined here and referenced by all other documentation.

## Purpose

This document defines the foundational concepts that drive the AI-enabled multi-agent development system. All other documentation references these concepts rather than duplicating them.

---

## 6-Phase Workflow

Projects follow a **phased approach** that progressively refines requirements into implementation:

| Phase | Focus | Artifacts Created |
|-------|-------|-------------------|
| **Phase 1: Strategic Planning** | Project vision and architecture | Linear project metadata, Architecture doc, Glossary doc |
| **Phase 2: User Research** | Personas and metrics | Persona documents (1 per persona), Success Metrics doc |
| **Phase 3: Requirements Capture** | User stories and decisions | User story issues, Decision issues, Out of scope issues |
| **Phase 4: Technical Design** | Specifications and milestones | Specification issues, Milestones |
| **Phase 5: Implementation Planning** | Implementation tasks | Implementation issues (3-track), Relations, Blockers |
| **Phase 6: Development Execution** | Implementation and UAT | Code, Tests, PRs, UAT reviews |

### Phase 1: Strategic Planning

**Participants:** Project lead, technical lead, key stakeholders

**Artifacts Created:**

1. **Linear Project** with metadata:
   - Name: Project name
   - Summary: One-sentence vision
   - Description: Executive summary (capabilities, value proposition, constraints)
   - Lead: Project lead
   - Target date: Expected completion
   - Icon and color for visual identity

2. **Architecture Document**:
   - System design and data flow
   - Technology stack decisions
   - Key patterns to follow
   - Security and compliance requirements

3. **Glossary Document**:
   - Business terms and definitions
   - Domain-specific terminology
   - Acronyms and abbreviations

**Deliverables Checklist:**
- [ ] Linear project created with complete description
- [ ] Architecture document drafted
- [ ] Glossary document created with initial terms
- [ ] Project lead assigned
- [ ] Target timeline set

### Phase 2: User Research & Personas

**Participants:** Product managers, SMEs, technical lead

**Artifacts Created:**

1. **Persona Documents** (1 per persona):
   - Role name and primary responsibilities
   - Key needs and goals
   - Frustrations with current tools
   - Technical proficiency level

2. **Success Metrics Document**:
   - KPIs (business metrics)
   - Technical metrics (performance, uptime)
   - User adoption metrics
   - How to measure and track

**Collaboration:**
- Product managers draft personas based on user research
- SMEs review and validate persona accuracy
- Technical lead reviews for feasibility
- Use Linear comments for feedback and iteration

**Deliverables Checklist:**
- [ ] All persona documents created and attached to project
- [ ] Success metrics document created
- [ ] SMEs have reviewed and approved personas
- [ ] Metrics are measurable and time-bound

### Phase 3: Requirements Capture

**Participants:** SMEs, product lead, technical lead

**Artifacts Created:**

1. **Development Plan Document** (Linear document):
   - **Business Requirements Section:** User stories with acceptance criteria
   - **Technical Design Section:** Phases, Object Types, APIs, UI components
   - Serves as single source of truth for both business needs and implementation specs
   - Parsed by `/generate-linear-issues` to create implementation issues

2. **Decision Issues** (`decision` label):
   - Key architectural decisions needing input
   - Business process decisions
   - Options with pros/cons
   - Recommendation with rationale

3. **Out of Scope Issues** (`out-of-scope-v1` label):
   - Features explicitly deferred
   - Reason for deferral
   - When to reconsider

**Collaboration:**
- SMEs provide user stories from business perspective
- Product lead prioritizes stories
- Technical lead reviews for feasibility and estimates complexity
- Decision issues tagged with stakeholders for input

**Deliverables Checklist:**
- [ ] All user stories created as Linear issues
- [ ] Each story has acceptance criteria
- [ ] Stories prioritized (High/Medium/Low)
- [ ] Key decisions documented as decision issues
- [ ] Out of scope features tracked

### Phase 4: Technical Design

**Participants:** Technical lead (primary), team reviews, SMEs validate

**Artifacts Created:**

1. **Milestones** (one per development phase):
   - Phase name and description
   - Target date
   - Grouped issues

2. **Specification Issues** (`design` label):
   - One per Object Type to design
   - Proposed fields, types, constraints
   - Proposed links (relationships)
   - Proposed actions (API endpoints)
   - Open questions for review
   - Links to user stories it satisfies (via Linear relations: "satisfies")

**Collaboration:**
- Technical lead drafts specifications from user stories
- Team reviews via Linear comments
- SMEs validate business rules and data model
- Iterate until approved (change state to "Approved")

**State Flow:** Draft → Under Review → Approved

**Deliverables Checklist:**
- [ ] Milestones created for each development phase
- [ ] Specification issue created for each Object Type
- [ ] Each spec links to user stories it satisfies
- [ ] All specs reviewed by team
- [ ] All specs approved by SMEs
- [ ] Open questions resolved

### Phase 5: Implementation Planning

**Participants:** Technical lead generates, team adjusts

**Artifacts Created:**

1. **Implementation Issues** (three-track structure):
   - **1-ONTOLOGY**: Database schema, storage methods, API endpoints
   - **2-DESIGN-SYSTEM**: UI components, design tokens, layouts
   - **3-TRACER-BULLETS**: End-to-end features

2. **Issue Relations**:
   - Each implementation issue links to specification (via "implements" relation)
   - Each implementation issue links to user stories (via "satisfies" relation)
   - Blocker relationships between issues

3. **Milestone Assignment**:
   - Issues grouped by milestone
   - Estimates added (story points or time)

**Collaboration:**
- Technical lead generates issues from approved specs
- Team reviews estimates and priorities
- Adjust milestone assignments based on capacity
- Verify blocker relationships are correct

**Deliverables Checklist:**
- [ ] Implementation issues created for all approved specs
- [ ] Issues labeled with correct track (1/2/3)
- [ ] Issues linked to specs and user stories
- [ ] Blocker relationships set up
- [ ] Issues assigned to milestones
- [ ] Estimates added

### Phase 6: Development Execution

**Participants:** Agents, developers, reviewers

**Workflow:**
- `/start-issue ENG-123` - Start implementation work
- `/validate-issue ENG-123` - Validate completeness
- `/add-uat ENG-123` - Add UAT instructions
- `/create-pr ENG-123` - Create pull request
- `/update-status ENG-123 done` - Mark complete

**UAT Review validates against:**
- Specification criteria (from linked spec issue)
- User story acceptance criteria (from linked user stories)
- Success metrics (from Success Metrics document)

**Deliverables per Issue:**
- [ ] Code implementation (all acceptance criteria met)
- [ ] Tests (use `/write-tests ENG-123`)
- [ ] UAT instructions (added as comment to issue)
- [ ] PR created and linked
- [ ] UAT review approved
- [ ] Merged to main, status set to "Done"

---

## Issue Types

**5 types of issues used in this workflow:**

### 1. User Story Issues

**Label:** `user-story`
**Created in:** Phase 3 (Requirements Capture)
**Title Format:** `[Module] As a [persona], I can [action]`

**Purpose:** Capture atomic business requirements from the user's perspective

**Description Contains:**
- User story: "As a [persona], I can [action] so that [benefit]"
- Acceptance criteria (specific, testable conditions)
- Priority (High/Medium/Low)
- Link to persona document

**Links:**
- References persona document (via URL in description)
- Linked to by specification issues (via "satisfies" relation)
- Linked to by implementation issues (via "satisfies" relation)

### 2. Specification Issues

**Label:** `design`
**Created in:** Phase 4 (Technical Design)
**Title Format:** `[Design] {ObjectName} Object Type Specification`

**Purpose:** Technical design reviewed before implementation

**Description Contains:**
- Proposed fields, types, constraints
- Proposed links (relationships to other Object Types)
- Proposed actions (API endpoints)
- Open questions for review

**State Flow:** Draft → Under Review → Approved

**Links:**
- References Development Plan document for business context
- Linked to by implementation issues (optional)

### 2. Decision Issues

**Label:** `decision`
**Created in:** Phase 3 or Phase 4
**Title Format:** `Decision: [Decision Area]`

**Purpose:** Document key architectural and business decisions

**Description Contains:**
- Context and background
- Options considered with pros/cons
- Recommendation with rationale
- Stakeholders consulted

### 3. Implementation Issues

**Labels:** `1-ONTOLOGY`, `2-DESIGN-SYSTEM`, or `3-TRACER-BULLETS`
**Created in:** Phase 5 (Implementation Planning) - typically generated by `/generate-linear-issues`
**Title Format:** Varies by track (see Track Organization below)

**Purpose:** Executable work items for development

**Links:**
- References Development Plan document for business context and technical specs
- May have blocker relationships with other implementation issues (phase and track dependencies)

**Description Contains:**
- Business context (which user stories this implements)
- Implementation scope
- Technical approach
- UAT instructions section
- Links to related issues and Development Plan

### 4. Out of Scope Issues

**Label:** `out-of-scope-v1`
**Created in:** Phase 3 (Requirements Capture)
**Title Format:** `[Deferred] {Feature Name}`

**Purpose:** Track features explicitly deferred to later versions

**Description Contains:**
- Feature description
- Reason for deferral
- When to reconsider (e.g., "After v1.0 launch", "If user demand increases")

---

## Track Organization

Implementation work is organized into **three parallel tracks** that align with architectural layers:

### 1-ONTOLOGY (Track 1)

**Focus:** Data foundation and business logic

**Includes:**
- Database schema definitions (Object Types)
- Foreign keys and junction tables (Links)
- Actions and their implementations
- Storage methods (IStorage interface + DatabaseStorage)
- API endpoints (CRUD + Action endpoints)
- Data validation with Zod

**Why separate?**
- Foundation layer that other tracks depend on
- Can be developed and tested independently
- Clear separation of data model from presentation

**Issue Numbering:** Issues use the team prefix (e.g., ENG-1, PLATFORM-5). Track 1 issues created first will have lower numbers within each team's sequence.

### 2-DESIGN-SYSTEM (Track 2)

**Focus:** UI foundation and component library

**Includes:**
- Design tokens (colors, typography, spacing)
- Base components (shadcn/ui customizations)
- Mobile-first responsive design
- Accessibility (ARIA, keyboard navigation)
- Component documentation

**Why separate?**
- Can be developed in parallel with Track 1
- Reusable components across all features
- Consistent design language

**Issue Numbering:** Issues use the team prefix (e.g., FRONTEND-1, PRODUCT-10). Track 2 issues may have higher numbers if Track 1 issues were created first within the same team.

### 3-TRACER-BULLETS (Track 3)

**Focus:** End-to-end feature integration

**Includes:**
- Complete user workflows
- Integration of ontology (Track 1) + design system (Track 2)
- Business logic implementation
- User-facing pages and flows
- Feature-specific API orchestration (if needed)

**Why separate?**
- Depends on foundation items from both Track 1 and 2
- Represents complete, testable user functionality
- Easy to prioritize based on business value

**Issue Numbering:** Issues use the team prefix (e.g., INT-1, ENG-25). Track 3 issues may have higher numbers if other track issues were created first within the same team.

### Track Assignment Guidelines

**Track labels are the source of truth** - not issue numbers. While Linear auto-assigns sequential numbers, you can maintain logical grouping by creating Track 1 issues first, then Track 2, then Track 3.

**Dependency Pattern:**
- Track 3 issues often depend on (are blocked by) Track 1 and Track 2 issues
- Track 1 and Track 2 can usually be developed in parallel
- Use Linear's "blocks" relation to represent dependencies

---

## Traceability Chain

**How artifacts link together through the workflow:**

```
Development Plan Document
  § Business Requirements (US-001, US-002...)
  § Technical Design (Phases, Object Types, APIs)
       ↓ parsed by /generate-linear-issues
  Implementation Issues (ENG-15, FRONTEND-12, INT-8)
       ↓ references Development Plan in description
       ↓ implements specific phase/user story
       ↓ UAT Review (Comments on implementation issues)
       ↓ validates against
  User Story Acceptance Criteria (from Development Plan) ✓
```

**Why this matters:**
- Every line of code traces back to business requirements via Development Plan
- Single source of truth for requirements AND technical design
- UAT reviewers verify work against user story acceptance criteria in Development Plan
- Product owners track feature completion by phase
- Changes to Development Plan can identify affected implementation issues

---

## Artifact Mapping

**What goes where in Linear:**

| Artifact Type | Linear Feature | Labels | Purpose |
|--------------|----------------|--------|---------|
| Executive Summary, Vision | Project `description` + `summary` | - | High-level project info |
| Architecture, Glossary | Linear Documents | - | Focused reference docs |
| User Personas | Linear Documents (1 per persona) | - | User research |
| Success Metrics | Linear Document | - | KPIs and measurement |
| Project Phases | Linear Milestones | - | Timeline tracking |
| Development Plan | Linear Document (per project) | - | Business requirements + technical design |
| Key Decisions | Linear Issues | `decision` | Architectural decisions |
| Out of Scope | Linear Issues | `out-of-scope-v1` | Deferred features |
| Object Type Specifications | Linear Issues (optional) | `design` | Technical design (alternative to Development Plan) |
| Implementation Tasks | Linear Issues | `1-ONTOLOGY`, `2-DESIGN-SYSTEM`, `3-TRACER-BULLETS` | Executable work |

---

## Progressive Refinement Flow

**How the workflow transforms requirements into implementation:**

```
Phase 1: Strategic Planning
  ↓ Creates: Project structure, Architecture doc, Glossary doc
Phase 2: User Research
  ↓ Creates: Persona docs, Success Metrics doc
Phase 3: Requirements Capture
  ↓ Creates: User story issues, Decision issues
Phase 4: Technical Design
  ↓ Creates: Specification issues (link to user stories)
Phase 5: Implementation Planning
  ↓ Creates: Implementation issues (link to specs & stories)
Phase 6: Development Execution
  ↓ Agents implement, UAT validates against specs & stories
```

**Key Principle:** Each phase builds on the previous phase's artifacts, creating a clear chain of traceability from business vision to working code.

---

## Related Documentation

- **Setup Guides:** See [setup/PROJECT-SETUP.md](../setup/PROJECT-SETUP.md) and [setup/LINEAR-SETUP.md](../setup/LINEAR-SETUP.md)
- **Daily Workflow:** See [workflow/DAILY-WORKFLOW.md](../workflow/DAILY-WORKFLOW.md)
- **Agent Implementation:** See [agent-system/AGENT-GUIDE.md](../agent-system/AGENT-GUIDE.md)
- **Slash Commands:** See [COMMANDS.md](./COMMANDS.md)
- **Linear Workflow:** See [LINEAR-WORKFLOW.md](./LINEAR-WORKFLOW.md)
- **Issue Templates:** See [TEMPLATES.md](./TEMPLATES.md)
