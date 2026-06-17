import { ApiProperty } from "@nestjs/swagger"

class PublicInvitationOrganizationDto {
    @ApiProperty({
        example: "org_1",
    })
    id: string

    @ApiProperty({
        example: "Acme Workspace",
    })
    name: string

    @ApiProperty({
        example: "acme-workspace",
    })
    slug: string
}

class PublicInvitationInviterDto {
    @ApiProperty({
        example: "Ada Lovelace",
    })
    name: string

    @ApiProperty({
        example: "ada@example.com",
    })
    email: string
}

export class PublicInvitationResponseDto {
    @ApiProperty({
        example: "invitation_1",
    })
    id: string

    @ApiProperty({
        example: "org_1",
    })
    organizationId: string

    @ApiProperty({
        example: "new.member@example.com",
    })
    email: string

    @ApiProperty({
        example: "member",
    })
    role: string

    @ApiProperty({
        example: "pending",
    })
    status: string

    @ApiProperty({
        example: "2026-06-24T12:00:00.000Z",
    })
    expiresAt: Date

    @ApiProperty({
        type: PublicInvitationOrganizationDto,
    })
    organization: PublicInvitationOrganizationDto

    @ApiProperty({
        type: PublicInvitationInviterDto,
    })
    inviter: PublicInvitationInviterDto
}
