---
name: infra
description: Infrastructure planning, CDK stack authoring, AWS service setup, docker-compose changes, LocalStack configuration, and environment management for the Oppi platform. Use when the user asks to add a new service, provision AWS resources, configure networking, set up secrets, design event bus topics/queues, update docker-compose, troubleshoot local dev environment, or estimate cloud costs.
argument-hint: [task description or service name]
allowed-tools: Read, Grep, Glob, Bash
---

# Oppi Infrastructure Skill

## Live Project State

Current CDK stacks:
!`ls infrastructure/cdk/lib/ 2>/dev/null || echo "CDK lib not found"`

Current docker-compose services:
!`grep "^  [a-z]" docker-compose.yml 2>/dev/null | sed 's/://' | xargs || echo "docker-compose.yml not found"`

Current services directory:
!`ls services/ 2>/dev/null || echo "services/ not found"`

---

## Step 0 — Phase Gate (always check this first)

Before any infrastructure work, determine the current phase and scope the work accordingly.

| Phase | Services | Status |
|-------|----------|--------|
| **1** | Auth | ✅ current |
| **2** | User, Course | next |
| **3** | Gamification, Notification | future |
| **4** | Analytics | future |
| **5** | Web frontend | future |
| **6** | Mobile | future |

**Rule:** Never provision Phase N+1 infrastructure during Phase N. If asked to build ahead, explain the tradeoff and ask for confirmation.

---

## Locked Architectural Decisions (do not re-litigate)

| Decision | Choice | Why |
|----------|--------|-----|
| IaC tool | AWS CDK (TypeScript) | ADR-002: same language as services, type-safe, L2/L3 constructs |
| Compute | ECS Fargate | ADR-001: $0 idle cost, no node pool management vs EKS $73/mo base |
| DB strategy | One PostgreSQL per service | ADR-003: independent deploys, no cross-service schema coupling |
| Framework | NestJS + Fastify adapter | ADR-004: DI container, consistent patterns across all services |
| ORM | Drizzle ORM | ADR-005: SQL-first, zero dependencies, typed without generation step |
| Region | `eu-north-1` (Stockholm) | Closest AWS region to Finland (target market) |
| Local AWS | LocalStack on port 4566 | Dev/prod parity without real AWS costs |

If a user proposes an alternative to any of the above, acknowledge the tradeoff, reference the ADR, and ask for explicit confirmation before proceeding.

---

## Service Registry

| Service | Package | Port | Database | Phase |
|---------|---------|------|----------|-------|
| auth-service | `@oppi/auth-service` | 3001 | `auth_db` | 1 ✅ |
| user-service | `@oppi/user-service` | 3002 | `user_db` | 2 |
| course-service | `@oppi/course-service` | 3003 | `course_db` | 2 |
| gamification-service | `@oppi/gamification-service` | 3004 | `game_db` | 3 |
| notification-service | `@oppi/notification-service` | 3005 | stateless | 3 |
| analytics-service | `@oppi/analytics-service` | 3006 | Kinesis + S3 | 4 |
| web (Next.js) | `@oppi/web` | 3000 | — | 5 |
| mobile (Expo) | `@oppi/mobile` | 19006 | — | 6 |

---

## AWS Stack Reference

```
Clients (Next.js / Expo)
       │ HTTPS
       ▼
API Gateway (REST) — rate limiting, JWT authorizer, WAF, CloudFront
       │
  ┌────┴────┬──────────┬────────────┬─────────────┐
  ▼         ▼          ▼            ▼             ▼
ECS Fargate services (private subnets, ALB target groups)
  │         │          │            │             │
  ▼         ▼          ▼            ▼             ▼
RDS PostgreSQL (one db.t3.micro per service, private subnet)

SNS topics → SQS queues (async event bus)
ElastiCache Redis (sessions + leaderboard reads)
S3 (course media, avatars, analytics parquet)
Secrets Manager (all credentials — never plain env vars)
CloudWatch (logs, metrics, alarms)
Route 53 + ACM (DNS + TLS for api.oppi.fi)
```

---

## CDK Patterns

### Reading existing stacks before writing new ones

Always read the existing CDK stacks before adding anything:

```bash
# Check existing stacks
ls infrastructure/cdk/lib/
cat infrastructure/cdk/lib/vpc-stack.ts
cat infrastructure/cdk/lib/rds-stack.ts
cat infrastructure/cdk/lib/ecs-stack.ts
```

### Adding a new service to ECS

Follow the existing `ecs-stack.ts` pattern exactly. The pattern is:

