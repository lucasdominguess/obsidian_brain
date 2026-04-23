---
tags:
  - shopee/notebooklm
  - shopee/docs
---

# Banco de Dados: Notas do NotebookLM

> **Instrução para o Usuário:** Cole abaixo todo o resumo em Markdown gerado pelo Google NotebookLM a partir dos PDFs oficiais da Central do Vendedor que você estudou.

```
# DOCUMENTAÇÃO TÉCNICA MASTER: ARQUITETURA, ALGORITMO E ESCALA - SHOPEE 2026

## 1. Arquitetura Financeira e Precificação Matemática (Regras 2026)
O ecossistema transitou de uma taxa fixa universal para um sistema de cobrança por faixas (Tiers) e removeu o limitador máximo de R$ 100 por item. A entrada no "Programa de Frete Grátis" tornou-se mandatória, embutindo 6% no comissionamento.

**Estrutura de Tiers (Comissão + Tarifa Fixa):**
*   **Faixa 1 (R$ 0,00 a R$ 7,99):** 50% de comissão | R$ 0,00 tarifa fixa.
*   **Faixa 2 (R$ 8,00 a R$ 79,99):** 20% de comissão | R$ 4,00 tarifa fixa.
*   **Faixa 3 (R$ 80,00 a R$ 99,99):** 14% de comissão | R$ 16,00 tarifa fixa.
*   **Faixa 4 (R$ 100,00 a R$ 199,99):** 14% de comissão | R$ 20,00 tarifa fixa.
*   **Faixa 5 (Acima de R$ 200,00):** 14% de comissão | R$ 26,00 tarifa fixa.

**Taxas de Risco e Variáveis Adicionais:**
*   **Penalidade Operacional (CPF):** Contas de Pessoa Física com >450 pedidos/90 dias ou GMV superior ao teto do MEI (R$ 81.000/ano) sofrem adição de **+ R$ 3,00 na tarifa fixa por item**. O sistema força o Split Payment (tributação na fonte) para regularizar vendedores via CNPJ.
*   **Campanhas de Destaque (Spike Days):** Adiciona **+2,5% a +3%** de taxa sobre TODO o faturamento da loja durante o evento, não apenas nos SKUs promocionados.

**Fórmula Fundamental: Break-Even ROAS (ROAS de Empate)**
Nunca inicie campanhas sem calcular o Break-even ROAS.
`Margem de Contribuição = Preço de Venda - (Custo do Produto + Comissão + Tarifa Fixa + Impostos + Embalagem)`
`Break-Even ROAS = Preço de Venda / Margem de Contribuição Líquida` ou `1 / Margem de Lucro %`
Se a margem líquida for 20%, o Break-Even ROAS é 5.0. Qualquer ROAS < 5.0 = queima de caixa.

> **CRÍTICO - Erros de Precificação e Escala a Evitar:**
> ❌ **Vender ticket baixo unitário:** Vender um item a R$ 6,00 é engolido pela Faixa 1 (50%).
> ✅ **O Hack dos Kits:** Agrupar itens de baixo ticket num Bundle (ex: 5 produtos de R$ 6 = R$ 30). Isso empurra o SKU para a Faixa 2 (20% + R$ 4), diluindo a taxa fixa por unidade (cai de R$ 3,00 unitário para R$ 0,80 unitário).
> ❌ **Zona de Fronteira:** Vender a R$ 80,00 (Faixa 3) gera R$ 27,20 em taxas. Vender a R$ 79,99 (Faixa 2) gera R$ 20,00. Um centavo a mais custa R$ 7,20 em margem.

## 2. Mapeamento e Gestão de Fornecedores (Nicho de Beleza/Cosméticos)
A lógica de *Supply Chain* eficiente para iniciantes com baixo orçamento não envolve grandes importações, mas sim Cross-Docking local ou revenda com validade rápida.

**Estratégias de Prospecção:**
*   **Mapeamento Geográfico Reverso:** Utilize o Google Maps buscando por "Distribuidoras de Cosméticos", "Fábrica de Cosméticos", ou "Atacado de Maquiagem" na sua região. Ex: "Paraíba Utilidades", "Alpha Distribuidora".
*   **A Abordagem Local:** Visite distribuidores atacadistas físicos e negocie a compra de pequenos lotes semanais (Cross-Docking Local). O capital não fica imobilizado; você minera as fotos, sobe no catálogo da Shopee e, ao vender, vai até o atacado buscar.
*   **Engenharia Reversa por Demanda:** Não compre o produto para depois achar o público. Use *Central do Vendedor > Informações Gerenciais > Assistente de Vendas > Palavras-chave mais procuradas*. Identifique um termo em alta (ex: "Kit Skincare", "Sérum Facial") e só então vá ao fornecedor local buscar cotação de mercado (break-even).

> **CRÍTICO - Riscos em Modelos de Suprimento:**
> ❌ **Dropshipping Nativo:** Altamente não recomendado para iniciantes na Shopee. A plataforma possui SLAs de postagem agressivos. Se o fornecedor chinês ou atacadista atrasar 24h, sua loja sofre Pontos de Penalidade, bloqueio de alcance e banimento em potencial.
> ✅ **Estoque Terceirizado Controlado:** Mantenha a operação na sua mão. Se for terceirizar, o atacadista deve estar na sua cidade para que você faça o recolhimento (picking) imediato e o despacho nas agências locais da Shopee Xpress (Drop Nacional auditado).

## 3. Otimização de Catálogo e Algoritmo de Conversão (Listing/SEO)
O Shopee Ads não é um gerador de vendas, é um potencializador de exposição. A responsabilidade da conversão (CR) é inteiramente da estrutura do anúncio. O algoritmo prioriza produtos que geram mais receita por impressão.

**Hierarquia de Otimização Visual e SEO:**
*   **Proporções:** Utilize imagens 3:4 (Mobile). Elas ocupam maior porcentagem de espaço na tela do aplicativo, inibindo a rolagem do usuário e aumentando a CTR.
*   **A "Capa Quebra-Objeção":** Em cosméticos e beleza, a foto 1 deve evidenciar a dor sanada. Não use fotos neutras de fornecedor. Aplique texto/selos visuais como "Efeito Matte", "Secagem Rápida", ou "Dermatologicamente Testado".
*   **Vídeo Overlap:** O motor da Shopee automaticamente sobrepõe vídeos (até 30MB/60s) às imagens de capa. Vídeos com estética "UGC (User Generated Content) / Caseiro" mostrando a textura de cremes ou aplicação de maquiagem convertem drasticamente mais do que renders 3D.
*   **SEO de Título:** Siga a sintaxe primária: `[Produto] + [Marca] + [Atributos Principais/Cor] + [Benefício/Dor Sanada]`. *Ex: Sérum Facial Clareador Vitamina C Antimanchas Ácido Hialurônico SkinCare.*

## 4. Domínio de Shopee Ads (Tráfego Pago Otimizado)
Opera em um modelo híbrido de leilão de Custo por Clique (CPC) restrito por janelas de atribuição (7 dias para cliques, 1 dia para views no GMV Max).

**Tipologias de Campanhas:**
*   **Busca de Produto (Search Ads):** Foco em conversão direta. Aparece nos resultados orgânicos baseados em palavras-chave.
*   **Descoberta (Discovery Ads):** "Você também pode gostar". Foco em escala ou recomendação. Excelente para testar tráfego em produtos recém-lançados (sem provas sociais).

**GMV Max vs. Lance Manual:**
*   **GMV Max (Lance Automático):** Força escala bruta de alcance. Destrói orçamentos rapidamente se não controlado. Bom para coleta inicial de dados.
*   **GMV Max (Meta de ROAS):** Age como um pêndulo. Meta de ROAS baixa = alcance alto, lucro mínimo. Meta de ROAS alta = restrição de entrega apenas para compradores de alta probabilidade (Top 20% do funil).
*   **Lance Manual (O Controle de Margem):**
    *   **Ampla:** O anúncio exibe para sinônimos. Ideal para *Machine Learning* inicial e descobrir termos de busca long-tail.
    *   **Exata:** Exibição literal. CPC costuma ser menor em palavras específicas validadas.

> **CRÍTICO - Pipeline Operacional de Ads (Proteção de Caixa):**
> ❌ **Orçamento Ilimitado / Mexer na Janela de Aprendizado:** Nunca deixe *Budget* livre. Não modifique lances, nem pause anúncios nos primeiros 7 a 15 dias; isso "reseta" o Machine Learning do algoritmo e joga fora os dados comprados.
> ❌ **Apego a Palavras-chave Genéricas:** Se "Maquiagem" consome R$ 30 por dia com CTR alta mas CVR zero, exclua.
> ✅ **O Processo (HACK de Extração):** Exporte a planilha de relatórios da campanha manual (em Ampla). Identifique nas colunas quais termos secundários ("Direct Conversions") geraram vendas. Pegue os termos que possuem ROAS > Break-even, negative-os na Ampla e isole-os em campanhas EXATAS, aumentando o CPC em 25% para garantir a pole position por um custo absurdamente menor e altamente lucrativo.

## 5. Macetes e Estratégias Avançadas de Tração
*   **Métrica Direct vs. Padrão (Efeito Halo):** Leia seus dados via painel. *Direct GMV* reflete o SKU clicado. O *Efeito Halo* reflete o usuário que clicou no Batom A, e comprou o Batom B e o Rímel C. O Ads serve para jogar tráfego na raiz do seu catálogo.
*   **Combo & Leve Mais Por Menos:** Ferramentas gratuitas essenciais. Vender cosmético exige Cross-Sell. Crie descontos de níveis (Leve 3 ganhe 3% / Leve 4 ganhe 5%). Isso força aumento no LTV (Ticket Médio), fazendo uma única taxa fixa de R$ 4 ser diluída no pedido agrupado.
*   **O Hack da Transmissão por Chat:** Em `Central de Marketing > Transmissão por Chat > Lembrete de Carrinho de Compras`. Extraia o público que "adicionou e não pagou" e configure um disparo de mensagem proativo oferecendo um Cupom Exclusivo Invisível (Hidden Code, ex: 5% OFF). A CVR dessa ação passa de 5%.
*   **Impulsionar Orgânico (Botão de 4/4h):** Na aba Produtos, você pode impulsionar 5 itens a cada 4 horas no topo orgânico da categoria, atraindo tráfego limpo a custo zero.

## 6. Plano de Ação de 30 Dias (Operação e Baixo Custo)

*   **Semana 1: Infraestrutura, Supply e SEO Inicial**
    *   *Ação:* Mapeamento de 3 atacadistas/distribuidores locais de cosméticos e cabelos. Solicitação de catálogo.
    *   *Ação:* Calculadora Break-even. Planilhar custos reais e taxas 2026. Só separar SKUs que entreguem ROAS de empate aceitável (< 7.0).
    *   *Ação:* Criar catálogos imersivos. Capa com CTA (Dor principal atacada), proporção 3:4, vídeo caseiro e descrições formatadas em tópicos. Iniciar cadastro agrupado (Kits de maquiagem).
*   **Semana 2: Testes e Coleta de Inteligência**
    *   *Ação:* Iniciar anúncios com Orçamento Limitado (R$ 8 a R$ 15 diários/SKU).
    *   *Ação:* Ativar "Busca de Produtos" Manual (Correspondência Ampla, lance mínimo R$ 0,11) focando nas 10 principais palavras da ferramenta de Assistente de Palavras-chave.
    *   *Ação:* Ativar ferramentas gratuitas: Leve Mais por Menos, combos de produtos correlatos (Shampoo + Condicionador) e configurar 1 Cupom de Loja atrelado ao Ticket Médio em dobro.
*   **Semana 3: Phase de Maturação e Atendimento**
    *   *Ação:* Regra dos 7 Dias. **NÃO MEXER NA CAMPANHA DE ADS**. Deixar o Machine Learning ler o público.
    *   *Ação:* Ativar rotina de 4 em 4 horas do botão "Impulsionar" (orgânico).
    *   *Ação:* Foco extremo no chat. Enviar a primeira "Transmissão por Chat" para prospectos de carrinhos pendentes com gatilho de escassez e cupom VIP.
*   **Semana 4: Auditoria Hardcore e Escala Vertical**
    *   *Ação:* Exportar relatório de métricas em Excel (Separar via Dados > Texto para Colunas).
    *   *Ação:* Identificar palavras (Ampla) que geraram ROAS alto e faturamentos. Migrar os termos rentáveis para "Correspondência Exata" e aumentar lances.
    *   *Ação:* Identificar SKUs com CTR baixa e corrigir capas. Identificar CVR baixas e alterar preço ou descrições.
    *   *Ação:* Direcionar lucros brutos para os "vencedores" da rodada (Ads focados apenas nos SKUs rentáveis), pausando anúncios em vermelho (ROAS < Break-even).
```
