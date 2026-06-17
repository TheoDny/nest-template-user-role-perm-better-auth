import { Module } from "@nestjs/common"
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth"
import { auth } from "./auth"
import { SessionController } from "./controllers/session.controller"
import { AuthenticationService } from "./services/authentication.service"
import { SessionService } from "./services/session.service"

@Module({
    imports: [
        BetterAuthModule.forRoot({
            auth,
            bodyParser: {
                json: {
                    limit: "2mb",
                },
                urlencoded: {
                    extended: true,
                    limit: "2mb",
                },
            },
        }),
    ],
    controllers: [SessionController],
    providers: [AuthenticationService, SessionService],
    exports: [SessionService],
})
export class AuthenticationModule {}
