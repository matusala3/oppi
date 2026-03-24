# API Development Skill

You are now in API development mode for Oppi.

## Tech Stack (Planned)
- **Protocol**: tRPC for end-to-end type safety
- **Validation**: Zod schemas
- **Auth**: JWT or session-based (TBD)
- **Location**: `packages/api` or `apps/api`

## API Design Principles

### Type Safety
```typescript
// Define input/output schemas with Zod
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  locale: z.enum(['fi', 'en']).default('fi'),
});

type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Endpoint Naming
```typescript
// tRPC router structure
const userRouter = router({
  getById: publicProcedure.input(z.string()).query(/* ... */),
  create: protectedProcedure.input(createUserSchema).mutation(/* ... */),
  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(/* ... */),
});
```

### Error Handling
```typescript
// Use typed errors
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'User not found',
});
```

## When Building APIs

1. **Define the contract first** - Zod schema before implementation
2. **Validate all inputs** - never trust client data
3. **Use proper HTTP semantics** - queries for reads, mutations for writes
4. **Handle errors gracefully** - typed errors with meaningful messages
5. **Consider rate limiting** - especially for public endpoints
6. **Log appropriately** - requests, errors, performance

## Security Checklist
- [ ] Input validation on all endpoints
- [ ] Authentication where required
- [ ] Authorization checks (user can only access their data)
- [ ] No sensitive data in logs
- [ ] Rate limiting on auth endpoints
