import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            // Exemplo: log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Prisma client connected.');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Prisma client disconnected.');
    }
}