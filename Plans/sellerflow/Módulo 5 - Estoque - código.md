---
tags: [sellerflow, codigo, modulo-5, estoque, migration]
status: rascunho-codigo
explicacao: "[[Módulo 5 - Estoque - explicação]]"
---

# Módulo 5 — Estoque (código: migrations)

> Apenas a(s) migration(s). Fluxo Service/Repository fica para outro momento.
> Conceito em [[Módulo 5 - Estoque - explicação]].

**Nota de nomenclatura:** uso `company_id` (convenção Laravel + bate com `stores.company_id`). Se quiser `id_company`, troque o nome da coluna e use `->constrained('companies')` explícito.

**Ordem:** esta migration depende de `companies` e `products` já existirem (e existem). O timestamp do nome do arquivo precisa ser **posterior** ao deles.

```bash
php artisan make:migration create_movimentacoes_estoque_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movimentacoes_estoque', function (Blueprint $table) {
            $table->id();

            // produto que sofreu a movimentação
            $table->foreignId('produto_id')->constrained('products');

            // entrada | saida | ajuste
            // string (não enum): no Postgres alterar um enum exige ALTER TYPE, doloroso.
            // a validação dos valores aceitos fica na camada de aplicação (Enum PHP / Rule).
            $table->string('tipo');

            // SEMPRE positivo. O 'tipo' decide se soma ou subtrai no cálculo do saldo.
            $table->integer('quantidade');

            // vínculo polimórfico com a CAUSA da movimentação.
            // origem_tipo: compra | venda | ajuste_manual
            // origem_id:   id do documento de origem (null quando ajuste manual avulso)
            $table->string('origem_tipo')->nullable();
            $table->unsignedBigInteger('origem_id')->nullable();

            // motivo livre — usado principalmente no ajuste manual (perda, quebra, contagem)
            $table->string('observacao')->nullable();

            // ESTOQUE PERTENCE À EMPRESA, não à loja (ver explicação §2).
            $table->foreignId('company_id')->constrained('companies');

            // movimentação é IMUTÁVEL: nasce e nunca é editada -> só created_at, sem updated_at.
            $table->timestamp('created_at')->useCurrent();

            // "todas as movimentações da compra nº X" / da venda nº Y
            $table->index(['origem_tipo', 'origem_id']);
            // acelera o cálculo de saldo por produto dentro da empresa
            $table->index(['company_id', 'produto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_estoque');
    }
};
```

**Pontos de atenção:**
- Não há coluna `saldo` em lugar nenhum — saldo é calculado (explicação §1 e §3).
- `quantidade` é `integer`. Se algum dia vender fração (peso), trocar para `decimal`.
- Alternativa ao par manual `origem_tipo`/`origem_id`: `$table->nullableMorphs('origem')` — mas gera `origem_type`/`origem_id` (sufixo `_type`). Mantive manual para o nome ficar em PT.
