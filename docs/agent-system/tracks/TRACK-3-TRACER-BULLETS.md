# Track 3: Tracer Bullets (End-to-End Features)

> **Integration Layer** - Complete user-facing features connecting data and UI layers.

## Purpose

Track 3 issues implement **complete end-to-end features** that integrate the data layer (Track 1) with the presentation layer (Track 2). These issues deliver complete user workflows from UI interaction through API calls to database persistence.

**Label:** `3-TRACER-BULLETS`

**Integration Track:** Track 3 depends on both Track 1 (data layer) and Track 2 (UI layer) being complete.

---

## When to Use Track 3

Use Track 3 for issues that involve:

### Complete User Workflows
- Full user journeys from start to finish
- Integrating multiple Track 1 APIs and Track 2 components
- End-to-end feature implementation
- User-facing functionality

**Example issues:**
- "Complete user registration flow (form → API → success screen)"
- "Implement resource management workflow (create, list, edit, delete)"
- "Build user dashboard with resource summary cards"

### Feature Integration
- Connecting frontend components to backend APIs
- Orchestrating multi-step workflows
- Implementing business workflows
- Complete user journeys

**Example issues:**
- "Implement complete resource activation workflow"
- "Build user registration flow with email verification"
- "Create dashboard with resource statistics"

### User-Facing Features
- Complete features users interact with
- Multi-step workflows
- Features that span multiple pages
- Features requiring both data and UI

**Example issues:**
- "Complete user login flow (auth + UI)"
- "Implement resource creation workflow (form → API → list refresh)"
- "Build dashboard with resource statistics"

---

## When to Use Track 3

Use Track 3 for issues that involve:

### End-to-End User Workflows
- Complete user journeys (login → dashboard → action → result)
- Features requiring both backend APIs and frontend UI
- Multi-step processes (wizard flows, multi-page forms)
- User workflows that span multiple pages/components

**Example issues:**
- "Implement complete user registration flow"
- "Build resource management workflow (list, create, edit, delete)"
- "Create booking flow from resource selection to confirmation"

### Feature Integration
- Connecting Track 1 APIs with Track 2 components
- Coordinating multiple API calls
- Managing complex user workflows
- Orchestrating related features

**Example issues:**
- "Complete resource management feature (list, create, edit, delete)"
- "Implement user onboarding flow with authentication"
- "Build dashboard with multiple data sources"

### Feature-Specific Orchestration
- Combining multiple API calls
- Managing complex UI state
- Implementing multi-step workflows
- Coordinating across multiple Object Types

**Example issues:**
- "Implement complete resource scheduling flow"
- "Build user registration and onboarding workflow"
- "Create admin dashboard with analytics"

---

## When to Use Track 3

Use Track 3 for issues that involve:

### Complete User Workflows
- Multi-step processes
- Features that span multiple pages
- Workflows involving multiple Object Types
- Features connecting backend APIs to frontend UI

**Example issues:**
- "Complete user registration flow (form → API → confirmation)"
- "Implement resource booking workflow (select → confirm → complete)"
- "Build admin dashboard with resource management"

### Integration Work
- Connecting Track 1 APIs to Track 2 components
- Orchestrating multiple API calls
- Managing complex UI state across multiple components
- Implementing business workflows

**Example issues:**
- "Implement complete user onboarding flow"
- "Build resource management workflow (CRUD + actions)"
- "Create admin dashboard with multiple data views"

---

## When to Use Track 3

Use Track 3 for issues that:

1. **Depend on both Track 1 and Track 2:**
   - Require API endpoints from Track 1
   - Require UI components from Track 2
   - Connect backend to frontend

2. **Implement complete user workflows:**
   - Multi-step processes
   - User journeys (login → dashboard → feature)
   - Forms that submit to APIs and show results

3. **Integrate multiple Object Types:**
   - Features that use multiple entities
   - Complex business logic spanning multiple domains
   - User workflows crossing entity boundaries

**Example issues:**
- "Complete user registration flow (form + API + confirmation)"
- "Implement resource management dashboard (list + create + edit + delete)"
- "Build user profile page with settings update"

**Track 3 depends on:** Track 1 (APIs exist) AND Track 2 (components exist)

---

## When to Use Track 3

Use Track 3 for issues that involve:

### Complete User Workflows
- End-to-end user journeys
- Multi-step processes
- Features that touch both backend and frontend
- Integration of multiple components and APIs

