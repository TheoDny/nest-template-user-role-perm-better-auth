import type { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export function setupSwagger(app: INestApplication): void {
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
}
