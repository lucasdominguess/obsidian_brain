---
tags:
  - skill/postman
  - skill/api
  - skill/crud
  - skill/laravel
---

# Skill: Gerador de CRUD no Postman

> **Gatilho:** Use esta skill quando o usuario pedir para criar rotas/endpoints no Postman para uma model Laravel. Pode ser acionada com frases como "cria as rotas no Postman para X", "adiciona o CRUD da model Y no Postman", "gera a collection do Postman para Z", "atualiza a collection do Postman com X", "adiciona endpoints de X no Postman".

## Quando NAO usar

- O usuario quer apenas **explicar** o que uma rota faz — responda diretamente sem criar nada.
- O usuario quer **revisar** o estilo ou a organizacao da collection sem gerar requests.
- O usuario quer adicionar query params ou exemplos de resposta em requests ja existentes — faca a edicao pontual sem executar este algoritmo completo.

## 1. Inputs esperados do usuario

| Input | Descricao | Exemplo |
|---|---|---|
| `projeto` | Nome do projeto (= nome da collection no Postman) | `SellerFlow` |
| `model` | Nome da model em PascalCase | `Product` |
| `subpasta` | Subpasta dentro de `Api/` (opcional) | `Business` |

Se algum input nao for fornecido, pergunte antes de prosseguir.

## 2. Estrutura de pastas no Postman

A hierarquia de pastas dentro da collection deve seguir este padrao:

```
{projeto}                        ← collection raiz
  └── Api                        ← pasta fixa
        └── {subpasta}           ← pasta da subpasta (se houver)
              └── {model}        ← pasta com o nome da model em minusculo
                    ├── list   GET
                    ├── show   GET
                    ├── create POST
                    ├── update PUT
                    └── delete DELETE
```

Se nao houver subpasta, a model fica diretamente dentro de `Api/`.

### Estrutura JSON das pastas aninhadas

Ao montar o payload para `putCollection`, pastas aninhadas seguem este formato:

```json
{
  "name": "Api",
  "item": [
    {
      "name": "{subpasta}",
      "item": [
        {
          "name": "{model em minusculo}",
          "item": [
            // requests aqui
          ]
        }
      ]
    }
  ]
}
```

Se nao houver subpasta, a pasta `{model}` fica diretamente dentro do `item` de `"Api"`.

## 3. Convencao de nomes das rotas

| Acao | Nome da request | Metodo HTTP |
|---|---|---|
| Listar todos | `list`   | GET    |
| Buscar um    | `show`   | GET    |
| Criar        | `create` | POST   |
| Editar       | `update` | PUT    |
| Deletar      | `delete` | DELETE |

## 4. Convencao de URLs

- Variavel de base: **`{{baseUrl}}`** — ja contem o prefixo `/api/v1`. Nunca adicionar `/api/v1` manualmente.
- Recurso: nome da model em **kebab-case minusculo** (ex: `Product` → `product`, `UserStore` → `user-store`).
- Confirmar o prefixo exato lendo `routes/api.php` antes de montar as URLs.
- Rotas com ID usam `:id` como path variable.

Exemplos para model `Product` (prefixo `/product` confirmado no routes):

```
list   → {{baseUrl}}/product
show   → {{baseUrl}}/product/:id
create → {{baseUrl}}/product
update → {{baseUrl}}/product/:id
delete → {{baseUrl}}/product/:id
```

O campo `url` do objeto Postman DEVE ter SEMPRE o campo `raw` preenchido:

```json
"url": {
  "raw": "{{baseUrl}}/product",
  "host": ["{{baseUrl}}"],
  "path": ["product"]
}
```

Com path variable `:id`:

```json
"url": {
  "raw": "{{baseUrl}}/product/:id",
  "host": ["{{baseUrl}}"],
  "path": ["product", ":id"],
  "variable": [{ "key": "id", "value": "1" }]
}
```

> ⚠️ OBRIGATORIO: sem o campo `raw` o Postman exibe a URL em branco. Nunca omitir.

## 5. Headers padrao em todas as requests

```
Content-Type : application/json
Accept       : application/json
```

### Autenticacao

Antes de montar os headers, verifique o middleware da rota em `routes/api.php`:

- Se a rota estiver dentro de um grupo `auth:sanctum`, `auth:api` ou similar → adicione:
  ```
  Authorization : Bearer {{token}}
  ```
- Se a rota for publica (sem middleware de auth) → nao adicione o header `Authorization`.

## 6. Passos de execucao (algoritmo)

### Passo 1 — Ler as rotas da model no projeto

Leia `routes/api.php` e localize `Route::prefix('/{recurso}')` da model.

- Confirme o prefixo exato (ex: `/product`, `/fornecedor`, `/user-store`).
- Anote o middleware aplicado — necessario para decidir se inclui o header `Authorization`.
- Se a rota nao existir, avise o usuario antes de continuar.

### Passo 2 — Ler a migration e o FormRequest e montar os bodies

Leia os seguintes arquivos:

1. **Migration** (`database/migrations/*_create_{tabela}_table.php`) — fonte de verdade dos campos, tipos e nullable.
2. **CreateRequest** (`app/Http/Requests/{Pasta}/{Model}CreateRequest.php`) — confirma campos obrigatorios e tipos de validacao.

A partir dessas leituras, monte dois JSONs de body com **valores de exemplo reais e coerentes** — nunca use `"campo": "valor"` generico.

#### Tabela de mapeamento tipo → valor de exemplo

