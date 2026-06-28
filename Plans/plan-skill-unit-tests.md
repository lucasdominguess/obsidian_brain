# Blueprint da Solucao: Skill de Testes Unitarios Laravel (skill-unit-tests)

**Data:** 2026-05-28
**Status:** Executado — `Skills/dev/skill-unit-tests.md` criado em 2026-05-28

---

## Contexto Arquitetural

Esta skill complementa e especializa as skills existentes sem duplica-las:

- **`skill-qa.md`** define a filosofia (TDD por padrao, Pest, piramide de testes) mas e de alto nivel — nao diz como testar cada camada.
- **`skill-layers.md`** define o fluxo canonico `FormRequest → CommandDTO → Service → Repository → ResponseDTO → Controller` mas nao menciona testes.
- **`skill-back.md`** menciona "Injecao de dependencias para testabilidade" e "evitar acoplamento forte" mas nao da receitas.

A nova skill **`skill-unit-tests.md`** fecha essa lacuna: e operacional e prescreve exatamente como testar cada camada do fluxo canonico, com padroes de mock, localizacao de arquivos, helpers Pest e um algoritmo de execucao passo a passo.

**Relacao entre as skills apos a criacao:**

```
skill-qa.md        ← filosofia TDD, piramide, quando rodar os testes
skill-unit-tests   ← COMO testar cada camada (nova)
skill-layers.md    ← o que cada camada faz (referencia cruzada)
```

---

## Arquivos Impactados

- `[NEW] Skills/dev/skill-unit-tests.md` — arquivo principal da skill
- `[MOD] Skills/ops/skill-core.md` — adicionar linha da nova skill na tabela de gatilhos (linha atual "Escrever testes (Pest)" aponta so para skill-qa; incluir skill-unit-tests como skill complementar)
- `[VERIFICAR] SellerFlow/CLAUDE.md` — a linha `Escrever testes (Pest) → skill-qa.md` pode incluir skill-unit-tests como complemento

---

## Analise de Padroes Identificados nas Skills de Referencia

### Da skill-layers.md

Cada camada tem responsabilidade clara e testavel de forma independente:

| Camada | Responsabilidade testavel | Tipo de teste ideal |
|---|---|---|
| CommandDTO | `fromRequest()` mapeia campos; `toArray()` filtra nulos | Unit puro (sem mock) |
| ResponseDTO | `fromModel()` projeta campos; `toArray()` preserva nulos | Unit puro (sem mock) |
| Service | Orquestra regras de negocio; chama Repository | Unit com mock do Repository |
| Repository | Unico ponto de acesso ao banco | Feature com RefreshDatabase |
| Controller | Recebe HTTP, chama Service, devolve JSON | Feature HTTP com actingAs |
| FormRequest | Valida e sanitiza payload | Feature HTTP (via Controller) |

### Da skill-qa.md

- Pest PHP obrigatorio (sintaxe `it()`, `describe()`, `expect()`)
- `RefreshDatabase` para testes que tocam o banco
- Model Factories para provisionar dados (nunca arrays hardcoded longos)
- Rodar `./vendor/bin/pest` automaticamente apos escrever testes

### Da skill-back.md

- Injecao de dependencias via construtor (nunca `new Repository()` direto no Service)
- Evitar `Facade::metodoEstatico()` quando testabilidade e necessaria
- Interface do Repository declarada — permite mock sem depender de implementacao

---

## Estrutura Detalhada da Nova Skill

A skill tera as seguintes secoes (checklist abaixo cobre a escrita de cada uma):

```
1. Trigger + Quando NAO usar
2. Filosofia (referencia a skill-qa, nao duplicar)
3. Nomenclatura e localizacao dos arquivos de teste
4. Como testar cada camada
   4a. CommandDTO e ResponseDTO (unit puro)
   4b. Service (unit + Mockery)
   4c. Repository (feature + RefreshDatabase)
   4d. Controller (feature HTTP + actingAs)
   4e. FormRequest (feature HTTP via Controller)
5. Padroes de Mock com Mockery
6. Helpers e hooks Pest uteis
7. Algoritmo de execucao passo a passo
8. Checklist de escrita do teste
9. Regras inegociaveis
```

---

## Checklist de Execucao

- [ ] 1. Criar o arquivo `Skills/dev/skill-unit-tests.md` com frontmatter (tags: skill/qa, skill/tests, skill/laravel, skill/pest, skill/unit).

