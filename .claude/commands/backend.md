---
name: backend
description: NestJS microservice development for the Oppi platform. Use when building or modifying service controllers, modules, guards, strategies, DTOs, Drizzle schema, database migrations, Zod validation, JWT auth patterns, SNS event publishing, or any service-layer business logic across auth, user, course, gamification, notification, or analytics services.
argument-hint: [service name or feature description]
allowed-tools: Read, Grep, Glob, Bash
---

# Oppi Backend Services Skill

## Live Project State

Active services:
!`ls services/ 2>/dev/null || echo "services/ not found"`

Shared packages:
!`ls packages/ 2>/dev/null || echo "packages/ not found"`

Auth service src (most complete reference):
!`find services/auth/src -type f 2>/dev/null | sort || echo "auth/src not found yet"`

---

## Architecture at a Glance

Oppi is a **microservices** platform — not a monolith. Each service is an independent NestJS application with its own database, its own Docker container, and its own deployment unit.

| Service | Port | DB | Phase |
|---------|------|----|-------|
| auth-service | 3001 | `auth_db` | 1 ✅ |
| user-service | 3002 | `user_db` | 2 |
| course-service | 3003 | `course_db` | 2 |
| gamification-service | 3004 | `game_db` | 3 |
| notification-service | 3005 | stateless | 3 |
| analytics-service | 3006 | Kinesis + S3 | 4 |

**Never** use tRPC, Express bare, or modular-monolith patterns. The locked stack is:
- **Framework**: NestJS 10 with `@nestjs/platform-fastify` adapter
- **ORM**: Drizzle ORM (not Prisma, not TypeORM)
- **Validation**: Zod (not `class-validator`)
- **DB driver**: `postgres` npm package (not `pg`)
- **Auth**: `@nestjs/passport` + `passport-jwt` + `@nestjs/jwt`
- **Language**: TypeScript strict mode, no `any`

---

## Service File Structure

Every service follows this layout. Use `services/auth/` as the canonical reference:

```
services/<name>/
├── Dockerfile
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── src/
    ├── main.ts                    # Bootstrap (Fastify adapter)
    ├── app.module.ts              # Root module
    ├── config/
    │   └── env.ts                 # Zod-validated env
    ├── database/
    │   ├── database.module.ts     # Global Drizzle provider
    │   ├── schema.ts              # Drizzle table definitions
    │   └── migrations/            # SQL migration files
    ├── <domain>/
    │   ├── <domain>.module.ts
    │   ├── <domain>.controller.ts
    │   ├── <domain>.service.ts
    │   ├── guards/
    │   ├── strategies/
    │   └── dto/
    └── health/
        └── health.controller.ts
```

---

## Core Patterns

### 1. Environment validation (`config/env.ts`)

Always validate env at startup using Zod. The process exits immediately if vars are missing.

```typescript
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors)
    process.exit(1)
  }
  return result.data
}

export const env = validateEnv()
```

### 2. Drizzle schema (`database/schema.ts`)

Key rules from this codebase:
- Use `timestamp('col', { withTimezone: true, mode: 'date' }).defaultNow()` — **not** `timestamptz` (doesn't exist in Drizzle)
- UUIDs via `uuid('id').primaryKey().defaultRandom()`
- Always `.notNull()` on required columns

```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
})
```

### 3. Database module (`database/database.module.ts`)

The database provider is `@Global()` so any module can inject it without re-importing.

```typescript
import { Module, Global } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env'
import * as schema from './schema'

export const DATABASE = Symbol('DATABASE')
export type Database = ReturnType<typeof drizzle<typeof schema>>

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        const client = postgres(env.DATABASE_URL)
        return drizzle(client, { schema })
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
```

### 4. Drizzle insert typing

**Do not** use `Pick<typeof table.$inferInsert, ...>` — Drizzle's insert inference requires all notNull fields even those with DB defaults, causing type errors.

Use explicit object types instead:

```typescript
// ✅ correct
async function insertUser(params: { email: string; passwordHash: string }): Promise<User> {
  const [user] = await db.insert(schema.users).values(params).returning()
  return user
}

// ❌ avoid — causes TypeScript errors with DB-defaulted fields
async function insertUser(params: Pick<typeof schema.users.$inferInsert, 'email' | 'passwordHash'>)
```

### 5. Zod DTOs (no `class-validator`)

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
})

