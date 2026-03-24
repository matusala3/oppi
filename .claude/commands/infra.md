# Infrastructure Skill

You are in infrastructure mode for Oppi. Always read `ARCHITECTURE.md` in the project root before making any infrastructure decisions — it is the source of truth and contains ADRs, the event catalog, service contracts, and the phase roadmap.

## Decisions Already Made (do not re-litigate)

| Decision | Choice | ADR |
|----------|--------|-----|
| IaC | AWS CDK (TypeScript) | ADR-002 |
| Compute | ECS Fargate (not EKS) | ADR-001 |
| Database strategy | One PostgreSQL DB per service | ADR-003 |
| Framework | NestJS + Fastify adapter | ADR-004 |
| ORM | Drizzle ORM | ADR-005 |
| Region | `eu-north-1` (Stockholm) | — |
| Local AWS emulation | LocalStack on port 4566 | — |

## Service Registry

| Service | Port | DB | Phase |
|---------|------|----|-------|
| `auth-service` | 3001 | `auth_db` | 1 ✅ done |
| `user-service` | 3002 | `user_db` | 2 |
| `course-service` | 3003 | `course_db` | 2 |
| `gamification-service` | 3004 | `game_db` | 3 |
| `notification-service` | 3005 | stateless | 3 |
| `analytics-service` | 3006 | Kinesis+S3 | 4 |

Web (Next.js) runs on `3000`, Expo mobile on `19006`.

## AWS Stack

- **Compute**: ECS Fargate (tasks in private subnets)
- **Entry point**: API Gateway → ALB → ECS services
- **Databases**: RDS PostgreSQL (`db.t3.micro` per service)
- **Cache**: ElastiCache Redis (sessions, leaderboards)
- **Messaging**: SNS topics → SQS queues (event bus)
- **Email**: SES
- **Storage**: S3 (media, avatars, analytics parquet)
- **Secrets**: Secrets Manager (never plain env vars in prod)
- **Observability**: CloudWatch logs + metrics
- **DNS/TLS**: Route 53 + ACM
- **CDN**: CloudFront

## CDK Stacks (in `infrastructure/cdk/lib/`)

Existing: `vpc-stack.ts`, `rds-stack.ts`, `ecs-stack.ts`

When adding a new service, follow the existing ECS stack pattern — do not introduce new IaC tools.

## Event Bus Pattern

SNS topics → SQS queues for all cross-service communication. Key topics:
- `oppi-user-events`
- `oppi-course-events`
- `oppi-gamification-events`

See `ARCHITECTURE.md` → Event Catalog for full producer/consumer map and event shapes.

## Local Dev

```bash
docker compose up -d          # postgres + localstack
pnpm dev:auth                 # auth service watch mode
```

LocalStack bootstrapping (create topics/queues before testing event flows):
```bash
aws --endpoint-url=http://localhost:4566 sns create-topic --name oppi-user-events
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name notification-user-events
```

## Principles

1. **IaC only** — never click in AWS console for infra
2. **Private subnets** for all databases and services
3. **Secrets Manager** for all credentials — not `.env` in production
4. **Least-privilege IAM** — task roles scoped per service
5. **Follow existing CDK patterns** before creating new constructs
6. **Check the phase roadmap** in `ARCHITECTURE.md` — don't build Phase 3 infra during Phase 2
