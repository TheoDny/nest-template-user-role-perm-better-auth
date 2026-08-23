# ============================================================
# Base
# ============================================================
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
    && corepack prepare pnpm --activate

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


# ============================================================
# Build
# ============================================================
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

ENV DATABASE_URL="postgresql://app:app@postgres:5432/app?schema=public"

RUN pnpm prisma generate
RUN pnpm build


# ============================================================
# Production dependencies
# ============================================================
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod


# ============================================================
# API PRODUCTION
# ============================================================
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S app \
    && adduser -S app -G app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

USER app

EXPOSE 3000

CMD ["node", "dist/src/main.js"]


# ============================================================
# MIGRATION JOB
# ============================================================
FROM base AS migration

COPY --from=deps /app/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src/database/prisma-client.factory.ts ./src/database/prisma-client.factory.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

ENV DATABASE_URL="postgresql://app:app@postgres:5432/app?schema=public"
RUN pnpm prisma generate

RUN chmod +x ./docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]