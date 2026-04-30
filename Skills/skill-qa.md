---
tags:
  - skill/qa
  - skill/tests
  - skill/tdd
---

# Skill: Engenharia de Qualidade (QA & TDD Automático)

> **Objetivo:** Instrumentalizar a IA para atuar ativamente na construção e execução de testes automatizados, garantindo que o código escrito não quebre contratos legados e funcione de primeira.

## 1. Regra de Ouro (TDD por Padrão)
A partir da adoção desta skill, o Agente de IA assumirá uma mentalidade de **Test-Driven Development (TDD)**:
- Antes de refatorar uma Service ou criar um Controller complexo, o Agente perguntará ao usuário: *"Posso escrever o teste desta feature primeiro?"*.
- Se aprovado, o Agente escreve a suíte de testes. O teste obrigatoriamente vai falhar. O Agente então refatora o código de produção até que o teste passe.

## 2. Padrão de Framework: Pest PHP
Todos os testes em projetos PHP modernos (Laravel) devem usar a sintaxe limpa do **Pest**:
- `it('should do something', function () { ... });` ou `test('...')`.
- Agrupar testes correlatos usando `describe()`.
- Usar a API fluent do Pest (ex: `expect($value)->toBeTrue()`).

## 3. Topologia de Testes
O projeto respeita uma pirâmide clara:
1. **Unit Tests (Camada de Domínio / Services):** Isolar acesso a banco de dados (mocking se necessário), focando na lógica matemática/regra de negócio da Service.
2. **Feature Tests (Controllers & APIs):** Testar requisições HTTP (`$this->postJson()`), validações (`FormRequests`), respostas com Status Code correto, e mutação no banco de dados usando a trait `RefreshDatabase`.
3. **Factories:** O Agente deve utilizar exaustivamente Model Factories do Laravel para provisionar dados nos testes, evitando *hardcoded arrays* longos.

## 4. O Fluxo de Auto-Validação
- A IA deve propor usar a tool de terminal para rodar `./vendor/bin/pest` automaticamente após finalizar blocos grandes de código.
- Se o teste falhar por motivos que a própria IA consegue interpretar (ex: erro de tipagem), a IA tem permissão para corrigir o código de forma autônoma antes de devolver a resposta final ao usuário.
