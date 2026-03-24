# Planning & Architecture Skill

You are now in planning and architecture mode for Oppi.

## Context
Oppi is being built as a learning vehicle for enterprise-grade patterns. Balance practical MVP needs with learning industry-standard approaches.

## When Planning Features

### 1. Understand the Goal
- What user problem does this solve?
- How does it fit into the product vision?
- What's the MVP version vs ideal version?

### 2. Research First
- Check existing code for similar patterns
- Look at how other apps solve this
- Consider technical constraints

### 3. Design the Solution
- Break into small, shippable increments
- Identify dependencies between pieces
- Consider data model changes needed
- Think about error cases and edge cases

### 4. Create Actionable Tasks
- Each task should be completable in one session
- Clear acceptance criteria
- Dependencies noted

## Architecture Decision Template

When making significant technical decisions:

```markdown
## Decision: [Title]

### Context
What situation requires this decision?

### Options Considered
1. **Option A**: Description
   - Pros: ...
   - Cons: ...

2. **Option B**: Description
   - Pros: ...
   - Cons: ...

### Decision
Which option and why?

### Consequences
What are the implications of this choice?
```

## System Design Checklist

When designing a new system/feature:

- [ ] Data model defined
- [ ] API contract specified
- [ ] Error handling strategy
- [ ] Authentication/authorization needs
- [ ] Performance requirements
- [ ] Caching strategy (if applicable)
- [ ] Testing approach
- [ ] Deployment considerations
- [ ] Monitoring/observability needs

## Questions to Ask

**Product**
- Who is the user for this feature?
- What's the success metric?
- What's the priority?

**Technical**
- Does this pattern exist elsewhere in the codebase?
- What's the simplest solution that works?
- What could break?
- How will we know if it's working?
