import { ApiProperty } from "@nestjs/swagger"

export class ErrorResponseDto {
    @ApiProperty({
        example: 400,
    })
    statusCode: number

    @ApiProperty({
        example: "BadRequestException",
    })
    error: string

    @ApiProperty({
        example: "Validation failed",
    })
    message: string

    @ApiProperty({
        example: "BAD_REQUEST_EXCEPTION",
    })
    code: string

    @ApiProperty({
        example: "2026-06-17T12:00:00.000Z",
    })
    timestamp: string

    @ApiProperty({
        example: "/auth/login",
    })
    path: string
}
