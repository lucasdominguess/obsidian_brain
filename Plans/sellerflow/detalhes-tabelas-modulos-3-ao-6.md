# Detalhes das Tabelas — Módulos 3 ao 6

> Documento gerado após a implementação das migrations, models, factories e seeders.
> Objetivo: entender o que cada tabela armazena, quem alimenta ela e o que ela gera.

---

## Visão Geral do Fluxo

Toda movimentação operacional gera dois efeitos automáticos no sistema:

```
COMPRA  → compra_itens  →  movimentacoes_estoque (entrada)  +  contas_pagar
VENDA   → venda_itens   →  movimentacoes_estoque (saída)    +  contas_receber
AJUSTE  → ajustes_estoque  →  movimentacoes_estoque (ajuste)
```

Dois dados nunca ficam gravados como número fixo — são sempre calculados na hora da consulta:

- **Saldo de estoque por produto** → soma/subtração das `movimentacoes_estoque`
- **Fluxo de caixa** → leitura das `contas_pagar` (pagas) + `contas_receber` (recebidas)

---

## Módulo 3 — Compras

### Tabela: `compras` ⬅ ALIMENTAÇÃO (o usuário preenche)

**O que é:** cabeçalho de uma compra. Registra de quem foi comprado, quando, como será pago e em quantas parcelas.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `company_id` | FK → companies | Empresa dona do registro (multi-tenancy futuro) |
| `store_id` | FK → stores | Loja que fez a compra |
| `fornecedor_id` | FK → fornecedores | Quem vendeu os produtos |
| `user_id` | FK → users | Quem cadastrou a compra |
| `forma_pagamento_id` | FK → forma_pagamentos | PIX, boleto, cartão etc. |
| `status_id` | FK → status | Ativo / Inativo / Cancelado |
| `numero_nota` | string nullable | Número da nota fiscal (opcional) |
| `data_compra` | date | Data da compra |
| `valor_total` | decimal | Soma de todos os itens |
| `numero_parcelas` | int (default 1) | Governa quantas `contas_pagar` serão criadas |
| `observacao` | text nullable | Observação livre |

> **Aqui vai gerar vários registros quando:** uma compra for salva com `numero_parcelas > 1`. O Service de Compra deve criar **N registros em `contas_pagar`**, um para cada parcela, com vencimentos calculados a partir da `data_compra` + 30 dias por parcela. Ex: compra em 3x → 3 contas a pagar nos meses seguintes.

---

### Tabela: `compra_itens` ⬅ GERADA (criada automaticamente junto com a compra)

**O que é:** os produtos que vieram nessa compra. Sempre existe ao lado da `compras` — nunca tem compra sem itens.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `compra_id` | FK → compras (cascade delete) | A compra à qual esse item pertence |
| `product_id` | FK → products | Qual produto foi comprado |
| `quantidade` | int | Quantidade comprada |
| `valor_unitario` | decimal | Preço pago por unidade naquele momento |
| `valor_total` | decimal | `quantidade × valor_unitario` |

> **Aqui vai gerar vários registros quando:** uma compra for cadastrada com múltiplos produtos. Ex: compra de 3 produtos diferentes → 3 linhas em `compra_itens`, cada uma com sua quantidade e valor.

> **Detalhe importante:** `valor_unitario` é gravado no momento da compra e **não muda** mesmo que o preço do produto mude depois. É o custo histórico daquela compra.

> **Cascade delete:** se a compra for excluída, todos os itens são excluídos junto. Nunca fica `compra_item` órfão.

---

## Módulo 4 — Vendas

### Tabela: `vendas` ⬅ ALIMENTAÇÃO (o usuário preenche)

**O que é:** cabeçalho de uma venda realizada em marketplace. Registra o pedido, os valores bruto e líquido e quando o marketplace vai repassar o dinheiro.

