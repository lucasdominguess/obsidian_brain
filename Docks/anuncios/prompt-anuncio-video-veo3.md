# Prompt padrão — Anúncio de produto em vídeo (Google Veo 3)

Template fixo pra gerar anúncio de beleza no Veo 3, no padrão de [[skill-veo3-anuncio-video]].
**O que é padronizado:** a modelo, o cenário, o tema, a iluminação e a música. **O que muda a cada anúncio:** o cabelo da modelo (`[CABELO]`), a frase (`[FRASE]`) e as **imagens do produto** (sempre anexadas na hora — não descrevo produto aqui).

---

## Como usar

1. Copie o bloco abaixo.
2. Troque `[CABELO]` por ex.: `loiro comprido e liso` ou `preto curto e liso`.
3. Troque `[FRASE]` pelo que a modelo vai dizer (**máx. ~18 palavras** → cabe nos ~8s).
4. **Anexe as imagens do produto** no input (se forem vários, anexe na ordem que quiser que apareçam, da esquerda p/ direita).
5. Cole as 3 seções como **um bloco único** no Veo 3.

---

## Bloco para colar no Veo 3

```
produto: the product(s) in the scene MUST look exactly like the attached reference image(s) — identical bottle shape, cap, metallic collar, liquid color, and label text/colors. All labels face the camera. If there is one product, it is presented prominently to the camera; if there are several, they stand upright in a row on the white marble counter, labels facing the camera, metallic collars catching the light.

modelo fictícia: young woman, fair/white skin, light-colored eyes, [CABELO] hair, wearing an elegant modern dress.

cenário e gestos técnicos: Cinematic beauty advertisement, 8-second video. Natural professional makeup with warm neutral tones, elegant and polished. Modern minimalist salon — soft-focus white salon chairs and large arched mirrors in the background, warm ambient lighting, white marble counter. She presents the product(s) toward the camera with a confident warm smile (holding it delicately if a single product, or gesturing gracefully toward the row of bottles on the counter if several). Slow push-in camera movement. She says "[FRASE]" warmly and confidently, looking directly into the camera. Soft key light from the left, gentle fill light from the right, subtle rim light separating her from the background. High-end beauty commercial aesthetic, clean and aspirational. Subtle upbeat background music.
```

---

## Campos que você troca

| Campo | O que colocar |
|---|---|
| `[CABELO]` | `long straight blonde` / `loiro comprido e liso` · ou `short straight black` / `preto curto e liso` (pode escrever em PT, o Veo entende) |
| `[FRASE]` | frase de venda, **≤ 18 palavras** |
| imagens | anexadas no input — referência exata dos rótulos |

## Modelo (fixo — não mexer)
Jovem, pele branca, olhos claros, vestido elegante e moderno. **Só o cabelo muda** via `[CABELO]`.

## Regras herdadas da skill do Veo 3
- O rótulo **"modelo fictícia"** evita a recusa do Veo ("can't show specific people"). Não remover.
- Frase: até **18 palavras** ✅ · 19–22 ⚠️ (no limite) · +22 ❌ (encurtar).
- **~8s por clip.** Pra vídeo mais longo (ex.: showcase dos frascos + modelo), gerar 2 clipes e emendar.
- A frase pode ficar em **português**.

---

*Relacionado: [[skill-veo3-anuncio-video]] · montagem/edição em [[skill-hyperframes-anuncio]]*
