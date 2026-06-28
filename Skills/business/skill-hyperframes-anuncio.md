---
tags: [skill/video, hyperframes, anuncio, produto, shopee, video-as-code, montagem]
---

# Skill: Montagem de Anúncio em Vídeo (HeyGen HyperFrames)

> **Objetivo:** Montar anúncios MP4 prontos para Shopee / Reels / TikTok a partir de um clipe gerado pela [[skill-veo3-anuncio-video]], foto do produto ([[skill-criacao-img-produto]]) e dados do produto — usando HyperFrames (vídeo-como-código em HTML). HyperFrames é o **editor**, não o gerador do "ator": o clipe do Veo3 entra como `<video>` e a gente monta título, preço, CTA, marca e música por cima, com formato repetível por produto.

---

## Onde cada ferramenta atua (não confundir)

| Etapa | Ferramenta | Entrega |
|---|---|---|
| Gerar o "ator" (modelo + produto falando, 8s) | Veo 3 → [[skill-veo3-anuncio-video]] | `intro.mp4` |
| Foto/arte do produto isolada | [[skill-criacao-img-produto]] | `produto.png` |
| **Montar o anúncio final (título, preço, CTA, música)** | **HyperFrames (esta skill)** | `anuncio-final.mp4` |
| Copy / preço / regras de visibilidade Shopee | [[skill-shopee]] | texto + estratégia |

> HyperFrames brilha porque o anúncio é **HTML**: troca-se produto/preço/foto nos placeholders e re-renderiza em segundos → escala para o catálogo inteiro.

---

## Pré-requisitos e setup (uma vez)

- **Node.js 22+** e **FFmpeg** no PATH.
- Projeto mora **fora** do repo SellerFlow (vídeo está fora do MVP). Sugestão de pasta: `git_projetos/Marketing/hyperframes-anuncios`.

```bash
# integra HyperFrames com o agente (Claude Code/Cursor) + instala a skill oficial deles
npx skills add heygen-com/hyperframes

# ou inicializar um anúncio manual
npx hyperframes init anuncio-{slug-do-produto}
cd anuncio-{slug-do-produto}
```

### Loop de produção

```bash
npx hyperframes preview   # browser com live-reload enquanto ajusta o HTML
npx hyperframes lint      # valida a composição antes de renderizar
npx hyperframes render    # gera o MP4 (headless Chrome + FFmpeg) — determinístico
```

Blocos prontos do catálogo (transições/overlays): `npx hyperframes add flash-through-white`, `instagram-follow`, `data-chart`. Catálogo: hyperframes.heygen.com/catalog

---

## Como usar (o que enviar ao Claude)

1. **Clipe do Veo3** (`intro.mp4`) — ou o prompt pra gerar via [[skill-veo3-anuncio-video]].
2. **Foto do produto** (`produto.png`, fundo limpo).
3. **Dados comerciais:** nome do produto, preço cheio, preço promocional, % desconto, frete (se grátis).
4. **CTA** — ex: "Compre na Shopee", "Link na bio".
5. **Formato:** vertical `1080x1920` (Reels/TikTok/Shopee Vídeo) ou quadrado `1080x1080` (feed).

Claude preenche os placeholders do template HTML, roda `lint` + `render` e entrega o `anuncio-final.mp4`.

---

## Estrutura de tracks do anúncio (padrão)

| Track | Conteúdo | Janela típica (15s) |
|---|---|---|
| 0 | Clipe Veo3 de fundo (`intro.mp4`) | 0s → 8s |
| 0 | Foto do produto em destaque (push-in) | 8s → 15s |
| 1 | Título / benefício animado | 1s → 6s |
| 2 | Selo de preço + desconto | 8s → 14s |
| 3 | CTA final ("Compre na Shopee") | 12s → 15s |
| 4 | Música de fundo (`music.wav`, volume ~0.4) | 0s → 15s |

---

## Template HTML reutilizável (anúncio vertical 1080x1920)

Salvar como `index.html`. Trocar apenas os `[[PLACEHOLDERS]]`.

