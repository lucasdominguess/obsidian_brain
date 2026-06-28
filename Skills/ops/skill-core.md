---
tags:
  - skill/core
  - skill/meta
  - skill/system
---

# Skill: Core (Índice operacional do Brain)

> **Função:** Esta é a primeira skill a ler. Ela funciona como índice operacional — mapa de decisão para o agente saber *quando* consultar o Brain, *qual* skill ler e *quando NÃO* consultar.

---

## 1. Acesso ao Brain

- **Caminho base:** use o MCP `obsidian-brain-mcp` ou o `BRAIN_ROOT` informado no bootstrap.
- **Ferramentas preferidas (em ordem, da mais barata para a mais cara):**
  1. `read_section <path> <heading>` — leitura cirúrgica de uma seção. Use quando souber a skill e a seção que quer (ex: `Skills/dev/skill-layers.md`, heading `Antipadrões`).
  2. `read_file <path>` — quando precisar do arquivo inteiro.
  3. `search_brain "<termo>"` — só para descoberta, quando não sabe onde a informação está. Aceita `regex=true` e `caseSensitive=true`.
  4. `brain_status` — apenas na primeira conversa em uma máquina nova ou ao validar o setup. Retorna inventário completo.

> Evite `brain_status` em conversa de trabalho — gasta tokens listando arquivos que você não vai abrir. Já tem o mapa abaixo.

---

## 2. Mapa de decisão — qual skill ler para qual tarefa

> Skills estão organizadas em três namespaces:
> - `Skills/dev/` — engenharia (backend, frontend, qa, infra, security, swagger, supabase)
> - `Skills/ops/` — meta/processo (core, planner, memory, mentor, mcp-setup)
> - `Skills/business/` — vertical comercial (shopee, criação de imagem de produto)

| Tarefa do usuário                                          | Skill primária                                  | Skills secundárias                       |
|------------------------------------------------------------|--------------------------------------------------|------------------------------------------|
| Criar/refatorar fluxo CRUD backend (Controller→Service→Repo) | `Skills/dev/skill-layers.md`                     | `Skills/dev/skill-back.md`               |
| Revisão de segurança / discordância ativa                  | `Skills/dev/skill-secur.md`                      | `Skills/dev/skill-back.md`               |
| Escrever testes por camada (Service, Repo, Controller)     | `Skills/dev/skill-unit-tests.md`                 | `Skills/dev/skill-qa.md`                 |
| Rodar testes / TDD / filosofia de cobertura                | `Skills/dev/skill-qa.md`                         | `Skills/dev/skill-layers.md`             |
| Tela nova (Blade + CSS + JS isolados, Dark/Light)          | `Skills/dev/skill-front.md`                      | —                                        |
| Setup Docker / deploy / Render / CI/CD                     | `Skills/dev/skill-infra.md`                      | —                                        |
| Documentar API (Swagger / OpenAPI / L5-Swagger)            | `Skills/dev/skill-swagger-docs.md`               | `Skills/dev/skill-layers.md`             |
| Consulta a banco via Supabase MCP                          | `Skills/dev/skill-supabase.md`                   | —                                        |
| Tarefa complexa (>3 arquivos) — planejar antes de codar    | `Skills/ops/skill-planner.md`                    | `Skills/dev/skill-layers.md`             |
| Decisão arquitetural durável (criar ADR)                   | `Skills/ops/skill-memory.md`                     | —                                        |
| Modo de ensino / "me explique"                             | `Skills/ops/skill-mentor.md`                     | —                                        |
| Setup ou reconfiguração de MCP em IDE/agente               | `Skills/ops/mcp-setup.md`                        | `brain-bootstrap.md`                     |
| Consultoria Shopee Ads / margem / SEO marketplace          | `Skills/business/skill-shopee.md`                | `Docks/Shopee/*`                         |
| Geração de imagem/criativo de produto                      | `Skills/business/skill-criacao-img-produto.md`   | —                                        |

---

