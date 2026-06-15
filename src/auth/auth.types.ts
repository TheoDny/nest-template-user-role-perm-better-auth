import type { User } from "better-auth/client"

export type CorrectUser = User & {
    role: string | null
    banned: boolean | null
    banReason: string | null
    banExpires: Date | null
}

export type CorrectSession = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    expiresAt: Date
    token: string
    ipAddress: string | null
    userAgent: string | null
    activeOrganizationId: string | null
    impersonatedBy: string | null
}

export type BuildCustomSessionParams = {
    session: CorrectSession
    user: CorrectUser
}

export type CustomSession = {
    user: CorrectUser
    session: CorrectSession
    permissions: string[]
    roles: string[]
    organizations: { id: string; name: string }[]
}
