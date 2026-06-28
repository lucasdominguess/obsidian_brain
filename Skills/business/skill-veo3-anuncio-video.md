---
tags: [skill/video, veo3, anuncio, produto, modelo, salao]
---

# Skill: Gerador de Prompt para Vídeo de Anúncio (Google Veo 3)

> **Objetivo:** Gerar um template de prompt estruturado em 3 seções para colar diretamente no Google Veo 3, criando vídeos de anúncio com modelo fictícia em cenário de salão.

---

## Por que 3 seções?

O Veo 3 às vezes recusa prompts interpretando a modelo como pessoa real e responde com:
> *"I can't make content that appears to show specific people."*

A solução é separar a descrição da modelo numa seção rotulada **"modelo fictícia"** — escrita pelo próprio usuário, deixando claro que é um personagem inventado. O Claude só cuida do produto e do cenário técnico.

---

## Como usar

Envie ao Claude:
1. **Foto do produto**
2. **Dimensões** — ex: "8cm de altura"
3. **Características físicas da modelo** — cor/estilo do cabelo, cor dos olhos, roupa e estilo
4. **Frase** — o que a modelo deve dizer (máx. ~18 palavras para caber em 8s)

Claude preenche a seção `produto` e entrega o template completo para você copiar, preencher `modelo fictícia` e colar no Veo 3.

---

## Template para colar no Veo 3

```
produto: [tipo de embalagem] — [material e cor], [detalhes metálicos], [estilo do pump/tampa], [cores do rótulo e texto visível], aproximadamente [X]cm, [como é segurado], rótulo virado para a câmera.

modelo fictícia: [PREENCHA: cor e estilo do cabelo | cor dos olhos | tom de pele | roupa e estilo]

cenário e gestos técnicos: Cinematic beauty advertisement, 8-second video. Natural professional makeup with warm neutral tones, elegant and polished. Modern minimalist salon — soft-focus white salon chairs and large arched mirrors in the background, warm ambient lighting. She holds the product [descrição de tamanho/forma de segurar], the [cor do colar] collar catching the light. She raises the product toward the camera with a confident warm smile. Slow push-in camera movement. She says "[FRASE]" warmly and confidently, looking directly into the camera. Soft key light from the left, gentle fill light from the right, subtle rim light separating her from the background. High-end beauty commercial aesthetic, clean and aspirational. Subtle upbeat background music.
```

---

## O que o Claude preenche vs. o que você preenche

| Seção | Quem preenche | O quê |
|---|---|---|
| `produto` | Claude (da foto) | embalagem, cores, material, rótulo, como segura |
| `modelo fictícia` | **Você** | aparência física, cabelo, olhos, roupa |
| `cenário e gestos técnicos` | Claude (padrão fixo) | salão, câmera, iluminação, música, maquiagem |
| `[FRASE]` | **Você** | frase que a modelo diz (Claude ajusta se muito longa) |

---

## Regra de tamanho do produto → como segurar

| Tamanho | Como segurar | Texto no prompt |
|---|---|---|
| Muito pequeno (≤ 8cm, ex: 30mL) | Entre polegar e dedos, **visivelmente menor que a mão** | `held delicately between her thumb and fingers, visibly smaller than her hand` |
| Pequeno (8–12cm) | Na palma com os dedos ao redor | `fits within her palm, fingers wrapped around it` |
| Médio (12–25cm) | Numa mão à altura do peito | `held at chest height in one hand, label facing camera` |
| Grande (> 25cm) | Com as duas mãos na altura da cintura | `held with both hands at waist height` |

> **Referência visual:** produtos 30mL ficam visivelmente menores que a mão — segurados entre os dedos, não na palma inteira.

---

## Regra de comprimento da frase

| Palavras | Status | Ação |
|---|---|---|
| até 18 | ✅ Cabe naturalmente | Usar como está |
| 19–22 | ⚠️ Limite | Manter se o usuário insistir |
| + de 22 | ❌ Muito longa | Condensar preservando o benefício principal |

---

## Exemplo completo preenchido

**Inputs recebidos:**
- Foto: frasco pump violeta escuro, colar prata, rótulo "Açaí Oil F2 HAIR", 30mL
- Dimensões: 8cm
- Modelo: cabelo preto curto chanel de bico, olhos castanhos mel, vestido branco colado
- Frase: "O Reparador de Pontas Açaí é um escudo antioxidante — sela as pontas e elimina o aspecto espigado já na primeira aplicação." *(adaptada de 31 para 18 palavras)*

**Template gerado:**

```
produto: pump bottle — deep violet transparent glass body, bright silver chrome metallic collar, tall white pump dispenser, white and purple label reading "Reparador de Pontas Açaí Oil F2 HAIR", approximately 8cm tall, held delicately between her thumb and fingers, visibly smaller than her hand, label facing the camera, silver collar catching the light.

modelo fictícia: short black angled bob hair, honey-brown eyes, light skin, fitted white bodycon dress

cenário e gestos técnicos: Cinematic beauty advertisement, 8-second video. Natural professional makeup with warm neutral tones, elegant and polished. Modern minimalist salon — soft-focus white salon chairs and large arched mirrors in the background, warm ambient lighting. She holds the product delicately between her thumb and fingers, visibly smaller than her hand, the silver chrome collar catching the light. She raises the product toward the camera with a confident warm smile. Slow push-in camera movement. She says "O Reparador de Pontas Açaí é um escudo antioxidante — sela as pontas e elimina o aspecto espigado já na primeira aplicação." warmly and confidently, looking directly into the camera. Soft key light from the left, gentle fill light from the right, subtle rim light separating her from the background. High-end beauty commercial aesthetic, clean and aspirational. Subtle upbeat background music.
```

---

## Dicas para o Veo 3

- Cole as 3 seções juntas como um bloco único — o Veo 3 lê o texto estruturado
- O rótulo "modelo fictícia" sinaliza ao Veo 3 que não é uma pessoa real
- O Veo 3 aceita a frase em português — não precisa traduzir
- Duração máxima atual: ~8 segundos por clip

---

*Skill atualizada em 2026-05-28 | SellerFlow / Anúncios de Produto*