| Tipo na migration / regra de validacao | Valor de exemplo |
|---|---|
| `string` generico | `"Exemplo"` |
| `text` | `"Descricao de exemplo para teste"` |
| `integer`, `bigInteger`, `smallInteger` | `1` |
| `unsignedBigInteger` (FK) | `1` |
| `decimal`, `float`, `double` | `10.99` |
| `boolean` | `true` |
| `date` | `"2026-01-15"` |
| `dateTime`, `timestamp` | `"2026-01-15T10:30:00"` |
| `enum` | primeiro valor da lista definida na migration |
| `json` | `{}` |
| coluna com `email` no nome | `"usuario@exemplo.com"` |
| coluna com `phone` ou `telefone` no nome | `"(11) 91234-5678"` |
| coluna com `password` ou `senha` no nome | `"Senha@123"` |
| coluna com `name` ou `nome` no nome | `"Nome Exemplo"` |
| coluna com `cpf` no nome | `"123.456.789-09"` |
| coluna com `cnpj` no nome | `"12.345.678/0001-90"` |
| coluna com `cep` ou `zip` no nome | `"01310-100"` |
| `uuid` | `"550e8400-e29b-41d4-a716-446655440000"` |

Regras adicionais:

- Campos `nullable` tambem aparecem no body — nao omitir. Facilita o teste manual.
- **body do `create`**: todos os campos da migration exceto `id`, `created_at`, `updated_at`, `deleted_at`.
- **body do `update`**: igual ao create, mas omita FKs que nao mudam (ex: `company_id`, `user_id`) e use valores ligeiramente diferentes para facilitar distinguir create de update nos testes.

Nunca inventar campos que nao existam na migration ou no FormRequest.

### Passo 3 — Localizar ou criar a collection no Postman

1. Use `getWorkspaces` para listar workspaces disponiveis.
2. Se houver mais de um workspace, use aquele cujo nome seja `"My Workspace"` ou pergunte ao usuario qual usar.
3. Use `getCollections` passando o `workspaceId` para buscar a collection pelo nome do projeto.
4. Se encontrar: anote o `id` existente. Se nao encontrar: crie com `createCollection`.

### Passo 4 — Ler a estrutura atual da collection

Use `getCollection` passando o `collectionId` para obter o JSON completo atual.

- Nunca sobrescrever pastas existentes de outras models.
- Mapeie todos os `id` e `item` ja existentes para preserva-los ao chamar `putCollection`.

### Passo 5 — Montar o payload das 5 requests

> ⚠️ OBRIGATORIO: o campo `body.raw` deve ser uma **string JSON serializada** (com `\n` e `\"` escapados), nunca um objeto JavaScript inline.

**Exemplo de body pre-preenchido para model `Product`** (create):

```json
{
  "name": "create",
  "request": {
    "method": "POST",
    "header": [
      { "key": "Content-Type", "value": "application/json" },
      { "key": "Accept",       "value": "application/json" },
      { "key": "Authorization","value": "Bearer {{token}}" }
    ],
    "body": {
      "mode": "raw",
      "options": { "raw": { "language": "json" } },
      "raw": "{\n  \"name\": \"Produto Exemplo\",\n  \"description\": \"Descricao do produto para teste\",\n  \"price\": 29.99,\n  \"stock\": 10,\n  \"category_id\": 1,\n  \"active\": true\n}"
    },
    "url": {
      "raw": "{{baseUrl}}/product",
      "host": ["{{baseUrl}}"],
      "path": ["product"]
    }
  },
  "response": []
}
```

O `update` usa os mesmos campos com valores ligeiramente diferentes:

```json
"raw": "{\n  \"name\": \"Produto Atualizado\",\n  \"description\": \"Descricao revisada para teste\",\n  \"price\": 49.90,\n  \"stock\": 5,\n  \"active\": false\n}"
```

Modelo base para requests GET (sem body):

```json
{
  "name": "list",
  "request": {
    "method": "GET",
    "header": [
      { "key": "Content-Type", "value": "application/json" },
      { "key": "Accept",       "value": "application/json" },
      { "key": "Authorization","value": "Bearer {{token}}" }
    ],
    "url": {
      "raw": "{{baseUrl}}/{recurso}",
      "host": ["{{baseUrl}}"],
      "path": ["{recurso}"]
    }
  },
  "response": []
}
```

> Omita o header `Authorization` se a rota for publica, conforme verificado no Passo 1.

### Passo 6 — Aplicar via putCollection

Monte o JSON completo preservando toda a estrutura existente (todos os `id`, `item` e pastas de outras models). Insira a nova pasta no lugar correto dentro de `Api > {subpasta} > {model}`. Chame `putCollection`.

### Passo 7 — Confirmar

Informe ao usuario:

- Nome da collection e o caminho completo das pastas criadas.
- As 5 requests com metodo, URL final e confirmacao de que o body esta pre-preenchido com dados reais.

## 7. Regras inegociaveis

- Variavel de URL e sempre `{{baseUrl}}` — nunca `{{base_url}}` ou URL literal.
- `/api/v1` nunca e adicionado manualmente — ja esta no `{{baseUrl}}`.
- O campo `url.raw` SEMPRE deve ser preenchido.
- O campo `body.raw` e uma **string JSON serializada**, nunca um objeto.
- Campos do body derivados exclusivamente da migration e do FormRequest — nunca genericos.
- Body de POST/PUT/PATCH DEVE ter valores de exemplo reais conforme a tabela de mapeamento.
- Nunca sobrescrever pastas ja existentes de outras models.
- Preservar todos os IDs de items existentes ao usar `putCollection`.

## 8. Referencia rapida de ferramentas Postman MCP

| Acao | Ferramenta |
|---|---|
| Listar workspaces | `getWorkspaces` |
| Listar collections | `getCollections` (passar `workspaceId`) |
| Ler estrutura atual | `getCollection` (passar `collectionId`) |
| Criar collection | `createCollection` |
| Atualizar collection | `putCollection` |
