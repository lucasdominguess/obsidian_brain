---
tags: [sellerflow, api, overview, documentação]
status: MVP em desenvolvimento
atualizado: 2026-06-19
---

# SellerFlow — API REST (Overview Completo)

> Documento de visão geral do que **já está construído** na API. Serve de porta de entrada: quem ler aqui entende o objetivo do sistema, a arquitetura, os módulos, o modelo de dados e os fluxos de negócio sem precisar abrir o código.
>
> Relacionados: [[00 - SellerFlow - Visão Geral]] · [[Análise - Fluxo Compra, Venda e Ajuste de Estoque]] · [[detalhes-tabelas-modulos-3-ao-6]]

---

## 1. O que é e para quem serve

**SellerFlow** é uma **ferramenta interna de gestão para sellers de marketplaces**, com foco principal na **Shopee**. É o "ERP enxuto" do vendedor: centraliza produtos, fornecedores, compras, vendas, estoque e finanças num só lugar, com as regras de negócio do marketplace embutidas (taxas, repasses, precificação).

O sistema responde, na prática, a perguntas como:

- **Vale a pena vender este produto?** → validação/precificação considerando taxa Shopee, custo e ROAS de empate.
- **Quanto tenho parado em estoque, em reais?** → valorização do saldo via FIFO.
- **Quanto vou pagar e quanto vou receber?** → contas a pagar (compras) e a receber (vendas/repasses).
- **Como está meu caixa no período?** → fluxo de caixa realizado com saldo acumulado.

É uma **API REST** pura (backend). O frontend é apartado — uma SPA em **Vue.js** num repositório separado que consome esta API.

---

## 2. Stack & dependências

| Camada | Tecnologia |
|---|---|
| Linguagem | PHP 8.3+ |
| Framework | Laravel 12 |
| Banco | PostgreSQL |
| Cache/Fila | Redis (cache também tem fallback em tabela `cache`) |
| Auth | JWT via `tymon/jwt-auth` (guard `api`) |
| Login social | `laravel/socialite` (Google — `GoogleAuthService`) |
| Docs | Swagger/OpenAPI via `darkaonline/l5-swagger` |
| PDF | `barryvdh/laravel-dompdf` (`DomPdfService`) |
| Planilhas | `maatwebsite/excel` |
| Testes | Pest 4 |

---

## 3. Arquitetura

### Fluxo canônico (inegociável no projeto)

```
FormRequest → CommandDTO → Service → Repository → ResponseDTO → ApiResponse (JSON)
```

Regras estruturais que valem para todo o código:

- O **Controller** valida com um `FormRequest`, monta um **CommandDTO** (`XDTO::fromRequest($request->validated())`) e entrega o DTO ao Service. Nunca passa o `$request` cru.
- O **Service** concentra a regra de negócio. Recebe sempre um **DTO de domínio**, nunca array puro. Nunca retorna Model Eloquent — sempre um **ResponseDTO** (`ResponseDTO::fromModel()`).
- O **Repository** é o único que faz query. É declarado por **interface** e vinculado no `AppServiceProvider`. `create()`/`update()` recarregam relações (`->load(...)`) antes de retornar.
- Operações com múltiplas escritas usam **`DB::transaction()`**.
- Código em **inglês** (classes, métodos, tabelas); comentários e explicações em **PT-BR**.
- API **versionada** (`/api/v1`), respostas unificadas via `ApiResponse`.

### Organização em domínios

O `app/` é organizado por **domínio de negócio**, replicado em cada camada (`Controllers`, `Services`, `Repositories`, `DTOs`, `Models`, `Docs/Swagger`):

- **Accout** — usuários, empresas, lojas, vínculos
- **Business** — produtos, fornecedores, validação de produto
- **Purchases** — compras
- **Sales** — vendas
- **Stock** / **Adjustment** — estoque e ajustes
- **Finance** — contas a pagar/receber, fluxo de caixa
- **ListSuspended** — listas auxiliares (selects/comboboxes do front)
- **Auth** — autenticação

---

## 4. Autenticação & segurança

- **JWT** no guard `api`. Endpoints de auth são públicos; todo o resto fica atrás do `JwtMiddleware`.
- Endpoints: `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`.
- No login e no refresh, além de validar credenciais, o sistema **bloqueia usuário inativo** (`UserInactiveException`) — só `status_id = ACTIVE` entra.
- Exceptions de domínio dedicadas: `InvalidCredentialsException`, `UserInactiveException`.
- `register` cria **usuário + empresa** em conjunto (onboarding do seller).
- `XssCleanService` para sanitização de input; `GoogleAuthService` para login social Google.

