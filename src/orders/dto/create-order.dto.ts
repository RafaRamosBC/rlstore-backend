import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
    @ApiProperty({
        description: 'ID do carrinho (UUID) a partir do qual o pedido será criado.',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    cartId: string;


}