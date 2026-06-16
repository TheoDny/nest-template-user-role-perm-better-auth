# AGENTS.md

This document is the operating guide for agents and contributors working on this repository.

The project is a NestJS API template built around Better Auth, organization-scoped roles, permissions, members, invitations, Prisma, PostgreSQL, MJML email templates, and a strict Git workflow.

## Core Rules

- Use `pnpm` for all package operations.
- Keep code, comments, branch names, and commit messages in English.
- Follow the existing NestJS module/controller/service/DTO structure.
- Prefer Better Auth APIs whenever Better Auth exposes the required behavior.
- Use Prisma directly only when Better Auth does not expose the required operation.
- Do not bypass DTO validation for public inputs.
- Do not remove the global validation pipe or global exception filter.
- Do not change the `.prettierrc` unless explicitly requested.
- Do not commit generated or local-only files such as `.env`, `dist`, `node_modules`, `coverage`, `work`, or `outputs`.

## Technology Stack

- Runtime: Node.js 22+
- Package manager: pnpm
- Framework: NestJS
- Auth: Better Auth
- Nest auth integration: `@thallesp/nestjs-better-auth`
- ORM: Prisma
- Prisma config: `prisma.config.ts`
- Database: PostgreSQL
- Email rendering: MJML
- Email transport: Nodemailer
- Local email inbox: Mailpit
- Tests: Jest, Supertest

## Local Commands

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
pnpm format
pnpm start:dev
```

Local infrastructure:

```bash
docker compose up -d
```

Mailpit UI:

```text
http://localhost:8025
```

API default URL:

```text
http://localhost:3000
```

## Environment

The project requires `.env`, based on `.env.example`.

Important variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: Better Auth secret.
- `BETTER_AUTH_URL`: API base URL.
- `BETTER_AUTH_BASE_PATH`: Better Auth native route base path, currently `/api/auth`.
- `BETTER_AUTH_TRUSTED_ORIGINS`: comma-separated trusted origins.
- `APP_PUBLIC_URL`: frontend/public app URL used for invitation links.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`: email transport settings.

Never commit `.env`.

## Git Workflow

The integration branch is:

```text
develop
```

For new work:

1. Start from an up-to-date `develop`.
2. Create a branch whose name starts with `feature/`.
3. Commit regularly with English commit messages.
4. Merge the branch into `develop`.
5. Tag `develop` using the `0.X.X-develop` pattern when completing a planned phase.

Existing phase tags:

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
- `0.12.0-develop`: active organization session API
- `0.13.0-develop`: organization role creation API
- `0.14.0-develop`: email OTP authentication API

## Architecture

The project follows a conventional NestJS layered architecture.

Controllers:

- Own HTTP routing.
- Apply auth decorators.
- Read request headers and session data.
- Validate route params and request bodies through DTOs.
- Delegate business logic to services.

Services:

- Own business rules.
- Call Better Auth APIs.
- Use Prisma for application-owned queries or Better Auth gaps.
- Throw custom application errors.

DTOs:

- Validate every body and path parameter.
- Use `class-validator`.
- Keep names explicit.

Common infrastructure:

- `src/common/errors`: custom error classes.
- `src/common/filters`: global exception formatting.
- `src/config`: env loading and validation.
- `src/database`: Prisma service and module.

## Project Structure

```text
src/
  app.module.ts
  main.ts
  auth/
    auth.ts
    auth.module.ts
    auth.types.ts
    permissions.ts
    controllers/
    services/
  common/
    errors/
    filters/
  config/
  database/
  health/
  mail/
    templates/
  organizations/
    invitations/
      dto/
    members/
      dto/
    roles/
      dto/
  permissions/
    dto/
test/
prisma/
```

## Better Auth Configuration

Better Auth is configured in:

```text
src/auth/auth.ts
```

Current plugins:

- `admin()`
- `organization()`
- `emailOTP()`

Important auth settings:

- `emailAndPassword.enabled = true`
- `emailAndPassword.requireEmailVerification = false`
- `emailAndPassword.autoSignIn = false`
- Organization dynamic access control is enabled.
- Invitation emails are sent through MJML + Nodemailer.
- Email OTP messages are sent through MJML + Nodemailer.

Native Better Auth routes are mounted under:

```http
/api/auth/*
```

## Access Control

Access control statements are defined in:

```text
src/auth/permissions.ts
```

Current resources:

```ts
organization: ["update", "delete"]
member: ["create", "read", "update", "delete"]
invitation: ["create", "read", "update", "cancel"]
ac: ["create", "read", "update", "delete"]
```

Default roles:

- `owner`
- `admin`
- `member`

Dynamic organization roles are enabled through Better Auth organization dynamic access control.

Controller permission checks must use `@MemberHasPermission`:

- Role management: `{ ac: [...] }`
- Member management: `{ member: [...] }`
- Invitation management: `{ invitation: [...] }`

## Session And Active Organization

Management routes do not receive `organizationId` in the path.

The active organization is read from:

```ts
session.session.activeOrganizationId
```

If no active organization is available, services must throw:

```ts
ActiveOrganizationRequiredError
```

The only route that intentionally keeps `organizationId` in the URL is the public invitation lookup route:

```http
GET /organizations/:organizationId/invitations/:invitationId
```

## Route Reference

### Health

#### `GET /status`

Decorator:

```ts
@AllowAnonymous()
```

Returns:

```json
{
    "status": "ok",
    "timestamp": "2026-06-15T00:00:00.000Z"
}
```

Controller:

```text
src/health/health.controller.ts
```

### Session

#### `POST /auth/login`

Decorator:

```ts
@AllowAnonymous()
```

Body:

```ts
{
    email: string
    password: string
    rememberMe?: boolean
    callbackURL?: string
}
```

Calls:

```text
auth.api.signInEmail
```

Returns the Better Auth email/password sign-in response and forwards Better Auth `Set-Cookie` headers to the Nest response.

Implementation:

```text
src/auth/controllers/session.controller.ts
src/auth/dto/login.dto.ts
src/auth/services/authentication.service.ts
```

Rules:

- The route is public because it creates the user session.
- The controller must stay thin and delegate Better Auth calls to `AuthenticationService`.
- The DTO validates email, password, optional `rememberMe`, and optional `callbackURL`.
- Keep `returnHeaders: true` so Better Auth session cookies are forwarded to the client.

#### `POST /auth/logout`

Protected by the global auth guard.

Calls:

```text
auth.api.signOut
```

Returns:

```json
{
    "success": true
}
```

Rules:

- Forward request headers with `fromNodeHeaders(request.headers)`.
- Keep `returnHeaders: true` so Better Auth cleanup cookies are forwarded to the client.

#### `POST /auth/email-otp/send`

Decorator:

```ts
@AllowAnonymous()
```

Body:

```ts
{
    email: string
    type: "sign-in" | "change-email" | "email-verification" | "forget-password"
}
```

Calls:

```text
auth.api.sendVerificationOTP
```

Rules:

- Use `type: "sign-in"` before `POST /auth/email-otp/sign-in`.
- Use Better Auth's email OTP plugin so MJML/Nodemailer delivery remains centralized in the existing mailer.

#### `POST /auth/email-otp/sign-in`

Decorator:

```ts
@AllowAnonymous()
```

Body:

```ts
{
    email: string
    otp: string
    name?: string
    image?: string
}
```

Calls:

```text
auth.api.signInEmailOTP
```

Rules:

- Forward request headers with `fromNodeHeaders(request.headers)`.
- Keep `returnHeaders: true` so Better Auth session cookies are forwarded to the client.

#### `POST /auth/password-reset/email-otp`

Decorator:

```ts
@AllowAnonymous()
```

Body:

```ts
{
    email: string
}
```

Calls:

```text
auth.api.requestPasswordResetEmailOTP
```

Rules:

