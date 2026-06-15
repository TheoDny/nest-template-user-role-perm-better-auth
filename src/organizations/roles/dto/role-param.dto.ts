import { IsString, MinLength } from "class-validator"

export class RoleParamDto {
    @IsString()
    @MinLength(1)
    roleId!: string
}
