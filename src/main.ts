import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import "reflect-metadata"
import { AppModule } from "./app.module"

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false,
    })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            stopAtFirstError: false,
        }),
    )

    const configService = app.get(ConfigService)
    const port = configService.getOrThrow<number>("PORT")

    app.enableCors({
        origin: configService.getOrThrow<string>("BETTER_AUTH_TRUSTED_ORIGINS"),
        credentials: true,
    })

    const swaggerConfig = new DocumentBuilder()
        .setTitle("NestJS Better Auth API")
        .setDescription(
            "API documentation for authentication, sessions, permissions, roles, members, and invitations.",
        )
        .setVersion("1.0.0")
        .addCookieAuth("better-auth.session_token", undefined, "betterAuthSession")
        .build()
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

    SwaggerModule.setup("docs", app, swaggerDocument)

    await app.listen(port)
}

void bootstrap()
