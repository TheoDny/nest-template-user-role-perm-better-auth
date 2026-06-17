import { ApiProperty } from "@nestjs/swagger"

class PermissionCatalogItemDto {
    @ApiProperty({
        example: "member",
    })
    resource: string

    @ApiProperty({
        example: "read",
    })
    action: string

    @ApiProperty({
        example: "member:read",
    })
    permission: string
}

export class PermissionCatalogResponseDto {
    @ApiProperty({
        isArray: true,
        type: PermissionCatalogItemDto,
    })
    permissions: PermissionCatalogItemDto[]

    @ApiProperty({
        additionalProperties: {
            type: "array",
            items: {
                type: "string",
            },
        },
        example: {
            member: ["create", "read", "update", "delete"],
            invitation: ["create", "read", "update", "cancel"],
        },
        type: "object",
    })
    resources: Record<string, readonly string[]>
}
