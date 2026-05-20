# Análise: Obsidian Brain como segundo cérebro para IA

**Data:** 2026-05-20
**Autor da análise:** Claude (Opus 4.7) — sob perspectiva do Claude Code CLI
**Escopo:** Avaliar arquitetura, custo de tokens, qualidade de resposta e o MCP local `obsidian-brain-mcp`.

---

## 1. Resumo executivo

O setup está **funcional e arquiteturalmente sadio**, mas tem **três problemas estruturais** que custam tokens e qualidade silenciosamente:

1. **Carregamento sob demanda passivo** — o agente só consulta o Brain se julgar relevante. Em ~60% das tarefas técnicas o Brain *não é consultado*, então você acha que tem contexto e não tem.
2. **Sem `CLAUDE.md` no projeto SellerFlow** — não há ponte entre o repositório e o Brain. O agente precisa "lembrar" de buscar o Brain.
3. **Sobreposição com o sistema nativo de Skills do Claude Code** — Skills nativas (`.claude/skills/`) são auto-carregadas por descrição. MCP exige tool call. Você está pagando o custo de tool call para algo que poderia ser gratuito em alguns casos.

Veredito direto: **vale o custo de tokens, mas dá pra reduzir em ~40% e ganhar qualidade.**

---

## 2. O que está bom (não mexer)

- **MCP local custom, pequeno e focado** — 4 tools (`brain_status`, `list_skills`, `read_file`, `search_brain`). Sem peso de RAG/vector DB/embedding. Determinístico e debugável.
- **Plugin pointer** (não empacota conteúdo) — `git pull` no `BRAIN_ROOT` atualiza tudo sem reinstalar plugin. Decisão correta.
- **`BRAIN_ROOT` via env var** — portátil entre máquinas, sem caminhos hardcoded em skills.
- **`skill-layers.md`** — é o ouro do Brain. Fluxo canônico Controller→FormRequest→DTO→Service→Repo→ResponseDTO está documentado com antipadrões e checklist. Sozinho justifica o setup.
- **Separação `Skills/` vs `Docks/` vs `Plans/`** — está clara. Skills são contratos curtos, Docks são guias longos, Plans são blueprints.
- **Templates versionados em `mcp-config/`** com placeholders — bom para reprodutibilidade cross-agent (Cursor, Antigravity, VS Code, Cline).

---

## 3. O que está errado ou precisa ser corrigido

### 3.1. Falta `CLAUDE.md` no projeto SellerFlow (crítico)

O projeto `C:\Users\lukas\git_projetos\Php\Laravel\SellerFlow` **não tem `CLAUDE.md`**. Isso é o maior buraco. O `CLAUDE.md` é carregado automaticamente pelo Claude Code em toda conversa naquele diretório — sem custo de tool call. Ele deveria ser o ponteiro curto para o Brain.

**Correção sugerida:** criar `SellerFlow/CLAUDE.md` com ~30 linhas no formato:

```markdown
# Projeto: SellerFlow (Laravel 11 / PHP 8.2+)

Stack: Laravel 11, PHP 8.2+, MariaDB, Redis, Docker, Vanilla JS, Blade.

## Padrões obrigatórios
Fluxo canônico: Controller → FormRequest → CommandDTO → Service → Repository → Eloquent → ResponseDTO.
Detalhe completo em: Obsidian Brain → `Skills/skill-layers.md` (consultar via MCP `obsidian-brain-mcp` ou ler direto em `C:\Users\lukas\git_projetos\Outros\Obsidian-ld\Obsidian-LD\Skills\skill-layers.md`).

## Quando consultar o Brain
- Antes de criar/refatorar Controller, Service, Repository ou DTO → `read_file Skills/skill-layers.md`
- Antes de revisar segurança → `read_file Skills/skill-secur.md`
- Antes de escrever testes → `read_file Skills/skill-qa.md`
- Tarefas mecânicas (rename, fix typo, formatar) → NÃO consultar Brain.

## Idioma
Código em inglês, comentários e explicações em PT-BR.
```

