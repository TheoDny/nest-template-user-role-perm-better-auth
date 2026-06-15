import type { AuthService } from "@thallesp/nestjs-better-auth"
import type { AppAuth } from "@app/auth/auth"
import type { PrismaService } from "@app/database/prisma.service"
import { OrganizationInvitationsService } from "./organization-invitations.service"

jest.mock("@thallesp/nestjs-better-auth", () => ({
    AuthService: class AuthService {},
}))

jest.mock("better-auth/node", () => ({
    fromNodeHeaders: jest.fn(
        (headers: Record<string, string | string[] | undefined>) => new Headers(headers as HeadersInit),
    ),
}))

describe("OrganizationInvitationsService", () => {
    it("creates a missing user before delegating invitation creation to Better Auth", async () => {
        const createInvitation = jest.fn().mockResolvedValue({ id: "invitation_1" })
        const createUser = jest.fn().mockResolvedValue({
            id: "user_1",
        })
        const prisma = {
            user: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: createUser,
            },
            organizationRole: {
                findMany: jest.fn().mockResolvedValue([]),
            },
        } as unknown as PrismaService
        const authService = {
            api: {
                createInvitation,
            },
        } as unknown as AuthService<AppAuth>
        const service = new OrganizationInvitationsService(authService, prisma)

        await service.create({}, "org_1", {
            email: "Invited.User@example.com",
            roles: ["member"],
            resend: true,
        })

        expect(createUser).toHaveBeenCalledWith({
            data: {
                email: "invited.user@example.com",
                name: "invited.user",
                emailVerified: false,
            },
        })
        expect(createInvitation).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    organizationId: "org_1",
                    email: "invited.user@example.com",
                    role: ["member"],
                    resend: true,
                }),
            }),
        )
    })
})
