import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common"
import { MemberHasPermission, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import type { Request } from "express"
import { auth } from "@app/auth/auth"
import { CreateOrganizationRoleDto } from "./dto/create-organization-role.dto"
import { RoleParamDto } from "./dto/role-param.dto"
import { UpdateOrganizationRoleNameDto } from "./dto/update-organization-role-name.dto"
import { UpdateOrganizationRolePermissionsDto } from "./dto/update-organization-role-permissions.dto"
import { OrganizationRolesService } from "./organization-roles.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("roles")
export class OrganizationRolesController {
    constructor(private readonly organizationRolesService: OrganizationRolesService) {}

    @Get()
    @MemberHasPermission({ permissions: { ac: ["read"] } })
    list(@Req() request: Request, @Session() session: BetterAuthSession) {
        return this.organizationRolesService.list(request.headers, session.session.activeOrganizationId)
    }

    @Post()
    @MemberHasPermission({ permissions: { ac: ["create"] } })
    create(
        @Req() request: Request,
        @Session() session: BetterAuthSession,
        @Body() dto: CreateOrganizationRoleDto,
    ) {
        return this.organizationRolesService.create(request.headers, session.session.activeOrganizationId, dto)
    }

    @Patch(":roleId")
    @MemberHasPermission({ permissions: { ac: ["update"] } })
    updateName(
        @Req() request: Request,
        @Session() session: BetterAuthSession,
        @Param() params: RoleParamDto,
        @Body() dto: UpdateOrganizationRoleNameDto,
    ) {
        return this.organizationRolesService.updateName(
            request.headers,
            session.session.activeOrganizationId,
            params.roleId,
            dto,
        )
    }

    @Patch(":roleId/permissions")
    @MemberHasPermission({ permissions: { ac: ["update"] } })
    updatePermissions(
        @Req() request: Request,
        @Session() session: BetterAuthSession,
        @Param() params: RoleParamDto,
        @Body() dto: UpdateOrganizationRolePermissionsDto,
    ) {
        return this.organizationRolesService.updatePermissions(
            request.headers,
            session.session.activeOrganizationId,
            params.roleId,
            dto,
        )
    }

    @Delete(":roleId")
    @MemberHasPermission({ permissions: { ac: ["delete"] } })
    delete(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: RoleParamDto) {
        return this.organizationRolesService.delete(
            request.headers,
            session.session.activeOrganizationId,
            params.roleId,
        )
    }
}
