# ADR 0001: Saldo de estoque materializado (`stock_balances`) com recompute-on-write

**Data:** 2026-06-11
**Status:** Aceito
**Projeto:** SellerFlow (Módulo 5 — Estoque)
**Relacionado:** [[plan-otimizacao-stock-check-quantity]]

## 1. O Contexto e o Problema

A listagem de saldo (`StockRepository::checkQuantityProductsInStock`) recalculava o saldo de **todo** o catálogo a cada request, somando o histórico inteiro de `movimentacoes_estoque` (tabela append-only que tende a ser a maior do sistema) e, pior, executando uma **subquery correlacionada por produto** (`last_adjustment_user`) contra uma tabela sem índice. Padrão *event-sourcing sem snapshot*: custo cresce de forma não-linear com o volume. Além disso a leitura não era paginada (`->get()` no catálogo inteiro).

## 2. A Decisão

Materializar o saldo em uma tabela `stock_balances` (uma linha por `company_id + product_id`, com os 4 totais, `saldo_atual` e `last_adjustment_user_id` denormalizado) e mantê-la via **recompute-on-write**:

- Um **`StockObserver`** (eventos `created` / `updated` / `deleted` do model `Stock`) chama `StockBalanceRepository::recomputeFor(companyId, productId)`.
- `recomputeFor` **recalcula do zero** o saldo daquele único produto (agregação escopada a 1 produto, usando o índice `(product_id, ...)`) e faz upsert; se o produto ficou sem movimentações, remove a linha.
- A leitura (`paginate`) vira um scan simples de `stock_balances` + joins por PK, paginável via `ApiResponse::paginated`.
- Comando **`stock:rebuild-balances`** reconstrói tudo (backfill inicial e reparo).

**Por que recompute-on-write em vez de deltas incrementais:** recalcular o produto afetado é idempotente e **robusto a update/delete** de movimentação (não precisa reverter valores antigos); sempre converge para a fonte de verdade. O custo extra de escrita é uma agregação escopada a 1 produto (indexada), aceitável para o volume de um seller único.

**Por que não um snapshot periódico (cron):** o saldo de estoque precisa ser sempre exato; um snapshot defasado mostraria estoque errado. O recompute-on-write mantém consistência em tempo real.

## 3. As Consequências (Trade-offs)

**Positivas:**
- Leitura O(1) por produto; sem subquery correlacionada nem varredura do histórico completo.
- Paginação real no endpoint `/stock-check-quantity`.
- `recomputeFor` reutilizável; `stock:rebuild-balances` dá um caminho de reparo confiável.
- Coberto por testes (`tests/Feature/Stock/StockBalanceTest.php`).

**Negativas / riscos:**
- **Custo de escrita:** cada movimentação dispara uma agregação. Escopada a 1 produto e indexada — ok no volume atual; reavaliar se a escrita ficar quente.
- **Concorrência:** dois recomputes simultâneos do mesmo produto podem competir (último a commitar vence com o valor recalculado completo). Risco baixo no contexto (ferramenta de seller único); `stock:rebuild-balances` é a rede de segurança. Se necessário, evoluir para lock de linha.
- **Fonte de verdade dupla:** `stock_balances` é derivada; depende do observer estar registrado. Mitigado pelo comando de rebuild e pelos testes.
- **Deploy:** o backfill (`stock:rebuild-balances`) precisa rodar após o deploy da migration em ambientes com dados.

> O "ponto de atenção semântico" (movimento `ajuste` sem origem manual casável some dos somatórios) foi **preservado** tal como no comportamento anterior — está documentado em [[plan-otimizacao-stock-check-quantity]] para tratamento separado (CHECK constraint / denormalização do sinal).