---

## 5. Módulos funcionais

### 5.1 Conta (Accout)
Gestão de identidade e estrutura organizacional:
- **User** — usuário do sistema (com `status`).
- **Company** — empresa/tenant (CNPJ opcional). Base do multi-tenancy.
- **Store** — loja vinculada a uma empresa e a um **marketplace**.
- **UserStore** / **CompanyUser** — vínculos N:N com **role** (admin/user) e status. `UserStore` tem unique `(user_id, store_id)`.

### 5.2 Business (catálogo)
- **Product** — SKU único, nome, marca, descrição, `price_unit`, `price_box`, fornecedor e status. Imagens em tabela própria.
- **ProductImage** — múltiplas imagens por produto (`path` + `position`), com cascade no delete. Upload gravado no disco `public` **antes** da transação; rollback apaga os arquivos órfãos se a transação falhar.
- **Supplier** — fornecedor (CNPJ/e-mail únicos, link de catálogo).
- **ValidateProduct** — registro de **análise de viabilidade/precificação** (ver fluxo §7.4).

### 5.3 Purchases (compras)
Compra com itens. Ao concluir, alimenta **estoque** (entrada) e gera **conta a pagar**. Cancelamento **estorna** o estoque. `valor_total` é derivado da soma dos itens.

### 5.4 Sales (vendas)
Venda com itens. `valor_liquido` é **derivado** (`bruto − taxa_marketplace − frete`), nunca vem do cliente. Ao registrar, dá **saída** no estoque e gera **conta a receber**. Cancelamento **estorna** a saída. Unique `(market_place_id, numero_pedido)` evita pedido duplicado.

### 5.5 Stock (estoque)
Estoque é **append-only**: nada edita saldo diretamente — tudo passa por **movimentos** (`stock_movements`). O saldo materializado fica em `stock_balances`, recalculado por **Observer**. Inclui:
- **Ajuste manual** (`StockAdjustment`): perda, quebra, contagem física, devolução, outro.
- **Consulta de quantidade** em estoque (`stock-check-quantity`).
- **Investimento em estoque** (`stock-investment`): valor parado calculado por **FIFO** (ver §7.5).

### 5.6 Finance (financeiro)
- **AccountPayable** — contas a pagar (origem: compra ou ajuste manual).
- **AccountReceivable** — contas a receber (origem: venda ou ajuste manual), com `store_id`.
- **CashFlow** — relatório de fluxo de caixa realizado, com saldo acumulado por período (ver §7.6).
- **Dashboard** — resumo agregado do seller (vendas e compras do período, contas a receber/pagar com atrasados e a vencer 7/30d, estoque investido + nº de SKUs, top 5 produtos). Endpoint `GET /finance/dashboard`; período default = mês corrente. "Atrasado" é calculado dinamicamente pela data de vencimento.
- Status sincronizado a partir da compra/venda de origem (`COMPLETED` → marca pago/recebido; `PENDING` → limpa a data).

### 5.7 ListSuspended (listas auxiliares)
Endpoint único `GET /v1/list` que devolve as **listas de apoio** para selects do front: categorias financeiras, fornecedores, formas de pagamento, marketplaces, produtos e empresas.

---

## 6. Modelo de dados

### Tabelas de apoio (listas fixas / "suspensas")
| Tabela | Conteúdo |
|---|---|
| `status` | active / inactive / pending |
| `roles` | admin / user |
| `market_places` | nome, `taxa_percentual`, `taxa_fixa`, status |
| `payment_methods` | débito, crédito, pix, parcelado, dinheiro |
| `financial_categories` | categorias de entrada/saída |

### Conta & organização
| Tabela | Notas |
|---|---|
| `users` | email único, `status_id` (default pending) |
| `companies` | CNPJ único **nullable** |
| `stores` | FK `marketplace_id`, `company_id` |
| `user_stores` | N:N user×store + role + status, unique `(user_id, store_id)` |
| `company_users` | N:N company×user + role |

### Catálogo
| Tabela | Notas |
|---|---|
| `suppliers` | CNPJ/email únicos, link_catalog |
| `products` | SKU único, `price_unit`/`price_box`, FK fornecedor |
| `product_images` | `path` + `position`, cascade no produto |
| `validate_products` | snapshot de precificação (taxa, lucro, ROAS) |

