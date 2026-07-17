---
tags: [sellerflow, frontend, vue, documentacao]
status: a-construir
criado: 2026-06-28
---

# SellerFlow — Frontend (Vue SPA)

> Documento de referência para quando formos **construir o front e ligá-lo à API**.
> A API do backend já está pronta. Relacionado: [[SellerFlow-API]], [[00 - SellerFlow - Visão Geral]].

## Onde fica

- **Repositório apartado** (git próprio), fora do repo do backend.
- **Caminho local:** `C:\Users\lukas\git_projetos\Javascript\sellerflow-front`
- É um **template reaproveitado de outro projeto** (uma SPA de prefeitura/saúde). A base técnica é boa, mas há resíduos do projeto antigo que precisam ser adaptados antes de usar (ver "Campos minados").

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 6 |
| UI | PrimeVue 4 (tema Aura) + TailwindCSS 3 + Sass |
| Estado | Pinia |
| Rotas | Vue Router 4 (guard `meta.requiresAuth`) |
| HTTP | Axios |
| Datas | Moment |
| Linguagem | Vue 3 + TypeScript |

- **Comandos:** `npm install` · `npm run dev` (Vite) · `npm run build` (roda `type-check` + build) · `npm run type-check`
- **Alias:** `@` → `src/` (em `vite.config.ts` e `tsconfig.app.json`)

## Estrutura `src/`

```
plugins/axios.ts        instância axios + interceptors (Authorization Bearer, 401 → logout)
stores/auth.ts          store Pinia de autenticação (token, user, login/logout)
stores/index.ts         barrel de stores
composables/useAuth.ts  açúcar p/ componentes: isAuth, userName, login, logout
router/index.ts         rotas + guard global (meta.requiresAuth)
router/guards.ts        guards extras (requireAuth, requireAdmin, redirectIfAuth)
token/index.ts          helpers de token no localStorage
services/toast.ts       toastErro/toastSuccess — já trata o formato de erro do Laravel
theme/colorScale.ts     gera escala de cor do brand (BRAND_COLOR em main.ts)
views/ + components/     telas e componentes
assets/img/             imagens (ainda do projeto antigo)
```

## ✅ O que já está bom (aproveitar)

- **Interceptors do Axios:** adicionam `Authorization: Bearer <token>` em toda request e fazem `logout` + redirect no `401`.
- **`services/toast.ts`:** já lê o formato de erro do Laravel — `errors{}` (validação, exibe um toast por mensagem) com fallback para `message`. Casa direto com o `ApiResponse` da nossa API.
- **Arquitetura de auth pronta:** store Pinia + composable `useAuth` + guard de rota por `meta.requiresAuth`.
- **Tema por uma cor só:** trocar `BRAND_COLOR` em `main.ts` regenera a escala (PrimeVue Aura).

## 🚩 Campos minados (status)

São resquícios do projeto-template. Progresso em **2026-06-28**:

1. ✅ **RESOLVIDO — `apiURL` placeholder.** `axios.ts` agora lê `import.meta.env.VITE_API_URL`. Criados `.env` e `.env.example` com `VITE_API_URL=http://localhost:8000/api/v1`. `env.d.ts` tipa a variável.

2. ✅ **RESOLVIDO — `require('@/stores')` (CommonJS em projeto ESM).** Removido. Os interceptors do `axios.ts` foram **desacoplados do store** (leem o token direto do `localStorage`), o que eliminou o circular import de vez.

3. ✅ **RESOLVIDO — Login migrado para e-mail/senha.** `LoginComponent.vue` reescrito (design novo, ver abaixo); `stores/auth.ts` e `useAuth.ts` agora usam `login(email, password)` e postam `{ email, password }` em `/login`. Redirect pós-login corrigido (`/admin` → `/home`). Tela antiga de CPF (com imagens da prefeitura + `fundoProjeto.jpg` quebrado) descartada.

4. ✅ **RESOLVIDO — Inconsistência de token (era bug crítico).** `token/index.ts` lia a chave `"Token"` e a expiração por `"Expiration"` — chave que **nunca era gravada**, então `isTokenExpired()` retornava `true` sempre e **derrubava toda requisição autenticada** (logout + redirect). Unificado: chave única `"token"` (a mesma do store); `isTokenExpired()` removido; expiração agora tratada pelo `401` da API no interceptor de response.

5. ⏳ **PARCIAL — Branding.** Feito: `<title>` do HTML e `tituloProjeto` → "SellerFlow". Pendente: imagens em `assets/img/` (logos SUS/prefeitura) — precisam dos assets do SellerFlow para substituir.

## 🐞 Bugs encontrados na análise (ainda NÃO corrigidos)

Ligados à área de login/layout — deixados para decisão:

- ✅ ~~**Redirect quebrado pós-login** (`/admin` inexistente)~~ → corrigido para `/home` na reescrita do login.
- ✅ ~~**Imagem de fundo inexistente** (`fundoProjeto.jpg`)~~ → tela antiga descartada; login novo não usa.
- ✅ ~~**Header/Footer no login**~~ → `App.vue` agora só renderiza o shell em rotas autenticadas.
- **Menu aponta para rota inexistente:** `AppHeader.vue` tem item `/sobre`, sem rota correspondente.
- **Texto placeholder:** `Home.vue` exibe "Admin Home".

## ✔️ Validação

`npm run type-check` (vue-tsc) passou **sem erros** após os ajustes.

---

## 🎨 Design system (base do Google Stitch) — 2026-06-28

