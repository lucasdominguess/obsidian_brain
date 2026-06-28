---
tags: [sellerflow, plano, modulo-4, venda]
status: conceitual
indice: "[[00 - SellerFlow - Visão Geral]]"
---

# Módulo 4 — Venda (explicação conceitual)

> Espelho da compra. Depende de [[Módulo 5 - Estoque - explicação]] e [[Módulo 6 - Financeiro - explicação]].

---

## 1. O que é uma venda

Registro de **saída de mercadoria** vendida num marketplace. Mesma forma da compra (cabeçalho + itens), mas com uma diferença crucial: **o valor que cai na sua conta não é o valor da venda.** O marketplace desconta taxa e, às vezes, frete antes de repassar.

```
VENDA (cabeçalho)
  ├── item: Produto A · 2 unid · R$ 30,00  →  bruto R$ 60,00
  └── item: Produto B · 1 unid · R$ 45,00  →  bruto R$ 45,00
                                              ───────────────
                                bruto total =  R$ 105,00
                                − taxa marketplace (ex. 12%) = − R$ 12,60
                                − frete patrocinado          = −  R$ 8,00
                                              ───────────────
                                LÍQUIDO a receber =  R$ 84,40   ← isto vira a conta a receber
```

---

## 2. Duas tabelas: cabeçalho + itens

**`vendas`** (o cabeçalho)

| Coluna | O que guarda |
|---|---|
| `id` | — |
| `marketplace_id` | onde vendeu (→ `market_places`) |
| `numero_pedido` | nº do pedido no marketplace (ex. SHP123) |
| `data_venda` | quando |
| `valor_bruto` | soma dos itens |
| `valor_taxas` | taxa do marketplace (calculável a partir de `market_places.taxa_percentual` + `taxa_fixa`) |
| `valor_frete` | frete patrocinado / desconto de envio |
| `valor_liquido` | `bruto − taxas − frete` → o que realmente entra |
| `previsao_repasse` | quando o marketplace deposita |
| `status` | `rascunho` \| `confirmada` \| `cancelada` |
| `company_id` | de qual **empresa** é a venda (→ `companies`) |

**`itens_venda`** (as linhas)

| Coluna | O que guarda |
|---|---|
| `id` | — |
| `venda_id` | a qual venda pertence (→ `vendas`) |
| `produto_id` | qual produto (→ `products`) |
| `quantidade` | quantas unidades |
| `valor_unitario` | preço de venda por unidade |

---

## 3. Ideia relevante: aproveitar a taxa já cadastrada

A tabela `market_places` **já tem** `taxa_percentual` e `taxa_fixa`. Use isso: ao montar a venda, o sistema **sugere** o valor de taxas automaticamente:

```
valor_taxas sugerido = valor_bruto × (taxa_percentual / 100) + taxa_fixa
```

O usuário pode **ajustar** (a taxa real varia por categoria/promoção na Shopee), mas começar com a sugestão economiza digitação e erro. Guarde o valor **efetivo** na venda, não recalcule depois a partir do percentual — a taxa do cadastro pode mudar e bagunçaria vendas antigas.

---

## 4. O `status` dispara os efeitos (igual à compra)

```
RASCUNHO ──(usuário clica "Confirmar")──▶ CONFIRMADA
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                     ▼
            EFEITO 1: ESTOQUE                                  EFEITO 2: FINANCEIRO
   p/ cada item: cria movimentação                   cria 1 conta_a_receber com o
   tipo=saida (−quantidade)                           VALOR LÍQUIDO e a previsão de repasse
```

---

## 5. O fluxo no código (conceito)

Em transação, mesmo padrão da compra:

```
VendaService::confirmar(dados validados)   ← DB::transaction()
   │
   ├─ 1. cria a venda (cabeçalho) + os itens
   │       (calcula valor_bruto, taxas, valor_liquido)
   │
   ├─ 2. para cada item:
   │       movimentacoes_estoque.criar(
   │          tipo = saida,
   │          quantidade = item.quantidade,
   │          origem_tipo = 'venda', origem_id = venda.id
   │       )
   │
   └─ 3. contas_a_receber.criar(
            valor = venda.valor_liquido,          ← líquido, não bruto!
            previsao_recebimento = venda.previsao_repasse,
            origem_tipo = 'venda', origem_id = venda.id
         )
```

> **O erro clássico:** criar a conta a receber com o valor **bruto**. Aí o fluxo de caixa fica otimista e nunca bate com o extrato do banco. **Sempre o líquido.**

---

## 6. Venda sem estoque?

Pode acontecer de vender algo que o sistema acha que está zerado (pré-venda, ou compra não lançada ainda). Conforme [[Módulo 5 - Estoque - explicação]] §7, a sugestão é **permitir** (saldo fica negativo) **com aviso** — em vez de bloquear a venda. O negativo vira um lembrete de "lance a compra que faltou".

---

## 7. Cancelamento

Espelho da compra. Em transação:
1. `status` → `cancelada`;
2. movimentações de estoque **inversas** (entrada do que tinha saído — o produto "volta");
3. cancela a conta a receber, se ainda não recebida.

---

## 8. Abstração desta fase

- **Sem parcelas / receita a prazo.** Uma venda → **1** conta a receber.
- **Sem conciliação de repasse** (comparar o que o marketplace *previu* com o que *depositou*). Por isso `previsao_repasse` × `recebido_em` já ficam separados — quando você implementar conciliação no futuro, os dados já existem.
- **Sem integração Shopee.** A venda é digitada à mão. No futuro, a tela vira "conferir e confirmar" venda importada, mas a estrutura é a mesma.

---

## 9. O que o módulo entrega nas telas

1. **Nova venda** — marketplace, nº pedido, itens, taxas (sugeridas), previsão de repasse, confirmar.
2. **Lista de vendas** — filtro por marketplace/período/status.
3. **Detalhe da venda** — cabeçalho (bruto/taxas/líquido) + itens + link para a conta a receber e as saídas de estoque.

---

## 10. Resumo de uma frase

> Venda é **cabeçalho + itens** como a compra, mas ao **confirmar** ela dá **saída no estoque** e cria **uma conta a receber pelo valor LÍQUIDO** (bruto menos taxas e frete), com a data prevista de repasse.

⬅️ Voltar ao [[00 - SellerFlow - Visão Geral|índice]]
