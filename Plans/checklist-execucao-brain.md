# Checklist de execução — Melhorias do Obsidian Brain

> Documento de acompanhamento da execução do plano `plan-analise-brain.md`.
> Marque `[x]` ao concluir. Os blocos PENDING têm instruções diretas para retomar a qualquer momento.

**Data de início:** 2026-05-20
**Última atualização:** 2026-05-20 (sessão 2)

---

## ✅ FEITO — Sessão 1

### Limpeza
- [x] `link-brain.bat` deletado do `BRAIN_ROOT` (legacy symlink, substituído por MCP + env var).

### Alta prioridade
- [x] **Template base `CLAUDE.md.template`** criado em `Docks/templates/CLAUDE.md.template`.
- [x] **`CLAUDE.md` no SellerFlow** criado em `C:\Users\lukas\git_projetos\Php\Laravel\SellerFlow\CLAUDE.md`.
- [x] **`skill-core.md` reescrito** como índice operacional (tabela de decisão, quando NÃO consultar, regra de emoji).

### Média prioridade
- [x] **`.claude/skills/` em SellerFlow** com 4 skills-ponte (`laravel-canonical-flow`, `security-review`, `pest-testing`, `frontend-blade`).

---

## ✅ FEITO — Sessão 2

### Segmentação de `Skills/`
- [x] Estrutura `Skills/dev/`, `Skills/ops/`, `Skills/business/` criada.
- [x] Arquivos movidos via `git mv` (histórico preservado):
  - **`dev/`** (8): skill-back, skill-front, skill-layers, skill-qa, skill-secur, skill-infra, skill-swagger-docs, skill-supabase.
  - **`ops/`** (5): skill-core, skill-memory, skill-mentor, skill-planner, mcp-setup.
  - **`business/`** (2): skill-shopee, skill-criacao-img-produto.
- [x] Todas as referências cruzadas atualizadas em: `Skills/ops/skill-core.md` (tabela), `Skills/dev/skill-back.md`, `Skills/ops/skill-planner.md`, `brain-bootstrap.md`, `setup-environment.md`, `Docks/templates/CLAUDE.md.template`, `SellerFlow/CLAUDE.md`, todas as 4 skills em `SellerFlow/.claude/skills/`.

### MCP server v1.1 (`mcp-server/index.js` reescrito)
- [x] **`read_section(filePath, headingName)`** — leitura cirúrgica por heading `##/###`, com closing baseado em level (não pega seções aninhadas indevidas). Aceita substring case-insensitive no nome do heading.
- [x] **Cache em memória com invalidação por `mtimeMs`** — `readFileCached()` evita re-ler do disco entre chamadas. Atualiza automaticamente após `git pull` (mtime muda).
- [x] **`brain_status` melhorado** — agora retorna inventário completo agrupado por pasta (substitui o que `list_skills` fazia).
- [x] **`list_skills` removido** — funcionalidade absorvida pelo `brain_status` (versão melhorada).
- [x] **`search_brain` estendido** — params opcionais: `regex` (boolean), `caseSensitive` (boolean), `maxPerFile` (number, default 3). Excerpt reduzido para 1 linha antes/depois (era 2/2).
- [x] Sintaxe validada com `node --check`.
- [x] Versão bumped: `1.0.0 → 1.1.0`.

### Templates MCP separados
- [x] `mcp-config/mcp.brain-only.template.json` criado — só o Brain, seguro para versionar.
- [x] `mcp-config/mcp.external.template.json` criado — externos (Stitch, Notion, Supabase, Postman) com aviso de segurança no topo.
- [x] `mcp-config/mcp.base.template.json` removido via `git rm`.
- [x] `Skills/ops/mcp-setup.md` seção 5 atualizada com a nova divisão.

