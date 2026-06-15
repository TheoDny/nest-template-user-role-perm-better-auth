import { IsString, MinLength } from "class-validator"

export class MemberParamDto {
    @IsString()
    @MinLength(1)
    memberId!: string
}
