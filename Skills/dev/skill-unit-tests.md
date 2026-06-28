---
tags:
  - skill/qa
  - skill/tests
  - skill/laravel
  - skill/pest
  - skill/unit
---

# Skill: Testes Unitarios e de Feature Laravel

> **Gatilho:** Use esta skill quando o usuario pedir para escrever, criar ou adicionar testes para uma camada especifica do projeto Laravel. Frases de ativacao: "escreve os testes de X", "cria os testes unitarios para Y", "adiciona testes na Service Z", "testa o Repository de W", "cobre essa camada com testes", "quero testes para esse fluxo".

## Quando NAO usar

- O usuario quer apenas **rodar** os testes existentes — execute `./vendor/bin/pest` diretamente.
- O usuario quer **refatorar** codigo sem escrever testes — use `skill-layers.md`.
- O usuario quer entender **o que** cada camada faz — explique sem criar arquivos.
- Rename, typo ou formatacao de testes ja existentes — faca a edicao pontual sem este algoritmo.

---

## 1. Filosofia

Esta skill e operacional — define **como** testar. Para entender **por que** e **quando** aplicar TDD, consulte `Skills/dev/skill-qa.md`. Para entender as responsabilidades de cada camada, consulte `Skills/dev/skill-layers.md`.

**Regra central:** teste o **contrato publico** de cada camada, nunca sua implementacao interna.

- DTO: contrato e `fromRequest()` retornar campos corretos e `toArray()` filtrar (ou preservar) nulos.
- Service: contrato e receber DTO e retornar ResponseDTO; o Repository deve ser chamado corretamente.
- Repository: contrato e persistir e recuperar dados com relacoes carregadas.
- Controller: contrato e receber HTTP e devolver JSON com status e envelope corretos.

---

## 2. Nomenclatura e Localizacao dos Arquivos

```
tests/
  Unit/
    DTOs/          ← CommandDTO e ResponseDTO
    Services/      ← Services (mock do Repository)
  Feature/
    Repositories/  ← Repositories (banco real)
    Http/          ← Controllers e validacao de FormRequest
```

- Nome do arquivo: `{NomeDaClasse}Test.php` (ex: `ProductServiceTest.php`)
- Namespace do arquivo:
  - `Tests\Unit\DTOs`
  - `Tests\Unit\Services`
  - `Tests\Feature\Repositories`
  - `Tests\Feature\Http`

### Comentario obrigatorio acima de cada it() / test()

Todo bloco de teste deve ter um comentario de uma linha explicando o que ele verifica:

```php
// verifica que o campo name e mapeado corretamente a partir do payload validado
it('maps name from validated array', function () {
    ...
});
```

O comentario deve descrever o **comportamento verificado**, nao o nome do metodo.

---

## 3. Como Testar Cada Camada

---

### 3a. CommandDTO e ResponseDTO (Unit puro)

**Caracteristica:** classes `readonly` sem dependencias externas. Nenhum mock necessario.

**O que testar no CommandDTO:**
- `fromRequest(array $validated)` mapeia todos os campos corretamente
- `toArray()` filtra campos nulos (`array_filter`)
- `toArray()` preserva campos com valor `false` ou `0` (nao confundir com nulo)

**O que testar no ResponseDTO:**
- `fromModel(Model $model)` projeta todos os campos publicos
- `toArray()` preserva campos nulos como `null` (nao filtra)
- `fromModel()` mapeia relacoes como arrays, nao como objetos Eloquent

**Localizacao:** `tests/Unit/DTOs/ProductDTOTest.php`

