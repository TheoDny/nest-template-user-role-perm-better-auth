import "reflect-metadata"
import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
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

    await app.listen(port)
}

void bootstrap()
