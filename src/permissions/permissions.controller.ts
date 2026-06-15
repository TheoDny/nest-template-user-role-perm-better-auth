import { Body, Controller, Get, Post } from "@nestjs/common"
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { auth } from "@app/auth/auth"
import { CheckPermissionsDto } from "./dto/check-permissions.dto"
import { PermissionsService } from "./permissions.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("permissions")
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Get()
    @AllowAnonymous()
    listApiPermissions() {
        return this.permissionsService.listApiPermissions()
    }

    @Post("check")
    checkUserPermissions(@Session() session: BetterAuthSession, @Body() dto: CheckPermissionsDto) {
        return this.permissionsService.checkUserPermissions(session, dto)
    }
}
