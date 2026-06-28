---
tags: [sellerflow, plano, seguranca, estoque, dashboard]
status: aguardando aprovação
criado: 2026-06-19
---

# Blueprint da Solução: Tenant Scoping + Validação de Estoque + Dashboard

> Planejamento dos tópicos **1 (multi-tenancy / IDOR)**, **2 (overselling)** e **5 (dashboard)** levantados na análise.
> Relacionado: [[SellerFlow-API]]. Ainda **não implementar** — revisar e aprovar antes.

**Contexto Arquitetural (regras do Brain que se aplicam):**
- Fluxo canônico `FormRequest → CommandDTO → Service → Repository → ResponseDTO` (`skill-layers`).
- Service nunca faz query; Repository é o único que acessa o banco e é vinculado por interface no `AppServiceProvider`.
- Service nunca retorna Model; sempre `ResponseDTO`. Múltiplas escritas em `DB::transaction()`.
- Código em inglês; comentários em PT-BR; sem PHPDoc descritivo.
- Já existe `App\Classes\AuthContext` que lê do payload JWT: `companyIds()` (Collection — usuário pode ter N empresas), `storeIds()`, `userId()`, `check()`.

---

## TÓPICO 1 — Tenant scoping (corrigir IDOR / vazamento entre empresas)

### Problema
Na escrita o `company_id` já vem do JWT (ok). Na **leitura não há filtro**: `SaleRepository::index()` ignora a empresa (apesar do comentário), e `show()/update()/delete()` usam route-model binding direto — qualquer usuário autenticado acessa registro de qualquer empresa por ID.

### Decisão de design
Um **Global Scope** por empresa, aplicado via trait nos models que têm `company_id`. Vantagem: resolve **de uma vez** `index` (where automático) **e** route-model binding (`show/update/delete` passam a retornar 404 para registros de outra empresa) — sem depender de cada repositório lembrar de filtrar.

Como o usuário pode pertencer a várias empresas, o escopo é `whereIn('company_id', AuthContext::companyIds())`.

### Código (núcleo — é simples)

```php
// [NEW] app/Models/Scopes/CompanyScope.php
namespace App\Models\Scopes;

use App\Classes\AuthContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Sem token (commands, seeders, jobs) → sem escopo. Em HTTP o JwtMiddleware garante o token.
        if (! AuthContext::check()) {
            return;
        }

        $builder->whereIn(
            $model->getTable() . '.company_id',
            AuthContext::companyIds()->all()
        );
    }
}
```

```php
// [NEW] app/Models/Concerns/BelongsToCompany.php
namespace App\Models\Concerns;

use App\Models\Scopes\CompanyScope;

trait BelongsToCompany
{
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope);
    }
}
```

Depois, `use BelongsToCompany;` nos models que possuem coluna `company_id`:
`Sale`, `Purchase`, `Stock` (stock_movements), `StockAdjustment`, `StockBalance`, `AccountPayable`, `AccountReceivable`, `ValidateProduct`.

### Pontos de atenção (decidir antes)
- **`products` e `suppliers` NÃO têm `company_id`** no schema atual → hoje são catálogo global compartilhado entre empresas. Se a regra de negócio for "cada empresa tem seu catálogo", isso é uma migração à parte (fora deste plano). **Decisão necessária.**
- **Commands/seeders** (`stock:rebuild-balances`, `migrate:fresh --seed`) rodam sem token → o guard `AuthContext::check()` os deixa sem escopo (acesso total). Correto.
- **`StockObserver`/`recomputeFor`** usam `DB::table` (query builder), que **não** sofre global scope — continuam funcionando. Apenas o `StockBalance::updateOrCreate/delete` (Eloquent) sofre escopo, mas roda dentro de request autenticado cuja empresa está em `companyIds()`. Ok.
- **Bypass pontual** quando necessário: `Model::withoutGlobalScope(CompanyScope::class)`.
- **Testes existentes**: feature tests autenticados passam a ser escopados — revisar `tests/Feature` que assumiam visibilidade cruzada.

### Arquivos impactados
- `[NEW] app/Models/Scopes/CompanyScope.php`
- `[NEW] app/Models/Concerns/BelongsToCompany.php`
- `[MOD] app/Models/Sales/Sale.php` + Purchase, Stock, StockAdjustment, StockBalance, AccountPayable, AccountReceivable, ValidateProduct (adicionar o trait)
- `[MOD] app/Repositories/Sales/SaleRepository.php` (remover comentário enganoso de scoping)
- `[NEW] tests/Feature/TenantScopingTest.php` (usuário A não enxerga venda/compra/conta da empresa B; show de outra empresa → 404)

