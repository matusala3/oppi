# Oppi

A monorepo containing a web app, mobile app, and backend services for Oppi.

## Project Structure

```
oppi/
├── apps/
│   ├── web/          # Next.js web app
│   └── mobile/       # Expo (React Native) mobile app
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
├── services/
│   └── auth/         # NestJS authentication service
└── infrastructure/
    └── cdk/          # AWS CDK infrastructure
```

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9.15.0 — `npm install -g pnpm@9.15.0`
- [Docker](https://www.docker.com/) and Docker Compose (for running backend services)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start backend services (auth + database + LocalStack)

The backend services run via Docker Compose. This starts the auth service, a PostgreSQL database, and LocalStack (local AWS emulation for SQS, SNS, SES, S3).

```bash
docker compose up
```

To run in the background:

```bash
docker compose up -d
```

### 3. Run the web app

```bash
pnpm dev:web
```

Opens at [http://localhost:3000](http://localhost:3000).

### 4. Run the mobile app

```bash
pnpm dev:mobile
```

This starts the Expo dev server. You can then:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with the [Expo Go](https://expo.dev/go) app on your device

## Running Services Individually

### Auth service (without Docker)

Create a `.env` file in `services/auth/`:

```env
PORT=3001
DATABASE_URL=postgresql://oppi:password@localhost:5432/auth_db
JWT_ACCESS_SECRET=your-access-secret-at-least-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars-different
AWS_REGION=eu-north-1
# Optional — point to LocalStack when running locally
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

Then run:

```bash
pnpm dev:auth
```

The auth service starts on [http://localhost:3001](http://localhost:3001).

#### Database migrations

```bash
pnpm --filter=@oppi/auth-service db:migrate
```

## Other Commands

| Command | Description |
|---|---|
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | — | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Secret for signing refresh tokens (min 32 chars, different from access) |
| `PORT` | No | `3001` | Auth service port |
| `NODE_ENV` | No | `development` | Environment (`development`, `production`, `test`) |
| `AWS_REGION` | No | `eu-north-1` | AWS region |
| `AWS_ENDPOINT_URL` | No | — | Override AWS endpoint (e.g. LocalStack) |
| `AWS_ACCESS_KEY_ID` | No | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | No | — | AWS secret key |
