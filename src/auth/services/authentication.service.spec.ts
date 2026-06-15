import type { Response } from "express"
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
        const service = new AuthenticationService(authService as never)

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
    })

    it("signs out with Better Auth and forwards cleanup cookies", async () => {
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
        const append = jest.fn()
        const response = buildResponse(append)
        const service = new AuthenticationService(authService as never)

        await expect(
            service.logout(
                {
                    cookie: "better-auth.session_token=login-token",
                },
                response,
            ),
        ).resolves.toEqual({
            success: true,
        })

        expect(signOut).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            returnHeaders: true,
        })
        expect(append).toHaveBeenCalledWith("Set-Cookie", "better-auth.session_token=; Path=/; Max-Age=0")
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
