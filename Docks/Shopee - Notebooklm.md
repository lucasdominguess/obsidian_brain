```
# Resumo Analítico: Arquitetura, Performance e Regras de Negócios Shopee 2026

## 1. Arquitetura Financeira e Tributária (Regras de Negócio 2026)
A estrutura de custos sofreu uma refatoração severa em 2026. O modelo transitou de taxas fixas genéricas para um sistema híbrido variável + fixo com escalonamento por faixas (Tiers).

*   **Matriz de Comissionamento (Março/2026):**
    *   *Faixa 1 (Até R$ 7,99):* 50% de comissão | R$ 0,00 tarifa fixa.
    *   *Faixa 2 (R$ 8,00 a R$ 79,99):* 20% de comissão | R$ 4,00 tarifa fixa.
    *   *Faixa 3 (R$ 80,00 a R$ 99,99):* 14% de comissão | R$ 16,00 tarifa fixa.
    *   *Faixa 4 (R$ 100,00 a R$ 199,99):* 14% de comissão | R$ 20,00 tarifa fixa.
    *   *Faixa 5 (Acima de R$ 200,00):* 14% de comissão | R$ 26,00 tarifa fixa.
*   **Fim do Teto de Comissão:** O limitador rígido de R$ 100,00 por item foi depreciado. Comissões agora escalam linearmente com o preço (ex: Produto de R$ 2.000 = R$ 280 de comissão).
*   **Programa de Frete Grátis:** Tornou-se mandatório (default). O subsídio de frete (R$ 20 a R$ 40) é custeado em 75% pela plataforma.
*   **Taxa de Risco Operacional (CPF):** Vendedores pessoa física com mais de 450 pedidos/90 dias sofrem um *penalty* de +R$ 3,00 na tarifa fixa de cada faixa.
*   **Split Payment (Adequação Tributária):** O repasse do tributo (CBS/IBS) passa a ser retido no momento do *checkout* (Gateway), impossibilitando a postergação do fluxo de caixa para o dia 20 do mês seguinte.
*   **Subsídio PIX:** Desconto de 5% (R$ 80-499) a 8% (>R$ 500) bancado integralmente pela plataforma (não afeta o repasse líquido do seller).

> Importante: Padrões de Precificação
> ❌ **Anti-pattern (Padrão Ruim):** Precificar produtos de baixo ticket unitário (ex: R$ 6,00) de forma avulsa, sendo absorvido pela comissão de 50% (Faixa 1). Ignorar a fronteira das faixas (ex: vender a R$ 80,00 pagando R$ 27,20 de taxas, ao invés de R$ 79,99 pagando R$ 20,00).
> ✅ **Design Pattern (Padrão Positivo):** Agrupar produtos de baixo ticket em Kits (Bundles) para forçar o ingresso na Faixa 2, diluindo a taxa fixa. Utilizar a fórmula de *Break-even ROAS* (`Preço de Venda / Margem de Contribuição`) antes de injetar qualquer capital em Ads.

## 2. Engenharia e Otimização de Tráfego Pago (Shopee Ads)
O Shopee Ads é um sistema de leilão (Bidding) baseado em CPC (Custo por Clique) com janelas de atribuição estritas (7 dias para clique, 1 dia para view no GMV Max).

*   **Tipologias de Injeção de Tráfego:**
    *   *Search Ads (Busca):* Foco em intenção (Fundo de funil). Baseado em correspondência Ampla (Broad) ou Exata (Exact).
    *   *Discovery Ads (Descoberta):* Foco em recomendação (Topo/Meio de funil). Ideal para cross-selling e lançamentos.
    *   *Shop Ads (Busca da Loja):* Foco em branding. Direciona o tráfego para a raiz do catálogo.
*   **Modelos de Bidding (GMV Max vs. Manual):**
    *   *GMV Max (Lance Automático):* Foco em escala bruta e impressões (Top 20% de exposição). Alto consumo de *budget*.
    *   *GMV Max (Meta de ROAS):* Foco em rentabilidade algorítmica. ROAS menor = mais exposição; ROAS maior = menos alcance, maior lucro por conversão.
    *   *Lance Manual:* Controle granular. Permite manipulação cirúrgica do CPC por palavra-chave.
*   **Métricas de Telemetria:**
    *   *Diretas vs. Halo:* Métricas "Diretas" contam apenas a conversão do SKU anunciado. O "Efeito Halo" (Métricas Padrão) contabiliza compras cross-SKU no catálogo.
    *   *ACOS (Advertising Cost of Sales):* Relação inversa ao ROAS (`Despesa / Receita * 100`).

> Importante: Pipeline de Otimização de Ads
> ❌ **Anti-pattern (Padrão Ruim):** Iniciar campanhas em modo totalmente automático sem limite de orçamento (Infinite Budget). Manter palavras-chave com ROAS abaixo do *Break-even* (prejuízo). Pausar campanhas antes de completar a janela de aprendizado algorítmico (7 a 15 dias).
> ✅ **Design Pattern (Padrão Positivo):** Estruturar *caps* diários (ex: R$ 10 a R$ 15/SKU). Extrair palavras-chave vencedoras da correspondência "Ampla" e isolá-las em "Exata" com lances maiores (+25%) para garantir posição premium com menor CPC. Escalar campanhas (aumentar orçamento diário) exclusivamente em SKUs com ROAS operando acima do ponto de equilíbrio.

## 3. Arquitetura de Catálogo e Conversão (SEO e Listing)
O ranqueamento orgânico é consequência direta de uma estrutura de anúncio otimizada (Alta Taxa de Conversão > Volume de Vendas > Relevância).

*   **Hierarquia de Conversão:**
    *   *Capa (Thumb):* Responsável pelo CTR inicial. Deve conter conexão direta com a dor/solução (ex: selos visuais, quebra de objeção visual).
    *   *Proporções Visuais:* Formato 1:1 (Desktop) e 3:4 (Mobile).
    *   *Vídeo:* Obrigatório. O motor da Shopee sobrepõe automaticamente vídeos nas capas estáticas para alavancar a retenção.
*   **Hierarquia de Indexação (SEO):**
    *   *Sintaxe do Título:* `[Tipo de Produto] + [Marca] + [Atributos/Soluções]`. (Max: 120 caracteres, target: 100).
    *   *EAN / GTIN:* Essencial para espelhamento do produto em Google Shopping e Facebook Ads via integração nativa da Shopee.
*   **Ferramentas de Tração Nativas:**
    *   *Leve Mais Por Menos / Combo:* Ferramentas de *Upsell* nativas para aumentar o ticket médio (LTV momentâneo) e absorver o impacto das taxas fixas.
    *   *Transmissão por Chat:* Gatilhos de recuperação de carrinho abandonado com injeção de cupons exclusivos (ex: 5% OFF).

> Importante: Qualidade do Catálogo
> ❌ **Anti-pattern (Padrão Ruim):** Fazer *Clickbait* na imagem de capa (ex: colocar foto de 10 itens com preço de 1 item), gerando alta taxa de rejeição posterior e avaliações negativas. Utilizar descrições massivas em texto não formatado.
> ✅ **Design Pattern (Padrão Positivo):** Descrições sumarizadas (Bullet points). Imagens ambientadas que quebram objeções (ex: dimensões reais, textura). Precificação validada no mercado antes da injeção de Ads (o Ads não converte produto fora de mercado).

## 4. Governança Operacional e Escala Logística
A operação sistêmica requer contingências para evitar *penalties* que bloqueiam o alcance da loja.

*   **Prevenção de Chargebacks Logísticos:**
    *   *Tolerância de Peso/Cubagem:* Adicionar *buffer* de redundância de +2cm nas dimensões da caixa e +200g no peso. Divergências com a balança da transportadora geram cobrança da diferença diretamente no saldo do vendedor.
*   **Fluxo de Despacho (Fulfillment):**
    *   *Correios vs. Shopee Xpress:* A transição para a malha proprietária (Xpress) exige obrigatoriamente a emissão de Nota Fiscal (NFe).
    *   *Documentação:* Uso de impressoras térmicas (ZPL) com a DANFE Simplificada condensada junto à etiqueta de envio agiliza radicalmente o *picking* e *packing*.
*   **Modelagem de Supply Chain:**
    *   *Cross-docking Local / Revenda:* Validado e escalável.
    *   *Dropshipping:* Não homologado de forma nativa e de alto risco devido às políticas de SLA de postagem rigorosas da plataforma (gera banimento).

> Importante: Infraestrutura e Governança
> ❌ **Anti-pattern (Padrão Ruim):** Tentar escalar faturamento operando no CPF, correndo o risco de congelamento de saldo e bloqueio via malha fina governamental (Split Payment). Operar sem um ERP centralizado (Single Source of Truth).
> ✅ **Design Pattern (Padrão Positivo):** Migração antecipada para MEI/ME (CNPJ) para acessar taxas fixas menores e malha logística avançada (Shopee Xpress/Full). Integração via API com ERPs de mercado (Bling/Tiny) para sincronia de estoque *Omnichannel* e disparo de Notas Fiscais em lote.
```