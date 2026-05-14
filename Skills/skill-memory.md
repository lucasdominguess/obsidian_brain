---
tags:
  - skill/memory
  - skill/architecture
  - skill/documentation
---

# Skill: Gestao de Memoria Arquitetural (ADRs)

> **Objetivo:** Evitar a perda de contexto tecnico com o passar do tempo e da rotacao de chats. O agente usara esta skill para consolidar decisoes importantes em registros duraveis.

## 1. O que e um ADR?

Architecture Decision Record e um documento curto criado quando o time ou o agente resolve um problema cronico ou estabelece um padrao que afeta multiplos arquivos.

## 2. Gatilhos de automacao

Sempre que uma das situacoes abaixo ocorrer, o agente deve propor ou criar um ADR:

- Mudanca brusca de stack.
- Descoberta de bug critico de versao depois de troubleshooting.
- Introducao de nova biblioteca base.
- Decisao que afeta multiplos projetos, agentes ou workflows.
- Mudanca no protocolo de start inicial do Brain ou MCP.

## 3. Onde salvar

A IA deve criar um arquivo numerado na pasta `ADRs/` do Obsidian Brain, usando o MCP ou o `BRAIN_ROOT` configurado.

Exemplo:

```text
ADRs/0001-nome-da-decisao.md
```

Nao use `.brain/ADRs/` como caminho principal. Esse formato pertence ao fluxo legado com symlink.

## 4. Template obrigatorio

```markdown
# ADR [00X]: Titulo da Decisao
**Data:** AAAA-MM-DD
**Status:** Aceito / Proposto / Descontinuado

## 1. O Contexto e o Problema
Descreva rapidamente o erro, limite tecnologico ou gargalo de arquitetura que exigiu intervencao.

## 2. A Decisao
Qual foi a solucao tecnica adotada e por que ela venceu outras alternativas?

## 3. As Consequencias (Trade-offs)
Impacto positivo e negativo da decisao.
```

## 5. Retencao ativa

Antes de sugerir desfazer um padrao estabelecido ou reverter codigo que parece fora do lugar, o agente deve buscar nos ADRs para verificar se aquilo foi uma decisao arquitetural documentada.
