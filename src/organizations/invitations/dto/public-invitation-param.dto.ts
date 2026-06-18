import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class PublicInvitationParamDto {
    @ApiProperty({
        example: "invitation_1",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    invitationId!: string
}
