---
tags: [shopee, ads, fatos-canonicos, referencia]
tipo: fonte-da-verdade
verificado_em: 2026-08-05
status: parcial — financeiro e atribuicao verificados; itens marcados com aviso pendem de confirmacao na conta
---

# 00 — Fatos Canônicos: Shopee Ads & Taxas (BR 2026)

> **Propósito.** Fonte única da verdade para os números que alimentam decisões de Ads e de margem.
> Resolve as contradições entre [[Guia Mestre de Operação Shopee Brasil 2026]], [[Guia Avançado_ Shopee Ads 2026]], [[Guia Avançado_ Algoritmo e Visibilidade (SEO & Marketing) Shopee 2026]], [[Shopee - Notebooklm]] e a skill `Skills/business/skill-shopee.md`.
> **A verdade final é a sua Central do Vendedor** (taxas variam por categoria e programa). Este doc é o padrão de trabalho; confirme os itens ⚠️ na sua conta.

**Legenda de confiança:** ✅ verificado (oficial / múltiplas fontes) · ⚠️ conflitante / confirmar na conta · ❌ errado ou desatualizado nos seus docs · 🔶 heurística de terceiros (não é fato oficial)

---

## 1. Estrutura de comissão e taxas — vigência março/2026

✅ **Tabela de comissão por faixa de preço do item** (base; igual para CNPJ e CPF):

| Faixa | Preço do item | Comissão | Taxa fixa / item |
|---|---|---|---|
| 1 | R$ 0,00 – 7,99 | ⚠️ 50% (ver §4) | R$ 0,00 |
| 2 | R$ 8,00 – 79,99 | 20% | R$ 4,00 |
| 3 | R$ 80,00 – 99,99 | 14% | R$ 16,00 |
| 4 | R$ 100,00 – 199,99 | 14% | R$ 20,00 |
| 5 | R$ 200,00 + | 14% | R$ 26,00 |

- ✅ **Teto de comissão de R$100 REMOVIDO** em março/2026. A comissão de 14% escala linearmente, sem limite (item de R$2.000 → R$280 de comissão).
- ✅ **Aumento da taxa fixa:** R$16 (+300%), R$20 (+400%), R$26 (+550%) frente ao modelo antigo.
- ✅ **Você é CNPJ** → paga a tabela base **sem** a sobretaxa de CPF (a de +R$3/item só atinge CPF com >450 pedidos/90 dias).

## 2. Frete grátis — 2026

- ✅ **Obrigatório** desde março/2026: todo vendedor participa automaticamente, sem opt-out.
- ✅ **Subsídio bancado pela Shopee**, por faixa: até R$79,99 → R$20 · R$80–199,99 → R$30 · R$200+ → R$40.
- ⚠️ **Custo acima do teto subsidiado:** as fontes divergem sobre quem paga a diferença quando o frete real passa do subsídio. calcularte diz que o subsídio "não interfere na comissão"; outras dizem que o vendedor cobre o excedente. **Confirmar na conta** (varia por logística: Xpress / Full / Correios).
- ❌ **Correção:** o [[Guia Mestre de Operação Shopee Brasil 2026]] diz "frete grátis adiciona **6%** à comissão" e o [[Shopee - Notebooklm]] diz "**75%** subsidiado". **Nenhum descreve o modelo 2026** (subsídio por teto R$20/30/40). Ignore o "+6%".

## 3. Ads — mecânica verificada

- ✅ **Janela de atribuição:** 7 dias por **clique** (todos os tipos) + 1 dia por **impressão/visualização** (exclusivo do GMV Max — Anúncio de Produto).
- ✅ **GMV Max:** modo de lance por **meta de ROAS**; a IA distribui entre Busca, Descoberta, Prêmio da Loja e Shopee Coins. **Fase de aprendizagem = 7 dias; não editar a campanha** nesse período (edições atrasam a otimização). Espere flutuação de ROAS até estabilizar.
- 🔶 **"GMV Max precisa de 10–15 conversões/30 dias"** ([[Guia Avançado_ Shopee Ads 2026]]) — recomendação de terceiros; a FAQ oficial **não** cita requisito mínimo. Plausível, mas trate como heurística.

## 4. Conflitos resolvidos — o que cada doc dizia × o correto

