import { ApiProperty } from "@nestjs/swagger"
import { IsObject } from "class-validator"

export class UpdateOrganizationRolePermissionsDto {
    @ApiProperty({
        additionalProperties: {
            type: "array",
            items: {
                type: "string",
            },
        },
        example: {
            member: ["read", "update"],
            invitation: ["create", "read"],
        },
        type: "object",
    })
    @IsObject()
    permissions!: Record<string, string[]>
}
