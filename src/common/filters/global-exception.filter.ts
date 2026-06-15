import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common"
import type { Request, Response } from "express"
import { AppError } from "../errors"

type ErrorResponse = {
    statusCode: number
    error: string
    message: string
    code: string
    timestamp: string
    path: string
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name)
    private readonly internalServerErrorStatus = Number(HttpStatus.INTERNAL_SERVER_ERROR)

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp()
        const response = context.getResponse<Response>()
        const request = context.getRequest<Request>()
        const payload = this.buildPayload(exception, request)

        if (payload.statusCode >= this.internalServerErrorStatus) {
            this.logger.error(payload.message, exception instanceof Error ? exception.stack : undefined)
        }

        response.status(payload.statusCode).json(payload)
    }

    private buildPayload(exception: unknown, request: Request): ErrorResponse {
        if (exception instanceof AppError) {
            return {
                statusCode: exception.statusCode,
                error: exception.name,
                message: exception.message,
                code: exception.code,
                timestamp: new Date().toISOString(),
                path: request.url,
            }
        }

        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus()
            const response = exception.getResponse()
            const message = this.resolveHttpMessage(response, exception.message)

            return {
                statusCode,
                error: exception.name,
                message,
                code: this.toErrorCode(exception.name),
                timestamp: new Date().toISOString(),
                path: request.url,
            }
        }

        const betterAuthPayload = this.resolveBetterAuthError(exception)

        if (betterAuthPayload) {
            return {
                ...betterAuthPayload,
                timestamp: new Date().toISOString(),
                path: request.url,
            }
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: "InternalServerError",
            message: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
            timestamp: new Date().toISOString(),
            path: request.url,
        }
    }

    private resolveHttpMessage(response: string | object, fallback: string): string {
        if (typeof response === "string") {
            return response
        }

        if ("message" in response) {
            const message = response.message

            if (Array.isArray(message)) {
                return message.join("; ")
            }

            if (typeof message === "string") {
                return message
            }
        }

        return fallback
    }

    private resolveBetterAuthError(exception: unknown): Omit<ErrorResponse, "timestamp" | "path"> | null {
        if (!exception || typeof exception !== "object") {
            return null
        }

        const record = exception as Record<string, unknown>
        const statusCode = record.statusCode ?? record.status
        const message = record.message

        if (typeof statusCode !== "number" || typeof message !== "string") {
            return null
        }

        return {
            statusCode,
            error: typeof record.name === "string" ? record.name : "BetterAuthError",
            message,
            code: typeof record.code === "string" ? record.code : "BETTER_AUTH_OPERATION_FAILED",
        }
    }

    private toErrorCode(error: string): string {
        return error
            .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
            .replace(/\W+/g, "_")
            .toUpperCase()
    }
}
