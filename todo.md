# TODO List

## SISTEMA DE LOGIN (TALVEZ COM CLERK?)
  ### AUTENTICAÇÃO JWT
  ### SISTEMA CRUD SIMPLES
  ### INTEGRAÇÃO COM SISTEMAS EXTERNOS COMO STRIPE, PAYPAL, ETC
  ### MODELO DE DADOS COMPLEXO CAPAZ DE GERENCIAR PRODUTOS, USUÁRIOS, PEDIDOS/CARRINHOS, ETC
## ADICIONAR PRODUTOS AO CARRINHO
## REMOVE PRODUTOS DO CARRINHO
## VER E PROCURAR PRODUTOS
## FINALIZAR COMPRA E PAGAR POR PRODUTOS



Entidades:
- Usuário
- Produto
- Carrinho (pertence a um usuário (ou sessão se anônimo) e contém produtos)
- CartItem (pertence a um carrinho e representa um produto específico com quantidade)
- Log de Pedidos/Carrinhos
- Pedido (Criado a partir de um carrinho quando o usuário finaliza a compra, contém informações de pagamento, status do pedido, etc, ele congela preço final e itens do carrinho no momento da finalização da compra tipo um snapshot do produto)
- Pagamento