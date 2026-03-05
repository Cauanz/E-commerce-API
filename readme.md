# E-commerce API (Backend)

API REST para e-commerce com autenticação JWT, carrinho, pedidos e integração de pagamento com Stripe.

Este README documenta **apenas o backend** do projeto.

## Stack

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT (`jsonwebtoken`)
- Stripe
- Jest + Supertest

## Estrutura (Backend)

```txt
backend/
	index.js
	package.json
	config/
	controllers/
	middlewares/
	models/
	routes/
	tests/
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL em execução
- Conta Stripe (modo teste)

## Instalação

```bash
cd backend
npm install
```

## Configuração de ambiente

Crie um arquivo `.env` dentro de `backend/` com:

```env
PORT=<port>
SECRET=sua_chave_jwt
STRIPE_TEST_KEY=sua_chave_secreta_stripe (opcional)
```

### Banco de dados

Atualmente a conexão está fixa em `backend/config/sequelize.db.js`:

```js
new Sequelize("postgres://user:password@localhost:port/database_name");
```

Se quiser usar outro usuário/senha/banco, altere essa URL.

## Executar projeto

```bash
cd backend
npm run dev
```

A API sobe com prefixo `http://localhost:<PORT>/v1`.

## Entidades principais

- `User`: dados do usuário, senha hash e papel (`user`/`admin`) _"admin" não tem nenhuma utilidade prática no momento atual_
- `Product`: catálogo (nome, descrição, estoque, preço)
- `Cart` e `CartItem`: carrinho ativo/convertido e itens
- `Order` e `OrderItem`: pedido, expiração e itens comprados
- `Payment`: status e rastreio de transação

## Autenticação

Após login, envie o token no header:

```http
Authorization: Bearer <jwt>
```

## Endpoints

Base: `/v1`

### Usuários

- `POST /user/register/` - criar conta
- `POST /user/login/` - login e geração de JWT

### Produtos

- `GET /products/` - listar produtos
- `GET /products/:id` - buscar produto por ID
- `POST /products/` - criar produto (token)
- `PATCH /products/:id` - atualizar produto
- `POST /products/:id/increase-stock` - aumentar estoque (token)
- `POST /products/:id/decrease-stock` - reduzir estoque
- `DELETE /products/:id` - remover produto

### Carrinho

- `POST /cart/items/` - adicionar item ao carrinho (token)
- `PATCH /cart/items/:id` - atualizar quantidade no carrinho (token)
- `DELETE /cart/items/:id` - remover item do carrinho (token)

### Pedidos e pagamento

- `POST /orders/` - criar pedido a partir do carrinho (token)
- `POST /orders/:orderId/pay` - iniciar checkout Stripe (token)
- `GET /orders/:orderId/success` - callback de pagamento aprovado
- `GET /orders/cancel` - callback de pagamento cancelado/falho

### Rotas de debug

- `GET /carts/` - listar carrinhos
- `GET /cart-items/` - listar itens de carrinho

## Fluxo resumido

1. Registrar usuário
2. Fazer login e obter JWT
3. Cadastrar produtos
4. Adicionar produtos ao carrinho
5. Criar pedido
6. Iniciar pagamento via Stripe
7. Confirmar sucesso/falha via callbacks

## Limitações conhecidas (estado atual)

- Algumas rotas administrativas ainda não aplicam validação de perfil admin (`validateAdmin.js` não está integrado nas rotas).

## Observação

Este documento foi feito para o backend. A pasta `frontend/` não foi considerada nesta documentação por ser apenas para fins de teste e demonstração, e não foi criado por mim.