```html
<div id="stage" data-composition-id="anuncio"
     data-start="0" data-width="1080" data-height="1920">

  <!-- TRACK 0: clipe do Veo3 (0-8s) e foto do produto (8-15s) -->
  <video class="clip" data-start="0" data-duration="8" data-track-index="0"
         src="intro.mp4" muted playsinline></video>
  <img id="hero" class="clip" data-start="8" data-duration="7" data-track-index="0"
       src="produto.png" alt="produto">

  <!-- TRACK 1: título / benefício (1-6s) -->
  <h1 id="titulo" class="clip" data-start="1" data-duration="5" data-track-index="1">
    [[BENEFICIO_PRINCIPAL]]
  </h1>

  <!-- TRACK 2: selo de preço + desconto (8-14s) -->
  <div id="preco" class="clip" data-start="8" data-duration="6" data-track-index="2">
    <span class="de">De R$ [[PRECO_CHEIO]]</span>
    <span class="por">R$ [[PRECO_PROMO]]</span>
    <span class="desconto">-[[PERCENTUAL]]%</span>
  </div>

  <!-- TRACK 3: CTA final (12-15s) -->
  <div id="cta" class="clip" data-start="12" data-duration="3" data-track-index="3">
    [[CTA]]  <!-- ex: Compre na Shopee -->
  </div>

  <!-- TRACK 4: música -->
  <audio data-start="0" data-duration="15" data-track-index="4"
         data-volume="0.4" src="music.wav"></audio>

  <!-- Animações seekable (GSAP) registradas em window.__timelines -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#titulo", { opacity: 0, y: 60, duration: 0.8 }, 1)
      .from("#hero",   { scale: 1.15, duration: 7, ease: "none" }, 8)   // slow push-in
      .from("#preco",  { opacity: 0, scale: 0.6, duration: 0.6, ease: "back.out(2)" }, 8)
      .to  ("#desconto", { rotation: -8, yoyo: true, repeat: 3, duration: 0.3 }, 8.6)
      .from("#cta",    { opacity: 0, y: 40, duration: 0.6 }, 12);
    window.__timelines = window.__timelines || {};
    window.__timelines.anuncio = tl;
  </script>
</div>
```

> CSS (cores da marca, fontes, posicionamento dos selos) vai em arquivo separado conforme a "Regra de Ouro" da [[skill-front]] — nada de `<style>` poluindo o HTML quando der pra separar.

---

## Atributos `data-*` que importam

- `data-composition-id` — id único da composição (= chave em `window.__timelines`).
- `data-start` / `data-duration` — em **segundos**.
- `data-track-index` — ordem de empilhamento/áudio (maior = mais na frente).
- `data-width` / `data-height` — canvas em pixels (1080x1920 vertical).
- `data-volume` — 0.0 a 1.0 (música de fundo ~0.4 pra não cobrir a voz do Veo3).

Animações **precisam ser seekable** e estar em `window.__timelines` — senão o render não controla frame a frame.

---

## Claude preenche vs. você preenche

| Item | Quem | O quê |
|---|---|---|
| `intro.mp4` | **Você** | clipe gerado no Veo3 |
| `produto.png` | **Você** | foto/arte do produto |
| `[[BENEFICIO_PRINCIPAL]]`, `[[CTA]]` | Claude (ajusta com você) | copy curta e vendável (alinhar com [[skill-shopee]]) |
| `[[PRECO_CHEIO]]` / `[[PRECO_PROMO]]` / `[[PERCENTUAL]]` | **Você** | números reais |
| Timeline GSAP, tracks, formato | Claude | montagem técnica padrão |
| `lint` + `render` | Claude | executa e entrega o MP4 |

---

## Regras de formato e duração

| Destino | Resolução | Duração ideal |
|---|---|---|
| Shopee Vídeo / Reels / TikTok | 1080x1920 (9:16) | 12–20s |
| Feed quadrado | 1080x1080 (1:1) | 10–15s |
| Clipe Veo3 de origem | — | máx ~8s por clip (limite do Veo3) |

> Para anúncios > 8s, encadear **vários** clipes Veo3 em tracks sequenciais (track 0 com `data-start` 0, 8, 16…), ou complementar com foto/arte do produto após o clipe.

---

## Checklist antes de renderizar

- [ ] `intro.mp4` e `produto.png` na pasta do projeto.
- [ ] Preço promocional < preço cheio e `%` bate com a conta.
- [ ] Música em volume baixo (não cobre a voz do clipe).
- [ ] Texto legível com margem de segurança (não colado nas bordas — safe area do app).
- [ ] `npx hyperframes lint` passou sem erro.
- [ ] CTA aparece no final e está coerente com o link real da Shopee.

---

*Skill criada em 2026-06-17 | SellerFlow / Anúncios de Produto | complementa [[skill-veo3-anuncio-video]]*