```php
<?php

namespace Tests\Unit\DTOs;

use App\DTOs\Product\ProductDTO;
use App\DTOs\Product\ProductResponseDTO;
use App\Models\Product\Product;

// agrupa todos os testes do ProductDTO
describe('ProductDTO', function () {

    // verifica que todos os campos obrigatorios sao mapeados corretamente do payload
    it('maps required fields from validated array', function () {
        $dto = ProductDTO::fromRequest([
            'name'  => 'Produto Teste',
            'price' => 29.99,
            'active' => true,
        ]);

        expect($dto->name)->toBe('Produto Teste')
            ->and($dto->price)->toBe(29.99)
            ->and($dto->active)->toBeTrue();
    });

    // verifica que campos nulos sao removidos no toArray (permite update parcial)
    it('filters null fields in toArray', function () {
        $dto = ProductDTO::fromRequest([
            'name'        => 'Produto',
            'description' => null,
        ]);

        expect($dto->toArray())->not->toHaveKey('description');
    });

    // verifica que false e 0 nao sao removidos junto com nulos no toArray
    it('keeps false and zero values in toArray', function () {
        $dto = ProductDTO::fromRequest([
            'name'   => 'Produto',
            'active' => false,
            'stock'  => 0,
        ]);

        expect($dto->toArray())
            ->toHaveKey('active')
            ->toHaveKey('stock');
    });
});

// agrupa todos os testes do ProductResponseDTO
describe('ProductResponseDTO', function () {

    // verifica que fromModel projeta os campos corretos a partir do modelo Eloquent
    it('projects fields from model', function () {
        $model = Product::factory()->make([
            'name'  => 'Produto Factory',
            'price' => 19.99,
        ]);

        $dto = ProductResponseDTO::fromModel($model);

        expect($dto->name)->toBe('Produto Factory')
            ->and($dto->price)->toBe(19.99);
    });

    // verifica que campos nulos aparecem como null no toArray (nao sao filtrados)
    it('preserves null fields in toArray', function () {
        $model = Product::factory()->make(['description' => null]);
        $dto   = ProductResponseDTO::fromModel($model);

        expect($dto->toArray())->toHaveKey('description')
            ->and($dto->toArray()['description'])->toBeNull();
    });
});
```

---

### 3b. Service (Unit + createMock)

**Caracteristica:** testa regras de negocio isoladas do banco. O Repository e substituido por um mock via `createMock()`.

**O que testar:**
- Caminho feliz: metodo retorna ResponseDTO correto
- Dependencia chamada: Repository foi chamado com os dados esperados (`expects($this->once())`)
- Caminho de erro: exception lancada quando dado nao e encontrado
- Multiplas escritas: `DB::transaction()` garante atomicidade (testar via comportamento, nao inspecao interna)

**Localizacao:** `tests/Unit/Services/ProductServiceTest.php`

```php
<?php

namespace Tests\Unit\Services;

use App\Contracts\Repositories\Product\ProductRepositoryInterface;
use App\DTOs\Product\ProductDTO;
use App\DTOs\Product\ProductResponseDTO;
use App\Models\Product\Product;
use App\Services\Product\ProductService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

// agrupa todos os testes do ProductService
describe('ProductService', function () {

    beforeEach(function () {
        $this->repositoryMock = $this->createMock(ProductRepositoryInterface::class);
        $this->service        = new ProductService($this->repositoryMock);
    });

    // verifica que store persiste o produto e retorna um ResponseDTO valido
    it('stores a product and returns ResponseDTO', function () {
        $dto   = ProductDTO::fromRequest(['name' => 'Teste', 'price' => 10.00]);
        $model = Product::factory()->make(['name' => 'Teste', 'price' => 10.00]);

        $this->repositoryMock
            ->expects($this->once())
            ->method('create')
            ->with($dto->toArray())
            ->willReturn($model);

        $result = $this->service->store($dto);

        expect($result)->toBeInstanceOf(ProductResponseDTO::class)
            ->and($result->name)->toBe('Teste');
    });

    // verifica que findById retorna ResponseDTO quando o produto existe
    it('returns ResponseDTO for existing product', function () {
        $model = Product::factory()->make(['id' => 1, 'name' => 'Existente']);

        $this->repositoryMock
            ->expects($this->once())
            ->method('findById')
            ->with(1)
            ->willReturn($model);

        $result = $this->service->findById(1);

        expect($result)->toBeInstanceOf(ProductResponseDTO::class);
    });

    // verifica que findById lanca exception quando o produto nao e encontrado
    it('throws ModelNotFoundException when product does not exist', function () {
        $this->repositoryMock
            ->expects($this->once())
            ->method('findById')
            ->with(999)
            ->willThrowException(new ModelNotFoundException());

        expect(fn () => $this->service->findById(999))
            ->toThrow(ModelNotFoundException::class);
    });

    // verifica que update passa os dados corretos ao repository e retorna ResponseDTO atualizado
    it('updates product and returns updated ResponseDTO', function () {
        $dto   = ProductDTO::fromRequest(['name' => 'Atualizado']);
        $model = Product::factory()->make(['id' => 1, 'name' => 'Atualizado']);

        $this->repositoryMock
            ->expects($this->once())
            ->method('update')
            ->with(1, $dto->toArray())
            ->willReturn($model);

        $result = $this->service->update(1, $dto);

        expect($result)->toBeInstanceOf(ProductResponseDTO::class)
            ->and($result->name)->toBe('Atualizado');
    });

    // verifica que destroy delega a exclusao ao repository sem retornar dados
    it('destroys product by delegating to repository', function () {
        $this->repositoryMock
            ->expects($this->once())
            ->method('delete')
            ->with(1);

        $this->service->destroy(1);
    });
});
```