### README reorganizado
- [x] Nova ordem:
  1. Arquitetura (resumo curto)
  2. Caminho mais simples — Claude Code CLI (4 passos)
  3. Outros agentes (tabela)
  4. Alternativa: plugin Cowork (movido para baixo)
  5. Confirmação obrigatória pós-setup
  6. Estrutura do conhecimento (refletindo subpastas `dev/ ops/ business/`)
  7. Regras para escrever novas skills
- [x] Refs ao `list_skills` removidas.
- [x] Lista de tools atualizada para v1.1.

### Atualizações de docs colaterais
- [x] `brain-bootstrap.md` — tools list atualizada, ref a `Skills/ops/mcp-setup.md`.
- [x] `setup-environment.md` — passos de validação refletem novas tools (`read_section` em vez de `list_skills`).
- [x] `plugin/obsidian-brain/README.md` — lista de tools expostas atualizada.

---

## ⚠️ AÇÃO MANUAL NECESSÁRIA

### Reempacotar plugin Cowork (se você usa Cowork)

A MCP `mcp-server/index.js` mudou (adicionou `read_section`, removeu `list_skills`). Segundo o próprio README, mudanças em tools **requerem reempacotar** o `.plugin`.

```powershell
cd <BRAIN_ROOT>\plugin\obsidian-brain
Compress-Archive -Path .\.claude-plugin, .\.mcp.json, .\README.md -DestinationPath ..\obsidian-brain.zip -Force
Rename-Item ..\obsidian-brain.zip ..\obsidian-brain.plugin -Force
```

Arraste o novo `.plugin` para o Cowork ou reinstale via UI. Reinicie o agente.

> Se você usa só Claude Code CLI direto (sem Cowork): basta reiniciar o agente. O `node index.js` será chamado fresco com as novas tools.

---

## ⏳ PENDING — você mesmo fará

### Replicar `CLAUDE.md` nos outros projetos

Conforme combinado, o usuário fará manualmente. Passos:

1. Para cada projeto ativo: copiar o bloco markdown interno de `Docks/templates/CLAUDE.md.template`.
2. Substituir placeholders `{{NOME}}`, `{{Stack}}`, etc.
3. Remover linhas da tabela "Quando consultar o Brain" que não se aplicam à stack.
4. Adicionar bloco "Notas específicas" com regras do projeto.
5. Commit no repo do projeto (não no Brain).
6. Opcional: copiar `.claude/skills/` de SellerFlow se compartilhar padrões (Laravel).

**Esforço:** ~10 min por projeto.

---

## 📋 NÃO FAZER (avaliado e descartado)

- Migrar para vector DB / RAG semântico — vault pequeno, overhead injustificado.
- Auto-gerar `CLAUDE.md` por script — cada projeto tem stack diferente, manual é mais flexível.
- Mover Brain para repo do SellerFlow — Brain é cross-projeto.

---

## 🔁 Validação final

Para validar que tudo está azeitado, abrir uma conversa nova em SellerFlow e fazer:

1. **Pergunta genérica de backend:** "como crio o endpoint de listar produtos?" — agente deve ler o `CLAUDE.md` automaticamente, citar `Skills/dev/skill-layers.md` ou usar `read_section`/`read_file`, e seguir o fluxo canônico sem precisar lembrar.
2. **Rename mecânico:** "renomeie a variável X para Y no arquivo Z" — agente NÃO deve chamar nenhum MCP do Brain.
3. **Review de Controller:** skill nativa `security-review.md` deve disparar e o agente deve aplicar discordância ativa + checks OWASP.
4. **Teste de Service:** skill nativa `pest-testing.md` deve disparar; agente deve perguntar "posso escrever o teste primeiro?".

Bonus — testar tools novas:
5. `read_section Skills/dev/skill-layers.md "Antipadrões"` — deve retornar só a seção, não o arquivo inteiro.
6. `search_brain "Repository" caseSensitive=true` — deve filtrar matches exatos de `Repository` ignorando `repository`/`REPOSITORY`.

Se 6/6 funcionarem, setup está 100% azeitado.