### Checklist
- [ ] 1. Criar `CompanyScope` e a trait `BelongsToCompany`.
- [ ] 2. Aplicar a trait nos 8 models com `company_id`.
- [ ] 3. Limpar o comentário de "tenant scoping" do `SaleRepository::index` (agora real via scope).
- [ ] 4. Teste de isolamento (index + show 404 entre empresas).
- [ ] 5. Rodar a suíte e ajustar testes que assumiam visibilidade global.
- [ ] **Decidir:** `products`/`suppliers` ficam globais ou viram por-empresa (migração separada)?

---

## TÓPICO 2 — Validação de saldo na venda (impedir overselling)

### Problema
`SaleService::store()` gera SAIDA de estoque sem checar saldo disponível → permite vender mais do que existe (saldo negativo, silencioso).

### Decisão de design
Validar **antes** de processar os itens, dentro da transação do `store`. Não existe método de leitura de saldo — adicionar `availableQuantity()` no `StockBalanceRepository` e expô-lo via `StockService` (o `SaleService` já depende de `StockServiceInterface`, então não adiciona dependência nova). Saldo insuficiente lança uma **exceção de domínio** → 422, no mesmo padrão das exceptions de Auth já existentes.

### Código

```php
// [MOD] StockBalanceRepositoryInterface + StockBalanceRepository
public function availableQuantity(int $companyId, int $productId): int
{
    return (int) (StockBalance::query()
        ->where('company_id', $companyId)
        ->where('product_id', $productId)
        ->value('saldo_atual') ?? 0);
}
```

```php
// [MOD] StockService — expõe o saldo para outros services (sem vazar Repository)
public function availableQuantity(int $companyId, int $productId): int
{
    return $this->balanceRepository->availableQuantity($companyId, $productId);
}
```

```php
// [MOD] SaleService — no início da transação de store(), antes de proccessItensSale()
$this->assertStockAvailable($dto->venda_itens, $dto->company_id);

// ...

private function assertStockAvailable(array $itens, int $companyId): void
{
    // soma por produto (o mesmo produto pode aparecer em itens diferentes)
    $needed = [];
    foreach ($itens as $item) {
        $needed[$item->product_id] = ($needed[$item->product_id] ?? 0) + $item->quantidade;
    }

    foreach ($needed as $productId => $quantidade) {
        $available = $this->stockService->availableQuantity($companyId, $productId);
        if ($quantidade > $available) {
            throw new InsufficientStockException($productId, $available, $quantidade);
        }
    }
}
```

```php
// [NEW] app/Exceptions/Stock/InsufficientStockException.php
// Mesma forma das exceptions de Auth (render → ApiResponse::error(422)).
```

### Pontos de atenção (decidir antes)
- **Comportamento recomendado: bloquear (hard)**. Alternativa seria permitir e só avisar — **decisão sua**. O plano assume bloqueio.
- **Escopo:** só `store` (o update não altera itens, conforme o DTO). Ajuste manual negativo ainda pode zerar/negativar saldo — fora deste tópico.
- **Concorrência:** duas vendas simultâneas do mesmo produto podem passar as duas na checagem (read-then-write). Para o MVP é aceitável; lock pessimista/atômico fica como P2.
- **Reativar venda cancelada** (CANCELED → PENDING) volta a dar saída via sync? Hoje o estorno só ocorre no cancelamento; reativação não re-debita estoque — comportamento atual mantido, só sinalizar.

### Arquivos impactados
- `[MOD] app/Contracts/Repositories/Stock/StockBalanceRepositoryInterface.php`
- `[MOD] app/Repositories/Stock/StockBalanceRepository.php`
- `[MOD] app/Contracts/Services/Stock/StockServiceInterface.php` + `app/Services/Stock/StockService.php`
- `[MOD] app/Services/Sales/SaleService.php`
- `[NEW] app/Exceptions/Stock/InsufficientStockException.php`
- `[NEW] tests/Feature/Sales/OversellingTest.php`

### Checklist
- [ ] 1. `availableQuantity()` no repo + interface.
- [ ] 2. Expor `availableQuantity()` no StockService + interface.
- [ ] 3. `InsufficientStockException` (render 422 no padrão das de Auth).
- [ ] 4. `assertStockAvailable()` no `SaleService::store`.
- [ ] 5. Testes: venda dentro do saldo (ok), acima do saldo (422), mesmo produto repetido somando.
- [ ] **Decidir:** bloquear (recomendado) vs. permitir com aviso.

