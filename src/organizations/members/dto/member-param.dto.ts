import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class MemberParamDto {
    @ApiProperty({
        example: "member_1",
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    memberId!: string
}
