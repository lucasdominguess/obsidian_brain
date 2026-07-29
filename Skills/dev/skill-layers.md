---
tags:
  - skill/backend
  - skill/arquitetura
  - skill/laravel
---

# Skill: Arquitetura de Camadas Laravel (Fluxo Canônico)

> **Propósito:** Este documento define o contrato arquitetural obrigatório para criação, correção e revisão de qualquer fluxo de código backend. Toda sugestão de código **deve** respeitar este fluxo. Desvios devem ser sinalizados ativamente.

---

## 1. O Fluxo Canônico

```
HTTP Request
    │
    ▼
FormRequest          ← valida e filtra o payload (NUNCA passe Request cru para o Service)
    │
    ▼
CommandDTO           ← envelope tipado e imutável da intenção do usuário (ex: InventoryDTO)
    │  .fromRequest(array $validated)
    │  .toArray()   → usado pelo Repository
    ▼
Service              ← orquestra regras de negócio; NUNCA faz query diretamente
    │
    ▼
Repository           ← único ponto de acesso ao banco; retorna Eloquent Model
    │
    ▼
Eloquent Model       ← NUNCA sai desta camada sem ser projetado por um ResponseDTO
    │
    ▼
ResponseDTO          ← projeta os dados para o contrato público da API (ex: InventoryResponseDTO)
    │  .fromModel(Model $model)
    │  .toArray()   → usado pelo Controller/ApiResponse
    ▼
Controller           ← APENAS recebe FormRequest, chama Service, devolve JsonResponse
    │
    ▼
JSON Response
```

---

## 2. Responsabilidades de Cada Camada

### Controller (Fino)
- Recebe `FormRequest` validado
- Instancia `CommandDTO::fromRequest($request->validated())`
- Chama o `Service` e recebe `ResponseDTO`
- Devolve `JsonResponse` via `ApiResponse::success($dto)` ou equivalente
- ❌ **Nunca** contém lógica de negócio
- ❌ **Nunca** faz query ou acessa Model diretamente

### FormRequest
- Valida e **sanitiza/normaliza** o payload da requisição HTTP
- **Toda limpeza ou tratamento de campo acontece aqui**, no `prepareForValidation()`, **antes** da validação — nunca no `CommandDTO` nem no `Service`. Detalhe na subseção _Sanitização e normalização de campos_ abaixo.
- Usa `$request->validated()` para garantir que apenas campos declarados passem adiante
- ❌ **Nunca** é passado diretamente para o Service ou DTO de produção (sempre passe `$request->validated()`)

### Sanitização e normalização de campos

**Regra:** qualquer campo que precise de limpeza ou tratamento — CPF, CNPJ, telefone, datas, nomes, e-mail, etc. — é normalizado na **FormRequest**, dentro de `prepareForValidation()`, **antes** da validação. **Nunca** no `CommandDTO`, nunca no `Service`.

**Por quê antes da validação:** regras como `unique`/`exists` precisam rodar sobre o valor **canônico** (o mesmo formato gravado no banco). Se a limpeza acontecer depois (no DTO/Service), a validação enxerga o valor formatado e regras de unicidade falham silenciosamente — ex.: `unique:users,cpf` não encontra `12345678900` ao comparar com `123.456.789-00` e deixa passar um duplicado.

**Onde mora a função:** em uma **trait** dedicada em `app/Traits/` (namespace `App\Traits`). A FormRequest faz `use` da trait e chama o método — a lógica **nunca** fica dentro do DTO. Reaproveite a trait existente `App\Traits\NormalizesInput` (`normalizeCpf`, `normalizeEmail`, `normalizeInputNumber`, …). **Se não existir função adequada para o campo, crie-a como método na trait** (convenção: `normalize<Campo>()`), jamais no DTO.

```php
class StoreUserRequest extends FormRequest
{
    use NormalizesInput;

    protected function prepareForValidation(): void
    {
        // normaliza ANTES de validar → unique/exists rodam sobre o valor canônico
        $this->merge([
            'cpf'   => $this->normalizeCpf($this->input('cpf')),
            'email' => $this->normalizeEmail($this->input('email')),
        ]);
    }

    public function rules(): array
    {
        return ['cpf' => ['required', 'digits:11', 'unique:users,cpf']];
    }
}
```

Depois disso, `$request->validated()` → `CommandDTO::fromRequest()` → Service → Repository recebem o dado já limpo por construção. O DTO permanece um envelope puro, sem conhecer sanitização.

### CommandDTO (ex: `InventoryDTO`)
- Representa a **intenção do usuário** de modificar o sistema
- Classe `readonly` com propriedades tipadas e nullable para campos opcionais
- **Named constructor:** `fromRequest(array $validated): self`
- **Contrato de saída:** `toArray(): array` com `array_filter` para remover nulos (permite updates parciais)
- ❌ **Nunca** contém regras de negócio
- ❌ **Nunca** chama `auth()` exceto no `fromRequest()` para injetar o usuário autenticado

> 📖 **Exemplo de Código:** Consulte `Docks/code-snippets/dto-pattern.md` para a implementação detalhada (fromRequest e toArray).

### Service
- Orquestra a regra de negócio
- Recebe `CommandDTO`, entrega `ResponseDTO` (ou coleção/paginação deles)
- Usa `DB::transaction()` quando há múltiplas escritas dependentes

> 📖 **Exemplo de Código:** Consulte `Docks/code-snippets/service-pattern.md` para ver como o Service orquestra as transações e converte em ResponseDTO.