- [ ] 2. Escrever **secao de Trigger** — incluir frases como "escreve os testes de X", "cria os testes unitarios para Y", "adiciona testes na Service Z", "testa o Repository de W". Adicionar secao "Quando NAO usar" cobrindo: pedidos de apenas rodar os testes existentes (usar skill-qa), pedidos de revisar codigo sem escrever testes, rename/typo.

- [ ] 3. Escrever **secao de Filosofia** — referenciar skill-qa.md e skill-layers.md sem duplicar conteudo. Deixar claro que esta skill e o "como fazer", nao o "por que fazer".

- [ ] 4. Escrever **secao de Nomenclatura e Localizacao** — cobrir:
  - `tests/Unit/DTOs/` para CommandDTO e ResponseDTO
  - `tests/Unit/Services/` para Services
  - `tests/Feature/Repositories/` para Repositories
  - `tests/Feature/Http/` para Controllers e FormRequests
  - Convencao de nome: `{NomeDaClasse}Test.php` (ex: `ProductServiceTest.php`)
  - Namespace do arquivo: `Tests\Unit\Services` / `Tests\Feature\Http`

- [ ] 5. Escrever **subsecao 4a: Testes de DTO** — cobrir:
  - Nenhum mock necessario (classe readonly pura)
  - Testar `fromRequest(array $validated)`: campos mapeados corretamente, incluindo campos opcionais nulos
  - Testar `toArray()` no CommandDTO: campos nulos devem ser filtrados (array_filter)
  - Testar `fromModel(Model $model)` no ResponseDTO: projecao de campos, relacoes como arrays
  - Testar `toArray()` no ResponseDTO: campos nulos devem aparecer como null, nao sumir
  - Incluir exemplo Pest completo com `describe()` e `expect()->toMatchArray()`

- [ ] 6. Escrever **subsecao 4b: Testes de Service** — cobrir:
  - Padrao: mock do RepositoryInterface via `Mockery::mock()`
  - Binding do mock: `app()->instance(RepositoryInterface::class, $mock)` OU injecao direta no construtor
  - Preferir injecao direta no construtor (mais explicito, sem dependencia do container)
  - `beforeEach()` para instanciar mock e service
  - Testar: metodo retorna ResponseDTO correto, Repository foi chamado com os dados certos (`shouldReceive()->with()->once()`)
  - Testar caminho de erro: exception lancada quando Repository nao encontra registro
  - `afterEach(fn () => Mockery::close())` obrigatorio para limpar mocks
  - Incluir exemplo Pest completo para `store()` e `findById()`

- [ ] 7. Escrever **subsecao 4c: Testes de Repository** — cobrir:
  - Usar `uses(RefreshDatabase::class)` no topo do arquivo
  - Resolver via container: `app(ProductRepository::class)`
  - Usar Factory para criar dados: `Product::factory()->create([...])`
  - Testar `create()`: retorna Model com relacoes ja carregadas (verificar `$result->relationLoaded('relacao')`)
  - Testar `findById()`: retorna Model correto; lanca exception para ID inexistente
  - Testar `update()`: persiste alteracoes e retorna Model atualizado com relacoes
  - Testar `delete()`: remove registro e retorna true/void
  - Verificar banco com `assertDatabaseHas()` e `assertDatabaseMissing()`
  - Incluir exemplo Pest completo

- [ ] 8. Escrever **subsecao 4d: Testes de Controller (Feature HTTP)** — cobrir:
  - Usar `uses(RefreshDatabase::class)`
  - Autenticacao: `$this->actingAs(User::factory()->create())`
  - Metodos HTTP: `postJson()`, `getJson()`, `putJson()`, `deleteJson()`
  - Verificar envelope: `assertJsonPath('success', true)`, `assertJsonPath('data.nome_campo', valor)`
  - Verificar status code: `assertStatus(200)`, `assertStatus(201)`, `assertStatus(422)`, `assertStatus(404)`
  - Verificar persistencia: `assertDatabaseHas()`, `assertDatabaseMissing()`
  - Testar caminho de erro 422: campo obrigatorio ausente → assertJsonStructure com errors
  - Testar caminho de erro 404: ID inexistente
  - Testar caminho de erro 401: sem autenticacao
  - Incluir exemplo Pest para POST (criacao) e GET (listagem)

- [ ] 9. Escrever **subsecao 4e: Testes de FormRequest** — cobrir:
  - Preferencia: testar validacao via HTTP (request real) e nao instanciando o FormRequest direto
  - Razao: testar via HTTP garante que as regras estao registradas no controller corretamente
  - Para cada campo obrigatorio: enviar payload sem o campo e verificar 422 + errors com o campo
  - Para campos com enum/in: enviar valor invalido e verificar 422
  - Nao duplicar testes de FormRequest que ja foram cobertos nos testes de Controller

