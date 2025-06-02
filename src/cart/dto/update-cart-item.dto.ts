import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
    @ApiProperty({
        description: 'Nova quantidade do item no carrinho',
        example: 2,
        minimum: 1, // Se a quantidade for 0, deveria ser uma remoção
    })
    @IsInt()
    @Min(1) // Para remover, usa-se o endpoint de remoção. Para definir como 0, também.
    quantity: number;
}