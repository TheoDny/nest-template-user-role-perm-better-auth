# NestJS Better Auth API

Production-oriented NestJS API using Better Auth, Prisma, PostgreSQL, organization access control, MJML emails, and pnpm.

## Requirements

- Node.js 22+
- pnpm 11+
- Docker

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm start:dev
```

Mailpit is available at `http://localhost:8025`.

## Seed Data

Run the database seed after migrations:

```bash
pnpm prisma:seed
```

The seed is idempotent and creates:

- 3 organizations: `acme-workspace`, `globex-workspace`, and `initech-workspace`.
- 1 admin user, `admin@example.com`, with the `owner` role in all 3 organizations.
- 2 member users, `member.one@example.com` and `member.two@example.com`, each assigned to 2 organizations.
- 1 member user, `member.three@example.com`, assigned to all 3 organizations.

## Auth

Better Auth is mounted at:

```http
/api/auth/*
```

The app uses:

- Better Auth Prisma adapter.
- Prisma 7 configuration through `prisma.config.ts`.
- Email/password with `requireEmailVerification: false`.
- Email/password with `autoSignIn: false`.
- Admin plugin.
- Organization plugin with dynamic access control.
- Email OTP plugin.

## Custom Routes

Public:

```http
GET /status
GET /organizations/:organizationId/invitations/:invitationId
```

Session:

```http
POST /auth/login
POST /auth/logout
GET /auth/authenticated
GET /auth/session
```

Permissions:

```http
GET /permissions
POST /permissions/check
```

Organization roles use the active organization from the session:

```http
GET /roles
PATCH /roles/:roleId
PATCH /roles/:roleId/permissions
DELETE /roles/:roleId
```

Organization members use the active organization from the session:

```http
GET /members
PATCH /members/:memberId/roles
DELETE /members/:memberId
```

Organization invitations use the active organization from the session except for the public lookup route:

```http
POST /invitations
GET /invitations
PATCH /invitations/:invitationId/roles
POST /invitations/:invitationId/cancel
POST /invitations/:invitationId/accept
POST /invitations/:invitationId/reject
```

## Commands

```bash
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
pnpm format
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm prisma:studio
```

## Prisma 7

The datasource URL is configured in `prisma.config.ts`, not in `prisma/schema.prisma`.

`PrismaClient` is created with the PostgreSQL driver adapter from `@prisma/adapter-pg`.

## Git Workflow

Development uses `develop` as the integration branch. Each phase is implemented from a `feature/...` branch, merged into `develop`, and tagged with `0.X.X-develop`.

Current phase tags:

- `0.1.0-develop`: project foundation
- `0.2.0-develop`: Better Auth foundation
- `0.3.0-develop`: common API infrastructure
- `0.4.0-develop`: session API
- `0.5.0-develop`: organization role API
- `0.6.0-develop`: organization member API
- `0.7.0-develop`: invitation API and email delivery
- `0.8.0-develop`: tests and documentation
- `0.9.0-develop`: agent documentation
- `0.10.0-develop`: permissions API
- `0.11.0-develop`: login and logout API
