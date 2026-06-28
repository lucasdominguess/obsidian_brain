---
tags: [sellerflow, plano, modulo-6, financeiro]
status: conceitual
indice: "[[00 - SellerFlow - Visão Geral]]"
---

# Módulo 6 — Financeiro (explicação conceitual)

> Construir **junto/depois do estoque**, antes de compra e venda. Compra grava aqui uma conta a pagar; venda grava uma conta a receber.

---

## 1. A grande ideia: separar "deve acontecer" de "aconteceu"

O financeiro vive de uma distinção que confunde todo mundo no começo:

- **"Vendi" não é "recebi".** Vendi hoje, o marketplace repassa daqui a 15 dias.
- **"Comprei" não é "paguei".** Comprei a prazo, pago no dia 30.

Por isso o financeiro tem **duas camadas**:

```
1. CONTAS (a pagar / a receber)  → o compromisso. Tem vencimento e status.
        │
        │  quando o status vira "pago" / "recebido"...
        ▼
2. FLUXO DE CAIXA                 → o dinheiro que REALMENTE entrou/saiu.
```

A regra de ouro: **fluxo de caixa só conta o que foi efetivamente pago/recebido.** O que está pendente vai pra *projeção*, não pro saldo real.

---

## 2. Tabela `contas_a_pagar`

Tudo que a loja **deve**: compras de mercadoria + despesas operacionais.

| Coluna | O que guarda |
|---|---|
| `id` | — |
| `descricao` | "Compra nº 7 - Fornecedor X" ou "Aluguel maio" |
| `valor` | quanto |
| `vencimento` | data limite para pagar |
| `pago_em` | data real do pagamento (null = ainda pendente) |
| `status` | `pendente` \| `pago` \| `cancelado` |
| `categoria_financeira_id` | classifica a saída (→ `categoria_financeiras`, já existe) |
| `fornecedor_id` | opcional (→ `fornecedores`) |
| `forma_pagamento_id` | opcional (→ `forma_pagamentos`) |
| `origem_tipo` / `origem_id` | `compra` + id, OU null se for despesa manual |
| `company_id` | de qual **empresa** é a conta (→ `companies`) |

**Duas origens:**
- **Automática** — criada pelo Módulo 3 quando uma compra é confirmada.
- **Manual** — o usuário lança uma despesa que não é compra de produto (aluguel, embalagem, internet, taxa avulsa). Aqui a `categoria_financeira` é o que dá sentido ao relatório.

> O "custo operacional" que aparecia solto no diagrama antigo **não é um módulo** — é só uma **categoria financeira** dentro de contas a pagar. Não criar caixinha separada.

---

## 3. Tabela `contas_a_receber`

Tudo que a loja **tem a receber** (no MVP, repasses de marketplace).

| Coluna | O que guarda |
|---|---|
| `id` | — |
| `descricao` | "Venda pedido #SHP123" |
| `valor` | **valor líquido** (já descontadas as taxas — ver Módulo 4) |
| `previsao_recebimento` | data prevista do repasse |
| `recebido_em` | data real (null = pendente) |
| `status` | `pendente` \| `recebido` \| `cancelado` |
| `origem_tipo` / `origem_id` | `venda` + id, OU null se receita manual |
| `company_id` | de qual **empresa** é a conta (→ `companies`) |

> **Previsão × real:** a diferença entre `previsao_recebimento` e `recebido_em` é informação valiosa (mostra atraso do marketplace). Por isso são duas colunas, não uma.

---

## 4. O status é o coração do módulo

```
PENDENTE ──(usuário marca como pago/recebido)──▶ PAGO / RECEBIDO
   │                                                  │
   │ ainda NÃO entra no caixa real                    │ AGORA entra no caixa real
   │ (aparece só na projeção)                         │ (aparece no realizado)
```

Marcar como pago/recebido é a ação que **transforma um compromisso em movimento de caixa**. No código, é só preencher `pago_em` / `recebido_em` e mudar o `status`. Não precisa de outra tabela para o caixa (ver abaixo).

---

## 5. Fluxo de caixa NÃO é uma tabela

É uma **visão calculada** montada a partir das duas tabelas de contas. Tem duas faces:

**a) Realizado** — o que de fato moveu:
```
ENTRADAS = contas_a_receber WHERE recebido_em ENTRE [início, fim]
SAÍDAS   = contas_a_pagar    WHERE pago_em     ENTRE [início, fim]
saldo do período = Σ entradas − Σ saídas
```

**b) Projeção** — o que deve mover nos próximos N dias:
```
ENTRADAS PREVISTAS = contas_a_receber WHERE status = pendente E previsao_recebimento ≤ hoje+N
SAÍDAS PREVISTAS   = contas_a_pagar    WHERE status = pendente E vencimento          ≤ hoje+N
saldo projetado = saldo atual + previstas a receber − previstas a pagar
```

> Por que não guardar o caixa numa tabela? Porque ele é **100% derivável** das contas. Guardar seria duplicar dado e arriscar divergência — mesma filosofia do saldo de estoque ([[Módulo 5 - Estoque - explicação]]).

---

## 6. O que o módulo entrega nas telas

1. **Lista de contas a pagar** — com filtro por status e período; botão "marcar como pago".
2. **Lista de contas a receber** — idem; botão "marcar como recebido".
3. **Lançar despesa manual** — formulário: descrição, valor, vencimento, categoria.
4. **Fluxo de caixa** — painel com realizado do período + projeção dos próximos N dias + saldo.

---

## 7. Abstração desta fase (importante)

Conforme combinado, **parcelamento / receita a prazo está fora agora**:
- Cada compra → **1** conta a pagar (um vencimento só).
- Cada venda → **1** conta a receber (uma previsão só).

Quando for implementar parcelas no futuro, a mudança é: a compra/venda passa a gerar **N** contas (uma por parcela) com vencimentos calculados pela `forma_pagamento`. A estrutura das tabelas acima **já aguenta isso** sem alteração — só muda quantas linhas são criadas. Por isso não há retrabalho em abstrair agora.

---

## 8. Resumo de uma frase

> O financeiro tem **duas tabelas de compromissos** (`contas_a_pagar`, `contas_a_receber`) com status; **marcar como pago/recebido** é o que vira dinheiro real; e o **fluxo de caixa é uma visão calculada** dessas contas, dividida em *realizado* e *projeção*.

➡️ Próximo: [[Módulo 3 - Compra - explicação]]
