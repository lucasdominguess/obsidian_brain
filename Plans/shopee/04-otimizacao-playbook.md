---
tags: [shopee, ads, otimizacao, playbook, skill-core]
consolida: [Guia Avançado_ Shopee Ads 2026, Shopee - Notebooklm]
---

# 04 — Playbook de Otimização (núcleo da skill)

> **Este é o cérebro operacional.** A skill de análise aplica exatamente estas regras sobre o CSV.
> Taxas/break-even: [[00-fatos-canonicos]] · [[02-metricas-e-break-even]]. Legenda: ✅ ⚠️ ❌ 🔶.

## 1. Ler o relatório

Colunas típicas do export do Shopee Ads: `impressões · cliques · CTR · CPC · gasto · GMV/vendas · pedidos · ROAS · CIR`. Primeiro passo: recalcular/validar métricas derivadas e o **break-even por SKU** (a taxa fixa muda por faixa de preço!).

## 2. Segmentar em 3 grupos (antes de qualquer ação)

| Grupo | Critério | Ação-mãe |
|---|---|---|
| 🟢 **Ganhador** | ROAS **>** break-even, com volume | **Escalar** (orçamento/lance) |
| 🔴 **Perdedor** | ROAS **<** break-even, com gasto relevante | **Cortar / reduzir** |
| ⚪ **Sem-dado** | Poucas impressões/cliques | **Ajustar** antes de julgar (lance/KW) |

> Compare sempre ROAS **real × break-even do SKU**, nunca contra um alvo genérico.

## 3. Árvore de diagnóstico (o algoritmo)

```
Poucas impressões?
  → lance baixo / KW muito restrita / baixa relevância
  → AÇÃO: subir lance OU ampliar correspondência (Ampla) OU melhorar relevância

CTR baixo (já tem impressões)?
  → problema de CRIATIVO: capa / título / preço / relevância da KW
  → AÇÃO: trocar capa (regra: CTR < 1% após 1.000 impressões), revisar título/preço

CTR ok, mas CR (conversão) baixa?
  → NÃO é o anúncio. É PÁGINA: preço, avaliações, estoque, descrição
  → AÇÃO: corrigir o listing — pausar Ads aqui só queima dinheiro

CIR acima do break-even (ROAS abaixo)?
  → AÇÃO: baixar lance, negativar termos que gastam sem vender, pausar piores KW

CIR abaixo do break-even (ROAS acima) e orçamento estourando?
  → AÇÃO: ESCALAR (subir orçamento/lance) — dinheiro na mesa
```

> ⚠️ Antes de pausar, olhe o **GMV Total (Halo)**, não só o Direto, e respeite a **janela de 7 dias** — vendas chegam atrasadas.

## 4. Checklist semanal

1. **Negativas (Manual):** excluir KW que gastaram **> 2× o preço do produto** sem gerar venda.
2. **Meta ROAS (GMV Max):** entregando pouco orçamento? Reduza a meta em **0,5** para dar fôlego à IA.
3. **Criativos:** trocar a capa de anúncios com **CTR < 1% após 1.000 impressões**.
4. **Extração Ampla→Exata:** promover termos campeões ([[03-leilao-palavras-chave-e-lances]] §2).
5. **Saldo:** confirmar recarga automática (saldo zerado quebra o aprendizado).

## 5. Cadência

- **Regra dos 7 dias:** não editar durante o aprendizado.
- **Janela de avaliação:** 7–15 dias antes de conclusões definitivas.
- Otimização é **semanal**, não diária — mexer demais reseta o algoritmo.

## 6. Para a skill (resumo executável)

```
para cada SKU no CSV:
    derivar CTR, CR, CIR, ROAS
    break_even = preço / margem_de_contribuição      # taxas em 00-fatos-canonicos
    classificar em Ganhador / Perdedor / Sem-dado
    aplicar árvore de diagnóstico (§3)
ordenar ações por impacto ($ em risco ou $ na mesa)
devolver: lista priorizada "faça isto primeiro" + o que observar no próximo ciclo
```
