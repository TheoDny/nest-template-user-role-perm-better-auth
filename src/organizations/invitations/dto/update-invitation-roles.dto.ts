import { ApiProperty } from "@nestjs/swagger"
import { ArrayNotEmpty, IsArray, IsString } from "class-validator"

export class UpdateInvitationRolesDto {
    @ApiProperty({
        example: ["member", "support-manager"],
        isArray: true,
        minItems: 1,
        type: String,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles!: string[]
}
