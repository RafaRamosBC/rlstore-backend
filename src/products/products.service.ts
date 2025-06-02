import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service'; // Ajuste o caminho se necessário
import { Product, Prisma } from '@prisma/client'; // Importe os tipos do Prisma
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { } // Injete o PrismaService

    async create(createProductDto: CreateProductDto): Promise<Product> {
        try {
            return await this.prisma.product.create({
                data: createProductDto,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Exemplo: Código P2002 é para violação de constraint única (como o SKU)
                if (error.code === 'P2002') {
                    throw new NotFoundException('A product with this SKU already exists.');
                }
            }
            throw error; // Re-lança outros erros
        }
    }

    async findAll(searchTerm?: string): Promise<Product[]> {
        const or: Prisma.ProductWhereInput[] = searchTerm
            ? [
                { name: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { sku: { contains: searchTerm } },
            ]
            : [];

        return this.prisma.product.findMany({
            where: { OR: or.length > 0 ? or : undefined },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        try {
            return await this.prisma.product.update({
                where: { id },
                data: updateProductDto,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                // P2025: "An operation failed because it depends on one or more records that were required but not found. {cause}"
                throw new NotFoundException(`Product with ID "${id}" not found to update`);
            } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new NotFoundException('A product with this SKU already exists.');
            }
            throw error;
        }
    }

    async remove(id: string): Promise<Product> {
        try {
            return await this.prisma.product.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Product with ID "${id}" not found to delete`);
            }
            throw error;
        }
    }
}