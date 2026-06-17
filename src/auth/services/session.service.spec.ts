import { SessionService } from "./session.service"
import type { PrismaService } from "@app/database/prisma.service"

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
        const service = new SessionService(prisma)
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
        const service = new SessionService(prisma)
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
})
