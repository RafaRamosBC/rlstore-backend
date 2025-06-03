import { Controller, Post, UseGuards, Request, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Interface para o objeto de requisição tipado com o usuário
interface AuthenticatedRequest extends globalThis.Request {
  user: Omit<User, 'password'>;
}

@ApiTags('Autenticação (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard) // Ativa a LocalStrategy através deste Guard
  @Post('login')
  @HttpCode(HttpStatus.OK) // Retorna 200 OK
  @ApiOperation({ summary: 'Realizar login e obter token JWT' })
  @ApiBody({ type: LoginDto }) // Especifica o corpo esperado para o Swagger
  @ApiResponse({ status: 200, description: 'Login bem-sucedido, token JWT retornado.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(
    @Request() req: { user: Omit<User, 'password'> },
    @Body() loginDto: LoginDto, // loginDto para Swagger e validação de corpo
  ) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth() // Indica no Swagger que esta rota requer um Bearer Token
  @ApiOperation({ summary: 'Obter o perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado (token inválido ou não fornecido).' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}