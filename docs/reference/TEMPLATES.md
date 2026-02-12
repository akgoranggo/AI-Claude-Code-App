# Issue and PR Templates

> **Copy-Paste Ready Templates** - All templates consolidated in one place for easy reference.

## Purpose

This document provides ready-to-use templates for all Linear issue types and GitHub pull requests. Copy the appropriate template and fill in the placeholders.

---

## Linear Issue Templates

> **Note on Business Requirements:** User stories and business requirements now live in the **Development Plan document**, not as separate issues. This keeps Linear issues focused purely on implementation tasks, aligned with Linear Method principles.

### 1. Specification Issue Template

**When to use:** Phase 4 (Technical Design) - Optional, as an alternative to designing directly in Development Plan document

**Title Format:** `[Design] {ObjectName} Object Type Specification`

**Example:** `[Design] Resource Object Type Specification`

**Labels:** `design`

**State:** `Draft` (will move to `Under Review` → `Approved`)

**Description Template:**
```markdown
## Overview

[What this Object Type represents in the domain]

**Example:** The Resource Object Type represents bookable resources like consultation rooms, treatment beds, or equipment that patients can schedule.

## Business Requirements

**From Development Plan:** [Link to Development Plan document]

**Implements:**
- US-001: [User story title from Development Plan]
- US-002: [User story title from Development Plan]

## Proposed Fields

| Field Name | Type | Required | Default | Description |
|------------|------|----------|---------|-------------|
| id | ULID | Yes | auto | Unique identifier |
| name | string(255) | Yes | - | Resource name |
| type | string(50) | Yes | - | Resource type (room, equipment, etc.) |
| organizationId | ULID | Yes | - | Organization owner |
| isActive | boolean | Yes | true | Whether resource is currently available |
| createdAt | timestamp | Yes | now() | Creation timestamp |
| updatedAt | timestamp | Yes | now() | Last update timestamp |

## Proposed Links (Relationships)

| Link Name | To Object | Cardinality | Description |
|-----------|-----------|-------------|-------------|
| organization | Organization | Many-to-One | Which organization owns this resource |
| scheduleBlocks | ScheduleBlock | One-to-Many | Schedule blocks for this resource |

**Implementation:**
- Many-to-One: Foreign key column (`organizationId`)
- One-to-Many: Reference from child table (ScheduleBlock has `resourceId`)
- Many-to-Many: Junction table (`resource_tag` if needed)

## Proposed Actions

### Action: Activate

**Description:** Marks a resource as active and available for scheduling

**API Endpoint:** `POST /api/resources/:id/activate`

**Input Parameters:**

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| - | - | - | No input parameters |

**Business Rules:**
- Only organization admins can activate resources
- Resource must exist and belong to user's organization

**Effects:**
- Sets `isActive = true`
- Logs activation event
- Notifies scheduling system

### Action: Deactivate

**Description:** Marks a resource as inactive and unavailable

**API Endpoint:** `POST /api/resources/:id/deactivate`

**Input Parameters:**

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| reason | string | No | Max 500 chars |

**Business Rules:**
- Only organization admins can deactivate resources
- Cannot deactivate if active bookings exist (must cancel first)

**Effects:**
- Sets `isActive = false`
- Cancels future schedule blocks
- Notifies affected users

## Open Questions

- [ ] Should we support resource capacity (e.g., room holds 4 people)?
- [ ] Do resources need location/building information?
- [ ] Should we track resource maintenance schedules?

## Review Status

- [ ] Technical lead review
- [ ] Team review
- [ ] SME validation
- [ ] Approved for implementation
```

---

### 2. Decision Issue Template

**When to use:** Phase 3 or Phase 4 (when architectural or business decisions need to be made)

**Title Format:** `Decision: [Decision Area]`

**Example:** `Decision: Authentication Method for Mobile App`

**Labels:** `decision`

