import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida se o usuário existe e se a senha está correta.
   * @param email Email do usuário
   * @param pass Senha em texto plano
   * @returns O objeto do usuário (sem a senha) se válido, senão null.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email); 

    if (user && user.password) { 
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user; // Remove a senha do objeto
        return result; // Retorna o usuário sem a senha
      }
    }
    return null; // Retorna null se o usuário não existir ou a senha não bater
  }

  /**
   * Gera um token JWT para o usuário autenticado.
   * @param user Objeto do usuário (geralmente o retorno de validateUser)
   * @returns Um objeto com o access_token.
   */
  async login(user: Omit<User, 'password'>) { 
    const payload = {
      sub: user.id,       
      email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload), 
      user: { 
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }
}