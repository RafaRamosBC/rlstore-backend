import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Product as ProductModel } from '@prisma/client'; // Importe o modelo Prisma

@ApiBearerAuth()
@ApiTags('Produtos')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar um novo produto' })
    @ApiResponse({ status: 201, description: 'O produto foi criado com sucesso.', type: CreateProductDto }) // Pode usar o DTO ou o modelo Prisma aqui
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 404, description: 'SKU duplicado.' }) // Exemplo de erro específico
    async create(@Body() createProductDto: CreateProductDto): Promise<ProductModel> {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os produtos ou buscar por termo' })
    @ApiQuery({ name: 'search', required: false, description: 'Termo para buscar produtos (nome, descrição, SKU)' })
    @ApiResponse({ status: 200, description: 'Lista de produtos.', type: [CreateProductDto] }) // Use DTO ou modelo Prisma
    async findAll(@Query('search') searchTerm?: string): Promise<ProductModel[]> {
        return this.productsService.findAll(searchTerm);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um produto pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do produto (UUID)', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, description: 'Detalhes do produto.', type: CreateProductDto }) // Use DTO ou modelo Prisma
    @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductModel> {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar um produto pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do produto (UUID)', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, description: 'O produto foi atualizado com sucesso.', type: CreateProductDto }) // Use DTO ou modelo Prisma
    @ApiResponse({ status: 404, description: 'Produto não encontrado / SKU duplicado.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto): Promise<ProductModel> {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remover um produto pelo ID' })
    @ApiParam({ name: 'id', description: 'ID do produto (UUID)', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 204, description: 'O produto foi removido com sucesso.' })
    @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.productsService.remove(id);
        // O método remove do serviço agora retorna o produto deletado,
        // mas o controller para um DELETE 204 não deve retornar corpo.
    }
}