**Description Template:**
```markdown
## Decision Context

[What decision needs to be made and why]

**Example:** We need to decide how users will authenticate in the mobile app. The web app uses session cookies, but mobile apps typically use tokens.

## Stakeholders

- **Decision maker**: [Name/Role]
- **Input needed from**: [Names/roles]
- **Impacted teams**: [Teams/areas]

## Options

### Option A: [Option Name]

**Description:** [Detailed description]

**Example:** Use JWT tokens with refresh token rotation

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Effort:** [Estimate - Small/Medium/Large or hours]

### Option B: [Option Name]

**Description:** [Detailed description]

**Example:** Use OAuth 2.0 with PKCE flow

**Pros:**
- Industry standard
- Built-in security best practices

**Cons:**
- More complex implementation
- Requires OAuth server setup

**Effort:** Medium (2-3 weeks)

### Option C: [Option Name] (if applicable)

[Same structure as Option A/B]

## Recommendation

**Recommended:** [Option A/B/C]

**Rationale:** [Why this option is best given the constraints and requirements]

**Next Steps:**
1. [Step 1 - e.g., Get stakeholder approval]
2. [Step 2 - e.g., Create implementation issues]
3. [Step 3 - e.g., Update architecture document]

## Decision Outcome

[To be filled after decision is made]

**Decision:** [Chosen option]
**Date:** [YYYY-MM-DD]
**Rationale:** [Final reasoning if different from recommendation]
**Implementation Issues:** [Links to TEAM-XXX issues created]
```

---

### 3. Development Plan Document Template

**When to use:** Phase 4 (Technical Design)

**Document Type:** Linear Document attached to project

**Title Format:** `[Project Name] — Development Plan`

**Example:** `Scheduling System — Development Plan`

**Purpose:** Single source of truth containing business requirements AND technical design specifications. This document is parsed by `/generate-linear-issues` to create implementation issues.

**Template:**

```markdown
# [Project Name] — Development Plan

> **Purpose:** This document defines both business requirements and technical design for [Project Name]. It serves as the single source of truth for what we're building and why.

---

## 1. Business Requirements

### Overview

[High-level description of what this project delivers and why it matters]

**Example:** The Scheduling System enables clinic staff to manage resources (rooms, equipment) and allows patients to book appointments. This replaces the current manual booking process, reducing scheduling errors and improving patient experience.

### User Stories

#### US-001: [Feature Name]

**As a** [persona name]
**I can** [action/capability]
**So that** [business value/benefit]

**Acceptance Criteria:**
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

**Priority:** [High/Medium/Low]

**Example:**

#### US-001: Resource Management

**As a** clinic manager
**I can** create and manage bookable resources
**So that** I can configure what's available for patient scheduling

**Acceptance Criteria:**
- [ ] Can create new resources with name and type
- [ ] Can edit existing resource details
- [ ] Can deactivate resources to prevent future bookings
- [ ] Can view list of all resources in my clinic

**Priority:** High

---

#### US-002: [Next Feature]

[Repeat structure for each user story]

---

### Personas

[Link to persona documents or brief descriptions]

**Example:**

- **Clinic Manager:** [Link to Linear document: "Scheduling Personas"]
  - Responsible for clinic operations and configuration
  - Needs to manage resources, view analytics, handle exceptions

- **Patient:** [Link to Linear document: "Scheduling Personas"]
  - Books appointments online
  - Needs simple, mobile-friendly interface

---

## 2. Technical Design

### Phase 0 — Platform Setup

**Purpose:** Establish foundational infrastructure and development environment

**Implements:** [None - foundational]

#### Object Types

**None** - This phase focuses on infrastructure setup.

#### Setup Tasks

- [ ] Database configuration and connection
- [ ] Authentication middleware
- [ ] Base API structure
- [ ] Frontend routing setup
- [ ] CI/CD pipeline

---

### Phase 1 — [Phase Name]

**Purpose:** [What this phase accomplishes]

**Implements:** US-001, US-002

**Example:**

### Phase 1 — Resource Management

**Purpose:** Enable clinic managers to create and manage bookable resources

**Implements:** US-001

#### Object Types

##### Resource

**Table:** `resource`

**Fields:**
- `id` (ULID, primary key, auto-generated)
- `organizationId` (ULID, foreign key → organization.id, required)
- `name` (varchar 255, required) - Resource name (e.g., "Exam Room 1")
- `type` (varchar 50, required) - Resource type (e.g., "room", "equipment")
- `isActive` (boolean, default true) - Whether available for booking
- `createdAt` (timestamp, default now())
- `updatedAt` (timestamp, default now())

**Relationships:**
- Many-to-One: `organization` (via `organizationId`)

**Indexes:**
- `idx_resource_organization` on `organizationId`
- `idx_resource_active` on `isActive`

**Storage Methods:**
- `createResource(data: InsertResource): Promise<Resource>`
- `getResourceById(id: string): Promise<Resource | null>`
- `getResourcesByOrganization(orgId: string): Promise<Resource[]>`
- `updateResource(id: string, data: Partial<InsertResource>): Promise<Resource>`
- `deleteResource(id: string): Promise<void>`

**API Endpoints:**
- `GET /api/resources` - List resources for organization
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create new resource
- `PATCH /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

