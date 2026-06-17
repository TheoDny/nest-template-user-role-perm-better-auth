import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class BetterAuthUserDto {
    @ApiProperty({
        example: "user_1",
    })
    id: string

    @ApiProperty({
        example: "Ada Lovelace",
    })
    name: string

    @ApiProperty({
        example: "ada@example.com",
    })
    email: string

    @ApiProperty({
        example: false,
    })
    emailVerified: boolean

    @ApiPropertyOptional({
        example: "https://example.com/avatar.png",
        nullable: true,
    })
    image?: string | null
}

export class BetterAuthSessionResponseDto {
    @ApiProperty({
        example: "session-token",
    })
    token: string

    @ApiProperty({
        type: BetterAuthUserDto,
    })
    user: BetterAuthUserDto
}