| Coluna                  | Tipo                | Descrição                                      |
| ----------------------- | ------------------- | ---------------------------------------------- |
| `id`                    | bigint PK           | —                                              |
| `company_id`            | FK → companies      | Empresa dona do registro                       |
| `store_id`              | FK → stores         | Loja que realizou a venda                      |
| `market_place_id`       | FK → market_places  | Shopee, Mercado Livre etc.                     |
| `user_id`               | FK → users          | Quem cadastrou                                 |
| `numero_pedido`         | string              | Número do pedido no marketplace                |
| `data_venda`            | date                | Quando a venda ocorreu                         |
| `valor_bruto`           | decimal             | Soma dos itens vendidos (preço de venda)       |
| `taxa_marketplace`      | decimal (default 0) | Comissão cobrada pelo marketplace              |
| `valor_frete`           | decimal (default 0) | Frete patrocinado ou cobrado                   |
| `valor_liquido`         | decimal             | `valor_bruto - taxa_marketplace - valor_frete` |
| `data_previsao_repasse` | date nullable       | Quando o marketplace promete depositar         |
| `status_id`             | FK → status         | Ativo / Cancelado                              |
| `observacao`            | text nullable       | —                                              |

> **Unique constraint:** `(market_place_id, numero_pedido)` — garante que o mesmo pedido não seja cadastrado duas vezes para o mesmo marketplace.

> **Aqui vai gerar automaticamente quando for salva:**
> 1. Linhas em `venda_itens` (um por produto)
> 2. Linhas em `movimentacoes_estoque` do tipo `saida` (um por item)
> 3. Um registro em `contas_receber` com `valor_liquido` e `previsao_recebimento`

---

### Tabela: `venda_itens` ⬅ GERADA (criada automaticamente junto com a venda)

**O que é:** os produtos que foram vendidos nesse pedido. Mesma lógica de `compra_itens`, mas para saída.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `venda_id` | FK → vendas (cascade delete) | A venda à qual esse item pertence |
| `product_id` | FK → products | Qual produto foi vendido |
| `quantidade` | int | Quantidade vendida |
| `valor_unitario` | decimal | Preço de venda por unidade |
| `valor_total` | decimal | `quantidade × valor_unitario` |

> **Aqui vai gerar vários registros quando:** uma venda tiver múltiplos produtos. Ex: cliente comprou 2 tipos de produto no mesmo pedido → 2 linhas em `venda_itens`.

> **Cascade delete:** se a venda for excluída, os itens vão junto. Atenção: isso deve ser acompanhado de reversão nas `movimentacoes_estoque` e cancelamento da `conta_a_receber` (responsabilidade do Service).

---

## Módulo 5 — Estoque

### Tabela: `ajustes_estoque` ⬅ ALIMENTAÇÃO (o usuário preenche manualmente)

**O que é:** o ponto de entrada para correções manuais de estoque. É usado quando o físico não bate com o sistema: produto quebrou, perda, contagem física revelou diferença, devolução de cliente.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `company_id` | FK → companies | Empresa dona |
| `product_id` | FK → products | Produto ajustado |
| `user_id` | FK → users | Quem fez o ajuste |
| `quantidade` | int | **Positivo = entrada** (ex: devolução), **negativo = saída** (ex: perda, quebra) |
| `motivo` | enum | `perda`, `quebra`, `contagem_fisica`, `devolucao`, `outro` |
| `observacao` | text nullable | Detalhe livre |

> **Aqui vai gerar 1 registro em `movimentacoes_estoque` quando:** o ajuste for salvo. O tipo da movimentação será sempre `ajuste`, e `origem_tipo = 'ajuste_manual'` com `origem_id = id do ajuste`. Isso garante auditoria completa: dá para rastrear exatamente qual ajuste gerou qual movimentação.

---

### Tabela: `movimentacoes_estoque` ⬅ LOG / FONTE DA VERDADE DO ESTOQUE

**O que é:** a tabela mais importante do módulo de estoque. É o **diário completo de tudo que entrou e saiu** de cada produto. O saldo atual de um produto **nunca é um número fixo** — é sempre calculado somando as entradas e subtraindo as saídas desta tabela.

