import { ActiveOrganizationRequiredError } from "@app/common/errors"
import { OrganizationRolesService } from "./organization-roles.service"

jest.mock("@thallesp/nestjs-better-auth", () => ({
    AuthService: class AuthService {},
}))

jest.mock("better-auth/node", () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}))

describe("OrganizationRolesService", () => {
    it("creates an organization role with Better Auth", async () => {
        const createOrgRole = jest.fn().mockResolvedValue({
            success: true,
        })
        const service = new OrganizationRolesService(
            {
                api: {
                    createOrgRole,
                },
            } as never,
            {
                member: {
                    findMany: jest.fn(),
                },
            } as never,
        )

        await expect(
            service.create(
                {
                    cookie: "better-auth.session_token=token",
                },
                "org_1",
                {
                    role: "manager",
                    permissions: {
                        member: ["read"],
                    },
                },
            ),
        ).resolves.toEqual({
            success: true,
        })

        expect(createOrgRole).toHaveBeenCalledWith({
            body: {
                organizationId: "org_1",
                role: "manager",
                permission: {
                    member: ["read"],
                },
            },
            headers: expect.any(Headers),
        })
    })

    it("requires an active organization before creating a role", () => {
        const createOrgRole = jest.fn()
        const service = new OrganizationRolesService(
            {
                api: {
                    createOrgRole,
                },
            } as never,
            {
                member: {
                    findMany: jest.fn(),
                },
            } as never,
        )

        expect(() =>
            service.create({}, null, {
                role: "manager",
            }),
        ).toThrow(ActiveOrganizationRequiredError)
        expect(createOrgRole).not.toHaveBeenCalled()
    })
})
