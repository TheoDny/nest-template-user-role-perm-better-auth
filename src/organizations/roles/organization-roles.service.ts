import { Injectable } from "@nestjs/common"
import { AuthService } from "@thallesp/nestjs-better-auth"
import { fromNodeHeaders } from "better-auth/node"
import type { IncomingHttpHeaders } from "node:http"
import { PrismaService } from "@app/database/prisma.service"
import { ActiveOrganizationRequiredError, ForbiddenActionError } from "@app/common/errors"
import type { AppAuth } from "@app/auth/auth"
import type { CreateOrganizationRoleDto } from "./dto/create-organization-role.dto"
import type { UpdateOrganizationRoleNameDto } from "./dto/update-organization-role-name.dto"
import type { UpdateOrganizationRolePermissionsDto } from "./dto/update-organization-role-permissions.dto"

@Injectable()
export class OrganizationRolesService {
    constructor(
        private readonly authService: AuthService<AppAuth>,
        private readonly prisma: PrismaService,
    ) {}

    list(headers: IncomingHttpHeaders, activeOrganizationId: string | null | undefined) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)

        return this.authService.api.listOrgRoles({
            query: {
                organizationId,
            },
            headers: fromNodeHeaders(headers),
        })
    }

    create(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        dto: CreateOrganizationRoleDto,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)

        return this.authService.api.createOrgRole({
            body: {
                organizationId,
                role: dto.role,
                permission: dto.permissions ?? {},
            },
            headers: fromNodeHeaders(headers),
        })
    }

    updateName(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        roleId: string,
        dto: UpdateOrganizationRoleNameDto,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)

        return this.authService.api.updateOrgRole({
            body: {
                organizationId,
                roleId,
                data: {
                    roleName: dto.name,
                },
            },
            headers: fromNodeHeaders(headers),
        })
    }

    updatePermissions(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        roleId: string,
        dto: UpdateOrganizationRolePermissionsDto,
    ) {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)

        return this.authService.api.updateOrgRole({
            body: {
                organizationId,
                roleId,
                data: {
                    permission: dto.permissions,
                },
            },
            headers: fromNodeHeaders(headers),
        })
    }

    async delete(
        headers: IncomingHttpHeaders,
        activeOrganizationId: string | null | undefined,
        roleId: string,
    ): Promise<{ success: boolean }> {
        const organizationId = this.requireActiveOrganization(activeOrganizationId)
        const role = await this.authService.api.getOrgRole({
            query: {
                organizationId,
                roleId,
            },
            headers: fromNodeHeaders(headers),
        })

        if (role.role === "owner") {
            throw new ForbiddenActionError("The owner role cannot be deleted")
        }

        await this.ensureRoleIsNotAssigned(organizationId, role.role)

        return this.authService.api.deleteOrgRole({
            body: {
                organizationId,
                roleId,
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

    private async ensureRoleIsNotAssigned(organizationId: string, roleName: string): Promise<void> {
        const members = await this.prisma.member.findMany({
            where: {
                organizationId,
            },
            select: {
                role: true,
            },
        })
        const isAssigned = members.some((member) =>
            member.role
                .split(",")
                .map((role) => role.trim())
                .includes(roleName),
        )

        if (isAssigned) {
            throw new ForbiddenActionError("A role assigned to members cannot be deleted")
        }
    }
}
