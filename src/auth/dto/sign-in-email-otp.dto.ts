import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from "class-validator"

export class SignInEmailOtpDto {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(1)
    otp: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string

    @IsOptional()
    @IsUrl({
        require_tld: false,
    })
    image?: string
}