Adotado o estilo das telas geradas no Stitch ("TradeFlow/SellerFlow"): **dark-mode-first**, corporate/modern, alta densidade de dados, fonte **Inter**.

### Referências no repo
- `docs/design-reference/` — as 5 telas do Stitch (`screen.png` + `code.html`) + `tradeflow/DESIGN.md` (spec de tokens). Usar como espelho ao construir cada tela.
- ⚠️ O `DESIGN.md` tem **duas paletas conflitantes**: os *tokens* do frontmatter (navy + indigo — os que as telas usam) e uns hexes "slate" na prosa que **não batem** com as imagens. **Vale o frontmatter.**

### Paleta (tokens canônicos)
| Papel | Cor |
|---|---|
| background / surface | `#051424` |
| surface-container low→highest | `#0d1c2d` · `#122131` · `#1c2b3c` · `#273647` |
| primary (indigo) | `#c0c1ff` / container `#8083ff` |
| secondary (rosa — financeiro/saída) | `#ffb0cd` |
| tertiary (verde — entrada/sucesso) | `#4edea3` |
| error | `#ffb4ab` |
| on-surface / variant | `#d4e4fa` / `#c7c4d7` |
| outline / variant | `#908fa0` / `#464554` |

### Onde os tokens vivem (fundação já implementada)
- **`tailwind.config.js`** — `darkMode: 'class'` + cores (kebab: `bg-surface-container`, `text-on-surface`, `text-primary`…) + spacing (`sidebar-width` 240px, `container-padding`, `card-padding`…). As classes batem com a nomenclatura do Stitch, então dá pra adaptar o markup das telas quase direto.
- **`src/main.ts`** — `BrandPreset` PrimeVue: primary = indigo `#8083ff` (via `generateScale`) + rampa de `surface` navy no `colorScheme.dark`.
- **`index.html`** — `<html class="dark">` (dark-first).
- **`src/assets/global.css`** — body navy + scrollbar/datatable ajustados pro dark.

### Shell da aplicação (implementado)
- **`components/Layout/AppSidebar.vue`** — menu seccionado (Operação / Estoque / Financeiro / Cadastros / Sistema). Só **Dashboard → `/home`** navega; o resto é placeholder "Em breve" (sem `to`) até construirmos cada tela.
- **`components/Defaults/AppHeader.vue`** — topbar (busca + ações + usuário). *(Era o header antigo da prefeitura; reescrito.)*
- **`App.vue`** — renderiza o shell só nas rotas autenticadas (`meta.requiresAuth`); login sem chrome. `AppFooter.vue` ficou órfão (não removido).

### Tema dark/light
- **`composables/useTheme.ts`** — alterna a classe `.dark` no `<html>` (lida por Tailwind e PrimeVue), persiste em `localStorage('theme')`, default **dark**. Inicializado no `main.ts`. Toggle exposto na tela de login (ícone sol/lua).
- ⚠️ **Caveat:** o toggle funciona global (PrimeVue + variantes `dark:`), mas o **shell** (sidebar/topbar/dashboard) foi escrito com tokens dark **fixos** (não `dark:`), então no modo claro a app interna continua escura — **só o login adapta 100%**. Para light-mode completo da app, migrar os tokens fixos para variantes `dark:` ou para CSS vars que troquem por modo. (Tarefa futura, se quiser light de verdade.)

### Integração com a API (rotas)
- **Vue Router** (navegação no navegador): `src/router/index.ts` + `router/guards.ts`. Adicionar rota nova aqui ao construir cada tela. Hoje: `/`, `/home`, `/logout`, catchAll.
- **Endpoints da API** (chamadas axios): centralizados em **`src/services/endpoints.ts`** — caminhos relativos à baseURL (`/api/v1`). Sempre importar daqui, não espalhar strings. Fonte: `routes/api.php` (backend) / `php artisan route:list`.
- **Base:** `http://localhost:8000/api/v1` (via `VITE_API_URL`). Login = `/auth/login` (era `/login`, errado).
- **Contrato do login** (não-óbvio): payload `{ email, password }` (senha min 8). Resposta embrulhada em `{ success, message, data: { token, name, email } }` — token está em `data.data.token`. O token também volta no header `Authorization: Bearer` (com `Access-Control-Expose-Headers`), capturado pelo `pegarAuthorization`. Campo do nome é `name` (não `nome`); **não** há `refreshToken` no login nem endpoint `/user/me`.
- ⚠️ **CORS:** front `:5173` × API `:8000` = cross-origin. Backend (`config/cors.php`) precisa liberar o origin e expor `Authorization`. Ajustar quando integrar de verdade.

### Próximas telas (ordem) — adaptar do `docs/design-reference/`
Dashboard (completar) → Saldo de Estoque → Nova Venda → Nova Compra → Fluxo de Caixa. Cada uma precisa também da **rota** correspondente (hoje só existem `/`, `/home`, `/logout`).

## Ordem sugerida de integração

1. Configurar `VITE_API_URL` no `.env` + corrigir o `require` do `axios.ts`.
2. Adaptar o fluxo de login para **email/senha** contra a API real.
3. Testar o ciclo: **login → rota protegida → logout** (validar 401 → logout automático).
4. Unificar a estratégia de token (uma fonte de verdade).
5. A partir daí, construir telas consumindo os endpoints documentados em [[SellerFlow-API]].

> Padrões de UI / tela nova: consultar `Skills/dev/skill-front.md` no Brain.
