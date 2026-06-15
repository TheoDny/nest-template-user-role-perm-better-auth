import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER } from "@nestjs/core"
import { AuthenticationModule } from "./auth/auth.module"
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter"
import { appConfig } from "./config/app.config"
import { validateEnv } from "./config/env.validation"
import { DatabaseModule } from "./database/database.module"
import { HealthModule } from "./health/health.module"
import { MailModule } from "./mail/mail.module"
import { OrganizationInvitationsModule } from "./organizations/invitations/organization-invitations.module"
import { OrganizationMembersModule } from "./organizations/members/organization-members.module"
import { OrganizationRolesModule } from "./organizations/roles/organization-roles.module"
import { PermissionsModule } from "./permissions/permissions.module"

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
        MailModule,
        OrganizationInvitationsModule,
        OrganizationMembersModule,
        OrganizationRolesModule,
        PermissionsModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
