# Blueprint da Solucao: Start Inicial Sem Symlink com MCP Global

**Contexto Arquitetural:**
O Obsidian Brain hoje depende de um link simbolico `.brain` dentro de cada projeto e de um `.bat` para criar esse mapeamento. Isso funciona, mas cria atrito no Windows e prende o start inicial ao projeto aberto. A alternativa recomendada e transformar o Brain em uma base global descoberta pelo agente via caminho absoluto + MCP local, usando uma instrucao inicial unica por agente/IDE. O MCP `obsidian-brain-mcp` ja consegue localizar o Brain a partir do proprio `mcp-server/index.js`, entao nao precisa de symlink para funcionar. As configuracoes MCP devem continuar sem segredos reais no repositorio, usando placeholders e templates.

**Arquivos Impactados:**
- `[NEW] Plans/plan-start-inicial-sem-symlink-mcp-global.md`
- `[NEW] brain-bootstrap.md`
- `[NEW] mcp-config/mcp.base.template.json`
- `[NEW] mcp-config/agents/antigravity.template.json`
- `[NEW] mcp-config/agents/claude-desktop.template.json`
- `[NEW] mcp-config/agents/cline-roo.template.json`
- `[NEW] mcp-config/agents/cursor.template.json`
- `[NEW] tools/brain-init.mjs`
- `[MOD] README.md`
- `[MOD] setup-environment.md`
- `[MOD] Skills/mcp-setup.md`
- `[MOD] mcp-server/index.js`
- `[MOD] mcp-server/package.json`
- `[MOD] .gitignore`

**Checklist de Execucao:**
- [ ] 1. Definir o novo contrato de boot: o usuario informa uma vez o caminho absoluto do clone do Brain, e o agente passa a usar esse caminho como `BRAIN_ROOT` global.
- [ ] 2. Criar `brain-bootstrap.md` com a instrucao curta para colar nas instrucoes globais de qualquer IDE/agente, incluindo o caminho absoluto do Brain e a regra: primeiro tentar MCP, depois leitura direta dos arquivos do Brain se o MCP ainda nao estiver configurado.
- [ ] 3. Mudar a documentacao principal para tratar o symlink `.brain` e o `link-brain.bat` como fluxo legado/opcional, nao como caminho principal.
- [ ] 4. Atualizar `setup-environment.md` para o novo start inicial: perguntar ou receber `BRAIN_ROOT`, instalar dependencias do MCP se necessario, registrar MCP na configuracao global do agente atual e validar as ferramentas `list_skills`, `read_file` e `search_brain`.
- [ ] 5. Centralizar os templates MCP em `mcp-config/`, separando um template base padrao de templates especificos por agente quando o formato JSON for diferente.
- [ ] 6. Incluir o servidor local `obsidian-brain-mcp` no template MCP universal, apontando para `<BRAIN_ROOT>/mcp-server/index.js` e passando `OBSIDIAN_BRAIN_ROOT=<BRAIN_ROOT>` no ambiente para deixar o caminho explicito.
- [ ] 7. Preservar os MCPs externos ja documentados em `Skills/mcp-setup.md`, mas manter todas as chaves como placeholders e reforcar que credenciais reais ficam apenas no arquivo local da IDE ou no cofre de senhas.
- [ ] 8. Ajustar `mcp-server/index.js` para aceitar `process.env.OBSIDIAN_BRAIN_ROOT` como prioridade, com fallback para o comportamento atual baseado no diretorio do servidor.
- [ ] 9. Ampliar o MCP para indexar tambem futuras pastas de governanca como `ADRs`, `Workflows` e `Plans`, sem quebrar `Skills` e `Docks`.
- [ ] 10. Criar `tools/brain-init.mjs` como automacao opcional em Node.js, sem `.bat`, sem administrador e sem symlink. Ela deve receber `--brain-root`, detectar o agente quando possivel, fazer backup do JSON antes de editar e injetar/atualizar apenas o bloco `mcpServers` necessario.
- [ ] 11. Criar um modo manual documentado para quando o agente nao puder editar arquivos globais: o usuario copia o JSON gerado do template e cola na configuracao da IDE.
- [ ] 12. Adicionar scripts npm no `mcp-server/package.json` ou na raiz, quando adequado, para facilitar validacao local do MCP sem depender de comando complexo.
- [ ] 13. Atualizar `.gitignore` para ignorar configuracoes locais geradas, backups de MCP, caches e qualquer arquivo que possa conter caminho absoluto ou segredo real.
- [ ] 14. Validar o fluxo em pelo menos dois cenarios: agente abrindo um projeto sem `.brain` e agente abrindo o proprio repositorio do Brain.
- [ ] 15. Documentar a frase operacional final para o usuario: "Meu Obsidian Brain esta em `<CAMINHO_ABSOLUTO>`. Leia `<CAMINHO_ABSOLUTO>/brain-bootstrap.md` e configure seu MCP global.".

**Decisao Recomendada:**
Adotar o modelo `BRAIN_ROOT absoluto + MCP global + bootstrap por agente`. Isso remove a necessidade de symlink por projeto, reduz problemas de permissao do Windows e deixa o Brain disponivel em SISDTIC, SGOPM ou qualquer outro projeto assim que a IDE/agente carregar sua configuracao global.

**Riscos e Mitigacoes:**
- Cada agente tem um arquivo JSON diferente; mitigar com templates especificos e um inicializador opcional que faz backup antes de editar.
- Alguns agentes podem nao permitir escrita fora do workspace; mitigar com caminho manual de copiar e colar o JSON.
- Caminho absoluto muda quando o repositorio e clonado em outra pasta; mitigar fazendo o start perguntar `BRAIN_ROOT` uma unica vez e gravar apenas em configuracao local, nunca no repositorio.
- MCPs externos exigem segredos; mitigar mantendo placeholders no repo e documentando o uso de cofre de senhas.