- This route requests the reset OTP email; Better Auth handles OTP creation and mail delivery through the configured email OTP plugin.

#### `POST /auth/active-organization`

Protected by the global auth guard.

Body:

```ts
{
    organizationId?: string | null
    organizationSlug?: string
}
```

Calls:

```text
auth.api.setActiveOrganization
```

Rules:

- Use `organizationId` when the client has the organization ID.
- Use `organizationSlug` when the client only has the slug.
- Send `organizationId: null` to unset the active organization.
- An empty body is rejected with `InvalidActiveOrganizationSelectionError`.
- Forward request headers with `fromNodeHeaders(request.headers)`.
- Keep `returnHeaders: true` so Better Auth session cookies are forwarded to the client.
- The controller delegates to `AuthenticationService` and uses `SetActiveOrganizationDto`.

#### `GET /auth/authenticated`

Decorator:

```ts
@OptionalAuth()
```

Returns:

```json
{
    "authenticated": false
}
```

Use this route when the client needs to know whether a valid Better Auth session exists without forcing authentication.

#### `GET /auth/session`

Protected by the global auth guard.

Returns the custom session shape:

```ts
{
    user: CorrectUser
    session: CorrectSession
    permissions: string[]
    roles: string[]
    organizations: { id: string; name: string }[]
}
```

Implementation:

```text
src/auth/controllers/session.controller.ts
src/auth/services/session.service.ts
```

Rules:

- `permissions` are unique and sorted.
- `roles` come from the current user's membership in the active organization.
- `organizations` lists all organizations available to the current user.
- If no active organization exists, `permissions` and `roles` are empty.

### API Permissions

Base path:

```http
/permissions
```

Implementation:

```text
src/permissions/
```

#### `GET /permissions`

Decorator:

```ts
@AllowAnonymous()
```

Returns the permission catalog used by the API.

Response shape:

```ts
{
    permissions: {
        resource: string
        action: string
        permission: string
    }
    ;[]
    resources: Record<string, readonly string[]>
}
```

Permission strings use the `resource:action` format, for example:

```text
member:read
invitation:create
ac:update
```

#### `POST /permissions/check`

Protected by the global auth guard.

DTO:

```ts
{
    permissions: string[]
}
```

Input permissions must use the `resource:action` format.

Returns:

```ts
{
    authorized: boolean
    permissions: {
        permission: string
        granted: boolean
    }[]
    missingPermissions: string[]
}
```

Rules:

- The current user is taken from the Better Auth session.
- The organization scope comes from `session.session.activeOrganizationId`.
- Permission computation reuses `SessionService.findCurrentPermissions`.
- If there is no active organization, every requested permission is denied.

### Organization Roles

Base path:

```http
/roles
```

Organization scope:

```ts
session.session.activeOrganizationId
```

Implementation:

```text
src/organizations/roles/
```

#### `GET /roles`

Permission:

```ts
@MemberHasPermission({ permissions: { ac: ["read"] } })
```

Uses:

```ts
auth.api.listOrgRoles
```

#### `POST /roles`

Permission:

```ts
@MemberHasPermission({ permissions: { ac: ["create"] } })
```

DTO:

```ts
{
    role: string
    permissions?: Record<string, string[]>
}
```

Uses:

```ts
auth.api.createOrgRole
```

Rules:

- The organization ID comes from `session.session.activeOrganizationId`.
- The service maps the API DTO field `permissions` to Better Auth's `permission` body field.
- Better Auth enforces that the current member cannot create a role with permissions they do not have.

#### `PATCH /roles/:roleId`

Permission:

```ts
@MemberHasPermission({ permissions: { ac: ["update"] } })
```

DTO:

```ts
{
    name: string
}
```

Uses:

```ts
auth.api.updateOrgRole
```

#### `PATCH /roles/:roleId/permissions`

Permission:

```ts
@MemberHasPermission({ permissions: { ac: ["update"] } })
```

DTO:

```ts
{
    permissions: Record<string, string[]>
}
```

