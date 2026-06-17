import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class RevokeSessionDto {
    @ApiProperty({
        description: "Token of one of the current user's other sessions.",
        example: "other-session-token",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    token!: string
}
