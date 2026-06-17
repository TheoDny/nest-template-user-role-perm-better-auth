import { ApiProperty } from "@nestjs/swagger"

class CheckPermissionResultDto {
    @ApiProperty({
        example: "member:read",
    })
    permission: string

    @ApiProperty({
        example: true,
    })
    granted: boolean
}

export class CheckPermissionsResponseDto {
    @ApiProperty({
        example: false,
    })
    authorized: boolean

    @ApiProperty({
        isArray: true,
        type: CheckPermissionResultDto,
    })
    permissions: CheckPermissionResultDto[]

    @ApiProperty({
        example: ["invitation:create"],
        isArray: true,
        type: String,
    })
    missingPermissions: string[]
}
