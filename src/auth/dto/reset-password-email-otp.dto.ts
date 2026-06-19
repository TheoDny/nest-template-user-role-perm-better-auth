import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MinLength } from "class-validator"

export class ResetPasswordEmailOtpDto {
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

    @ApiProperty({
        example: "new-password",
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string
}
