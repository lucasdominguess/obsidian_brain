---
tags:
  - infra/roadmap
  - ai/brain
---

# Relatório de Análise e Proposta: O "Cérebro de IA" Definitivo (Obsidian Brain)

Analisei profundamente a estrutura atual do seu *Digital Garden* (`.brain/Skills`). A sua fundação é **excelente**. A separação por domínios (`skill-back`, `skill-front`, `skill-secur`, `skill-shopee`, `mcp-setup`) demonstra uma arquitetura madura que já permite que a IA atue como um engenheiro sênior contextualizado.

No entanto, com o objetivo de criar um **verdadeiro cérebro portátil** que você possa plugar em qualquer IDE do zero e ter uma equipe inteira de IAs trabalhando de forma autônoma e segura, identifiquei lacunas e pesquisei as ferramentas mais modernas do ecossistema de Agentes.

Abaixo, apresento meu diagnóstico e as sugestões estruturais para a evolução do nosso sistema.

---

## 1. O Que Falta na Estrutura Atual? (Novas Skills)

Para que a IA consiga operar a sua aplicação de ponta a ponta sem ficar "adivinhando" comandos ou padrões, sugiro a criação dos seguintes documentos:

### A. `skill-infra.md` (DevOps & Bootstrapping)
**Por que:** Atualmente, não há um documento que me diga como rodar o seu projeto localmente ou como funciona o deploy (sei que você usa Docker e Render por interações passadas, mas a IA "recém-nascida" não saberia disso).
**O que teria:**
- Comandos exatos para levantar o ambiente (`docker compose up`, `npm run dev`).
- Como funciona o pipeline do Render (se usa Dockerfile multi-stage, etc).
- Protocolo para `.env` (quais chaves o projeto exige para rodar).

### B. `skill-qa.md` (Engenharia de Qualidade e Testes)
**Por que:** A `skill-back` menciona PHPUnit/Pest, mas é vago. Agentes de IA são incríveis em TDD (Test-Driven Development), desde que tenham um padrão.
**O que teria:**
- Padrão de escrita: Pest PHP (para backend) ou Dusk/Cypress (para E2E).
- Regra de cobertura: "Para cada Service criado, exija a criação de um Unit Test".
- Instruções de como rodar os testes localmente para que a própria IA possa validar o código antes de entregar para você.

### C. `skill-memory.md` (ADRs - Architecture Decision Records)
**Por que:** Quando resolvemos bugs cabeludos (como o problema do PHP 8.3 com o `mb_convert_encoding` hoje mais cedo) ou tomamos decisões de arquitetura, isso se perde no histórico do chat.
**O que teria:**
- Uma regra instruindo a IA a criar um arquivo de Registro de Decisão na pasta `.brain/ADRs/` sempre que uma mudança arquitetural for feita. Assim, a IA do futuro saberá *por que* algo foi feito, lendo o registro.

---

## 2. Sugestões de Ferramentas (MCPs Essenciais para Agentes)

Para um setup "do zero" ser realmente poderoso, a IA precisa de braços fora do código fonte. Sugiro adicionarmos estes MCPs ao nosso `mcp-setup.md` no futuro:

1. **GitHub / Gitlab MCP:**
   - **Utilidade:** Permite que a IA crie branches, faça commits, abra Pull Requests (PRs), leia issues e faça Code Review diretamente do editor. Transforma o agente de um "assistente de código" num "colega de equipe".
   - **Segurança:** Requer Personal Access Token (PAT) restrito apenas aos repositórios necessários.

2. **Brave Search MCP (ou Exa / Tavily):**
   - **Utilidade:** Ferramentas de busca web integradas. Como o Laravel 11 e o PHP 8.3 são recentes, a IA às vezes pode alucinar ou usar funções velhas. Com um MCP de busca, a IA pode pesquisar a documentação oficial *em tempo real* antes de codar.

3. **Sentry MCP (ou similar de APM):**
   - **Utilidade:** Se você usa monitoramento de erros em produção, a IA pode monitorar o MCP e dizer: "Lucas, vi que o deploy que fizemos no Render gerou 3 novos erros no Sentry, já identifiquei a linha e criei a correção".

---

## 3. Segurança e Governança (SecOps)

A sua segurança já está bem coberta com a `skill-secur` e a nossa nova diretriz *Zero-Trust* do MCP. Porém, falta uma peça: **Gestão de Segredos no Código**.

**Sugestão de Alteração na `skill-secur`:**
- **Regra de Sanitização:** "Ao sugerir códigos, o Agente é estritamente proibido de inserir chaves de API mockadas (ex: `api_key = "sk_live_1234"`). Deve sempre forçar a arquitetura via `config('services.api.key')` ou `env()`."
- **Data Privacy:** Instruir o Agente a aplicar *Data Masking* (ofuscação) se tiver que manipular ou mostrar logs do Supabase que contenham dados de clientes reais do SellerFlow.

---

## 4. O "Modo Agência" (Fluxos Operacionais - SOPs)

Atualmente as skills são "Regras de Ouro", o que é ótimo. Mas para o Agente ser autônomo, ele precisa de **SOPs (Standard Operating Procedures)**. 
Sugiro criar uma pasta `.brain/Workflows/` com checklists. Exemplo:
- **`workflow-nova-feature.md`**:
  1. A IA lê a issue.
  2. Escreve os Testes (Pest) que inicialmente vão falhar.
  3. Cria a Migration (Laravel).
  4. Cria os DTOs e Services.
  5. Cria a UI com o Stitch (baseado no Figma/Texto).
  6. Roda os testes e corrige até passar.
  7. Pergunta ao usuário se pode realizar o commit.
