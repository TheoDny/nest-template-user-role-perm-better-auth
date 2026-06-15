import { IsString, MinLength } from "class-validator"

export class InvitationParamDto {
    @IsString()
    @MinLength(1)
    invitationId!: string
}
