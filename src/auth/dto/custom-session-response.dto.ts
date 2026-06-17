import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class CurrentUserResponseDto {
    @ApiProperty({
        example: "user_1",
    })
    id: string

    @ApiProperty({
        example: "Ada Lovelace",
    })
    name: string

    @ApiProperty({
        example: "ada@example.com",
    })
    email: string

    @ApiProperty({
        example: false,
    })
    emailVerified: boolean

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    image?: string | null

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    role: string | null

    @ApiPropertyOptional({
        example: false,
        nullable: true,
    })
    banned: boolean | null

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    banReason: string | null

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    banExpires: Date | null
}

class CurrentSessionResponseDto {
    @ApiProperty({
        example: "session_1",
    })
    id: string

    @ApiProperty({
        example: "2026-06-17T12:00:00.000Z",
    })
    createdAt: Date

    @ApiProperty({
        example: "2026-06-17T12:00:00.000Z",
    })
    updatedAt: Date

    @ApiProperty({
        example: "user_1",
    })
    userId: string

    @ApiProperty({
        example: "2026-07-17T12:00:00.000Z",
    })
    expiresAt: Date

    @ApiProperty({
        example: "session-token",
    })
    token: string

    @ApiPropertyOptional({
        example: "127.0.0.1",
        nullable: true,
    })
    ipAddress: string | null

    @ApiPropertyOptional({
        example: "Mozilla/5.0",
        nullable: true,
    })
    userAgent: string | null

    @ApiPropertyOptional({
        example: "org_1",
        nullable: true,
    })
    activeOrganizationId: string | null

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    impersonatedBy: string | null
}

class SessionOrganizationResponseDto {
    @ApiProperty({
        example: "org_1",
    })
    id: string

    @ApiProperty({
        example: "Acme Workspace",
    })
    name: string
}

export class CustomSessionResponseDto {
    @ApiProperty({
        type: CurrentUserResponseDto,
    })
    user: CurrentUserResponseDto

    @ApiProperty({
        type: CurrentSessionResponseDto,
    })
    session: CurrentSessionResponseDto

    @ApiProperty({
        example: ["member:read", "invitation:create"],
        isArray: true,
        type: String,
    })
    permissions: string[]

    @ApiProperty({
        example: ["admin"],
        isArray: true,
        type: String,
    })
    roles: string[]

    @ApiProperty({
        isArray: true,
        type: SessionOrganizationResponseDto,
    })
    organizations: SessionOrganizationResponseDto[]
}
