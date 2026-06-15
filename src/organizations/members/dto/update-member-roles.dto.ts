import { ArrayNotEmpty, IsArray, IsString } from "class-validator"

export class UpdateMemberRolesDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles!: string[]
}
