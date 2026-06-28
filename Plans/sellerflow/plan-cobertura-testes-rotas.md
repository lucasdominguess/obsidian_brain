---
tags: [sellerflow, plano, testes, qa]
status: CONCLUÍDO (tópicos 1–7)
criado: 2026-06-19
concluido: 2026-06-19
---

# Blueprint: Cobertura de testes das rotas faltantes

> ✅ **CONCLUÍDO (todos os tópicos).** Suíte: **194 passando / 0 falhando / 0 skipped** rodando contra **Postgres** (ver "Ambiente de testes" abaixo). Relacionado: [[SellerFlow-API]].

## Ambiente de testes (Postgres, idêntico à produção)
- Os testes rodam no **mesmo engine da produção** (Postgres), via `docker-compose.yml` (serviço `pgsql-test`, porta host **5433**, DB `sellerflow_test`). O banco de dev/prod é remoto (Supabase); este Postgres é só para a suíte.
- `phpunit.xml` aponta para esse Postgres. **Fluxo:** `docker compose up -d` → `php artisan test` → (`docker compose down` para encerrar).
- Antes a suíte rodava em SQLite `:memory:` (rápido, mas engine diferente) → 9 testes ficavam `markTestSkipped` (view FIFO, `date_trunc`, `ilike`). Em Postgres eles **rodam e passam**. Os guards `markTestSkipped` ficaram como rede de segurança (no-op em pgsql).
- **Lição:** rodar no engine real expôs um teste frágil (assertava `company_id => 1` hardcoded). No SQLite `:memory:` o autoincrement zera a cada teste; no Postgres as **sequences não voltam no rollback** do `RefreshDatabase`. Correção: nunca assumir ids de sequence — usar `assertDatabaseCount` ou o id dinâmico do model.
- **Pendente (opcional):** CI (GitHub Actions com serviço Postgres) — decidido "só local por ora". E o teste de concorrência do `lockForUpdate` (precisa de 2 conexões simultâneas) ou uma constraint `CHECK (saldo_atual >= 0)` como rede de segurança.

## Resultado por tópico
- ✅ Pré-tarefa: helpers `actingAsJwt()` e `actingAsCompanyJwt()` em `tests/Pest.php`.
- ✅ T1 Auth · ✅ T2 Vendas&Compras · ✅ T3 Business · ✅ T4 Account · ✅ T5 Stock&Adjustment · ✅ T6 Finance · ✅ T7 ListSuspended.
- T7 (`GET /list`): rota pública, `params` validado (`in:`), filtro por `name` usa `ilike` (skip em SQLite). Nenhum bug de produção encontrado aqui.

## Bugs reais de produção encontrados e corrigidos durante a cobertura
Quase todos da mesma família: **DTO compartilhado entre create/update sem tolerar campos ausentes** e **`->constrained()->nullable()/->default()` que não aplica na coluna** (o método volta a FK, não a coluna).

1. **`users.status_id` / `companies.status_id`** sem default efetivo → corrigido com `$attributes` no model (User, Company) + remoção do default do DTO (UserDTO, CompanyDTO).
2. **`products.fornecedor_id` NOT NULL** apesar de opcional → migration `fix_fornecedor_id_nullable_in_products_table`.
3. **`account_payables.categoria_financeira_id` / `forma_pagamento_id` NOT NULL** apesar de opcionais → migration `fix_nullable_fks_in_account_payables_table`.
4. **`AccountPayable`/`AccountReceivable` sem default em memória** (status/origem_tipo) → `$attributes` nos models (criar conta sem status dava 500 no ResponseDTO).
5. **`StoreDTO` / `UserStoreDTO`** quebravam em update parcial (params não-nullable) → nullable + `array_filter`.
6. **`StoreCreateRequest`/`StoreUpdateRequest`** validavam `exists:marketplaces,id` (tabela real é `market_places`) → **criar loja sempre dava 500**.
7. **`ValidateProductResponseDTO` sem `id`** → API nunca devolvia o id do registro criado.
8. **`StockController`/`StockAdjustmentController` index** passavam a mensagem como `$resourceClass` no `ApiResponse::paginated` (posicional) → **500 quando havia registros**.

## 🚩 Pendência sinalizada (decisão do usuário) — raw `stock` apiResource
POST/PUT `/stock` são scaffold incompleto: `StockResponseDTO` vazio, `StockCreateRequest` injeta `company_id` errado + regras comentadas, `StockUpdateRequest` vazio. Recomendação: remover as rotas de escrita direta no livro-razão (a mutação correta é via compra/venda/ajuste) ou tratar como feature própria. Não tocado.

---

## (Histórico) Plano original

> A tarefa era **extensa demais para uma execução só** (~17 controllers / ~70 endpoints sem teste de rota). Dividida em tópicos para executar **um de cada vez**.

