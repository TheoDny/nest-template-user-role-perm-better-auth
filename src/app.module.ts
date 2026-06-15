import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER } from "@nestjs/core"
import { AuthenticationModule } from "./auth/auth.module"
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter"
import { appConfig } from "./config/app.config"
import { validateEnv } from "./config/env.validation"
import { DatabaseModule } from "./database/database.module"
import { HealthModule } from "./health/health.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
            validate: validateEnv,
        }),
        AuthenticationModule,
        DatabaseModule,
        HealthModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
