import { ApiProperty } from "@nestjs/swagger"

export class StatusResponseDto {
    @ApiProperty({
        example: true,
    })
    status: boolean
}