**Sintaxe de referencia rapida do createMock:**

```php
// retorna um valor fixo
->expects($this->once())->method('nomeMetodo')->willReturn($valor);

// lanca uma exception
->expects($this->once())->method('nomeMetodo')->willThrowException(new MinhaException());

// aceita qualquer numero de chamadas
->expects($this->any())->method('nomeMetodo')->willReturn($valor);

// garante que o metodo NUNCA foi chamado
->expects($this->never())->method('nomeMetodo');

// retorna valores diferentes em chamadas consecutivas
->expects($this->exactly(2))->method('nomeMetodo')
    ->willReturnOnConsecutiveCalls($valor1, $valor2);
```

---

### 3c. Repository (Feature + RefreshDatabase)

**Caracteristica:** testa acesso real ao banco. Usa `RefreshDatabase` para isolar cada teste.

**O que testar:**
- `create()` persiste os dados e retorna Model com relacoes carregadas
- `findById()` retorna Model correto; lanca exception para ID inexistente
- `update()` aplica as alteracoes e retorna Model atualizado com relacoes
- `delete()` remove o registro do banco

**Localizacao:** `tests/Feature/Repositories/ProductRepositoryTest.php`

```php
<?php

namespace Tests\Feature\Repositories;

use App\Models\Product\Product;
use App\Repositories\Product\ProductRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// agrupa todos os testes do ProductRepository
describe('ProductRepository', function () {

    beforeEach(function () {
        $this->repository = app(ProductRepository::class);
    });

    // verifica que create persiste o produto e retorna o model com relacoes carregadas
    it('creates a product and returns model with relations loaded', function () {
        $data   = ['name' => 'Produto Repo', 'price' => 19.99, 'active' => true];
        $result = $this->repository->create($data);

        expect($result)->toBeInstanceOf(Product::class)
            ->and($result->name)->toBe('Produto Repo');

        $this->assertDatabaseHas('products', ['name' => 'Produto Repo']);
    });

    // verifica que findById retorna o model correto para um ID existente
    it('returns correct model for existing id', function () {
        $product = Product::factory()->create(['name' => 'Buscavel']);

        $result = $this->repository->findById($product->id);

        expect($result)->toBeInstanceOf(Product::class)
            ->and($result->id)->toBe($product->id);
    });

    // verifica que findById lanca exception para ID que nao existe no banco
    it('throws ModelNotFoundException for nonexistent id', function () {
        expect(fn () => $this->repository->findById(99999))
            ->toThrow(ModelNotFoundException::class);
    });

    // verifica que update aplica as alteracoes e retorna model com os novos valores
    it('updates product fields and returns updated model', function () {
        $product = Product::factory()->create(['name' => 'Antigo']);

        $result = $this->repository->update($product->id, ['name' => 'Novo']);

        expect($result->name)->toBe('Novo');
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Novo']);
    });

    // verifica que delete remove o registro do banco de dados
    it('deletes product from database', function () {
        $product = Product::factory()->create();

        $this->repository->delete($product->id);

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    });
});
```

---

### 3d. Controller (Feature HTTP)

**Caracteristica:** testa o fluxo HTTP completo. Usa `actingAs()` para autenticacao e metodos `*Json()` para simular requests.

