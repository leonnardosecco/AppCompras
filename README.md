# Sistema de Controle de Compras

Sistema interno para gerenciamento de compras, estoque e pedidos.

## Funcionalidades

- Autenticação de usuários com diferentes níveis de acesso
- Painel administrativo para gerenciamento de usuários
- Sistema de pedidos de compra
- Controle de estoque
- Interface específica para cada tipo de usuário (Administrador, Comprador, Estoquista)

## Requisitos

- Node.js 18 ou superior
- NPM ou Yarn
- SQLite (banco de dados local)

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-compras
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-aqui
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

O sistema estará disponível em `http://localhost:3000`

## Estrutura de Usuários

O sistema possui três níveis de acesso:

1. **Administrador (ADMIN)**
   - Acesso total ao sistema
   - Gerenciamento de usuários
   - Visualização de todas as funcionalidades

2. **Comprador (COMPRADOR)**
   - Criação e gerenciamento de pedidos
   - Visualização do status dos pedidos

3. **Estoquista (ESTOQUISTA)**
   - Controle de estoque
   - Registro de entrada e saída de produtos

## Desenvolvimento

O projeto utiliza as seguintes tecnologias:

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- NextAuth.js (Autenticação)
- SQLite (Banco de dados) 