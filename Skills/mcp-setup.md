---
tags:
  - skill/mcp
  - infra/config
---

# Configuração Padrão de MCPs (Model Context Protocol)

Este documento centraliza as integrações de ferramentas de IA (MCPs) do seu fluxo de desenvolvimento. Quando você migrar de IDE (Cursor, VSCode), formatar a máquina ou instanciar um novo Agente, basta usar a estrutura JSON abaixo para restaurar todos os "poderes" da IA.

## 1. O Template JSON Universal

Copie o JSON abaixo e substitua as chaves `<MARCAÇÕES_MAIÚSCULAS>` pelas credenciais reais. 
**Regra de Ouro:** Suas chaves de API nunca devem ser coladas aqui no Obsidian por segurança. Mantenha os *placeholders*.

```json
{
  "mcpServers": {
    "StitchMCP": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://stitch.googleapis.com/mcp",
        "--header",
        "X-Goog-Api-Key: <SEU_GOOGLE_API_KEY_AQUI>"
      ],
      "env": {}
    },
    "notion-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@notionhq/notion-mcp-server"
      ],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer <SUA_CHAVE_DO_NOTION_AQUI>\", \"Notion-Version\": \"2022-06-28\"}"
      }
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.supabase.com/mcp?project_ref=<SEU_SUPABASE_PROJECT_REF_AQUI>"
      ],
      "env": {}
    }
  }
}
```

## 2. Onde configurar em cada Ecossistema?

Cada IDE/Agente mapeia a leitura dos servidores MCP em um local diferente. Se guie pelo mapeamento abaixo:

- **Cursor IDE**
  - **Onde:** Na IDE, acesse `Settings > Features > MCP` e adicione manualmente.
  - **Como:** Em "Type", escolha `command`. Preencha com `npx` e cole os `args` do template um a um.

- **Claude Desktop (Windows)**
  - **Onde:** Abra o arquivo `%APPDATA%\Claude\claude_desktop_config.json`
  - **Como:** Cole o bloco JSON integral (com suas chaves preenchidas) dentro do nó pai.

- **Cline / Roo / Cline (VS Code Extension)**
  - **Onde:** Abra o arquivo `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`
  - **Como:** O arquivo aceita o JSON bruto exatamente no formato do template 1.

- **Antigravity (Aplicações Google AI)**
  - **Onde:** Abra o arquivo `C:\Users\<SeuUsuario>\.gemini\antigravity\mcp_config.json`
  - **Como:** *Atenção especial!* Essa engine requer a injeção do schema de tipagem nativa. Ao lado de cada chave `"command"`, adicione obrigatoriamente a linha:
    `"$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate",`

## 3. Sugestão de Governança (SecOps)

Dado o seu interesse em construir uma máquina bem azeitada e reutilizável, aconselho a seguinte gestão de segredos (Secrets Management):

1. **Vault Mestre:** Crie uma anotação trancada ou cofre de senhas (no Bitwarden, 1Password, ou no chaveiro nativo do Windows/Mac) batizado como "Master MCP Keys". 
2. **Atualização Centralizada:** Sempre que nós (IA) ou você adicionarmos uma nova Skill conectada, documentamos o *esqueleto (placeholders)* aqui neste arquivo Markdown, e você leva o *secret real* apenas para o seu cofre Master e para o arquivo `.json` escondido da IDE atual.
3. Isso garante que seu repositório de Obsidian não tenha credenciais expostas que seriam fatalmente sincronizadas para nuvens não-confiáveis (em eventuais plugins de Sync) ou lidas acidentalmente.
