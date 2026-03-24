# Database Skill

You are now in database mode for Oppi.

## Tech Stack
- **Primary**: PostgreSQL
- **ORM**: Drizzle ORM (preferred) or Prisma
- **Cache**: Redis (sessions, leaderboards, rate limiting)
- **Location**: `packages/db`

## Schema Design Principles

### Naming Conventions
- Tables: `snake_case`, plural (`users`, `learning_progress`)
- Columns: `snake_case` (`created_at`, `user_id`)
- Indexes: `idx_table_column`
- Foreign keys: `fk_table_reference`

### Core Tables (Planned)

```sql
-- Users
users (id, email, name, locale, created_at, updated_at)

-- Learning
courses (id, title, description, difficulty, order)
lessons (id, course_id, title, content, order)
user_progress (id, user_id, lesson_id, completed_at, score)

-- Gamification
achievements (id, name, description, criteria, points)
user_achievements (id, user_id, achievement_id, earned_at)
user_stats (user_id, total_xp, current_streak, longest_streak)

-- Community
teams (id, name, created_by, created_at)
team_members (team_id, user_id, joined_at)
```

## Drizzle ORM Patterns

### Schema Definition
```typescript
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  locale: text('locale').default('fi'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Queries
```typescript
// Type-safe queries
const user = await db.select().from(users).where(eq(users.id, id));

// Joins
const progress = await db
  .select()
  .from(userProgress)
  .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
  .where(eq(userProgress.userId, userId));
```

## When Working on Database

1. **Plan the schema first** - ERD before code
2. **Use migrations** - never modify schema directly in production
3. **Index thoughtfully** - on foreign keys and frequently queried columns
4. **Normalize appropriately** - but denormalize for read performance where needed
5. **Consider soft deletes** - `deleted_at` instead of actual deletion
6. **Audit trails** - `created_at`, `updated_at` on all tables

## Performance Considerations
- Use connection pooling
- Index foreign keys
- Paginate large result sets
- Use Redis for frequently accessed, rarely changed data
- Consider read replicas for scale
