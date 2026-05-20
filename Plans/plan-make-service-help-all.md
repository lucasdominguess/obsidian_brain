# Blueprint da Solucao: Melhorar --help e adicionar --all no MakeService

**Contexto Arquitetural:**
O comando `make:service` é um Artisan Command personalizado que gera classes Service, Interface, Repository, RepositoryInterface e registra binds no AppServiceProvider. O comando já possui diversas flags (`--repository`, `--bind`, `--contract`, `--dto`, `--methods`, `--i=`, `--f=`), mas o `--help` não exibe descrições detalhadas e não existe uma opção para ativar todas as flags booleanas de uma vez.

**Arquivos Impactados:**
- `[MOD] app/Console/Commands/MakeService.php`

**Checklist de Execucao:**

- [x] 1. Atualizar `$signature` — adicionar descrição inline (`: texto`) em cada opção e argumento usando a sintaxe do Symfony Console, incluindo a nova opção `{--all}`

- [x] 2. Adicionar propriedade `protected $help` com exemplos de uso do comando (casos comuns, combinações úteis e uso do `--all`)

- [x] 3. No método `handle()`, ler `$isAll = (bool) $this->option('all')` antes de qualquer outra opção booleana

- [x] 4. Aplicar `$isAll` como OR em cada flag booleana:
  - `$shouldGenerateRepository = $isAll || (bool) $this->option('repository');`
  - `$shouldBind               = $isAll || (bool) $this->option('bind');`
  - `$shouldUseDto             = $isAll || (bool) $this->option('dto');`
  - `$shouldGenerateMethods    = $isAll || (bool) $this->option('methods');`
  - `$shouldGenerateContract   = $isAll || (bool) $this->option('contract') || $shouldBind || $controllerName !== '';`
  - Obs: `--i=` e `--f=` **não** entram no `--all` pois exigem valor

- [x] 5. Verificar output do `--help` via `php artisan make:service --help` e confirmar que todas as opções exibem descrição e os exemplos aparecem na seção "Help"

- [x] 6. Testar `--all` com `php artisan make:service TestAll --all` e confirmar que gera: Service, ServiceInterface, Repository, RepositoryInterface, bind no AppServiceProvider e métodos CRUD

**Referência — novo formato de $signature:**

```php
protected $signature = 'make:service
    {name : Nome da classe, aceita subpastas (ex: User ou Admin/User)}
    {--r|repository : Gera Repository e RepositoryInterface com injeção automática no Service}
    {--b|bind : Registra os binds Interface→Implementação no AppServiceProvider}
    {--c|contract : Gera ServiceInterface (contrato) para o Service}
    {--d|dto : Importa DTO e ResponseDTO no Service e na Interface}
    {--m|methods : Adiciona métodos CRUD (create/update/delete/find) em todas as classes geradas}
    {--i= : Injeta o Service no __construct de um Controller existente (ex: --i=AuthController)}
    {--f= : Caminho customizado para o Service, relativo a app/ (ex: --f=Domain/Auth)}
    {--all : Ativa todas as flags booleanas: --repository, --contract, --bind, --dto, --methods}';
```

**Referência — propriedade $help:**

```php
protected $help = <<<HELP
Exemplos de uso:

  Criar apenas o Service:
    php artisan make:service User

  Service + Interface (contrato):
    php artisan make:service User --contract

  Service + Repository + Bind:
    php artisan make:service User --repository --bind

  Tudo de uma vez (todas as flags booleanas):
    php artisan make:service User --all

  Tudo + injetar no Controller:
    php artisan make:service User --all --i=UserController

  Service em caminho customizado:
    php artisan make:service Admin/User --all --f=Domain/Admin
HELP;
```
