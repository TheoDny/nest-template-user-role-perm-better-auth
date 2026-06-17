import { ApiProperty } from "@nestjs/swagger"

export class AuthenticatedResponseDto {
    @ApiProperty({
        example: true,
    })
    authenticated: boolean
}
