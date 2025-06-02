import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() { // <--- ADICIONE ESTE CONSTRUTOR
        super({
            // Você pode adicionar opções de log do Prisma aqui se desejar
            // Exemplo: log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        // O Prisma Client se conecta "preguiçosamente" na primeira query.
        // Esta chamada explícita é para garantir a conexão na inicialização do módulo,
        // o que pode ser útil para detectar problemas de conexão mais cedo.
        await this.$connect();
        console.log('Prisma client connected.');
    }

    async onModuleDestroy() {
        // Garante que a conexão com o banco de dados seja fechada graciosamente
        // quando a aplicação NestJS for encerrada.
        await this.$disconnect();
        console.log('Prisma client disconnected.');
    }
}