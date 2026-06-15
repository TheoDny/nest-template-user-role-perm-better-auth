import { PrismaClient } from "@prisma/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, emailOTP, organization } from "better-auth/plugins"
import { ac, adminRole, memberRole, ownerRole } from "./permissions"

const prisma = new PrismaClient()

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    basePath: process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET ?? "development-secret-change-me",
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: false,
    },
    plugins: [
        admin(),
        organization({
            ac,
            roles: {
                owner: ownerRole,
                admin: adminRole,
                member: memberRole,
            },
            dynamicAccessControl: {
                enabled: true,
            },
            requireEmailVerificationOnInvitation: false,
            sendInvitationEmail: async () => {},
        }),
        emailOTP({
            sendVerificationOTP: async () => {},
            sendVerificationOnSignUp: false,
            disableSignUp: true,
            storeOTP: "hashed",
        }),
    ],
})

export type AppAuth = typeof auth
