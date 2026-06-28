# Análise Técnica — Fluxo Compra → Venda → Ajuste → Estoque

> **Contexto:** análise do código já implementado para os módulos de Compra, Venda e Ajuste de Estoque, feita antes de estruturar o cálculo de `saldo_atual` (view/query descrita em `detalhes-tabelas-modulos-3-ao-6.md` e `Módulo 5 - Estoque - explicação.md`).
> **Objetivo:** (1) documentar o fluxo para quem for ler depois entender o que cada camada faz; (2) listar inconsistências/achados que precisam de decisão **antes** de implementar o cálculo de saldo, porque o cálculo depende dos dados gravados aqui estarem corretos.

---

## 1. Visão geral do fluxo

```
COMPRA  → compra_itens  → movimentacoes_estoque (tipo=entrada)  + contas_pagar
VENDA   → venda_itens   → movimentacoes_estoque (tipo=saida)    + contas_receber
AJUSTE  → ajustes_estoque → movimentacoes_estoque (tipo=ajuste)
```

Todos os três fluxos seguem o padrão `Controller → Service → Repository`, e os três Services de domínio (`CompraService`, `VendasService`, `StockAdjustmentService`) **dependem de `StockServiceInterface`** para gravar a movimentação de estoque correspondente, dentro de uma `DB::transaction()`. Isso está correto e consistente nos três módulos.

---

## 2. Módulo Compra

**Arquivos:** `CompraController` → `CompraService` → `CompraRepository` (+ `StockService::proccessItensPurchase`)

1. `CompraCreateRequest` valida `itens.*.quantidade` como `required|integer|min:1` (sempre positivo) e injeta `company_id`/`store_id`/`user_id` via `AuthContext` (JWT) — cliente nunca define identidade.
2. `CompraService::store()`:
   - abre `DB::transaction()`
   - calcula `valor_total` = soma de `quantidade * valor_unitario` dos itens
   - `repository->store()` cria a `compra`
   - `repository->storeItens()` cria `compra_itens` (calcula `valor_total` de cada item)
   - `stockService->proccessItensPurchase($compra, $itens)` — para **cada item**, cria 1 linha em `movimentacoes_estoque`:
     - `tipo = entrada`
     - `quantidade = item.quantidade` (positivo, vem direto do item da compra)
     - `origem_tipo = compra`, `origem_id = compra.id`
3. `CompraResponseDTO::fromModel()` só serializa `itens` se a relação foi carregada (evita lazy load).

✅ Fluxo `entrada` está correto e consistente com a documentação do Módulo 5.

---

## 3. Módulo Venda

**Arquivos:** `VendasController` → `VendasService` → `VendasRepository` (+ `StockService::proccessItensSale`)

1. `VendasCreateRequest` valida `venda_itens.*.quantidade` como `required|integer|min:1`. Identidade também vem do `AuthContext`.
2. `VendasService::store()`:
   - abre `DB::transaction()`
   - calcula `valor_liquido = valor_bruto - taxa_marketplace - valor_frete`
   - `repository->store()` cria a `venda`
   - `repository->storeItens()` cria `venda_itens`
   - `stockService->proccessItensSale($venda, $itens)` — para **cada item**, cria 1 linha em `movimentacoes_estoque`:
     - `tipo = saida`
     - `quantidade = item.quantidade` (positivo)
     - `origem_tipo = venda`, `origem_id = venda.id`

✅ Fluxo `saida` está correto e simétrico ao de compra.

⚠️ **Observação (não corrigida nesta análise, é decisão de produto):** não há nenhuma checagem de `saldo_atual >= quantidade_vendida` antes de gravar a `saida`. Hoje é possível vender mais do que existe em estoque e o saldo fica negativo silenciosamente. Pode ser aceitável para o MVP (registra a venda, ajuste físico resolve depois), mas vale confirmar que essa é a decisão consciente — porque, uma vez que o cálculo de saldo existir, "saldo negativo" vai aparecer nos relatórios e alguém vai perguntar "isso é bug?".

---

## 4. Módulo Ajuste de Estoque

**Arquivos:** `StockAdjustmentController` → `StockAdjustmentService` → `StockAdjustmentRepository` (+ `StockService::proccessItensAdjustment`)

