import { plainToInstance, Type } from "class-transformer"
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min, validateSync } from "class-validator"

class EnvironmentVariables {
    @IsIn(["development", "test", "production"])
    NODE_ENV = "development"

    @IsInt()
    @Min(1)
    @Type(() => Number)
    PORT = 3000

    @IsString()
    @IsNotEmpty()
    DATABASE_URL!: string

    @IsString()
    @IsNotEmpty()
    BETTER_AUTH_SECRET!: string

    @IsUrl({ require_tld: false })
    BETTER_AUTH_URL!: string

    @IsString()
    @IsOptional()
    BETTER_AUTH_BASE_PATH = "/api/auth"

    @IsString()
    @IsOptional()
    BETTER_AUTH_TRUSTED_ORIGINS = ""

    @IsUrl({ require_tld: false })
    APP_PUBLIC_URL!: string

    @IsString()
    @IsNotEmpty()
    SMTP_HOST!: string

    @IsInt()
    @Min(1)
    @Type(() => Number)
    SMTP_PORT = 1025

    @IsString()
    @IsOptional()
    SMTP_USER = ""

    @IsString()
    @IsOptional()
    SMTP_PASSWORD = ""

    @IsString()
    @IsNotEmpty()
    SMTP_FROM!: string
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    })
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    })

    if (errors.length > 0) {
        throw new Error(errors.toString())
    }

    return validatedConfig
}
