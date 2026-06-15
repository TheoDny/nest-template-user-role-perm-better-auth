import { Module } from "@nestjs/common"
import { AuthenticationModule } from "@app/auth/auth.module"
import { PermissionsController } from "./permissions.controller"
import { PermissionsService } from "./permissions.service"

@Module({
    imports: [AuthenticationModule],
    controllers: [PermissionsController],
    providers: [PermissionsService],
})
export class PermissionsModule {}
