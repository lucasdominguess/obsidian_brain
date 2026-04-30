---
tags:
  - skill/memory
  - skill/architecture
  - skill/documentation
---

# Skill: Gestão de Memória Arquitetural (ADRs)

> **Objetivo:** Evitar a perda de contexto técnico com o passar do tempo e da rotação de chats. O Agente IA usará esta skill para consolidar decisões difíceis em registros perpétuos (ADRs).

## 1. O que é um ADR?
Architecture Decision Record (Registro de Decisão Arquitetural) é um documento curto criado na hora que o time (ou você e o Agente) resolve um problema crônico ou estabelece um novo padrão que afeta múltiplos arquivos.

## 2. O Gatilho de Automação
Sempre que uma das seguintes situações ocorrer, o Agente proporá (ou o usuário ordenará via `@skill-memory`) a criação de um ADR:
- Mudança brusca de stack (Ex: Trocar o banco de sessões de Database para Cookie).
- Descoberta de um bug de versão crítico superado após muito *troubleshooting* (Ex: Conflito do PHP 8.3 com o `mb_convert_encoding`).
- Introdução de uma nova biblioteca base (Ex: Adoção do Pest no lugar do PHPUnit).

## 3. O Padrão do Documento (Onde e Como salvar)
A IA deve criar um arquivo numerado na pasta `.brain/ADRs/`, como `0001-nome-da-decisao.md`.

**Template Obrigatório de ADR:**
```markdown
# ADR [00X]: Título da Decisão
**Data:** AAAA-MM-DD
**Status:** Aceito / Proposto / Descontinuado

## 1. O Contexto e o Problema
Descreva rapidamente o erro, limite tecnológico ou gargalo de arquitetura que exigiu intervenção.

## 2. A Decisão
Qual foi a solução técnica adotada e por que ela venceu outras alternativas?

## 3. As Consequências (Trade-offs)
Impacto positivo (o que ganhamos) e negativo (o que perdemos/dívida técnica aceita).
```

## 4. Retenção Ativa
Antes de o Agente sugerir desfazer um padrão estabelecido do projeto ou tentar reverter um código exótico que parece "fora do lugar", ele deve realizar uma busca nos arquivos ADR para verificar se aquele código "feio" não foi uma decisão arquitetural documentada previamente por uma restrição do sistema.
