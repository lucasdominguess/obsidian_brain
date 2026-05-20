# Setup automatico do ambiente para agentes

Este arquivo deve ser lido pelo agente/IA quando o usuario pedir para configurar o Obsidian Brain em uma IDE nova ou atualizar uma configuracao antiga.

## Entrada obrigatoria

O agente precisa saber o caminho absoluto da pasta clonada do Brain.

Nome padrao desse caminho:

```text
BRAIN_ROOT
```

Se o usuario nao informou o caminho, pergunte apenas:

```text
Qual e o caminho absoluto da pasta onde voce clonou o Obsidian Brain?
```

## Passo 1: validar a pasta do Brain

Confirme que existem:

- `<BRAIN_ROOT>/brain-bootstrap.md`
- `<BRAIN_ROOT>/mcp-server/index.js`
- `<BRAIN_ROOT>/Skills`
- `<BRAIN_ROOT>/Docks`

Se algum item obrigatorio nao existir, pare e informe exatamente o item ausente.

## Passo 2: instalar dependencias do MCP local

No diretorio:

```text
<BRAIN_ROOT>/mcp-server
```

Execute:

```bash
npm install --strict-ssl=false
```

Se `node_modules` ja existir, valide pelo menos o script:

```bash
npm run check
```

## Passo 3: configurar o MCP global da IDE/agente

Registre ou atualize o servidor:

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

No Antigravity, inclua dentro do servidor:

```json
"$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate"
```

Antes de gravar qualquer arquivo JSON existente, crie um backup.

## Passo 4: alternativa automatica

Se puder executar Node no repositorio do Brain e ja existir um arquivo MCP conhecido, use:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent auto
```

Para setup do zero, escolha o agente explicitamente:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-code
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-desktop
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cline-roo
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent antigravity
```

Se a IDE nao permitir escrita fora do workspace, gere o JSON:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor --print
```

Depois entregue o JSON para o usuario colar manualmente.

## Passo 5: validar acesso ao Brain

Depois que a IDE/agente carregar o MCP, valide:

1. Execute `brain_status`.
2. Execute `list_skills`.
3. Execute `read_file` em `Skills/skill-planner.md`.
4. Execute `search_brain` buscando por `MCP`.

Se o MCP so ficar disponivel apos reinicio, avise o usuario para reiniciar a IDE/agente e repetir a validacao.

## Confirmacao obrigatoria ao usuario

Ao final, responda com:

- `BRAIN_ROOT` usado.
- Caminho do arquivo MCP alterado, ou informe que o modo manual foi necessario.
- Pastas acessiveis: `Skills`, `Docks`, `ADRs`, `Workflows`, `Plans`, quando existirem.
- Skills encontradas.
- Ferramentas MCP disponiveis: `brain_status`, `list_skills`, `read_file`, `search_brain`.
- Status final: sucesso, sucesso aguardando reinicio, ou erro com o proximo passo exato.

## Seguranca

Nunca grave chaves reais no repositorio do Brain. Use placeholders nos templates e deixe tokens reais apenas no arquivo local da IDE/agente ou em um cofre de senhas.
