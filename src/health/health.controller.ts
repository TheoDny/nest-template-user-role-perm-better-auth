import { Controller, Get } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { HealthResponseDto } from "./dto/health-response.dto"

@Controller("status")
@ApiTags("Health")
export class HealthController {
    @Get()
    @AllowAnonymous()
    @ApiOperation({
        summary: "Get API health status",
    })
    @ApiOkResponse({
        description: "The API is reachable.",
        type: HealthResponseDto,
    })
    getStatus(): { status: "ok"; timestamp: string } {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
        }
    }
}