**Example issues:**
- "Complete user registration flow" (form → validation → API call → success state)
- "Implement resource booking workflow" (list → select → confirm → result)
- "Build dashboard with resource management" (list, create, edit, delete)

### Feature Integration
- Connecting UI components to API endpoints
- Orchestrating multi-step workflows
- Implementing complete user journeys
- Coordinating Track 1 + Track 2 components

**Example issues:**
- "Implement complete resource management flow (list, create, edit, delete)"
- "Build user registration workflow with email verification"
- "Create project dashboard showing aggregated data"

### Feature-Specific Orchestration
- May include custom endpoints for complex workflows
- Combining multiple Track 1 actions into single feature
- Coordinating multiple components from Track 2

**Example issues:**
- "Complete resource booking flow with availability check"
- "Implement user invitation workflow with email verification"
- "Build dashboard page with multiple data sources"

---

## When to Use Track 3

Use Track 3 for issues that involve:

### End-to-End Features
- Complete user-facing workflows
- Integration of multiple Object Types
- Multi-step user interactions
- Features that span backend and frontend

**Example issues:**
- "Complete user registration flow (signup form → validation → email verification)"
- "Implement resource booking workflow (browse → select → confirm → view)"
- "Build team member invitation flow (send invite → accept → join org)"

### Feature Integration
- Connecting Track 1 APIs to Track 2 UI components
- Orchestrating multiple API calls
- Managing complex user workflows
- Coordinating between multiple Object Types

**Example issues:**
- "Complete user onboarding flow (signup → verify email → create organization)"
- "Implement resource booking workflow (search → select → confirm)"
- "Build admin dashboard integrating users, resources, and analytics"

**Key characteristic:** Track 3 issues require both backend (Track 1) and frontend (Track 2) to be complete.

---

## When to Use Track 3

Use Track 3 for issues that involve:

### Complete User Workflows
- Multi-step user journeys
- Features connecting multiple Object Types
- Business processes requiring orchestration
- Features that span backend and frontend

**Example issues:**
- "Complete user registration flow (form → API → confirmation)"
- "Implement resource booking workflow"
- "Build user dashboard with resource list and actions"

### Feature Integration
- Connecting Track 1 APIs with Track 2 UI components
- Orchestrating multiple API calls
- Coordinating multiple components into workflows
- State management across feature

**Example issues:**
- "Integrate ResourceList component with /api/resources endpoint"
- "Connect ResourceForm to create/update API endpoints"
- "Build complete resource management workflow"

### User-Facing Features
- Complete user workflows
- Multi-step processes
- Feature-specific pages
- User journeys

**Example issues:**
- "Implement complete user registration flow"
- "Create resource scheduling workflow"
- "Build dashboard with multiple widgets"

---

## When to Use Track 3

Use Track 3 for issues that:

1. **Require both Track 1 AND Track 2 to be complete**
   - Integrates backend APIs with frontend UI
   - Creates complete user-facing workflows

2. **Implement user stories end-to-end**
   - User can accomplish a specific goal
   - Feature is testable by non-technical reviewers

3. **Connect existing pieces**
   - Wires together API endpoints (Track 1) and components (Track 2)
   - May include feature-specific orchestration

**Track 3 issues depend on Track 1 and Track 2 foundation being complete.**

---

## Patterns to Follow

### 1. Feature Integration Pattern

**Key principle:** Compose from existing Track 1 and Track 2 work

**Example:** User Registration Flow
- **Track 1 provides:** `POST /api/auth/register` endpoint
- **Track 2 provides:** `RegisterForm` component
- **Track 3 integrates:** Connect form submission to API, handle success/error, navigate to dashboard

**Code structure:**
```typescript
// pages/RegisterPage.tsx (Track 3)
import RegisterForm from "@/components/RegisterForm";  // Track 2
import { useRegister } from "@/hooks/useAuth";  // Calls Track 1 API
import { useNavigate } from "wouter";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register, isPending, error } = useRegister();

  const handleRegister = (data: RegisterFormData) => {
    register(data, {
      onSuccess: () => {
        navigate("/dashboard");  // Navigate after success
      },
    });
  };

  return (
    <div className="container max-w-md py-12">
      <h1 className="text-3xl font-bold mb-6">Create Account</h1>
      <RegisterForm
        onSubmit={handleRegister}
        isSubmitting={isPending}
        error={error?.message}
      />
    </div>
  );
}
```

---

### 2. Multi-Step Workflow Pattern

**Key principle:** Break complex workflows into steps

