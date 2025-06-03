import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('Usuários (Users)')
@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @Post('register') // Usando /register para clareza, poderia ser só POST /users
    @ApiOperation({ summary: 'Registrar um novo usuário' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' /* type: UserResponseDto (se criado) */ })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 409, description: 'Email já existe.' }) // Conflict
    async register(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        this.logger.log(`Tentativa de registro para o email: ${createUserDto.email}`);
        return this.usersService.create(createUserDto);
    }

    // Exemplo de endpoint para buscar usuário (geralmente protegido)
    // GET /users/:id
    @Get(':id')
    @ApiOperation({ summary: 'Buscar um usuário pelo ID (geralmente protegido)' })
    @ApiResponse({ status: 200, description: 'Detalhes do usuário.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    async getUserProfile(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<Omit<User, 'password'> | null> {
        this.logger.log(`Buscando usuário com ID: ${id}`);
        const user = await this.usersService.findOneById(id);
        if (!user) {
            throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
        }
        return user;
    }
}