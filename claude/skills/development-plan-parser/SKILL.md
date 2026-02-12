---
name: development-plan-parser
description: Parsing Development Plan documents from Linear to extract Object Types and generate issues
---

# Development Plan Parser Skill

Patterns for parsing Development Plan documents and mapping to Linear issues.

## When Used

- Generating Linear issues from Development Plan documents
- Parsing structure from Linear documents
- Extracting Object Types, Links, Actions

## Development Plan Source

Fetch from Linear using MCP:
```
list_documents({projectId}) → find "[Project Name] — Development Plan"
get_document({documentId}) → get content
```

## Document Structure

```markdown
### Phase {N} — {Name}
**Goal:** {Description}
**Schema Definitions:** {Object Types}
**Storage Methods:** {CRUD methods}
**API Endpoints:** {REST endpoints}
**Frontend Pages:** {React pages}
```

## Parsing Patterns

| Section | Regex/Pattern | Extracts |
|---------|---------------|----------|
| Phase | `/^### Phase (\d+) — (.+)$/gm` | Number, name |
| Object Type | `// Object Type: {Name}` + `appSchema.table` | Table, fields, FKs |
| Storage | After "Storage Methods:" | Method names |
| API | After "API Endpoints:" | Method, path |
| UI | After "Frontend Pages:" | File paths |

## Issue Generation

**Track 1 (ONTOLOGY):** One issue per Object Type
- Title: `[Phase {N}] {ObjectType} Schema & Storage`
- Scope: Schema + storage + API + tests

**Track 2 (DESIGN-SYSTEM):** Group by feature area
- Title: `[Phase {N}] {Area} UI Components`
- Scope: Pages + components + accessibility

**Track 3 (TRACER-BULLETS):** End-to-end features
- Title: `[Phase {N}] {Feature} Feature`
- Scope: Workflows + integrations + business logic
- Blocked by: Related Track 1 & 2 issues

## Dependencies

- **Phase deps:** Phase N blocks Phase N+1
- **FK deps:** Object Type with FK blocks on referenced type
- **Track 3 deps:** Blocked by Track 1 & 2 issues it uses

## Validation

- Phase has goal and Object Types
- Object Types have id and createdAt fields
- No circular dependencies

## Reference

See `/generate-linear-issues` command for full implementation.
