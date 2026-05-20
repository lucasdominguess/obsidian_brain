# Blueprint da Solução: Análise e Otimização das Skills de Código

**Contexto Arquitetural:**
Análise das skills fundamentais de engenharia (`skill-back`, `skill-layers`, `skill-front`, `skill-secur`) com foco na nova arquitetura do *Obsidian Brain MCP*. O objetivo é eliminar redundâncias (DRY), reduzir o custo de context window (tokens) e melhorar a separação de responsabilidades.

**Arquivos Impactados (Propostos):**
- `[MOD] Skills/skill-back.md`
- `[MOD] Skills/skill-layers.md`
- `[NEW] Docks/code-snippets/` (Pasta opcional para offload de código)

**Análise do Cenário Atual:**
1. O arquivo `skill-back.md` sofre de redundância. Ele explica brevemente o que são Controllers, Services e DTOs, mas logo em seguida manda a IA ler a `skill-layers.md` para ver a mesma coisa em profundidade. Isso gasta tokens duas vezes.
2. O arquivo `skill-layers.md` é gigantesco (quase 300 linhas e 10KB). Ele possui a teoria e os *exemplos de código extensos*. Se a IA precisar ler o arquivo para entender a arquitetura, o custo de tokens será altíssimo.
3. As skills de Front e Secur estão excelentes, curtas e diretas ao ponto. Não exigem alterações drásticas.

**Checklist de Execução (Melhorias Necessárias):**
- [ ] 1. **Limpeza do `skill-back.md`**: Remover o detalhamento da "Seção 2" (onde explica as camadas de forma rasa) e transformá-la apenas em um "Ponteiro Rigoroso" que force a IA a pesquisar via MCP pela `skill-layers` apenas quando for manipular essas estruturas.
- [ ] 2. **Desacoplamento Visual no `skill-layers.md`**: O arquivo é pesado devido aos exemplos de código (````php`). A melhoria real aqui é manter as regras e a tabela de antipadrões, mas mover os exemplos de código (como escrever o DTO na prática) para arquivos menores dentro de `Docks/code-snippets/` (ex: `Docks/code-snippets/dto-pattern.md`). A `skill-layers` apenas referenciará eles. Isso reduz o arquivo principal pela metade.
- [ ] 3. **Instrução de Economia em todas as skills**: Adicionar uma metaprompting na raiz das skills: "Sempre prefira usar `search_brain` para dúvidas pontuais ao invés de ler o arquivo inteiro".
