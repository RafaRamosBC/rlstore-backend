import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'usuario@exemplo.com', description: 'Email do usuário' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'senhaSuperForte123', description: 'Senha do usuário' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
    password: string;
}