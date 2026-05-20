---
tags:
  - skill/backend
  - skill/laravel
  - skill/swagger
  - skill/openapi
  - skill/documentacao
---

# Skill: Documentacao Swagger Laravel

> **Gatilho:** Use esta skill quando o usuario pedir para criar, revisar ou atualizar documentacao Swagger/OpenAPI/L5-Swagger baseada em arquivos do projeto Laravel, especialmente quando mencionar rotas, controllers, requests, DTOs, models ou a pasta `app/Docs/Swagger`.

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

## 2. Leituras Obrigatorias

Antes de escrever qualquer classe Swagger, leia nesta ordem:

1. `routes/api.php` para descobrir path, metodo HTTP, middlewares, prefixos e parametros de rota.
2. Controller responsavel para descobrir metodo chamado, status codes, mensagens, `ApiResponse`, redirects, exceptions e formato de retorno.
3. FormRequest usado pelo controller para extrair campos, required, nullable, tipos, ranges, enums, formatos e mensagens de validacao.
4. DTOs, Resources, Transformers ou ResponseDTOs usados na entrada/saida.
5. Service e Repository quando eles alteram resposta, status, filtros, paginacao, relacoes carregadas ou regras de negocio visiveis na API.
6. Model para `fillable`, `hidden`, `casts`, relacoes e nomes reais de campos.
7. Migration, factory e seeders quando precisar confirmar nullable, tamanho, tipo numerico, unique, indices, exemplos e valores possiveis.
8. Documentacoes existentes em `app/Docs/Swagger` da mesma area ou area parecida.
9. `app/Docs/Swagger/SwaggerConfig.php` para tags, security schemes e padrao global.
10. `app/Helpers/ApiResponse.php` ou equivalente para envelope real de resposta.

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
- `tags` devem existir em `SwaggerConfig.php`. Se a tag necessaria nao existir, atualize `SwaggerConfig.php`.
- Use `security: [["bearerAuth" => []]]` quando a rota estiver protegida por middleware de autenticacao.
- Documente `parameters` para query/path params.
- Documente `requestBody` para JSON body de POST/PUT/PATCH.
- Documente `responses` com os envelopes reais do projeto:

```json
{
  "success": true,
  "message": "Operacao realizada com sucesso",
  "data": {}
}
```

ou, em erro de validacao:

```json
{
  "success": false,
  "message": "Erro de validacao",
  "errors": {}
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

Use as mensagens do FormRequest como base para exemplos de erro 422.

### Response

Derive de Controller, DTO/ResponseDTO/Transformer e Model:

- Se houver ResponseDTO, ele vence a Model como contrato publico.
- Se retornar paginacao via `ApiResponse::paginated`, documente `data.items` e `data.pagination`.
- Respeite `hidden` da Model: campo escondido nao deve aparecer na resposta.
- Respeite `casts`: boolean, integer, decimal, date/datetime.
- Relacoes so devem aparecer se forem carregadas e projetadas na resposta real.
- Campos nullable devem aparecer com `nullable: true` quando a resposta puder retornar `null`.

## 6. Checklist de Escrita

Antes de finalizar:

- [ ] Path e metodo HTTP batem com `routes/api.php`.
- [ ] Classe esta no namespace correto.
- [ ] Tag existe em `SwaggerConfig.php`.
- [ ] Security `bearerAuth` esta presente quando a rota exige auth.
- [ ] Todos os campos obrigatorios do FormRequest aparecem em `required`.
- [ ] Campos nullable estao marcados como nullable.
- [ ] Query params e path params foram documentados.
- [ ] Request body segue o FormRequest, nao um exemplo solto do usuario.
- [ ] Response segue Controller/DTO/ApiResponse.
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
4. Se nao puder rodar o comando por falta de dependencia, ambiente, permissao ou sandbox, informe exatamente o motivo e o proximo passo.

