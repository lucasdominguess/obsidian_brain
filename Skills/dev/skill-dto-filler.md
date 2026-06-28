---
tags:
  - skill/backend
  - skill/laravel
  - skill/dto
  - skill/scaffolding
---

# Skill: Preenchedor de DTOs + FormRequests a partir do schema

> **Propósito:** preencher os placeholders vazios gerados pelo `make:crud` (CommandDTO, ResponseDTO,
> CreateRequest, UpdateRequest) inferindo campos, tipos e regras de validação a partir da Model + migrates,
> respeitando o [fluxo canônico](skill-layers.md). Complementa o gerador `make:crud` (que cria a estrutura);
> esta skill faz o **preenchimento semântico** — o passo que exige julgamento e por isso não é um comando.

**Gatilhos:** "preencha as dtos e requests da model X", "popule os valores da request e dto de vendas".

---

## 1. Entrada
O usuário menciona uma **model** (ex.: "vendas", "Venda", "Product"). A skill resolve os arquivos relacionados.

## 2. Localizar e ler
- **Model** (`app/Models/**/{Nome}.php`, case-insensitive, tenta singular/plural):
  - `$table` → **nome real da tabela** (não pluralizar a classe).
  - `$fillable`, `$hidden` (não vão pro ResponseDTO), `$casts` (`decimal:2`, `date`, `boolean`, Enum class).
  - métodos de relação (`belongsTo`/`hasOne`/`hasMany`) e a coluna FK do 2º arg.
- **Migrates** (`database/migrations/*`): ler **todas** que tocam a tabela — `Schema::create('tabela'` **e**
  `Schema::table('tabela'` (alterações posteriores). Não parar na `create_*_table`.
- **Controller / Service / Repository**: confirmar nomes reais das classes DTO/Request, o param do route model
  binding (usado no `unique...ignore`) e o que o Repository carrega.

> ⚠️ O `make:crud` pode gerar nomes que divergem da Model (ex.: Model `Venda` singular, scaffold `VendasDTO`).
> **Sempre** operar sobre as classes que o Controller/Service realmente referenciam.

## 3. Selecionar colunas
`$fillable` ∩ colunas da migrate. Excluir sempre `id`, `created_at`, `updated_at`, `deleted_at`.
Colunas com `default()` gerenciadas pelo sistema (ex.: valor calculado, `status_id` default) → deixar
comentadas e **perguntar** se entram.

## 4. Mapa tipo → regra + cast

| Migrate / cast                        | Regra Create                                  | Cast CommandDTO          | Tipo ResponseDTO              |
|---------------------------------------|-----------------------------------------------|--------------------------|-------------------------------|
| `string('x', N)`                      | `'string', 'max:N'`                           | `?string`                | `string` / `?string`          |
| `text` / `longText`                   | `'string'`                                    | `?string`                | `?string`                     |
| `integer` / `bigInteger`              | `'integer'`                                   | `?int`                   | `int` / `?int`                |
| `foreignId('x_id')->constrained('T')` | `'integer', 'exists:T,id'`                    | `?int`                   | `int` ou relação (§7)         |
| `decimal(p, s)`                       | `'numeric', 'min:0', 'decimal:0,s'`           | `?float` via `(float)`   | `float` via `(float)`         |
| `float` / `double`                    | `'numeric'`                                   | `?float` via `(float)`   | `float`                       |
| `boolean`                             | `'boolean'`                                   | `?bool` via `(bool)`     | `bool`                        |
| `date`                                | `'date'`                                       | `?string`                | `?string` via `?->toDateString()` |
| `dateTime` / `timestamp`              | `'date'`                                       | `?string`                | `?string` via `?->toDateTimeString()` |
| `json`                                | `'array'`                                      | `?array`                 | `?array`                      |
| `enum(...)` / cast Enum class         | `Rule::enum(Enum::class)` ou `Rule::in([...])` | tipo enum / `?string`    | mesmo                         |

Inferir por nome/constraints:
- `nullable()` → `'nullable'`; senão (e sem default) → `'required'`.
- `unique()` → Create `'unique:tabela,col'`; Update `Rule::unique('tabela','col')->ignore($currentId)`.
- coluna `email` → `'email'`.
- **alvo do `exists`** vem do `->constrained('T')` (ou 2º arg do `belongsTo`). **Nunca pluralizar a FK.**
  Ex. real: `status_id` → `exists:status,id` (tabela `status`, singular).

## 5. Create vs Update
- **Create:** obrigatórios `'required'`; nullable `'nullable'`; `unique:tabela,col`.
- **Update:** tudo vira `'sometimes'` (update parcial); nullable mantém `'nullable'` após `'sometimes'`;
  unique → `Rule::unique('tabela','col')->ignore($currentId)` com
  `$currentId = $this->route('{paramRota}')?->id;` (param lido do Controller). `use Illuminate\Validation\Rule;`.

## 6. Auxiliares da Request
`messages()` em **toda** request, só com as chaves de regra realmente usadas:

```php
public function messages(): array
{
    return [
        'required' => 'O campo :attribute é obrigatório.',
        'string'   => 'O campo :attribute deve ser uma string.',
        'min'      => 'O campo :attribute deve ter no mínimo :min caracteres.',
        'max'      => 'O campo :attribute deve ter no máximo :max caracteres.',
        'unique'   => 'O campo :attribute já está em uso.',
        'integer'  => 'O campo :attribute deve ser um número inteiro.',
        'exists'   => 'O campo :attribute deve existir na tabela :table.',
    ];
}
```

`attributes()` e `prepareForValidation()` **vazias** (esqueleto p/ preenchimento manual):

```php
public function attributes(): array
{
    return [
        //
    ];
}

protected function prepareForValidation(): void
{
    //
}
```

## 7. CommandDTO e ResponseDTO
- **CommandDTO:** construtor `readonly` nullable; `fromRequest()` com named args + cast numérico
  (`isset(...) ? (float) ... : null`); `toArray()` **com** `array_filter(fn($v)=>!is_null($v))`.
- **ResponseDTO:** expõe colunas **exceto** `$hidden`, inclui `id`; `toArray()` **SEM** `array_filter`
  (nullable aparece como `null`); `decimal`→`(float)`, `date`→`?->toDateString()`.
- **Relações:** `belongsTo` com `XResponseDTO` existente → candidata a aninhar
  (`fornecedor: $model->fornecedor ? FornecedorResponseDTO::fromModel($model->fornecedor) : null`).
  **Não aninhar tudo** (models como `Venda` têm 8 relações). **Propor** conjunto enxuto e **perguntar**.
  Ao aninhar, **fechar o ciclo no Repository** (`with()` no index, `->load()` no show via `withRelations()`)
  pra evitar N+1 — avisar antes de alterar o Repository.

## 8. Idempotência
Preencher **só** placeholders vazios; conteúdo real → mostrar diff e perguntar. Não tocar em `authorize()`.
Código em **inglês**, comentários em **PT-BR**, sem PHPDoc descritivo.

---

## Relacionados
- [skill-layers.md](skill-layers.md) — fluxo canônico (contrato das camadas).
- [skill-postman-crud.md](skill-postman-crud.md) — geração de coleção Postman a partir do CRUD.
- [skill-secur.md](skill-secur.md) — revisão de segurança das regras de validação.