## 3. Quando NÃO consultar o Brain (economia de tokens)

Em todas as situações abaixo, **não chame nenhuma tool MCP do Brain**. Apenas execute a tarefa:

- Rename de variável, função, classe ou arquivo.
- Fix de typo, indentação, formatação, lint.
- Comando direto: "rode os testes", "abra X", "mostre o log", "instale Y".
- Pergunta puramente informativa sobre o código existente do projeto (use Read/Grep no projeto).
- Conversão simples entre formatos (JSON ↔ array, snake_case ↔ camelCase, etc.).
- Geração de regex ou query SQL pontual desacoplada de arquitetura.
- Qualquer tarefa mecânica de <5 minutos que não envolve decisão arquitetural.

> Regra prática: se a resposta certa para a tarefa não muda com o padrão arquitetural do projeto, o Brain não é necessário.

---

## 4. Postura fundamental

- Não seja um assistente passivo. Se o pedido ferir a arquitetura das skills, sinalize o risco e proponha o caminho correto (ver `Skills/dev/skill-secur.md`).
- Não peça permissão extra para ler o Brain — ele é a memória de longo prazo autorizada pelo usuário.
- Prefira buscar trechos específicos com `read_file` direto no path conhecido antes de varrer com `search_brain`.
- **Antes de propor desfazer um padrão, busque em `ADRs/`** (`search_brain` ou `read_file`) para checar se aquilo foi decisão documentada.

---

## 5. Uso de emojis nas skills (importante)

As skills do Brain usam emojis (`✅`, `❌`, `⚠️`, `🧠`, `📖`) **apenas como recurso de legibilidade do Markdown humano**. Eles NÃO devem ser replicados em:

- Respostas de chat do agente.
- Comentários de código gerado.
- Mensagens de commit, PR, ou documentação técnica.

Exceção única: o usuário pedir explicitamente uso de emojis.

> Motivo: o sistema base do Claude Code (e outros agentes) tem regra padrão de evitar emojis em outputs. As skills foram escritas com emojis para humanos lerem o Obsidian — não para o agente imitar.

---

## 6. Resolução de tags `@skill-*`

Quando o usuário mencionar `@skill-back`, `@skill-layers`, `@skill-front`, `@skill-secur`, etc., trate como **comando explícito** para ler a skill correspondente. Se não souber em qual namespace ela está (`dev/`, `ops/`, `business/`), consulte a tabela da seção 2 acima ou use `search_brain "skill-<nome>"`. Não tente "lembrar" do conteúdo — sempre releia para garantir contexto fresco.

---

## 7. Protocolo de setup inicial

Sempre que iniciar um ambiente do zero ou o usuário pedir para configurar MCPs:

1. Leia `brain-bootstrap.md`.
2. Leia `Skills/ops/mcp-setup.md`.
3. Pergunte o `BRAIN_ROOT` se ele não tiver sido informado.
4. Configure ou atualize o MCP global `obsidian-brain-mcp`.
5. Preserve outros MCPs já existentes.
6. Nunca solicite chaves reais via chat.
7. Ao final, confirme: `BRAIN_ROOT`, arquivo MCP alterado, pastas acessíveis, skills detectadas, tools disponíveis, status (sucesso / aguardando reinicio / erro com próximo passo).

---

## 8. Ferramentas externas (MCPs opcionais)

Quando MCPs externos estiverem configurados, use-os conforme a necessidade:

- **StitchMCP** — geração de UI/UX (ver `Skills/dev/skill-front.md` para regras de pós-processamento).
- **Supabase MCP** — consultas controladas ao banco (ver `Skills/dev/skill-supabase.md`).
- **Notion MCP** — escrita de páginas autorizadas (ex: salvamento duplo do `Skills/business/skill-shopee.md`).
- **Postman MCP** — geração/manutenção de coleções.

Antes de usar qualquer MCP externo que dependa de credencial, confirme que a ferramenta está realmente disponível no ambiente atual antes de assumir.
