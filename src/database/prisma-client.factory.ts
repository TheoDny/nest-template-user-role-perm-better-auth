import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

export function createPrismaClient(): PrismaClient {
    return new PrismaClient({
        adapter: createPrismaPgAdapter(),
    })
}

export function createPrismaPgAdapter(): PrismaPg {
    return new PrismaPg({
        connectionString: process.env.DATABASE_URL ?? "",
    })
}
