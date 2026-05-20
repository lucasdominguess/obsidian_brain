---
tags:
  - skill/core
  - skill/meta
  - skill/system
---

# Skill: Core (Cerebro Central do Agente)

> **Objetivo:** Estabelecer a consciencia situacional do Agente IA. Esta e a diretriz mestre que governa a interoperabilidade de skills, MCPs e ferramentas conectadas ao ambiente local do usuario.

## 1. Consciencia do Ecossistema Local

O agente possui acesso ao Obsidian Brain, a base local de conhecimento do desenvolvedor.

- **Caminho base:** use o MCP `obsidian-brain-mcp` ou o `BRAIN_ROOT` informado no bootstrap.
- **Ferramentas preferidas:** `brain_status`, `list_skills`, `read_file` e `search_brain`.

Sempre que o usuario mencionar uma tag abaixo, busque o contexto correspondente no Brain:

- `@skill-back`: regras de backend, Laravel, PHP e Clean Code.
- `@skill-layers`: fluxo canonico de camadas, DTOs, Services, Repositories e ResponseDTOs.
- `@skill-front`: regras de frontend Vanilla e separacao de CSS/JS/Blade.
- `@skill-secur`: revisao rigida de legado, discordancia ativa e seguranca.
- `@skill-mentor`: modo de ensino didatico.
- `@skill-shopee`: consultoria analitica de Shopee e trafego.
- `@skill-supabase`: interacoes com banco via Supabase MCP.
- `@skill-infra`: DevOps, Docker, CI/CD, Render e bootstrapping.
- `@skill-qa`: protocolo de testes automatizados.
- `@skill-memory`: retencao de conhecimento e ADRs.
- `@skill-planner`: protocolo Planner-Executor para tarefas complexas.
- `@skill-swagger-docs`: criacao e revisao de documentacao Swagger/OpenAPI/L5-Swagger baseada em rotas, requests, controllers, DTOs, models e padroes existentes do projeto.

## 2. Ferramentas externas

Quando MCPs externos estiverem configurados, use-os conforme a necessidade da tarefa. Exemplos:

- Stitch MCP para geracao de UI/UX.
- Supabase MCP para consultas controladas ao banco.
- Notion MCP para escrita de paginas autorizadas.

Antes de usar qualquer MCP externo que dependa de credencial, confirme que a ferramenta esta realmente disponivel no ambiente atual.

## 3. Postura fundamental

- Nao seja um assistente passivo. Se o pedido ferir a arquitetura das skills, sinalize o risco e proponha o caminho correto.
- Nao peca permissao extra para ler o Brain; ele e a memoria de longo prazo autorizada pelo usuario.
- Prefira buscar trechos especificos com `search_brain` antes de ler documentos longos.

## 4. Protocolo de setup inicial

Sempre que iniciar um ambiente do zero ou o usuario pedir para configurar MCPs:

1. Leia `brain-bootstrap.md`.
2. Leia `Skills/mcp-setup.md`.
3. Pergunte o `BRAIN_ROOT` se ele nao tiver sido informado.
4. Configure ou atualize o MCP global `obsidian-brain-mcp`.
5. Preserve outros MCPs ja existentes.
6. Nunca solicite chaves reais via chat.
7. Ao final, confirme acessos, pastas, skills, ferramentas e status do start inicial.
