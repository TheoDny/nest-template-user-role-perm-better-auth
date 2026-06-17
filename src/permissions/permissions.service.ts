import { Injectable } from "@nestjs/common"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import type { AppAuth } from "@app/auth/auth"
import { organizationStatements } from "@app/auth/permissions"
import { SessionService } from "@app/auth/services/session.service"
import type { CheckPermissionsDto } from "./dto/check-permissions.dto"

type BetterAuthSession = UserSession<AppAuth>

export type ApiPermission = {
    resource: string
    action: string
    permission: string
}

export type CheckPermissionResult = {
    permission: string
    granted: boolean
}

@Injectable()
export class PermissionsService {
    constructor(private readonly sessionService: SessionService) {}

    listApiPermissions(): { permissions: ApiPermission[]; resources: Record<string, readonly string[]> } {
        return {
            permissions: Object.entries(organizationStatements).flatMap(([resource, actions]) =>
                actions.map((action) => ({
                    resource,
                    action,
                    permission: `${resource}:${action}`,
                })),
            ),
            resources: organizationStatements,
        }
    }

    async checkUserPermissions(
        session: BetterAuthSession,
        dto: CheckPermissionsDto,
    ): Promise<{
        authorized: boolean
        permissions: CheckPermissionResult[]
        missingPermissions: string[]
    }> {
        const { permissions: currentPermissions } = await this.sessionService.findCurrentPermissions(session)
        const currentPermissionSet = new Set(currentPermissions)
        const permissions = dto.permissions.map((permission) => ({
            permission,
            granted: currentPermissionSet.has(permission),
        }))
        const missingPermissions = permissions
            .filter((permission) => !permission.granted)
            .map((permission) => permission.permission)

        return {
            authorized: missingPermissions.length === 0,
            permissions,
            missingPermissions,
        }
    }
}
