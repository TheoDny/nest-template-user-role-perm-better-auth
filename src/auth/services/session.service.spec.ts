import { SessionService } from "./session.service"
import type { PrismaService } from "@app/database/prisma.service"
import { ForbiddenActionError } from "@app/common/errors"

jest.mock("@thallesp/nestjs-better-auth", () => ({
    AuthService: class AuthService {},
}))

jest.mock("better-auth/node", () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}))

jest.mock("../permissions", () => ({
    organizationStatements: {
        organization: ["update", "delete"],
        member: ["create", "read", "update", "delete"],
        invitation: ["create", "read", "update", "cancel"],
        ac: ["create", "read", "update", "delete"],
    },
    ownerRole: {
        statements: {
            organization: ["update", "delete"],
            member: ["create", "read", "update", "delete"],
            invitation: ["create", "read", "update", "cancel"],
            ac: ["create", "read", "update", "delete"],
        },
    },
    adminRole: {
        statements: {
            organization: ["update"],
            member: ["create", "read", "update", "delete"],
            invitation: ["create", "read", "update", "cancel"],
            ac: ["create", "read", "update"],
        },
    },
    memberRole: {
        statements: {
            member: ["read"],
            invitation: ["read"],
            ac: ["read"],
        },
    },
}))

describe("SessionService", () => {
    it("builds a custom session with active organization roles and unique permissions", async () => {
        const prisma = {
            member: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        organization: {
                            id: "org_1",
                            name: "Acme",
                        },
                    },
                ]),
                findUnique: jest.fn().mockResolvedValue({
                    role: "admin,custom",
                }),
            },
            organizationRole: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        role: "custom",
                        permission: {
                            invitation: ["read"],
                            ac: ["read"],
                        },
                    },
                ]),
            },
        } as unknown as PrismaService
        const service = new SessionService(prisma, buildAuthService() as never)
        const result = await service.buildCustomSession({
            user: {
                id: "user_1",
                name: "Ada",
                email: "ada@example.com",
                emailVerified: false,
                image: null,
                banned: null,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            session: {
                id: "session_1",
                userId: "user_1",
                token: "token",
                expiresAt: new Date("2026-01-02T00:00:00.000Z"),
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
                ipAddress: null,
                userAgent: null,
                activeOrganizationId: "org_1",
            },
        })

        expect(result.organizations).toEqual([{ id: "org_1", name: "Acme" }])
        expect(result.roles).toEqual(["admin", "custom"])
        expect(result.permissions).toContain("member:update")
        expect(result.permissions).toContain("invitation:read")
        expect(result.permissions).toContain("ac:read")
    })

    it("builds a custom session without roles or permissions when the user has no organization", async () => {
        const sessionUpdate = jest.fn()
        const prisma = {
            member: {
                findFirst: jest.fn().mockResolvedValue(null),
                findMany: jest.fn().mockResolvedValue([]),
            },
            session: {
                update: sessionUpdate,
            },
            organizationRole: {
                findMany: jest.fn(),
            },
        } as unknown as PrismaService
        const service = new SessionService(prisma, buildAuthService() as never)
        const result = await service.buildCustomSession({
            user: {
                id: "user_1",
                name: "Ada",
                email: "ada@example.com",
                emailVerified: false,
                image: null,
                banned: null,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            session: {
                id: "session_1",
                userId: "user_1",
                token: "token",
                expiresAt: new Date("2026-01-02T00:00:00.000Z"),
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
                ipAddress: null,
                userAgent: null,
                activeOrganizationId: null,
            },
        })

        expect(result.organizations).toEqual([])
        expect(result.roles).toEqual([])
        expect(result.permissions).toEqual([])
        expect(result.session.activeOrganizationId).toBeNull()
        expect(sessionUpdate).not.toHaveBeenCalled()
    })

    it("lists the current user's sessions with Better Auth", async () => {
        const sessions = [
            {
                id: "session_1",
                token: "current-token",
                userId: "user_1",
            },
        ]
        const authService = buildAuthService({
            listSessions: jest.fn().mockResolvedValue(sessions),
        })
        const service = new SessionService(buildPrisma(), authService as never)

        await expect(
            service.listSessions({
                cookie: "better-auth.session_token=current-token",
            }),
        ).resolves.toEqual(sessions)

        expect(authService.api.listSessions).toHaveBeenCalledWith({
            headers: expect.any(Headers),
        })
    })

    it("revokes another current user session with Better Auth", async () => {
        const authService = buildAuthService({
            revokeSession: jest.fn().mockResolvedValue({
                status: true,
            }),
        })
        const service = new SessionService(buildPrisma(), authService as never)

        await expect(
            service.revokeSession(
                {
                    cookie: "better-auth.session_token=current-token",
                },
                "current-token",
                {
                    token: "other-token",
                },
            ),
        ).resolves.toEqual({
            status: true,
        })

        expect(authService.api.revokeSession).toHaveBeenCalledWith({
            body: {
                token: "other-token",
            },
            headers: expect.any(Headers),
        })
    })

    it("rejects revoking the current request session", () => {
        const authService = buildAuthService({
            revokeSession: jest.fn(),
        })
        const service = new SessionService(buildPrisma(), authService as never)

        expect(() =>
            service.revokeSession({}, "current-token", {
                token: "current-token",
            }),
        ).toThrow(ForbiddenActionError)
        expect(authService.api.revokeSession).not.toHaveBeenCalled()
    })
})

function buildAuthService(api: Record<string, jest.Mock> = {}): { api: Record<string, jest.Mock> } {
    return {
        api,
    }
}

function buildPrisma(): PrismaService {
    return {
        member: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        organizationRole: {
            findMany: jest.fn(),
        },
        session: {
            update: jest.fn(),
        },
    } as unknown as PrismaService
}
