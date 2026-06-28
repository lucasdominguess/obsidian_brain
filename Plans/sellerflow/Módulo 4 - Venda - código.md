---
tags: [sellerflow, codigo, modulo-4, venda, migration]
status: rascunho-codigo
explicacao: "[[Módulo 4 - Venda - explicação]]"
---

# Módulo 4 — Venda (código: migrations)

> Apenas as migrations. Conceito em [[Módulo 4 - Venda - explicação]].
> Depende de `market_places`, `products`, `companies`.

```bash
php artisan make:migration create_vendas_table
php artisan make:migration create_itens_venda_table
```

## vendas (cabeçalho)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vendas', function (Blueprint $table) {
            $table->id();

            // em qual marketplace vendeu (Shopee, ML...). Alternativa: store_id, se quiser amarrar à loja.
            $table->foreignId('marketplace_id')->constrained('market_places');
            $table->string('numero_pedido')->nullable();       // nº do pedido no marketplace (ex. SHP123)
            $table->date('data_venda');

            // composição do valor — guardar os 4 facilita a auditoria do que entra no caixa
            $table->decimal('valor_bruto', 10, 2)->default(0);   // soma dos itens
            $table->decimal('valor_taxas', 10, 2)->default(0);   // taxa do marketplace (sugerida por market_places)
            $table->decimal('valor_frete', 10, 2)->default(0);   // frete patrocinado / desconto de envio
            $table->decimal('valor_liquido', 10, 2)->default(0); // bruto - taxas - frete -> vira a conta a receber

            $table->date('previsao_repasse')->nullable();        // quando o marketplace deposita

            // rascunho | confirmada | cancelada (confirmar dispara saída de estoque + conta a receber)
            $table->string('status')->default('rascunho');

            // venda pertence à EMPRESA (e registra o marketplace acima)
            $table->foreignId('company_id')->constrained('companies');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendas');
    }
};
```

## itens_venda (linhas)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('itens_venda', function (Blueprint $table) {
            $table->id();

            $table->foreignId('venda_id')->constrained('vendas')->cascadeOnDelete();
            $table->foreignId('produto_id')->constrained('products');
            $table->integer('quantidade');

            // preço de VENDA por unidade praticado nesta venda
            $table->decimal('valor_unitario', 10, 2);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itens_venda');
    }
};
```

**Pontos de atenção:**
- O **erro clássico** (explicação §5): a conta a receber usa `valor_liquido`, **nunca** `valor_bruto`.
- `valor_taxas` é guardado como valor **efetivo** da venda, não recalculado depois a partir de `market_places.taxa_percentual` (a taxa do cadastro pode mudar e bagunçaria vendas antigas).
- Decisão em aberto: `marketplace_id` vs `store_id`. Como a `store` já é (empresa + marketplace), usar `store_id` amarraria a venda à loja específica. Mantive `marketplace_id` + `company_id` conforme a explicação; reavalie se as telas forem por loja.
- Os efeitos (saída de estoque + conta a receber) ficam no `VendaService::confirmar()` em `DB::transaction()`.
