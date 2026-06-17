import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsOptional, IsString } from "class-validator"

export class CreateInvitationDto {
    @ApiProperty({
        example: "new.member@example.com",
        format: "email",
    })
    @IsEmail()
    email!: string

    @ApiProperty({
        example: ["member"],
        isArray: true,
        minItems: 1,
        type: String,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles!: string[]

    @ApiPropertyOptional({
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    resend?: boolean
}
