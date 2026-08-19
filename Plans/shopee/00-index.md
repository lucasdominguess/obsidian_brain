---
tags: [shopee, ads, moc, indice]
tipo: mapa-de-conteudo
atualizado_em: 2026-08-05
---

# Shopee Ads — Base de Conhecimento (MOC)

> **O que é isto.** Camada **canônica** de conhecimento sobre Shopee Ads, consolidada e deduplicada a partir dos docs brutos em `Docks/Shopee/`. Aqui os conflitos já estão resolvidos e os fatos, verificados. É o material de trabalho — e a fonte que a futura **skill de análise** vai consumir.
> **Regra de ouro:** número que envolve dinheiro → sempre confira em [[00-fatos-canonicos]]. Ele vence qualquer outro arquivo.

**Legenda de confiança** (usada em toda a base): ✅ verificado · ⚠️ conflitante / confirmar na conta · ❌ errado/desatualizado nos docs brutos · 🔶 heurística de terceiros (não é fato oficial)

---

## Mapa da base

| # | Arquivo | Para quê | Status |
|---|---|---|---|
| — | [[00-fatos-canonicos]] | **Fonte da verdade** dos números (taxas, atribuição, break-even) | ✅ verificado |
| 01 | [[01-fundamentos-e-tipos-de-anuncio]] | Contas CPF/CNPJ, tipos de anúncio, ciclo de vida | consolidado |
| 02 | [[02-metricas-e-break-even]] | Glossário, fórmulas e o cálculo de break-even | consolidado |
| 03 | [[03-leilao-palavras-chave-e-lances]] | Ad Score, Ampla→Exata, estratégias de lance | consolidado |
| 04 | [[04-otimizacao-playbook]] | Regras de diagnóstico + checklist semanal (**núcleo da skill**) | consolidado |
| 05 | [[05-seo-conversao-e-marketing]] | SEO de listing, conversão, ferramentas de marketing | consolidado |
| 06 | [[06-erros-hacks-e-calendario]] | Anti-patterns, hacks, sazonalidade, plano 30 dias | consolidado |

## Mapa de fontes (canônico ← bruto)

Os arquivos acima consolidam, sem duplicar, estes docs brutos (mantidos como referência histórica):

- [[Guia Mestre de Operação Shopee Brasil 2026]] — visão geral de operação
- [[Guia Avançado_ Shopee Ads 2026]] — Ads a fundo (GMV Max, leilão, bidding)
- [[Guia Avançado_ Algoritmo e Visibilidade (SEO & Marketing) Shopee 2026]] — SEO/algoritmo
- [[Shopee - Notebooklm]] — síntese analítica (NotebookLM)
- Fontes externas verificadas: ver §8 de [[00-fatos-canonicos]]

> ⚠️ Os docs brutos contêm erros já corrigidos aqui (ex.: taxa fixa, frete grátis, alvos de CTR). **Não os use para decisão** — use esta camada canônica.

## Como a skill vai usar isto

1. Lê [[00-fatos-canonicos]] → taxas e fórmula de break-even.
2. Lê [[04-otimizacao-playbook]] → regras de diagnóstico por métrica.
3. Recebe o export CSV do Shopee Ads → aplica as regras → devolve ações priorizadas por SKU.

## Perfil desta loja (contexto fixo)

- **CNPJ ativo** → tabela de taxas base, **sem** a sobretaxa de CPF.
- Produtos cadastrados, vendas orgânicas em andamento; objetivo = **escalar com Ads** protegendo margem.
- Pendências específicas da conta a confirmar: §7 de [[00-fatos-canonicos]].
