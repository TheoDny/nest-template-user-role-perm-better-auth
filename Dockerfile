# ============================================================
# Base
# ============================================================
FROM oven/bun:1-alpine AS base

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================
FROM base AS deps

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile


# ============================================================
# Build
# ============================================================
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

ENV DATABASE_URL="postgresql://app:app@postgres:5432/app?schema=public"

RUN bun run prisma:generate
RUN bun run build


# ============================================================
# Production dependencies
# ============================================================
FROM base AS prod-deps

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production


# ============================================================
# API PRODUCTION
# ============================================================
FROM oven/bun:1-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S app \
    && adduser -S app -G app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/generated ./dist/prisma/generated
COPY --from=build /app/package.json ./package.json

USER app

EXPOSE 3000

CMD ["bun", "dist/src/main.js"]


# ============================================================
# MIGRATION JOB
# ============================================================
FROM base AS migration

COPY --from=deps /app/node_modules ./node_modules

COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src/database/prisma-client.factory.ts ./src/database/prisma-client.factory.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

ENV DATABASE_URL="postgresql://app:app@postgres:5432/app?schema=public"
RUN bun run prisma:generate

RUN chmod +x ./docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
