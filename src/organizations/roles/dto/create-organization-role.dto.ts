import { IsObject, IsOptional, IsString, MinLength } from "class-validator"

export class CreateOrganizationRoleDto {
    @IsString()
    @MinLength(1)
    role!: string

    @IsOptional()
    @IsObject()
    permissions?: Record<string, string[]>
}
