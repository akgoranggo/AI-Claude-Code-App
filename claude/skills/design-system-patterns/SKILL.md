---
name: design-system-patterns
description: Patterns for 2-DESIGN-SYSTEM work including React components, design tokens, and UI styling
---

# Design System Patterns

Patterns for 2-DESIGN-SYSTEM work: React components, shadcn/ui, responsive design.

## Component Pattern

```typescript
// client/src/components/{feature}/{ComponentName}.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Entity } from "@shared/schema";

interface ComponentProps {
  entity: Entity;
  onSelect?: (id: string) => void;
}

export function Component({ entity, onSelect }: ComponentProps) {
  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onSelect?.(entity.id)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{entity.name}</CardTitle>
        <Badge variant={entity.status === "Active" ? "default" : "secondary"}>
          {entity.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{entity.description}</p>
      </CardContent>
    </Card>
  );
}
```

## Hook Pattern

```typescript
// client/src/hooks/use{Entity}.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEntities(organizationId?: string) {
  return useQuery({
    queryKey: ["/api/entities", { organizationId }],
    enabled: !!organizationId,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetch("/api/entities", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/entities"] }),
  });
}
```

## Page Pattern

```typescript
// client/src/pages/{Feature}List.tsx
export default function FeatureList() {
  const { data, isLoading, error } = useEntities(organizationId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Features</h1>
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map(item => <FeatureCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
```

## Mobile-First Responsive

```typescript
// Touch targets: min-h-[44px] min-w-[44px]
// Breakpoints: sm:640px md:768px lg:1024px xl:1280px

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<Button className="w-full md:w-auto min-h-[44px]">
```

## shadcn/ui Components

Common imports:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
```

## Accessibility

- Use semantic HTML (`button`, `nav`, `main`)
- Add `aria-label` for icon-only buttons
- Ensure keyboard navigation
- Maintain 4.5:1 contrast ratio

## File Structure

```
client/src/components/
├── ui/                 # shadcn/ui base (don't modify)
├── {feature}/          # Feature-specific
│   ├── {Feature}Card.tsx
│   ├── {Feature}Form.tsx
│   └── {Feature}List.tsx
└── shared/             # Cross-feature reusables
```