**O que testar:**
- POST/PUT retornam status e envelope corretos com dados validos
- POST/PUT retornam 422 com `errors` quando campos obrigatorios estao ausentes
- GET retorna lista ou item com estrutura correta
- DELETE retorna status correto e remove do banco
- Rotas protegidas retornam 401 sem autenticacao

**Localizacao:** `tests/Feature/Http/ProductControllerTest.php`

```php
<?php

namespace Tests\Feature\Http;

use App\Models\Accout\User;
use App\Models\Product\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// agrupa todos os testes dos endpoints de produto
describe('Product endpoints', function () {

    // verifica que POST /product cria o produto e retorna 201 com os dados no envelope
    it('creates a product and returns 201', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/product', [
                'name'  => 'Produto Novo',
                'price' => 29.99,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Produto Novo');

        $this->assertDatabaseHas('products', ['name' => 'Produto Novo']);
    });

    // verifica que POST /product retorna 422 quando o campo name esta ausente
    it('returns 422 when name is missing on create', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/product', ['price' => 10.00])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['name']]);
    });

    // verifica que GET /product lista todos os produtos com estrutura de paginacao
    it('lists products with pagination structure', function () {
        $user = User::factory()->create();
        Product::factory()->count(3)->create();

        $this->actingAs($user)
            ->getJson('/api/v1/product')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['items', 'pagination']]);
    });

    // verifica que GET /product/:id retorna os dados do produto correto
    it('returns correct product on show', function () {
        $user    = User::factory()->create();
        $product = Product::factory()->create(['name' => 'Detalhado']);

        $this->actingAs($user)
            ->getJson("/api/v1/product/{$product->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Detalhado');
    });

    // verifica que GET /product/:id retorna 404 para produto inexistente
    it('returns 404 for nonexistent product', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/product/99999')
            ->assertStatus(404)
            ->assertJsonPath('success', false);
    });

    // verifica que PUT /product/:id atualiza o produto e retorna os dados novos
    it('updates product and returns updated data', function () {
        $user    = User::factory()->create();
        $product = Product::factory()->create(['name' => 'Antigo']);

        $this->actingAs($user)
            ->putJson("/api/v1/product/{$product->id}", ['name' => 'Atualizado'])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Atualizado');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Atualizado']);
    });

    // verifica que DELETE /product/:id remove o produto e retorna sucesso
    it('deletes product and returns success', function () {
        $user    = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->deleteJson("/api/v1/product/{$product->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    });

    // verifica que rotas protegidas retornam 401 sem autenticacao
    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/product')->assertStatus(401);
    });
});
```

---

### 3e. FormRequest (via HTTP)

**Abordagem:** teste a validacao do FormRequest por meio de requisicoes HTTP reais ao Controller, nao instanciando o FormRequest diretamente.

**Razao:** instanciar o FormRequest fora do ciclo HTTP nao garante que as regras estao registradas corretamente no Controller. O teste via HTTP e mais confiavel.

**O que testar:**
- Cada campo `required`: enviar payload sem ele e verificar `422` + chave correta em `errors`
- Campos com `in:` ou `Rule::in()`: enviar valor invalido e verificar `422`
- Campos com `unique`: enviar valor ja existente e verificar `422`
- Nao duplicar validacoes ja cobertas nos testes de Controller — use um `describe('validation')` dentro do mesmo arquivo

```php
// agrupa os testes de validacao do FormRequest de criacao de produto
describe('ProductRequest validation', function () {

    // verifica que price e obrigatorio ao criar produto
    it('requires price on create', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/product', ['name' => 'Produto sem preco'])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['price']]);
    });

    // verifica que status invalido e rejeitado pelo FormRequest
    it('rejects invalid status value', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/product', [
                'name'   => 'Produto',
                'price'  => 10.00,
                'status' => 'invalido',
            ])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['status']]);
    });
});
```

---

## 4. Algoritmo de Execucao Passo a Passo

### Passo 1 — Identificar a camada a testar

Pergunte (ou infira pelo contexto): qual camada — DTO, Service, Repository, Controller?

### Passo 2 — Ler os arquivos da camada

Leia o arquivo da classe a ser testada. Identifique:
- Metodos publicos (cada um pode virar um `it()`)
- Dependencias injetadas no construtor (alvos do mock)
- Exceptions lancadas (casos de erro a cobrir)

