---
tags: [sellerflow, codigo, modulo-3, compra, migration]
status: rascunho-codigo
explicacao: "[[Módulo 3 - Compra - explicação]]"
---

# Módulo 3 — Compra (código: migrations)

> Apenas as migrations. Conceito em [[Módulo 3 - Compra - explicação]].
> Depende de `fornecedores`, `forma_pagamentos`, `products`, `companies`.

```bash
php artisan make:migration create_compras_table
php artisan make:migration create_itens_compra_table
```

## compras (cabeçalho)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id();

            $table->foreignId('fornecedor_id')->constrained('fornecedores');
            $table->string('numero_nota')->nullable();         // nº da nota fiscal (opcional)
            $table->date('data_compra');

            // soma dos itens. Guardado para listagem rápida; recalculado pelo Service ao salvar.
            $table->decimal('valor_total', 10, 2)->default(0);

            $table->foreignId('forma_pagamento_id')->nullable()->constrained('forma_pagamentos');

            // 1 vencimento só nesta fase (parcelamento abstraído)
            $table->date('vencimento')->nullable();

            // rascunho | confirmada | cancelada  (confirmar dispara estoque + conta a pagar)
            $table->string('status')->default('rascunho');

            // compra pertence à EMPRESA
            $table->foreignId('company_id')->constrained('companies');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
```

## itens_compra (linhas)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('itens_compra', function (Blueprint $table) {
            $table->id();

            // apaga os itens junto se a compra for deletada (na prática usa-se cancelamento, não delete)
            $table->foreignId('compra_id')->constrained('compras')->cascadeOnDelete();

            $table->foreignId('produto_id')->constrained('products');
            $table->integer('quantidade');

            // preço de COMPRA fica no item (varia a cada compra), não no produto
            $table->decimal('valor_unitario', 10, 2);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itens_compra');
    }
};
```

**Pontos de atenção:**
- Os efeitos (entrada de estoque + conta a pagar) **não são migration** — são lógica do `CompraService::confirmar()` dentro de `DB::transaction()` (explicação §4). Fica para o doc de fluxo.
- `valor_total` guardado é uma denormalização consciente (performance de listagem). A fonte da verdade é a soma dos itens.