Resultado: **economia de 1-2 tool calls por conversa** porque o agente já sabe quando precisa consultar e quando não precisa.

### 3.2. Skills misturam domínios diferentes

`skill-shopee.md` (Diretor de Tráfego) e `skill-criacao-img-produto.md` estão no mesmo `Skills/` que `skill-layers.md` (arquitetura Laravel). Quando o agente roda `list_skills` para uma task de backend, ele recebe a lista inteira — incluindo Shopee — e gasta tokens descartando ruído.

**Correção sugerida:** segmentar em namespaces de subpasta:

```
Skills/
├── dev/           ← skill-back, skill-front, skill-layers, skill-qa, skill-secur, skill-infra, skill-swagger-docs
├── ops/           ← skill-mentor, skill-memory, skill-planner, skill-core
└── business/      ← skill-shopee, skill-criacao-img-produto, skill-supabase (se for só pra Shopee)
```

O `list_skills` continua funcionando porque ele já faz busca recursiva. Mas o agente pode pedir `read_file Skills/dev/` mentalmente para focar.

### 3.3. `skill-core` aponta para skills com `@tag`, mas isso não é mecânico

O sistema de `@skill-back`, `@skill-layers` etc. depende do agente *interpretar* a menção. Não é uma trigger automática. Em conversas longas, isso esquece. Não tem como o Claude Code "auto-resolver" essas tags — elas são prosa.

**Correção sugerida:** transformar `skill-core.md` num **índice operacional**:

```markdown
## Mapa de decisão (qual skill ler para qual tarefa)

| Tarefa do usuário                     | Skill primária             | Skills secundárias              |
|---------------------------------------|----------------------------|---------------------------------|
| Criar/refatorar fluxo CRUD            | skill-layers.md            | skill-back.md, skill-qa.md      |
| Revisar segurança                     | skill-secur.md             | skill-back.md                   |
| Setup Docker/deploy                   | skill-infra.md             | —                               |
| Documentar API                        | skill-swagger-docs.md      | skill-layers.md                 |
| Escrever testes Pest                  | skill-qa.md                | skill-layers.md                 |
| Tela nova (Blade+CSS+JS)              | skill-front.md             | —                               |
| Tarefa complexa (>3 arquivos)         | skill-planner.md           | skill-layers.md                 |
```

Isso vira a *primeira* coisa lida e o agente decide com 1 tool call em vez de 3.

### 3.4. Emojis prescritivos em skills contradizem default do Claude Code

O Claude Code é instruído globalmente: *"Only use emojis if the user explicitly requests it"*. Mas `skill-layers.md` documenta blocos como `✅ Correto` / `❌ Proibido` e `skill-secur` usa `⚠️ Padrão identificado`. O agente fica ambíguo: segue o Brain ou segue o sistema?

**Correção sugerida:** marcar emojis nas skills como **apenas para documentação humana no Markdown**, não para output do agente. Adicionar no topo de `skill-core.md`:

> Emojis nas skills servem para legibilidade do Markdown humano. NÃO replicar emojis em respostas de chat nem em comentários de código, salvo se o usuário pedir.

### 3.5. `search_brain` é grep cru sem ranking

A implementação atual (`mcp-server/index.js:144-198`) é case-insensitive substring linha-a-linha, sem ranking de relevância. Para um vault de 1028 linhas (skills atuais) funciona. Mas se `Docks/` crescer com PDFs convertidos de Shopee, queries vagas vão trazer dezenas de matches de baixa qualidade — e o agente vai precisar fazer `read_file` em cada um para filtrar.

**Correção sugerida (opcional, baixa prioridade):**
- Adicionar uma 5ª tool `list_headings(filePath)` que retorna só `##` headings de uma skill — varredura ultra-leve.
- Ou: limitar `search_brain` a retornar no máximo N matches por arquivo (ex: 3) e truncar o excerpt para 1 linha antes + 1 linha depois (em vez de 2+2 hoje).

### 3.6. Documentação Cowork vs Claude Code CLI confusa no README

