# ==========================================
# Vault-Ledger Core API - Production Dockerfile
# Multi-stage build: Typecheck -> Test -> Production Runner
# ==========================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install build tooling for native modules (e.g. argon2)
RUN apk add --no-cache python3 make g++

# Copy package manifests for workspace caching
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install monorepo dependencies
RUN npm ci

# Copy application source code
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Verify type safety and execute test suite
RUN npm run typecheck -w @vault-ledger/shared
RUN npm run typecheck -w @vault-ledger/api
RUN npm test -w @vault-ledger/shared
RUN npm test -w @vault-ledger/api

# ==========================================
# Production Runtime Stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for container health check
RUN apk add --no-cache curl

# Run as dedicated unprivileged system user
RUN addgroup -S vault && adduser -S vault -G vault

# Copy installed dependencies and source trees from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json

USER vault

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npx", "tsx", "apps/api/src/index.ts"]
