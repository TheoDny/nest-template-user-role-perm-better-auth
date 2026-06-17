import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common"
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { AllowAnonymous, OptionalAuth, Session } from "@thallesp/nestjs-better-auth"
import type { Request, Response } from "express"
import { ErrorResponseDto } from "@app/common/dto/error-response.dto"
import { SuccessResponseDto } from "@app/common/dto/success-response.dto"
import { auth } from "../auth"
import type { CustomSession } from "../auth.types"
import { AuthenticatedResponseDto } from "../dto/authenticated-response.dto"
import { BetterAuthSessionResponseDto } from "../dto/better-auth-session-response.dto"
import { CustomSessionResponseDto } from "../dto/custom-session-response.dto"
import { LoginDto } from "../dto/login.dto"
import { RequestPasswordResetEmailOtpDto } from "../dto/request-password-reset-email-otp.dto"
import { SendEmailOtpDto } from "../dto/send-email-otp.dto"
import { SetActiveOrganizationDto } from "../dto/set-active-organization.dto"
import { SignInEmailOtpDto } from "../dto/sign-in-email-otp.dto"
import { AuthenticationService } from "../services/authentication.service"
import { SessionService } from "../services/session.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("auth")
@ApiTags("Auth")
export class SessionController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly sessionService: SessionService,
    ) {}

    @Post("login")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Sign in with email and password",
    })
    @ApiOkResponse({
        description: "Better Auth sign-in response. Session cookies are forwarded in Set-Cookie headers.",
        type: BetterAuthSessionResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The request body is invalid.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The signed-in user does not belong to any organization.",
        type: ErrorResponseDto,
    })
    login(@Req() request: Request, @Res({ passthrough: true }) response: Response, @Body() dto: LoginDto) {
        return this.authenticationService.login(request.headers, response, dto)
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Sign out the current session",
    })
    @ApiOkResponse({
        description: "The current Better Auth session was signed out.",
        type: SuccessResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    logout(@Req() request: Request) {
        return this.authenticationService.logout(request.headers)
    }

    @Post("email-otp/send")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Send an email OTP",
    })
    @ApiOkResponse({
        description: "The OTP was accepted for delivery by Better Auth.",
        type: SuccessResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The request body is invalid.",
        type: ErrorResponseDto,
    })
    sendEmailOtp(@Body() dto: SendEmailOtpDto) {
        return this.authenticationService.sendEmailOtp(dto)
    }

    @Post("email-otp/sign-in")
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Sign in with an email OTP",
    })
    @ApiOkResponse({
        description:
            "Better Auth email OTP sign-in response. Session cookies are forwarded in Set-Cookie headers.",
        type: BetterAuthSessionResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The OTP payload is invalid or rejected.",
        type: ErrorResponseDto,
    })
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
    @ApiOperation({
        summary: "Request a password reset email OTP",
    })
    @ApiOkResponse({
        description: "The password reset OTP request was accepted by Better Auth.",
        type: SuccessResponseDto,
    })
    @ApiBadRequestResponse({
        description: "The request body is invalid.",
        type: ErrorResponseDto,
    })
    requestPasswordResetEmailOtp(@Body() dto: RequestPasswordResetEmailOtpDto) {
        return this.authenticationService.requestPasswordResetEmailOtp(dto)
    }

    @Post("active-organization")
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Set or clear the active organization",
    })
    @ApiOkResponse({
        description: "Better Auth active organization response.",
        schema: {
            example: {
                id: "org_1",
                name: "Acme Workspace",
                slug: "acme-workspace",
            },
        },
    })
    @ApiBadRequestResponse({
        description: "The selection payload is invalid.",
        type: ErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    setActiveOrganization(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Body() dto: SetActiveOrganizationDto,
    ) {
        return this.authenticationService.setActiveOrganization(request.headers, response, dto)
    }

    @Get("authenticated")
    @OptionalAuth()
    @ApiOperation({
        summary: "Check whether the request has a valid session",
    })
    @ApiOkResponse({
        description: "Authentication probe result.",
        type: AuthenticatedResponseDto,
    })
    getAuthenticated(@Session() session?: BetterAuthSession | null): { authenticated: boolean } {
        return {
            authenticated: Boolean(session),
        }
    }

    @Get("session")
    @ApiCookieAuth("betterAuthSession")
    @ApiOperation({
        summary: "Get the current custom session",
    })
    @ApiOkResponse({
        description:
            "The current user, Better Auth session fields, organization roles, permissions, and organizations.",
        type: CustomSessionResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: "A valid Better Auth session is required.",
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: "The user is required to belong to an organization.",
        type: ErrorResponseDto,
    })
    getSession(@Session() session: BetterAuthSession): Promise<CustomSession> {
        return this.sessionService.buildCustomSession(session)
    }
}
