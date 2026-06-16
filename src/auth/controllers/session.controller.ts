import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common"
import { AllowAnonymous, OptionalAuth, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import type { Request, Response } from "express"
import { auth } from "../auth"
import type { CustomSession } from "../auth.types"
import { LoginDto } from "../dto/login.dto"
import { RequestPasswordResetEmailOtpDto } from "../dto/request-password-reset-email-otp.dto"
import { SendEmailOtpDto } from "../dto/send-email-otp.dto"
import { SetActiveOrganizationDto } from "../dto/set-active-organization.dto"
import { SignInEmailOtpDto } from "../dto/sign-in-email-otp.dto"
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

    @Post("email-otp/send")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    sendEmailOtp(@Body() dto: SendEmailOtpDto) {
        return this.authenticationService.sendEmailOtp(dto)
    }

    @Post("email-otp/sign-in")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    signInEmailOtp(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Body() dto: SignInEmailOtpDto,
    ) {
        return this.authenticationService.signInEmailOtp(request.headers, response, dto)
    }

    @Post("password-reset/email-otp")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    requestPasswordResetEmailOtp(@Body() dto: RequestPasswordResetEmailOtpDto) {
        return this.authenticationService.requestPasswordResetEmailOtp(dto)
    }

    @Post("active-organization")
    @HttpCode(HttpStatus.OK)
    setActiveOrganization(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Body() dto: SetActiveOrganizationDto,
    ) {
        return this.authenticationService.setActiveOrganization(request.headers, response, dto)
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
