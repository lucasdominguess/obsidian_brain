---
tags: [sellerflow, frontend, vue, telas, checklist, roadmap]
status: em-construcao
criado: 2026-08-05
atualizado: 2026-08-05
---

# SellerFlow Front — Telas: Checklist & Roadmap

> **Painel de controle** do desenvolvimento das telas do front. Toda sessão de trabalho **começa e termina aqui**: olhar o [checklist](#3-checklist-mestre), pegar a próxima tela marcada `🔜`, seguir o [fluxo de 3 passos](#6-fluxo-de-trabalho-por-tela), e no fim atualizar o [Log de progresso](#8-log-de-progresso--onde-parei).
>
> Relacionados: [[sellerflow-front]] (arquitetura do front) · [[SellerFlow-API]] (API pronta) · [[00 - SellerFlow - Visão Geral]] (regras de negócio).

---

## 0. Caminhos de referência (fixos)

Para a IA saber **exatamente** onde procurar em qualquer sessão:

| O quê | Caminho |
|---|---|
| **Front (repo)** | `C:\Users\lukas\git_projetos\Javascript\sellerflow-front` |
| **Backend API (repo)** | `C:\Users\lukas\git_projetos\Php\Laravel\SellerFlow` |
| Rotas da API (fonte da verdade) | `routes/api.php` (backend) · ou `php artisan route:list` |
| Contratos/campos (Swagger annotations) | `app/Docs/Swagger/<dominio>/*.php` (backend) |
| Swagger UI (rodando) | `http://localhost:8000/api/documentation` (l5-swagger) |
| Envelope de resposta / padrões | `App\Support\ApiResponse` (backend) — ver §9 de [[SellerFlow-API]] |
| **Imagens do Claude Design** (novas) | `docs/design-preferencias/<slug>/` (front) |
| Telas de referência antigas (Stitch) | `docs/design-reference/<slug>/` (front) |
| Design system (tokens) | `docs/design-reference/tradeflow/DESIGN.md` (front) |
| Base da API (axios) | `VITE_API_URL = http://localhost:8000/api/v1` |

> ⚠️ **Regra:** o front está em **mock-first**. Nenhuma tela liga na API ainda (login inclusive é mock). Cada tela cria `src/mocks/*.ts` + `src/composables/useX.ts`; a integração com a API é uma **fase posterior** (ver §7 fichas com o endpoint real já mapeado para essa hora).

---

## 1. Estado atual — o que JÁ existe

| Módulo | Tela | Rota | Status |
|---|---|---|---|
| Operação | Dashboard | `/home` | ✅ pronto (mock) |
| Operação | Nova Compra | `/compras/nova` | ✅ pronto (mock) |
| Operação | Nova Venda | `/vendas/nova` | ✅ pronto (mock) |
| Estoque | Saldo de Estoque | `/estoque/saldo` | ✅ pronto (mock) |
| Financeiro | Fluxo de Caixa | `/financeiro/fluxo-de-caixa` | ✅ pronto (mock) |
| Auth | Login | `/` | ✅ pronto (mock, dark/light 100%) |

**Fundação já implementada:** shell (sidebar seccionada + topbar), tema dark/light (`useTheme`), **motor de troca de cor primária em runtime** (`useSettings` — falta só a UI/color-picker), tokens em CSS variables, componentes base em `src/components/UI/`. Ver [[theming-runtime-requirements]].

---

## 2. Convenções do front (o "molde" de cada tela)

**Stack:** Vue 3 + TS · Vite 6 · PrimeVue 4 (Aura) · TailwindCSS 3 · Pinia · Vue Router 4 · Axios · Moment. Alias `@` → `src/`.

**Toda tela nova = 3 arquivos + 2 ativações:**
1. `src/views/<Nome>View.vue` — a tela.
2. `src/mocks/<slug>.ts` — dados falsos + metadados (labels de status, etc.).
3. `src/composables/use<Pascal>.ts` — expõe os dados/mocks pra view.
4. Registrar a **rota** em `src/router/index.ts` (`meta.requiresAuth: true`).
5. Ativar o `to:` do item no `src/components/Layout/AppSidebar.vue` (hoje é placeholder "Em breve").

**Componentes base reutilizáveis (`src/components/UI/`):**
- `PageHeader.vue` — título + subtítulo + slot `#actions`.
- `AppDataTable.vue` — tabela genérica `<T>`; colunas via `Column[]` (`tableTypes.ts`); slots `#cell-<key>` e `#header-<key>`; prop `rowClass`.
- `StatusBadge.vue` — pill de status (`variant`: type `BadgeVariant`; `shape="tag"`).
- `StatCard.vue` / `AppCard.vue` — cartões.
- `FormCard.vue` (card com ícone+título) e `FormField.vue` (label+slot) — para formulários.
- Helpers: `formatBRL` / `parseBRLNumber` em `src/utils/index.ts`.

**Design tokens (Tailwind kebab, já configurados):** `bg-surface`, `bg-surface-container-{low,high,highest}`, `text-on-surface`, `text-on-surface-variant`, `text-primary`, `text-secondary` (rosa/financeiro), `text-tertiary`/`text-success` (verde/entrada), `text-warning` (âmbar), `text-error`, `border-outline-variant`. Fonte **Inter**. Ícones **PrimeIcons** (`pi-*`). Escala tipográfica: `text-display-lg`, `text-headline-md`, `text-title-md`, `text-body-sm`, `text-label-xs`. Tokens são **CSS variables** → dark/light alterna sozinho (validar por tela no preview).

**Dois arquétipos de tela (use como espelho):**
- 📋 **Listagem** → espelho: `src/views/EstoqueSaldoView.vue` (KPIs + barra de filtros com busca client-side + `AppDataTable` + paginação + `StatusBadge`).
- 📝 **Formulário** → espelho: `src/views/NovaCompraView.vue` / `NovaVendaView.vue` (itens editáveis add/remove, totais reativos, `FormCard`/`FormField`).

**Dev/preview:** porta fixa **5199** (`--strictPort`) em `.claude/launch.json`. `npm run type-check` (vue-tsc) tem que passar antes de dar por pronto.

---

## 3. Checklist mestre

Legenda: ✅ feito · 🔜 próxima · 🟢 pronta p/ construir (API ok) · 🟡 parcial (limitação de API) · 🔴 bloqueada (precisa backend) · ⬜ a fazer

### Módulo Operação
- [x] ✅ Dashboard
- [x] ✅ Compras (Nova Compra)
- [x] ✅ Vendas (Nova Venda)
- [ ] ⬜ Compras — **Listagem** de compras (`GET /purchases`) *(não pedida ainda; existe só o form)*
- [ ] ⬜ Vendas — **Listagem** de vendas (`GET /sales`) *(idem)*

### Módulo Estoque
- [x] ✅ Saldo de Estoque
- [x] ✅ **Ajustes de Estoque** (front mock) — `EstoqueAjustesView` + drawer de novo ajuste → [ficha](#ficha-ajustes-de-estoque)
- [x] ✅ **Movimentações** (front mock — dados mock; API real pendente do DTO) — `EstoqueMovimentacoesView` → [ficha](#ficha-movimentações-bloqueada)

### Módulo Financeiro
- [x] ✅ Fluxo de Caixa
- [x] ✅ **Contas a Pagar** (front mock) — `ContasPagarView` + drawer criar/editar → [ficha](#ficha-contas-a-pagar)
- [x] ✅ **Contas a Receber** (front mock) — `ContasReceberView` + drawer criar/editar → [ficha](#ficha-contas-a-receber)

### Módulo Cadastros
- [x] ✅ **Fornecedores** (front mock) — `FornecedoresView` + drawer criar/editar → [ficha](#ficha-fornecedores)
- [x] ✅ **Produtos** (front mock) — `ProdutosView` + drawer com upload de imagens → [ficha](#ficha-produtos)
- [x] ✅ **Categorias** (front mock, read-only) — `CategoriasView` (componente `CadastroReadOnly`) → [ficha](#ficha-categorias--formas--marketplaces)
- [x] ✅ **Formas de Pagamento** (front mock, read-only) — `FormasPagamentoView` → [ficha](#ficha-categorias--formas--marketplaces)
- [x] ✅ **Marketplaces** (front mock, read-only) — `MarketplacesView` → [ficha](#ficha-categorias--formas--marketplaces)

### Módulo Sistema
- [x] ✅ **Usuários** (front mock) — `UsuariosView` + drawer com senha/confirmação → [ficha](#ficha-usuários)
- [x] ✅ **Perfil** (front mock, edição limitada) — `PerfilView` (dados + segurança) → [ficha](#ficha-perfil-parcial)
- [x] ✅ **Configurações** (front mock) — `ConfiguracoesView`; **color-picker liga no `useSettings` (troca de primária em runtime, verificado)** → [ficha](#ficha-configurações)

### Transversal (não são "telas", mas pendências de UI)
- [x] ✅ Sidebar **responsiva** (2026-08-05) — hambúrguer no `AppHeader` (mobile) abre a `AppSidebar` como drawer sobreposto com backdrop; fecha ao navegar/tocar no backdrop. Estado em `composables/useSidebar.ts`. Desktop inalterado. Verificado a 375px e 1280px.
- [ ] ⬜ Validar **light mode** em todas as telas do shell (memória diz que a fundação suporta; confirmar no preview).
- [ ] ⬜ Integração real com a **API** (trocar mocks por `services/endpoints.ts` + axios) — fase própria, depois das telas.

---

## 4. Restrições da API — LER antes de planejar

Descobertas na análise do backend (2026-08-05). Estas mudam o escopo do seu plano original:

1. **Categorias / Formas de Pagamento / Marketplaces não têm CRUD.** Existem apenas no endpoint público `GET /list?params=...` (retorna `[{id, name}]`). Não há `POST/PUT/DELETE`. Além disso, `market_places` tem `taxa_percentual`/`taxa_fixa` no banco, mas o `/list` **não os retorna**.
   → **Decisão pendente:** (a) fazer telas **read-only** (só listar) agora; **ou** (b) pedir ao backend para criar os CRUDs (`make:crud`) e fazer telas completas depois. **Recomendação:** (a) read-only agora se você só quer visualizar; (b) se realmente quer gerenciar. Para o MVP, listar já resolve — marcadas 🟡.
2. **"Categorias" ≠ categoria de produto.** Não existe tabela de categoria de produto (lacuna conhecida — ver §5 de [[00 - SellerFlow - Visão Geral]]). O que existe é `financial_categories` (aluguel, embalagem, taxa…). A tela "Categorias" hoje só pode ser as **financeiras**.
3. **`GET /stock` (Movimentações) retorna objeto vazio** — o `StockResponseDTO` não expõe campos. Tela de ledger bloqueada até o backend definir o contrato do DTO. As consultas úteis de estoque hoje são `stock-check-quantity` (já usada no Saldo) e `stock-investment` (FIFO).
4. **"Perfil" não tem endpoint próprio.** `POST /auth/login` devolve só `{token, name, email}` — **sem `id`**. Não há `GET /auth/me`. Editar o próprio usuário (`PUT /user/{id}`) exige o id → bloqueado sem backend. **Recomendação:** pedir ao backend um `GET /auth/me` (ou incluir `id` no login); enquanto isso, Perfil só exibe `name`/`email` do store (read-only).
5. **Produtos usa `multipart/form-data`** (upload de até 10 imagens, 2MB cada). No `PUT`, o Laravel exige method spoofing (`POST` com `_method=PUT`) para enviar arquivos.
6. **`company_id`, `store_id`, `user_id` vêm do token** — o front nunca envia esses campos em create; são derivados no backend.
7. **Envelope de resposta:** `{ success, message, data }`; paginado inclui `meta {current_page, last_page, per_page, total, from, to}`; erro de validação em `errors{}` (o `services/toast.ts` já trata). Status enum unificado: `pendente | concluido | atrasado | cancelado`.

---

## 5. Ordem recomendada de construção

Prioriza telas **desbloqueadas** (API pronta) e que **reaproveitam** componentes; deixa por último o que depende de backend.

1. **Configurações** (color-picker) — quick win, puro front, fecha o requisito de troca de primária em runtime ([[theming-runtime-requirements]]). *Layout novo → vale imagem do Claude Design.*
2. **Contas a Pagar** — estabelece o padrão CRUD financeiro (list + form). *Template de listagem.*
3. **Contas a Receber** — espelho de #2. *Rápida depois da #2.*
4. **Fornecedores** — CRUD mais simples; é **FK de Produtos** (select). *Template.*
5. **Produtos** — a mais rica (CRUD + galeria/upload de imagens); depende de Fornecedores no select. *Layout novo → vale imagem.*
6. **Ajustes de Estoque** — list + form "novo ajuste" (`itens[]`); usa select de produtos (`/list?params=produto`).
7. **Usuários** — CRUD + senha/confirmação.
8. **Perfil** — *após* backend expor `/auth/me` (ou id no login). Enquanto isso, read-only.
9. **Categorias / Formas de Pagamento / Marketplaces** — ⏸️ **ADIADAS** (decisão 2026-08-05). Ficam por último; só entram se/quando o backend criar os CRUDs.
10. **Movimentações** — *após* backend expor o `StockResponseDTO`.

> `🔜 PRÓXIMA:` **Configurações** (recomendada; ou Contas a Pagar, se preferir começar por dados). Nenhuma construção iniciada ainda — decisão 2026-08-05 foi deixar só a documentação pronta. Atualize esta marca ao começar/concluir cada tela.

---

## 6. Fluxo de trabalho por tela

### Passo 1 — (opcional) Gerar o layout no Claude Design
Só quando o layout é **novo** (não segue os templates). Para CRUD que espelha `EstoqueSaldoView`/`NovaCompraView`, **pule** — o spec da ficha + "espelhe o template" bastam.
- **Vale imagem:** Configurações, Produtos, Perfil.
- **Dispensa imagem:** Contas a Pagar/Receber, Fornecedores, Ajustes, Usuários, Categorias/Formas/Marketplaces.
- Salve o PNG em `docs/design-preferencias/<slug>/screen.png` (e o `code.html` se houver).
- Prompt para gerar → **[Template A](#template-a--prompt-para-o-claude-design)**.

### Passo 2 — Construir com o Claude Code
- Prompt → **[Template B](#template-b--prompt-para-o-claude-code)**. Se gerou imagem no Passo 1, anexe-a junto do prompt.

### Passo 3 — Fechar
- `npm run type-check` passa; verifica no preview (5199) em **dark e light**.
- Marca a tela como ✅ no [checklist](#3-checklist-mestre), move o `🔜 PRÓXIMA`, e adiciona uma linha no [Log](#8-log-de-progresso--onde-parei).

---

### Template A — Prompt para o Claude Design

```
Gere o layout da tela **{{NOME_DA_TELA}}** do SellerFlow (ERP enxuto para seller de
marketplace, foco Shopee). Entregue como imagem (PNG) de alta fidelidade.

DESIGN SYSTEM (obrigatório — "TradeFlow"):
- Dark-mode-first, corporate/moderno, ALTA densidade de dados. Fonte Inter. Idioma PT-BR.
- Paleta: fundo #051424; surfaces #0d1c2d / #122131 / #1c2b3c / #273647;
  primary (indigo) #8083ff e #c0c1ff; secundária (financeiro/saída, rosa) #ffb0cd;
  sucesso (entrada, verde) #4edea3; erro #ffb4ab; texto #d4e4fa e #c7c4d7; bordas #464554.
- Cards com raio 8px e borda 1px; inputs/botões 6px; badges de status em pill.
  Ícones outline. Cor usada só para status/semântica.
- Layout: sidebar fixa 240px à esquerda + topbar; conteúdo com largura máx 1600px.

CONTEÚDO DA TELA:
{{descrição + seções (KPIs? filtros? tabela? formulário?) + colunas/campos — copie da ficha}}

Não precisa código funcional; foco no layout visual para eu usar como referência.
```

### Template B — Prompt para o Claude Code

```
Construir a tela **{{NOME_DA_TELA}}** do sellerflow-front seguindo as convenções do projeto.

ANTES DE CODAR, leia:
- O roadmap: Obsidian → Plans/sellerflow/frontend/sellerflow-front-telas-roadmap.md
  (seção "Ficha: {{NOME_DA_TELA}}" — ela tem endpoint, campos, colunas e status).
- O template-espelho: {{src/views/EstoqueSaldoView.vue  (listagem)  |  src/views/NovaCompraView.vue (formulário)}}.
{{- (se houver imagem) O layout em docs/design-preferencias/{{slug}}/screen.png — anexada.}}

ARQUÉTIPO: {{Listagem | Formulário | Listagem+Form}}.

FAÇA:
1. src/views/{{Nome}}View.vue — a tela.
2. src/mocks/{{slug}}.ts — dados mock + metadados de status.
3. src/composables/use{{Pascal}}.ts — expõe os dados.
4. Rota "{{/path}}" em src/router/index.ts (meta.requiresAuth: true).
5. Ativar o `to: "{{/path}}"` do item "{{Label na sidebar}}" em src/components/Layout/AppSidebar.vue.

REGRAS:
- MOCK-FIRST: não ligar na API agora. O endpoint real ({{ENDPOINT}}) está na ficha para a fase de integração.
- Reutilize os componentes de src/components/UI/ (PageHeader, AppDataTable + Column[], StatusBadge, FormCard, FormField, StatCard).
- Tokens Tailwind kebab (bg-surface-container-high, text-on-surface, text-primary…), PrimeIcons (pi-*), fonte Inter. Respeitar dark/light.
- Campos/colunas: use exatamente os da ficha (§7).

FECHAMENTO:
- `npm run type-check` deve passar.
- Verifique no preview (porta 5199) em dark e light.
- Atualize o checklist da tela para ✅ e adicione uma linha no "Log de progresso" do roadmap.
```

---

## 7. Fichas por tela

> Cada ficha tem o suficiente para construir **sem reabrir o Swagger**. Contratos extraídos de `app/Docs/Swagger/` em 2026-08-05.

### Ficha: Configurações
- **Arquétipo:** Formulário/painel. **Rota:** `/configuracoes` (sidebar: novo item em "Sistema" ou ícone de engrenagem na topbar). **Imagem:** recomendada.
- **Backend:** nenhum. É 100% front — chama `useSettings().setPrimaryColor(hex)` / `resetPrimaryColor()` (já existem).
- **Conteúdo:** color-picker da cor primária (preview ao vivo), botão "restaurar padrão", toggle dark/light (espelhar `useTheme`). Persistência já é em `localStorage('primary-color')`.
- **Nota:** fecha o requisito pendente de [[theming-runtime-requirements]] (o motor está pronto; falta só esta UI).

### Ficha: Contas a Pagar
- **Arquétipo:** Listagem + Form (criar/editar). **Rota:** `/financeiro/contas-a-pagar`. **Sidebar:** "Contas a Pagar". **Endpoint:** `account-payable` (CRUD completo). **Imagem:** dispensável (espelhar EstoqueSaldo + form).
- **Endpoints:** `GET /account-payable` (paginado) · `GET /account-payable/{id}` · `POST` · `PUT /{id}` · `DELETE /{id}`.
- **Campos (recurso `AccountPayableResource`):** `id`, `company_id`, `valor` (float), `vencimento` (date, nullable), `pago_em` (date, nullable), `status` (`pendente|concluido|atrasado|cancelado`), `categoria_financeira_id` (nullable), `forma_pagamento_id` (nullable), `origem_tipo` (`compra|ajuste_manual|venda`), `origem_id` (nullable), `observacao` (nullable).
- **POST (obrigatório `valor`):** `valor`, `vencimento?`, `pago_em?`, `status?`, `categoria_financeira_id?`, `forma_pagamento_id?`, `origem_tipo?`, `origem_id?`, `observacao?` (máx 1000). `company_id` vem do token.
- **Colunas da lista (sugestão):** Vencimento · Valor (R$) · Categoria · Forma pgto · Origem · Status (badge) · Ações. **KPIs:** total a pagar, vencidas, a vencer 7d/30d.
- **Selects (de `/list`):** categoria → `?params=categoria-financeira`; forma → `?params=forma-pagamento`.
- **Badge de status:** pendente=warning, concluido=success, atrasado=error, cancelado=neutral.

### Ficha: Contas a Receber
- **Arquétipo:** Listagem + Form. **Rota:** `/financeiro/contas-a-receber`. **Sidebar:** "Contas a Receber". **Endpoint:** `account-receivable` (CRUD completo). **Imagem:** dispensável (espelho de Contas a Pagar).
- **Endpoints:** `GET /account-receivable` (paginado) · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}`.
- **Campos (`AccountReceivableResource`):** `id`, `company_id`, `store_id`, `valor`, `previsao_recebimento` (date, nullable), `recebido_em` (date, nullable), `status` (mesmo enum), `origem_tipo` (`compra|ajuste_manual|venda`), `origem_id` (nullable), `observacao` (nullable).
- **POST (obrigatório `valor`):** `valor`, `previsao_recebimento?`, `recebido_em?`, `status?`, `origem_tipo?`, `origem_id?`, `observacao?`. `company_id` e `store_id` vêm do token.
- **Colunas:** Previsão · Valor (R$) · Origem · Status (badge) · Ações. **KPIs:** total a receber, atrasadas, a receber 7d/30d.

### Ficha: Fornecedores
- **Arquétipo:** Listagem + Form. **Rota:** `/cadastros/fornecedores`. **Sidebar:** "Fornecedores". **Endpoint:** `supplier` (CRUD completo). **Imagem:** dispensável.
- **Endpoints:** `GET /supplier` (paginado; filtro `?name=`) · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}`.
- **Campos (`SupplierResource`):** `id`, `name`, `responsavel?`, `cnpj`, `email`, `phone?`, `address?`, `link_catalog?`, `description?`, `status_id`.
- **POST (obrigatórios: `name`, `cnpj`, `email`, `status_id`):** + `responsavel?`, `phone?`, `address?`, `link_catalog?` (URL), `description?`.
- **Colunas:** Nome · Responsável · CNPJ · E-mail · Telefone · Status · Ações.
- **Nota:** `status_id` — não há endpoint de lista de status; usar enum fixo (1=ativo, 2=inativo, 3=pendente) ou toggle ativo/inativo.

### Ficha: Produtos
- **Arquétipo:** Listagem + Form (com **upload de imagens**). **Rota:** `/cadastros/produtos`. **Sidebar:** "Produtos". **Endpoint:** `product` (CRUD; multipart). **Imagem:** **recomendada** (galeria/upload é layout novo).
- **Endpoints:** `GET /product` (paginado; filtros `?name=`, `?sku=`) · `GET /{id}` · `POST` (multipart) · `PUT /{id}` (multipart, method spoofing `_method=PUT`) · `DELETE /{id}`.
- **Campos (`ProductResource`):** `id`, `sku`, `name`, `marca?`, `description?`, `price_unit` (float), `price_box` (float), `status_id`, `images[]` (`{id, url, position, is_cover}`), `fornecedor?` (objeto `SupplierResource`).
- **POST (obrigatórios: `sku`, `name`, `price_unit`, `price_box`, `status_id`):** + `marca?`, `description?`, `fornecedor_id?`, `images[]` (até 10, jpg/jpeg/png/webp, 2MB cada).
- **Colunas:** (thumb) · SKU · Nome · Marca · Fornecedor · Preço unit. · Preço caixa · Status · Ações.
- **Selects:** fornecedor → `/list?params=fornecedor`.

### Ficha: Ajustes de Estoque
- **Arquétipo:** Listagem + Form "novo ajuste". **Rota:** `/estoque/ajustes`. **Sidebar:** "Ajustes". **Endpoint:** `stock-adjustment` (**só index/show/store** — sem update/delete). **Imagem:** dispensável.
- **Endpoints:** `GET /stock-adjustment` (paginado) · `GET /{id}` · `POST /stock-adjustment`.
- **Campos (`StockAdjustmentResource`):** `id`, `company_id?`, `product_id`, `user_id?`, `quantidade` (int; **+** entrada / **−** saída), `motivo` (`perda|quebra|contagem_fisica|devolucao|outro`), `observacao?`.
- **POST — corpo é `{ itens: [...] }`** (array, mín 1). Cada item (obrigatórios `product_id`, `quantidade`, `motivo`): `product_id`, `quantidade` (≠ 0), `motivo`, `observacao?`. `company_id`/`user_id` vêm do token.
- **Form:** linhas add/remove (produto via select, quantidade com sinal, motivo, obs) — espelhar os itens editáveis de `NovaCompraView`.
- **Colunas da lista:** Data · Produto · Quantidade (±, colorida) · Motivo · Usuário · Obs.
- **Selects:** produto → `/list?params=produto`.

### Ficha: Usuários
- **Arquétipo:** Listagem + Form. **Rota:** `/sistema/usuarios`. **Sidebar:** "Usuários". **Endpoint:** `user` (CRUD completo). **Imagem:** dispensável.
- **Endpoints:** `GET /user` (paginado; filtros `?name=`, `?email=`) · `GET /{id}` · `POST` · `PUT /{id}` · `DELETE /{id}`.
- **Campos (`UserResource`):** `id`, `name`, `email`, `status_id`.
- **POST (obrigatórios: `name`, `email`, `password`, `confirmed_password`, `status_id`):** senha mín 8; `confirmed_password` = `password`.
- **PUT:** `name?`, `email?`, `password?` (mín 8), `status_id?`.
- **Colunas:** Nome · E-mail · Status · Ações. Form de criação com senha+confirmação e medidor de força (reaproveitar do login).

### Ficha: Categorias / Formas / Marketplaces
- **Arquétipo:** Listagem **read-only** (por ora). **Rotas:** `/cadastros/categorias`, `/cadastros/formas-pagamento`, `/cadastros/marketplaces`. **Imagem:** dispensável.
- **Endpoint único:** `GET /list?params=<recurso>` (**público**, sem CRUD). `<recurso>` ∈ `categoria-financeira | forma-pagamento | marketplace`. Filtros opcionais: `?status_id=`, `?name=`.
- **Retorno:** `data: [{ id, name }]` — **só isso**. Marketplaces **não** retorna `taxa_percentual`/`taxa_fixa` por aqui.
- 🔴 **Bloqueio p/ CRUD:** não há `POST/PUT/DELETE`. Para telas de gestão completas, o backend precisa criar os recursos (ex.: `php artisan make:crud MarketPlace`). **Decidir antes de construir** (ver §4.1). Enquanto isso: só listar.

### Ficha: Perfil (parcial)
- **Arquétipo:** Card de perfil. **Rota:** `/sistema/perfil`. **Sidebar:** "Perfil". **Imagem:** recomendada.
- 🔴 **Bloqueio:** login devolve só `{token, name, email}` (sem `id`); não há `GET /auth/me`. Editar via `PUT /user/{id}` exige o id.
- **Por ora:** exibir `name`/`email` do `authStore` (read-only). **Para editar/trocar senha:** pedir ao backend um `GET /auth/me` (ou incluir `id` no payload do login). Aí vira form usando `PUT /user/{id}`.

### Ficha: Movimentações (bloqueada)
- **Arquétipo:** Listagem (ledger de estoque). **Rota (planejada):** `/estoque/movimentacoes`. **Sidebar:** "Movimentações".
- 🔴 **Bloqueio:** `GET /stock` retorna `data: [{}]` — o `StockResponseDTO` não expõe campos. Sem contrato, não há o que listar.
- **Ação de desbloqueio (backend):** definir o `StockResponseDTO` de `stock_movements` (campos esperados: `id`, `product_id`/`sku`/`product_name`, `tipo` `entrada|saida|ajuste`, `quantidade`, `origem_tipo` `compra|venda|ajuste_manual`, `origem_id`, `observacao`, `created_at`). Depois construir a tela espelhando `EstoqueSaldoView`.

---

## 8. Log de progresso / "onde parei"

> Anexe uma linha **ao concluir** cada tela ou decisão. A IA lê isto para saber o ponto de retomada.

- **2026-08-05** — Documento criado. Estado: 5 telas de referência ✅. Mapeadas 12 telas faltantes + fichas de API. Descobertos 4 bloqueios de backend (Categorias/Formas/Marketplaces sem CRUD; `/stock` vazio; Perfil sem `/auth/me`; sem categoria de produto). Pasta `docs/design-preferencias/` criada no front.
- **2026-08-05 (decisões do Lucas)** — (1) Por ora **só a documentação** — nenhuma construção de tela iniciada. (2) Categorias/Formas de Pagamento/Marketplaces **ADIADAS** para o fim (não fazer nem read-only agora). Ao retomar: `🔜 PRÓXIMA` recomendada = **Configurações**.
- **2026-08-05 (design)** — Criado o **mock de layout de Movimentações** em `docs/design-preferencias/movimentacoes/` (`screen.html` + `notas.md`), gerado direto pelo Claude Code (HTML de alta fidelidade com tokens TradeFlow, não pela aba do Claude Design). É só o **layout** — o build da tela segue 🔴 bloqueado até o backend expor o `StockResponseDTO` (`GET /stock` volta vazio).
- **2026-08-05 (BUILD EM MASSA)** — Construídas **as 12 telas faltantes no front** (mock-first, sem API), decisão do Lucas de erguer "todo o visual do sistema". Entregue: Movimentações, Ajustes, Contas a Pagar, Contas a Receber, Fornecedores, Produtos, Categorias, Formas de Pagamento, Marketplaces, Usuários, Perfil, Configurações. Cada uma: `views/*View.vue` + `mocks/*.ts` + `composables/use*.ts` + rota em `router/index.ts` + `to:` na `AppSidebar.vue`. **Novos componentes base:** `AppDrawer.vue` (slide-over de formulário, usado em todos os CRUDs) e `CadastroReadOnly.vue` (Categorias/Formas/Marketplaces). Novo mock compartilhado `mocks/catalogo.ts` (espelha `GET /list`: produtoOptions/fornecedorOptions/categoriaFinanceiraOptions/formaPagamentoOptions/marketplaceOptions/statusOptions + `statusMeta`). **Verificado:** `npm run type-check` 0 erros; dev server 5199 sem erros de console; Movimentações renderiza dados; **color-picker das Configurações troca `--primary` em runtime e persiste (fecha o requisito de [[theming-runtime-requirements]])**; drawer de Contas a Pagar abre com os campos. **Sidebar 100% ativa** (não há mais item "Em breve"). **Próximo grande passo:** integração com a API (trocar mocks por `services/endpoints.ts` + axios) — e desbloqueios de backend (`StockResponseDTO`, `GET /auth/me`, CRUD de Categorias/Formas/Marketplaces).
- **2026-08-05 (mobile nav)** — Sidebar responsiva feita: novo `composables/useSidebar.ts` (`isOpen`/open/close/toggle); hambúrguer (`pi-bars`, `md:hidden`) no `AppHeader.vue`; `AppSidebar.vue` virou `fixed`/drawer no mobile (`-translate-x-full` fechado, `md:sticky md:translate-x-0` no desktop) + backdrop + botão fechar; `watch(route.path)` fecha ao navegar. Ícones secundários da topbar viram `hidden sm:flex`. Verificado no preview: 375px (drawer abre/fecha, backdrop, fecha ao clicar link) e 1280px (sidebar fixa, hambúrguer oculto). type-check ok.

---

## 9. Decisões pendentes (para o Lucas)

1. ~~**Cadastros read-only (Categorias/Formas/Marketplaces):** fazer só listagem agora, ou pedir CRUD ao backend primeiro?~~ ✅ **RESOLVIDO 2026-08-05: ADIADAS** para o fim (não fazer nem read-only por ora).
2. **Perfil:** aceitável read-only por enquanto, ou priorizar `GET /auth/me` no backend? *(Rec.: pedir `/auth/me`, é barato.)*
3. **Movimentações:** vale expor o `StockResponseDTO` no backend, ou adiar a tela? *(Rec.: adiar até ter demanda real.)*
4. **Categoria de produto:** criar a tabela no backend (organiza filtros de estoque/produtos) ou seguir sem? *(Rec.: criar — barato, e o filtro "Categoria" já aparece no Saldo.)*
5. **Pasta de design:** manter `docs/design-preferencias/` (novo) **e** `docs/design-reference/` (antigo/Stitch), ou consolidar num só? *(Rec.: manter os dois — reference = telas antigas do Stitch; preferencias = as novas do Claude Design.)*
