import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class RoleParamDto {
    @ApiProperty({
        example: "role_1",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    roleId!: string
}
