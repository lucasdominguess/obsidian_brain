# Obsidian Brain - Base global para agentes de IA

Este repositorio e a base central de conhecimento usada pelo Obsidian e pelos agentes de IA. Ele guarda skills, documentos de apoio, decisoes tecnicas e a configuracao do MCP local que permite ao agente consultar o Brain sem depender do projeto aberto.

O objetivo atual e simples: abrir qualquer IDE ou agente, em qualquer projeto, e o agente conseguir encontrar este Brain pelo caminho absoluto do clone e pelo servidor MCP global.

## Arquitetura atual

O fluxo principal agora e:

1. O repositorio e clonado em qualquer pasta da maquina.
2. O usuario informa uma vez o caminho absoluto dessa pasta, chamado `BRAIN_ROOT`.
3. A IDE/agente registra o MCP global `obsidian-brain-mcp`.
4. O MCP aponta diretamente para `<BRAIN_ROOT>/mcp-server/index.js`.
5. O agente consulta `Skills`, `Docks`, `ADRs`, `Workflows` e `Plans` usando as ferramentas MCP.

## Setup do zero

### 1. Clone o repositorio

Clone este repositorio em qualquer pasta. Guarde o caminho absoluto da pasta clonada.

Exemplo:

```text
C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD
```

Neste guia, esse caminho sera chamado de `BRAIN_ROOT`.

### 2. Instale as dependencias do MCP local

Abra um terminal em:

```text
<BRAIN_ROOT>\mcp-server
```

Execute:

```bash
npm install --strict-ssl=false
```

### 3. Peca ao agente para se configurar

Na IDE/agente, cole:

```text
Meu Obsidian Brain esta em <BRAIN_ROOT>. Leia <BRAIN_ROOT>/brain-bootstrap.md e configure seu MCP global. Ao final, confirme quais pastas, skills e ferramentas voce consegue acessar.
```

Exemplo:

```text
Meu Obsidian Brain esta em C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD. Leia C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD\brain-bootstrap.md e configure seu MCP global. Ao final, confirme quais pastas, skills e ferramentas voce consegue acessar.
```

## Setup do zero - Claude Cowork (plugin)

O **Claude Cowork** nao le `claude_desktop_config.json`. Ele usa um sistema proprio de plugins. O Brain ja inclui um plugin **ponteiro** pronto em `plugin/obsidian-brain/`.

Importante: o plugin nao empacota Skills, Docks ou o codigo do MCP. Ele apenas registra o servidor MCP apontando para `${OBSIDIAN_BRAIN_ROOT}/mcp-server/index.js`. Todo o conteudo continua vivendo no clone do repositorio, lido em runtime.

### Passo a passo em maquina nova

#### 1. Pre-requisitos

- Node.js 20+ instalado e disponivel no `PATH` do sistema.
- Git instalado.
- Claude Cowork instalado.

Validacao:

```bash
node --version
git --version
```

#### 2. Clonar o Brain

```bash
git clone <URL_DO_REPO_BRAIN> C:\caminho\Obsidian-LD
```

O caminho absoluto sera o `BRAIN_ROOT`. Use o que preferir, sem espacos quando possivel.

#### 3. Instalar dependencias do servidor MCP

```bash
cd <BRAIN_ROOT>\mcp-server
npm install --strict-ssl=false
```

Isso popula `node_modules/` localmente. Nao versionar.

#### 4. Setar a variavel de ambiente `OBSIDIAN_BRAIN_ROOT`

**Windows (PowerShell, persistente):**

```powershell
[System.Environment]::SetEnvironmentVariable("OBSIDIAN_BRAIN_ROOT", "C:\caminho\Obsidian-LD", "User")
```

Feche e reabra o terminal e o Cowork para a variavel ser herdada.

Validacao:

```powershell
$env:OBSIDIAN_BRAIN_ROOT
```

**Linux/macOS (bash/zsh, persistente):** adicione em `~/.bashrc` ou `~/.zshrc`:

```bash
export OBSIDIAN_BRAIN_ROOT="/home/usuario/obsidian-brain"
```

Recarregue: `source ~/.bashrc` (ou abra terminal novo).

#### 5. Empacotar o plugin (se ainda nao existir o `.plugin`)

```bash
cd <BRAIN_ROOT>\plugin\obsidian-brain
zip -r obsidian-brain.plugin . -x "*.DS_Store"
```

No Windows sem `zip` nativo, use PowerShell:

```powershell
cd <BRAIN_ROOT>\plugin\obsidian-brain
Compress-Archive -Path .\* -DestinationPath ..\obsidian-brain.zip -Force
Rename-Item ..\obsidian-brain.zip ..\obsidian-brain.plugin -Force
```

O `Compress-Archive` ignora dotfiles por padrao. Para incluir `.claude-plugin/` e `.mcp.json`, use:

