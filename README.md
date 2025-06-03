# Sistema de Compras API

Uma API backend para um sistema de compras online, desenvolvida com NestJS, TypeScript, Prisma e SQLite. Permite gerenciar produtos, carrinhos de compras, processar pedidos, registrar usuários e autenticá-los usando JWT.

## Funcionalidades Implementadas

* **Produtos**: CRUD completo (Criar, Ler, Atualizar, Deletar) e busca de produtos.
* **Carrinho de Compras**: Adicionar itens, remover itens, atualizar quantidades, limpar carrinho e visualizar o carrinho com o total.
* **Pedidos**: Criação de pedidos a partir do carrinho (checkout), com decremento de estoque dos produtos e limpeza do carrinho. Visualização de detalhes do pedido.
* **Usuários**: Registro de novos usuários com hashing de senha. Busca de usuários por ID.
* **Autenticação**: Login de usuários (email/senha) com geração de JSON Web Tokens (JWT) e rota de perfil de usuário protegido.
* **Validação de Dados**: Uso de DTOs com `class-validator` e `class-transformer`.
* **Documentação da API**: Geração automática de documentação com Swagger (OpenAPI).

## Tecnologias Utilizadas

* [NestJS](https://nestjs.com/)
* [TypeScript](https://www.typescriptlang.org/)
* [Prisma ORM](https://www.prisma.io/)
* [SQLite](https://www.sqlite.org/index.html)
* [JSON Web Tokens (JWT)](https://jwt.io/) para autenticação
* [bcrypt](https://www.npmjs.com/package/bcrypt) para hashing de senhas
* [pnpm](https://pnpm.io/) como gerenciador de pacotes
* [Swagger (OpenAPI)](https://swagger.io/) para documentação da API

## Pré-requisitos

* [Node.js](https://nodejs.org/)
* [pnpm](https://pnpm.io/installation) (gerenciador de pacotes)

## Configuração e Instalação

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/RafaRamosBC/rlstore-backend.git
    cd rlstore-backend
    ```

2.  **Instale as Dependências:**
    Use o `pnpm` para instalar todas as dependências do projeto.
    ```bash
    pnpm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto. Você pode copiar o conteúdo do arquivo `.env.example` (se você criar um) ou adicionar as seguintes variáveis:

    ```ini
    # .env

    # URL de conexão com o banco de dados SQLite
    # O Prisma criará o arquivo 'dev.db' dentro da pasta 'prisma' se não existir.
    DATABASE_URL="file:./prisma/dev.db"

    # Segredo para assinatura dos JSON Web Tokens (JWT)
    # IMPORTANTE: Use uma string longa, aleatória e segura para produção!
    # Exemplo (NÃO USE ESTE EM PRODUÇÃO): K33pTh1sS3cr3tV3ryS4f3AndL0ng!
    JWT_SECRET="SEU_SEGREDO_FORTE_E_UNICO_AQUI"

    # Tempo de expiração para os JWTs (ex: 60s, 1h, 7d)
    JWT_EXPIRES_IN="1h"
    ```
    **Importante:** Adicione o arquivo `.env` ao seu `.gitignore` para evitar que seus segredos sejam enviados para o repositório Git.
    ```
    # .gitignore
    .env
    node_modules/
    dist/
    *.sqlite
    ```

4.  **Execute as Migrações do Banco de Dados:**
    Este comando aplicará todas as migrações do Prisma ao seu banco de dados SQLite, criando as tabelas necessárias.
    ```bash
    pnpm prisma migrate dev
    ```
    Isso também irá gerar o Prisma Client com base no seu schema.

## Rodando a Aplicação

1.  **Modo de Desenvolvimento:**
    Para iniciar a aplicação em modo de desenvolvimento com hot-reload:
    ```bash
    pnpm run start:dev
    ```
    A aplicação estará disponível por padrão em `http://localhost:3000`.
    Você verá mensagens no console indicando que a aplicação está rodando e o endereço da documentação Swagger.

## Acessando a API e a Documentação

* **URL Base da API:** `http://localhost:3000`
* **Documentação Swagger UI:** `http://localhost:3000/api`

A documentação Swagger permite visualizar todos os endpoints disponíveis, seus parâmetros, corpos de requisição esperados e respostas. Você também pode testar os endpoints diretamente pela interface do Swagger UI, incluindo os endpoints protegidos por JWT (utilize o botão "Authorize" após fazer login para obter um token).

## Fluxo Básico de Teste Sugerido

1.  **Registre um Usuário:** `POST /users/register`
2.  **Faça Login:** `POST /auth/login` para obter um `access_token`.
3.  **Autorize no Swagger UI:** Clique em "Authorize" e insira `Bearer SEU_ACCESS_TOKEN`.
4.  **Crie Produtos:** `POST /products`
5.  **Crie um Carrinho:** `POST /cart` (ou `POST /cart?cartId=...` se já tiver um). Anote o `cartId`.
6.  **Adicione Itens ao Carrinho:** `POST /cart/{cartId}/items`
7.  **Finalize a Compra (Crie um Pedido):** `POST /orders` (usando o `cartId` e o token JWT para rotas protegidas, se você as protegeu).
8.  **Verifique o Pedido e Estoque:** `GET /orders/{orderId}` e `GET /products/{productId}`.

---