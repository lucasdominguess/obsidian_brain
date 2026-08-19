---
tags: [shopee, ads, skill, spec]
tipo: especificacao
status: aprovado — skill construída (decisões §8 resolvidas 2026-08-05); pendente validação com CSV real
verificado_em: 2026-08-05
---

# 07 — Spec: Skill de Análise de Shopee Ads (CSV → diagnóstico)

> **Status: rascunho para aprovação.** Isto define *o que* a skill faz — não é a skill ainda. Legenda: ✅ verificado · ⚠️ confirmar · 🔶 heurística.

## 1. Objetivo e escopo

Skill que recebe o **export do Shopee Ads** + os **custos por SKU** e devolve um **diagnóstico com ações priorizadas por SKU**, ancorado em [[00-fatos-canonicos]] e [[04-otimizacao-playbook]].

- **É:** um analista de dados que classifica, diagnostica e prioriza.
- **NÃO é:** substituto do consultor [[skill-shopee]] (que faz estratégia/copy). Esta **complementa** — é o braço quantitativo. Também **não decide sozinha**: recomenda com racional.

## 2. Onde vive e como é invocada  ⟵ decisão aberta (§8)

- **Recomendado:** skill no Brain — `Skills/business/skill-shopee-ads-analyzer.md`, irmã de [[skill-shopee]] e ao lado da base.
- **Alternativa:** skill do Claude Code no repo SellerFlow (`.claude/skills/shopee-ads-analyzer/`) — invocável direto neste ambiente e caminho natural se virar feature do backend (Fase 4).

## 3. Entradas

### 3.1 Export do Shopee Ads (✅ schema verificado)
Central do Vendedor → Shopee Ads → período → **Exportar Dados**. Dois tipos:

| Export | Nível | Uso na skill |
|---|---|---|
| **Dados Gerais de Anúncios** | Campanha / Produto (SKU) | Segmentação e diagnóstico principal |
| **Dados de palavra-chave e performance** | Palavra-chave | Extração Ampla→Exata, negativas ([[03-leilao-palavras-chave-e-lances]]) |

**Colunas esperadas** (normalizar nomes/acentos; podem variar):
`impressões · cliques · CTR · pedidos (Placed/Paid/Confirmed) · conversões (diretas/totais) · itens vendidos · GMV (direto/total) · investimento/gasto · CPC · CPCv (custo/conversão) · ROAS (direto/total) · ACOS`
- ✅ **CTR** = cliques/impressões. **ROAS** = GMV/investimento. **ACOS** = investimento/GMV (= CIR = 1/ROAS).
- ✅ **Placed** inclui cancelados/devolvidos → usar **Paid/Confirmed** para margem; o gap `Placed − Paid` = **sinal de cancelamento**.
- ✅ **Direto** (só o SKU anunciado) vs **Total** (efeito Halo). Regra: julgar lucro pelo **Direto** (conservador); olhar **Total** antes de pausar.

### 3.2 Custos por SKU (obrigatório p/ break-even)  ⟵ decisão aberta (§8)
Por SKU: `preço de venda · custo do produto · alíquota de imposto (regime)`. Fonte possível: (a) usuário informa, (b) arquivo `Plans/shopee/custos-skus.csv` mantido, (c) 🔶 **banco do SellerFlow** (já tem produtos cadastrados) — forte candidato p/ Fase 4.

### 3.3 Constantes
Taxas por faixa de preço e fórmula de break-even: **sempre** de [[00-fatos-canonicos]]. `frete excedente` default 0 (⚠️ confirmar por logística).

## 4. Pipeline de processamento