**Contexto / convenções (Brain `skill-qa`, `skill-unit-tests`):**
- Pest. Feature tests de rota autenticam via helper `actingAsJwt()` (já existe em `tests/Pest.php`).
- Envelope `ApiResponse` (`success`/`message`/`data`/`meta`). Paginação tem `meta`.
- **Tenant scope (CompanyScope):** leituras de models com `company_id` (sale, purchase, stock, finance, validate-product) são filtradas pela(s) empresa(s) do usuário do JWT. Logo, nos testes desses módulos o **usuário autenticado precisa estar vinculado (CompanyUser) à empresa dos dados semeados**, senão `index` vem vazio e `show` dá 404.
- **Gotcha Postgres/SQLite:** alguns endpoints usam SQL exclusivo de Postgres e **não rodam no SQLite dos testes** → devem usar `markTestSkipped` quando driver ≠ pgsql (padrão já adotado em `StockInvestmentTest`): `finance/cash-flow` (date_trunc) e `total_investido` do dashboard (view FIFO).

**Pré-tarefa sugerida (rápida, habilita os tópicos 2–6):**
- [ ] Criar helper de teste `actingAsCompanyJwt()` (ou estender `actingAsJwt`) que cria usuário + empresa + `CompanyUser` e retorna ambos, para os módulos com tenant scope. Sem isso, cada teste repete esse setup.

---

## Ordem sugerida (por valor/risco)

### Tópico 1 — Auth (segurança, zero cobertura)
`AuthController`: `POST /auth/login | register | logout | refresh`.
- login: sucesso retorna token + user; credenciais inválidas → 401; usuário inativo → 403.
- register: cria user + empresa; e-mail duplicado → 422.
- refresh: token válido renova; inválido → 401.
- logout: invalida o token.
- **Arquivos:** `tests/Feature/Http/Auth/AuthControllerTest.php`.

### Tópico 2 — Vendas & Compras (HTTP / integração) — maior valor de negócio
`SaleController` e `PurchaseController` ponta a ponta.
- Venda: store gera itens + saída de estoque + conta a receber; `valor_liquido` derivado; **overselling → 422**; cancelar (update status) estorna estoque e sincroniza conta.
- Compra: store gera itens + entrada de estoque + conta a pagar; `valor_total` derivado; cancelar estorna.
- index/show respeitando tenant scope.
- **Arquivos:** `tests/Feature/Http/Sales/SaleControllerTest.php`, `tests/Feature/Http/Purchases/PurchaseControllerTest.php`.

### Tópico 3 — Business (Product, Supplier, ValidateProduct)
- Product: CRUD + **upload de múltiplas imagens** (`Storage::fake`), delete remove arquivos.
- Supplier: CRUD + uniques (cnpj/email) → 422.
- ValidateProduct: store calcula snapshot (lucro/margem/ROAS); `POST /check-validate-product` (preview).
- **Arquivos:** `tests/Feature/Http/Business/{Product,Supplier,ValidateProduct}ControllerTest.php`.

### Tópico 4 — Account (Store, UserStore, Company)
CRUD HTTP dos três `apiResource` + validações (uniques, FKs) e 404.
- **Arquivos:** `tests/Feature/Http/Accout/{Store,UserStore,Company}ControllerTest.php`.

### Tópico 5 — Stock & Adjustment (HTTP de rota)
- `stock` CRUD; `stock-check-quantity` (contrato + filtros); `stock-adjustment` store (gera movimento, recalcula saldo via observer).
- (investment já coberto em `StockInvestmentTest`, skip em SQLite.)
- **Arquivos:** `tests/Feature/Http/Stock/{Stock,StockAdjustment}ControllerTest.php`.

### Tópico 6 — Finance (HTTP)
- `account-payable` e `account-receivable`: CRUD + sync de status.
- `finance/dashboard` e `finance/cash-flow`: **skip em SQLite** nos trechos Postgres (cash-flow inteiro; dashboard no `total_investido`). Avaliar testar dashboard só com período sem estoque ou marcar skip.
- **Arquivos:** `tests/Feature/Http/Finance/{AccountPayable,AccountReceivable,CashFlow,Dashboard}ControllerTest.php`.

### Tópico 7 — ListSuspended
`GET /list`: retorna as listas auxiliares (categorias, fornecedores, formas de pagamento, marketplaces, produtos, empresas).
- **Arquivos:** `tests/Feature/Http/ListSuspended/ListSuspendedControllerTest.php`.

---

## Notas de escopo
- Foco em **feature tests de rota** (controller + request + service + repository + envelope). Onde o Service tem regra rica e já há unit (Sale, Purchase, Dashboard), o feature test cobre a integração, sem duplicar o unit.
- Cada tópico roda e fica verde antes do próximo.
- Estimativa: Tópicos 1 e 7 são curtos; 2, 3 e 6 são os mais densos.

> Para começar: me diga **"executar tópico N"**. Sugiro a pré-tarefa (helper de empresa) + **Tópico 1 (Auth)** primeiro.
