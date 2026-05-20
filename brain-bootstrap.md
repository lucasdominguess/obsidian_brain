# Bootstrap do Obsidian Brain para Agentes

Use este arquivo quando um agente/IDE estiver iniciando pela primeira vez.

## Prompt curto para o usuario colar

```text
Meu Obsidian Brain esta em <BRAIN_ROOT>. Leia <BRAIN_ROOT>/brain-bootstrap.md e configure seu MCP global. Ao final, confirme quais pastas, skills e ferramentas voce consegue acessar.
```

Substitua `<BRAIN_ROOT>` pelo caminho absoluto da pasta clonada. Exemplo:

```text
Meu Obsidian Brain esta em C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD. Leia C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD\brain-bootstrap.md e configure seu MCP global.
```

## Protocolo para o agente

1. Se o usuario nao informou `BRAIN_ROOT`, pergunte apenas pelo caminho absoluto da pasta clonada do Obsidian Brain.
2. Verifique se existe `<BRAIN_ROOT>/mcp-server/index.js`.
3. Se as dependencias do MCP nao estiverem instaladas, instale em `<BRAIN_ROOT>/mcp-server`.
4. Configure o MCP global da IDE/agente atual com o servidor `obsidian-brain-mcp`. Consulte `Skills/mcp-setup.md` para o arquivo e formato corretos de cada agente (Claude Code CLI, Cursor, VS Code/Copilot, Antigravity, etc.).
5. Nunca grave chaves reais, tokens ou caminhos locais gerados dentro dos templates versionados do repositorio.
6. Reinicie ou solicite reinicio da IDE/agente quando a ferramenta MCP so carregar no boot.

## Bloco MCP minimo

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

Para Antigravity, inclua tambem:

```json
"$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate"
```

## Confirmacao obrigatoria ao final

Ao terminar o start inicial ou a migracao legada, responda ao usuario com:

- `BRAIN_ROOT` usado.
- Arquivo de configuracao MCP alterado ou instrucoes manuais entregues.
- Pastas do Brain acessiveis: `Skills`, `Docks`, `ADRs`, `Workflows`, `Plans`, quando existirem.
- Skills encontradas, pelo menos os nomes principais retornados por `list_skills`.
- Ferramentas MCP disponiveis: `brain_status`, `list_skills`, `read_file`, `search_brain`.
- Resultado final: sucesso, sucesso aguardando reinicio, ou erro com o proximo passo exato.
