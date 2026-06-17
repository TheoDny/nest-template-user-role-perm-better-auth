import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsObject, IsOptional, IsString, MinLength } from "class-validator"

export class CreateOrganizationRoleDto {
    @ApiProperty({
        example: "billing-manager",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    role!: string

    @ApiPropertyOptional({
        additionalProperties: {
            type: "array",
            items: {
                type: "string",
            },
        },
        example: {
            member: ["read"],
            invitation: ["create", "read"],
        },
        type: "object",
    })
    @IsOptional()
    @IsObject()
    permissions?: Record<string, string[]>
}
