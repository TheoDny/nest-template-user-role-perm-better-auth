import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common"
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCookieAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { MemberHasPermission, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import type { Request } from "express"
import { auth } from "@app/auth/auth"
import { ErrorResponseDto } from "@app/common/dto/error-response.dto"
import { SuccessResponseDto } from "@app/common/dto/success-response.dto"
import { CreateOrganizationRoleDto } from "./dto/create-organization-role.dto"
import { RoleParamDto } from "./dto/role-param.dto"
import { UpdateOrganizationRoleNameDto } from "./dto/update-organization-role-name.dto"
import { UpdateOrganizationRolePermissionsDto } from "./dto/update-organization-role-permissions.dto"
import { OrganizationRolesService } from "./organization-roles.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("roles")
@ApiTags("Organization Roles")
@ApiCookieAuth("betterAuthSession")
export class OrganizationRolesController {
    constructor(private readonly organizationRolesService: OrganizationRolesService) {}

    @Get()
    @MemberHasPermission({ permissions: { ac: ["read"] } })
    @ApiOperation({
        summary: "List organization roles",
    })
    @ApiOkResponse({
        description: "Better Auth organization role list for the active organization.",
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks ac:read.",
        type: ErrorResponseDto,
    })
    list(@Req() request: Request, @Session() session: BetterAuthSession) {
        return this.organizationRolesService.list(request.headers, session.session.activeOrganizationId)
    }

    @Post()
    @MemberHasPermission({ permissions: { ac: ["create"] } })
    @ApiOperation({
        summary: "Create an organization role",
    })
    @ApiOkResponse({
        description: "Better Auth organization role creation response.",
    })
    @ApiBadRequestResponse({
        description: "The role payload is invalid or no active organization is set.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks ac:create or tries to assign forbidden permissions.",
        type: ErrorResponseDto,
    })
    create(
        @Req() request: Request,
        @Session() session: BetterAuthSession,
        @Body() dto: CreateOrganizationRoleDto,
    ) {
        return this.organizationRolesService.create(request.headers, session.session.activeOrganizationId, dto)
    }

    @Patch(":roleId")
    @MemberHasPermission({ permissions: { ac: ["update"] } })
    @ApiOperation({
        summary: "Rename an organization role",
    })
    @ApiParam({
        name: "roleId",
        example: "role_1",
    })
    @ApiOkResponse({
        description: "Better Auth organization role update response.",
    })
    @ApiBadRequestResponse({
        description: "The rename payload is invalid or no active organization is set.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks ac:update.",
        type: ErrorResponseDto,
    })
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
    @ApiOperation({
        summary: "Update organization role permissions",
    })
    @ApiParam({
        name: "roleId",
        example: "role_1",
    })
    @ApiOkResponse({
        description: "Better Auth organization role permission update response.",
    })
    @ApiBadRequestResponse({
        description: "The permission payload is invalid or no active organization is set.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks ac:update.",
        type: ErrorResponseDto,
    })
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
    @ApiOperation({
        summary: "Delete an organization role",
    })
    @ApiParam({
        name: "roleId",
        example: "role_1",
    })
    @ApiOkResponse({
        description: "The role was deleted.",
        type: SuccessResponseDto,
    })
    @ApiBadRequestResponse({
        description: "No active organization is set.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks ac:delete or the role cannot be deleted.",
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: "The role was not found.",
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: "The role is protected or still assigned to members.",
        type: ErrorResponseDto,
    })
    delete(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: RoleParamDto) {
        return this.organizationRolesService.delete(
            request.headers,
            session.session.activeOrganizationId,
            params.roleId,
        )
    }
}
