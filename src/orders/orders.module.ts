import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    CartModule,     // Importa para poder injetar CartService
    ProductsModule, // Importa para poder injetar ProductsService
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }