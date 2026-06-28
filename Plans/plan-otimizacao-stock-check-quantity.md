# Blueprint da Solução: Otimização de `checkQuantityProductsInStock`

**Data:** 2026-06-11
**Projeto:** SellerFlow (Módulo 5 — Estoque)
**Origem:** Análise de performance solicitada sobre `StockRepository::checkQuantityProductsInStock`.
**Status:** Em execução — **Fases 1, 4 e 3 aplicadas** (2026-06-11); Fases 2 e 5 adiadas. Decisão arquitetural da Fase 4 registrada em [[0001-saldo-materializado-estoque]].
**Aprovação:** Execução autorizada inline pelo usuário ("desenvolva um plano... e depois execute passo a passo").

> Relacionado: [[Módulo 5 - Estoque - explicação]], [[Análise - Fluxo Compra, Venda e Ajuste de Estoque]]

---

## Contexto Arquitetural

- **Brain consultado:** `Skills/ops/skill-planner.md` (formato de plano); `CLAUDE.md` do projeto (fluxo canônico, multi-loja fora do MVP, código em inglês / comentários PT-BR).
- **Banco:** Postgres. **Nuance crítica:** no Postgres, FK criada com `foreignId()->constrained()` **NÃO** gera índice automático na coluna referenciadora (diferente do MySQL/InnoDB). Logo `company_id`, `product_id` e `user_id` das tabelas de estoque só têm índice se declarado explicitamente.
- **Fluxo afetado:** `GET /api/v1/stock-check-quantity` → `StockController::checkQuantityProductsInStock` → `StockService` (faz `->map(StockBalanceDTO)`) → `StockRepository::checkQuantityProductsInStock` (a query analisada).
- **Premissa de escala:** `movimentacoes_estoque` é um log *append-only* (1 linha por evento de estoque — venda, compra, ajuste). Tende a ser a maior tabela do sistema. `ajustes_estoque` é bem menor (correções manuais).

---

## Diagnóstico (resumo da análise)

| # | Problema | Onde | Severidade | Quando dói |
|---|----------|------|-----------|-----------|
| 1 | Subquery correlacionada (`last_adjustment_user`) executa 1× por produto contra `ajustes_estoque` **sem nenhum índice** → seq scan + sort por grupo (N+1 dentro do SQL) | linhas 70-80 | 🔴 Alta | catálogo + histórico de ajustes crescem |
| 2 | Recalcula o saldo somando **todo o histórico** a cada chamada (sem filtro de data / sem snapshot) | linhas 81-91 | 🔴 Alta (longo prazo) | `movimentacoes_estoque` acumula |
| 3 | Sem paginação — `->get()` + `->map()` sobre o catálogo inteiro; multiplica o problema #1 | linha 93 | 🟠 Média | catálogo grande sem filtro |
| 4 | `company_id` sem índice nas tabelas de estoque | filtro linha 64 | 🟡 Baixa hoje | só com multi-empresa real |
| 5 | `ilike '%termo%'` (curinga à esquerda) não usa índice btree | linhas 66-67 | 🟡 Baixa | busca em catálogo grande |
| — | **Ponto semântico:** somatórios de ajuste dependem do `LEFT JOIN ae`; um movimento `tipo='ajuste'` sem origem manual casável some silenciosamente dos dois somatórios | linhas 59-63, 83-84 | 🔵 Correção (não-perf) | invariante violada |

> A query está **logicamente correta e bem escrita** (os agregados com `FILTER (WHERE ...)` são idioma idiomático do Postgres; o tratamento de sinal está certo). O problema é **escalabilidade**, não corretude — exceto o ponto semântico, que é risco de corretude latente.

---

## Decisão de Escopo — o que executar AGORA vs ADIAR

Princípio (alinhado ao "para não falharmos"): **nesta sessão só aplicamos mudança aditiva, reversível, sem alterar contrato de API nem comportamento.** Mudanças que tocam o contrato (paginação) ou são arquiteturais (snapshot) ficam como fases deliberadas e separadas, com decisão consciente do usuário.

- ✅ **Fase 1 (executar agora):** índice em `ajustes_estoque`. Resolve o gargalo #1, que era o único urgente. Migration puramente aditiva.
- ⏸️ **Fase 2 (adiar):** índice `company_id` em `movimentacoes_estoque`. **Sem benefício hoje** — com empresa única, `company_id = 1` casa todas as linhas, e uma agregação de tabela inteira faz seq scan de qualquer jeito (índice seria ignorado). Pior: adicionaria custo de escrita numa tabela *write-hot* por zero ganho. Fazer só quando multi-empresa for real.
- ⏸️ **Fase 3 (adiar — muda contrato):** paginação. Altera o tipo de retorno (`Collection` → `LengthAwarePaginator`) e o shape do JSON, exigindo coordenação com o frontend. Decisão separada.
- 🔮 **Fase 4 (futuro — ADR):** snapshot de saldo para não recalcular o histórico inteiro. Prematuro para o MVP.
- ⏸️ **Fase 5 (adiar):** índice GIN `pg_trgm` para `ilike`. Só se a busca ficar lenta.

---

## Arquivos Impactados

- `[NEW]` `database/migrations/<timestamp>_add_index_to_ajustes_estoque_table.php` — **Fase 1 (esta sessão)**
- `[FUTURO]` `database/migrations/..._add_company_index_to_movimentacoes_estoque_table.php` — Fase 2
- `[FUTURO]` `StockRepository.php`, `StockService.php`, `StockController.php`, `CheckStockQuantityRequest.php`, `StockBalanceDTO` — Fase 3 (paginação)
- `[FUTURO]` tabela de snapshot + job/listener de atualização — Fase 4
- `[FUTURO]` migration `pg_trgm` + índice GIN — Fase 5
- `[DECISÃO]` CHECK constraint em `movimentacoes_estoque` — ver "Ponto de Atenção Semântico"

---

## Fases detalhadas

### Fase 1 — Índice em `ajustes_estoque` ✅ EXECUTAR AGORA

**Objetivo:** transformar o seq scan + sort por produto (subquery `last_adjustment_user`) em um *index seek* com `LIMIT 1`.

**Índice escolhido:** `(company_id, product_id, created_at)`.
- A subquery filtra `company_id` e `product_id` por igualdade e ordena por `created_at desc` → este índice cobre filtro + ordenação.
- Ordem "tenant-first" (`company_id` na frente) já fica pronta para multi-empresa.
- `created_at` por último serve o `ORDER BY ... LIMIT 1` (o desempate `id desc` afeta só linhas de mesmo timestamp — desprezível; mantido fora do índice para espelhar a convenção existente `index(['product_id','created_at'])`).

**Passos:**
- [x] 1.1 Gerar a migration via `php artisan make:migration add_index_to_ajustes_estoque_table` (timestamp correto).
- [x] 1.2 No `up()`: `$table->index(['company_id', 'product_id', 'created_at'], 'ajustes_estoque_company_product_created_idx');` No `down()`: `dropIndex` pelo mesmo nome.
- [x] 1.3 Rodar `php artisan migrate` (via PowerShell — `php` não está no PATH do Bash).
- [x] 1.4 Verificar criação do índice no Postgres (`pg_indexes`).

**Nota de deploy (Render / prod com dados):** `CREATE INDEX` no Postgres trava escrita por padrão. Em produção com volume, considerar `CREATE INDEX CONCURRENTLY` — que **não roda dentro de transação**, então exigiria `public $withinTransaction = false;` na migration. Irrelevante em dev (tabela pequena); registrar para o deploy.

### Fase 2 — Índice `company_id` em `movimentacoes_estoque` ⏸️ ADIAR

Só faz sentido quando houver dados de múltiplas empresas (filtro `company_id` passa a ser seletivo). Hoje seria índice ignorado + custo de escrita. Reavaliar junto com a implementação multi-empresa.

### Fase 3 — Paginação de `checkQuantityProductsInStock` ✅ EXECUTADA (ver Registro Fases 4+3)

Trocar `->get()` por `->paginate()` muda o tipo de retorno e o shape do JSON. Exige:
- ajustar `StockService` (hoje faz `->map()->all()` sobre `Collection`);
- ajustar `StockBalanceDTO`/`ApiResponse` para envelope paginado;
- alinhar com o frontend (Blade + JS) que consome a tela.
Fazer como passo próprio, com o frontend ciente. Enquanto o catálogo for pequeno, o impacto é baixo.

### Fase 4 — Snapshot de saldo ✅ EXECUTADA (ver Registro Fases 4+3 e [[0001-saldo-materializado-estoque]])

Padrão *event-sourcing sem snapshot*: o saldo é recomputado desde o início do tempo a cada request. Solução madura: tabela `stock_balances` (saldo materializado por produto/empresa) atualizada por listener/job a cada movimentação, e a query lê o snapshot + delta recente. **Prematuro para o MVP** — abrir ADR quando o volume justificar (`skill-memory`).

### Fase 5 — `pg_trgm` para busca `ilike` ⏸️ ADIAR

`ilike '%termo%'` não usa btree. Se a busca por nome/sku ficar lenta: `CREATE EXTENSION pg_trgm` + índice GIN `gin (name gin_trgm_ops)`. Só quando necessário.

---

## Ponto de Atenção Semântico — análise e recomendação

> **Pedido do usuário:** registrar este tópico para análise posterior. Esta seção é **diagnóstico + recomendação**, não foi implementada nesta sessão.

**O risco.** Os somatórios `total_ajustes_positivos` / `total_ajustes_negativos` (linhas 83-84) dependem do `LEFT JOIN ajustes_estoque ae` (linhas 59-63), que casa `ae.id = me.origem_id` **somente** quando `me.origem_tipo = 'ajuste_manual'` e `me.tipo = 'ajuste'`. O sinal vem de `ae.quantidade` (`> 0` entrada, `< 0` saída). Se algum dia existir um movimento `tipo='ajuste'` **sem** origem manual casável (origem diferente, ou `origem_id` quebrado — a coluna não tem FK real), então `ae.quantidade` é `NULL`, o movimento **falha tanto em `> 0` quanto em `< 0`** e **some dos dois somatórios** → `saldo_atual` fica silenciosamente errado.

**Estado atual.** A invariante se sustenta hoje: o único ponto que grava movimento de ajuste é `StockService::registerAdjustmentMovement`, que sempre seta `origem_tipo = AJUSTE_MANUAL` e `origem_id = $stockAdjustment->id`. Ou seja, é **correto por convenção do código**, não garantido pelo banco.

**Opções:**

1. **CHECK constraint no banco (recomendado — barato).**
   `CHECK (tipo <> 'ajuste' OR origem_tipo = 'ajuste_manual')` em `movimentacoes_estoque`. Garante, no nível de dados, que todo movimento de ajuste tem origem manual. Declarativo, sem mudança de aplicação. (Não cobre `origem_id` "pendurado" por falta de FK, mas fecha o buraco principal.) Acompanhar de uma query de sanidade para detectar violações já existentes **antes** de aplicar o constraint:
   ```sql
   select count(*) from movimentacoes_estoque
   where tipo = 'ajuste' and origem_tipo <> 'ajuste_manual';
   ```

2. **Denormalizar o sinal no movimento (médio — arquitetural / ADR).**
   Guardar o sinal/delta no próprio `movimentacoes_estoque` (ex.: coluna `direcao`/`sentido`, ou um delta com sinal). Assim os somatórios **não precisam mais do `LEFT JOIN ajustes_estoque`** — a query fica mais simples, mais rápida e o acoplamento desaparece. Mexe na decisão atual de "`quantidade` sempre positivo", então seria coluna separada de sinal, não `quantidade` assinado.

3. **Query defensiva (paliativo — não recomendado).**
   Tratar `tipo='ajuste'` com `ae` NULL como erro/fallback. Não resolve a raiz.

**Minha recomendação:**
- **Agora/curto prazo:** Opção 1 (CHECK constraint) + a query de sanidade. Seguro de baixo custo, sem mudar comportamento. *Documentado aqui para sua análise — não apliquei nesta sessão por estar fora do escopo aprovado.*
- **Médio prazo:** Opção 2 como ADR, quando o Módulo 5 for revisitado — mata a classe de bug do "some silenciosamente" **e** permite remover o `LEFT JOIN ajustes_estoque` da query quente. Ganho duplo (corretude + performance).

---

## Registro de Execução (Fase 1) — concluída em 2026-06-11

| Passo | Resultado |
|-------|-----------|
| 1.1 make:migration | ✅ `2026_06_11_184155_add_index_to_ajustes_estoque_table.php` gerada |
| 1.2 editar up/down | ✅ índice `ajustes_estoque_company_product_created_idx` em `(company_id, product_id, created_at)`; sem PHPDoc, comentário PT-BR do "porquê" (convenção do projeto) |
| 1.3 migrate | ✅ aplicada em 42.93ms, sem erro |
| 1.4 verificar índice | ✅ confirmado em `pg_indexes` via `db:table ajustes_estoque` (índice presente ao lado da PK) |

