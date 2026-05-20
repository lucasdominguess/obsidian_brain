# Plano de Construção — SellerFlow

> Documento de planejamento conceitual. Sem decisões de código.
> Escopo: MVP para uma única loja vendendo em marketplaces, com gestão de estoque e financeiro de fluxo de caixa + contas a pagar/receber.

---

## 1. Visão geral

O sistema é uma ferramenta interna de gestão para um pequeno seller de marketplaces. Ele não substitui o painel da Shopee — substitui as planilhas que o lojista usa hoje para responder três perguntas:

1. **O que eu tenho?** — quanto de cada produto está em estoque.
2. **O que eu vou receber e o que eu preciso pagar?** — contas em aberto, datas e valores.
3. **Quanto sobra no fim do mês?** — fluxo de caixa real (entrada vs. saída) e saldo.

A ideia central é que **toda movimentação operacional (compra ou venda) gera automaticamente impacto em estoque e em financeiro**, sem precisar de lançamento duplicado. O lojista cadastra a venda uma vez — o sistema dá baixa no estoque e cria a conta a receber. Cadastra a compra uma vez — o sistema entra com o produto e cria a conta a pagar.

---

## 2. Decisões do MVP (já definidas)

| Tema | Decisão |
|---|---|
| Escopo financeiro | Fluxo de caixa + contas a pagar/receber (com vencimentos e status) |
| Custo do produto | **Não calcular** custo médio nem margem nessa versão |
| Canais de venda | Apenas marketplaces (Shopee como primeiro alvo) |
| Multi-loja | **Uma loja só.** Modelar pensando em multi-loja no futuro, mas sem implementar |
| Integração Shopee | Fora do MVP — vendas e compras entram manualmente por enquanto |

---

## 3. Módulos do sistema

### 3.1. Contas e perfis
**Responsabilidade:** quem usa o sistema e o que cada um pode fazer.

- **Usuário** — quem faz login (dono, funcionário do estoque, financeiro).
- **Perfil/Permissão** — define o que cada usuário enxerga e altera. No MVP, perfis simples: *admin* (tudo), *operacional* (só movimentação e estoque), *financeiro* (só contas e fluxo).
- **Loja** — entidade única no MVP, mas modelada como tabela própria (não hardcoded) para abrir caminho para multi-loja depois.
- **Marketplace** — Shopee, Mercado Livre, etc. Vinculado à loja. Toda venda referencia em qual marketplace ocorreu (importante para conferência de repasse).

> **Observação sobre nomes:** seu diagrama usa "users", "Loja", "MarketPlace" — está bom. Eu adicionaria também "Perfil" (ou "Papel") como entidade separada para não amarrar permissão direto no usuário.

### 3.2. Cadastros auxiliares (suas "listas suspensas")
**Responsabilidade:** alimentar os campos de seleção das outras telas. São tabelas que mudam pouco mas precisam existir antes de qualquer movimentação.

- **Produto** — SKU, nome, descrição, unidade, código de barras (opcional). Sem custo ainda.
- **Fornecedor** — quem você compra. Nome, contato, dados de pagamento (PIX/conta).
- **Categoria de produto** — para agrupar nos relatórios de estoque.
- **Categoria financeira** — para classificar saídas que não são compra de produto (aluguel, embalagem, taxa de marketplace, frete, etc.). Isso vai ser **fundamental** no fluxo de caixa para separar "custo de mercadoria" de "custo operacional".
- **Forma de pagamento / recebimento** — PIX, boleto, transferência, cartão de crédito (com nº de parcelas), repasse de marketplace. Define como a conta a pagar/receber se comporta.

> **Falta no seu diagrama:** "Categoria financeira" e "Forma de pagamento". São as duas peças que mais ajudam a organizar o financeiro depois.

### 3.3. Movimentação — Compra
**Responsabilidade:** registrar entrada de mercadoria.

Uma compra tem:
- Fornecedor, data, número da nota (opcional).
- Lista de itens (produto + quantidade + valor unitário).
- Forma de pagamento e parcelamento (à vista, 30 dias, 2x, etc.).

Quando salva, a compra dispara dois efeitos:
1. **Estoque:** soma a quantidade comprada de cada produto.
2. **Financeiro:** cria uma ou mais **contas a pagar** conforme o parcelamento, com vencimentos calculados.

### 3.4. Movimentação — Venda
**Responsabilidade:** registrar saída de mercadoria vendida em marketplace.

Uma venda tem:
- Marketplace de origem, data, número do pedido no marketplace.
- Lista de itens (produto + quantidade + valor de venda).
- Valor de frete e taxas do marketplace (entram como desconto no que será recebido).
- Previsão de repasse (data em que o marketplace deposita).

Quando salva, a venda dispara dois efeitos:
1. **Estoque:** subtrai a quantidade vendida.
2. **Financeiro:** cria uma **conta a receber** com a data prevista de repasse e o valor líquido (já descontando taxas).

