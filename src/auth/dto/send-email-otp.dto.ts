import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsIn } from "class-validator"

const emailOtpTypes = ["sign-in", "change-email", "email-verification", "forget-password"] as const

export type EmailOtpType = (typeof emailOtpTypes)[number]

export class SendEmailOtpDto {
    @ApiProperty({
        example: "user@example.com",
        format: "email",
    })
    @IsEmail()
    email: string

    @ApiProperty({
        enum: emailOtpTypes,
        example: "sign-in",
    })
    @IsIn(emailOtpTypes)
    type: EmailOtpType
}
