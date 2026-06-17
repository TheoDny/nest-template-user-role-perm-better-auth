import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator"

export class LoginDto {
    @ApiProperty({
        example: "admin@example.com",
        format: "email",
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: "password",
        minLength: 1,
    })
    @IsString()
    @IsNotEmpty()
    password: string

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean

    @ApiPropertyOptional({
        example: "http://localhost:5173/dashboard",
        format: "uri",
    })
    @IsOptional()
    @IsUrl({
        require_tld: false,
    })
    callbackURL?: string
}
