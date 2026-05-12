# Obsidian Brain - Integração com Agentes de IA

Este repositório atua como a **Base de Conhecimento Central (Digital Garden)** para padronização de arquitetura, skills e regras de negócio. 
O objetivo deste setup é permitir que qualquer Agente de IA (Antigravity, Cursor, Copilot, Cline) tenha acesso cirúrgico e otimizado ao seu conhecimento, mantendo um padrão de stack unificado independente do computador, IDE ou ferramenta que você estiver usando.

## 🧠 Arquitetura: Symlink + Servidor MCP Local

Nossa estrutura foi desenhada para resolver os dois maiores gargalos no uso de IAs com bases de conhecimento:

1. **O Problema dos Caminhos (Resolvido via Symlink):** 
   Para evitar que a IA se perca buscando caminhos absolutos (*hardcoded*) que mudam a cada máquina, utilizamos **Links Simbólicos**. O repositório é mapeado como uma "pasta fantasma" chamada `./.brain/` dentro dos seus projetos de desenvolvimento.
   
2. **O Problema de Tokens e Contexto (Resolvido via MCP Local):** 
   A IA não precisa (e não deve) ler arquivos Markdown gigantes de 10KB apenas para tirar uma dúvida simples. Embutido neste repositório existe o `mcp-server/` (Model Context Protocol). Um servidor local em Node.js que fornece ferramentas como `search_brain`. A IA pergunta o que quer, e o MCP devolve **apenas o parágrafo exato**, economizando milhares de tokens.

---

## 🚀 Passo a Passo de Setup em Novos Computadores/Projetos

### 1. Clonar este repositório (O Cofre)
Certifique-se de que este repositório do Obsidian foi clonado na sua máquina nova. O local físico não importa, desde que você saiba onde está.

### 2. Criar o Mapeamento no Projeto Alvo
Abra o terminal na raiz do projeto onde você deseja dar "consciência" à IA (seu projeto Laravel, Node, etc).

> ⚠️ **Nota sobre SO:** O script automatizado (`link-brain.bat`) fornecido aqui é para Windows (requer terminal aberto como Administrador ou Modo de Desenvolvedor).

**No Windows:**
Arraste o arquivo `link-brain.bat` (localizado na raiz deste repositório) para o terminal do seu projeto e aperte `Enter`. O script criará o symlink local e automaticamente instalará as dependências do Servidor MCP.

**No Linux/macOS:**
No terminal do projeto, execute o comando nativo:
```bash
ln -s /caminho/absoluto/para/o/Obsidian .brain
cd .brain/mcp-server && npm install --strict-ssl=false
```

### 3. Autoconfiguração da IA (A Mágica)
Acesse a sua IDE (com o Agente IA aberto no projeto alvo) e mande **exatamente este prompt** no chat:

> *"Leia o arquivo `./.brain/setup-environment.md` e execute as configurações."*

A própria IA vai ler o manual, se autoconfigurar no servidor MCP, atualizar seu `.gitignore` e preparar todo o terreno.

---

## 📂 Estrutura do Conhecimento

Para manter as coisas organizadas para a IA e para humanos:

- `Skills/`: Onde ficam os padrões de projeto, arquitetura, prompts sistêmicos e regras de linting (ex: `skill-front.md`, `skill-core.md`).
- `Docks/`: Documentações de apoio mais extensas e manuais de APIs.
- `mcp-server/`: O "bibliotecário" digital escrito em Node.js que indexa os arquivos acima.

---

## ✍️ Regras para Escrever Novas Skills

Para manter o repositório portátil e independente de máquina, **NUNCA utilize caminhos absolutos** (`C:\User\...` ou `/home/...`) dentro das suas anotações ou "skills".
A IA sempre deve ler os arquivos através das ferramentas do MCP ou usando o caminho relativo do symlink.

**Exemplo de instrução dentro de uma nota:**
```markdown
Busque as regras de design no arquivo: `./.brain/Skills/skill-front.md`
```
