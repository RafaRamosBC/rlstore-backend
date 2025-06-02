
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Usar ValidationPipe globalmente para validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Lança erro se propriedades não definidas forem enviadas
    transform: true, // Transforma o payload para o tipo do DTO
  }));

  const config = new DocumentBuilder()
    .setTitle('Sistema de Compras API')
    .setDescription('API para gerenciar produtos, carrinho e compras.')
    .setVersion('1.0')
    .addTag('Produtos')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}/api-docs`);
}
bootstrap();
