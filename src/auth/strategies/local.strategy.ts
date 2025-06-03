import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') { 
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Diz ao Passport para usar o campo 'email' como username
      // passwordField: 'password' // 'password' já é o padrão
    });
  }

  // Este método é chamado pelo Passport quando a estratégia 'local' é usada
  async validate(email: string, pass: string): Promise<Omit<User, 'password'>> {
    // console.log(`LocalStrategy validate: email=${email}, password=${pass.substring(0,3)}...`);
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    // O Passport automaticamente anexa o retorno deste método ao objeto `request.user`
    return user;
  }
}