```typescript
// 1. Create a Fargate task definition
const taskDef = new ecs.FargateTaskDefinition(this, `${serviceName}TaskDef`, {
  memoryLimitMiB: 512,
  cpu: 256,
  taskRole: serviceTaskRole,   // least-privilege IAM role
})

// 2. Add container
taskDef.addContainer(`${serviceName}Container`, {
  image: ecs.ContainerImage.fromEcrRepository(repo, 'latest'),
  portMappings: [{ containerPort: servicePort }],
  secrets: {
    DATABASE_URL: ecs.Secret.fromSecretsManager(dbSecret, 'url'),
    JWT_ACCESS_SECRET: ecs.Secret.fromSecretsManager(jwtSecret, 'access'),
  },
  logging: ecs.LogDrivers.awsLogs({ streamPrefix: serviceName }),
})

// 3. Create Fargate service (private subnet, ALB target group)
const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(
  this,
  `${serviceName}Service`,
  {
    cluster,
    taskDefinition: taskDef,
    desiredCount: 1,
    assignPublicIp: false,  // always private
    listenerPort: servicePort,
  }
)
```

### IAM task roles (least privilege)

Each service gets its own task role scoped to only what it needs:

```typescript
const authTaskRole = new iam.Role(this, 'AuthTaskRole', {
  assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
})

// Only grant what auth-service actually uses
authTaskRole.addToPolicy(new iam.PolicyStatement({
  actions: ['secretsmanager:GetSecretValue'],
  resources: [dbSecret.secretArn, jwtSecret.secretArn],
}))

// If service publishes SNS events:
authTaskRole.addToPolicy(new iam.PolicyStatement({
  actions: ['sns:Publish'],
  resources: [userEventsTopic.topicArn],
}))
```

### RDS per service

```typescript
const authDb = new rds.DatabaseInstance(this, 'AuthDb', {
  engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
  vpc,
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
  databaseName: 'auth_db',
  credentials: rds.Credentials.fromGeneratedSecret('oppi'),
  multiAz: false,       // single AZ for Phase 1 cost savings
  deletionProtection: true,
  storageEncrypted: true,
})
```

### SNS topic + SQS subscription

```typescript
const userEventsTopic = new sns.Topic(this, 'UserEventsTopic', {
  topicName: 'oppi-user-events',
})

const notificationQueue = new sqs.Queue(this, 'NotificationUserEventsQueue', {
  queueName: 'notification-user-events',
  visibilityTimeout: cdk.Duration.seconds(30),
})

// Subscribe queue to topic with filter (optional)
userEventsTopic.addSubscription(
  new sns_subscriptions.SqsSubscription(notificationQueue, {
    filterPolicy: {
      eventType: sns.SubscriptionFilter.stringFilter({
        allowlist: ['user.registered'],
      }),
    },
  })
)
```

---

## Event Bus

### Topics and their consumers

| Topic | ARN | Producers | Consumers |
|-------|-----|-----------|-----------|
| `oppi-user-events` | `arn:aws:sns:eu-north-1:*:oppi-user-events` | auth-service | notification-service, gamification-service |
| `oppi-course-events` | `arn:aws:sns:eu-north-1:*:oppi-course-events` | course-service | gamification-service, analytics-service |
| `oppi-gamification-events` | `arn:aws:sns:eu-north-1:*:oppi-gamification-events` | gamification-service | notification-service, analytics-service |

### Event shapes live in `packages/types/src/events.types.ts`

Read that file before adding a new event type. All events follow:
```typescript
{
  eventType: string        // e.g. "user.registered"
  payload: { ... }
  metadata: { eventId: string; version: string; producedBy: string }
}
```

---

## Local Development

### Bring up all local infrastructure

```bash
docker compose up -d
```

Services started: `auth-db` (PostgreSQL :5432), `localstack` (:4566).

### Bootstrap LocalStack topics and queues

Run once after `docker compose up`:

```bash
# SNS topics
aws --endpoint-url=http://localhost:4566 sns create-topic --name oppi-user-events
aws --endpoint-url=http://localhost:4566 sns create-topic --name oppi-course-events
aws --endpoint-url=http://localhost:4566 sns create-topic --name oppi-gamification-events

# SQS queues
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name notification-user-events
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name gamification-user-events
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name notification-course-events
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name gamification-course-events
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name analytics-gamification-events
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name notification-gamification-events

# S3 bucket for media
aws --endpoint-url=http://localhost:4566 s3 mb s3://oppi-media
```

### Adding a new service to docker-compose

When adding a Phase 2+ service, follow the auth-service block as the pattern:

