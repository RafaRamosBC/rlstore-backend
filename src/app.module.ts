import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma.service';
import { PrismaCoreModule } from './core/prisma.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaCoreModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
