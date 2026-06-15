import { Body, Controller, Delete, Get, Param, Patch, Req } from "@nestjs/common"
import { MemberHasPermission, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import type { Request } from "express"
import { auth } from "@app/auth/auth"
import { MemberParamDto } from "./dto/member-param.dto"
import { UpdateMemberRolesDto } from "./dto/update-member-roles.dto"
import { OrganizationMembersService } from "./organization-members.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("members")
export class OrganizationMembersController {
    constructor(private readonly organizationMembersService: OrganizationMembersService) {}

    @Get()
    @MemberHasPermission({ permissions: { member: ["read"] } })
    list(@Req() request: Request, @Session() session: BetterAuthSession) {
        return this.organizationMembersService.list(request.headers, session.session.activeOrganizationId)
    }

    @Patch(":memberId/roles")
    @MemberHasPermission({ permissions: { member: ["update"] } })
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
    remove(@Req() request: Request, @Session() session: BetterAuthSession, @Param() params: MemberParamDto) {
        return this.organizationMembersService.remove(
            request.headers,
            session.session.activeOrganizationId,
            session.user.id,
            params.memberId,
        )
    }
}