```
Saldo atual do produto X =
  SUM(quantidade WHERE tipo='entrada' AND product_id=X)
- SUM(quantidade WHERE tipo='saida'   AND product_id=X)
+ SUM(quantidade WHERE tipo='ajuste'  AND product_id=X e o ajuste_estoque.quantidade > 0)
- SUM(quantidade WHERE tipo='ajuste'  AND product_id=X e o ajuste_estoque.quantidade < 0)
```

> Na prática isso será uma query ou view que agrupa por `product_id`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `company_id` | FK → companies | Empresa dona |
| `product_id` | FK → products | Produto movimentado |
| `user_id` | FK → users | Quem gerou (ou o sistema) |
| `tipo` | enum | `entrada`, `saida`, `ajuste` |
| `quantidade` | int | **Sempre positivo.** O `tipo` define o efeito no saldo |
| `origem_tipo` | enum | `compra`, `venda`, `ajuste_manual` — identifica de onde veio |
| `origem_id` | bigint | ID do registro de origem (sem FK real, referência lógica) |
| `observacao` | text nullable | — |

> **Aqui vai gerar vários registros quando:**
> - **Uma compra é salva:** 1 linha tipo `entrada` para cada item da compra (`origem_tipo = 'compra'`, `origem_id = compra_id`)
> - **Uma venda é salva:** 1 linha tipo `saida` para cada item da venda (`origem_tipo = 'venda'`, `origem_id = venda_id`)
> - **Um ajuste é salvo:** 1 linha tipo `ajuste` (`origem_tipo = 'ajuste_manual'`, `origem_id = ajuste_estoque_id`)

> **Por que sem FK real em `origem_id`?** Porque o campo aponta para tabelas diferentes conforme o `origem_tipo`. Em vez de 3 FKs condicionais, usamos referência lógica — o mesmo padrão de chave polimórfica, mas sem o overhead do Eloquent MorphTo.

> **Índices criados:**
> - `(product_id, created_at)` — para consultar histórico de um produto em ordem cronológica
> - `(origem_tipo, origem_id)` — para encontrar todas as movimentações de uma compra ou venda específica

---

## Módulo 6 — Financeiro

### Tabela: `contas_pagar` ⬅ ALIMENTAÇÃO + GERADA

**O que é:** tudo que a empresa deve pagar. Pode vir de duas origens:
1. **Automática** — gerada pelo Service de Compra quando uma compra é cadastrada
2. **Manual** — despesa operacional lançada diretamente (aluguel, embalagem, taxa de plataforma, internet)

A diferença entre as duas está no campo `compra_id`: se preenchido, veio de uma compra; se `null`, é lançamento manual.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `company_id` | FK → companies | Empresa dona |
| `user_id` | FK → users | Quem criou |
| `categoria_financeira_id` | FK → categoria_financeiras | Classifica a saída: mercadoria, frete, aluguel, taxa... |
| `forma_pagamento_id` | FK → forma_pagamentos | Como será pago |
| `fornecedor_id` | FK → fornecedores nullable | Vinculado ao fornecedor quando vem de compra |
| `compra_id` | FK → compras nullable | Preenchido quando gerada por compra; `null` = manual |
| `descricao` | string | Descrição do que está sendo pago |
| `valor` | decimal | Valor da parcela |
| `vencimento` | date | Data limite de pagamento |
| `status` | enum | `pendente`, `pago`, `atrasado` |
| `data_pagamento` | date nullable | Preenchido quando status muda para `pago` |
| `observacao` | text nullable | — |

> **Aqui vai gerar vários registros quando:** uma compra for cadastrada parcelada. Ex: compra de R$ 600 em 3x → o Service cria 3 registros em `contas_pagar`, todos com `compra_id` preenchido, cada um com seu vencimento (+30, +60, +90 dias) e valor de R$ 200.

> **Quando `status` muda para `pago`:** esse registro vira uma **saída real** no Fluxo de Caixa. Enquanto está `pendente`, ele entra apenas na **projeção** do fluxo.

