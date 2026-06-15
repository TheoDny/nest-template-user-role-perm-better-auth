import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { PrismaService } from "../src/database/prisma.service"

jest.mock("better-auth", () => ({
    betterAuth: jest.fn(() => ({
        api: {},
        options: {
            basePath: "/api/auth",
            trustedOrigins: [],
        },
        $Infer: {},
    })),
}))

jest.mock("better-auth/adapters/prisma", () => ({
    prismaAdapter: jest.fn(() => ({})),
}))

jest.mock("better-auth/plugins", () => ({
    admin: jest.fn(() => ({})),
    organization: jest.fn(() => ({})),
    emailOTP: jest.fn(() => ({})),
}))

jest.mock("better-auth/plugins/access", () => ({
    createAccessControl: jest.fn(() => ({
        newRole: jest.fn((statements: Record<string, string[]>) => ({ statements })),
        statements: {},
    })),
}))

jest.mock("better-auth/node", () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}))

jest.mock("@thallesp/nestjs-better-auth", () => {
    const common = jest.requireActual<typeof import("@nestjs/common")>("@nestjs/common")

    class AuthService {}
    ;(AuthService.prototype as AuthService & { api: Record<string, jest.Mock> }).api = {
        signInEmail: jest.fn(() => {
            const headers = new Headers() as Headers & { getSetCookie: () => string[] }
            headers.getSetCookie = () => ["better-auth.session_token=login-token; Path=/; HttpOnly"]

            return {
                headers,
                response: {
                    redirect: false,
                    token: "login-token",
                    user: {
                        id: "user_1",
                        email: "user@example.com",
                    },
                },
            }
        }),
        signOut: jest.fn(() => {
            const headers = new Headers() as Headers & { getSetCookie: () => string[] }
            headers.getSetCookie = () => ["better-auth.session_token=; Path=/; Max-Age=0"]

            return {
                headers,
                response: {
                    success: true,
                },
            }
        }),
        setActiveOrganization: jest.fn(() => {
            const headers = new Headers() as Headers & { getSetCookie: () => string[] }
            headers.getSetCookie = () => ["better-auth.session_data=updated; Path=/; HttpOnly"]

            return {
                headers,
                response: {
                    id: "org_1",
                    name: "Acme",
                    slug: "acme",
                },
            }
        }),
    }

    class MockBetterAuthModule {
        static forRoot() {
            return {
                module: MockBetterAuthModule,
                global: true,
                providers: [AuthService],
                exports: [AuthService],
            }
        }
    }

    return {
        AuthModule: MockBetterAuthModule,
        AuthService,
        AllowAnonymous: () => common.SetMetadata("allowAnonymous", true),
        OptionalAuth: () => common.SetMetadata("optionalAuth", true),
        MemberHasPermission: () => common.SetMetadata("memberHasPermission", true),
        Session: common.createParamDecorator(() => null),
    }
})

describe("App e2e", () => {
    let app: INestApplication

    beforeAll(async () => {
        process.env.NODE_ENV = "test"
        process.env.PORT = "3000"
        process.env.DATABASE_URL = "postgresql://app:app@localhost:5432/app?schema=public"
        process.env.BETTER_AUTH_SECRET = "test-secret"
        process.env.BETTER_AUTH_URL = "http://localhost:3000"
        process.env.APP_PUBLIC_URL = "http://localhost:5173"
        process.env.SMTP_HOST = "localhost"
        process.env.SMTP_PORT = "1025"
        process.env.SMTP_FROM = "no-reply@example.com"

        const { AppModule } = await import("../src/app.module")
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({
                $connect: jest.fn(),
                $disconnect: jest.fn(),
            })
            .compile()

        app = moduleRef.createNestApplication()
        await app.init()
    })

    afterAll(async () => {
        await app?.close()
    })

    it("returns the public status payload", async () => {
        const response = await request(getHttpServer()).get("/status").expect(200)

        expect(response.body).toEqual({
            status: "ok",
            timestamp: expect.any(String),
        })
    })

    it("returns unauthenticated when no session is provided", async () => {
        const response = await request(getHttpServer()).get("/auth/authenticated").expect(200)

        expect(response.body).toEqual({
            authenticated: false,
        })
    })

    it("logs in with email and password", async () => {
        const response = await request(getHttpServer())
            .post("/auth/login")
            .send({
                email: "user@example.com",
                password: "password",
            })
            .expect(200)

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("better-auth.session_token=login-token")]),
        )
        expect(response.body).toEqual({
            redirect: false,
            token: "login-token",
            user: {
                id: "user_1",
                email: "user@example.com",
            },
        })
    })

    it("logs out the current session", async () => {
        const response = await request(getHttpServer())
            .post("/auth/logout")
            .set("Cookie", ["better-auth.session_token=login-token"])
            .expect(200)

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("better-auth.session_token=;")]),
        )
        expect(response.body).toEqual({
            success: true,
        })
    })

    it("sets the active organization", async () => {
        const response = await request(getHttpServer())
            .post("/auth/active-organization")
            .set("Cookie", ["better-auth.session_token=login-token"])
            .send({
                organizationId: "org_1",
            })
            .expect(200)

        expect(response.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("better-auth.session_data=updated")]),
        )
        expect(response.body).toEqual({
            id: "org_1",
            name: "Acme",
            slug: "acme",
        })
    })

    it("returns the public API permission catalog", async () => {
        const response = await request(getHttpServer()).get("/permissions").expect(200)

        expect(response.body.permissions).toEqual(
            expect.arrayContaining([
                {
                    resource: "member",
                    action: "read",
                    permission: "member:read",
                },
            ]),
        )
    })

    function getHttpServer(): Parameters<typeof request>[0] {
        return app.getHttpServer() as Parameters<typeof request>[0]
    }
})