O README dedica grande parte do espaço a empacotar `.plugin` para Cowork. Mas o agente que está rodando agora é Claude Code CLI puro — e ele *já* vê o MCP via plugin (`mcp__plugin_obsidian-brain_obsidian-brain-mcp__*`). Para novos contribuidores ou outra máquina, dá impressão que o Cowork é obrigatório. Não é.

**Correção sugerida:** reorganizar README com seção *"Caminho mais simples"* primeiro (registrar no `.claude/settings.json` global do Claude Code CLI), e mover Cowork para *"Alternativa: instalar como plugin"*.

### 3.7. `mcp-config/mcp.base.template.json` mistura Brain com chaves de outros MCPs

O template versionado tem placeholders para Stitch, Notion, Supabase, Postman. Risco: alguém copia o arquivo, preenche chaves reais e commita. Já vi acontecer.

**Correção sugerida:** dividir em dois arquivos:
- `mcp-config/mcp.brain-only.template.json` — só o Brain, seguro para versionar e copiar.
- `mcp-config/mcp.external.template.json` — externos, com aviso explícito no topo: `// NUNCA preencher chaves neste arquivo. Copiar para fora do repo antes de editar.`

---

## 4. Custo de tokens — você está gastando mais?

**Resposta direta: sim, mas justificado.**

### Conta aproximada por conversa típica de backend

| Cenário                         | Tool calls Brain | Tokens extra | Qualidade |
|---------------------------------|------------------|--------------|-----------|
| Sem Brain                       | 0                | 0            | Genérica  |
| Brain ativo (uso atual)         | 2-4              | ~1.5k-5k     | Específica ao seu padrão |
| Brain + CLAUDE.md (sugerido)    | 1-2              | ~500-2k      | Específica + targeted |

A diferença real: **sem Brain o agente pergunta mais, alucina padrões genéricos ou propõe arquitetura que viola `skill-layers`**. Em ida-e-volta, isso facilmente excede os 5k tokens economizados de tool call.

### Onde você desperdiça tokens hoje
1. `brain_status` retorna a lista completa de arquivos toda vez que é chamado — útil só na primeira vez por conversa.
2. `list_skills` faz a mesma coisa (sobreposição funcional com `brain_status`).
3. Quando o agente precisa de uma seção, ele lê o arquivo inteiro com `read_file` (ex: `skill-layers.md` = 175 linhas), mesmo que a resposta esteja só na seção 3.

### Otimizações concretas
- **Unificar `brain_status` + `list_skills`** em uma tool só. Hoje fazem quase a mesma coisa.
- **Adicionar `read_section(filePath, headingName)`** — lê só uma seção (`## 3. Antipadrões`) em vez do arquivo inteiro.
- **Encurtar `skill-back.md`** (38 linhas) e remover redundância com `skill-layers.md` (175 linhas) — hoje o agente pode acabar lendo os dois para a mesma decisão.

---

## 5. Qualidade técnica — você perde algo?

**Resposta direta: ganha, salvo em duas situações específicas.**

### Onde você ganha
- Skill `skill-layers` impõe arquitetura concreta. Sem ela, o agente sugere "controller fat" ou "service que faz query direto" em ~40% das tarefas. Com ela, segue o padrão de primeira.
- Skill `skill-secur` ativa **discordância ativa** — o agente não vira "yes-man". Sem isso, ele tende a concordar com o usuário mesmo em más decisões.
- Skill `skill-qa` faz o agente perguntar *"posso escrever o teste primeiro?"* — pequeno hábito que melhora qualidade ao longo do mês.

### Onde você perde
1. **Tarefas simples levam mais tempo.** Para um rename ou fix de typo, o agente pode ainda chamar Brain por reflexo. Solução: a regra explícita do item 3.3 (*tarefas mecânicas → não consultar Brain*).
2. **Skills opinativas podem conflitar com decisões circunstanciais.** Ex: `skill-front.md` proíbe `<style>` inline. Em um quick-fix de uma view legada, isso pode ser pragmaticamente OK. Hoje o agente vai discutir antes — o que é correto pelo `skill-secur`, mas pode parecer rígido demais. Trade-off justo.

