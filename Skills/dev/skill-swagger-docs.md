---
tags:
  - skill/backend
  - skill/laravel
  - skill/swagger
  - skill/openapi
  - skill/documentacao
---

# Skill: Documentacao Swagger Laravel

> **Gatilho:** Use esta skill quando o usuario pedir para criar, revisar, atualizar ou documentar endpoints Swagger/OpenAPI/L5-Swagger em um projeto Laravel. Ativado tambem por frases como "documenta a rota X", "adiciona swagger para Y", "gera a documentacao da API", "cria o Swagger de Z", ou quando mencionar controllers, requests, DTOs ou a pasta `app/Docs/Swagger`.

## Quando NAO usar

- O usuario quer apenas **entender** o que um endpoint faz — responda diretamente sem criar arquivos Swagger.
- O usuario quer revisar o **codigo** de uma rota, nao a documentacao dela.
- A tarefa e apenas corrigir um typo ou formatar um arquivo Swagger existente — faca a edicao pontual sem executar o algoritmo completo.

## 1. Objetivo

Criar documentacao Swagger sem inventar contrato publico.

A documentacao deve nascer dos arquivos reais do fluxo HTTP:

```text
Route -> Controller -> FormRequest -> DTO/Resource/Transformer -> Service/Repository -> Model -> Migration/Factory -> Swagger
```

O resultado deve seguir o padrao ja existente do projeto, normalmente em:

```text
app/Docs/Swagger/<NomeDaPastaDaModel>
```

Antes de escrever qualquer classe nova, leia 2-3 arquivos Swagger ja existentes na mesma area para capturar o estilo exato do projeto.

## 2. Leituras Obrigatorias

Antes de escrever qualquer classe Swagger, leia nesta ordem:

1. `routes/api.php` para descobrir path, metodo HTTP, middlewares, prefixos e parametros de rota.
2. Controller responsavel para descobrir metodo chamado, status codes, mensagens, `ApiResponse`, redirects, exceptions e formato de retorno.
3. FormRequest usado pelo controller para extrair campos, required, nullable, tipos, ranges, enums, formatos e mensagens de validacao.
4. DTOs, Resources, Transformers ou ResponseDTOs usados na entrada/saida.
5. Service e Repository quando eles alteram resposta, status, filtros, paginacao, relacoes carregadas ou regras de negocio visiveis na API.
6. Model para `fillable`, `hidden`, `casts`, relacoes e nomes reais de campos.
7. Migration, factory e seeders quando precisar confirmar nullable, tamanho, tipo numerico, unique, indices, exemplos e valores possiveis.
8. 2-3 documentacoes existentes em `app/Docs/Swagger` da mesma area para capturar o estilo exato.
9. `app/Docs/Swagger/SwaggerConfig.php` para tags, security schemes e padrao global.
10. `app/Helpers/ApiResponse.php` ou equivalente (busque o arquivo se o caminho for diferente) para envelope real de resposta.

Nunca documente campo, status code, relacao ou payload que nao tenha sido confirmado em algum desses arquivos.

## 3. Destino e Nomeacao

- Use uma classe PHP por endpoint ou acao, seguindo o padrao local.
- Coloque o arquivo na pasta do dominio/model:
  - `app/Docs/Swagger/User` para endpoints ligados a `User`.
  - `app/Docs/Swagger/ProcedureOpm` para `ProcedureOpm`.
  - `app/Docs/Swagger/ApiContract` se o projeto ja usa esse nome para contratos.
- Preserve nomes de pastas ja existentes, mesmo que nao sejam exatamente o nome da model.
- Use namespace correspondente ao caminho:

```php
namespace App\Docs\Swagger\User;
```

- Use sempre:

```php
use OpenApi\Attributes as OA;
```

## 4. Padrao OpenAPI do Projeto

Siga o estilo ja usado em `app/Docs/Swagger`:

- Atributos PHP 8: `#[OA\Get(...)]`, `#[OA\Post(...)]`, `#[OA\Put(...)]`, `#[OA\Delete(...)]`.
- `path` deve ser exatamente o path final visto em `routes/api.php`, incluindo `/api/v1`.
- `summary` e **obrigatorio** em todo endpoint — uma linha descritiva curta (ex: `summary: 'Lista todos os produtos'`).
- `operationId` e **obrigatorio** e deve ser unico em toda a API. Convencao: `{metodo}{Recurso}{Acao}` em camelCase. Exemplos: `listProducts`, `showProduct`, `createProduct`, `updateProduct`, `deleteProduct`.
- `tags` devem existir em `SwaggerConfig.php`. Se a tag necessaria nao existir, atualize `SwaggerConfig.php`.
- Use `security: [["bearerAuth" => []]]` quando a rota estiver protegida por middleware de autenticacao.
- Documente `parameters` para query/path params.
- Documente `requestBody` para JSON body de POST/PUT/PATCH.
- Documente `responses` com os envelopes reais do projeto.

