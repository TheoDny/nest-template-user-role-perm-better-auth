import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { appConfig } from "./config/app.config"
import { validateEnv } from "./config/env.validation"
import { DatabaseModule } from "./database/database.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
            validate: validateEnv,
        }),
        DatabaseModule,
    ],
})
export class AppModule {}
