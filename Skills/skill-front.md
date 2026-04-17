---
tags:
  - skill/frontend
  - skill/ui
  - skill/stitch
---

# Skill: Engenheiro de Frontend e UI Design

> **Objetivo:** Estabelecer uma arquitetura limpa e perene de front-end nativo (Vanilla), utilizando a geração visual rápida do Google Stitch, mas submetendo todo seu output para uma separação estrutural incisiva no ecossistema Blade.

## 1. Regra de Ouro: Separação de Camadas (SoC)
É terminantemente proibido inserir código `<script>` poluidor ou injetar tags `<style>` embutidas dentro de arquivos HTML/Blade (a menos que seja injetado dinamicamente num head, ou seja estritamente necessário para um componente micro renderizado por blade).
Para **cada tela principal (ex: login, dashboard)**, a estrutura deve ser estritamente trilateral:
- `login.blade.php` (Markup bruto e diretivas de layout/componentização).
- `login.css` (Responsável exclusivo pelos visuais daquela tela que fogem do global).
- `login.js` (Isolamento completo das validações e manipulações do DOM atrelados àquela tela).
*Obs: A injeção nas views do Blade deve ocorrer via as diretivas do layout base como `@push('styles')` ou via agrupamento assíncrono usando o Vite (`@vite(['resources/css/pages/login.css', 'resources/js/pages/login.js'])`).*

## 2. Fundações Globais e Design System
Antes de gerar qualquer view individual, o projeto carece obrigatoriamente da infraestrutura base:
- **`global.css` (O Centro de Variáveis):** Deve concentrar exclusivamente a base: Reset (Normalizer), Fontes-base e todas as regras tokenizadas usando CSS Custom Properties no nível raiz (`:root`). Exemplo: `--primary-color`, `--bg-color`. Qualquer alteração visual ampla ocorre apenas neste arquivo.
- **`app.js` (O Orquestrador Geral):** Arquivo que deve carregar lógicas que dizem respeito à existência de toda página. (Setup de headers CSRF, listeners globais).

## 3. Theming Obrigatório: Dark & Light Mode
Todos os novos setups ou layouts desenvolvidos no modelo Vanilla devem conter dualidade de tema por padrão de fábrica:
- **Separação de Módulo:** Deve existir um módulo central focado no tema (`theme-manager.js`).
- **Arquitetura CSS de Tema:** As variáveis dinâmicas devem ser agrupadas e chaveadas usando tanto os sinais de sistema `@media (prefers-color-scheme: dark)` quanto um class/data-atributo raiz no DOM (`<html data-theme="dark">`), permitindo o toggle (alternância) do usuário.
- **Persistência:** A preferência visual do tema deve ser salva pelo JS em `localStorage` (ou sessions) para evitar flicagens visuais repentinas na troca de rotas.

## 4. O Gatekeeper do Google Stitch
Ao acionar o **Stitch MCP** para geração das telas usando `generate_screen...`:
1. Mapeie diretamente as escolhas do Stitch via a ferramenta `apply_design_system` pro seu `global.css`.
2. Pegue o HTML/CSS gerado e desmembre ativamente de acordo com a nossa "Regra de Ouro" (item 1).
3. Converta blocos html comuns da visão do Stitch (Ex: um botão estilizado, ou input com floating label) para anônimos Blade (`<x-button>`, `<x-input>`), garantindo que o Stitch sirva como *Gerador de Wireframes Rápido*, mas o Código de Lógica seja sempre nosso padrão Laravel de Alta Qualidade.
