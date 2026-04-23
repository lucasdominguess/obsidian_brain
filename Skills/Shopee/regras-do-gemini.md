---
tags:
  - shopee/gemini
  - shopee/regras
---

# Banco de Dados: Instruções do Gemini (Gems)

> **Instrução para o Usuário:** Cole abaixo as regras exatas de persona e dicas que você havia configurado no seu "Gems" do Gemini Web, para centralizar toda a arquitetura de inteligência em um só lugar.

# Análise Estratégica de Crescimento e Rentabilidade na Shopee Brasil: Otimização de Algoritmos e Tráfego Pago para o Ciclo 2026

## Resumo da Performance

A avaliação sistêmica das operações de comércio eletrônico na plataforma Shopee, considerando o horizonte de 2026, revela um cenário de maturidade competitiva onde a eficiência marginal tornou-se o único caminho para a sobrevivência a longo prazo. A performance média observada no mercado brasileiro é classificada como **Regular**, apresentando uma tendência de crescimento de volume (GMV) desacompanhado de lucro líquido real em muitos casos. Embora o tráfego na plataforma continue robusto, com estimativas superando 240 milhões de acessos mensais, a introdução da nova estrutura tarifária em março de 2026 alterou radicalmente o ponto de equilíbrio (Break-even) para a maioria das categorias.

Vendedores que ainda operam sob lógicas obsoletas encontram-se em uma zona de risco financeiro, onde o custo de aquisição de clientes (CAC) via Shopee Ads, somado às comissões que podem atingir 20%, consome a totalidade da margem de contribuição. A transição para um modelo de "Rentabilidade Cirúrgica" exige que o especialista abandone a perseguição por impressões e foque na densidade de lucro por clique.

## Gargalo Identificado: A Panfletagem Digital sem Conversão

O diagnóstico primordial em grande parte das campanhas é que o anúncio "está a panfletar bem, mas não converte". Isso ocorre quando há volume satisfatório de impressões, indicando entrega pelo algoritmo, mas a quebra acontece na transição do clique para a venda ou na ineficiência do ROAS (Return on Ad Spend) frente ao custo fixo. O gargalo central não é a falta de visibilidade, mas a falta de relevância estratégica e a precificação desajustada às novas tarifas de 2026. Muitas contas sofrem com a "erosão silenciosa de margem", onde o ROAS parece positivo no painel, mas o lucro final é nulo após descontar taxas fixas e comissões majoradas.

## Fundamentação Financeira: A Estrutura de Custos de 2026

Para 2026, a Shopee implementou uma política tarifária que incentiva a profissionalização e o aumento do ticket médio.

### Detalhamento das Comissões e Tarifas Fixas

A comissão básica é de 14%, mas a participação no Programa de Frete Grátis adiciona 6%, totalizando 20% de encargo sobre o valor bruto. A taxa fixa por item vendido opera sob as seguintes regras :

|**Tipo de Vendedor**|**Condição / Valor do Item**|**Taxa Fixa por Item**|
|---|---|---|
|CNPJ|Padrão|R$ 4,00|
|CPF|< 450 pedidos / 90 dias|R$ 7,00|
|CPF|> 450 pedidos / 90 dias|R$ 4,00|
|Todos|Item R$ 80,00 a R$ 99,99|R$ 16,00|
|Todos|Item R$ 100,00 a R$ 199,99|R$ 20,00|
|Todos|Item > R$ 200,00|R$ 26,00|

Essa estrutura cria degraus de rentabilidade onde produtos vendidos logo acima de R$ 80,00 podem ser menos lucrativos que itens de R$ 79,99 devido ao salto na tarifa fixa de R$ 4,00 para R$ 16,00.

### O Cálculo de Viabilidade e o Break-even ROAS

O ROAS necessário para a lucratividade deve ser calculado a partir da margem de contribuição líquida. A fórmula fundamental é:

$$Margem \ de \ Contribuição \ \% = \frac{Preço \ de \ Venda - (Custos \ Prod + Impostos + Comissões + Taxas \ Fixas)}{Preço \ de \ Venda}$$