export type RegisterDto = z.infer<typeof registerSchema>
```

Validate in the controller — parse and throw `UnprocessableEntityException` on failure:

```typescript
import { Body, Controller, Post, UnprocessableEntityException } from '@nestjs/common'
import { registerSchema, RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
  @Post('register')
  async register(@Body() body: unknown) {
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      })
    }
    const dto: RegisterDto = result.data
    // ...
  }
}
```

### 6. JWT strategies

Strategies are registered with a name string passed to `PassportStrategy()`. Auth service uses two:

```typescript
// Access token strategy — registered as 'jwt'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_ACCESS_SECRET,
    })
  }

  validate(payload: JwtPayload): { sub: string; email: string } {
    return { sub: payload.sub, email: payload.email }
  }
}

// Refresh token strategy — registered as 'jwt-refresh'
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    })
  }

  validate(
    request: { headers: { authorization?: string } },
    payload: JwtPayload,
  ): { sub: string; email: string; refreshToken: string } {
    const refreshToken = request.headers.authorization?.replace('Bearer ', '') ?? ''
    return { sub: payload.sub, email: payload.email, refreshToken }
  }
}
```

### 7. JWT module registration

Use `JwtModule.register({})` with **no global secret** — pass secrets per sign call. This supports dual-secret pattern (access vs refresh).

```typescript
// auth.module.ts
@Module({
  imports: [JwtModule.register({})],
  ...
})

// auth.service.ts
constructor(private readonly jwtService: JwtService) {}

private signAccessToken(sub: string, email: string): string {
  return this.jwtService.sign(
    { sub, email },
    { secret: env.JWT_ACCESS_SECRET, expiresIn: '15m' },
  )
}

private signRefreshToken(sub: string, email: string): string {
  return this.jwtService.sign(
    { sub, email },
    { secret: env.JWT_REFRESH_SECRET, expiresIn: '7d' },
  )
}
```

### 8. Refresh token rotation

On each refresh: delete the old token hash, insert the new one. This invalidates stolen tokens.

```typescript
// Token hashing — use SHA-256, not bcrypt (tokens have enough entropy)
import { createHash } from 'crypto'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async refresh(userId: string, rawRefreshToken: string): Promise<TokenPair> {
  const tokenHash = hashToken(rawRefreshToken)

  // Verify stored hash matches
  const [stored] = await db
    .select()
    .from(schema.refreshTokens)
    .where(
      and(
        eq(schema.refreshTokens.userId, userId),
        eq(schema.refreshTokens.tokenHash, tokenHash),
      ),
    )

  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedException('Invalid or expired refresh token')
  }

  // Rotate: delete old, issue new
  await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.id, stored.id))

  const newAccessToken = this.signAccessToken(userId, stored.email)
  const newRefreshToken = this.signRefreshToken(userId, stored.email)

  await db.insert(schema.refreshTokens).values({
    userId,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}
```

### 9. NestJS bootstrap with Fastify (`main.ts`)

```typescript
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { env } from './config/env'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  app.setGlobalPrefix('') // routes defined on controllers
  await app.listen(env.PORT, '0.0.0.0')
  console.log(`Service running on port ${env.PORT}`)
}

void bootstrap()
```

### 10. Health endpoint

Every service must expose `GET /health`:

```typescript
import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'auth', timestamp: new Date().toISOString() }
  }
}
```

---

## Service Contracts (from ARCHITECTURE.md)

### Auth Service (port 3001)

```
POST /auth/register   → 201 { user: { id, email }, tokens: { accessToken, refreshToken } }
                        409 email already registered
                        422 validation failed

POST /auth/login      → 200 { user: { id, email }, tokens: { accessToken, refreshToken } }
                        401 invalid credentials

POST /auth/refresh    → 200 { accessToken, refreshToken }
  Authorization: Bearer <refreshToken>

POST /auth/logout     → 204 (no body)
  Authorization: Bearer <refreshToken>

