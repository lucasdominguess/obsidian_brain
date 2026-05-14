---
tags:
  - skill/mcp
  - infra/config
---

# Configuracao padrao de MCPs

Esta skill centraliza o modelo de MCPs usado pelos agentes. O servidor obrigatorio e o `obsidian-brain-mcp`, que da acesso ao Brain global sem depender de symlink `.brain` dentro dos projetos.

## 1. Contrato atual

O agente deve receber ou perguntar o caminho absoluto do clone do Brain:

```text
BRAIN_ROOT
```

Todo agente/IDE deve registrar:

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

No Antigravity, adicione tambem:

```json
"$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate"
```

## 2. Templates versionados

Use estes arquivos como fonte:

- `mcp-config/mcp.base.template.json`
- `mcp-config/agents/antigravity.template.json`
- `mcp-config/agents/claude-desktop.template.json`
- `mcp-config/agents/cline-roo.template.json`
- `mcp-config/agents/cursor.template.json`

O template base tambem documenta MCPs externos com placeholders:

- `StitchMCP`
- `notion-mcp-server`
- `supabase`
- `postman-mcp-server`

Credenciais reais nunca devem ser gravadas no repositorio. Elas pertencem ao arquivo local da IDE/agente ou a um cofre de senhas.

## 3. Inicializador opcional

Quando puder executar Node no repositorio do Brain:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent auto
```

Agentes conhecidos:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent antigravity
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-desktop
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cline-roo
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor
```

Para gerar JSON sem gravar:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor --print
```

## 4. Onde configurar em cada ecossistema

- Cursor:
  - Global: `C:\Users\<SeuUsuario>\.cursor\mcp.json`
  - Projeto: `.cursor/mcp.json`
  - Prefira o global para manter o Brain disponivel em qualquer projeto.

- Claude Desktop no Windows:
  - `%APPDATA%\Claude\claude_desktop_config.json`

- Cline/Roo no VS Code:
  - `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`

- Antigravity:
  - `C:\Users\<SeuUsuario>\.gemini\antigravity\mcp_config.json`
  - Exige `$typeName` no bloco do servidor.

## 5. Migracao de agente legado

Se o start antigo ja foi feito por symlink, o agente pode encontrar algo como:

```json
"args": [
  ".brain/mcp-server/index.js"
]
```

ou um caminho absoluto dentro de um projeto especifico.

Nesse caso:

1. Faca backup do JSON antes de editar.
2. Substitua apenas o servidor `obsidian-brain-mcp`.
3. Use `<BRAIN_ROOT>/mcp-server/index.js`.
4. Adicione `env.OBSIDIAN_BRAIN_ROOT`.
5. Preserve todos os outros MCPs existentes.
6. Reinicie a IDE/agente se necessario.

O symlink `.brain` pode continuar existindo em projetos antigos, mas nao deve mais ser a fonte principal do Brain.

## 6. Validacao obrigatoria

Depois da configuracao ou migracao, o agente deve confirmar:

- `BRAIN_ROOT` usado.
- Arquivo MCP atualizado ou JSON entregue para configuracao manual.
- Se encontrou e corrigiu configuracao legada com `.brain`.
- Pastas lidas: `Skills`, `Docks`, `ADRs`, `Workflows`, `Plans`, quando existirem.
- Skills encontradas por `list_skills`.
- Ferramentas disponiveis: `brain_status`, `list_skills`, `read_file`, `search_brain`.
- Resultado final: sucesso, sucesso aguardando reinicio, ou erro com proximo passo.
