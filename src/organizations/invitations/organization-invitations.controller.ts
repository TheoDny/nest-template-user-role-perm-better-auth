import { auth } from "@app/auth/auth"
import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { AllowAnonymous, MemberHasPermission, Session } from "@thallesp/nestjs-better-auth"
import type { Request } from "express"
import { CreateInvitationDto } from "./dto/create-invitation.dto"
import { InvitationParamDto } from "./dto/invitation-param.dto"
import { PublicInvitationParamDto } from "./dto/public-invitation-param.dto"
import { UpdateInvitationRolesDto } from "./dto/update-invitation-roles.dto"
import { OrganizationInvitationsService } from "./organization-invitations.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller()
export class OrganizationInvitationsController {
    constructor(private readonly organizationInvitationsService: OrganizationInvitationsService) {}

    @Post("invitations")
    @MemberHasPermission({ permissions: { invitation: ["create"] } })
    create(@Req() request: Request, @Session() session: BetterAuthSession, @Body() dto: CreateInvitationDto) {
        return this.organizationInvitationsService.create(
            request.headers,
            session.session.activeOrganizationId,
            dto,
        )
    }

    @Post("invitations/:invitationId/resend")
    @MemberHasPermission({ permissions: { invitation: ["create"] } })
    resend(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.resend(
            request.headers,
            session.session.activeOrganizationId,
            params.invitationId,
        )
    }

    @Get("invitations")
    @MemberHasPermission({ permissions: { invitation: ["read"] } })
    list(@Req() request: Request, @Session() session: BetterAuthSession) {
        return this.organizationInvitationsService.list(request.headers, session.session.activeOrganizationId)
    }

    @Get("organizations/:organizationId/invitations/:invitationId")
    @AllowAnonymous()
    getPublic(@Param() params: PublicInvitationParamDto) {
        return this.organizationInvitationsService.getPublic(params.organizationId, params.invitationId)
    }

    @Patch("invitations/:invitationId/roles")
    @MemberHasPermission({ permissions: { invitation: ["update"] } })
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
    cancel(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.cancel(
            request.headers,
            session.session.activeOrganizationId,
            params.invitationId,
        )
    }

    @Post("invitations/:invitationId/accept")
    accept(@Req() request: Request, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.accept(request.headers, params.invitationId)
    }

    @Post("invitations/:invitationId/reject")
    reject(@Req() request: Request, @Param() params: InvitationParamDto) {
        return this.organizationInvitationsService.reject(request.headers, params.invitationId)
    }
}
