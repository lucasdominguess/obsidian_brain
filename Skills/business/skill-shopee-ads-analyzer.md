---
tags: [skill/shopee, ads, analista, analyzer]
irma: skill-shopee
spec: Plans/shopee/07-spec-skill-analise
---

# Skill: Analista de Shopee Ads (CSV → diagnóstico)

> **Missão.** Receber o export do Shopee Ads + os custos por SKU e devolver um **diagnóstico com ações priorizadas por impacto financeiro**. É o braço **quantitativo** da [[skill-shopee]] (a estrategista). Spec completo: [[07-spec-skill-analise]].

## 0. RAG obrigatório — ler ANTES de qualquer análise

Carregue e trate como fonte de verdade:
- [[00-fatos-canonicos]] — **todo número que envolve dinheiro vem daqui** (taxas por faixa, break-even).
- [[04-otimizacao-playbook]] — árvore de diagnóstico e checklist.
- Apoio: [[02-metricas-e-break-even]], [[03-leilao-palavras-chave-e-lances]].

## 1. Entradas exigidas

1. **Export do Shopee Ads** (Central do Vendedor → Shopee Ads → *Exportar Dados*, até 90 dias):
   - **Dados Gerais de Anúncios** (nível produto/campanha) — principal.
   - **Dados de palavra-chave e performance** — para Ampla→Exata (opcional, recomendado).
2. **Custos por SKU** — `Plans/shopee/custos-skus.csv` (`sku, nome, preco_venda, custo_produto, aliquota_imposto_pct, frete_excedente`).

> Faltou custo de um SKU → **não** dê veredito de lucro dele; liste como "sem custo — informar".

## 2. Pipeline

**2.0 Normalizar** — mapear colunas (PT/EN, acentos); decimal PT-BR (vírgula→ponto). Estado de pedido p/ margem = **Paid** (fallback Confirmed). Flag cancelamento se `(Placed − Paid)/Placed > 0,15` 🔶.

**2.1 Derivar** (por SKU; por KW no export de palavra-chave):
`CTR=cliques/impr · CR=conv/cliques · ROAS_direto=GMV_direto/gasto · ROAS_total=GMV_total/gasto · CIR=gasto/GMV · CPC · CPCv`.

**2.2 Break-even por SKU** — pela **faixa** de `preco_venda` ([[00-fatos-canonicos]] §1):
```
comissão   = %faixa × preco_venda
taxa_fixa  = R$ da faixa           # ATENÇÃO: R$4 só até 79,99; R$16/20/26 acima
margem     = preco_venda − custo_produto − comissão − taxa_fixa − (aliquota×preco_venda) − frete_excedente
be_roas    = preco_venda / margem
be_cir     = margem / preco_venda
```
Se `margem ≤ 0` → SKU **inviável em Ads** (problema de PRECIFICAÇÃO, não de campanha) — alertar.

**2.3 Segmentar** (usar **ROAS_direto**, conservador):
- 🟢 **Ganhador**: ROAS_direto > be_roas e volume ok
- 🔴 **Perdedor**: ROAS_direto < be_roas e gasto relevante
- ⚪ **Sem-dado**: abaixo do mínimo 🔶 (ex.: <1.000 impressões ou <20 cliques)

**2.4 Diagnosticar** — aplicar a árvore de [[04-otimizacao-playbook]] §3 por item (poucas impressões / CTR baixo / CTR ok+CR baixa / CIR alto / CIR baixo+capado).

**2.5 Priorizar** — `$ em risco = gasto de Perdedores` · `$ na mesa = GMV potencial de Ganhadores capados`. Ordenar ações por esses valores.

## 3. Saída

1. **Sumário executivo**: gasto total · GMV (direto/total) · ROAS médio · nº SKUs por grupo · **$ em risco** · **$ na mesa** · alertas.
2. **Tabela por SKU**: métricas + `be_roas` + veredito + ação.
3. **Top ações — "faça isto primeiro"**: ordenadas por impacto, com racional + referência à base.
4. **Alertas**: cancelamento alto · SKU sem custo · CTR<1% após 1.000 impr. · campanha em aprendizado (<7d).
5. **Próximo ciclo** + lembrete da **janela de 7 dias**.
6. **Salvar cópia** em `Plans/shopee/relatorios/AAAA-MM-DD.md`.

## 4. Regras de segurança (não faça besteira)

- O **break-even da margem real** manda; alvos genéricos de CTR/CIR são 🔶 e não vetam nada sozinhos.
- **Não recomendar PAUSA** se: campanha <7d (aprendizado), ou sem checar **GMV Total (Halo)**, ou item no grupo Sem-dado.
- Sem custo do SKU → **sem** veredito de lucro.
- Marque cada número: ✅ fato ou 🔶 heurística. Dado insuficiente → diga "sem dado", **nunca invente** veredito.
- Antes de **escalar**, confirme ROAS acima do break-even com **volume real** (não um pico de 1 venda).

## 5. Casos de borda

GMV Max (sem KW) × Manual (com KW) → adaptar o passo de KW · preço em fronteira de faixa → sugerir `R$ x9,99` ([[06-erros-hacks-e-calendario]] §1) · `margem ≤ 0` = precificação, não campanha · SKU novo ainda em aprendizado.

## 6. Como invocar

"Analise meu Shopee Ads" + anexar/colar o(s) export(s) e ter o `custos-skus.csv` preenchido. A skill roda o pipeline §2 e devolve a saída §3.
