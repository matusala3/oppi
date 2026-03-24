# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm@9.15.0

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY services/auth/package.json ./services/auth/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS build
WORKDIR /app

COPY packages/types ./packages/types
COPY services/auth ./services/auth

WORKDIR /app/services/auth
RUN pnpm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY services/auth/package.json ./services/auth/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/services/auth/dist ./services/auth/dist
COPY --from=build /app/packages/types/src ./packages/types/src

WORKDIR /app/services/auth

USER node

EXPOSE 3001

CMD ["node", "dist/main.js"]