---

## TÓPICO 5 — Endpoint de Dashboard (resumo do seller)

### Decisão de design
Módulo **read-only** de relatório, no mesmo molde do `CashFlow` (Controller → Service → Repository → ResponseDTO), com **um endpoint** `GET /v1/dashboard` e filtro de período opcional (default: mês corrente). Repositório usa `DB::table` com agregações (igual ao CashFlowRepository) e filtra por `AuthContext::companyIds()` explicitamente (query builder não sofre o global scope do tópico 1).

### Métricas da v1 (todas baratas e exatas)
1. **Vendas (período):** qtd de pedidos, total bruto, total líquido — exclui `cancelado`.
2. **Compras (período):** qtd, total — exclui `cancelado`.
3. **Contas a receber:** pendente (aberto), recebido no período, **atrasado** (vencido em aberto).
4. **Contas a pagar:** pendente, pago no período, atrasado.
5. **A vencer:** receber e pagar nos próximos 7 e 30 dias.
6. **Estoque:** `total_investido` (reaproveita `StockBalanceRepository::totalInvested`), nº de SKUs com saldo e nº de SKUs zerados.
7. **Top 5 produtos** do período por quantidade vendida (`sale_items` ⋈ `sales`).

> **Lucro/margem por FIFO** fica para a **v2** do dashboard (precisa cruzar CMV com a view de investimento) — manter v1 enxuto e exato.

### Exemplo de query agregada (estilo do CashFlowRepository)

```php
// resumo de vendas do período, escopado por empresa(s) do usuário
$vendas = DB::table('sales')
    ->whereIn('company_id', $companyIds)
    ->whereBetween('data_venda', [$start, $end])
    ->where('status', '<>', TransactionStatus::CANCELED->value)
    ->selectRaw('count(*) as pedidos')
    ->selectRaw('coalesce(sum(valor_bruto), 0) as total_bruto')
    ->selectRaw('coalesce(sum(valor_liquido), 0) as total_liquido')
    ->first();
```

O `DashboardService` monta cada bloco e devolve um `DashboardResponseDTO` (arrays aninhados: `vendas`, `compras`, `financeiro`, `estoque`, `top_produtos`).

### Arquivos impactados
- `[NEW] app/Http/Controllers/Finance/DashboardController.php`
- `[NEW] app/Http/Requests/Finance/DashboardRequest.php` (valida `start_date`/`end_date` opcionais)
- `[NEW] app/DTOs/Finance/DashboardQueryDTO.php` (injeta `companyIds` via AuthContext, igual ao `CashFlowQueryDTO`)
- `[NEW] app/DTOs/Finance/DashboardResponseDTO.php`
- `[NEW] app/Contracts/Services/Finance/DashboardServiceInterface.php` + `app/Services/Finance/DashboardService.php`
- `[NEW] app/Contracts/Repositories/Finance/DashboardRepositoryInterface.php` + `app/Repositories/Finance/DashboardRepository.php`
- `[MOD] app/Providers/AppServiceProvider.php` (bind das interfaces)
- `[MOD] routes/api.php` (`GET /v1/dashboard` no grupo JWT)
- `[NEW] app/Docs/Swagger/Finance/DashboardDoc.php`
- `[NEW] tests/Feature/Finance/DashboardTest.php`

### Checklist
- [ ] 1. Migration? Não — só leitura sobre tabelas existentes.
- [ ] 2. `DashboardRepository` com um método por bloco de métrica (vendas, compras, financeiro, estoque, top produtos).
- [ ] 3. `DashboardQueryDTO` (período + companyIds) e `DashboardResponseDTO` (agregado).
- [ ] 4. `DashboardService` orquestrando os blocos.
- [ ] 5. Controller fino + FormRequest + rota + bind no provider.
- [ ] 6. Swagger + teste de feature com seed conhecido.
- [ ] **Decidir:** período default (mês corrente?) e se entram os "Top produtos" na v1.

---

## Ordem de execução sugerida
1. **Tópico 1** (segurança — base para tudo).
2. **Tópico 2** (correção de dados).
3. **Tópico 5** (feature de valor; já nasce escopada por empresa graças ao #1).

> Para executar: revise e me diga **"Aprovado, execute o tópico X"** (ou o plano todo). Posso aplicar um tópico por vez.
