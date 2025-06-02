import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o PrismaService disponível globalmente
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // Exporta para que possa ser injetado
})
export class PrismaCoreModule { }