# Obsidian Brain — base global de conhecimento para agentes de IA

Repositorio central usado pelo Obsidian e pelos agentes de IA. Guarda skills versionadas, documentos de apoio, decisoes tecnicas e a configuracao do MCP local que da acesso ao Brain a partir de qualquer projeto.

**Objetivo:** abrir qualquer IDE/agente em qualquer projeto e o agente conseguir consultar o Brain pelo caminho absoluto do clone + servidor MCP global.

---

## Arquitetura

1. Repositorio clonado em qualquer pasta da maquina.
2. Usuario informa uma vez o caminho absoluto da pasta — o `BRAIN_ROOT`.
3. Variavel de ambiente `OBSIDIAN_BRAIN_ROOT` aponta para esse caminho.
4. IDE/agente registra o MCP global `obsidian-brain-mcp` no `settings.json` local.
5. Agente consulta `Skills/`, `Docks/`, `ADRs/`, `Workflows/` e `Plans/` usando 4 tools: `brain_status`, `read_file`, `read_section`, `search_brain`.

---

## Caminho mais simples — Claude Code CLI

A maioria dos agentes le um JSON `mcpServers`. Para o Claude Code CLI:

### Passo 1 — clonar e setar `OBSIDIAN_BRAIN_ROOT`

```bash
git clone <URL_DO_REPO_BRAIN> C:\caminho\Obsidian-LD
```

**Windows (PowerShell, persistente):**
```powershell
[System.Environment]::SetEnvironmentVariable("OBSIDIAN_BRAIN_ROOT", "C:\caminho\Obsidian-LD", "User")
```
Feche e reabra o terminal/IDE para a variavel ser herdada.

**Linux/macOS:** adicione `export OBSIDIAN_BRAIN_ROOT="/home/usuario/obsidian-brain"` ao `~/.bashrc` ou `~/.zshrc` e recarregue.

### Passo 2 — instalar dependencias do MCP local

```bash
cd <BRAIN_ROOT>/mcp-server
npm install --strict-ssl=false
```

### Passo 3 — registrar o MCP no `settings.json` global

Edite `%USERPROFILE%\.claude\settings.json` (Windows) ou `~/.claude/settings.json` (Linux/Mac) e mescle o bloco abaixo dentro de `mcpServers`:

```json
{
  "mcpServers": {
    "obsidian-brain-mcp": {
      "command": "node",
      "args": ["<BRAIN_ROOT>/mcp-server/index.js"],
      "env": { "OBSIDIAN_BRAIN_ROOT": "<BRAIN_ROOT>" }
    }
  }
}
```

Substitua `<BRAIN_ROOT>` pelo caminho absoluto real. Preserve outros servidores ja registrados.

### Passo 4 — validar

Abra uma conversa nova e peca: *"rode `brain_status` e me mostre o inventario completo do Brain."*

Esperado: 4 ferramentas listadas (`brain_status`, `read_file`, `read_section`, `search_brain`) + arvore de arquivos por pasta (`Skills/dev/`, `Skills/ops/`, `Skills/business/`, `Docks/`, `Plans/`, etc.).

---

## Outros agentes

| Agente | Arquivo de config | Chave |
|---|---|---|
| Claude Code CLI | `%USERPROFILE%\.claude\settings.json` | `mcpServers` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` | `mcpServers` |
| Cursor | `%USERPROFILE%\.cursor\mcp.json` | `mcpServers` |
| VS Code (Copilot) | `%APPDATA%\Code\User\mcp.json` | `servers` (precisa de campo `"type": "stdio"`) |
| Cline/Roo | `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json` | `mcpServers` |
| Antigravity | `%USERPROFILE%\.gemini\antigravity\mcp_config.json` | `mcpServers` + `$typeName` |

Detalhes por agente em `Skills/ops/mcp-setup.md`. Templates prontos em `mcp-config/agents/`.

### Inicializador opcional

Se voce puder rodar Node, o script abaixo injeta o bloco MCP automaticamente com backup:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-code
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent antigravity
# (use --print para inspecionar sem gravar)
```

---

## Alternativa: instalar como plugin Claude Cowork

O **Claude Cowork** nao le `claude_desktop_config.json`. Ele tem um sistema proprio de plugins. O Brain ja inclui um plugin ponteiro pronto em `plugin/obsidian-brain/`.

O plugin nao empacota Skills/Docks/MCP — apenas registra o servidor MCP apontando para `${OBSIDIAN_BRAIN_ROOT}/mcp-server/index.js`. Todo o conteudo continua no clone do repositorio.