- [ ] 10. Escrever **secao 5: Padroes de Mock com Mockery** — cobrir:
  - Importacao: `use Mockery;` e `use Mockery\MockInterface;`
  - Criacao: `$mock = Mockery::mock(RepositoryInterface::class)`
  - Expectativas: `shouldReceive('create')->once()->with([...])->andReturn($model)`
  - Verificacao de que foi chamado: `->once()`, `->twice()`, `->times(3)`, `->never()`
  - Limpeza obrigatoria: `afterEach(fn () => Mockery::close())`
  - Quando usar `andThrow(new ModelNotFoundException())` para simular erros
  - Antipadrao: nao mockar o que voce esta testando (mockar dependencias, nao o proprio sujeito)

- [ ] 11. Escrever **secao 6: Helpers e hooks Pest uteis** — cobrir:
  - `beforeEach(function () { ... })` para setup compartilhado no describe
  - `afterEach(fn () => Mockery::close())` quando usar Mockery
  - `dataset()` para testar multiplos inputs com o mesmo teste
  - `expect($value)->toBeInstanceOf(Classe::class)`
  - `expect($array)->toMatchArray(['chave' => 'valor'])`
  - `expect($array)->toHaveKey('chave')` / `->not->toHaveKey('chave')`
  - `expect(fn () => $service->findById(999))->toThrow(ModelNotFoundException::class)`
  - `expect($model->relationLoaded('relacao'))->toBeTrue()`

- [ ] 12. Escrever **secao 7: Algoritmo de execucao passo a passo** — cobrir:
  - Passo 1: Ler os arquivos da camada a testar (Service, Repository, Controller, etc.)
  - Passo 2: Ler a interface do Repository (se existir) para saber o contrato do mock
  - Passo 3: Ler a migration e o Model para campos e relacoes reais
  - Passo 4: Ler a Factory existente (se houver) para reutilizar na criacao de dados
  - Passo 5: Identificar os casos a testar: caminho feliz, validacao invalida, nao encontrado, erro
  - Passo 6: Criar o arquivo no diretorio correto com namespace correto
  - Passo 7: Escrever os testes seguindo os padroes da skill
  - Passo 8: Rodar `./vendor/bin/pest --filter=NomeDaClasseTest` para rodar apenas os testes novos
  - Passo 9: Corrigir falhas interpretaveis autonomamente; reportar falhas que exigem decisao do usuario
  - Passo 10: Rodar `./vendor/bin/pest` completo para verificar regressoes

- [ ] 13. Escrever **secao 8: Checklist de escrita** com checkboxes cobrindo todos os pontos criticos.

- [ ] 14. Escrever **secao 9: Regras inegociaveis** — incluir:
  - Nunca testar a implementacao interna de uma camada, apenas seu contrato publico
  - Nunca usar `new Repository()` dentro do Service em producao — isso impede mock
  - `Mockery::close()` obrigatorio em todo arquivo que usa Mockery
  - Factories obrigatorias para dados de teste — sem arrays hardcoded de 10+ campos
  - Testes de Repository sempre com `RefreshDatabase` — nunca com dados persistidos entre testes
  - Um `describe()` por classe testada; um `it()` por caso de uso ou caminho

- [ ] 15. Atualizar `Skills/ops/skill-core.md` — na tabela de gatilhos, na linha "Escrever testes (Pest)", adicionar `skill-unit-tests.md` como skill complementar ao lado de `skill-qa.md`.

- [ ] 16. Verificar `SellerFlow/CLAUDE.md` — linha `Escrever testes (Pest) → Skills/dev/skill-qa.md`. Avaliar se faz sentido adicionar skill-unit-tests como referencia secundaria ou se a skill-qa ja serve como ponto de entrada suficiente.

---

## Decisoes Arquiteturais a Confirmar

Antes de executar, confirme com o usuario:

1. **Mockery vs `createMock()` do PHPUnit:** O projeto ja tem Mockery instalado? Ou prefere usar `createMock()` nativo? Mockery e mais expressivo mas requer instalacao separada.

2. **Localizacao dos arquivos de teste:** O projeto SellerFlow ja tem estrutura em `tests/Unit/` e `tests/Feature/`? Ou precisa criar os diretorios?

3. **Escopo da skill:** A skill deve cobrir APENAS Unit + Feature tests de backend Laravel? Ou tambem cobrir testes de console commands (`artisan`)?
