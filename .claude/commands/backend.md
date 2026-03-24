# Backend Services Skill

You are now in backend services mode for Oppi.

## Architecture Overview
- **Style**: Modular monolith (can extract to microservices later)
- **Runtime**: Node.js / Bun
- **Framework**: tRPC + Express/Fastify adapter or standalone

## Service Domains

### User Service
- Authentication (signup, login, logout)
- Profile management
- Preferences and settings

### Learning Service
- Courses and lessons
- Progress tracking
- Quiz/challenge logic

### Gamification Service
- Points and XP calculation
- Achievements and badges
- Leaderboards
- Streaks

### Community Service
- Social features
- Groups/teams
- Activity feeds

## Code Organization
```
packages/
├── api/
│   ├── src/
│   │   ├── routers/        # tRPC routers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers
│   │   └── middleware/     # Auth, logging, etc.
```

## Backend Patterns

### Service Layer
```typescript
// Keep business logic in services, not routers
class UserService {
  constructor(private db: Database) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Validation, business rules, db operations
  }
}
```

### Dependency Injection
```typescript
// Pass dependencies explicitly
const userService = new UserService(db);
const userRouter = createUserRouter(userService);
```

## When Building Backend

1. **Separate concerns** - routers handle HTTP, services handle logic
2. **Use transactions** - for multi-step database operations
3. **Handle errors** - catch, log, return appropriate responses
4. **Think about scale** - will this work with 10k users? 100k?
5. **Write tests** - unit tests for services, integration for routers
