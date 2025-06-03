import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'usuario@exemplo.com', description: 'Endereço de e-mail do usuário' })
    @IsNotEmpty({ message: 'O email não pode ser vazio.' })
    @IsEmail({}, { message: 'Por favor, forneça um endereço de email válido.' })
    email: string;

    @ApiProperty({ example: 'senhaSuperForte123', description: 'Senha do usuário (mínimo 8 caracteres)' })
    @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
    @IsString()
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
    password: string;

    @ApiPropertyOptional({ example: 'Nome do Usuário', description: 'Nome do usuário (opcional)' })
    @IsOptional()
    @IsString()
    name?: string;
}