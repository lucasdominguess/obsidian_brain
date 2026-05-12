# Setup Automático do Ambiente (Para a Inteligência Artificial ler)

> **Instrução para a IA:** Se você (o Agente/IA) foi solicitado a ler este arquivo para configurar o ambiente em uma nova máquina, siga os passos abaixo rigorosamente.

## Passo 1: Inicializar o Servidor MCP Local

Temos um servidor MCP em Node.js (na pasta `mcp-server`) que atua como o indexador e "bibliotecário" desta base de conhecimento. Ele economiza tokens nas suas próprias requisições!

1. Acesse a pasta do servidor: `cd mcp-server`
2. Instale as dependências ignorando SSL (útil para redes corporativas): `npm install --strict-ssl=false`

## Passo 2: Configurar o MCP na sua própria IDE/Agent

Para que você (IA) consiga usar as ferramentas `search_brain`, `list_skills` e `read_file`, você precisa se registrar para escutar o MCP local.
Verifique em qual IDE/Agente você está rodando no momento e adicione o seguinte servidor à sua configuração:

**Nome do Servidor:** `obsidian-brain-mcp`
**Comando:** `node`
**Argumentos:** `["<CAMINHO_ABSOLUTO_DESTE_REPO>/mcp-server/index.js"]`

**Exemplo Prático (Se você for o Antigravity):**
Você tem permissão para editar o arquivo `mcp_config.json` (Geralmente em `~/.gemini/antigravity/mcp_config.json`). Adicione o seguinte nó dentro de `"mcpServers"`:

```json
"obsidian-brain-mcp": {
  "command": "node",
  "args": ["<CAMINHO_ABSOLUTO_DA_PASTA_OBSIDIAN_BRAIN>/mcp-server/index.js"],
  "env": {},
  "$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate"
}
```
*(Certifique-se de substituir o `<CAMINHO_ABSOLUTO>` pelo caminho real do repositório onde este arquivo está).*

## Passo 3: Criação de Symlink nos Projetos

Recomende ao usuário que ele use o script `link-brain.bat` na raiz de qualquer projeto novo que ele iniciar. Isso fará com que a pasta `.brain` apareça no projeto apontando para cá.

## Melhorias Adicionais de Governança (Sugestões ao Usuário)

1. **Vault de Segredos Separado:** Nunca armazene as chaves de API (Notion, Google, Supabase) puras no repositório do Obsidian. Deixe-as em um gerenciador de senhas (Bitwarden) e instrua a IA a pedir as chaves na hora do setup.
2. **Uso de `.env.brain`:** Em vez de editar configurações globais da IDE manualmente, use um script `.bat` ou `.sh` que injeta dinamicamente o arquivo `mcp_config.json` lendo de um template.
3. **Atualização do .gitignore:** A IA que fizer o setup deve confirmar se o `.gitignore` do projeto atual contém `/.brain/` e `/mcp-server/node_modules/`.
