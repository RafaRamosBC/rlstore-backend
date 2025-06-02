import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsInt, Min } from 'class-validator';

export class AddItemToCartDto {
    @ApiProperty({
        description: 'ID do produto a ser adicionado ao carrinho (UUID)',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    productId: string;

    @ApiProperty({
        description: 'Quantidade do produto a ser adicionada',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    quantity: number;
}