### Repository
- **Único** responsável por queries e persistência
- Retorna sempre `Eloquent Model` ou coleções de Models
- `create()` e `update()` usam `->load()` internamente para retornar o model **já com relações** — o Service não precisa recarregar nada
- Centralizar as relações em um método privado `withRelations(): array` para garantir consistência entre `create()`, `update()` e `findById()`
- ❌ **Nunca** instancia DTOs
- ❌ **Nunca** contém regras de negócio

> 📖 **Exemplo de Código:** Consulte `Docks/code-snippets/repository-pattern.md` para ver a implementação do `withRelations()` centralizado.

### ResponseDTO (ex: `InventoryResponseDTO`)
- Representa o **contrato público da API** — o que o frontend vê
- **Named constructor:** `fromModel(Model $model): self`
- Mapeia relações Eloquent para arrays explícitos
- Protege campos internos: o banco pode ter colunas que não devem ser expostas
- `toArray()` sem `array_filter` agressivo — campos nullable devem aparecer como `null`, não sumir

> 📖 **Exemplo de Código:** Consulte `Docks/code-snippets/response-dto-pattern.md` para ver a projeção do Eloquent e formatação.

---

## 3. Antipadrões — Sinalizar Sempre

| Antipadrão | Problema | Correção |
|---|---|---|
| `Service` retorna `Eloquent Model` | Vaza estrutura interna | Retornar `ResponseDTO::fromModel()` |
| `store()` retorna Model cru sem relações | Frontend recebe resposta incompleta | `create()` no Repository deve chamar `->load()` antes de retornar |
| Passar `$request` diretamente ao `Service` | Acopla HTTP ao domínio | Passar `$request->validated()` |
| Sanitizar/normalizar campo dentro do `CommandDTO` ou do `Service` | Validação roda sobre valor não-canônico (quebra `unique`/`exists`); polui a camada errada | Fazer no `FormRequest::prepareForValidation()` via trait de `App\Traits` |
| `array_filter` no `toArray()` do ResponseDTO | Campos nullable desaparecem na resposta | Só usar `array_filter` no **CommandDTO** |
| Lógica de negócio no `Controller` | Viola SRP, impossibilita testes unitários | Mover para `Service` |
| Query direta no `Service` | Viola SRP, rompe testabilidade | Delegar ao `Repository` |
| `update()` sem `DB::transaction()` com múltiplas escritas | Inconsistência em caso de falha parcial | Envolver em `DB::transaction()` |

---

## 4. Nomeação Padrão

| Papel | Sufixo | Exemplo |
|---|---|---|
| Command DTO (entrada) | `DTO` | `InventoryDTO` |
| Response DTO (saída) | `ResponseDTO` | `InventoryResponseDTO` |
| Form Request (store) | `Request` | `InventoryRequest` |
| Form Request (update) | `UpdateRequest` | `UpdateInventoryRequest` |
| Repository (Eloquent) | `Repository` | `InventoryRepository` |
| Interface do Repository | `RepositoryInterface` | `InventoryRepositoryInterface` |

---

## 5. Convenções de Idioma e Comentários

### Idioma do código
- **Inglês obrigatório** para: nomes de classes, métodos, variáveis, parâmetros, arquivos, tabelas e colunas (migrates).
- **Exceção:** se o projeto já possui arquivos em português e alterar quebraria compatibilidade com código existente, mantenha o padrão atual naquele contexto e sinaliza o desvio.
- **Comentários e explicações textuais:** sempre em PT-BR.

### Comentários no código
- Comentários devem ser **mínimos**: adicione apenas quando a lógica for não-óbvia ou a solução for complexa.
- **Proibido** usar blocos PHPDoc descritivos (`/** @param ... @return ... */`) em métodos de aplicação — eles poluem o código sem agregar valor real. Use-os apenas em bibliotecas pública ou SDKs.
- Use comentários de linha `//` quando necessário, em PT-BR.

```php
// ✅ Correto — comentário mínimo e em PT-BR
public function hasInventoryByContractId(int $contractId): bool
{
    // join transitivo: inventarios → active_systems → sistemas
    return Inventario::whereHas('activeSystem.sistema', fn($q) =>
        $q->where('contrato_id', $contractId)
    )->exists();
}

// ❌ Proibido — PHPDoc descritivo desnecessário
/**
 * Verifica se existe inventário vinculado ao contrato pelo ID.
 * @param int $contractId ID do contrato.
 * @return bool
 */
public function hasInventoryByContractId(int $contractId): bool { ... }
```

---

## 6. Checklist para Criar um Novo Recurso

- [ ] `FormRequest` criado com todas as validações
- [ ] Campos que exigem tratamento (CPF/CNPJ/telefone/data/nome/e-mail…) normalizados no `FormRequest::prepareForValidation()` via trait de `app/Traits/` — nunca no DTO
- [ ] `CommandDTO` com `fromRequest()` e `toArray()` (com `array_filter`)
- [ ] `ResponseDTO` com `fromModel()` e `toArray()` (sem filtrar nulos)
- [ ] `Repository` com `create()`, `findById()`, `update()`, `delete()` e `withRelations()` privado
- [ ] `create()` e `update()` no Repository chamam `->load($this->withRelations())` antes de retornar
- [ ] Interface do Repository declarada e vinculada no `AppServiceProvider`
- [ ] `Service` com todos os métodos CRUD retornando `ResponseDTO`
- [ ] `update()` no Service usa `DB::transaction()` se houver mais de uma escrita
- [ ] `Controller` com métodos finos chamando o Service
- [ ] Rotas registradas em `api.php`
- [ ] Nomes de classes, métodos e variáveis em inglês
- [ ] Sem PHPDoc descritivo em métodos internos
