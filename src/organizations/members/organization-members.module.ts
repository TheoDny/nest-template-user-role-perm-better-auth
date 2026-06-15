import { Module } from "@nestjs/common"
import { OrganizationMembersController } from "./organization-members.controller"
import { OrganizationMembersService } from "./organization-members.service"

@Module({
    controllers: [OrganizationMembersController],
    providers: [OrganizationMembersService],
})
export class OrganizationMembersModule {}
