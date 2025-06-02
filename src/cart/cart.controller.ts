import { Controller, Post, Body, Get, Param, Patch, Delete, Query, ParseUUIDPipe, HttpCode, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { CartService, CartWithDetails } from './cart.service';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth() // Se for proteger os endpoints no futuro
@ApiTags('Carrinho (Cart)')
@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo carrinho vazio ou obtém um existente se um ID for passado (opcionalmente)' })
  @ApiQuery({ name: 'cartId', required: false, description: 'ID de um carrinho existente para recuperar.' })
  @ApiResponse({ status: 201, description: 'Carrinho criado/recuperado com sucesso.' }) // Type será CartWithDetails
  async getOrCreateCart(@Query('cartId', new ParseUUIDPipe({ optional: true })) cartId?: string): Promise<CartWithDetails> {
    this.logger.log(`getOrCreateCart called with cartId: ${cartId}`);
    return this.cartService.findOrCreateCart(cartId);
  }

  @Get(':cartId')
  @ApiOperation({ summary: 'Obtém os detalhes de um carrinho específico' })
  @ApiParam({ name: 'cartId', description: 'ID do Carrinho (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Detalhes do carrinho.' }) // Type será CartWithDetails
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
  async getCart(@Param('cartId', ParseUUIDPipe) cartId: string): Promise<CartWithDetails> {
    this.logger.log(`getCart called with cartId: ${cartId}`);
    const cart = await this.cartService.findOrCreateCart(cartId); // findOrCreate garante que não teremos erro se ID não existir
    if (!cart.items && cart.id !== cartId && cartId !== undefined) { // Se um cartId foi dado, mas um novo foi criado
      throw new NotFoundException(`Cart with ID "${cartId}" not found, a new one was created: ${cart.id}`);
    }
    return cart;
  }


  @Post(':cartId/items')
  @ApiOperation({ summary: 'Adiciona um item a um carrinho específico' })
  @ApiParam({ name: 'cartId', description: 'ID do Carrinho (UUID)', type: 'string' })
  @ApiBody({ type: AddItemToCartDto })
  @ApiResponse({ status: 200, description: 'Item adicionado com sucesso.' }) // Type será CartWithDetails
  @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente.' })
  @ApiResponse({ status: 404, description: 'Carrinho ou Produto não encontrado.' })
  async addItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() addItemDto: AddItemToCartDto,
  ): Promise<CartWithDetails> {
    this.logger.log(`addItem called for cartId: ${cartId} with DTO: ${JSON.stringify(addItemDto)}`);
    return this.cartService.addItemToCart(cartId, addItemDto);
  }

  @Patch(':cartId/items/:productId')
  @ApiOperation({ summary: 'Atualiza a quantidade de um item no carrinho' })
  @ApiParam({ name: 'cartId', description: 'ID do Carrinho (UUID)', type: 'string' })
  @ApiParam({ name: 'productId', description: 'ID do Produto no carrinho (UUID)', type: 'string' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso.' }) // Type será CartWithDetails
  @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente.' })
  @ApiResponse({ status: 404, description: 'Carrinho ou Item do carrinho não encontrado.' })
  async updateItemQuantity(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartWithDetails> {
    this.logger.log(`updateItemQuantity called for cartId: ${cartId}, productId: ${productId} with DTO: ${JSON.stringify(updateCartItemDto)}`);
    return this.cartService.updateCartItemQuantity(cartId, productId, updateCartItemDto.quantity);
  }

  @Delete(':cartId/items/:productId')
  @ApiOperation({ summary: 'Remove um item específico do carrinho' })
  @ApiParam({ name: 'cartId', description: 'ID do Carrinho (UUID)', type: 'string' })
  @ApiParam({ name: 'productId', description: 'ID do Produto a ser removido (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso.' }) // Type será CartWithDetails
  @ApiResponse({ status: 404, description: 'Carrinho ou Item do carrinho não encontrado.' })
  async removeItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<CartWithDetails> {
    this.logger.log(`removeItem called for cartId: ${cartId}, productId: ${productId}`);
    return this.cartService.removeItemFromCart(cartId, productId);
  }

  @Delete(':cartId')
  @ApiOperation({ summary: 'Limpa todos os itens de um carrinho (esvazia o carrinho)' })
  @ApiParam({ name: 'cartId', description: 'ID do Carrinho (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo com sucesso.' }) // Type será CartWithDetails
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
  async clearCart(@Param('cartId', ParseUUIDPipe) cartId: string): Promise<CartWithDetails> {
    this.logger.log(`clearCart called for cartId: ${cartId}`);
    return this.cartService.clearCart(cartId);
  }
}