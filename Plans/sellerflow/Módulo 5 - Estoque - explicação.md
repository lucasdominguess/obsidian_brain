---
tags: [sellerflow, plano, modulo-5, estoque]
status: conceitual
indice: "[[00 - SellerFlow - Visão Geral]]"
---

# Módulo 5 — Estoque (explicação conceitual)

> Construir **primeiro**. Compra e venda escrevem aqui. Sem este módulo, os outros não têm onde gravar entrada/saída.

---

## 1. A grande ideia: estoque não é um número, é um histórico

A tentação natural é ter uma coluna `quantidade_em_estoque` no produto e ir somando/subtraindo. **Não faça isso.** Esse número guardado *desincroniza* (um bug, um lançamento concorrente, um cancelamento mal feito) e você nunca mais sabe a verdade.

A abordagem correta:

> **O saldo de um produto é sempre o resultado da soma de todas as suas movimentações.**

Você guarda os **eventos** (entrou 10, saiu 3, ajustou -1). O saldo (6) é **calculado** quando precisa. Se algo der errado, você lê o histórico e entende exatamente o que aconteceu. É auditável por natureza.

---

## 2. A única tabela de verdade: `movimentacoes_estoque`

Cada linha é **um evento** que mexeu no estoque de **um** produto.

| Coluna | O que guarda | Exemplo |
|---|---|---|
| `id` | — | 1 |
| `produto_id` | qual produto | 42 |
| `tipo` | `entrada` \| `saida` \| `ajuste` | entrada |
| `quantidade` | sempre **positivo**; o `tipo` define o sinal | 10 |
| `origem_tipo` | de onde veio: `compra` \| `venda` \| `ajuste_manual` | compra |
| `origem_id` | id do documento que gerou (a compra nº 7) | 7 |
| `observacao` | texto livre (usado no ajuste manual) | "quebra no transporte" |
| `company_id` | de qual **empresa** é o estoque (→ `companies`) | 1 |
| `created_at` | quando | 2026-05-28 |

> **Decisão de escopo — estoque pertence à EMPRESA, não à loja.** Uma empresa pode vender o mesmo produto em várias lojas/marketplaces (Shopee, ML…), mas o estoque físico é **um só**. Por isso a movimentação aponta `company_id`, não `loja_id`. A venda registra *em qual loja* vendeu (Módulo 4), mas a baixa sai do estoque **da empresa**.

**Por que `origem_tipo` + `origem_id`?** É um vínculo polimórfico simples: permite rastrear *toda* movimentação até sua causa. Olhando uma linha de saída você sabe que ela veio da venda nº 15. Se a venda for cancelada, você sabe qual movimentação reverter.

> A movimentação é **imutável**: nunca se edita nem se apaga. Errou? Cria uma movimentação de correção (igual lançamento contábil). Isso preserva a auditoria.

---

## 3. Como calcular o saldo

O saldo de um produto é a soma com sinal:

```
saldo = Σ(entradas) − Σ(saídas) ± (ajustes)
```

Conceitualmente (pseudo-SQL só para ilustrar a regra — o código fica no doc `- código`):

```
entrada → soma
saida   → subtrai
ajuste  → soma um valor que pode ser positivo OU negativo
```

> **Decisão sobre o `ajuste`:** há dois jeitos. (a) `ajuste` sempre soma e a `quantidade` pode ser negativa; ou (b) `quantidade` é sempre positiva e você cria dois subtipos (`ajuste_entrada` / `ajuste_saida`). **Recomendo (b)** — mantém a regra "quantidade nunca é negativa" para todos os tipos, fica mais simples de validar e de exibir.

---

## 4. Os três tipos de movimentação

| Tipo | Sinal | Quem gera | Quando |
|---|---|---|---|
| **entrada** | `+` | Módulo 3 (Compra) | ao confirmar uma compra |
| **saida** | `−` | Módulo 4 (Venda) | ao confirmar uma venda |
| **ajuste** | `±` | Tela de ajuste manual | perda, quebra, contagem física, acerto de divergência |

O **ajuste manual** é a única movimentação que o usuário cria diretamente. As outras duas são **consequência automática** de compra/venda — o usuário nunca mexe em `movimentacoes_estoque` na mão por causa de uma venda.

---

## 5. O que o módulo entrega nas telas

1. **Saldo atual por produto** — uma listagem: produto, saldo calculado. (É a pergunta "o que eu tenho?".)
2. **Extrato de um produto** — o histórico de movimentações daquele produto, em ordem de data, com origem. (É a auditoria.)
3. **Tela de ajuste manual** — formulário simples: produto, tipo (entrada/saída de ajuste), quantidade, observação obrigatória.
4. **(Opcional MVP) Alerta de estoque mínimo** — produto com saldo abaixo de um limite. Exige uma coluna `estoque_minimo` em `products`. Pode ficar pra depois.

---

## 6. Performance: e se ficar lento somar tudo toda hora?

No MVP, com volume pequeno, **somar as movimentações é instantâneo** — não otimize antes da hora. Se um dia o histórico ficar gigante, a saída é uma das duas, **não agora**:
- uma coluna `saldo_cache` no produto, atualizada a cada movimentação (mais rápido, menos seguro);
- uma *materialized view* do PostgreSQL com o saldo, atualizada periodicamente.

Anote como ideia futura e siga com a soma pura.

---

## 7. Regras de negócio importantes

- **Pode vender sem estoque?** Decisão sua. Para um seller que às vezes vende em pré-venda, talvez sim (saldo fica negativo e serve de alerta). Para evitar erro de cadastro, talvez não (bloqueia a venda). **Sugestão MVP:** *permitir* saldo negativo, mas mostrar aviso em vermelho — é mais flexível e o negativo vira um sinal de "lance a compra que faltou".
- **Cancelamento de compra/venda** gera uma movimentação **inversa** (não apaga a original).
- Toda movimentação **nasce de uma transação** junto com o documento de origem (a entrada de estoque e a compra são gravadas no mesmo `DB::transaction()` — ver Módulo 3).

---

## 8. Resumo de uma frase

> Estoque é uma **tabela de eventos imutáveis** (`movimentacoes_estoque`); o saldo é **sempre calculado**, nunca guardado; compra e venda **escrevem** aqui automaticamente, e o ajuste manual é o único lançamento feito à mão.

➡️ Próximo: [[Módulo 6 - Financeiro - explicação]]
