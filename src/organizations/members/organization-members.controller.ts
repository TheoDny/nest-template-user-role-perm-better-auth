import { Body, Controller, Delete, Get, Param, Patch, Req } from "@nestjs/common"
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
import { MemberParamDto } from "./dto/member-param.dto"
import { UpdateMemberRolesDto } from "./dto/update-member-roles.dto"
import { OrganizationMembersService } from "./organization-members.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("members")
@ApiTags("Organization Members")
@ApiCookieAuth("betterAuthSession")
export class OrganizationMembersController {
    constructor(private readonly organizationMembersService: OrganizationMembersService) {}

    @Get()
    @MemberHasPermission({ permissions: { member: ["read"] } })
    @ApiOperation({
        summary: "List organization members",
    })
    @ApiOkResponse({
        description: "Better Auth member list for the active organization.",
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks member:read.",
        type: ErrorResponseDto,
    })
    list(@Req() request: Request, @Session() session: BetterAuthSession) {
        return this.organizationMembersService.list(request.headers, session.session.activeOrganizationId)
    }

    @Patch(":memberId/roles")
    @MemberHasPermission({ permissions: { member: ["update"] } })
    @ApiOperation({
        summary: "Update member roles",
    })
    @ApiParam({
        name: "memberId",
        example: "member_1",
    })
    @ApiOkResponse({
        description: "Better Auth member role update response.",
    })
    @ApiBadRequestResponse({
        description: "The requested roles are invalid or no active organization is set.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks member:update.",
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: "The member was not found in the active organization.",
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: "The update would remove the last owner.",
        type: ErrorResponseDto,
    })
    updateRoles(
        @Req() request: Request,
        @Session() session: BetterAuthSession,
        @Param() params: MemberParamDto,
        @Body() dto: UpdateMemberRolesDto,
    ) {
        return this.organizationMembersService.updateRoles(
            request.headers,
            session.session.activeOrganizationId,
            params.memberId,
            dto,
        )
    }

    @Delete(":memberId")
    @MemberHasPermission({ permissions: { member: ["delete"] } })
    @ApiOperation({
        summary: "Remove an organization member",
    })
    @ApiParam({
        name: "memberId",
        example: "member_1",
    })
    @ApiOkResponse({
        description: "Better Auth member removal response.",
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
        description: "The current member lacks member:delete or tries to remove themselves through this route.",
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: "The member was not found in the active organization.",
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: "The removal would remove the last owner.",
        type: ErrorResponseDto,
    })
    remove(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: MemberParamDto) {
        return this.organizationMembersService.remove(
            request.headers,
            session.session.activeOrganizationId,
            session.user.id,
            params.memberId,
        )
    }
}