Uses:

```ts
auth.api.updateOrgRole
```

#### `DELETE /roles/:roleId`

Permission:

```ts
@MemberHasPermission({ permissions: { ac: ["delete"] } })
```

Uses:

```ts
auth.api.getOrgRole
auth.api.deleteOrgRole
```

Business rules:

- The `owner` role cannot be deleted.
- A role assigned to members cannot be deleted.

### Organization Members

Base path:

```http
/members
```

Organization scope:

```ts
session.session.activeOrganizationId
```

Implementation:

```text
src/organizations/members/
```

#### `GET /members`

Permission:

```ts
@MemberHasPermission({ permissions: { member: ["read"] } })
```

Uses:

```ts
auth.api.listMembers
```

#### `PATCH /members/:memberId/roles`

Permission:

```ts
@MemberHasPermission({ permissions: { member: ["update"] } })
```

DTO:

```ts
{
    roles: string[]
}
```

Uses:

```ts
auth.api.updateMemberRole
```

Business rules:

- Requested roles must exist.
- Static roles `owner`, `admin`, and `member` are always valid.
- Dynamic roles are read from `organizationRole`.
- Removing the last owner is forbidden.

#### `DELETE /members/:memberId`

Permission:

```ts
@MemberHasPermission({ permissions: { member: ["delete"] } })
```

Uses:

```ts
auth.api.removeMember
```

Business rules:

- Removing the last owner is forbidden.
- Self-removal is forbidden through this admin route.

### Organization Invitations

Most invitation routes use the active organization from the session.

Implementation:

```text
src/organizations/invitations/
```

#### `POST /invitations`

Permission:

```ts
@MemberHasPermission({ permissions: { invitation: ["create"] } })
```

DTO:

```ts
{
    email: string
    roles: string[]
    resend?: boolean
}
```

Uses:

```ts
auth.api.createInvitation
```

Business rules:

- Normalize email to lowercase.
- Validate requested roles.
- If the email does not belong to an existing user, create a user first.
- Pre-created user `name` is the email prefix before `@`.
- Pre-created users are created without a password.
- Invitation email is sent through the Better Auth `sendInvitationEmail` hook.

#### `GET /invitations`

Permission:

```ts
@MemberHasPermission({ permissions: { invitation: ["read"] } })
```

Uses:

```ts
auth.api.listInvitations
```

Lists invitations for the active organization.

#### `GET /organizations/:organizationId/invitations/:invitationId`

Decorator:

```ts
@AllowAnonymous()
```

Uses Prisma directly.

Reason:

- Better Auth `getInvitation` requires auth headers.
- This project requires a public invitation lookup route.

Returned public data is intentionally limited to:

- invitation id
- organization id
- invited email
- role
- status
- expiration date
- organization public info
- inviter public info

#### `PATCH /invitations/:invitationId/roles`

Permission:

```ts
@MemberHasPermission({ permissions: { invitation: ["update"] } })
```

DTO:

```ts
{
    roles: string[]
}
```

Uses Prisma directly.

Reason:

- Better Auth does not expose a native update-invitation-roles API.

Business rules:

- Invitation must belong to the active organization.
- Invitation must still be `pending`.
- Requested roles must exist.

#### `POST /invitations/:invitationId/cancel`

Permission:

```ts
@MemberHasPermission({ permissions: { invitation: ["cancel"] } })
```

Uses:

```ts
auth.api.cancelInvitation
```

#### `POST /invitations/:invitationId/accept`

Protected by the global auth guard.

Uses:

```ts
auth.api.acceptInvitation
```

Rules:

- Does not require current membership in the target organization.
- Better Auth handles invitation acceptance rules.

#### `POST /invitations/:invitationId/reject`

Protected by the global auth guard.

Uses:

```ts
auth.api.rejectInvitation
```

Rules:

- Does not require current membership in the target organization.
- Better Auth handles invitation rejection rules.

## Email

Email code lives in:

```text
src/mail/
```

Templates:

