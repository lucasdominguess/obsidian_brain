---
tags: [sellerflow, plano, indice]
status: em-construcao
---

# SellerFlow — Visão Geral

> Documento índice. Conceitual, sem código.
> Aponta para os documentos de cada módulo. Cada módulo terá depois um par:
> `Módulo X - Nome - explicação` (a ideia) e `Módulo X - Nome - código` (a implementação, criado só na hora de codar).

---

## 1. O que é o sistema

Ferramenta interna de gestão para um seller pequeno de marketplaces (foco Shopee). **Não substitui o painel da Shopee** — substitui as planilhas que o lojista usa hoje para responder três perguntas:

1. **O que eu tenho?** — quanto de cada produto está em estoque.
2. **O que vou receber e o que preciso pagar?** — contas em aberto, datas e valores.
3. **Quanto sobra no fim do mês?** — fluxo de caixa real (entrou × saiu).

**Ideia central:** toda movimentação operacional (compra ou venda) gera **automaticamente** impacto em estoque e em financeiro. O lojista lança a operação **uma vez**; o sistema cuida das consequências.

```
COMPRA ou VENDA  (o evento que o usuário registra)
       │
       ├── Efeito no ESTOQUE     → entra ou sai produto
       └── Efeito no FINANCEIRO  → cria conta a pagar ou a receber
                                       │
                                       └── quando paga/recebe → vira FLUXO DE CAIXA real
```

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Backend / API | **PHP 8.2+ / Laravel 11** (API REST versionada `/api/v1`) |
| Frontend | **Vue.js** (SPA consumindo a API) |
| Banco | **PostgreSQL** |
| Cache / sessão | Redis |
| Build front | Vite |
| Deploy | Docker (multi-stage) |

> ⚠️ **Divergência a corrigir:** o `CLAUDE.md` do projeto ainda diz *MariaDB + Blade + Vanilla JS*. A stack real agora é *PostgreSQL + Vue.js*. Atualizar o `CLAUDE.md` quando der.

**Fluxo canônico do backend** (padrão inegociável do projeto):
`FormRequest → CommandDTO → Service → Repository → ResponseDTO`

---

## 3. Mapa dos módulos

| Módulo | Nome | Status | Documento |
|---|---|---|---|
| 1 | Contas e perfis | ✅ construído | (tabelas: `users`, `roles`, `stores`, `companies`, `user_stores`, `market_places`) |
| 2 | Cadastros auxiliares | 🟡 quase | (tabelas: `products`, `fornecedores`, `categoria_financeiras`, `forma_pagamentos`) |
| 3 | Compra | ⬜ a construir | [[Módulo 3 - Compra - explicação]] |
| 4 | Venda | ⬜ a construir | [[Módulo 4 - Venda - explicação]] |
| 5 | Estoque | ⬜ a construir | [[Módulo 5 - Estoque - explicação]] |
| 6 | Financeiro | ⬜ a construir | [[Módulo 6 - Financeiro - explicação]] |

---

## 4. O que já existe no banco (não mexer agora)

**Módulo 1 — Contas e perfis**
- `status` — lista genérica de status (id, name).
- `roles` — perfis (admin / operacional / financeiro).
- `users` — login.
- `companies` — empresa dona da(s) loja(s).
- `stores` — loja (vinculada a `market_places` e `companies`).
- `user_stores` / `company_users` — vínculos N:N.
- `market_places` — Shopee, ML, etc. **Tem `taxa_percentual` e `taxa_fixa`** → vamos usar isso para calcular o valor líquido da venda automaticamente (ver Módulo 4).

**Módulo 2 — Cadastros auxiliares**
- `products` — sku, name, marca, description, `price_unit`, `price_box`, `status_id`, `fornecedor_id`. **Sem custo** (correto para o MVP).
- `fornecedores` — dados do fornecedor.
- `categoria_financeiras` — classifica saídas (aluguel, embalagem, taxa…). Usada no Módulo 6.
- `forma_pagamentos` — PIX, boleto, cartão…

---

## 5. Lacunas detectadas (o que falta antes de seguir)

1. **Categoria de produto não existe.** O plano previa, mas não há tabela nem coluna `categoria_produto_id` em `products`. Decidir: criar agora ou deixar pro futuro? (Sugestão: criar, é barato e organiza os relatórios de estoque.)
2. **Módulos 3 a 6 não têm nenhuma tabela.** É o foco deste plano.
3. **`forma_pagamentos` não tem `timestamps` nem `status_id`** (as outras auxiliares têm). Inconsistência leve, opcional corrigir.
4. **Escopo de propriedade — tudo pertence à EMPRESA, não à loja.** As tabelas novas (compras, vendas, movimentações de estoque, contas a pagar/receber) nascem com **`company_id`** (→ `companies`). Motivo: uma empresa pode ter várias lojas/marketplaces, mas o estoque físico e o caixa são **da empresa**, compartilhados entre os canais. A venda registra *em qual loja/marketplace* ocorreu, mas a baixa de estoque e a conta a receber pertencem à empresa.
5. **`products.fornecedor_id`** amarra um produto a **um** fornecedor. A compra também aponta o fornecedor. Não é erro — só lembrar que a "verdade" do fornecedor de uma compra é a compra, não o cadastro do produto.

---

## 6. Decisões do MVP (já fechadas)

| Tema | Decisão |
|---|---|
| Escopo financeiro | Contas a pagar/receber + fluxo de caixa |
| **Parcelamento / receita a prazo** | **ABSTRAÍDO nesta fase.** Cada compra gera **1** conta a pagar; cada venda gera **1** conta a receber. Parcelas ficam pro futuro. |
| Custo do produto / margem | Não calcular |
| Canais de venda | Só marketplaces |
| Multi-loja | Estoque e financeiro pertencem à **empresa** (`company_id`). Uma empresa pode ter várias lojas/marketplaces; o estoque é compartilhado. Telas multi-loja podem vir depois, mas a modelagem já é por empresa. |
| Integração Shopee | Fora — vendas e compras entram manualmente |

---

## 7. Convenção dos nomes neste plano

Para facilitar seu entendimento, os docs conceituais usam **nomes em português** (`compras`, `itens_compra`, `movimentacoes_estoque`…). Na hora de codar você decide se mantém PT ou traduz para inglês (o restante do banco está em inglês). Isso fica para o documento `- código` de cada módulo.

---

## 8. Ordem sugerida de construção

```
Módulo 5 (Estoque)  →  é a base. Compra e venda escrevem nele.
        ↓
Módulo 6 (Financeiro) → tabelas de contas a pagar/receber.
        ↓
Módulo 3 (Compra) → junta itens + escreve estoque + gera conta a pagar.
        ↓
Módulo 4 (Venda)  → junta itens + escreve estoque + gera conta a receber.
```

> Construir **estoque e financeiro primeiro** (as "consequências"), depois compra e venda (os "eventos" que disparam as consequências). Assim, quando você for fazer a compra, o lugar onde ela escreve já existe.
