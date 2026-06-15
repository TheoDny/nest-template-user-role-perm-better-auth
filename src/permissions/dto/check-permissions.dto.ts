import { ArrayNotEmpty, IsArray, IsString, Matches } from "class-validator"

export class CheckPermissionsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @Matches(/^[a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z][a-zA-Z0-9_-]*$/, {
        each: true,
        message: "Each permission must use the resource:action format",
    })
    permissions!: string[]
}
