import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const { email, password, name } = createUserDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Um usuário com este email já existe.');
        }

        const saltRounds = 10; // Número de "rounds" para o salt do bcrypt
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        } catch (error) {
            // Log o erro real em um sistema de logging de produção
            console.error('Erro ao gerar hash da senha:', error);
            throw new InternalServerErrorException('Erro ao processar a criação do usuário.');
        }

        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...result } = user; // Remove a senha do objeto retornado
            return result;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Código P2002 é para violação de constraint única (já coberto pela verificação de email acima, mas bom ter)
                if (error.code === 'P2002') {
                    throw new ConflictException('Email já está em uso.');
                }
            }
            console.error('Erro ao criar usuário no banco:', error);
            throw new InternalServerErrorException('Não foi possível criar o usuário.');
        }
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findOneById(id: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }
}