GET  /health          → 200 { status: "ok", service: "auth", timestamp: string }
```

### User Service (port 3002) — Phase 2

```
GET   /users/me        → 200 { id, email, displayName, avatarUrl, locale, createdAt }
PATCH /users/me        → 200 { id, email, displayName, avatarUrl, locale, updatedAt }
GET   /users/:id/public → 200 { id, displayName, avatarUrl, level, totalXp }
```

---

## Shared Types (`packages/types/`)

Always read before defining new types. Shared types live in `packages/types/src/`:

- `auth.types.ts` — `JwtPayload`, `TokenPair`, `RegisterRequest`, `LoginRequest`, `AuthResponse`
- `events.types.ts` — all SNS event shapes (`UserRegisteredEvent`, etc.)
- `index.ts` — re-exports everything

Import in services via:
```typescript
import { JwtPayload, TokenPair } from '@oppi/types'
```

---

## SNS Event Publishing

When a service produces a domain event, publish to SNS. In local dev, point at LocalStack.

```typescript
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { randomUUID } from 'crypto'
import { UserRegisteredEvent } from '@oppi/types'
import { env } from '../config/env'

const snsClient = new SNSClient({
  region: env.AWS_REGION,
  ...(env.AWS_ENDPOINT_URL ? { endpoint: env.AWS_ENDPOINT_URL } : {}),
})

async function publishUserRegistered(userId: string, email: string): Promise<void> {
  const event: UserRegisteredEvent = {
    eventType: 'user.registered',
    payload: { userId, email, registeredAt: new Date().toISOString() },
    metadata: {
      eventId: randomUUID(),
      version: '1.0',
      producedBy: 'auth-service',
    },
  }

  await snsClient.send(
    new PublishCommand({
      TopicArn: `arn:aws:sns:${env.AWS_REGION}:000000000000:oppi-user-events`,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: event.eventType,
        },
      },
    }),
  )
}
```

---

## Error Handling

Use NestJS built-in exceptions — map them to HTTP status codes:

| Situation | Exception |
|-----------|-----------|
| Resource not found | `NotFoundException` (404) |
| Email already exists | `ConflictException` (409) |
| Wrong password / bad token | `UnauthorizedException` (401) |
| Validation failed | `UnprocessableEntityException` (422) |
| Forbidden action | `ForbiddenException` (403) |
| Unexpected server error | `InternalServerErrorException` (500) |

Never leak internal error details (DB errors, stack traces) in responses.

---

## Drizzle Migrations

Generate SQL from schema changes, then apply:

```bash
# In service directory
pnpm db:generate   # generates SQL in src/database/migrations/
pnpm db:migrate    # applies pending migrations

# drizzle.config.ts at service root
import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env'

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: env.DATABASE_URL },
})
```

Migration SQL files are committed to git. The docker-compose mounts them to `docker-entrypoint-initdb.d` for automatic apply on first container start.

---

## NestJS Module Checklist

When creating a new module, verify:

- [ ] Module class has `@Module({ imports, controllers, providers, exports })`
- [ ] Controller methods use appropriate decorators (`@Get`, `@Post`, `@Body`, `@UseGuards`)
- [ ] Service is `@Injectable()` and injected via constructor
- [ ] Database injected via `@Inject(DATABASE)` token (not direct import)
- [ ] Guards extend `AuthGuard('jwt')` or `AuthGuard('jwt-refresh')`
- [ ] Strategies are `@Injectable()` and extend `PassportStrategy(Strategy, 'name')`
- [ ] Module is imported in `AppModule`

---

## Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| `emitDecoratorMetadata` not set | Ensure `tsconfig.json` has `"emitDecoratorMetadata": true` and `"experimentalDecorators": true` |
| Drizzle insert type errors with default columns | Use explicit `{ field: type }` params, not `$inferInsert` picks |
| JWT strategy not found | Strategy name in `PassportStrategy(Strategy, 'name')` must match `AuthGuard('name')` exactly |
| `JwtModule.register({ secret })` with global secret | Use `JwtModule.register({})` and pass secret per `.sign()` call |
| Fastify vs Express `@Body()` typing | Body is already parsed by Fastify — use `unknown` type and parse with Zod |
| bcrypt for token hashing | Use `crypto.createHash('sha256')` for tokens — bcrypt is for passwords only |

---

## Monorepo Commands

```bash
pnpm dev:auth                                       # watch mode :3001
pnpm --filter @oppi/auth-service exec tsc --noEmit  # type check auth service
pnpm --filter @oppi/auth-service db:migrate         # run migrations
docker compose up -d                                # postgres + localstack
```
