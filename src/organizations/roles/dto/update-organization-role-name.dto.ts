import { IsString, MinLength } from "class-validator"

export class UpdateOrganizationRoleNameDto {
    @IsString()
    @MinLength(1)
    name!: string
}
