import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class UpdateOrganizationRoleNameDto {
    @ApiProperty({
        example: "support-manager",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    name!: string
}
