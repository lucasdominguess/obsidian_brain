---
tags: [shopee, ads, metricas, break-even]
consolida: [Guia Avançado_ Shopee Ads 2026, Guia Mestre de Operação Shopee Brasil 2026]
---

# 02 — Métricas e Break-even

> Núcleo analítico da base. Taxas usadas aqui: [[00-fatos-canonicos]]. Legenda: ✅ ⚠️ ❌ 🔶.

## 1. Glossário (✅ definições são fato)

| Métrica | O que é |
|---|---|
| Impressões | Vezes que o anúncio apareceu |
| Cliques | Cliques no anúncio |
| **CTR** | Cliques ÷ Impressões — relevância do criativo (capa+título+preço) |
| **CR / Conversão** | Pedidos ÷ Cliques — poder de conversão da página |
| CPC | Custo por clique (gasto ÷ cliques) |
| Gasto | Investimento em Ads no período |
| GMV / Vendas | Faturamento atribuído ao anúncio |
| **ROAS** | GMV ÷ Gasto |
| **CIR (= ACOS)** | Gasto ÷ GMV = **1 / ROAS** |
| GMV **Direto** | Venda do exato SKU anunciado |
| GMV **Total / Halo** | Direto + outros itens da loja comprados após o clique |

## 2. Fórmulas

```
CTR   = cliques / impressões
CR    = pedidos / cliques
ROAS  = GMV atribuído / gasto em Ads
CIR   = gasto / GMV = 1 / ROAS          (ROAS 5  ⇔  CIR 20%)
```

- ✅ **Janela de atribuição:** 7 dias por clique (todos os tipos) + 1 dia por impressão (GMV Max — Anúncio de Produto).
- **Efeito Halo:** o anúncio funciona como "porta de entrada" — o clique no Produto A gera compra de B e C, diluindo o custo de aquisição. Sempre olhe o GMV **Total**, não só o Direto, antes de pausar.

## 3. Break-even — o único alvo que importa ⭐

Alvos de CTR/CIR de terceiros são 🔶 heurística. O alvo **real** é o break-even da SUA margem:

```
Margem de contribuição (M) = Preço − Custo do produto − Comissão − Taxa fixa − Impostos − Frete excedente*
Break-even ROAS = Preço de venda ÷ M
Break-even CIR  = 1 ÷ Break-even ROAS   (= M ÷ Preço)
```
*Frete excedente = só quando o frete real passa do subsídio Shopee (⚠️ ver [[00-fatos-canonicos]] §2).

### Exemplo (com a taxa fixa CORRETA)
Item R$100 (Faixa 4 → 14% + **R$20**) · custo R$30 · imposto ~R$4 (exemplos):
```
Comissão = 14% × 100 = R$14
M = 100 − 30 − 14 − 20 − 4 = R$32
Break-even ROAS = 100 / 32 = 3,13     →  abaixo disso = prejuízo
```
> ❌ A skill antiga usava taxa fixa **R$4** → break-even 2,08 (erro de ~50%). Detalhe em [[00-fatos-canonicos]] §6.

## 4. Fato × heurística (não confundir)

| Fato ✅ | Heurística 🔶 (ponto de partida, não regra) |
|---|---|
| Definições e fórmulas acima | "CTR bom > 1,5–2%" |
| Break-even calculado da sua margem | "CIR < 15%" |
| Janela 7d/1d | "ROAS-meta ideal = X" |

## 5. Para a skill

Estes são exatamente os cálculos que a skill roda **por SKU** a partir do CSV: deriva CTR/CR/CIR/ROAS, calcula o break-even com as taxas de [[00-fatos-canonicos]], e compara ROAS real × break-even para classificar ganhador/perdedor. Regras de ação: [[04-otimizacao-playbook]].
