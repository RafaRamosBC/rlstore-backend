import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Logger, UseGuards } from '@nestjs/common';
import { OrdersService, OrderWithDetails } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Exemplo se você adicionar autenticação

@ApiBearerAuth() // Se for proteger
@ApiTags('Pedidos (Orders)')
@Controller('orders')
export class OrdersController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(private readonly ordersService: OrdersService) { }

    // @UseGuards(JwtAuthGuard) // Exemplo: Proteger este endpoint
    @Post()
    @ApiOperation({ summary: 'Cria um novo pedido a partir de um carrinho' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' }) // Type deveria ser OrderWithDetails
    @ApiResponse({ status: 400, description: 'Carrinho vazio, estoque insuficiente ou dados inválidos.' })
    @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
    async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderWithDetails> {
        this.logger.log(`Criando pedido a partir do carrinho ID: ${createOrderDto.cartId}`);
        return this.ordersService.createOrder(createOrderDto);
    }

    // @UseGuards(JwtAuthGuard) // Exemplo: Proteger este endpoint
    @Get(':id')
    @ApiOperation({ summary: 'Obtém os detalhes de um pedido específico' })
    @ApiParam({ name: 'id', description: 'ID do Pedido (UUID)', type: 'string' })
    @ApiResponse({ status: 200, description: 'Detalhes do pedido.' }) // Type deveria ser OrderWithDetails
    @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
    async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<OrderWithDetails> {
        this.logger.log(`Buscando pedido com ID: ${id}`);
        return this.ordersService.findOrderById(id);
    }

}