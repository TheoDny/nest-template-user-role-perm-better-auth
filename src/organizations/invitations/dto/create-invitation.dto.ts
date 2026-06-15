import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsOptional, IsString } from "class-validator"

export class CreateInvitationDto {
    @IsEmail()
    email!: string

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles!: string[]

    @IsBoolean()
    @IsOptional()
    resend?: boolean
}
