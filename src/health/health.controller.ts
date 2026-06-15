import { Controller, Get } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"

@Controller("status")
export class HealthController {
    @Get()
    @AllowAnonymous()
    getStatus(): { status: "ok"; timestamp: string } {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
        }
    }
}