### Resposta de item unico (`ApiResponse::success`)

```json
{
  "success": true,
  "message": "Operacao realizada com sucesso",
  "data": { }
}
```

### Resposta de lista paginada (`ApiResponse::paginated`)

```json
{
  "success": true,
  "message": "Listagem realizada com sucesso",
  "data": {
    "items": [ ],
    "pagination": {
      "total": 100,
      "per_page": 15,
      "current_page": 1,
      "last_page": 7
    }
  }
}
```

Use o schema correto conforme o tipo de retorno do Controller — item unico ou lista paginada. Nao misture os dois.

### Resposta de erro de validacao (422)

```json
{
  "success": false,
  "message": "Erro de validacao",
  "errors": { "campo": ["mensagem de erro"] }
}
```

## 5. Como Derivar Campos

### Request body e query params

Derive diretamente do FormRequest:

- `required` vem de regras `required`.
- `nullable: true` vem de regras `nullable` ou retorno explicitamente nulo.
- `type: "string"` para `string`, datas em string, CPF/CNPJ, enums textuais e IDs que o projeto trata como texto.
- `type: "integer"` para `integer`.
- `type: "number", format: "float"` para decimal/monetario ja convertido em numero.
- `format: "date"` para `date` ou `date_format:Y-m-d`.
- `format: "date-time"` para timestamps.
- `format: "email"` para email.
- `format: "password"` para senha.
- `items` obrigatorio para arrays.
- `minimum`, `maximum`, `minLength`, `maxLength` devem refletir regras `min`, `max`, `digits`, `size` quando fizer sentido.

#### Enum — exemplo obrigatorio

Quando a regra do FormRequest for `Rule::in([...])` ou `'in:val1,val2'`, documente assim:

```php
#[OA\Property(
    property: 'status',
    type: 'string',
    enum: ['ativo', 'inativo', 'pendente'],
    example: 'ativo'
)]
```

> ⚠️ Nunca use `type: 'enum'` — nao e valido no OpenAPI 3.

Use as mensagens do FormRequest como base para exemplos de erro 422.

### Response

Derive de Controller, DTO/ResponseDTO/Transformer e Model:

- Se houver ResponseDTO, ele vence a Model como contrato publico.
- Se retornar lista paginada via `ApiResponse::paginated`, use o schema de lista da secao 4.
- Se retornar item unico via `ApiResponse::success($dto)`, use o schema de item unico da secao 4.
- Respeite `hidden` da Model: campo escondido nao deve aparecer na resposta.
- Respeite `casts`: boolean, integer, decimal, date/datetime.
- Relacoes so devem aparecer se forem carregadas e projetadas na resposta real.
- Campos nullable devem aparecer com `nullable: true` quando a resposta puder retornar `null`.

## 6. Checklist de Escrita

Antes de finalizar:

- [ ] Path e metodo HTTP batem com `routes/api.php`.
- [ ] `summary` preenchido com uma linha descritiva curta.
- [ ] `operationId` preenchido, unico e no formato `{metodo}{Recurso}{Acao}` camelCase.
- [ ] Classe esta no namespace correto.
- [ ] Tag existe em `SwaggerConfig.php`.
- [ ] Security `bearerAuth` esta presente quando a rota exige auth.
- [ ] Todos os campos obrigatorios do FormRequest aparecem em `required`.
- [ ] Campos nullable estao marcados como nullable.
- [ ] Enums documentados com `enum: [...]`, nunca `type: 'enum'`.
- [ ] Query params e path params foram documentados.
- [ ] Request body segue o FormRequest, nao um exemplo solto do usuario.
- [ ] Response usa schema de item unico ou lista paginada conforme o Controller.
- [ ] Response segue Controller/DTO/ApiResponse — nenhum campo inventado.
- [ ] Erros 401, 403, 404, 422 ou 500 aparecem quando o fluxo real puder gerar esses casos.
- [ ] Exemplos usam dados coerentes com factory/seeder/migration quando disponiveis.
- [ ] Arquivos PHP alterados passam em `php -l`.

## 7. Validacao Final Obrigatoria

Ao final de qualquer criacao ou alteracao de documentacao Swagger:

1. Rode `php -l` nos arquivos PHP criados/alterados.
2. Rode, na raiz do projeto Laravel:

```bash
php artisan l5-swagger:generate
```

3. Se o comando falhar, corrija a documentacao e rode novamente.
4. O `l5-swagger:generate` concluir sem erros e o **ultimo passo** da skill. Nao suba servidor
   (`php artisan serve`) nem abra o Swagger UI no browser para conferencia visual — a validacao
   do contrato e feita na leitura dos arquivos reais (secao 2) e no proprio generate.
5. Se nao puder rodar o comando por falta de dependencia, ambiente ou permissao, informe
   exatamente o motivo e o proximo passo.