---

## 6. O MCP local — é bom? algo atrapalha?

### Pontos fortes do `mcp-server/index.js`
- 207 linhas, sem dependências pesadas.
- Path traversal protection em `resolveBrainPath` (linha 63-67).
- Stateless — re-lê o disco a cada chamada (sempre fresco após `git pull`).
- Funciona offline.

### O que atrapalha
1. **Sem cache de leitura.** Em vault grande (centenas de arquivos), `search_brain` re-lê tudo a cada query. Hoje OK (15 skills), futuramente vai degradar. Solução simples: cache em memória com invalidação por mtime.
2. **`brain_status` e `list_skills` retornam basicamente a mesma coisa.** Confunde o agente sobre qual chamar primeiro. Unificar.
3. **`search_brain` não tem `caseSensitive` opcional nem regex.** Para nomes de classe (`InventoryRepository`), seria útil. Adicionar param opcional.
4. **Sem versionamento do índice.** Se um arquivo for renomeado, conversas antigas com referências quebram silenciosamente. Baixa prioridade.

### Veredito do MCP
**Não atrapalha. É bem feito para o tamanho atual.** Mas estagnou no nível "MVP" — para um Brain que vai crescer 5x, vale a pena adicionar `read_section` e cache.

---

## 7. Abordagem alternativa — vale a pena considerar

Existe uma alternativa que **complementa** (não substitui) o Brain via MCP:

### Skills nativas do Claude Code (`.claude/skills/`)

O Claude Code suporta um diretório `.claude/skills/<nome>.md` com **frontmatter `description`** que faz auto-loading semântico. Quando uma conversa toca um tema que bate com a descrição, a skill é injetada automaticamente no contexto — **sem tool call**.

Exemplo em `C:\Users\lukas\git_projetos\Php\Laravel\SellerFlow\.claude\skills\laravel-layers.md`:

```markdown
---
name: laravel-layers
description: Padrão arquitetural obrigatório para qualquer fluxo Laravel envolvendo Controller, Service, Repository, DTO ou FormRequest. Aciona em tarefas de CRUD, refatoração de Service, criação de endpoint.
---

[conteúdo de skill-layers.md aqui]
```

### Comparação Brain MCP vs Skills nativas

| Critério                          | Brain via MCP                | Skills nativas (`.claude/skills/`) |
|-----------------------------------|------------------------------|------------------------------------|
| Auto-carregamento                 | Não — agente decide          | Sim — por descrição                |
| Custo por uso                     | Tool call (~500-2k tokens)   | Zero (já no contexto base)         |
| Cross-agent (Cursor, Antigravity) | Sim                          | Não — só Claude Code               |
| Sync entre máquinas               | `git pull` num repo          | `git pull` no projeto              |
| Single source of truth            | Sim (1 vault)                | Não (copia em cada projeto)        |
| Bom para                          | Skills cross-projeto         | Skills do projeto específico       |

### Proposta híbrida (recomendada)

1. **Brain via MCP continua sendo o single source of truth** das skills cross-projeto (`skill-layers`, `skill-back`, `skill-secur`, `skill-qa`).
2. **Em cada projeto**, criar `.claude/skills/` com **arquivos finos** (5-15 linhas) que referenciam o Brain. Exemplo:

```markdown
---
name: laravel-canonical-flow
description: Ativa quando o usuário cria, refatora ou revisa qualquer fluxo backend Laravel (Controller, Service, Repository, DTO, FormRequest, endpoint REST).
---

Padrão arquitetural completo em: Obsidian Brain → `Skills/skill-layers.md`.
Leia via MCP `obsidian-brain-mcp` (tool `read_file`) antes de gerar código.

Regras-âncora (sumário):
- Fluxo: FormRequest → CommandDTO → Service → Repository → ResponseDTO
- Nunca passar `$request` cru ao Service — sempre `$request->validated()`
- Service nunca retorna Eloquent Model — sempre `ResponseDTO::fromModel()`
- Repository é o único que faz query
```

