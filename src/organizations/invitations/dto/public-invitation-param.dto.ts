import { IsString, MinLength } from "class-validator"

export class PublicInvitationParamDto {
    @IsString()
    @MinLength(1)
    organizationId!: string

    @IsString()
    @MinLength(1)
    invitationId!: string
}
