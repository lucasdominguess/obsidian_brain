---
tags:
  - skill/infra
  - skill/devops
  - skill/deploy
---

# Skill: Engenharia de Plataforma e Infraestrutura (DevOps)

> **Objetivo:** Garantir que o Agente IA seja autossuficiente para levantar, debugar e fazer o deploy do ambiente da aplicação de forma isolada e idêntica à produção.

## 1. Bootstrapping (Inicialização do Zero)
Sempre que o Agente iniciar o desenvolvimento em um projeto "fresco", ele deve ser capaz de seguir estes passos sem perguntar ao usuário:
1. **Verificação de Dependências:** Confirmar se `composer.json` e `package.json` existem.
2. **Ambiente `.env`:** O Agente deve analisar se o arquivo `.env` existe. Caso não, gerar a partir de `.env.example`. 
   - *Regra SecOps:* Nunca hardcode chaves reais no `.env.example`.
3. **Serviços Nativos:** Executar `npm run dev` para garantir que o Vite compile os assets para o Frontend Vanilla/Blade. Iniciar o backend via Docker (`docker compose up -d`) ou PHP artisan serve.

## 2. Padrões de Deploy (Render & Docker)
O ecossistema oficial de deploy é focado em containers (Docker) hospedados no Render:
- **Dockerfile Multi-stage:** A compilação sempre deve ser dividida em passos lógicos: dependências (Composer/Node) -> Build (Vite) -> Runtime (PHP-FPM/Alpine).
- **Sem persistência no container:** Os containers são *stateless* e *ephemeral*. Drivers locais como `SESSION_DRIVER=file` não devem ser usados em produção a longo prazo (ideal: `cookie` ou `redis` ou `database`).
- **Nginx e PHP-FPM:** O Agente deve saber debugar arquivos de conf (`nginx.conf`, `php.ini` otimizado para produção) e usar logs do Render em caso de erro 500 sem corpo (fatal errors).

## 3. Gestão de Variáveis de Ambiente
- Toda variável nova incluída no código (`env('NOVA_API_KEY')`) deve **obrigatoriamente** ser adicionada ao `.env.example` pela IA, para que o setup do projeto não quebre no futuro.
- A configuração dos serviços externos na nuvem (ex: Render Dashboard) é feita pelo usuário, mas o Agente deve instruí-lo ativamente sobre quais variáveis precisam ser preenchidas antes do deploy.