1. `StockAdjustmentCreateRequest` valida:
   - `itens.*.quantidade` → `required|integer|min:1` (**sempre positivo, ver Achado Crítico #1**)
   - `itens.*.motivo` → `in:perda,quebra,contagem_fisica,devolucao,outro`
2. `StockAdjustmentService::store()`:
   - abre `DB::transaction()`
   - **um item = uma linha em `ajustes_estoque`** (diferente de Compra/Venda, que agrupam itens sob um documento pai — aqui não existe "documento de ajuste", cada item é independente)
   - para cada `ajustes_estoque` criado, chama `stockService->proccessItensAdjustment($stockAdjustment)`, que cria 1 linha em `movimentacoes_estoque`:
     - `tipo = ajuste`
     - `quantidade = stockAdjustment.quantidade` (copiado **sem alteração** do valor validado, ou seja, sempre positivo hoje)
     - `origem_tipo = ajuste_manual`, `origem_id = ajustes_estoque.id`

---

## 5. Achados críticos (decisão necessária antes do cálculo de saldo)

### 5.1 — Sinal do ajuste de estoque (sua dúvida sobre números negativos)

**Onde:**
- [`database/migrations/2026_05_28_200002_create_ajustes_estoque_table.php:15`](../../../../../../git_projetos/Php/Laravel/SellerFlow/database/migrations/2026_05_28_200002_create_ajustes_estoque_table.php) — comentário original já dizia: `// Positivo = entrada, negativo = saída (perda, quebra)`
- [`app/Http/Requests/Adjustment/StockAdjustmentCreateRequest.php:25`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Http/Requests/Adjustment/StockAdjustmentCreateRequest.php) — `'itens.*.quantidade' => ['required', 'integer', 'min:1']`
- [`app/Services/Stock/StockService.php` — `proccessItensAdjustment()`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Services/Stock/StockService.php) — `quantidade: $stockAdjustment->quantidade` (cópia direta, sem `abs()`)

**Problema:** a fórmula de saldo (já documentada em `Módulo 5 - Estoque - explicação.md`) precisa saber se um `ajuste` **soma** ou **subtrai** do saldo, e isso vem do sinal de `ajustes_estoque.quantidade`. Mas a validação atual (`min:1`) **nunca permite valor negativo** — ou seja, `ajustes_estoque.quantidade` é sempre positivo. Resultado: **todo ajuste, independente do `motivo` (mesmo `perda` ou `quebra`), seria contado como ENTRADA no cálculo de saldo.** Um ajuste de "quebra de 5 unidades" aumentaria o saldo em vez de diminuir.

**Resposta direta à pergunta:** sim, **`ajustes_estoque.quantidade` deve aceitar números negativos** — é a tabela de **origem/intenção** (positivo = ajuste pra mais, negativo = ajuste pra menos), exatamente como o comentário da migration já previa. Já `movimentacoes_estoque.quantidade` **continua sempre positivo** (regra do projeto e do log), porque o `tipo` ali já é `ajuste` — quem carrega o sinal é a tabela de origem.

**Mudança recomendada (pequena, 2 pontos):**
1. `StockAdjustmentCreateRequest`: trocar `'itens.*.quantidade' => ['required','integer','min:1']` por algo como `['required','integer','not_in:0']` (qualquer inteiro não-zero, positivo ou negativo). `StockAdjustmentItemDTO::fromArray()` já faz `(int) $data['quantidade']`, então o sinal é preservado automaticamente — nenhuma mudança de DTO necessária.
2. `StockService::proccessItensAdjustment()`: trocar `quantidade: $stockAdjustment->quantidade` por `quantidade: abs($stockAdjustment->quantidade)`.

Com essas duas mudanças, a query/view de saldo discutida (com `LEFT JOIN ajustes_estoque ... CASE WHEN ae.quantidade > 0 / < 0`) funciona exatamente como documentado, **sem precisar de mais nenhuma alteração**.

> Observação opcional (não obrigatória pro MVP): hoje `motivo` não tem nenhuma relação obrigatória com o sinal — `contagem_fisica` pode ser `+5` (sobrou) ou `-3` (faltou), o que é correto/esperado. Não recomendo travar `motivo` × sinal por enquanto.

---

### 5.2 — Exclusão de Compra/Venda não reflete em `movimentacoes_estoque`

**Onde:**
- [`app/Repositories/Purchases/CompraRepository.php:65-71`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Repositories/Purchases/CompraRepository.php) — `delete()` apaga `compra_itens` + `compra`
- [`app/Repositories/Sales/VendasRepository.php:67-73`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Repositories/Sales/VendasRepository.php) — `delete()` apaga `venda_itens` + `venda`

**Problema:** as rotas `DELETE /api/v1/compra/{id}` e `DELETE /api/v1/vendas/{id}` estão **ativas e funcionais** (apiResource completo), mas o `delete()` de ambos os repositórios não toca em `movimentacoes_estoque`. Resultado: ao excluir uma compra/venda, as linhas de `entrada`/`saida` que ela gerou **continuam existindo**, com `origem_id` apontando para um registro que não existe mais. O saldo calculado fica permanentemente alterado por um documento que "não existe mais", sem nenhuma rastreabilidade.

Isso contraria o próprio princípio documentado no Módulo 5: *"Se a venda for cancelada, você sabe qual movimentação reverter"* — hoje, ao deletar, **nada é revertido e nada é limpo**.

**Decisão necessária (escolher uma linha):**
| Opção | Descrição | Trade-off |
|---|---|---|
| A. Bloquear exclusão | `Compra`/`Venda` com movimentação associada não podem ser deletadas (só "canceladas" via `status_id`) | Mais alinhado com sistemas financeiros/contábeis; exige fluxo de cancelamento |
| B. Cascade delete | Ao deletar, apagar também as `movimentacoes_estoque` com `origem_tipo+origem_id` correspondentes | Simples, mas quebra o princípio "log imutável" |
| C. Estorno automático | Ao deletar, criar uma movimentação contrária (se era `entrada`, lança `saida` de igual valor, e vice-versa) | Preserva auditoria total, mas a soma de duas linhas por evento é mais complexa de exibir |

> Esta análise não decide por você — só sinaliza que **isso afeta diretamente a confiabilidade do `saldo_atual`** e deveria ser resolvido antes (ou junto) da implementação do cálculo.

---

### 5.3 — `stock-adjustment` expõe `update`/`destroy` que quebram a imutabilidade

**Onde:**
- [`routes/api.php:52`](../../../../../../git_projetos/Php/Laravel/SellerFlow/routes/api.php) — `Route::apiResource('stock-adjustment', StockAdjustmentController::class)` (registra os 7 endpoints REST, incluindo `PUT` e `DELETE`)
- [`app/Services/Adjustment/StockAdjustmentService.php:57-67`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Services/Adjustment/StockAdjustmentService.php) — `update()`/`delete()` têm o comentário `//nao vai ultilizar`, mas estão **totalmente implementados e acessíveis**

**Problema:** o comentário `//nao vai ultilizar` é só um comentário — não bloqueia nada. `DELETE /api/v1/stock-adjustment/{id}` realmente apaga a linha de `ajustes_estoque`. Isso:
1. Contradiz a doc do Módulo 5: *"A movimentação é imutável: nunca se edita nem se apaga."*
2. Quebra o cálculo de saldo do Achado 5.1: a `movimentacoes_estoque.tipo='ajuste'` correspondente fica com `origem_id` órfão → o `LEFT JOIN ae.quantidade` retorna `NULL` → essa linha **não entra nem como positiva nem como negativa** no saldo, mas a `quantidade` dela continua fisicamente gravada em `movimentacoes_estoque` (inconsistência silenciosa).

**Recomendação:** restringir o apiResource a `Route::apiResource('stock-adjustment', StockAdjustmentController::class)->only(['index', 'show', 'store'])`, e remover (ou fazer retornar 405) os métodos `update`/`delete` do Service/Controller — alinhando código com a regra de negócio já documentada.

---

## 6. Achados secundários (cleanup, sem urgência)

| # | Onde | O quê |
|---|---|---|
| 6.1 | [`app/Models/Purchases/Compra.php:12`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Models/Purchases/Compra.php), [`app/Models/Sales/Venda.php:12`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Models/Sales/Venda.php) | `use App\Models\Stock\MovimentacaoEstoque;` — classe foi deletada (renomeada para `Stock`), import morto não usado em nenhum lugar do arquivo |
| 6.2 | [`app/DTOs/Stock/StockResponseDTO.php`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/DTOs/Stock/StockResponseDTO.php) | DTO completamente vazio (tudo comentado) — `GET /api/v1/stock` e `GET /api/v1/stock/{id}` retornam objetos `{}`. Não afeta o fluxo automático (compra/venda/ajuste chamam o repository direto), mas inviabiliza consultar o histórico de `movimentacoes_estoque` pela API |
| 6.3 | [`app/Http/Requests/Stock/StockCreateRequest.php:51-54`](../../../../../../git_projetos/Php/Laravel/SellerFlow/app/Http/Requests/Stock/StockCreateRequest.php) | `prepareForValidation()` usa `auth()->user()->company_id` (padrão diferente do resto do projeto, que usa `AuthContext::companyIds()->first()` via `validationData()`). Além disso `user_id`/`company_id` estão comentados em `rules()`, então `validated()` não os retorna. Se `POST /api/v1/stock` for chamado diretamente, `company_id` chega `null` no INSERT de uma coluna `NOT NULL DEFAULT 1` → erro de banco. Não afeta o fluxo automático (que não passa por essa Request), mas o endpoint está quebrado se alguém o chamar |

---

## 7. Próximos passos — cálculo de `saldo_atual`

A view/query de saldo (formato `LEFT JOIN movimentacoes_estoque + ajustes_estoque`, com `CASE WHEN ae.quantidade > 0 / < 0`) **depende diretamente do Achado 5.1 estar resolvido** — sem o sinal correto em `ajustes_estoque.quantidade`, a view vai calcular saldo errado para qualquer produto que já tenha sofrido um ajuste de `perda`/`quebra`.

Ordem sugerida:
1. Resolver 5.1 (sinal do ajuste) — migration de dados não é necessária ainda se não há registros em produção, só ajustar validação + `abs()`.
2. Decidir 5.2 (exclusão de compra/venda) — não bloqueia o cálculo de saldo em si, mas define se o saldo pode "descasar" de documentos deletados.
3. Resolver 5.3 (travar update/destroy do ajuste) — protege a integridade referencial usada pelo `LEFT JOIN`.
4. Criar a view `stock_balances` (Postgres) e os métodos `StockRepository::getBalance()` / `getAllBalances()`.