### Empacotar o `.plugin`

**Linux/macOS (com `zip`):**
```bash
cd <BRAIN_ROOT>/plugin/obsidian-brain
zip -r obsidian-brain.plugin . -x "*.DS_Store"
```

**Windows PowerShell (sem `zip` nativo):**
```powershell
cd <BRAIN_ROOT>\plugin\obsidian-brain
Compress-Archive -Path .\.claude-plugin, .\.mcp.json, .\README.md -DestinationPath ..\obsidian-brain.zip -Force
Rename-Item ..\obsidian-brain.zip ..\obsidian-brain.plugin -Force
```

Arraste o `.plugin` para o Cowork ou: Settings → Plugins → Install plugin. Reinicie.

### Quando reempacotar

| Mudanca | Reempacotar? |
| --- | --- |
| Editar/criar `.md` em `Skills/`, `Docks/`, `Plans/`, `ADRs/`, `Workflows/` | Nao. `git pull` no `BRAIN_ROOT`. |
| Adicionar pasta nova de conteudo | Nao. O MCP le dinamicamente. |
| Editar `mcp-server/index.js` (adicionar/remover tool, mudar schema) | Sim. Reempacote e reinstale. |
| Mudar dependencia em `mcp-server/package.json` | Nao reempacotar, mas rodar `npm install` no `BRAIN_ROOT/mcp-server`. |
| Trocar de maquina | Nao reempacotar. So setar `OBSIDIAN_BRAIN_ROOT` na nova maquina. |

### Sincronia entre maquinas

1. Maquina A: edita skill no Obsidian, `git add` + `git push`.
2. Maquina B: `cd <BRAIN_ROOT> && git pull`.
3. Maquina B: proxima query MCP ja ve o conteudo atualizado. Sem reinstalar plugin, sem reiniciar.

---

## Confirmacao obrigatoria do agente apos setup

Ao finalizar configuracao, o agente deve responder com:

- `BRAIN_ROOT` usado.
- Arquivo MCP alterado (ou instrucao manual entregue).
- Pastas acessiveis: `Skills/dev/`, `Skills/ops/`, `Skills/business/`, `Docks`, `ADRs`, `Workflows`, `Plans` quando existirem.
- Skills detectadas pelo `brain_status` (ao menos os nomes principais por pasta).
- Ferramentas MCP disponiveis: `brain_status`, `read_file`, `read_section`, `search_brain`.
- Status final: sucesso / sucesso aguardando reinicio / erro com proximo passo exato.

---

## Estrutura do conhecimento

- `Skills/` — padroes, regras de stack, prompts sistemicos. Subdividido em:
  - `Skills/dev/` — engenharia (backend, frontend, qa, infra, security, swagger, supabase, layers).
  - `Skills/ops/` — meta/processo (core, planner, memory, mentor, mcp-setup).
  - `Skills/business/` — vertical comercial (shopee, criacao de imagem de produto).
- `Docks/` — documentacoes de apoio, guias longos, snippets, templates.
- `ADRs/` — decisoes arquiteturais duraveis (criadas conforme `Skills/ops/skill-memory.md`).
- `Workflows/` — checklists operacionais.
- `Plans/` — blueprints gerados pelo Planner local. Ignorados pelo Git por padrao.
- `mcp-server/` — servidor MCP local em Node.js (v1.1).
- `mcp-config/` — templates versionados:
  - `mcp.brain-only.template.json` — apenas o Brain, seguro.
  - `mcp.external.template.json` — MCPs externos com placeholders. **Copiar para fora do repo antes de preencher chaves.**
  - `agents/*.template.json` — bloco do Brain ja formatado por agente.
- `tools/brain-init.mjs` — inicializador opcional para atualizar JSONs MCP locais.
- `plugin/obsidian-brain/` — source do plugin Cowork (arquitetura ponteiro).

---

## Regras para escrever novas skills

- Nao grave caminhos absolutos em skills, docks ou ADRs versionados — pertencem apenas a configs locais da IDE/agente.
- Use caminhos relativos ao Brain (ex: `Skills/dev/skill-front.md`).
- Coloque a skill no namespace correto (`dev/`, `ops/`, `business/`).
- O agente deve consultar pelo MCP sempre que possivel — `read_section` > `read_file` > `search_brain` > `brain_status` em ordem de custo de tokens.
- Nao versionar chaves reais nem `node_modules/`.
