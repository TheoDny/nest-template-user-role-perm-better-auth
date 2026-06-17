import type { Response } from "express"
import type { PrismaService } from "@app/database/prisma.service"
import { InvalidActiveOrganizationSelectionError } from "@app/common/errors"
import { AuthenticationService } from "./authentication.service"

jest.mock("@thallesp/nestjs-better-auth", () => ({
    AuthService: class AuthService {},
}))

jest.mock("better-auth/node", () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}))

describe("AuthenticationService", () => {
    it("signs in with Better Auth and forwards session cookies", async () => {
        const responseHeaders = buildHeaders(["better-auth.session_token=login-token; Path=/; HttpOnly"])
        const signInEmail = jest.fn().mockResolvedValue({
            headers: responseHeaders,
            response: {
                redirect: false,
                token: "login-token",
                user: {
                    id: "user_1",
                    email: "user@example.com",
                },
            },
        })
        const authService = {
            api: {
                signInEmail,
            },
        }
        const append = jest.fn()
        const response = buildResponse(append)
        const prisma = buildPrisma()
        const service = new AuthenticationService(authService as never, prisma.service)

        await expect(
            service.login(
                {
                    "user-agent": "jest",
                },
                response,
                {
                    email: "user@example.com",
                    password: "password",
                    rememberMe: true,
                },
            ),
        ).resolves.toEqual({
            redirect: false,
            token: "login-token",
            user: {
                id: "user_1",
                email: "user@example.com",
            },
        })

        expect(signInEmail).toHaveBeenCalledWith({
            body: {
                email: "user@example.com",
                password: "password",
                callbackURL: undefined,
                rememberMe: true,
            },
            headers: expect.any(Headers),
            returnHeaders: true,
        })
        expect(append).toHaveBeenCalledWith(
            "Set-Cookie",
            "better-auth.session_token=login-token; Path=/; HttpOnly",
        )
        expect(prisma.memberFindFirst).toHaveBeenCalledWith({
            where: {
                userId: "user_1",
            },
            select: {
                organizationId: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        })
        expect(prisma.sessionUpdateMany).toHaveBeenCalledWith({
            where: {
                token: "login-token",
                activeOrganizationId: null,
            },
            data: {
                activeOrganizationId: "org_1",
            },
        })
    })

    it("signs out with Better Auth", async () => {
        const responseHeaders = buildHeaders(["better-auth.session_token=; Path=/; Max-Age=0"])
        const signOut = jest.fn().mockResolvedValue({
            headers: responseHeaders,
            response: {
                success: true,
            },
        })
        const authService = {
            api: {
                signOut,
            },
        }
        const service = new AuthenticationService(authService as never, buildPrisma().service)

        await expect(
            service.logout({
                cookie: "better-auth.session_token=login-token",
            }),
        ).resolves.toEqual({
            success: true,
        })

        expect(signOut).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            returnHeaders: true,
        })
    })

    it("sends a sign-in email OTP with Better Auth", async () => {
        const sendVerificationOTP = jest.fn().mockResolvedValue({
            success: true,
        })
        const authService = {
            api: {
                sendVerificationOTP,
            },
        }
        const service = new AuthenticationService(authService as never, buildPrisma().service)

        await expect(
            service.sendEmailOtp({
                email: "user@example.com",
                type: "sign-in",
            }),
        ).resolves.toEqual({
            success: true,
        })

        expect(sendVerificationOTP).toHaveBeenCalledWith({
            body: {
                email: "user@example.com",
                type: "sign-in",
            },
        })
    })

    it("signs in with email OTP and forwards session cookies", async () => {
        const responseHeaders = buildHeaders(["better-auth.session_token=otp-token; Path=/; HttpOnly"])
        const signInEmailOTP = jest.fn().mockResolvedValue({
            headers: responseHeaders,
            response: {
                token: "otp-token",
                user: {
                    id: "user_1",
                    email: "user@example.com",
                },
            },
        })
        const authService = {
            api: {
                signInEmailOTP,
            },
        }
        const append = jest.fn()
        const response = buildResponse(append)
        const service = new AuthenticationService(authService as never, buildPrisma().service)

        await expect(
            service.signInEmailOtp(
                {
                    "user-agent": "jest",
                },
                response,
                {
                    email: "user@example.com",
                    otp: "123456",
                },
            ),
        ).resolves.toEqual({
            token: "otp-token",
            user: {
                id: "user_1",
                email: "user@example.com",
            },
        })

        expect(signInEmailOTP).toHaveBeenCalledWith({
            body: {
                email: "user@example.com",
                otp: "123456",
                name: undefined,
                image: undefined,
            },
            headers: expect.any(Headers),
            returnHeaders: true,
        })
        expect(append).toHaveBeenCalledWith("Set-Cookie", "better-auth.session_token=otp-token; Path=/; HttpOnly")
    })

    it("requests a password reset email OTP with Better Auth", async () => {
        const requestPasswordResetEmailOTP = jest.fn().mockResolvedValue({
            success: true,
        })
        const authService = {
            api: {
                requestPasswordResetEmailOTP,
            },
        }
        const service = new AuthenticationService(authService as never, buildPrisma().service)

        await expect(
            service.requestPasswordResetEmailOtp({
                email: "user@example.com",
            }),
        ).resolves.toEqual({
            success: true,
        })

        expect(requestPasswordResetEmailOTP).toHaveBeenCalledWith({
            body: {
                email: "user@example.com",
            },
        })
    })

    it("sets the active organization with Better Auth and forwards session cookies", async () => {
        const responseHeaders = buildHeaders(["better-auth.session_data=updated; Path=/; HttpOnly"])
        const setActiveOrganization = jest.fn().mockResolvedValue({
            headers: responseHeaders,
            response: {
                id: "org_1",
                name: "Acme",
                slug: "acme",
            },
        })
        const authService = {
            api: {
                setActiveOrganization,
            },
        }
        const append = jest.fn()
        const response = buildResponse(append)
        const service = new AuthenticationService(authService as never, buildPrisma().service)

        await expect(
            service.setActiveOrganization(
                {
                    cookie: "better-auth.session_token=login-token",
                },
                response,
                {
                    organizationId: "org_1",
                },
            ),
        ).resolves.toEqual({
            id: "org_1",
            name: "Acme",
            slug: "acme",
        })

        expect(setActiveOrganization).toHaveBeenCalledWith({
            body: {
                organizationId: "org_1",
                organizationSlug: undefined,
            },
            headers: expect.any(Headers),
            returnHeaders: true,
        })
        expect(append).toHaveBeenCalledWith("Set-Cookie", "better-auth.session_data=updated; Path=/; HttpOnly")
    })

    it("rejects an empty active organization payload", async () => {
        const setActiveOrganization = jest.fn()
        const authService = {
            api: {
                setActiveOrganization,
            },
        }
        const service = new AuthenticationService(authService as never, buildPrisma().service)

        await expect(service.setActiveOrganization({}, buildResponse(jest.fn()), {})).rejects.toBeInstanceOf(
            InvalidActiveOrganizationSelectionError,
        )
        expect(setActiveOrganization).not.toHaveBeenCalled()
    })
})

function buildHeaders(setCookieHeaders: string[]): Headers & { getSetCookie: () => string[] } {
    const headers = new Headers() as Headers & { getSetCookie: () => string[] }
    headers.getSetCookie = () => setCookieHeaders

    return headers
}

function buildResponse(append: jest.Mock): Response {
    return {
        append,
    } as unknown as Response
}

function buildPrisma(): {
    memberFindFirst: jest.Mock
    service: PrismaService
    sessionUpdateMany: jest.Mock
} {
    const memberFindFirst = jest.fn().mockResolvedValue({
        organizationId: "org_1",
    })
    const sessionUpdateMany = jest.fn()
    const service = {
        member: {
            findFirst: memberFindFirst,
        },
        session: {
            updateMany: sessionUpdateMany,
        },
    } as unknown as PrismaService

    return {
        memberFindFirst,
        service,
        sessionUpdateMany,
    }
}
