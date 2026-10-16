# Plano operacional — geração, auditoria dupla e publicação

**Projeto:** A Palavra — Aprendendo as Escrituras
**Data:** 15/10/2026
**Decisão vigente do proprietário:** usar exatamente duas APIs disponíveis entre Gemini, Groq e Cloudflare para auditar os 36 critérios; qualquer par aprovado pode publicar diretamente após dupla aprovação e validações. Se menos de duas estiverem disponíveis, pausar a auditoria. Quando uma API retornar, ela poderá voltar ao par sem reauditar estudos já aprovados.

## 1. Estado de prontidão

- **Planejamento e entrada para geração:** preparados localmente.
- **Piloto proposto:** Marcos 1:1–3:15, exatamente 88 versículos consecutivos segundo o corpus N4. Esta é uma escolha operacional provisória para iniciar; o proprietário pode trocar o trecho antes da geração real.
- **Texto gerado por Qwen:** ainda não. A entrada pronta para Qwen está em `runs/piloto-marcos-1-1-3-15/generation-input.json`.
- **Auditorias Gemini/Groq:** não iniciadas; nenhum conteúdo foi aprovado.
- **Publicação automática:** não implementada ainda.
- **Credenciais:** variáveis Gemini, Groq, Kaggle e Cloudflare estavam ausentes da sandbox; `kaggle` CLI e `~/.kaggle/kaggle.json` também ausentes. Não chamar API sem configuração segura.

## 2. Escolha provisória do piloto

O plano recebido pelo proprietário mede capacidade em unidades de 88 versículos, sem indicar a passagem. Para avançar sem fixar uma decisão editorial irreversível, foi proposto o começo do Evangelho de Marcos:

- Marcos 1 contém 45 versículos;
- Marcos 2 contém 28;
- Marcos 3:1–15 contém 15;
- total: **88 versículos**.

O preparador confirma a contagem diretamente no corpus. A propriedade `provisional_target: true` permanece no arquivo de fila e na entrada. Se o proprietário preferir outro trecho, atualizar referência e regenerar a entrada antes de executar Qwen; não reaproveitar rascunho ou aprovação de outro intervalo.

## 3. Componentes entregues

- Pedido de fila: `content/queue/piloto-marcos-1-1-3-15.json`.
- Instruções de geração: `prompts/GENERATE_STUDY_PILOT.md`.
- Preparador determinístico do texto-fonte e dos critérios: `scripts/prepare-study-generation.mjs`.
- Entrada preparada para o gerador: `runs/piloto-marcos-1-1-3-15/generation-input.json`.
- Validador de dois auditores/hash: `scripts/validate-audit-package.mjs`.
- Teste de fila/contagem: `tests/validate-generation-input.mjs`.
- Teste da regra Gemini + Groq: `tests/validate-audit-policy.mjs`.

Reexecutar `node scripts/prepare-study-generation.mjs` após alterar a fila para produzir uma nova entrada. O script é local, lê o corpus e a lista canônica dos 36 critérios, e **não faz chamada de rede**.

## 4. Pipeline de produção a implementar

### Etapa A — gerar no Qwen/Kaggle

1. Carregar `generation-input.json` no ambiente autorizado do Kaggle.
2. Executar apenas o Qwen selecionado pelo plano; registrar ID/versão do modelo, notebook/commit, data e parâmetros.
3. Validar JSON de saída contra `content_schema`; não aceitar texto livre inválido.
4. Salvar o texto exato gerado como versão imutável e calcular SHA-256 UTF-8.
5. Marcar `draft`/`awaiting_audit`; não expor no PWA público.

A sandbox não tem Kaggle CLI, token ou sessão Kaggle. Não se alega que a geração foi executada nesta sessão.

### Etapa B — chamar as duas auditorias em separado

1. Detectar quais entre Gemini, Groq e Cloudflare estão disponíveis.
2. Selecionar exatamente duas APIs; se houver menos de duas, pausar sem publicar.
3. Montar para cada API selecionada exatamente a mesma passagem, o mesmo texto e o mesmo contrato.
3. Nenhum auditor vê a resposta ou decisão do outro antes de concluir.
4. Cada auditor retorna, para cada ID canônico, decisão `pass`, `fail`, `review` ou `unknown` e evidência textual curta ligada ao conteúdo e à passagem.
5. Armazenar resposta bruta, modelo, IDs de requisição (sem dados sensíveis), horário, uso de tokens, versão do prompt e erros em `evidence/<study_id>/`.
6. Somente as duas APIs selecionadas contam. Não há terceiro voto, maioria ou aprovação parcial; a substituição entre as três APIs é automática e autorizada pelo proprietário.

