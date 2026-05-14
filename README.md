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

O antigo symlink `.brain` continua podendo existir em projetos antigos, mas virou fluxo legado/opcional. Ele nao e mais necessario para SISDTIC, SGOPM ou qualquer outro projeto novo.

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

### 4. Opcional: usar o inicializador Node

Se o agente puder executar comandos locais e ja existir um arquivo MCP conhecido, ele pode usar:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent auto
```

Para setup do zero, normalmente e melhor escolher o agente explicitamente:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent antigravity
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent claude-desktop
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cline-roo
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor
```

Para apenas gerar o JSON sem gravar:

```bash
node tools/brain-init.mjs --brain-root "<BRAIN_ROOT>" --agent cursor --print
```

## Setup manual

Se a IDE/agente nao puder editar arquivos fora do projeto atual, copie o bloco de `mcp-config/mcp.base.template.json`, substitua `<BRAIN_ROOT>` pelo caminho absoluto real e cole na configuracao MCP da IDE.

Templates disponiveis:

- `mcp-config/mcp.base.template.json`
- `mcp-config/agents/antigravity.template.json`
- `mcp-config/agents/claude-desktop.template.json`
- `mcp-config/agents/cline-roo.template.json`
- `mcp-config/agents/cursor.template.json`

## Migracao de agente legado com symlink

Use este fluxo quando o agente/IDE ja foi configurado antes pelo modelo antigo, com `.brain` dentro de cada projeto.

1. Abra a configuracao MCP global da IDE/agente.
2. Procure o servidor `obsidian-brain-mcp`.
3. Se `args` apontar para `.brain/mcp-server/index.js` ou para uma pasta de projeto especifica, substitua por:

```json
{
  "command": "node",
  "args": [
    "<BRAIN_ROOT>/mcp-server/index.js"
  ],
  "env": {
    "OBSIDIAN_BRAIN_ROOT": "<BRAIN_ROOT>"
  }
}
```

4. No Antigravity, mantenha tambem:

```json
"$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate"
```

5. Salve o arquivo e reinicie a IDE/agente.
6. Peca ao agente para rodar a validacao final descrita em `brain-bootstrap.md`.

O symlink `.brain` pode permanecer nos projetos antigos sem quebrar nada. A diferenca e que o agente deixa de depender dele para encontrar o Brain.

## Confirmacao obrigatoria do agente

Ao terminar uma configuracao nova ou uma migracao legada, o agente deve responder com:

- `BRAIN_ROOT` usado.
- Arquivo MCP alterado ou instrucao manual entregue.
- Se havia configuracao legada com `.brain` e se ela foi atualizada.
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

## Regras para escrever novas skills

Nao grave caminhos absolutos dentro de skills, docks ou ADRs versionados. Caminhos absolutos pertencem apenas a configuracoes locais da IDE/agente.

Dentro das notas, prefira caminhos relativos ao Brain:

```markdown
Busque as regras de design em `Skills/skill-front.md`.
```

O agente deve consultar o conteudo pelo MCP sempre que possivel, usando `search_brain`, `list_skills`, `read_file` e `brain_status`.
