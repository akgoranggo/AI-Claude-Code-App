# Track 2: Design System (Components, Tokens, Styling)

> **UI Layer Implementation** - React components, design tokens, and user interfaces.

## Purpose

Track 2 issues implement the **presentation layer** of the application: reusable UI components, design tokens for consistent styling, page layouts, and user interface patterns.

**Label:** `2-DESIGN-SYSTEM`

**Foundation Track:** Track 2 can be developed in parallel with Track 1, but Track 3 depends on both.

---

## When to Use Track 2

Use Track 2 for issues that involve:

### UI Components
- Creating reusable React components
- Building forms with validation
- Creating buttons, cards, modals, dialogs
- Implementing shadcn/ui component wrappers

**Example issues:**
- "Create ResourceCard component to display resource summary"
- "Build ResourceForm component with validation"
- "Implement ConfirmDialog component for delete actions"

### Design Tokens
- Defining color schemes
- Setting typography scales
- Creating spacing systems
- Establishing component variants

**Example issues:**
- "Add primary/secondary/destructive button variants"
- "Create error/warning/success color tokens"
- "Define card spacing and padding tokens"

### Page Layouts
- Creating page templates
- Building navigation components
- Implementing responsive layouts
- Setting up routing

**Example issues:**
- "Create ResourceListPage layout"
- "Build ResourceDetailPage with sidebar"
- "Implement responsive navigation menu"

---

## Patterns to Follow

### 1. Component Pattern

**Location:** `client/src/components/` or `client/src/pages/`

**Reference:** See [PATTERNS.md](../PATTERNS.md) - Component Patterns section

**Key requirements:**
- Use TypeScript with explicit prop types
- Export component as default
- Use shadcn/ui components where applicable
- Implement proper error states and loading states
- Make components accessible (ARIA attributes)

**Example structure:**
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResourceCardProps {
  resource: Resource;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

export default function ResourceCard({
  resource,
  onActivate,
  onDeactivate
}: ResourceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{resource.type}</p>
        <div className="mt-4 flex gap-2">
          {resource.isActive ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeactivate?.(resource.id)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onActivate?.(resource.id)}
            >
              Activate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 2. Custom Hook Pattern

**Location:** `client/src/hooks/`

**Reference:** See [PATTERNS.md](../PATTERNS.md) - Custom Hooks section

**Key requirements:**
- Use TanStack Query for data fetching
- Prefix hook names with `use`
- Return loading, error, and data states
- Handle mutations with optimistic updates
- Include proper TypeScript types

**Example structure:**
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await fetch("/api/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json() as Promise<Resource[]>;
    },
  });
}

export function useActivateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/activate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to activate resource");
      return res.json() as Promise<Resource>;
    },
    onSuccess: () => {
      // Invalidate and refetch resources list
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}
```

---

### 3. Page Pattern

**Location:** `client/src/pages/`

**Reference:** See [PATTERNS.md](../PATTERNS.md) - Page Patterns section

**Key requirements:**
- One page per route
- Use custom hooks for data fetching
- Handle loading and error states
- Compose page from reusable components
- Add route to `App.tsx`

**Example structure:**
```typescript
import { useResources } from "@/hooks/useResources";
import ResourceCard from "@/components/ResourceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResourceListPage() {
  const { data: resources, isLoading, error } = useResources();
  const { mutate: activateResource } = useActivateResource();
  const { mutate: deactivateResource } = useDeactivateResource();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load resources. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Resources</h1>
      {resources?.length === 0 ? (
        <p className="text-muted-foreground">No resources yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources?.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onActivate={activateResource}
              onDeactivate={deactivateResource}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Validation Requirements

Before marking Track 2 work complete, verify:

### Component Validation
- [ ] Component uses TypeScript with prop interface
- [ ] Props interface exported if reusable
- [ ] Component exported as default
- [ ] Uses shadcn/ui components where applicable
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Handles empty state (no data)
- [ ] Accessible (keyboard navigation, ARIA labels)

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Component section

### Hook Validation
- [ ] Hook name prefixed with `use`
- [ ] Uses TanStack Query for data fetching
- [ ] Returns loading, error, and data states
- [ ] Mutations invalidate relevant queries
- [ ] Proper TypeScript return types
- [ ] Error handling implemented

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Hooks section

### Page Validation
- [ ] Page handles loading state
- [ ] Page handles error state
- [ ] Page handles empty state
- [ ] Uses custom hooks for data
- [ ] Composes from reusable components
- [ ] Route added to `App.tsx`
- [ ] Responsive on mobile, tablet, desktop

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Pages section

### Styling Validation
- [ ] Uses Tailwind CSS classes
- [ ] Uses design tokens (not hardcoded colors)
- [ ] Responsive design (mobile-first)
- [ ] Dark mode compatible (if applicable)
- [ ] Consistent spacing (uses spacing scale)

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Styling section

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Form inputs have labels
- [ ] Error messages are clear

**Reference:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Accessibility section

---

## Common Pitfalls

### 1. Not Handling Loading States

**Problem:** Component doesn't show loading indicator

**Example of issue:**
```typescript
// BAD: No loading state
export default function ResourceList() {
  const { data: resources } = useResources();

  return (
    <div>
      {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
  );
}
```

**Solution:**
```typescript
// GOOD: Loading state handled
export default function ResourceList() {
  const { data: resources, isLoading } = useResources();

  if (isLoading) {
    return <Skeleton className="h-64" />;  // ← Show loading
  }

  return (
    <div>
      {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
  );
}
```

---

### 2. Not Handling Empty States

**Problem:** Component shows nothing when data is empty

**Example of issue:**
```typescript
// BAD: No empty state
export default function ResourceList() {
  const { data: resources } = useResources();

  return (
    <div>
      {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
  );
}
```

**Solution:**
```typescript
// GOOD: Empty state handled
export default function ResourceList() {
  const { data: resources } = useResources();

  return (
    <div>
      {resources?.length === 0 ? (
        <p className="text-muted-foreground">No resources yet.</p>  // ← Empty state
      ) : (
        resources?.map(r => <ResourceCard key={r.id} resource={r} />)
      )}
    </div>
  );
}
```

---

### 3. Missing Error Handling

**Problem:** Component doesn't handle API errors

**Example of issue:**
```typescript
// BAD: No error handling
export default function ResourceList() {
  const { data: resources } = useResources();

  return (
    <div>
      {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
  );
}
```

**Solution:**
```typescript
// GOOD: Error handled
export default function ResourceList() {
  const { data: resources, error } = useResources();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load resources.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
  );
}
```

---

### 4. Not Using TypeScript Props Interface

**Problem:** Component doesn't define prop types

**Example of issue:**
```typescript
// BAD: No prop types
export default function ResourceCard({ resource, onActivate }) {
  return <div>{resource.name}</div>;
}
```

**Solution:**
```typescript
// GOOD: Typed props
interface ResourceCardProps {
  resource: Resource;
  onActivate?: (id: string) => void;
}

export default function ResourceCard({ resource, onActivate }: ResourceCardProps) {
  return <div>{resource.name}</div>;
}
```

---

### 5. Not Invalidating Queries After Mutations

**Problem:** UI doesn't update after mutation

**Example of issue:**
```typescript
// BAD: No query invalidation
export function useActivateResource() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/activate`, { method: "POST" });
      return res.json();
    },
    // Missing: onSuccess with invalidateQueries
  });
}
```

**Solution:**
```typescript
// GOOD: Query invalidation
export function useActivateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/activate`, { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });  // ← Refetch
    },
  });
}
```

