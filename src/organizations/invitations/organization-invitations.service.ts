import { Injectable } from "@nestjs/common"
import { AuthService } from "@thallesp/nestjs-better-auth"
import { fromNodeHeaders } from "better-auth/node"
import type { IncomingHttpHeaders } from "node:http"
import { PrismaService } from "@app/database/prisma.service"
import {
    ActiveOrganizationRequiredError,
    InvalidInvitationStateError,
    InvalidRoleAssignmentError,
    ResourceNotFoundError,
} from "@app/common/errors"
import type { AppAuth } from "@app/auth/auth"
import type { CreateInvitationDto } from "./dto/create-invitation.dto"
import type { UpdateInvitationRolesDto } from "./dto/update-invitation-roles.dto"

const staticRoleNames = new Set(["owner", "admin", "member"])

@Injectable()
export class OrganizationInvitationsService {
    constructor(
        private readonly authService: AuthService<AppAuth>,
        private readonly prisma: PrismaService,
    ) {}

    async create(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        dto: CreateInvitationDto,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)
        const email = dto.email.toLowerCase()
        await this.ensureRolesExist(organizationId, dto.roles)
        await this.ensureUserExists(email)

        return this.authService.api.createInvitation({
            body: {
                organizationId,
                email,
                role: dto.roles,
                resend: dto.resend,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    list(headers: IncomingHttpHeaders, activeOrganizationId: string | null | undefined) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)

        return this.authService.api.listInvitations({
            query: {
                organizationId,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    async getPublic(organizationId: string, invitationId: string) {
        const invitation = await this.prisma.invitation.findFirst({
            where: {
                id: invitationId,
                organizationId,
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        if (!invitation) {
            throw new ResourceNotFoundError("Invitation not found")
        }

        return {
            id: invitation.id,
            organizationId: invitation.organizationId,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            organization: invitation.organization,
            inviter: invitation.inviter,
        }
    }

    async updateRoles(
        activeOrganizationId: string | null | undefined,
        invitationId: string,
        dto: UpdateInvitationRolesDto,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)
        await this.ensureRolesExist(organizationId, dto.roles)
        const invitation = await this.prisma.invitation.findFirst({
            where: {
                id: invitationId,
                organizationId,
            },
            select: {
                id: true,
                status: true,
            },
        })

        if (!invitation) {
            throw new ResourceNotFoundError("Invitation not found")
        }

        if (invitation.status !== "pending") {
            throw new InvalidInvitationStateError("Only pending invitations can be updated")
        }

        return this.prisma.invitation.update({
            where: {
                id: invitation.id,
            },
            data: {
                role: dto.roles.join(","),
            },
        })
    }

    cancel(headers: IncomingHttpHeaders, activeOrganizationId: string | null | undefined, invitationId: string) {
        this.requireActiveOrganization(activeOrganizationId)

        return this.authService.api.cancelInvitation({
            body: {
                invitationId,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    accept(headers: IncomingHttpHeaders, invitationId: string) {
        return this.authService.api.acceptInvitation({
            body: {
                invitationId,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    reject(headers: IncomingHttpHeaders, invitationId: string) {
        return this.authService.api.rejectInvitation({
            body: {
                invitationId,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    private requireActiveOrganization(activeOrganizationId: string | null | undefined): string {
        if (!activeOrganizationId) {
            throw new ActiveOrganizationRequiredError()
        }

        return activeOrganizationId
    }

    private async ensureUserExists(email: string): Promise<void> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        })

        if (existingUser) {
            return
        }

        await this.prisma.user.create({
            data: {
                email,
                name: email.split("@")[0] ?? email,
                emailVerified: false,
            },
        })
    }

    private async ensureRolesExist(organizationId: string, roles: string[]): Promise<void> {
        const uniqueRoles = [...new Set(roles)]
        const dynamicRoles = await this.prisma.organizationRole.findMany({
            where: {
                organizationId,
                role: {
                    in: uniqueRoles,
                },
            },
            select: {
                role: true,
            },
        })
        const validRoleNames = new Set([...staticRoleNames, ...dynamicRoles.map((role) => role.role)])
        const invalidRoles = uniqueRoles.filter((role) => !validRoleNames.has(role))

        if (invalidRoles.length > 0) {
            throw new InvalidRoleAssignmentError(`Unknown organization roles: ${invalidRoles.join(", ")}`)
        }
    }
}
