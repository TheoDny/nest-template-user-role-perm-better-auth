import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"
import { createPrismaPgAdapter } from "./prisma-client.factory"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            adapter: createPrismaPgAdapter(),
        })
    }

    async onModuleInit(): Promise<void> {
        await this.$connect()
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect()
    }
}
