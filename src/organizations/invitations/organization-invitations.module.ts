import { Module } from "@nestjs/common"
import { OrganizationInvitationsController } from "./organization-invitations.controller"
import { OrganizationInvitationsService } from "./organization-invitations.service"

@Module({
    controllers: [OrganizationInvitationsController],
    providers: [OrganizationInvitationsService],
})
export class OrganizationInvitationsModule {}