**UI Components:**
- `ResourceList` - List view of all resources
- `ResourceCard` - Individual resource card
- `ResourceForm` - Create/edit form
- `ResourceDetail` - Detail view with actions

**Pages:**
- `/resources` - Resource management page
- `/resources/:id` - Resource detail page

#### Actions

##### Activate Resource

**Endpoint:** `POST /api/resources/:id/activate`

**Purpose:** Marks a resource as active and available for booking

**Authorization:** Organization admin only

**Business Logic:**
- Set `isActive = true`
- Log activation event

##### Deactivate Resource

**Endpoint:** `POST /api/resources/:id/deactivate`

**Purpose:** Marks a resource as inactive

**Authorization:** Organization admin only

**Input:**
- `reason` (string, optional, max 500 chars)

**Business Logic:**
- Check for active bookings
- If bookings exist, return error
- Set `isActive = false`
- Log deactivation with reason

---

#### Dependencies

**Phase Dependencies:**
- Blocked by: Phase 0 (Platform Setup)

**Object Type Dependencies:**
- Resource depends on: Organization (from Phase 0)

---

### Phase 2 — [Next Phase]

[Repeat structure for each phase]

---

## 3. Cross-Cutting Concerns

### Security

- All API endpoints require authentication
- Resource access scoped to user's organization
- Admin actions require role validation

### Data Validation

- Use Zod schemas for all API input validation
- Validate organization ownership before operations
- Sanitize user input to prevent XSS

### Error Handling

- Return appropriate HTTP status codes (400, 403, 404, 500)
- Log errors to monitoring system
- User-friendly error messages

### Testing

- Unit tests for all storage methods (>80% coverage)
- API endpoint tests with supertest
- Frontend component tests with Testing Library

---

## 4. Dependencies & Risks

### External Dependencies

- PostgreSQL database
- Authentication provider (Passport.js)
- shadcn/ui component library

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [High/Med/Low] | [How to handle] |

**Example:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database performance with large resource lists | Medium | Add pagination, implement caching |
| Complex booking conflicts | High | Design thorough validation logic in Phase 2 |

### Open Questions

- [ ] Should resources support capacity limits (e.g., room holds 4 people)?
- [ ] Do we need resource categories/tags for filtering?
- [ ] Should we track maintenance schedules?

---

## 5. Implementation Notes

### Phase Sequencing

Phases must be completed in order due to dependencies. However, within each phase:
- Track 1 (ONTOLOGY) and Track 2 (DESIGN-SYSTEM) can develop in parallel
- Track 3 (TRACER-BULLETS) must wait for Track 1 and Track 2 completion

### Issue Generation

Run `/generate-linear-issues "[Project Name]" plan` to preview issues before creation.

Run `/generate-linear-issues "[Project Name]" generate` to create implementation issues from this document.

### Acceptance Criteria

Implementation is complete when:
- [ ] All user story acceptance criteria validated in UAT
- [ ] All Object Types implemented and tested
- [ ] All API endpoints functional
- [ ] All UI components responsive and accessible
- [ ] Documentation updated

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [YYYY-MM-DD] | [Name] | Initial version |