| Tema | Seus docs diziam | Correto (verificado) |
|---|---|---|
| Comissão faixa principal | "20% flat + R$4" (skill) | Só vale até R$79,99. Acima é **14% + R$16/20/26** |
| Taxa fixa item R$100+ | R$4 (skill) | **R$20–26** — erro que quebra o break-even (§6) |
| Faixa < R$8 | 50% (notebooklm) / 20% (guia mestre) | ⚠️ calcularte confirma **50%**; outras implicam 20%. **Confirmar** |
| Frete grátis | +6% comissão / 75% subsídio | ❌ Ambos errados. Modelo = subsídio R$20/30/40 |
| Decomposição do 20% | "18% + 2% transação" (skill) | Não confirmado p/ 2026. Use os **20% efetivos** |
| CTR alvo | 1,5% (ads) vs 2% (mestre) | 🔶 Shopee **não** publica alvo oficial de CTR |
| CIR alvo | "< 15%" (mestre) | 🔶 Não é oficial; break-even depende da SUA margem (§6) |
| Pesos de ranqueamento | 30/35/20/15% | 🔶 Marcado "estimado" no próprio doc — heurística |

## 5. Métricas — o que é fato × o que é heurística

- ✅ **Definições (fato):** `ROAS = GMV atribuído ÷ gasto em Ads`. `CIR (= ACOS) = gasto ÷ GMV = 1/ROAS`. GMV **Direto** = venda do SKU anunciado; **Total/Halo** = inclui outros itens da loja comprados após o clique (janela de 7 dias).
- 🔶 **Alvos (heurística):** CTR "bom", CIR "< 15%", ROAS-meta — **não** há número oficial. O único alvo que importa de verdade é o **break-even da sua margem** (§6). Use alvos de terceiros só como ponto de partida.

## 6. ⭐ Por que a verificação importou — o erro de break-even

A skill atual (`skill-shopee.md`) assume **R$4 de taxa fixa**. O valor real para um item de R$100 é **R$20**. Efeito no ROAS mínimo para não dar prejuízo (valores de custo/imposto são exemplo ilustrativo):

```
Item R$100 · custo produto R$30 (ex.) · imposto ~R$4 (ex.) · comissão 14% = R$14

Com R$4  (skill errada): margem = 100 − 30 − 14 − 4  − 4 = R$48 → break-even ROAS = 100/48 = 2,08
Com R$20 (correto):      margem = 100 − 30 − 14 − 20 − 4 = R$32 → break-even ROAS = 100/32 = 3,13
```

> Uma campanha a **ROAS 2,5** pareceria lucrativa pela skill antiga — mas está **no prejuízo**. Erro de ~50% no ROAS mínimo exigido.
> **Fórmula correta:** `Break-even ROAS = Preço de venda ÷ Margem de contribuição`.

## 7. Pendências — confirmar na Central do Vendedor / verificação futura

- [ ] ⚠️ Faixa < R$8 é mesmo 50%? (na prática você não vende solo abaixo de R$8 — o hack de Kit já resolve)
- [ ] ⚠️ Quem paga o frete acima do teto subsidiado, na sua logística
- [ ] ⚠️ Comissão da **sua** categoria (pode diferir dos 14/20% gerais)
- [ ] Impostos reais do seu regime (Simples/MEI/…) para fechar o break-even
- [ ] 🔶 "Split Payment CBS/IBS retido no checkout" (docs) — confirmar com contador (reforma tributária)

## 8. Fontes — verificado em 2026-08-05

- **Oficial** — Comissão CNPJ/CPF 2026: `seller.shopee.com.br/edu/article/26839` (portal SPA; título e política confirmados, conteúdo não renderiza via fetch)
- **Oficial** — Ads / GMV Max: `ads.shopee.com.br/learn/faq/473/1667` e `.../111/1561`
- **E-Commerce Brasil** — fim do teto R$100 e taxa fixa +550%
- **Calcularte** — tabela completa de faixas (2026-03-06)
- Corroboração: E-commerce na Prática, Irroba

---

> **Próximos passos do plano:** Fase 2 — consolidar a base em `plans/shopee/`; Fase 3 — skill CSV→diagnóstico usando **estes** números como fonte de verdade.
