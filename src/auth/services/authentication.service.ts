import { InvalidActiveOrganizationSelectionError, UserOrganizationRequiredError } from "@app/common/errors"
import { PrismaService } from "@app/database/prisma.service"
import { Injectable } from "@nestjs/common"
import { AuthService } from "@thallesp/nestjs-better-auth"
import { fromNodeHeaders } from "better-auth/node"
import type { Response } from "express"
import type { IncomingHttpHeaders } from "node:http"
import type { AppAuth } from "../auth"
import type { LoginDto } from "../dto/login.dto"
import type { RequestPasswordResetEmailOtpDto } from "../dto/request-password-reset-email-otp.dto"
import type { SendEmailOtpDto } from "../dto/send-email-otp.dto"
import type { SetActiveOrganizationDto } from "../dto/set-active-organization.dto"
import type { SignInEmailOtpDto } from "../dto/sign-in-email-otp.dto"

type HeadersWithSetCookie = Headers & {
    getSetCookie?: () => string[]
}

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly authService: AuthService<AppAuth>,
        private readonly prisma: PrismaService,
    ) {}

    async login(headers: IncomingHttpHeaders, response: Response, dto: LoginDto) {
        const result = await this.authService.api.signInEmail({
            body: {
                email: dto.email,
                password: dto.password,
                callbackURL: dto.callbackURL,
                rememberMe: dto.rememberMe,
            },
            headers: fromNodeHeaders(headers),
            returnHeaders: true,
        })

        await this.ensureSignedInUserHasActiveOrganization(result.response.user.id, result.response.token)
        this.applySetCookieHeaders(response, result.headers)

        return result.response
    }

    async logout(headers: IncomingHttpHeaders) {
        const result = await this.authService.api.signOut({
            headers: fromNodeHeaders(headers),
            returnHeaders: true,
        })

        return result.response
    }

    sendEmailOtp(dto: SendEmailOtpDto) {
        return this.authService.api.sendVerificationOTP({
            body: {
                email: dto.email,
                type: dto.type,
            },
        })
    }

    async signInEmailOtp(headers: IncomingHttpHeaders, response: Response, dto: SignInEmailOtpDto) {
        const result = await this.authService.api.signInEmailOTP({
            body: {
                email: dto.email,
                otp: dto.otp,
                name: dto.name,
                image: dto.image,
            },
            headers: fromNodeHeaders(headers),
            returnHeaders: true,
        })

        this.applySetCookieHeaders(response, result.headers)

        return result.response
    }

    requestPasswordResetEmailOtp(dto: RequestPasswordResetEmailOtpDto) {
        return this.authService.api.requestPasswordResetEmailOTP({
            body: {
                email: dto.email,
            },
        })
    }

    async setActiveOrganization(headers: IncomingHttpHeaders, response: Response, dto: SetActiveOrganizationDto) {
        this.ensureActiveOrganizationPayload(dto)

        const result = await this.authService.api.setActiveOrganization({
            body: {
                organizationId: dto.organizationId,
                organizationSlug: dto.organizationSlug,
            },
            headers: fromNodeHeaders(headers),
            returnHeaders: true,
        })

        this.applySetCookieHeaders(response, result.headers)

        return result.response
    }

    private async ensureSignedInUserHasActiveOrganization(userId: string, sessionToken: string): Promise<void> {
        const membership = await this.prisma.member.findFirst({
            where: {
                userId,
            },
            select: {
                organizationId: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        })

        if (!membership) {
            throw new UserOrganizationRequiredError()
        }

        await this.prisma.session.updateMany({
            where: {
                token: sessionToken,
                activeOrganizationId: null,
            },
            data: {
                activeOrganizationId: membership.organizationId,
            },
        })
    }

    private ensureActiveOrganizationPayload(dto: SetActiveOrganizationDto): void {
        const hasOrganizationId = Object.prototype.hasOwnProperty.call(dto, "organizationId")
        const hasOrganizationSlug =
            typeof dto.organizationSlug === "string" && dto.organizationSlug.trim().length > 0

        if (!hasOrganizationId && !hasOrganizationSlug) {
            throw new InvalidActiveOrganizationSelectionError()
        }
    }

    private applySetCookieHeaders(response: Response, headers: HeadersWithSetCookie): void {
        const setCookieHeaders = headers.getSetCookie?.() ?? []

        for (const setCookieHeader of setCookieHeaders) {
            response.append("Set-Cookie", setCookieHeader)
        }
    }
}