### Transacionais
| Tabela | Notas |
|---|---|
| `purchases` / `purchase_items` | compra + itens; `valor_total` derivado |
| `sales` / `sale_items` | venda + itens; `valor_liquido` derivado; unique `(market_place_id, numero_pedido)` |
| `stock_movements` | livro-razão do estoque: `tipo` (entrada/saida/ajuste), `quantidade` sempre positiva, `origem_tipo` + `origem_id` (sem FK real) |
| `stock_adjustments` | ajustes manuais; sinal da quantidade = entrada(+)/saída(−) |
| `stock_balances` | saldo materializado por `(company_id, product_id)`, unique |
| `account_payables` | contas a pagar; index `(status, vencimento)` |
| `account_receivables` | contas a receber + `store_id`; index `(origem_tipo, origem_id)` |
| `stock_investment_view` | **VIEW** Postgres: valoriza o saldo via FIFO |

> `company_id` foi adicionado a `sales`, `stock_adjustments` e `stock_movements` para preparar **multi-tenancy**. No MVP há uma única empresa (`id = 1`), usada como default.

### Enums
`Status`, `Roles`, `FormPayment`, `CategoryFinance`, `Motive` (motivos de ajuste), `OriginType` (compra/venda/ajuste_manual), `TipoStock` (entrada/saida/ajuste), `TransactionStatus` (pendente/concluido/atrasado/cancelado — ciclo de vida unificado de compras, vendas e contas).

---

## 7. Fluxos de negócio chave

### 7.1 Compra → estoque + contas a pagar
`PurchaseService::store()` roda em transação:
1. calcula `valor_total` somando os itens;
2. grava a compra e seus itens;
3. `StockService::proccessItensPurchase()` → uma **ENTRADA** em `stock_movements` por item;
4. `AccountPayableService::proccessPurchase()` → gera a conta a pagar.

### 7.2 Venda → estoque + contas a receber
`SaleService::store()` roda em transação:
1. deriva `valor_liquido = bruto − taxa − frete`;
2. grava a venda e seus itens;
3. `StockService::proccessItensSale()` → uma **SAIDA** por item;
4. `AccountReceivableService::proccessSale()` → gera a conta a receber (pendente, com previsão de repasse).

### 7.3 Cancelamento / estorno
Na atualização, se **o status muda** para `CANCELED`, entra em transação e estorna:
- Compra cancelada → `reverseItensPurchase()` lança uma **SAIDA** que anula cada entrada.
- Venda cancelada → `reverseItensSale()` lança uma **ENTRADA** que devolve cada saída.
- Em ambos, o status é propagado para a conta a pagar/receber vinculada.
- Update **sem** mudança de status é simples (sem transação nem propagação).

### 7.4 Validação / precificação de produto
`ValidateProductService` + `PriceCalculator` calculam, dado preço de venda, preço de compra, custo adicional e a taxa do marketplace:
- **taxa total** = `price_sale × taxa% + taxa_fixa`;
- **lucro líquido (R$)** = `venda − compra − custo − taxa`;
- **margem (%)** sobre o preço de venda;
- **ROAS de empate** = `price_sale / lucro` (faturamento por R$ de ads para empatar; 0 se sem margem).

`POST /check-validate-product` apenas calcula (preview). Ao salvar (`store`), o cálculo é **refeito no servidor** e persistido como **snapshot** (`fee_percent`, `fee_fixed`, `profit_amount`, `profit_margin`, `breakeven_roas`) — o registro fica reproduzível.

### 7.5 Saldo de estoque (Observer) e investimento (FIFO)
- **Saldo:** `StockObserver` escuta create/update/delete de `Stock` (movimento) e chama `recomputeFor(company, product)`, regravando `stock_balances`. Se o movimento troca de empresa/produto, recalcula também a origem. Há o comando `stock:rebuild-balances` para reconstruir tudo.
- **Investimento:** a view `stock_investment_view` valoriza o `saldo_atual` por **FIFO** — percorre as camadas de compra da mais nova para a mais antiga, cobrindo a quantidade que ainda existe pelo preço real de cada camada (sem custo médio). Unidades sem camada de compra (ex.: entraram por ajuste positivo) são sinalizadas (`tem_unidade_sem_custo`). O endpoint retorna a lista paginada + `total_investido`.

