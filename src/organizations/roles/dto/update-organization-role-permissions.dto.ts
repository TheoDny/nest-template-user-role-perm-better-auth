import { IsObject } from "class-validator"

export class UpdateOrganizationRolePermissionsDto {
    @IsObject()
    permissions!: Record<string, string[]>
}
