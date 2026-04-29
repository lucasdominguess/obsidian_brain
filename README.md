# Obsidian Brain - Integração com Agentes de IA

Este repositório atua como a **Base de Conhecimento Central (Digital Garden)** para padronização de arquitetura, skills, e regras de negócio. 
O objetivo deste setup é permitir que qualquer Agente de IA (Antigravity, Cursor, Copilot,VsCode) ou IDE tenha acesso total ao conhecimento armazenado aqui de forma transparente e isolada em cada projeto, resolvendo problemas de sincronismo.

## Como funciona (A Arquitetura de Symlink)

Para evitar que a IA se perca buscando caminhos absolutos (hardcoded) em cada máquina diferente, utilizamos **Links Simbólicos (Symlinks)**.
Isso cria uma "pasta fantasma" dentro do seu projeto que aponta diretamente para este repositório, permitindo que a IA acesse o conhecimento localmente de forma relativa (ex: `./.brain/Skills/`).

---

## 🚀 Passo a Passo de Setup em Novos Projetos

### 1. Clonar este repositório (O Brain)
Certifique-se de que este repositório do Obsidian foi clonado na sua máquina atual. O local físico não importa, desde que você saiba onde está.

### 2. Criar o Mapeamento no Projeto Alvo
Abra o terminal na raiz do projeto onde você deseja dar "consciência" à IA (seu projeto Laravel, Node, etc).

> ⚠️ **Nota sobre SO:** O script automatizado (`link-brain.bat`) fornecido aqui é exclusivo para **Windows** (requer terminal aberto como Administrador ou Modo de Desenvolvedor ativado). 

**Se estiver no Windows:**
Arraste o arquivo `link-brain.bat` (localizado na raiz deste repositório) para o terminal do seu projeto e aperte `Enter`. O script fará o mapeamento automaticamente descobrindo o caminho.

**Se estiver no Linux/macOS:**
No terminal do projeto, execute o comando nativo de symlink apontando para onde você clonou este repositório:
```bash
# Exemplo (substitua pelo caminho correto do Obsidian na sua máquina)
ln -s /caminho/absoluto/para/o/Obsidian-LD .brain
```

### 3. Isolar o Git do Projeto
Acesse o arquivo `.gitignore` do seu projeto de desenvolvimento (não deste repositório) e adicione a pasta criada para evitar subir suas anotações junto com o código-fonte:
```gitignore
/.brain/
```

### 4. Instruir a IA (O Start Inicial)
Crie um arquivo de regras na raiz do seu projeto (como `.cursorrules` ou `ai-rules.md`) com a instrução base para a IA procurar o conhecimento:

```markdown
# Base de Conhecimento (Brain)
Sempre que iniciar uma task ou precisar de padrões arquiteturais, consulte os arquivos dentro do diretório local `./.brain/`.
- Todos os caminhos da base de conhecimento devem ser tratados de forma relativa (ex: `./.brain/Skills/...`).
```

---

## 🧠 Regras para Escrever Novas Skills no Obsidian

Para manter o repositório portátil e independente de máquina, **NUNCA utilize caminhos absolutos** (`C:\User\...` ou `/home/...`) dentro das suas anotações ou "skills".
Sempre faça com que a IA navegue de forma relativa partindo do diretório `.brain`.

**Padrão Correto:**
```markdown
Busque as regras no arquivo: `./.brain/Skills/skill-front.md`
```
