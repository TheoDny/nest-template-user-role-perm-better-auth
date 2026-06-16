import { IsEmail } from "class-validator"

export class RequestPasswordResetEmailOtpDto {
    @IsEmail()
    email: string
}
