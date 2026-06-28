---
tags: [sellerflow, codigo, modulo-6, financeiro, migration]
status: rascunho-codigo
explicacao: "[[Módulo 6 - Financeiro - explicação]]"
---

# Módulo 6 — Financeiro (código: migrations)

> Apenas as migrations. Conceito em [[Módulo 6 - Financeiro - explicação]].
> **Fluxo de caixa NÃO tem migration** — é uma consulta calculada sobre estas duas tabelas (explicação §5).

**Nota:** `company_id` em vez de `id_company` (convenção Laravel). Depende de `companies`, `categoria_financeiras`, `fornecedores`, `forma_pagamentos`.

```bash
php artisan make:migration create_contas_a_pagar_table
php artisan make:migration create_contas_a_receber_table
```

## contas_a_pagar

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contas_a_pagar', function (Blueprint $table) {
            $table->id();

            $table->string('descricao');                  // "Compra nº 7 - Fornecedor X" ou "Aluguel maio"
            $table->decimal('valor', 10, 2);
            $table->date('vencimento');                    // data limite para pagar
            $table->date('pago_em')->nullable();           // null = ainda pendente; preenchido = pago

            // pendente | pago | cancelado
            $table->string('status')->default('pendente');

            // classifica a saída (aluguel, embalagem, compra de mercadoria...) — obrigatória
            $table->foreignId('categoria_financeira_id')->constrained('categoria_financeiras');

            // opcionais
            $table->foreignId('fornecedor_id')->nullable()->constrained('fornecedores');
            $table->foreignId('forma_pagamento_id')->nullable()->constrained('forma_pagamentos');

            // origem: 'compra' + id (gerada automaticamente) OU ambos null (despesa manual)
            $table->string('origem_tipo')->nullable();
            $table->unsignedBigInteger('origem_id')->nullable();

            $table->foreignId('company_id')->constrained('companies');
            $table->timestamps();

            $table->index(['origem_tipo', 'origem_id']);
            $table->index(['status', 'vencimento']);       // projeção do fluxo de caixa
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contas_a_pagar');
    }
};
```

## contas_a_receber

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contas_a_receber', function (Blueprint $table) {
            $table->id();

            $table->string('descricao');                       // "Venda pedido #SHP123"
            $table->decimal('valor', 10, 2);                   // VALOR LÍQUIDO (já sem taxas/frete) — ver Módulo 4
            $table->date('previsao_recebimento');              // quando o marketplace deve repassar
            $table->date('recebido_em')->nullable();           // null = pendente; preenchido = recebido

            // pendente | recebido | cancelado
            $table->string('status')->default('pendente');

            // origem: 'venda' + id (automática) OU ambos null (receita manual)
            $table->string('origem_tipo')->nullable();
            $table->unsignedBigInteger('origem_id')->nullable();

            $table->foreignId('company_id')->constrained('companies');
            $table->timestamps();

            $table->index(['origem_tipo', 'origem_id']);
            $table->index(['status', 'previsao_recebimento']); // projeção do fluxo de caixa
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contas_a_receber');
    }
};
```

**Pontos de atenção:**
- `pago_em` / `recebido_em` separados do `status` de propósito: a data real é o que vira fluxo de caixa "realizado" (explicação §4 e §5).
- `previsao_recebimento` × `recebido_em` separados → guarda o atraso de repasse para análise futura.
- Sem tabela de fluxo de caixa: é `SELECT` agregando estas duas (explicação §5).
- Quando implementar parcelas, **nada muda aqui** — a compra/venda só passa a inserir N linhas em vez de 1.