```
0. NORMALIZAR
   - mapear colunas (PT/EN, acentos, decimal com vírgula)
   - escolher estado de pedido = Paid (fallback Confirmed) para margem
   - flag cancelamento se (Placed − Paid)/Placed > limiar 🔶

1. DERIVAR por SKU (e por KW no export de palavra-chave)
   - CTR, CR (=conversões/cliques), CIR/ACOS, ROAS(direto e total), CPC, CPCv

2. BREAK-EVEN por SKU  (taxa correta pela FAIXA do preço — 00-fatos §1)
   - comissão = %faixa × preço ;  taxa_fixa = R$ da faixa
   - margem = preço − custo − comissão − taxa_fixa − imposto − frete_excedente
   - be_roas = preço / margem ;  be_cir = margem / preço
   - se margem ≤ 0  → SKU inviável em Ads (alertar, não anunciar)

3. SEGMENTAR (ROAS_direto × be_roas)
   - Ganhador : ROAS_direto > be_roas  e  volume suficiente
   - Perdedor : ROAS_direto < be_roas  e  gasto relevante
   - Sem-dado : impressões/cliques abaixo do mínimo 🔶

4. DIAGNOSTICAR (árvore de 04-otimizacao-playbook §3)
   - poucas impressões → lance/KW/relevância
   - CTR baixo → criativo (capa/título/preço)
   - CTR ok + CR baixa → página (não é o anúncio)
   - CIR > be_cir → baixar lance / negativar / pausar
   - CIR < be_cir + orçamento capado → ESCALAR

5. PRIORIZAR por impacto financeiro
   - $ em risco  = gasto de Perdedores (prejuízo acumulado)
   - $ na mesa   = GMV potencial de Ganhadores capados
```

## 5. Saída (relatório)

1. **Sumário executivo:** gasto total · GMV (direto/total) · ROAS médio · nº de SKUs por grupo · **$ em risco** · **$ na mesa** · alertas.
2. **Tabela por SKU:** métricas + be_roas + veredito + ação recomendada.
3. **Top ações — "faça isto primeiro"** (ordenadas por impacto, com racional + link à base).
4. **Alertas:** cancelamento alto · SKU sem custo · CTR<1% após 1.000 impr. · campanha em aprendizado (<7d).
5. **Próximo ciclo:** o que observar; lembrar a **janela de 7 dias** (não pausar cedo).
6. **Formato:** markdown no chat; opcional salvar histórico em `Plans/shopee/relatorios/AAAA-MM-DD.md`.

## 6. Regras de segurança (o "não faça besteira")

- ✅ Sem custo do SKU → **não** dá veredito de lucro; pede o dado (como [[skill-shopee]] já exige).
- ✅ Break-even da margem real manda — ignora alvos genéricos de CTR/CIR (🔶).
- ✅ Não recomendar pausa: campanha <7d (aprendizado), ou sem olhar **GMV Total** (Halo), ou grupo Sem-dado.
- ✅ Marcar cada número como fato ✅ ou heurística 🔶. Dados insuficientes → dizer "sem dado", nunca inventar veredito.

## 7. Casos de borda

- **GMV Max** (sem KW) × **Manual** (com KW) → relatórios diferentes; adaptar o passo de KW.
- Preço na **fronteira de faixa** (ex.: R$80) → alertar sobre reprecificar p/ R$79,99 ([[06-erros-hacks-e-calendario]] §1).
- Decimal PT-BR (vírgula), milhar com ponto, colunas com acento.
- SKU com margem ≤ 0 mesmo sem Ads → sinalizar problema de **precificação**, não de campanha.

## 8. Decisões (resolvidas 2026-08-05)

1. **Custos por SKU:** ✅ arquivo **`Plans/shopee/custos-skus.csv`** mantido pelo usuário; migra p/ SellerFlow na Fase 4.
2. **Onde a skill vive:** ✅ **Brain** — `Skills/business/skill-shopee-ads-analyzer.md`.
3. **Saída:** ✅ **chat + histórico** em `Plans/shopee/relatorios/AAAA-MM-DD.md`.

## 9. Validação (antes de dar por pronta)

Rodar com **1 export real** (pode anonimizar): conferir se as colunas batem com §3.1, calibrar limiares 🔶 (volume mínimo, cancelamento) e validar 2–3 break-evens à mão.

## 10. Referências

- Base: [[00-fatos-canonicos]] · [[02-metricas-e-break-even]] · [[04-otimizacao-playbook]] · [[03-leilao-palavras-chave-e-lances]]
- Oficial (verificado 2026-08-05): `ads.shopee.com.br/learn/faq/111/1561` (métricas), `.../354/1509` (baixar/analisar relatório), `.../111/426` (monitorar desempenho)