---

### 6. Not Making Components Responsive

**Problem:** Component doesn't adapt to different screen sizes

**Example of issue:**
```typescript
// BAD: Fixed grid layout
<div className="grid grid-cols-3 gap-4">
  {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
</div>
```

**Solution:**
```typescript
// GOOD: Responsive grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {resources?.map(r => <ResourceCard key={r.id} resource={r} />)}
</div>
```

---

## Examples from Codebase

Reference these existing implementations as examples:

### Component Example
**File:** `client/src/components/ui/` (shadcn/ui components)
**What to learn:** Component structure, prop types, styling patterns

### Custom Hook Example
**File:** `client/src/hooks/` (if exists)
**What to learn:** TanStack Query usage, error handling, mutations

### Page Example
**File:** `client/src/pages/` (existing pages)
**What to learn:** Page structure, data fetching, routing setup

---

## shadcn/ui Components Available

This project includes 50+ pre-built accessible components from shadcn/ui:

**Layout:**
- Card, Tabs, Separator, Scroll Area

**Forms:**
- Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider
- Form (with react-hook-form integration)
- Label, Calendar, Date Picker

**Feedback:**
- Alert, Alert Dialog, Toast, Dialog, Popover, Tooltip
- Skeleton (loading states)
- Progress, Spinner

**Data Display:**
- Table, Badge, Avatar, Accordion
- Command (⌘K menu), Context Menu, Dropdown Menu

**Navigation:**
- Breadcrumb, Pagination, Navigation Menu

**Use these components instead of building from scratch.**

---

## UAT Requirements for Track 2

When preparing UAT instructions for Track 2 work:

1. **Provide navigation steps:**
   - URL to visit
   - Where to click
   - What to expect to see

2. **Explain interactions:**
   - Forms to fill out
   - Buttons to click
   - Expected outcomes

3. **Include visual checks:**
   - Does layout look correct?
   - Are colors/spacing appropriate?
   - Is text readable?

4. **Test responsiveness:**
   - Resize browser window
   - Check mobile view
   - Verify navigation works

5. **Test accessibility:**
   - Tab through interactive elements
   - Verify keyboard shortcuts work
   - Check focus indicators visible

**See:** [UAT-ENABLEMENT.md](../UAT-ENABLEMENT.md) for Track 2 UAT template

---

## Related Documentation

- **Core Patterns:** [PATTERNS.md](../PATTERNS.md) - Complete pattern reference
- **Validation:** [VALIDATION-CHECKLIST.md](../VALIDATION-CHECKLIST.md) - Pre-completion checks
- **UAT Guide:** [UAT-ENABLEMENT.md](../UAT-ENABLEMENT.md) - Preparing UAT instructions
- **Agent Guide:** [AGENT-GUIDE.md](../AGENT-GUIDE.md) - General implementation principles
- **Quick Start:** [QUICK-START.md](../QUICK-START.md) - Getting started workflow
- **shadcn/ui Docs:** https://ui.shadcn.com/ - Component documentation
