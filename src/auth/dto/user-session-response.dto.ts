import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class UserSessionResponseDto {
    @ApiProperty({
        example: "session_1",
    })
    id: string

    @ApiProperty({
        example: "2026-06-17T12:00:00.000Z",
    })
    createdAt: Date

    @ApiProperty({
        example: "2026-06-17T12:00:00.000Z",
    })
    updatedAt: Date

    @ApiProperty({
        example: "user_1",
    })
    userId: string

    @ApiProperty({
        example: "2026-07-17T12:00:00.000Z",
    })
    expiresAt: Date

    @ApiProperty({
        example: "session-token",
    })
    token: string

    @ApiPropertyOptional({
        example: "127.0.0.1",
        nullable: true,
    })
    ipAddress?: string | null

    @ApiPropertyOptional({
        example: "Mozilla/5.0",
        nullable: true,
    })
    userAgent?: string | null
}
