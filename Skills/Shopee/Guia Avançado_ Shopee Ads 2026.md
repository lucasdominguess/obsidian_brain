# Guia Avançado: Shopee Ads 2026

Este documento aprofunda o **Tópico 5** do Guia Mestre, detalhando as mecânicas de leilão, novas funcionalidades de Inteligência Artificial (GMV Max) e estratégias de otimização para vendedores que buscam escala e lucratividade na Shopee Brasil em 2026.

---

## 1. Ecossistema de Anúncios: Tipos e Posicionamentos

Em 2026, o Shopee Ads evoluiu de uma ferramenta de busca para um ecossistema multicanal integrado.

### Anúncios de Busca (Search Ads)
*   **Busca de Produtos:** Exibe o produto nos resultados de pesquisa. Os dois primeiros resultados no App são sempre anúncios, seguidos por três orgânicos e, então, o terceiro anúncio (Classificação Média 3).
*   **Busca da Loja:** Exibe o nome da loja, cupons e produtos em destaque no topo da página de resultados. Ideal para proteção de marca e fidelização.

### Anúncios de Descoberta (Discovery Ads)
*   **Posicionamento:** Aparecem em seções como "Você também pode gostar", "Produtos Diários" e na página inicial do App.
*   **Estratégia:** Focado em usuários que estão navegando sem uma intenção de compra específica, mas com perfil de interesse similar ao produto.

### Shopee Live & Vídeo Ads
*   **Impulsionamento de Live:** Aumenta o tráfego para transmissões ao vivo em tempo real.
*   **Vídeo Ads:** Impulsiona vídeos curtos na aba "Shopee Vídeo", convertendo entretenimento em vendas diretas.

---

## 2. A Revolução do GMV Max (GMX)

O **GMV Max** é a principal inovação de 2026. É uma solução de "caixa preta" baseada em IA que simplifica a gestão de anúncios.

| Funcionalidade | Descrição Técnica |
| :--- | :--- |
| **Otimização Multicanal** | Distribui o orçamento automaticamente entre Busca e Descoberta. |
| **Smart Bidding** | Ajusta o lance em milissegundos com base na probabilidade de conversão do usuário. |
| **Meta de ROAS** | O vendedor define um ROAS desejado (ex: 3.5) e a IA busca o volume máximo de vendas dentro dessa meta. |
| **Maximização de Vendas** | Foca em gastar todo o orçamento diário para gerar o maior faturamento possível, sem uma meta de ROAS rígida. |

> **Dica Estratégica:** O GMV Max é recomendado para produtos que já possuem histórico de vendas (mínimo de 10-15 conversões nos últimos 30 dias) para que a IA tenha dados suficientes para otimizar.

---

## 3. Métricas Avançadas e Atribuição

Compreender como a Shopee lê os dados é crucial para não pausar campanhas lucrativas precocemente.

### Janela de Atribuição de 7 Dias
Se um usuário clica no seu anúncio de uma "Camiseta A" e, 5 dias depois, volta à plataforma e compra uma "Calça B" da sua loja, essa venda é contabilizada como **VBM Indireto** para o anúncio da camiseta.

### Glossário Técnico 2026
*   **CTR (Click-Through Rate):** Meta ideal > 1,5%. Indica a relevância do seu criativo (foto + título + preço).
*   **CIR (Cost-to-Income Ratio):** O inverso do ROAS. Se seu ROAS é 5, seu CIR é 20% (1/5). É a métrica preferida para cálculo de margem líquida.
*   **VBM Direto:** Vendas do exato produto anunciado.
*   **VBM Total:** Soma de vendas diretas e indiretas (outros itens da loja comprados após o clique).

---

## 4. O Algoritmo de Leilão: Como Ganhar?

O leilão da Shopee não é decidido apenas por quem paga mais. A fórmula de 2026 segue o princípio do **Ad Score**:

$$Ad Score = Lance de CPC \times Relevância do Anúncio$$

### Fatores de Relevância:
1.  **Histórico de CTR:** O quanto as pessoas clicam no seu anúncio quando ele aparece.
2.  **Taxa de Conversão (CR):** O quanto o anúncio efetivamente gera vendas.
3.  **Saúde da Loja:** Avaliações, tempo de resposta do chat e taxa de cancelamento.

---

## 5. Estratégias de Lances (Bidding)

### Lance Manual (Precision Bidding)
*   **Quando usar:** Lançamento de novos produtos (onde não há dados para a IA) ou produtos de nicho com palavras-chave muito específicas.
*   **Técnica:** Começar com o lance sugerido pela Shopee e ajustar +/- 10% a cada 3 dias com base no volume de impressões.

### Lance Automático / GMV Max
*   **Quando usar:** Produtos validados ("Cavalos de Batalha") e campanhas de datas duplas (11.11, 12.12).
*   **Técnica:** Definir um orçamento diário que suporte pelo menos 20-30 cliques para permitir o aprendizado da máquina.

---

## 6. Checklist de Otimização Semanal

1.  **Limpeza de Negativas:** No lance manual, excluir palavras-chave que gastaram mais de 2x o valor do produto sem gerar vendas.
2.  **Ajuste de ROAS Meta:** Se o GMV Max estiver entregando pouco orçamento, reduza a meta de ROAS em 0.5 para dar mais "fôlego" à IA.
3.  **Análise de Criativos:** Trocar a foto principal de anúncios com CTR < 1% após 1.000 impressões.
4.  **Recarga Automática:** Garantir que o saldo de Ads nunca zere, pois isso "quebra" o aprendizado do algoritmo e penaliza a relevância.

---

## 7. Hacks de Otimização de Ads (NotebookLM)

### O Processo de Extração (HACK de Excel)
Para transição de palavras-chave Ampla para Exata de forma científica:
1. Exporte a planilha de relatórios da campanha manual (Ampla) no formato Excel.
2. Identifique nas colunas quais termos secundários ("Direct Conversions") geraram vendas com ROAS acima do Break-even.
3. Pegue esses termos rentáveis, **negative-os** na campanha Ampla e isole-os em uma nova campanha **EXATA**.
4. Aumente o CPC desses termos exatos em 25% para garantir a pole position por um custo altamente rentável.

### Métrica Direct vs. Padrão (Efeito Halo)
O *Direct GMV* reflete a venda do SKU específico que foi clicado. No entanto, observe o **Efeito Halo**: o usuário clica no Produto A, navega pela sua loja e compra o Produto B e C. O Shopee Ads frequentemente atua como uma "porta de entrada" (gerador de tráfego raiz) para que o cliente compre outros itens do seu catálogo, diluindo o custo de aquisição.
