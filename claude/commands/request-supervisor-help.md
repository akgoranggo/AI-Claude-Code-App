# Request Supervisor Help

Call for supervisor guidance when stuck, uncertain, or needing architectural/requirements guidance on a Linear issue.

## Usage

```
/request-supervisor-help {LINEAR_ISSUE_ID} {message}
```

## Examples

- `/request-supervisor-help TEAM-123 I'm unsure about the API endpoint structure`
- `/request-supervisor-help TEAM-456 Need guidance on schema design patterns`
- `/request-supervisor-help TEAM-789 Should this component use controlled or uncontrolled inputs?`

## Instructions

When this command is invoked:

1. **Parse parameters**:
   - Linear issue ID (e.g., "TEAM-123")
   - Help message describing the issue or question

2. **Gather context** by reading:
   - The Linear issue (using Linear MCP `get_issue`)
   - `docs/agent-system/PATTERNS.md` - Established patterns
   - `docs/reference/CONCEPTS.md (Linear development plan)` - Technical specifications
   - `docs/reference/CONCEPTS.md (Linear user stories)` - Business context

3. **Analyze the question** to determine the type of help needed:
   - **Architecture** - System design, scalability, patterns
   - **Requirements** - Business logic, acceptance criteria, scope
   - **Code Quality** - Best practices, security, performance
   - **Blocking Issue** - Dependencies, technical blockers

4. **Provide supervisor-level guidance**:
   - Reference relevant documentation sections
   - Cite specific patterns from PATTERNS.md
   - Explain the reasoning behind recommendations
   - Provide code examples if helpful

5. **Suggest next steps** or escalation path if needed

## Output Format

````
## Supervisor Guidance: {LINEAR_ISSUE_ID}

**Issue Type:** [Architecture | Requirements | Code Quality | Blocking Issue]

**Question:**
{user's message}

---

### Analysis

[Understanding of the issue and its context]

### Guidance

[Clear, actionable guidance with reasoning]

### Relevant References

- **Pattern:** [Reference from PATTERNS.md]
- **Spec:** [Reference from DEVELOPMENT-PLAN.md]
- **Requirement:** [Reference from BUSINESS-REQUIREMENTS.md]

### Code Example (if applicable)

```typescript
// Example code demonstrating the recommended approach
````

### Next Steps

1. [Specific action to take]
2. [Follow-up action if needed]

### Escalation

{If issue requires human decision: "This requires human input because [reason]. Please consult with the project lead about [specific question]."}

```

## Related Files

- @docs/agent-system/PATTERNS.md
- @docs/reference/CONCEPTS.md (Linear development plan)
- @docs/reference/CONCEPTS.md (Linear user stories)
```
