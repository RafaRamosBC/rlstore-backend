import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service'; // Você precisará do ProductsService
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderItem, OrderStatus, Prisma, Product } from '@prisma/client';

export type OrderWithDetails = Order & {
  items: (OrderItem & { product: { id: string; name: string; imageUrl?: string | null } })[];
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private productsService: ProductsService, // Injete o ProductsService
  ) { }

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderWithDetails> {
    const { cartId } = createOrderDto;

    // 1. Obter detalhes do carrinho
    const cart = await this.cartService.findOrCreateCart(cartId); // Reutiliza o método existente
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Carrinho não encontrado ou está vazio.');
    }
    if (cart.id !== cartId && cartId !== undefined) { // Caso findOrCreateCart tenha criado um novo
      throw new NotFoundException(`Carrinho original com ID "${cartId}" não encontrado.`);
    }


    // Iniciar uma transação do Prisma
    try {
      const createdOrder = await this.prisma.$transaction(async (tx) => {
        // 2. Verificar estoque e preparar dados dos itens do pedido
        let totalAmount = 0;
        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

        for (const cartItem of cart.items) {
          const product = await tx.product.findUnique({
            where: { id: cartItem.productId },
          });

          if (!product) {
            throw new NotFoundException( // Erro mais específico dentro da transação
              `Produto com ID "${cartItem.productId}" no carrinho não foi encontrado.`,
            );
          }
          if (product.stock < cartItem.quantity) {
            throw new BadRequestException(
              `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, Solicitado: ${cartItem.quantity}.`,
            );
          }

          orderItemsData.push({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: Number(cartItem.product.price), // Preço do produto no momento da compra (do carrinho)
          });
          totalAmount += Number(cartItem.product.price) * cartItem.quantity;
        }

        // 3. Criar o Pedido (Order)
        const order = await tx.order.create({
          data: {
            totalAmount: totalAmount,
            status: OrderStatus.PENDING, // Status inicial
            items: {
              createMany: {
                data: orderItemsData,
              },
            },
          },
          include: { // Inclui os itens para retorno
            items: {
              include: {
                product: { select: { id: true, name: true, imageUrl: true } }
              }
            }
          }
        });

        // 4. Decrementar o estoque dos produtos
        for (const cartItem of cart.items) {
          await tx.product.update({
            where: { id: cartItem.productId },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
        }

        // 5. Limpar o carrinho (remover todos os CartItems associados ao cartId)
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order;
      }); // Fim da transação

      return createdOrder as OrderWithDetails;

    } catch (error) {
      // Log do erro 
      console.error("Erro ao criar pedido:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException) {
        throw error; // Re-lança exceções conhecidas ou de negócio
      }
      // Para erros inesperados, lança um InternalServerErrorException
      throw new InternalServerErrorException('Ocorreu um erro ao processar seu pedido.');
    }
  }

  async findOrderById(orderId: string): Promise<OrderWithDetails> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } }, // Seleciona apenas alguns campos do produto
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID "${orderId}" não encontrado.`);
    }
    return order as OrderWithDetails;
  }

}