**Example:** Resource Creation Workflow
1. User selects resource type
2. User fills in details
3. User confirms
4. System creates resource

**Code structure:**
```typescript
// pages/CreateResourceWizard.tsx (Track 3)
import { useState } from "react";
import { useCreateResource } from "@/hooks/useResources";  // Track 1
import SelectTypeStep from "@/components/SelectTypeStep";  // Track 2
import ResourceDetailsStep from "@/components/ResourceDetailsStep";  // Track 2
import ConfirmStep from "@/components/ConfirmStep";  // Track 2

export default function CreateResourceWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { mutate: createResource } = useCreateResource();

  const handleComplete = () => {
    createResource(formData, {
      onSuccess: () => navigate("/resources"),
    });
  };

  return (
    <div>
      {step === 1 && <SelectTypeStep onNext={(type) => {
        setFormData({ ...formData, type });
        setStep(2);
      }} />}
      {step === 2 && <ResourceDetailsStep onNext={(details) => {
        setFormData({ ...formData, ...details });
        setStep(3);
      }} />}
      {step === 3 && <ConfirmStep data={formData} onConfirm={handleComplete} />}
    </div>
  );
}
```

---

### 3. Data Orchestration Pattern

**Key principle:** Coordinate multiple API calls

**Example:** Dashboard with multiple data sources
- Fetch user profile
- Fetch recent resources
- Fetch activity log
- Display all together

**Code structure:**
```typescript
// pages/Dashboard.tsx (Track 3)
import { useUser } from "@/hooks/useAuth";  // Track 1
import { useResources } from "@/hooks/useResources";  // Track 1
import { useActivity } from "@/hooks/useActivity";  // Track 1
import ProfileCard from "@/components/ProfileCard";  // Track 2
import ResourceList from "@/components/ResourceList";  // Track 2
import ActivityFeed from "@/components/ActivityFeed";  // Track 2

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: resources, isLoading: resourcesLoading } = useResources();
  const { data: activity, isLoading: activityLoading } = useActivity();

  const isLoading = userLoading || resourcesLoading || activityLoading;

  if (isLoading) return <Skeleton />;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ProfileCard user={user} />
      </div>
      <div className="md:col-span-2 space-y-6">
        <ResourceList resources={resources} />
        <ActivityFeed activity={activity} />
      </div>
    </div>
  );
}
```

---

## Validation Requirements

Before marking Track 3 work complete, verify:

### Integration Validation
- [ ] Uses existing Track 1 API endpoints (no new backend code needed)
- [ ] Uses existing Track 2 components (composes, doesn't rebuild)
- [ ] API calls use custom hooks from Track 1
- [ ] Components integrate seamlessly
- [ ] Data flows correctly from API to UI
- [ ] Error handling at integration points

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Integration section

### User Workflow Validation
- [ ] Complete user goal achievable
- [ ] Happy path works end-to-end
- [ ] Error paths handled gracefully
- [ ] Loading states shown during async operations
- [ ] Success feedback provided
- [ ] Navigation flows logically

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Workflow section

### Feature Completeness
- [ ] All business requirements from Development Plan validated in UAT
- [ ] Edge cases handled (empty data, errors, invalid input)
- [ ] Feature works on mobile and desktop
- [ ] Feature is accessible (keyboard, screen readers)
- [ ] Feature matches specification

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Features section

---

## Common Pitfalls

### 1. Implementing New Backend Logic

**Problem:** Adding new API endpoints or database queries in Track 3

**Track 3 should NOT:**
- Create new database tables
- Add new API endpoints
- Implement new storage methods
- Add business logic to backend

**Track 3 SHOULD:**
- Use existing API endpoints from Track 1
- Orchestrate multiple existing APIs if needed
- Handle frontend logic only

**If you need new backend functionality, create a Track 1 issue first.**

---

### 2. Building New UI Components

**Problem:** Creating new components instead of using Track 2

**Track 3 should NOT:**
- Build new base components (buttons, forms, cards)
- Recreate existing UI patterns

**Track 3 SHOULD:**
- Compose from existing Track 2 components
- Create thin wrapper components if needed (page-specific layouts)

**If you need new reusable components, create a Track 2 issue first.**

---

### 3. Not Handling All Error States

**Problem:** Only handling happy path

**Example of issue:**
```typescript
// BAD: No error handling
export default function CreateResourcePage() {
  const { mutate: createResource } = useCreateResource();

  const handleSubmit = (data) => {
    createResource(data);
    navigate("/resources");  // Navigates even if API fails!
  };

  return <ResourceForm onSubmit={handleSubmit} />;
}
```

**Solution:**
```typescript
// GOOD: Error handling
export default function CreateResourcePage() {
  const navigate = useNavigate();
  const { mutate: createResource, error } = useCreateResource();

  const handleSubmit = (data) => {
    createResource(data, {
      onSuccess: () => navigate("/resources"),  // Only navigate on success
      // onError is handled by query - error state available above
    });
  };

  return (
    <div>
      {error && <Alert variant="destructive">{error.message}</Alert>}
      <ResourceForm onSubmit={handleSubmit} />
    </div>
  );
}
```

---

### 4. Not Testing Complete User Workflow

**Problem:** Testing individual pieces but not end-to-end flow

**Track 3 UAT must verify:**
- User can start the workflow (navigation)
- User can complete each step
- User receives feedback on success
- User is redirected appropriately
- Errors are handled gracefully

**Example UAT steps:**
1. Navigate to /resources/new
2. Fill in resource name: "Test Room"
3. Select type: "Room"
4. Click "Create"
5. Verify redirect to /resources
6. Verify "Test Room" appears in list
7. Test error: Try creating duplicate → See error message

---

### 5. Ignoring Mobile Experience

**Problem:** Feature works on desktop but breaks on mobile

**Track 3 must ensure:**
- Responsive layouts (mobile, tablet, desktop)
- Touch-friendly interactive elements
- Navigation works on small screens
- Forms are usable on mobile keyboards

**Test on multiple screen sizes:**
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1280px width

---

## Examples from Codebase

Reference these for Track 3 patterns:

### Example: User Authentication Flow (if exists)
**Files:** Pages that orchestrate login/register
**What to learn:** Form submission, API integration, navigation, error handling

### Example: CRUD Feature (if exists)
**Files:** List, create, edit, delete pages for a resource
**What to learn:** Complete CRUD workflow, state management, user feedback

---

## UAT Requirements for Track 3

Track 3 UAT must enable testing the **complete user workflow**:

1. **Start-to-finish instructions:**
   - Where to navigate
   - What data to enter
   - What buttons to click
   - Expected outcomes at each step

2. **Include all paths:**
   - Happy path (everything works)
   - Error path (invalid input, API failures)
   - Edge cases (empty data, concurrent actions)

3. **Verify data persistence:**
   - After completing workflow, refresh page
   - Verify data still present
   - Verify related data updated correctly

4. **Test on multiple devices:**
   - Desktop browser
   - Mobile browser (or responsive mode)
   - Different screen sizes

**Example UAT template:**
```markdown
## UAT Instructions: User Registration Flow

### Prerequisites
- Server running: `npm run dev`
- Database clean (or use test user)

### Test Steps

**Happy Path:**
1. Navigate to http://localhost:3000/register
2. Fill in form:
   - Email: test@example.com
   - Password: TestPass123!
   - Confirm password: TestPass123!
3. Click "Create Account"
4. Expected: Redirect to /dashboard
5. Expected: See welcome message with user email

**Error Path - Duplicate Email:**
1. Navigate to http://localhost:3000/register
2. Fill in form with existing email
3. Click "Create Account"
4. Expected: Error message "Email already in use"
5. Expected: Remain on register page

**Mobile Test:**
1. Open browser dev tools (F12)
2. Toggle device toolbar (iPhone 12 Pro)
3. Repeat happy path
4. Expected: All elements visible and clickable
```

**See:** [UAT-ENABLEMENT.md](../UAT-ENABLEMENT.md) for Track 3 UAT template

---

## Related Documentation

- **Core Patterns:** [PATTERNS.md](../PATTERNS.md) - Complete pattern reference
- **Validation:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Pre-completion checks
- **UAT Guide:** [UAT-ENABLEMENT.md](../UAT-ENABLEMENT.md) - Preparing UAT instructions
- **Agent Guide:** [AGENT-GUIDE.md](../AGENT-GUIDE.md) - General implementation principles
- **Quick Start:** [QUICK-START.md](../QUICK-START.md) - Getting started workflow
- **Track 1:** [TRACK-1-ONTOLOGY.md](./TRACK-1-ONTOLOGY.md) - API endpoints to use
- **Track 2:** [TRACK-2-DESIGN-SYSTEM.md](./TRACK-2-DESIGN-SYSTEM.md) - Components to use
