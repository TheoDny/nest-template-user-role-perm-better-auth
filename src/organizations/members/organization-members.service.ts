import type { AppAuth } from "@app/auth/auth"
import {
    ActiveOrganizationRequiredError,
    ForbiddenActionError,
    InvalidRoleAssignmentError,
    LastOwnerRemovalError,
    ResourceNotFoundError,
} from "@app/common/errors"
import { PrismaService } from "@app/database/prisma.service"
import { Injectable } from "@nestjs/common"
import { AuthService } from "@thallesp/nestjs-better-auth"
import { fromNodeHeaders } from "better-auth/node"
import type { IncomingHttpHeaders } from "node:http"
import type { UpdateMemberRolesDto } from "./dto/update-member-roles.dto"

const staticRoleNames = new Set(["owner", "admin", "member"])

@Injectable()
export class OrganizationMembersService {
    constructor(
        private readonly authService: AuthService<AppAuth>,
        private readonly prisma: PrismaService,
    ) {}

    async list(headers: IncomingHttpHeaders, activeOrganizationId: string | null | undefined) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)
        const result = await this.authService.api.listMembers({
            query: {
                organizationId,
            },
            headers: fromNodeHeaders(headers),
        })

        return result.members
    }

    async updateRoles(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        memberId: string,
        dto: UpdateMemberRolesDto,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)
        await this.ensureRolesExist(organizationId, dto.roles)
        await this.ensureLastOwnerIsPreserved(organizationId, memberId, dto.roles)

        return this.authService.api.updateMemberRole({
            body: {
                organizationId,
                memberId,
                role: dto.roles,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    async remove(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        currentUserId: string,
        memberId: string,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)
        const member = await this.findMemberOrThrow(organizationId, memberId)

        if (member.userId === currentUserId) {
            throw new ForbiddenActionError("Use a dedicated leave organization route for self-removal")
        }

        if (this.parseRoles(member.role).includes("owner")) {
            await this.ensureThereIsAnotherOwner(organizationId, memberId)
        }

        return this.authService.api.removeMember({
            body: {
                organizationId,
                memberIdOrEmail: memberId,
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

    private async ensureLastOwnerIsPreserved(
        organizationId: string,
        memberId: string,
        nextRoles: string[],
    ): Promise<void> {
        const member = await this.findMemberOrThrow(organizationId, memberId)
        const currentRoles = this.parseRoles(member.role)

        if (!currentRoles.includes("owner") || nextRoles.includes("owner")) {
            return
        }

        await this.ensureThereIsAnotherOwner(organizationId, memberId)
    }

    private async ensureThereIsAnotherOwner(organizationId: string, excludedMemberId: string): Promise<void> {
        const members = await this.prisma.member.findMany({
            where: {
                organizationId,
                id: {
                    not: excludedMemberId,
                },
            },
            select: {
                role: true,
            },
        })
        const hasAnotherOwner = members.some((member) => this.parseRoles(member.role).includes("owner"))

        if (!hasAnotherOwner) {
            throw new LastOwnerRemovalError()
        }
    }

    private async findMemberOrThrow(organizationId: string, memberId: string) {
        const member = await this.prisma.member.findFirst({
            where: {
                id: memberId,
                organizationId,
            },
            select: {
                id: true,
                userId: true,
                role: true,
            },
        })

        if (!member) {
            throw new ResourceNotFoundError("Organization member not found")
        }

        return member
    }

    private parseRoles(role: string): string[] {
        return role
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
    }
}
