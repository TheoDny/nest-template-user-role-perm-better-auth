export const appConfig = () => ({
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL,
    betterAuth: {
        secret: process.env.BETTER_AUTH_SECRET,
        url: process.env.BETTER_AUTH_URL,
        basePath: process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth",
        trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean),
    },
    appPublicUrl: process.env.APP_PUBLIC_URL,
    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 1025),
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM,
    },
})
