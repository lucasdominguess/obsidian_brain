---
tags: [skill/ops, ferramenta-externa, notebooklm, automacao]
---

# Skill: NotebookLM via CLI (notebooklm-py)

> **Objetivo:** Operar o Google NotebookLM de forma programática (CLI/Python) como **ferramenta auxiliar pessoal** — gerar áudio-resumos, overviews, quizzes e mapas mentais a partir dos meus docs do Brain. **Não é integração do SellerFlow** — roda fora do app, na minha máquina.

> [!warning] Status: NÃO-OFICIAL — usar por conta e risco
> - Lib da comunidade (MIT), **não afiliada ao Google**. Usa **APIs internas não documentadas** que podem quebrar sem aviso.
> - **Auth automatiza minha sessão Google** (OAuth via browser ou import de cookies do Chrome/Edge). Risco teórico de throttling/bloqueio da conta. Usar com conta de baixo risco, não a conta principal crítica.
> - Sujeito a **rate limit**. Adequado para uso pessoal/protótipo, nunca para produção ou volume alto.
> - Repo: `https://github.com/teng-lin/notebooklm-py`

## 1. Quando usar (e quando NÃO)

| Usar para | NÃO usar para |
| --- | --- |
| Gerar áudio-overview dos guias Shopee do Brain | Integrar no código do SellerFlow (stack é PHP, isso é Python) |
| Resumo em áudio/vídeo de planos longos (`Plans/sellerflow/`) | Qualquer fluxo automatizado em produção |
| Gerar quiz/flashcards de estudo a partir de um doc | Subir dados sensíveis de clientes/financeiro do app |
| Mapa mental de um módulo para revisão | Depender disso como serviço estável |

## 2. Instalação (Windows / PowerShell)

```bash
# CLI completa com browser (Playwright + Chromium ~170 MB no 1º login)
uv tool install "notebooklm-py[browser]"
# ou: pipx install "notebooklm-py[browser]"

# Só biblioteca (sem browser)
pip install notebooklm-py
```
- Requer **Python 3.10–3.14**.

## 3. Autenticação

```bash
notebooklm login                 # abre browser para login Google
notebooklm login --browser-cookies   # importa sessão existente do Chrome/Edge
```
- Multi-conta: flags `--profile` e `--account`.
- Credenciais ficam no storage local da ferramenta. **Não commitar nada disso.**

## 4. Fluxo típico (CLI)

```bash
notebooklm create "Estudo Shopee 2026"
notebooklm source add "https://en.wikipedia.org/wiki/..."   # ou PDF/YouTube/Drive
notebooklm ask "Quais os principais temas?"
notebooklm generate audio "deixe envolvente, em PT-BR" --wait
notebooklm download audio ./podcast.mp3
```

### Caso de uso meu: áudio-resumo dos guias Shopee
1. `notebooklm create "Shopee Master 2026"`
2. Adicionar como fonte os `.md` de `Docks/Shopee/` (Guia Mestre, SEO, Ads).
3. `generate audio` → `download audio` → ouço como podcast de revisão.

## 5. API Python (async) — quando quiser script

```python
async with NotebookLMClient.from_storage() as client:
    nb = await client.notebooks.create("Research")
    await client.sources.add_url(nb.id, "https://example.com", wait=True)
    result = await client.chat.ask(nb.id, "Summarize this")
    print(result.answer)
```

## 6. Capacidades (8+ artefatos)
Áudio overview, vídeo, quiz, flashcards, slide deck (PPTX), infográfico, mapa mental (JSON), tabela de dados. Exporta MP3/MP4/PDF/PNG/CSV/JSON/MD. Alguns recursos (batch download, JSON de quiz/mindmap) existem só via API, não na UI web.

## 7. Modos extras
- **MCP server:** expõe as tools pro Claude Desktop/Cursor/Windsurf (opção futura se eu quiser usar dentro do agente).
- **REST server:** FastAPI localhost — **experimental**, não confiar.

## 8. Decisão registrada
Avaliado em 2026-06-17. Aprovado **apenas como ferramenta auxiliar pessoal**, fora do SellerFlow. Integração no app foi descartada por: stack incompatível (Python/Playwright vs PHP/Laravel) + dependência de APIs não-oficiais + auth por cookies de sessão pessoal.