### 7.6 Fluxo de caixa
`CashFlowService::realized()` agrega entradas/saídas por período (granularidade) e percorre os períodos em ordem mantendo o **saldo acumulado**, devolvendo `summary` (total entradas, saídas, saldo) + série temporal.

---

## 8. Endpoints (mapa de rotas)

Prefixo global: **`/api/v1`**. Tudo abaixo de "protegido" exige JWT.

**Público**
```
GET  /list                       # listas auxiliares (selects)
POST /auth/login | /auth/register | /auth/logout | /auth/refresh
```

**Protegido (JWT) — apiResource = index/show/store/update/destroy**
```
# Conta
apiResource user, store, user-store, company

# Business
apiResource product
apiResource supplier
apiResource validate-product
POST       check-validate-product        # preview de precificação

# Compras / Vendas
apiResource purchases
apiResource sales

# Estoque
apiResource stock-adjustment             # só index/show/store
GET        stock-check-quantity          # quantidade em estoque
GET        stock-investment              # valor investido (FIFO)
apiResource stock

# Financeiro
GET        finance/dashboard            # resumo agregado do seller
GET        finance/cash-flow
apiResource account-payable
apiResource account-receivable
```

Fallback: qualquer rota desconhecida → `404 {"message": "Página não encontrada"}`.

---

## 9. Padrão de resposta (ApiResponse)

Todas as respostas seguem um envelope unificado:

```jsonc
// sucesso
{ "success": true, "message": "...", "data": { } }

// erro
{ "success": false, "message": "...", "errors": { } }

// paginado (LengthAwarePaginator)
{
  "success": true, "message": "...", "data": [ ],
  "meta": { "current_page", "from", "last_page", "per_page", "to", "total" }
}
```

Helpers: `success`, `created`, `error`, `notFound`, `unauthorized`, `forbidden`, `validationError`, `serverError`, `noContent`, `paginated`.

---

## 10. Tooling do projeto (geradores & comandos)

O projeto tem **geradores custom** para impor o fluxo canônico (preferir a criar arquivos à mão):

```bash
php artisan make:crud {Name}        # stack CRUD completo + binds + rotas (aceita subpastas)
php artisan make:service {Name}     # Service (flags: -r repo, -c contract, -C controller, -d dto, -m CRUD)
php artisan make:dto {Name}         # DTO (-r ResponseDTO, -A fromArray, --all par completo)
php artisan postman:generate        # gera/atualiza a collection do Postman
php artisan stock:rebuild-balances  # recalcula stock_balances a partir dos movimentos
php artisan cls                     # limpa caches (--all, --prod)

# rotina
php artisan serve
php artisan migrate:fresh --seed
./vendor/bin/pest
```

Documentação da API exposta via **Swagger** (anotações em `app/Docs/Swagger/<dominio>`).

---

## 11. Estado atual (MVP)

**Construído e funcional:**
- ✅ Auth JWT (login/register/logout/refresh) + bloqueio de inativo + login Google
- ✅ Conta: users, companies, stores, vínculos
- ✅ Business: produtos (com upload de múltiplas imagens), fornecedores, validação/precificação de produto
- ✅ Compras e Vendas com itens, integradas a estoque e financeiro
- ✅ Estoque append-only com saldo materializado (Observer) + ajustes manuais + estorno em cancelamento
- ✅ Investimento em estoque por FIFO (view Postgres)
- ✅ Financeiro: contas a pagar/receber sincronizadas + fluxo de caixa realizado
- ✅ Listas auxiliares, resposta unificada, Swagger, geradores custom

**Multi-tenancy (isolamento por empresa):**
- ✅ Leituras isoladas por empresa via `CompanyScope` (global scope na trait `BelongsToCompany`), aplicado em `Sale`, `Purchase`, `Stock`, `StockAdjustment`, `StockBalance`, `AccountPayable`, `AccountReceivable` e `ValidateProduct`. Cobre `index` e route-model binding (`show/update/delete` → 404 entre empresas). Sem token (commands/seeders) o escopo é desligado.
- 🟡 `products` e `suppliers` seguem como **catálogo global** (não têm `company_id`) — decisão consciente do MVP.

---

> **Para aprofundar por módulo**, ver os docs irmãos em `Plans/sellerflow/` (Módulos 3–6, código + explicação) e a [[Análise - Fluxo Compra, Venda e Ajuste de Estoque]].