```yaml
user-service:
  build:
    context: .
    dockerfile: services/user/Dockerfile
  ports:
    - "3002:3002"
  environment:
    PORT: 3002
    NODE_ENV: development
    DATABASE_URL: postgresql://oppi:${POSTGRES_PASSWORD:-password}@user-db:5432/user_db
    JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:-change-me-in-production}
    AWS_ENDPOINT_URL: http://localstack:4566
    AWS_REGION: ${AWS_REGION:-eu-north-1}
    AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-test}
    AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-test}
  depends_on:
    user-db:
      condition: service_healthy
  restart: unless-stopped
```

Also add the corresponding database service and volume.

### Run services in dev mode

```bash
pnpm dev:auth     # auth-service watch mode :3001
pnpm dev:web      # Next.js :3000
pnpm dev:mobile   # Expo :19006
```

---

## Cost Reference

### Phase 1 (auth only) — minimal production

| Resource | Cost/month |
|----------|-----------|
| RDS `db.t3.micro` (auth_db) | ~$13 |
| ECS Fargate (0.25 vCPU / 0.5GB, always-on) | ~$7 |
| API Gateway (low traffic) | <$1 |
| Secrets Manager (3 secrets) | <$2 |
| **Total** | **~$23/month** |

### Full production (all 6 services)

| Resource | Cost/month |
|----------|-----------|
| RDS `db.t3.micro` × 5 services | ~$65 |
| ECS Fargate × 6 services | ~$42 |
| ElastiCache `cache.t3.micro` | ~$12 |
| API Gateway | ~$3 |
| SNS + SQS (moderate traffic) | ~$2 |
| Secrets Manager (~15 secrets) | ~$6 |
| S3 + CloudFront | ~$3 |
| Route 53 + ACM | ~$1 |
| CloudWatch | ~$5 |
| **Total** | **~$139/month** |

**Cost guardrail:** When proposing new resources, always include the monthly cost estimate and whether it fits the current phase budget.

---

## Security Checklist

When adding or modifying infrastructure, verify:

- [ ] All databases in **private subnets** — no public IP
- [ ] All ECS tasks in **private subnets** — no public IP
- [ ] Task role follows **least-privilege** — only the AWS actions the service actually calls
- [ ] All secrets via **Secrets Manager** — no plaintext env vars in CDK or ECS task definitions
- [ ] RDS has `storageEncrypted: true` and `deletionProtection: true`
- [ ] API Gateway has WAF attached
- [ ] CloudWatch log groups have retention policies set (avoid unbounded log costs)
- [ ] SQS queues have a **dead-letter queue** configured for failed message processing

---

## Runbooks

### Add a new microservice (full checklist)

1. **Read** existing service structure: `services/auth/`
2. **Create** `services/<name>/` with `Dockerfile`, `package.json`, `tsconfig.json`
3. **Add** to `pnpm-workspace.yaml` if not already a workspace glob match
4. **Add** dev script to root `package.json`: `"dev:<name>": "pnpm --filter @oppi/<name>-service dev"`
5. **Add** service + DB blocks to `docker-compose.yml`
6. **Add** CDK ECS stack in `infrastructure/cdk/lib/` following existing pattern
7. **Add** CDK RDS instance for the service DB
8. **Create** least-privilege IAM task role
9. **Create** Secrets Manager entries for DB URL and any service secrets
10. **Register** SNS subscriptions if the service consumes events

### Add a new event type

1. **Read** `packages/types/src/events.types.ts`
2. **Add** the new event type following the `EventMetadata` pattern
3. **Export** the type via `packages/types/src/index.ts`
4. **Add** SNS subscription filter in CDK if a new consumer needs it
5. **Update** the producer → consumer map in `ARCHITECTURE.md`

### Rotate a secret in production

1. Update the secret value in Secrets Manager
2. Force a new ECS task deployment to pick up the new secret:
   ```bash
   aws ecs update-service --cluster oppi-cluster --service <service-name> --force-new-deployment
   ```
3. Verify the new task is healthy before the old one drains

### LocalStack reset (fresh state)

```bash
docker compose down
docker volume rm oppi_localstack-data
docker compose up -d
# Re-run bootstrap commands above
```

---

## Principles

1. **IaC only** — never click in the AWS console to create or modify infrastructure
2. **Private subnets** — all databases and compute stay off the public internet
3. **Secrets Manager** — no plaintext credentials anywhere in CDK, task definitions, or git
4. **Least-privilege IAM** — task roles are scoped to only what each service actually calls
5. **Follow existing CDK patterns** — read the existing stacks before writing new ones; don't introduce new IaC tools
6. **Phase discipline** — check the phase roadmap before provisioning; don't build ahead
7. **Cost visibility** — every new resource comes with a monthly cost estimate
