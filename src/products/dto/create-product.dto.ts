import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, MaxLength, IsOptional, IsInt, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ description: 'Nome do produto', example: 'Smartphone XYZ' })
    @IsString() @IsNotEmpty() @MaxLength(255)
    name: string;

    @ApiPropertyOptional({ description: 'Descrição detalhada do produto', example: 'O mais novo smartphone com câmera tripla.' })
    @IsString() @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Preço do produto', example: 1999.99, type: 'number', format: 'float' })
    @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() @Min(0.01)
    price: number;

    @ApiPropertyOptional({ description: 'Quantidade em estoque', example: 100, default: 0 })
    @IsInt() @Min(0) @IsOptional()
    stock?: number = 0;

    @ApiPropertyOptional({ description: 'SKU (Stock Keeping Unit) do produto', example: 'SM-XYZ-BLK' })
    @IsString() @IsOptional() @MaxLength(255)
    sku?: string;

    @ApiPropertyOptional({ description: 'URL da imagem do produto', example: 'https://example.com/image.jpg' })
    @IsUrl() @IsOptional()
    imageUrl?: string;
}