### Passo 3 — Ler a interface do Repository (se testando Service)

A interface define o contrato exato do mock. Leia `app/Contracts/Repositories/...` antes de criar o `createMock()`.

### Passo 4 — Ler a migration e a Factory da Model

- Migration: campos, tipos, nullable, enum values
- Factory: valores padrao realistas para reuso nos testes

### Passo 5 — Definir os casos de teste

Para cada metodo publico, liste:
1. Caminho feliz (dados validos, retorno correto)
2. Caminho de validacao invalida (campo ausente, formato errado)
3. Caminho de nao encontrado (ID inexistente)
4. Caminho de erro esperado (exception especifica)

### Passo 6 — Criar o arquivo no diretorio correto

Verificar se o diretorio ja existe; criar se necessario. Definir namespace correto.

### Passo 7 — Escrever os testes

- Um `describe()` por classe
- Um `it()` por caso de teste
- Comentario `//` de uma linha antes de cada `it()`
- `beforeEach()` para setup compartilhado

### Passo 8 — Rodar apenas os novos testes

```bash
./vendor/bin/pest --filter="NomeDaClasseTest"
```

### Passo 9 — Corrigir falhas e rodar a suite completa

```bash
./vendor/bin/pest
```

Corrija autonomamente falhas de tipagem ou assertiva errada. Reporte ao usuario falhas que exigem decisao de negocio.

---

## 5. Helpers e Hooks Pest Uteis

```php
// setup antes de cada teste no describe
beforeEach(function () {
    $this->mock = $this->createMock(MinhaInterface::class);
});

// verifica instancia
expect($result)->toBeInstanceOf(MinhaClasse::class);

// verifica array completo
expect($result->toArray())->toMatchArray(['name' => 'Teste', 'active' => true]);

// verifica chave presente / ausente
expect($array)->toHaveKey('name');
expect($array)->not->toHaveKey('password');

// verifica exception lancada
expect(fn () => $service->findById(999))->toThrow(ModelNotFoundException::class);

// verifica que relacao esta carregada no model
expect($model->relationLoaded('category'))->toBeTrue();

// testa multiplos inputs com o mesmo teste
it('rejects invalid status', function (string $status) {
    // ...
})->with(['invalido', 'pendente_x', '']);

// verifica banco
$this->assertDatabaseHas('products', ['name' => 'Produto']);
$this->assertDatabaseMissing('products', ['id' => $id]);
```

---

## 6. Checklist de Escrita

Antes de finalizar os testes:

- [ ] Arquivo no diretorio correto com namespace correto.
- [ ] `uses(RefreshDatabase::class)` presente em arquivos que tocam o banco.
- [ ] Comentario `//` de uma linha acima de cada `it()` descrevendo o comportamento verificado.
- [ ] Um `describe()` por classe testada.
- [ ] `beforeEach()` usado para evitar repeticao de setup.
- [ ] Mock criado via `$this->createMock(Interface::class)`, nao `new Implementacao()`.
- [ ] Service instanciado com o mock injetado no construtor — nao via container.
- [ ] Repository testado via `app(Repository::class)` — usa o container com a binding real.
- [ ] Cada caminho de erro (nao encontrado, invalido, sem auth) tem seu proprio `it()`.
- [ ] Factories usadas para criar dados — sem arrays hardcoded de 10+ campos.
- [ ] `./vendor/bin/pest` passa sem falhas antes de reportar conclusao.

---

## 7. Regras Inegociaveis

- Teste o contrato publico, nunca a implementacao interna.
- Mock via `createMock(Interface::class)` — nunca `new Implementacao()` em testes de Service.
- `RefreshDatabase` obrigatorio em todo teste que escreve ou le do banco.
- Comentario `//` obrigatorio acima de cada `it()` ou `test()`.
- Factories obrigatorias para dados de teste — sem arrays hardcoded longos.
- Um `describe()` por classe; um `it()` por comportamento verificado.
- Nao testar getters e setters triviais de DTO — apenas logica de mapeamento e filtro.
- Service sempre testado com Repository mockado — nunca com banco real.
- Repository sempre testado com banco real — nunca com mock.