```

---

### 4. Implementation Issue Template

**When to use:** Phase 5 (Implementation Planning)

**Note:** These issues are typically **generated automatically** by `/generate-linear-issues` from the Development Plan document. You rarely need to create them manually.

**Title Format:** Varies by track - see examples below

**Examples:**
- Track 1: `Resource Schema & Storage`
- Track 2: `Resource List and Form Components`
- Track 3: `Create and Edit Resources Workflow`

**Labels:** `1-ONTOLOGY`, `2-DESIGN-SYSTEM`, or `3-TRACER-BULLETS`

**State:** `Backlog` or `Todo`

**Relations:**
- Add "Blocked by" relations for dependencies (Phase and track dependencies)

**Description Template:**
```markdown
## Objective

[What this issue accomplishes]

**Example:** Implement the complete user authentication schema, storage methods, and API endpoints.

## Business Context

**Implements:** [User story IDs from Development Plan]

**From Development Plan:** [Link to Development Plan document, section/phase]

**Example:**

**Implements:** US-001 (User Authentication)

**From Development Plan:** [Scheduling System — Development Plan](linear://document/DOC-ID#phase-1) § Phase 1

## Scope

**Schema (if applicable):**
- Object Types to add/modify
- Fields and relationships

**Example:**
- Add `user` table with email, hashedPassword, role fields
- Add `session` table with userId foreign key

**Storage Methods (if applicable):**
- List of storage methods to implement

**Example:**
- `createUser(email, hashedPassword, role)`
- `getUserByEmail(email)`
- `createSession(userId, token)`

**API Endpoints (if applicable):**
- List of endpoints to create

**Example:**
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session

**UI Components (if applicable):**
- Components to build
- Pages to create

**Example:**
- `LoginForm` component with email/password inputs
- `RegisterPage` with form validation
- `LogoutButton` component

**Tests:**
- Test requirements

**Example:**
- Unit tests for storage methods
- Integration tests for API endpoints
- Component tests for UI

## Files to Modify

| File | Action |
|------|--------|
| `shared/schema.ts` | Add Object Type definitions |
| `server/storage.ts` | Add storage method implementations |
| `server/routes/auth.ts` | Add authentication endpoints |
| `client/src/components/LoginForm.tsx` | Create login form component |
| `server/__tests__/auth.test.ts` | Add tests |

## Files NOT to Modify

- [List of files outside scope]
- Example: Core database connection files, unrelated API routes

## Reference Materials

1. **Development Plan:** [Link to project Development Plan document]
2. **Code Patterns:** `docs/agent-system/PATTERNS.md`
3. **Track Guide:** `docs/agent-system/tracks/TRACK-X-XXX.md`
4. **Examples:** `docs/examples/` (if applicable)

## Acceptance Criteria

- [ ] All schema changes implemented
- [ ] All storage methods implemented and tested
- [ ] All API endpoints implemented and tested
- [ ] All UI components implemented and tested
- [ ] TypeScript compiles with no errors
- [ ] All tests pass (>80% coverage)
- [ ] No lint errors
- [ ] Follows PATTERNS.md exactly
- [ ] UAT instructions added

## UAT Instructions

[Added as a comment when implementation is complete - see UAT Enablement guide]
```

---

### 5. Out of Scope Issue Template

**When to use:** Phase 3 (Requirements Capture) - when explicitly deferring features

**Title Format:** `[Deferred] {Feature Name}`

**Example:** `[Deferred] Multi-language Support`

**Labels:** `out-of-scope-v1`

**State:** `Backlog` (for future consideration)

**Description Template:**
```markdown
## Feature Description

[What feature was requested and what it would provide]

**Example:** Support for multiple languages (English, Spanish, French) with user-selectable locale and translated UI strings.

## Reason for Deferral

[Why this is out of scope for v1]

**Example:** Multi-language support requires significant infrastructure (translation management, locale detection, date/time formatting) and ongoing translation costs. V1 focuses on English-speaking markets only.

## Impact of Deferral

[What we lose by not including this feature]

**Example:**
- Cannot serve non-English speaking users
- Limits market expansion to English-speaking regions
- May lose competitive advantage in international markets

## When to Reconsider

[Conditions or timeline for reconsidering this feature]

**Possible triggers:**
- After v1 launch and market validation
- If customer requests from non-English markets exceed 20% of inquiries
- In Phase 2 (Q3 2026) when expanding to international markets
- If strategic partner requires multi-language support

## Workaround (if any)

[How users can achieve similar outcome without this feature]

**Example:** For v1, international users can use browser translation tools (Google Translate, etc.) though this provides sub-optimal experience.
```

---

## Pull Request Template

**When to use:** After implementation is complete and validated

**Command:** `/create-pr TEAM-123` automatically generates PR with this template

**PR Title:** Should match Linear issue title or summarize changes

**PR Description Template:**
```markdown
## Linear Issue

- **ID:** TEAM-123
- **Track:** [1-ONTOLOGY / 2-DESIGN-SYSTEM / 3-TRACER-BULLETS]
- **URL:** [Linear issue URL - auto-generated by command]

## Traceability

**Implements Specification:**
- TEAM-SPEC-005: [Specification issue title]
- [Link to spec issue]

**Satisfies User Stories:**
- TEAM-USER-010: [User story title]
- TEAM-USER-015: [User story title]
- [Links to user story issues]

## Implementation Details

[Brief summary of what was implemented and key technical decisions]

**Example:**
- Added `resource` and `scheduleBlock` tables to schema
- Implemented CRUD storage methods with organization scoping
- Created REST API endpoints with validation
- Added comprehensive test coverage (87%)

## Changes

**Schema Changes:**
- [List of Object Types added/modified]

**API Changes:**
- [List of endpoints added/modified]

**UI Changes:**
- [List of components added/modified]

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual UAT completed (see Linear issue comments)
- [ ] No TypeScript errors
- [ ] No lint errors

## Breaking Changes

[List any breaking changes or migrations needed]

**Example:** None - purely additive changes

## Screenshots (if UI changes)

[Add screenshots for UI changes]

## Deployment Notes

[Any special deployment considerations]

**Example:**
- Run migrations: `npm run db:migrate`
- No environment variable changes needed

---

## Generated Pull Request

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Usage Guidelines

### For Project Leads

1. **Copy the appropriate template** when creating issues in Linear
2. **Fill in all sections** - placeholders are marked with `[brackets]`
3. **Remove example text** - examples are shown with "**Example:**" prefix
4. **Set relations** - use Linear's relations feature to link issues
5. **Set dependencies** - use "Blocked by" relations for prerequisites

### For AI Agents

1. **Read the template** from this file when starting work
2. **Follow the structure** exactly as specified
3. **Reference templates** when creating UAT instructions
4. **Use `/create-pr`** command which auto-generates PR description

### Template Maintenance

**When to update templates:**
- Project-specific terminology changes
- New required fields discovered
- Process improvements identified

**How to propose changes:**
- Create issue with label `documentation`
- Use `/propose-template-improvements` command
- Document rationale for changes

---

## Template Examples by Track

### Track 1 (1-ONTOLOGY) Example

**Title:** `User Authentication Schema & API`

**Key sections to emphasize:**
- Schema changes (Object Types, fields, relationships)
- Storage methods (IStorage interface additions)
- API endpoints (CRUD + Actions)
- Data validation (Zod schemas)

### Track 2 (2-DESIGN-SYSTEM) Example

**Title:** `Button Component with Variants`

**Key sections to emphasize:**
- Component interface (props, types)
- Design tokens used (colors, spacing)
- Accessibility features (ARIA attributes)
- Responsive behavior (mobile/desktop)
- Component documentation

### Track 3 (3-TRACER-BULLETS) Example

**Title:** `Complete User Registration Flow`

**Key sections to emphasize:**
- End-to-end workflow description
- Integration points (which Track 1/2 items used)
- User-facing pages/flows
- Business logic implementation
- Complete user journey

---

## Related Documentation

- **Core Concepts:** See [CONCEPTS.md](./CONCEPTS.md) for issue types and workflow phases
- **Linear Workflow:** See [LINEAR-WORKFLOW.md](./LINEAR-WORKFLOW.md) for creating and managing issues
- **Commands:** See [COMMANDS.md](./COMMANDS.md) for `/create-pr` and other commands
- **UAT Enablement:** See [agent-system/UAT-ENABLEMENT.md](../agent-system/UAT-ENABLEMENT.md) for UAT instructions format
- **Agent Guide:** See [agent-system/AGENT-GUIDE.md](../agent-system/AGENT-GUIDE.md) for implementation guidance
