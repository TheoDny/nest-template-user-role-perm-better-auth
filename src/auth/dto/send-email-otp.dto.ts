import { IsEmail, IsIn } from "class-validator"

const emailOtpTypes = ["sign-in", "change-email", "email-verification", "forget-password"] as const

export type EmailOtpType = (typeof emailOtpTypes)[number]

export class SendEmailOtpDto {
    @IsEmail()
    email: string

    @IsIn(emailOtpTypes)
    type: EmailOtpType
}
