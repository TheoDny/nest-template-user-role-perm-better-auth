# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma reads DATABASE_URL from prisma.config.ts during client generation.
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm prisma:generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:22-alpine AS production

ENV NODE_ENV=${NODE_ENV:-production}
ENV PORT=${PORT}

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

USER app

EXPOSE ${PORT}

CMD ["node", "dist/main.js"]
