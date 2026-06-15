import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common"
import { AllowAnonymous, OptionalAuth, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import type { Request, Response } from "express"
import { auth } from "../auth"
import type { CustomSession } from "../auth.types"
import { LoginDto } from "../dto/login.dto"
import { AuthenticationService } from "../services/authentication.service"
import { SessionService } from "../services/session.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("auth")
export class SessionController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly sessionService: SessionService,
    ) {}

    @Post("login")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    login(@Req() request: Request, @Res({ passthrough: true }) response: Response, @Body() dto: LoginDto) {
        return this.authenticationService.login(request.headers, response, dto)
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        return this.authenticationService.logout(request.headers, response)
    }

    @Get("authenticated")
    @OptionalAuth()
    getAuthenticated(@Session() session?: BetterAuthSession | null): { authenticated: boolean } {
        return {
            authenticated: Boolean(session),
        }
    }

    @Get("session")
    getSession(@Session() session: BetterAuthSession): Promise<CustomSession> {
        return this.sessionService.buildCustomSession(session)
    }
}
