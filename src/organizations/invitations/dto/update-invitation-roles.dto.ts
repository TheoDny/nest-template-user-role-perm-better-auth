import { ArrayNotEmpty, IsArray, IsString } from "class-validator"

export class UpdateInvitationRolesDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles!: string[]
}
