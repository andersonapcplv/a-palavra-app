# Instruções para agentes neste repositório

Leia primeiro `docs/CONTINUIDADE_PARA_OUTRA_IA.md`, `STATUS.md` e `TESTES.md`.

Faça mudanças pequenas, verificáveis e em português brasileiro. Preserve o corpus bíblico e seus créditos. Gere rascunhos somente conforme a fila/prompt editorial e a passagem-fonte; nunca exiba como aprovado conteúdo ainda não auditado. Só publique depois dos passes de Gemini Flash e Groq `openai/gpt-oss-120b` em todos os 36 critérios e das validações determinísticas/hash. Não adicione áudio sem licença documentada. Não coloque segredos, tokens ou chaves de API no código, nos commits, no ZIP público ou em arquivos públicos.

Antes de concluir qualquer alteração, execute:

```bash
node --check app.js
node --check sw.js
node --check scripts/prepare-study-generation.mjs
node --check scripts/validate-audit-package.mjs
node tests/validate-baseline.mjs
node tests/validate-audit-policy.mjs
node tests/validate-generation-input.mjs
git diff --check
```

Se alterar a interface, atualize a versão de cache/recurso quando necessário, atualize a prévia e verifique a navegação em viewport móvel. Se alterar conteúdo ou regras do produto, registre a decisão em `docs/`.

O remoto oficial é `https://github.com/topdream-maker/a-palavra-app-.git`, na branch `main`.