Secrets necessários: `GEMINI_APK_KEY`/`GEMINI_API_KEY`, `GROQ_API_KEY`, `CLOUDFLARE_AI_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. As chaves não podem aparecer no app, logs, artifacts públicos, ZIP ou chat.

### Etapa C — gate determinístico

- Exigir exatamente dois auditores, formando um dos pares permitidos: Gemini + Groq, Cloudflare + Groq ou Cloudflare + Gemini.
- Validar JSON, conteúdo não vazio, referência, 36 IDs sem extras, evidência não vazia, data válida e `decision === "pass"` em todas as entradas.
- Recalcular hash do texto congelado e exigir igualdade com o texto que cada auditor recebeu e com o texto do artefato destinado ao PWA.
- Resultado `fail`, `review`, `unknown`, erro de transporte, timeout, JSON parcial, 429, cota esgotada ou divergência de hash = `blocked`/pendente. Nunca transformar falha em aprovação.
- A tentativa de correção/regeneração pode ser limitada a três ciclos conforme o plano recebido. Depois do limite, manter bloqueado e registrar para o proprietário; não publicar.

O validador local já implementa a maioria destes requisitos para pacotes já produzidos, mas ainda não valida contra o corpus a referência e não faz chamadas de API. Esses dois passos precisam ser incorporados antes de habilitar publicação automática.

### Etapa D — publicação direta no PWA

Após `approved_for_publication` e validação de integridade:

1. Anexar o item ao manifesto/JSON público de estudos e guardar o pacote de evidências não público/separado.
2. Atualizar versão do cache/service worker e executar testes de conteúdo.
3. Publicar o build estático via GitHub Pages/host escolhido.
4. Registrar commit/deploy, hash, URL e horário.

O proprietário determinou que a dupla aprovação e os checks técnicos bastam; não criar revisão humana obrigatória adicional. Até esta sessão, essa etapa automática de build/deploy não existe e as alterações locais não foram enviadas ao GitHub.

## 5. Segurança e custos

- Não habilitar cobrança nem inserir cartão durante a configuração de API gratuita.
- Não colocar chaves no ZIP destinado a distribuição. Só os nomes esperados dos Secrets aparecem neste documento.
- Gemini free tier pode ter tratamento de dados diferente do tier pago; o texto é editorial público sem dados pessoais, mas confirmar termos atuais antes da primeira execução real.
- Configurar concorrência baixa, fila idempotente, limites por dia e pausa segura em 429.
- O estimado anterior de Groq (200.000 tokens/dia; 3.000–4.000 tokens/unidade → 50–66 unidades/dia) não foi medido. A resposta dos 36 gates e o prompt podem elevar tokens de saída; o piloto deve medir entrada e saída de cada provedor. A capacidade real é o menor limite entre Gemini, Groq, Kaggle e pipeline.
- Não prever prazo de toda a Bíblia antes da primeira execução, medir tokens e confirmar se unidade de 88 versículos é viável editorialmente.

## 6. Comandos de verificação

```bash
node scripts/prepare-study-generation.mjs
node tests/validate-generation-input.mjs
node tests/validate-audit-policy.mjs
node tests/validate-baseline.mjs
node --check scripts/prepare-study-generation.mjs
node --check scripts/validate-audit-package.mjs
node --check app.js
node --check sw.js
```

Os testes são determinísticos e não consomem APIs. O workflow de validação do GitHub foi atualizado para executar o novo teste de preparação. Antes de chamar APIs ou ativar publicação, testar todo o fluxo com fixtures falsas e provar que qualquer falta/erro bloqueia.

## 7. Início efetivo a partir desta sessão

O trabalho começou com uma entrada concreta preparada a partir do corpus: **Marcos 1:1–3:15, 88 versículos, 36 critérios incluídos**. Isso é planejamento e preparação de entrada, não geração Qwen, não conteúdo final, não auditoria e não publicação. O próximo passo com capacidade real de geração é conectar o Kaggle de forma segura. Depois, as credenciais dos dois auditores precisam estar disponíveis no runner protegido para iniciar as auditorias reais.

## 8. Referências úteis

- Projeto e decisões: `docs/DOSSIE_CONTINUIDADE_2026-10-15.md`.
- Regra dos 36: `docs/PLANO_REGRA_DOS_36_API_E_AUDITORIA.md` e `36_criterios_canonicos.json`.
- Limites/capacidade: `docs/SELECAO_APIS_GRATUITAS_GERACAO_AUDITORIA.md`.
- Limites Groq: https://console.groq.com/docs/rate-limits
- Limites Gemini: https://ai.google.dev/gemini-api/docs/rate-limits
- Licença da Bíblia N4: ver créditos e manifesto de origem no aplicativo/pacote.
