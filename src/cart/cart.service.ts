import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { Cart, CartItem, Prisma } from '@prisma/client';

// Tipo para representar o carrinho com seus itens e total
export type CartWithDetails = Cart & { items: (CartItem & { product: { name: string, price: number, imageUrl?: string|null } })[], total: number };


@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  private async calculateTotal(items: (CartItem & { product: { price: number } })[]): Promise<number> {
    return items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
  }

  private async getCartWithDetails(cartId: string): Promise<CartWithDetails | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: { // Inclui detalhes do produto para cada item do carrinho
              select: { id: true, name: true, price: true, stock: true, imageUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' } // ordena os itens
        },
      },
    });

    if (!cart) {
      return null;
    }

    // Assegurar que product.price é um número para cálculo
    const itemsWithNumericPrice = cart.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price), // converter para number
      },
    }));

    const total = await this.calculateTotal(itemsWithNumericPrice);
    return { ...cart, items: itemsWithNumericPrice, total };
  }


  // Método para obter ou criar um carrinho 
  async findOrCreateCart(cartId?: string | null): Promise<CartWithDetails> {
    if (cartId) {
      const existingCart = await this.getCartWithDetails(cartId);
      if (existingCart) {
        return existingCart;
      }
      // Se o cartId foi fornecido mas não encontrado, pode ser um erro ou um ID antigo.
      // Poderíamos optar por lançar um erro ou criar um novo. Por simplicidade, criaremos um novo.
      // throw new NotFoundException(`Cart with ID "${cartId}" not found.`);
    }

    // Cria um novo carrinho
    const newCart = await this.prisma.cart.create({ data: {} });
    return this.getCartWithDetails(newCart.id) as Promise<CartWithDetails>; 
  }


  async addItemToCart(
    cartId: string,
    addItemDto: AddItemToCartDto,
  ): Promise<CartWithDetails> {
    const { productId, quantity } = addItemDto;

    // 1. Verificar se o carrinho existe
    const cart = await this.findOrCreateCart(cartId); // Isso garante que temos um cartId válido
    if (!cart) throw new NotFoundException(`Cart not found. This should not happen if findOrCreateCart is used.`);


    // 2. Verificar se o produto existe e se há estoque
    const product = await this.productsService.findOne(productId); // findOne já lança NotFoundException
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock for product "${product.name}". Available: ${product.stock}`,
      );
    }

    // 3. Verificar se o item já existe no carrinho
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { // Usando o índice único definido no schema
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingCartItem) {
      // Se existe, atualiza a quantidade
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Not enough stock for product "${product.name}" to increase quantity. Available: ${product.stock}`,
        );
      }
      await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Se não existe, cria um novo item no carrinho
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
          // priceAtAddition: product.price, // Se você adicionar essa coluna no schema
        },
      });
    }

    // TODO: Idealmente, decrementar o estoque do produto aqui ou na finalização da compra.
    // Por simplicidade, faremos a verificação de estoque, mas a decrementação será um passo posterior (ex: no pedido).

    return this.getCartWithDetails(cart.id) as Promise<CartWithDetails>; // Sabemos que existe
  }

  async updateCartItemQuantity(
    cartId: string,
    productId: string, // Usa productId para identificar o item no carrinho para o usuário
    newQuantity: number,
  ): Promise<CartWithDetails> {
    const cart = await this.getCartWithDetails(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Product with ID "${productId}" not found in cart "${cartId}"`);
    }

    if (newQuantity <= 0) { // Se a quantidade for 0 ou menor, remove o item
      await this.prisma.cartItem.delete({ where: { id: cartItem.id } });
    } else {
      if (cartItem.product.stock < newQuantity) {
        throw new BadRequestException(
          `Not enough stock for product "${cartItem.product.name}". Available: ${cartItem.product.stock}`,
        );
      }
      await this.prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: newQuantity },
      });
    }
    return this.getCartWithDetails(cartId) as Promise<CartWithDetails>;
  }

  async removeItemFromCart(cartId: string, productId: string): Promise<CartWithDetails> {
    const cart = await this.getCartWithDetails(cartId); // Valida existência do carrinho
    if (!cart) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }

    const result = await this.prisma.cartItem.deleteMany({ // deleteMany pois o where não é por ID único do CartItem
      where: { cartId: cartId, productId: productId },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Product with ID "${productId}" not found in cart "${cartId}"`);
    }
    return this.getCartWithDetails(cartId) as Promise<CartWithDetails>;
  }

  async clearCart(cartId: string): Promise<CartWithDetails> {
    const cart = await this.getCartWithDetails(cartId); // Valida existência do carrinho
     if (!cart) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cartId },
    });
    // Retorna o carrinho (agora vazio) com seus detalhes e total 0
    return this.getCartWithDetails(cartId) as Promise<CartWithDetails>;
  }
}