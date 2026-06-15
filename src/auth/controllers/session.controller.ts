import { Controller, Get } from "@nestjs/common"
import { OptionalAuth, Session } from "@thallesp/nestjs-better-auth"
import type { UserSession } from "@thallesp/nestjs-better-auth"
import { auth } from "../auth"
import type { CustomSession } from "../auth.types"
import { SessionService } from "../services/session.service"

type BetterAuthSession = UserSession<typeof auth>

@Controller("auth")
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

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
