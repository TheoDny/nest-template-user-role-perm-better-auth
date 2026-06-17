import { PrismaService } from "@app/database/prisma.service"
import { ForbiddenActionError } from "@app/common/errors"
import { Injectable } from "@nestjs/common"
import type { Prisma } from "@prisma/client"
import { AuthService } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { fromNodeHeaders } from "better-auth/node"
import type { IncomingHttpHeaders } from "node:http"
import type { AppAuth } from "../auth"
import type { CorrectSession, CorrectUser, CustomSession } from "../auth.types"
import type { RevokeSessionDto } from "../dto/revoke-session.dto"
import { adminRole, memberRole, organizationStatements, ownerRole } from "../permissions"

type BetterAuthSession = UserSession<AppAuth>
type PermissionRecord = Record<string, readonly string[]>
type CurrentPermissionsContext = { permissions: string[]; roles: string[]; activeOrganizationId: string | null }

const staticRolePermissions: Record<string, PermissionRecord> = {
    owner: ownerRole.statements,
    admin: adminRole.statements,
    member: memberRole.statements,
}

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService<AppAuth>,
    ) {}

    async buildCustomSession(session: BetterAuthSession): Promise<CustomSession> {
        const userId = session.user.id
        const organizations = await this.findUserOrganizations(userId)
        const permissionsContext = await this.findCurrentPermissions(session)

        return {
            user: this.toCorrectUser(session.user),
            session: this.toCorrectSession(session.session, permissionsContext.activeOrganizationId),
            permissions: permissionsContext.permissions,
            roles: permissionsContext.roles,
            organizations,
        }
    }

    async findCurrentPermissions(session: BetterAuthSession): Promise<CurrentPermissionsContext> {
        const activeOrganizationId = await this.ensureActiveOrganization(session)

        if (!activeOrganizationId) {
            return {
                permissions: [],
                roles: [],
                activeOrganizationId: null,
            }
        }

        const roles = await this.findActiveOrganizationRoles(session.user.id, activeOrganizationId)

        return {
            permissions: await this.findUniquePermissions(activeOrganizationId, roles),
            roles,
            activeOrganizationId,
        }
    }

    listSessions(headers: IncomingHttpHeaders) {
        return this.authService.api.listSessions({
            headers: fromNodeHeaders(headers),
        })
    }

    revokeSession(headers: IncomingHttpHeaders, currentSessionToken: string, dto: RevokeSessionDto) {
        if (dto.token === currentSessionToken) {
            throw new ForbiddenActionError("The current session cannot be revoked through this route")
        }

        return this.authService.api.revokeSession({
            body: {
                token: dto.token,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    private async ensureActiveOrganization(session: BetterAuthSession): Promise<string | null> {
        const activeOrganizationId = session.session.activeOrganizationId ?? null

        if (activeOrganizationId) {
            return activeOrganizationId
        }

        const membership = await this.prisma.member.findFirst({
            where: {
                userId: session.user.id,
            },
            select: {
                organizationId: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        })

        if (!membership) {
            return null
        }

        await this.prisma.session.update({
            where: {
                id: session.session.id,
            },
            data: {
                activeOrganizationId: membership.organizationId,
            },
        })

        return membership.organizationId
    }

    private async findUserOrganizations(userId: string): Promise<{ id: string; name: string }[]> {
        const memberships = await this.prisma.member.findMany({
            where: { userId },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        })

        return memberships.map((membership) => membership.organization)
    }

    private async findActiveOrganizationRoles(userId: string, organizationId: string): Promise<string[]> {
        const membership = await this.prisma.member.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId,
                },
            },
            select: {
                role: true,
            },
        })

        return membership ? this.parseRoles(membership.role) : []
    }

    private async findUniquePermissions(organizationId: string, roles: string[]): Promise<string[]> {
        if (roles.length === 0) {
            return []
        }

        const dynamicRoles = await this.prisma.organizationRole.findMany({
            where: {
                organizationId,
                role: {
                    in: roles,
                },
            },
            select: {
                role: true,
                permission: true,
            },
        })

        const dynamicPermissionByRole = new Map(
            dynamicRoles.map((role) => [role.role, this.toPermissionRecord(role.permission)]),
        )
        const permissions = new Set<string>()

        for (const role of roles) {
            const permissionRecord = dynamicPermissionByRole.get(role) ?? staticRolePermissions[role] ?? {}

            for (const [resource, actions] of Object.entries(permissionRecord)) {
                for (const action of actions) {
                    permissions.add(`${resource}:${action}`)
                }
            }
        }

        return [...permissions].sort()
    }

    private parseRoles(role: string): string[] {
        return role
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
    }

    private toPermissionRecord(value: Prisma.JsonValue): PermissionRecord {
        if (typeof value === "string") {
            value = JSON.parse(value)
        }

        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {}
        }

        const result: PermissionRecord = {}

        for (const resource of Object.keys(organizationStatements)) {
            const actions = (value as Record<string, unknown>)[resource]

            if (Array.isArray(actions)) {
                result[resource] = actions.filter((action): action is string => typeof action === "string")
            }
        }

        return result
    }

    private toCorrectUser(user: BetterAuthSession["user"]): CorrectUser {
        const userWithAdminFields = user as BetterAuthSession["user"] & {
            role?: string | null
            banned?: boolean | null
            banReason?: string | null
            banExpires?: Date | null
        }

        return {
            ...user,
            role: userWithAdminFields.role ?? null,
            banned: userWithAdminFields.banned ?? null,
            banReason: userWithAdminFields.banReason ?? null,
            banExpires: userWithAdminFields.banExpires ?? null,
        }
    }

    private toCorrectSession(
        session: BetterAuthSession["session"],
        activeOrganizationIdOverride?: string | null,
    ): CorrectSession {
        const sessionWithPluginFields = session as BetterAuthSession["session"] & {
            activeOrganizationId?: string | null
            impersonatedBy?: string | null
        }

        return {
            id: session.id,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            userId: session.userId,
            expiresAt: session.expiresAt,
            token: session.token,
            ipAddress: session.ipAddress ?? null,
            userAgent: session.userAgent ?? null,
            activeOrganizationId:
                activeOrganizationIdOverride ?? sessionWithPluginFields.activeOrganizationId ?? null,
            impersonatedBy: sessionWithPluginFields.impersonatedBy ?? null,
        }
    }
}
