import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaCoreModule } from './core/prisma.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaCoreModule, ProductsModule, CartModule, OrdersModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
