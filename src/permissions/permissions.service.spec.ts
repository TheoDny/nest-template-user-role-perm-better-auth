import { PermissionsService } from "./permissions.service"
import type { SessionService } from "@app/auth/services/session.service"

jest.mock("@thallesp/nestjs-better-auth", () => ({
    AuthService: class AuthService {},
}))

jest.mock("better-auth/node", () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}))

jest.mock("@app/auth/permissions", () => ({
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
            member: [],
            invitation: [],
            ac: [],
        },
    },
}))

describe("PermissionsService", () => {
    it("lists every API permission using the resource:action format", () => {
        const service = new PermissionsService({} as SessionService)

        expect(service.listApiPermissions().permissions).toEqual(
            expect.arrayContaining([
                {
                    resource: "member",
                    action: "read",
                    permission: "member:read",
                },
                {
                    resource: "ac",
                    action: "delete",
                    permission: "ac:delete",
                },
            ]),
        )
    })

    it("checks current user permissions", async () => {
        const sessionService = {
            findCurrentPermissions: jest.fn().mockResolvedValue({
                permissions: ["member:read", "invitation:create"],
                roles: ["admin"],
            }),
        } as unknown as SessionService
        const service = new PermissionsService(sessionService)

        await expect(
            service.checkUserPermissions(
                {
                    user: {
                        id: "user_1",
                    },
                    session: {
                        activeOrganizationId: "org_1",
                    },
                } as never,
                {
                    permissions: ["member:read", "ac:delete"],
                },
            ),
        ).resolves.toEqual({
            authorized: false,
            permissions: [
                {
                    permission: "member:read",
                    granted: true,
                },
                {
                    permission: "ac:delete",
                    granted: false,
                },
            ],
            missingPermissions: ["ac:delete"],
        })
    })
})