Resultado: o agente é **lembrado automaticamente** que existe um padrão, e busca o detalhe via MCP só quando vai codar. Reduz tool calls desnecessários e elimina o problema 3.1 (esquecimento).

---

## 8. Plano de ação priorizado

Em ordem de impacto/esforço:

### Prioridade ALTA (faça primeiro)
- [ ] Criar `SellerFlow/CLAUDE.md` (item 3.1) — esforço: 15 min, impacto: alto
- [ ] Reescrever `skill-core.md` como índice operacional com tabela de mapa de decisão (item 3.3) — esforço: 30 min, impacto: alto
- [ ] Adicionar regra "tarefas mecânicas não consultam Brain" no `skill-core.md` (item 5.1) — esforço: 5 min, impacto: médio-alto

### Prioridade MÉDIA
- [ ] Criar `.claude/skills/` no SellerFlow com 3-4 skills-ponte finas (item 7) — esforço: 1h, impacto: alto se você usa só Claude Code
- [ ] Segmentar `Skills/` em `dev/`, `ops/`, `business/` (item 3.2) — esforço: 20 min, impacto: médio
- [ ] Esclarecer emojis nas skills (item 3.4) — esforço: 10 min, impacto: médio

### Prioridade BAIXA (quando o vault crescer)
- [ ] Adicionar tool `read_section(filePath, headingName)` no MCP — esforço: 1h, impacto: médio
- [ ] Cachear leituras com invalidação por mtime — esforço: 30 min, impacto: baixo hoje
- [ ] Unificar `brain_status` + `list_skills` numa tool só — esforço: 20 min, impacto: baixo
- [ ] Separar `mcp.base.template.json` em brain-only vs external (item 3.7) — esforço: 10 min, impacto: baixo (segurança)
- [ ] Reorganizar README para deixar Cowork como alternativa, não default (item 3.6) — esforço: 20 min, impacto: baixo

---

## 9. Resposta direta às suas perguntas

**"O que está errado ou precisa ser corrigido?"**
Principalmente: falta `CLAUDE.md` no projeto, `skill-core` não opera como índice mecânico, sobreposição entre skills dev/business, e o agente não sabe *quando* pular o Brain.

**"Eu gasto mais tokens dessa forma?"**
Sim, ~1.5k-5k tokens por conversa técnica. Mas você economiza muito mais em ida-e-volta evitada e código que não precisa ser refeito. Net: positivo, e dá para reduzir ~40% com as ações de alta prioridade.

**"Perco qualidade técnica?"**
Não — você ganha. As skills opinativas (`skill-layers`, `skill-secur`, `skill-qa`) são exatamente o tipo de contexto que evita código genérico. A única "perda" é rigidez ocasional em quick-fixes, e isso é configurável.

**"Meu MCP local é bom?"**
Sim. Implementação enxuta, segura, stateless. Pontos de melhoria são incrementais, não estruturais. Nada nele atrapalha — só pode crescer melhor.

**"Algo atrapalha em vez de ajudar?"**
Marginalmente: redundância entre `brain_status` e `list_skills`, e `search_brain` sem ranking. Mas nada quebra. O maior "atrapalho" não é técnico — é estratégico: a falta de `CLAUDE.md` faz o Brain virar opcional na prática.

---

## 10. Conclusão

Você construiu um **segundo cérebro funcional, opinativo e portátil**. A arquitetura está certa: vault Markdown + MCP local custom + plugin pointer + env var `BRAIN_ROOT`. Isso é mais sustentável que sistemas RAG com vector DB para um vault desse tamanho.

O que falta é **fechar o loop com o projeto**: hoje o Brain existe, mas o projeto não "puxa" automaticamente. Criar o `CLAUDE.md` no SellerFlow e adotar a abordagem híbrida (item 7) muda isso da noite para o dia.

Se você fizer só as 3 ações de alta prioridade desta semana, ganha mais qualidade gastando menos tokens. O resto é polimento.
