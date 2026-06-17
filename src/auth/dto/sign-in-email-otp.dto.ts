import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from "class-validator"

export class SignInEmailOtpDto {
    @ApiProperty({
        example: "user@example.com",
        format: "email",
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: "123456",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    otp: string

    @ApiPropertyOptional({
        example: "Ada Lovelace",
        minLength: 1,
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string

    @ApiPropertyOptional({
        example: "http://localhost:5173/avatar.png",
        format: "uri",
    })
    @IsOptional()
    @IsUrl({
        require_tld: false,
    })
    image?: string
}