> **Detalhe importante:** o valor que cai na conta não é o valor da venda — é venda menos taxa do marketplace menos frete patrocinado. Modelar isso desde o começo evita bagunça no fluxo de caixa.

### 3.5. Estoque
**Responsabilidade:** saber a posição atual de cada produto.

- **Saldo por produto** — calculado a partir das movimentações (não armazenado como número fixo, para evitar divergência).
- **Histórico de movimentações** — toda entrada/saída fica registrada com origem (compra X, venda Y, ajuste manual Z).
- **Ajuste manual de estoque** — perda, quebra, contagem física. Gera movimentação de tipo "ajuste" para auditoria.
- **Alerta de estoque mínimo** (opcional no MVP) — produto com saldo abaixo de um limite.

### 3.6. Financeiro
**Responsabilidade:** controlar o que entra, o que sai e quando.

Três blocos:

**a) Contas a pagar**
- Geradas automaticamente por compras.
- Também podem ser lançadas manualmente (custo operacional: aluguel, internet, embalagem).
- Campos: descrição, categoria financeira, fornecedor (opcional), valor, vencimento, status (*pendente / pago / atrasado*), data de pagamento, forma de pagamento.

**b) Contas a receber**
- Geradas automaticamente por vendas.
- Campos: pedido de origem, marketplace, valor bruto, taxas, valor líquido, previsão de recebimento, status, data de recebimento real.
- Diferença entre previsão e recebimento real é informação valiosa (atraso de repasse).

**c) Fluxo de caixa**
- **Não é uma tabela** — é uma visão consolidada que o sistema monta a partir de contas a pagar (status=pago) e contas a receber (status=recebido), agrupadas por dia/semana/mês.
- Mostra: saldo inicial, entradas, saídas, saldo final do período.
- Tem também a **projeção**: somando o que está *pendente* nos próximos N dias, qual será o saldo previsto.

> **Custo operacional** (que aparece solto no seu diagrama) **não é um módulo separado** — é apenas uma *categoria financeira* dentro de contas a pagar. Recomendo eliminar como caixinha própria para simplificar.

---

## 4. Fluxos principais (como tudo se conecta)

```
COMPRA cadastrada
    ├─→ entra no ESTOQUE (+quantidade)
    └─→ cria CONTA A PAGAR (1 ou N parcelas)
                └─→ quando marcada como paga, vira SAÍDA no fluxo de caixa

VENDA cadastrada
    ├─→ sai do ESTOQUE (-quantidade)
    └─→ cria CONTA A RECEBER (valor líquido, data prevista)
                └─→ quando marcada como recebida, vira ENTRADA no fluxo de caixa

DESPESA OPERACIONAL lançada manualmente
    └─→ cria CONTA A PAGAR (categoria: operacional)
                └─→ quando paga, vira SAÍDA no fluxo de caixa
```

A regra de ouro: **fluxo de caixa só conta o que efetivamente foi pago/recebido.** O que está pendente vai pra projeção, não pro saldo real. Isso evita confundir "vendi" com "recebi".

---

## 5. O que fica explicitamente fora do MVP

Anotar para não cair na tentação de incluir:

- Custo médio de produto, margem de lucro, DRE.
- Integração com API da Shopee (vendas entram manuais).
- Multi-loja em produção (modelagem permite, telas não suportam).
- Notas fiscais, emissão de boleto, conciliação bancária automática.
- App mobile.
- Relatórios avançados (BI, gráficos complexos). MVP terá só listagens e o fluxo de caixa básico.

---

## 6. Roadmap futuro (ordem sugerida depois do MVP)

1. **Integração Shopee** — importar vendas automaticamente. Isso muda a tela de venda (passa a ser "conferir e confirmar" em vez de "cadastrar").
2. **Custo médio + margem** — adicionar custo no produto e calcular margem por venda. Aqui entra DRE simplificado.
3. **Multi-loja** — habilitar nas telas e ajustar relatórios para filtrar/consolidar por loja.
4. **Mais marketplaces** — Mercado Livre, Amazon. Cada um com suas particularidades de taxa e prazo de repasse.
5. **Conciliação de repasse** — comparar o que o marketplace efetivamente depositou com o que o sistema previa. Identifica diferença de taxa, estorno, etc.

---

## 7. Resumo das sugestões em cima do seu diagrama

- ✅ **Manter:** users, Loja, MarketPlace, Produto, Fornecedor, Compra, Venda, Estoque, Fluxo de caixa.
- ➕ **Adicionar:** Perfil/Permissão, Categoria de produto, **Categoria financeira**, **Forma de pagamento**, **Conta a pagar**, **Conta a receber**.
- ➖ **Remover (ou repensar):** "Custo operacional" como módulo — vira categoria dentro de Conta a pagar.
- 🔁 **Renomear (sugestão):** "Movimentação" pode virar dois módulos separados na navegação ("Compras" e "Vendas") — usuário pensa nessas operações como coisas distintas, mesmo que internamente compartilhem estrutura.
