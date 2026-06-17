import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator"

export class SetActiveOrganizationDto {
    @ApiPropertyOptional({
        description: "Organization id to set as active. Use null to clear the active organization.",
        example: "org_1",
        nullable: true,
    })
    @ValidateIf((dto: SetActiveOrganizationDto) => dto.organizationId !== null)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    organizationId?: string | null

    @ApiPropertyOptional({
        description: "Organization slug to set as active when the id is not available.",
        example: "acme-workspace",
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    organizationSlug?: string
}
