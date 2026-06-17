import { Body, Controller, Get, Post } from "@nestjs/common"
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { auth } from "@app/auth/auth"
import { ErrorResponseDto } from "@app/common/dto/error-response.dto"
import { CheckPermissionsResponseDto } from "./dto/check-permissions-response.dto"
import { CheckPermissionsDto } from "./dto/check-permissions.dto"
import { PermissionCatalogResponseDto } from "./dto/permission-catalog-response.dto"
import { PermissionsService } from "./permissions.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("permissions")
@ApiTags("Permissions")
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Get()
    @AllowAnonymous()
    @ApiOperation({
        summary: "List the API permission catalog",
    })
    @ApiOkResponse({
        description:
            "All permission resources, actions, and resource:action permission strings exposed by the API.",
        type: PermissionCatalogResponseDto,
    })
    listApiPermissions() {
        return this.permissionsService.listApiPermissions()
    }

    @Post("check")
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Check permissions for the current user",
    })
    @ApiOkResponse({
        description: "Per-permission authorization result for the current active organization.",
        type: CheckPermissionsResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The permission list is invalid.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    checkUserPermissions(@Session() session: BetterAuthSession, @Body() dto: CheckPermissionsDto) {
        return this.permissionsService.checkUserPermissions(session, dto)
    }
}
