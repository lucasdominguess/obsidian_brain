---
tags:
  - skill/mcp
  - infra/config
---

# Configuracao padrao de MCPs

Esta skill centraliza o modelo de MCPs usado pelos agentes. O servidor obrigatorio e o `obsidian-brain-mcp`, que da acesso ao Brain global a partir de um caminho absoluto unico (`BRAIN_ROOT`).

---

## Referencia rapida

| Agente | Arquivo de configuracao | Chave do bloco |
|---|---|---|
| Claude Code CLI | `%USERPROFILE%\.claude\settings.json` | `mcpServers` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` | `mcpServers` |
| Cursor | `%USERPROFILE%\.cursor\mcp.json` | `mcpServers` |
| VS Code nativo (Copilot) | `%APPDATA%\Code\User\mcp.json` | `servers` |
| Cline / Roo (VS Code) | `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json` | `mcpServers` |
| Antigravity | `%USERPROFILE%\.gemini\antigravity\mcp_config.json` | `mcpServers` + `$typeName` |
| Codex CLI | `%USERPROFILE%\.codex\config.yaml` | `mcp_servers` (verificar doc oficial) |

> Prefira sempre o arquivo **global** do agente para manter o Brain disponivel em qualquer projeto sem reconfigurar.

---

## 1. Contrato

O agente deve receber ou perguntar o caminho absoluto do clone do Brain uma unica vez:

```text
BRAIN_ROOT = C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD
```

---

## 2. Bloco JSON padrao (maioria dos agentes)

Usado por: Claude Code CLI, Claude Desktop, Cursor, Cline/Roo.

```json
{
  "mcpServers": {
    "obsidian-brain-mcp": {
      "command": "node",
      "args": [
        "<BRAIN_ROOT>/mcp-server/index.js"
      ],
      "env": {
        "OBSIDIAN_BRAIN_ROOT": "<BRAIN_ROOT>"
      }
    }
  }
}
```

---

## 3. Configuracao por agente

### Claude Code CLI

- Global: `%USERPROFILE%\.claude\settings.json`
- Projeto: `.claude/settings.json` (na raiz do repositorio)
- Use o bloco padrao da secao 2.

### Claude Desktop

- `%APPDATA%\Claude\claude_desktop_config.json`
- Use o bloco padrao da secao 2.

### Cursor

- Global: `%USERPROFILE%\.cursor\mcp.json`
- Projeto: `.cursor/mcp.json`
- Use o bloco padrao da secao 2.

### VS Code nativo — GitHub Copilot

O VS Code usa a chave `servers` (nao `mcpServers`) e exige o campo `type`:

- Global: `%APPDATA%\Code\User\mcp.json`
- Workspace: `.vscode/mcp.json`

```json
{
  "servers": {
    "obsidian-brain-mcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "<BRAIN_ROOT>/mcp-server/index.js"
      ],
      "env": {
        "OBSIDIAN_BRAIN_ROOT": "<BRAIN_ROOT>"
      }
    }
  }
}
```

### Cline / Roo (extensao VS Code)

- `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`
- Use o bloco padrao da secao 2.

### Antigravity

- `%USERPROFILE%\.gemini\antigravity\mcp_config.json`
- Use o bloco padrao da secao 2, mas adicione `$typeName` dentro do bloco do servidor:

```json
{
  "mcpServers": {
    "obsidian-brain-mcp": {
      "$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate",
      "command": "node",
      "args": [
        "<BRAIN_ROOT>/mcp-server/index.js"
      ],
      "env": {
        "OBSIDIAN_BRAIN_ROOT": "<BRAIN_ROOT>"
      }
    }
  }
}
```

### Codex CLI (OpenAI)

- `%USERPROFILE%\.codex\config.yaml`
- O formato pode variar entre versoes; consulte a documentacao oficial do Codex CLI para o campo correto de MCP servers.

---

## 4. Inicializador automatico (opcional)

Quando puder executar Node no repositorio do Brain, use o script para injetar o bloco automaticamente com backup:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent auto
```

Agentes suportados:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-code
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-desktop
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cline-roo
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent antigravity
```

Para gerar o JSON sem gravar (modo inspecao):

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor --print
```

---

## 5. Templates versionados

Templates estao divididos em dois arquivos por razoes de seguranca:

- **`mcp-config/mcp.brain-only.template.json`** — APENAS o bloco do Brain. Seguro para versionar e copiar livremente.
- **`mcp-config/mcp.external.template.json`** — MCPs externos (Stitch, Notion, Supabase, Postman). Contem placeholders de chaves. **Copiar para fora do repo antes de preencher chaves reais.**

Templates por agente (apenas o bloco do Brain, ja formatado para o agente):

- `mcp-config/agents/claude-desktop.template.json`
- `mcp-config/agents/cursor.template.json`
- `mcp-config/agents/cline-roo.template.json`
- `mcp-config/agents/antigravity.template.json`

Credenciais reais nunca devem ser gravadas no repositorio. Elas pertencem ao arquivo local da IDE/agente ou a um cofre de senhas.

---

## 6. Validacao obrigatoria

Depois da configuracao, o agente deve confirmar:

- `BRAIN_ROOT` usado.
- Arquivo MCP atualizado ou JSON entregue para configuracao manual.
- Pastas lidas: `Skills`, `Docks`, `ADRs`, `Workflows`, `Plans` (quando existirem).
- Skills encontradas no `brain_status` (lista por pasta).
- Ferramentas disponiveis: `brain_status`, `read_file`, `read_section`, `search_brain`.
- Resultado final: sucesso, sucesso aguardando reinicio, ou erro com proximo passo.
