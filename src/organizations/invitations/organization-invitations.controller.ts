import { auth } from "@app/auth/auth"
import { ErrorResponseDto } from "@app/common/dto/error-response.dto"
import { SuccessResponseDto } from "@app/common/dto/success-response.dto"
import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common"
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
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { MemberHasPermission, Session } from "@thallesp/nestjs-better-auth"
import type { Request } from "express"
import { CreateInvitationDto } from "./dto/create-invitation.dto"
import { InvitationParamDto } from "./dto/invitation-param.dto"
import { PublicInvitationParamDto } from "./dto/public-invitation-param.dto"
import { PublicInvitationResponseDto } from "./dto/public-invitation-response.dto"
import { UpdateInvitationRolesDto } from "./dto/update-invitation-roles.dto"
import { OrganizationInvitationsService } from "./organization-invitations.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller()
@ApiTags("Organization Invitations")
export class OrganizationInvitationsController {
    constructor(private readonly organizationInvitationsService: OrganizationInvitationsService) {}

    @Post("invitations")
    @MemberHasPermission({ permissions: { invitation: ["create"] } })
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Create an invitation",
    })
    @ApiOkResponse({
        description: "Better Auth invitation creation response.",
    })
    @ApiBadRequestResponse({
        description: "The invitation payload is invalid or no active organization is set.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The current member lacks invitation:create.",
        type: ErrorResponseDto,
    })
    create(@Req() request: Request, @Session() session: BetterAuthSession, @Body() dto: CreateInvitationDto) {
        return this.organizationInvitationsService.create(
            request.headers,
            session.session.activeOrganizationId,
            dto,
        )
    }

    @Post("invitations/:invitationId/resend")
    @MemberHasPermission({ permissions: { invitation: ["create"] } })
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Resend an invitation",
    })
    @ApiParam({
        name: "invitationId",
        example: "invitation_1",
    })
    @ApiOkResponse({
        description: "The invitation email was resent.",
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
        description: "The current member lacks invitation:create.",
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: "The invitation was not found in the active organization.",
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: "Only pending invitations can be resent.",
        type: ErrorResponseDto,
    })
    resend(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.resend(
            request.headers,
            session.session.activeOrganizationId,
            params.invitationId,
        )
    }

    @Get("invitations")
    @MemberHasPermission({ permissions: { invitation: ["read"] } })
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "List invitations",
    })
    @ApiOkResponse({
        description: "Better Auth invitation list for the active organization.",
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
        description: "The current member lacks invitation:read.",
        type: ErrorResponseDto,
    })
    list(@Req() request: Request, @Session() session: BetterAuthSession) {
        return this.organizationInvitationsService.list(request.headers, session.session.activeOrganizationId)
    }

    @Get("invitations/:invitationId")
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Get invitation details",
    })
    @ApiParam({
        name: "invitationId",
        example: "invitation_1",
    })
    @ApiOkResponse({
        description: "Invitation data",
        type: PublicInvitationResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: "The invitation was not found.",
        type: ErrorResponseDto,
    })
    getOne(@Param() params: PublicInvitationParamDto) {
        return this.organizationInvitationsService.getOne(params.invitationId)
    }

    @Patch("invitations/:invitationId/roles")
    @MemberHasPermission({ permissions: { invitation: ["update"] } })
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Update invitation roles",
    })
    @ApiParam({
        name: "invitationId",
        example: "invitation_1",
    })
    @ApiOkResponse({
        description: "The updated invitation.",
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
        description: "The current member lacks invitation:update.",
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: "The invitation was not found in the active organization.",
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: "Only pending invitations can be updated.",
        type: ErrorResponseDto,
    })
    updateRoles(
        @Session() session: BetterAuthSession,
        @Param() params: InvitationParamDto,
        @Body() dto: UpdateInvitationRolesDto,
    ) {
        return this.organizationInvitationsService.updateRoles(
            session.session.activeOrganizationId,
            params.invitationId,
            dto,
        )
    }

    @Post("invitations/:invitationId/cancel")
    @MemberHasPermission({ permissions: { invitation: ["cancel"] } })
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Cancel an invitation",
    })
    @ApiParam({
        name: "invitationId",
        example: "invitation_1",
    })
    @ApiOkResponse({
        description: "Better Auth invitation cancellation response.",
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
        description: "The current member lacks invitation:cancel.",
        type: ErrorResponseDto,
    })
    cancel(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.cancel(
            request.headers,
            session.session.activeOrganizationId,
            params.invitationId,
        )
    }

    @Post("invitations/:invitationId/accept")
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Accept an invitation",
    })
    @ApiParam({
        name: "invitationId",
        example: "invitation_1",
    })
    @ApiOkResponse({
        description: "Better Auth invitation acceptance response.",
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The invitation cannot be accepted.",
        type: ErrorResponseDto,
    })
    accept(@Req() request: Request, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.accept(request.headers, params.invitationId)
    }

    @Post("invitations/:invitationId/reject")
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Reject an invitation",
    })
    @ApiParam({
        name: "invitationId",
        example: "invitation_1",
    })
    @ApiOkResponse({
        description: "Better Auth invitation rejection response.",
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The invitation cannot be rejected.",
        type: ErrorResponseDto,
    })
    reject(@Req() request: Request, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.reject(request.headers, params.invitationId)
    }
}
