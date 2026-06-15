import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator"

export class LoginDto {
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean

    @IsOptional()
    @IsUrl({
        require_tld: false,
    })
    callbackURL?: string
}