```powershell
cd <BRAIN_ROOT>\plugin\obsidian-brain
Compress-Archive -Path .\.claude-plugin, .\.mcp.json, .\README.md -DestinationPath ..\obsidian-brain.zip -Force
Rename-Item ..\obsidian-brain.zip ..\obsidian-brain.plugin -Force
```

#### 6. Instalar no Cowork

Arraste o `obsidian-brain.plugin` para a janela do Cowork, ou abra Settings > Plugins > Install plugin > selecione o arquivo. Reinicie o Cowork apos a instalacao.

#### 7. Validar

Em uma nova conversa, peca:

```text
rode brain_status e list_skills
```

Esperado: o agente lista 4 ferramentas do MCP (`brain_status`, `list_skills`, `read_file`, `search_brain`) e retorna o inventario de skills do `Skills/`.

### Quando recriar o plugin

| Mudanca | Recriar o `.plugin`? |
| --- | --- |
| Editar/criar `.md` em `Skills/`, `Docks/`, `Plans/`, `ADRs/`, `Workflows/` | Nao. `git pull` no `BRAIN_ROOT`. |
| Adicionar pasta nova de conteudo | Nao. O MCP le dinamicamente. |
| Editar `mcp-server/index.js` (adicionar/remover tool MCP, mudar schema) | Sim. Reempacote e reinstale. |
| Mudar dependencia em `mcp-server/package.json` | Nao recriar o plugin, mas rodar `npm install` no `BRAIN_ROOT/mcp-server` novamente. |
| Trocar de maquina | Nao recriar. So setar `OBSIDIAN_BRAIN_ROOT` na nova maquina e instalar o `.plugin` la. |

### Workflow de sincronia entre maquinas

1. Maquina A: edita skill no Obsidian, `git add` e `git push` no repo.
2. Maquina B: `cd <BRAIN_ROOT> && git pull`.
3. Maquina B: proxima query MCP no Cowork ja ve o conteudo atualizado. Sem reinstalar plugin, sem reiniciar Cowork.

### 4. Opcional: usar o inicializador Node

Se o agente puder executar comandos locais e ja existir um arquivo MCP conhecido, ele pode usar:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent auto
```

Para setup do zero, normalmente e melhor escolher o agente explicitamente:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-code
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-desktop
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cline-roo
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent antigravity
```

Para apenas gerar o JSON sem gravar:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor --print
```

## Setup manual

Se a IDE/agente nao puder editar arquivos fora do projeto atual, copie o bloco de `mcp-config/mcp.base.template.json`, substitua `<BRAIN_ROOT>` pelo caminho absoluto real e cole na configuracao MCP da IDE.

Templates disponiveis:

- `mcp-config/mcp.base.template.json`
- `mcp-config/agents/claude-code.template.json`
- `mcp-config/agents/claude-desktop.template.json`
- `mcp-config/agents/cursor.template.json`
- `mcp-config/agents/cline-roo.template.json`
- `mcp-config/agents/antigravity.template.json`

## Confirmacao obrigatoria do agente

Ao terminar a configuracao, o agente deve responder com:

- `BRAIN_ROOT` usado.
- Arquivo MCP alterado ou instrucao manual entregue.
- Pastas acessiveis: `Skills`, `Docks`, `ADRs`, `Workflows`, `Plans`, quando existirem.
- Skills detectadas, pelo menos os nomes principais retornados por `list_skills`.
- Ferramentas MCP disponiveis: `brain_status`, `list_skills`, `read_file`, `search_brain`.
- Status final: sucesso, sucesso aguardando reinicio da IDE/agente, ou erro com o proximo passo exato.

## Estrutura do conhecimento

- `Skills/`: padroes de arquitetura, prompts sistemicos, regras de stack e operacao.
- `Docks/`: documentacoes de apoio, guias longos e snippets.
- `ADRs/`: decisoes arquiteturais duraveis, quando existirem.
- `Workflows/`: checklists operacionais, quando existirem.
- `Plans/`: blueprints gerados pelo planner local, ignorados pelo Git por padrao.
- `mcp-server/`: servidor MCP local em Node.js.
- `mcp-config/`: templates versionados de configuracao MCP.
- `tools/brain-init.mjs`: inicializador opcional para atualizar JSONs MCP locais.
- `plugin/obsidian-brain/`: source do plugin Cowork (arquitetura ponteiro). Empacotar como `.plugin` para instalar no Claude Cowork.

## Regras para escrever novas skills

Nao grave caminhos absolutos dentro de skills, docks ou ADRs versionados. Caminhos absolutos pertencem apenas a configuracoes locais da IDE/agente.

Dentro das notas, prefira caminhos relativos ao Brain:

```markdown
Busque as regras de design em `Skills/skill-front.md`.
```

O agente deve consultar o conteudo pelo MCP sempre que possivel, usando `search_brain`, `list_skills`, `read_file` e `brain_status`.
