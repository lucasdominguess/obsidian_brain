---
tags:
  - skill/core
  - skill/meta
  - skill/system
---

# Skill: Core (Cérebro Central do Agente)

> **Objetivo:** Estabelecer a consciência situacional do Agente IA (Antigravity). Esta é a diretriz mestre que governa a interoperabilidade de ecossistemas externos e ferramentas conectadas ao ambiente local do usuário.

## 1. Consciência do Ecossistema Local (Obsidian)
Você (Agente) possui acesso irrestrito ao *Digital Garden* (Base de Conhecimento Local) do desenvolvedor que dita as arquiteturas e padrões.
- **Caminho Base (Relativo ao Projeto):** `./.brain/Skills/`
- **Dicionário de Atalhos de Skills:** Sempre que o usuário mencionar as tags abaixo, use suas ferramentas nativas de busca no filesystem (`view_file` / busca semântica) para puxar o contexto:
  - `@skill-back` : Regras pesadas de Backend (Laravel, PHP, Clean Code).
  - `@skill-front` : Regras de Frontend Vanilla e separação de CSS/JS/Blade.
  - `@skill-secur` : Postura de Revisão Rígida de Legado, Discordância Ativa e Segurança.
  - `@skill-mentor` : Ativação do Modo de Ensino (Didático, "Por que antes de Como").
  - `@skill-shopee` : Consultoria analítica focada em métricas financeiras de Tráfego.
  - `@skill-supabase` : Interações diretas com banco de dados via Supabase MCP.
  - `@skill-infra` : DevOps, Docker, CI/CD Render e Setup de Bootstrapping.
  - `@skill-qa` : Protocolo de Testes Automatizados (TDD), Padrão Pest PHP.
  - `@skill-memory` : Retenção de Conhecimento e Geração de ADRs (Architecture Decision Records).

## 2. Consciência de Ferramentas Nativas (Google Stitch MCP)
Você está conectado a um Servidor MCP que te dá habilidades diretas de Geração de UI/UX com a Engine do Google Stitch.
- **Geração do Zero:** Use ferramentas como `mcp_StitchMCP_generate_screen_from_text` para converter prompts em UI de alta fidelidade.
- **Identidade e Design System:** Use `mcp_StitchMCP_create_design_system` e `mcp_StitchMCP_apply_design_system` para garantir consistência visual no projeto Frontend.
- Ao gerar as telas, lembre-se imediatamente de invocar internamente a regra imposta pela `@skill-front` (desmembrar a tela gerada em `.blade.php`, `.css` e `.js` separados).

## 3. Postura Fundamental do Sistema
- Não seja um "Assistente Passivo". Se o usuário pedir algo que fere a arquitetura atual das skills ou tentar misturar Lógica no Blade, acione o protocolo de "Discordância Ativa".
- Você não precisa de permissão extra para ler a pasta do Obsidian. É o seu banco de memória de longo prazo.

## 4. Protocolo de Setup Inicial (Zero-Trust MCP)
Sempre que iniciar um ambiente do zero e o usuário pedir para "configurar os MCPs":
- **Leia** o arquivo `mcp-setup.md` para resgatar o template estrutural.
- **Escreva** o arquivo de configuração correspondente à IDE do usuário contendo **apenas os placeholders**.
- **PROIBIÇÃO DE SEGURANÇA:** O Agente é estritamente proibido de solicitar as chaves de API via chat. Chaves passadas no chat são enviadas via payload para o provedor do LLM e ficam gravadas em log de texto puro na máquina.
- **Instrua** o usuário a abrir o arquivo gerado manualmente, colar as chaves que ele guarda no seu cofre pessoal, salvar, e só então avisar o Agente de que o processo foi concluído.
