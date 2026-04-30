---
tags:
  - skill/supabase
  - skill/database
  - skill/backend
---

# Skill: Supabase (Integração MCP e Gestão de Banco de Dados)

> **Objetivo:** Estabelecer as regras e capacidades do Agente para interagir diretamente com o banco de dados PostgreSQL hospedado no Supabase via Model Context Protocol (MCP), de forma integrada ao projeto Laravel (`SellerFlow` / `Base_api_for_render`).

## 1. Capacidades do Agente via MCP Supabase
O Agente possui uma conexão de baixo nível com o cluster do Supabase, permitindo realizar tarefas analíticas e operacionais sem precisar sair do editor:
- **Introspecção de Dados:** Uso da tool `mcp_supabase_execute_sql` para debugar registros problemáticos ou extrair relatórios.
- **Auditoria e Logs:** Uso da tool `mcp_supabase_get_logs` para verificar erros de PostgreSQL ou de API em tempo real.
- **Arquitetura de Branching:** Criação e troca de branches de banco de dados (`mcp_supabase_create_branch`) para testar features destrutivas sem afetar a produção.
- **Edge Functions:** Deploy automático de scripts severless Deno direto para o Supabase (`mcp_supabase_deploy_edge_function`).

## 2. Divisão de Responsabilidades (Laravel vs Supabase)
Sendo este um projeto **Laravel**, é fundamental respeitar o Framework como maestro da estrutura de dados:
- **DDL (Schema e Tabelas):** **NUNCA** modificar a estrutura das tabelas usando queries SQL manuais no MCP se o projeto estiver usando Laravel. Todas as mudanças de schema (`CREATE TABLE`, `ALTER TABLE`) DEVEM ser feitas via **Laravel Migrations**. O MCP servirá apenas como ferramenta de **leitura e validação** para confirmar se a migration funcionou na nuvem.
- **DML (Manipulação de Dados):** Operações normais no banco de dados devem ocorrer via Eloquent ORM. A execução direta de SQL via MCP fica restrita apenas para **diagnósticos, data fixes pontuais ou auditoria** durante a sessão de pareamento com o usuário.
- **RLS (Row Level Security):** O Laravel já atua como uma barreira de backend (Backend-as-a-Gateway). Políticas de RLS complexas no nível do Supabase só devem ser aplicadas se APIs ou integrações Front-end forem consumir diretamente a URL do Supabase ignorando o Laravel. Caso contrário, a validação de acesso (`Gates` e `Policies`) deve ocorrer no Laravel.

## 3. Diretrizes de Conexão com Clientes DB (DBeaver)
Sempre que for necessário auxiliar o usuário a configurar a conexão com o banco em softwares de terceiros (DBeaver, DataGrip):
1. O Host NUNCA deve ser a chave pública (`sb_publishable_...`). Esta chave é exclusiva para consumo de APIs via HTTP.
2. O Host deve ser extraído do Project URL (`mcp_supabase_get_project_url`), substituindo o domínio ou utilizando o **Pooler** da infraestrutura (ex: `db.[ID].supabase.co` ou `aws-0-...pooler.supabase.com`).
3. O nome do banco padrão no Supabase é sempre `postgres`, a menos que um banco extra tenha sido explicitamente criado na aba de SQL. O usuário é `postgres`.

## 4. Troubleshooting Diário
Ao reportar um erro como "Malformed UTF-8" ou erros 500 silenciosos que apontem para banco de dados fora do ar, o Agente deverá usar a `skill-supabase` como protocolo inicial: rodar uma query de ping (`SELECT 1;`) via MCP para descartar pane na infraestrutura da nuvem antes de tentar debugar o framework Laravel.