**Nota sobre validação por EXPLAIN:** não rodei `EXPLAIN ANALYZE` nesta sessão porque em dev a tabela `ajustes_estoque` está praticamente vazia — o planner do Postgres escolheria seq scan de qualquer forma (tabela minúscula), o que não provaria nada. O índice passa a ser usado quando o planner considerá-lo mais barato (com dados reais). Para validar em volume: `EXPLAIN ANALYZE` na subquery isolada com dados de produção/staging.

**Arquivos alterados nesta sessão:**
- `[NEW]` `database/migrations/2026_06_11_184155_add_index_to_ajustes_estoque_table.php`
- Nenhuma alteração em `StockRepository.php` (a query não muda — só o índice que a sustenta).

**Próximos passos sugeridos (não executados):** decidir sobre o CHECK constraint do Ponto Semântico; Fases 2 e 5 conforme escala.

---

## Registro de Execução — Fases 4 + 3 (sessão 2026-06-11)

> Decisão de implementar a Fase 4 como **saldo materializado com recompute-on-write** (e não snapshot periódico): ver ADR [[0001-saldo-materializado-estoque]].

**Desenho final:** tabela `stock_balances` (1 linha por `company_id+product_id`) mantida por um observer a cada movimentação; leitura vira scan simples paginável. A Fase 3 (paginação) saiu de brinde sobre essa leitura.

### Arquivos criados `[NEW]`
- `database/migrations/2026_06_11_190123_create_stock_balances_table.php` — tabela de saldo (unique `company_id+product_id`)
- `app/Models/Stock/StockBalance.php`
- `app/Contracts/Repositories/Stock/StockBalanceRepositoryInterface.php`
- `app/Repositories/Stock/StockBalanceRepository.php` — `recomputeFor()` (write) + `paginate()` (read)
- `app/Observers/StockObserver.php` — created/updated/deleted → `recomputeFor`
- `app/Console/Commands/RebuildStockBalances.php` — `php artisan stock:rebuild-balances`
- `tests/Feature/Stock/StockBalanceTest.php` — 5 testes (17 asserções) ✅

### Arquivos modificados `[MOD]`
- `app/Providers/AppServiceProvider.php` — bind do `StockBalanceRepositoryInterface` + `Stock::observe(StockObserver::class)`
- `app/Services/Stock/StockService.php` — injeta `StockBalanceRepositoryInterface`; `checkQuantityProductsInStock` agora retorna `LengthAwarePaginator`
- `app/Contracts/Services/Stock/StockServiceInterface.php` — assinatura (paginator + `perPage`/`page`)
- `app/Http/Controllers/Stock/StockController.php` — `ApiResponse::paginated(...)` em vez de `success(...)`
- `app/Http/Requests/Stock/CheckStockQuantityRequest.php` — `prepareForValidation` + regras `perPage`/`page`
- `app/Repositories/Stock/StockRepository.php` + interface — **removido** o método antigo `checkQuantityProductsInStock` (substituído pela leitura em `stock_balances`)

### Verificação
- `migrate` aplicada (app inicializa sem erro de binding/sintaxe).
- `stock:rebuild-balances` rodou (0 produtos no dev — banco sem movimentações).
- `php artisan test tests/Feature/Stock/StockBalanceTest.php` → **5 passed, 17 assertions**: observer (create), recompute em delete, remoção quando zera, rebuild e contrato da leitura paginada (incl. `last_adjustment_user`).
- Suíte completa: 15 falhas **pré-existentes** e não relacionadas (`UserControllerTest` = 401 por `JwtMiddleware` sem `actingAs`; `UserDTOTest` = null-handling do `UserDTO`). Nenhuma nas áreas tocadas.

### ⚠️ Quebra de contrato da API (esperada na Fase 3)
`GET /api/v1/stock-check-quantity` agora responde no envelope **paginado** (`{ data, meta }`) em vez de um array plano em `data`. O frontend que consome essa tela precisa ser ajustado. Parâmetros novos opcionais: `?perPage=&page=`.

### Pendências conhecidas (não bloqueiam)
- Backfill em produção: rodar `php artisan stock:rebuild-balances` após o deploy da migration.
- Concorrência do recompute: aceitável no MVP; rede de segurança é o rebuild (ver ADR).
- Tech-debt achado: factories `MovimentacaoEstoqueFactory`/`AjusteEstoqueFactory` apontam para models inexistentes (`MovimentacaoEstoque`/`AjusteEstoque`); os models reais são `Stock`/`StockAdjustment`. Não corrigido nesta sessão.