> **Índice criado:** `(status, vencimento)` — para consultar rapidamente "o que vence esta semana e ainda está pendente".

---

### Tabela: `contas_receber` ⬅ GERADA (criada automaticamente pela venda)

**O que é:** tudo que a empresa vai receber. Normalmente gerada pelo Service de Venda, mas pode ser lançada manualmente (`venda_id = null`). Armazena a diferença entre o valor bruto do pedido e o valor que o marketplace efetivamente vai depositar.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint PK | — |
| `company_id` | FK → companies | Empresa dona |
| `user_id` | FK → users | Quem criou |
| `market_place_id` | FK → market_places | Qual marketplace vai fazer o repasse |
| `venda_id` | FK → vendas nullable | Venda de origem; `null` = lançamento manual |
| `descricao` | string | Ex: "Repasse pedido #12345" |
| `valor_bruto` | decimal | Total do pedido (o que o cliente pagou) |
| `taxa_marketplace` | decimal (default 0) | Comissão do marketplace |
| `valor_frete` | decimal (default 0) | Frete descontado do repasse |
| `valor_liquido` | decimal | `valor_bruto - taxa_marketplace - valor_frete` |
| `previsao_recebimento` | date | Quando o marketplace prometeu depositar |
| `data_recebimento_real` | date nullable | Quando o depósito efetivamente caiu |
| `status` | enum | `pendente`, `recebido`, `atrasado` |
| `observacao` | text nullable | — |

> **Aqui vai gerar 1 registro quando:** uma venda for salva. O Service calcula o `valor_liquido` e define `previsao_recebimento` com base no prazo do marketplace.

> **Por que guardar `taxa_marketplace` e `valor_frete` separados?** Para detectar divergências. Se o marketplace depositar um valor diferente do `valor_liquido` calculado, dá para comparar campo a campo e identificar qual taxa variou. Isso vai ser a base da conciliação de repasse prevista no roadmap futuro.

> **Quando `status` muda para `recebido`:** esse registro vira uma **entrada real** no Fluxo de Caixa. A diferença entre `previsao_recebimento` e `data_recebimento_real` revela atrasos de repasse.

> **Índice criado:** `(status, previsao_recebimento)` — para projetar o que está previsto para entrar nos próximos dias.

---

## Fluxo de Caixa — VIEW (não é tabela)

O Fluxo de Caixa **não tem tabela própria**. Ele é sempre calculado no momento da consulta a partir de:

```
ENTRADAS REALIZADAS  = contas_receber  WHERE status = 'recebido'  (agrupado por data_recebimento_real)
SAÍDAS REALIZADAS    = contas_pagar    WHERE status = 'pago'       (agrupado por data_pagamento)

ENTRADAS PROJETADAS  = contas_receber  WHERE status = 'pendente'  (agrupado por previsao_recebimento)
SAÍDAS PROJETADAS    = contas_pagar    WHERE status = 'pendente'   (agrupado por vencimento)
```

**Regra de ouro:** saldo real só conta o que foi efetivamente pago ou recebido. O que está pendente vai para a projeção.

---

## Mapa de Dependências — ordem de seeding

Para os seeders funcionarem sem erro de FK, a ordem deve ser:

```
companies          → sem FK
stores             → companies
status             → sem FK
users              → status
market_places      → status
forma_pagamentos   → sem FK
categoria_fin.     → sem FK
fornecedores       → status
products           → status, fornecedores
──── módulo 3 ────
compras            → company, store, fornecedor, user, forma_pagamento, status
compra_itens       → compras, products
──── módulo 4 ────
vendas             → company, store, market_place, user, status
venda_itens        → vendas, products
──── módulo 5 ────
ajustes_estoque    → company, product, user
movimentacoes_est. → company, product, user  (origem_id aponta logicamente para compras/vendas/ajustes)
──── módulo 6 ────
contas_pagar       → company, user, categoria_financeira, forma_pagamento, fornecedor, compras(nullable)
contas_receber     → company, user, market_place, vendas(nullable)
```