```text
src/mail/templates/invitation.template.ts
src/mail/templates/email-otp.template.ts
```

Rendering and sending:

```text
src/mail/mailer.ts
```

The `MailModule` and `MailService` are available for Nest-managed application email code. Better Auth hooks use standalone functions because the Better Auth instance is created outside Nest dependency injection.

## Prisma

Schema:

```text
prisma/schema.prisma
```

Configuration:

```text
prisma.config.ts
```

Rules:

- This project uses Prisma 7.
- The datasource URL must stay in `prisma.config.ts`.
- Do not add `url = env("DATABASE_URL")` back to `prisma/schema.prisma`.
- PostgreSQL access must use `@prisma/adapter-pg`.
- All model IDs use `String @id @default(cuid())`.
- Keep Better Auth table names mapped with `@@map(...)`.
- Use direct Prisma writes to Better Auth-owned tables only when Better Auth lacks the required API.
- After moving the project or reinstalling dependencies, run `pnpm prisma:generate`.

Important models:

- `User`
- `Session`
- `Account`
- `Verification`
- `Organization`
- `Member`
- `Invitation`
- `OrganizationRole`

## Error Handling

Custom errors live in:

```text
src/common/errors/
```

Global exception formatting lives in:

```text
src/common/filters/global-exception.filter.ts
```

Stable error payload:

```ts
{
    statusCode: number
    error: string
    message: string
    code: string
    timestamp: string
    path: string
}
```

Use custom errors for expected business failures:

- `ResourceNotFoundError`
- `ForbiddenActionError`
- `InvalidInvitationStateError`
- `InvalidRoleAssignmentError`
- `LastOwnerRemovalError`
- `EmailAlreadyInvitedError`
- `ActiveOrganizationRequiredError`
- `BetterAuthOperationError`

## Validation

Global validation is configured in:

```text
src/main.ts
```

Rules:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`
- `stopAtFirstError: false`

Every mutation must use a body DTO.

Every path parameter route should use a params DTO.

## Testing

Unit tests currently cover:

- Better Auth login/logout service calls and cookie forwarding
- Better Auth email OTP authentication and password reset requests
- Better Auth active organization service calls and cookie forwarding
- organization role creation
- custom session building
- invitation pre-user-creation flow
- API permission listing and permission checks
- global exception formatting

E2E smoke tests currently cover:

- `GET /status`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/email-otp/send`
- `POST /auth/email-otp/sign-in`
- `POST /auth/password-reset/email-otp`
- `POST /auth/active-organization`
- anonymous `GET /auth/authenticated`
- public `GET /permissions`

Run:

```bash
pnpm test
pnpm test:e2e
```

When adding new behavior:

- Add focused unit tests for service business rules.
- Add controller/e2e coverage for important route behavior.
- Mock Better Auth only when testing code that does not need Better Auth internals.

## Formatting And Linting

The repository uses the required `.prettierrc` at the root.

Run:

```bash
pnpm format
pnpm lint
```

Do not introduce a second formatter config.

## Common Pitfalls

- Do not pass `organizationId` in role/member/management invitation URLs; use `activeOrganizationId`.
- Do not remove the `bodyParser: false` Nest factory option. Better Auth needs raw body handling.
- Do not delete or rename `organizationRole`; dynamic access control relies on it.
- Do not use Prisma direct writes when a Better Auth API exists.
- Do not delete the `owner` role or allow removing the last owner.
- Do not expose full invitation internals on the public invitation lookup route.
- Do not assume `node_modules` remains valid after moving the project across drives; run `pnpm install` and `pnpm prisma:generate`.

## Suggested Workflow For Future Agents

Before editing:

```bash
git status --short --branch
pnpm build
pnpm test
```

After editing:

```bash
pnpm format
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
```

For Prisma changes:

```bash
pnpm prisma:generate
pnpm exec prisma validate
```

Before final response:

- Confirm Git status.
- Mention tests run.
- Mention any skipped verification.
- Keep the response concise.
