# obsidian-brain (plugin Cowork)

Plugin Cowork minimalista que registra o servidor MCP `obsidian-brain-mcp` apontando para o repositorio clonado do Obsidian Brain.

## Arquitetura

Plugin **ponteiro** (nao container). O `.plugin` carrega apenas:

- `.claude-plugin/plugin.json` — manifesto
- `.mcp.json` — declaracao do servidor MCP usando `${OBSIDIAN_BRAIN_ROOT}`
- `README.md` — este arquivo

O conteudo real (Skills, Docks, Plans, ADRs, Workflows) e o codigo do servidor (`mcp-server/index.js`) continuam vivendo no repositorio git clonado em `OBSIDIAN_BRAIN_ROOT`. O MCP le do filesystem em runtime.

## Quando precisa atualizar o plugin

| Mudanca no Brain | Reempacotar plugin? |
| --- | --- |
| Editar/adicionar `.md` em `Skills/`, `Docks/`, `Plans/`, `ADRs/`, `Workflows/` | Nao. Basta `git pull`. |
| Adicionar pasta nova de conteudo | Nao. O MCP le dinamicamente. |
| Mudar `mcp-server/index.js` (adicionar/remover tool MCP) | Sim, reempacotar. |
| Trocar de maquina | Nao reempacotar. Setar `OBSIDIAN_BRAIN_ROOT` na nova maquina. |

## Pre-requisitos no sistema

- Node.js 20+ instalado e no `PATH`.
- Repositorio do Brain clonado.
- Dependencias do MCP instaladas em `<BRAIN_ROOT>/mcp-server/` via `npm install`.
- Variavel de ambiente `OBSIDIAN_BRAIN_ROOT` apontando para a pasta do clone.

## Ferramentas MCP expostas

- `brain_status` — diagnostico do Brain
- `list_skills` — lista as skills disponiveis em `Skills/`
- `read_file` — le um arquivo relativo ao `BRAIN_ROOT`
- `search_brain` — busca textual no conteudo do Brain

## Como reempacotar o plugin

```bash
cd <BRAIN_ROOT>/plugin/obsidian-brain
zip -r /tmp/obsidian-brain.plugin . -x "*.DS_Store"
```

Depois arraste o arquivo `.plugin` para o Cowork ou instale via UI.