A partir dessa margem, define-se o Break-even ROAS :

$$Break-even \ ROAS = \frac{1}{Margem \ de \ Contribuição \ \%}$$

Se um produto possui margem líquida de 25% após as taxas de 2026, seu Break-even ROAS é 4.0. Qualquer campanha com ROAS inferior a este patamar estará gerando prejuízo operacional.

## Anatomia do Algoritmo Shopee 2026: Fatores de Rankeamento

O algoritmo prioriza agora a relevância contextual e a velocidade de vendas recente sobre o histórico total acumulado. O sistema opera em três dimensões:

1. **Peso do Produto (Product Weight):** Foca na tendência de vendas de 7 dias e na taxa de crescimento de 14 dias. A eficiência de conversão (CTR e CR) é o combustível; o algoritmo concede "tráfego de teste" e mantém a exposição se o CTR for superior a 1,5%.
    
2. **Peso da Loja (Store Weight):** Impacta o custo por clique (CPC). Fatores críticos incluem taxa de resposta no chat (> 90%), envios no prazo e ausência de Pontos de Penalidade.
    
3. **Ranqueamento por Interesse:** Utiliza modelos baseados em comportamento (similar a redes sociais) para personalizar resultados de busca e recomendações em seções como Shopee Video e Descobertas do Dia.
    

## Análise de Funil e Diagnóstico de Métricas

1. **Impressões:** Se baixas, indicam lances (bids) insuficientes ou baixa relevância de palavras-chave. Em 2026, lances manuais próximos ao mínimo de R$ 0,17 raramente ganham leilões em categorias competitivas.
    
2. **Cliques e CTR:** O benchmark de 1,5% de CTR é essencial. CTR baixo indica problemas na imagem de capa, no título (os primeiros 20 caracteres são cruciais) ou no preço em relação à concorrência direta.
    
3. **Conversão (CR):** Muitos cliques sem vendas sugerem problemas na página do produto (falta de avaliações com fotos, descrições incompletas ou falta de estoque em variantes populares).
    

## Gestão de Tráfego Pago: Shopee Ads em Profundidade

### GMV Max: Automação e Metas de ROAS

O GMV Max é a ferramenta padrão para escala automatizada.

- **Auto Bidding:** Recomendado para novos produtos ou "Hero Products" para maximizar volume e acelerar o histórico de vendas.
    
- **Custom ROAS (Meta de ROAS):** Essencial para garantir lucratividade. O sistema ajusta lances para atingir o retorno desejado, descartando leilões com baixa probabilidade de conversão.
    

### Lances Manuais e Negativação

- **Transição Ampla para Exata:** Rodar termos em correspondência ampla por 14 dias e migrar os lucrativos para correspondência exata com lance 25% superior para dominar o topo das buscas.
    
- **Negativação:** Palavras-chave que consomem orçamento sem converter devem ser negativadas ou ter lances reduzidos drasticamente para proteger a margem.
    

## Plano de Ação Executivo

### Passo 1: Auditoria Financeira e Ajuste de Lances

- Aplicar a tabela de taxas de 2026 a cada produto.
    
- Pausar ou ajustar campanhas operando abaixo do Break-even ROAS.
    
- Migrar campanhas GMV Max para "Meta de ROAS" com foco em margem líquida positiva.
    

### Passo 2: Otimização de Conversão (CTR/CR)

- Substituir capas de baixo desempenho para buscar CTR > 1,5%.
    
- Garantir que a palavra-chave principal esteja no início do título.
    
- Incentivar avaliações com fotos e vídeos para aumentar a confiança e conversão na página.
    

### Passo 3: Escalonamento Inteligente

- Aumentar o orçamento de produtos "Hero" de forma gradual (10-15% a cada 3 dias) mantendo o ROAS estável.
    
- Integrar Shopee Video e Live para capturar tráfego de descoberta com CPC reduzido.
    
- Monitorar métricas operacionais diariamente para evitar penalidades que encareçam o tráfego pago.
