import { Injectable } from "@nestjs/common"
import { AuthService } from "@thallesp/nestjs-better-auth"
import { fromNodeHeaders } from "better-auth/node"
import type { Response } from "express"
import type { IncomingHttpHeaders } from "node:http"
import { InvalidActiveOrganizationSelectionError } from "@app/common/errors"
import type { AppAuth } from "../auth"
import type { LoginDto } from "../dto/login.dto"
import type { SetActiveOrganizationDto } from "../dto/set-active-organization.dto"

type HeadersWithSetCookie = Headers & {
    getSetCookie?: () => string[]
}

@Injectable()
export class AuthenticationService {
    constructor(private readonly authService: AuthService<AppAuth>) {}

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

        this.applySetCookieHeaders(response, result.headers)

        return result.response
    }

    async logout(headers: IncomingHttpHeaders, response: Response) {
        const result = await this.authService.api.signOut({
            headers: fromNodeHeaders(headers),
            returnHeaders: true,
        })

        this.applySetCookieHeaders(response, result.headers)

        return result.response
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
