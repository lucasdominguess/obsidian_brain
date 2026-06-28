---
tags: [sellerflow, plano, modulo-3, compra]
status: conceitual
indice: "[[00 - SellerFlow - Visão Geral]]"
---

# Módulo 3 — Compra (explicação conceitual)

> Depende de [[Módulo 5 - Estoque - explicação]] e [[Módulo 6 - Financeiro - explicação]] já existirem (é onde a compra escreve).

---

## 1. O que é uma compra

É o registro de **entrada de mercadoria** que você comprou de um fornecedor. Tem a mesma forma de uma nota: um **cabeçalho** (de quem, quando) e uma **lista de itens** (o quê, quanto, por quanto).

```
COMPRA (cabeçalho)
  ├── item: Produto A · 10 unid · R$ 5,00
  ├── item: Produto B ·  4 unid · R$ 12,00
  └── item: Produto C · 20 unid · R$ 2,50
```

---

## 2. Duas tabelas: cabeçalho + itens

**`compras`** (o cabeçalho)

| Coluna | O que guarda |
|---|---|
| `id` | — |
| `fornecedor_id` | de quem (→ `fornecedores`) |
| `numero_nota` | nº da nota fiscal (opcional) |
| `data_compra` | quando comprou |
| `valor_total` | soma dos itens (pode ser calculado, mas guardar ajuda nas listagens) |
| `forma_pagamento_id` | como vai pagar (→ `forma_pagamentos`) |
| `vencimento` | quando vence a conta a pagar (nesta fase, **um só**) |
| `status` | `rascunho` \| `confirmada` \| `cancelada` |
| `company_id` | de qual **empresa** é a compra (→ `companies`) |
| `created_at` | — |

**`itens_compra`** (as linhas)

| Coluna | O que guarda |
|---|---|
| `id` | — |
| `compra_id` | a qual compra pertence (→ `compras`) |
| `produto_id` | qual produto (→ `products`) |
| `quantidade` | quantas unidades |
| `valor_unitario` | preço pago por unidade |

> O `valor_unitario` fica **no item**, não no produto. O preço de compra varia a cada compra; o produto só guarda preço de venda.

---

## 3. O `status` é o gatilho dos efeitos

Uma compra começa como **rascunho** (você está montando, ainda não mexe em nada). Quando você **confirma**, ela dispara os dois efeitos. Isso evita que uma compra meio-preenchida já bagunce o estoque.

```
RASCUNHO ──(usuário clica "Confirmar")──▶ CONFIRMADA
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                     ▼
            EFEITO 1: ESTOQUE                                  EFEITO 2: FINANCEIRO
   p/ cada item: cria movimentação                   cria 1 conta_a_pagar com o
   tipo=entrada (+quantidade)                         valor_total e o vencimento
```

> Para o MVP você pode simplificar e nem ter "rascunho" — a compra já nasce confirmada ao salvar. Mas ter o status deixa a porta aberta e é barato. Sua escolha.

---

## 4. O fluxo no código (conceito, sem implementar)

Tudo dentro de **uma transação** (`DB::transaction()`), seguindo o fluxo canônico do projeto (`FormRequest → DTO → Service → Repository → DTO`):

```
CompraService::confirmar(dados validados)   ← DB::transaction()
   │
   ├─ 1. cria a compra (cabeçalho) + os itens
   │
   ├─ 2. para cada item:
   │       movimentacoes_estoque.criar(
   │          tipo = entrada,
   │          quantidade = item.quantidade,
   │          origem_tipo = 'compra', origem_id = compra.id
   │       )
   │
   └─ 3. contas_a_pagar.criar(
            valor = compra.valor_total,
            vencimento = compra.vencimento,
            origem_tipo = 'compra', origem_id = compra.id,
            categoria_financeira = "Compra de mercadoria"
         )
```

**Por que transação?** Se gravar a compra e o estoque mas falhar na conta a pagar, você fica com estoque entrado e nenhuma dívida registrada — dado inconsistente. A transação garante: **ou tudo grava, ou nada grava.**

---

## 5. Abstração desta fase

- **Sem parcelamento.** A compra gera **1** conta a pagar com **1** vencimento, mesmo que a `forma_pagamento` teoricamente permita 3x. (Quando implementar parcelas: o passo 3 vira um loop que cria N contas. Estrutura não muda — ver [[Módulo 6 - Financeiro - explicação]] §7.)
- **Sem custo médio / margem.** A compra registra quanto pagou, mas o sistema **não** recalcula custo do produto nesta versão.

---

## 6. Cancelamento

Cancelar uma compra confirmada **não apaga** nada. Em transação:
1. muda `status` para `cancelada`;
2. cria movimentações de estoque **inversas** (saída do que tinha entrado);
3. cancela a conta a pagar (`status = cancelado`), se ainda não foi paga.

> Se a conta **já foi paga**, cancelar fica mais delicado (o dinheiro já saiu). No MVP, pode-se **bloquear** o cancelamento de compra cuja conta já está paga e exigir um ajuste manual. Decisão sua.

---

## 7. O que o módulo entrega nas telas

1. **Nova compra** — escolher fornecedor, adicionar itens (produto + qtd + valor), definir vencimento/forma de pagamento, confirmar.
2. **Lista de compras** — com filtro por fornecedor/período/status.
3. **Detalhe da compra** — cabeçalho + itens + link para a conta a pagar gerada e para as movimentações de estoque.

---

## 8. Resumo de uma frase

> Compra é **cabeçalho + itens**; ao **confirmar**, dentro de uma transação ela gera **entrada de estoque** para cada item e **uma conta a pagar** com o total — sem parcelas nesta fase.

➡️ Próximo: [[Módulo 4 - Venda - explicação]]
