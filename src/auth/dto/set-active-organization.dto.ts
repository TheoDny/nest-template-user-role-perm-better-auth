import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator"

export class SetActiveOrganizationDto {
    @ValidateIf((dto: SetActiveOrganizationDto) => dto.organizationId !== null)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    organizationId?: string | null

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    organizationSlug?: string
}
