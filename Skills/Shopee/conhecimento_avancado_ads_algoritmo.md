---
tags:
  - shopee/ads
  - shopee/algoritmo
  - shopee/matematica
---

# Shopee Ads: Algoritmo, Leilão e Matemática Avançada (Base de Conhecimento)

Este documento atua como memória de longo prazo (RAG) para a Super Skill de Consultoria Shopee.

## 1. O Algoritmo de Leilão (Muito Além do CPC)
O sistema de leilão do Shopee Ads não coroa apenas quem paga mais. A fórmula de ranqueamento de anúncios é baseada na soma:
`Ad Rank = Lance de CPC x Índice de Relevância x Qualidade do Histórico`
- **Relevância:** O quão exata é a palavra-chave comprada em relação ao título do seu produto e categoria.
- **Histórico:** Produtos que já converteram sob aquela palavra-chave específica passam a pagar cliques mais baratos (CPC diminui) para manter a mesma posição, pois o algoritmo "confia" na conversão daquele produto. O período de maturação do aprendizado de máquina da Shopee é de ~15 dias.

## 2. A Matemática Pura: Break-Even ROAS
A conta que separa o lucro do prejuízo baseia-se na "Margem de Contribuição" do lojista (Preço de Venda deduzidos os custos do produto, frete, taxas da Shopee e impostos).
- **Fórmula do ROAS de Empate (Break-Even):** `1 ÷ Margem de Contribuição (decimal)`
- **Exemplo Prático:** Se ao deduzir todos os custos sobrou 25% de margem livre de lucro (0.25). O cálculo é `1 / 0.25 = 4`. 
- **Decisão Lógica:** Se o ROAS da campanha estiver em 4, a campanha "empatou" (pagou a mercadoria e o anúncio). Se o ROAS estiver em 3, a campanha dá **prejuízo líquido** mesmo vendendo. Se o ROAS for 5, a operação é escalável.

## 3. Estratégia Broad Match vs. Exact Match (O Efeito Funil)
- **Fase de Descoberta (Broad Match):** Usada para minerar dados. Você configura palavras abertas. O algoritmo encontra novas variações de busca que o cliente digita. O CPC tende a ser mais caro por lixo cruzado.
- **Fase de Rentabilidade (Exact Match):** Você analisa o relatório de "Termos de Busca" da correspondência ampla, identifica as 3 frases exatas que geraram venda, pausa elas no Broad, e cria uma campanha Exata separada só para elas, com Lances maiores, isolando o ROI positivo sem sangrar verba com buscas erradas.

## 4. Diagnóstico Cruzado de Métricas (Cenários de Avaliação)
- **Cenário A: Alta Impressão, Baixo Clique (CTR Ruim)**
  - *Sintoma:* A vitrine perde pro concorrente.
  - *Ação:* Alterar Imagem Principal urgentemente, rever preço de vitrine e pausar palavras "Amplas" genéricas.
- **Cenário B: Muito Clique, Nenhuma Venda (Conversão Ruim)**
  - *Sintoma:* O cliente entra (gasta seu CPC), mas desiste na tela do produto. O anúncio sangra dinheiro.
  - *Ação:* Melhorar fotos secundárias/descrição e focar desesperadamente em conseguir as primeiras Avaliações (Prova Social).
- **Cenário C: Pouca Impressão (Campanha não roda)**
  - *Sintoma:* Sem escala.
  - *Ação:* Aumentar o CPC da palavra-chave ou usar correspondência ampla.

## 5. Regras de Atribuição (Shopee)
Sempre considere a **Janela de Atribuição de 7 Dias**. O Shopee marca a venda para o Ad se o cliente comprou até 7 dias após o clique inicial. Não pause campanhas precipitadamente.
