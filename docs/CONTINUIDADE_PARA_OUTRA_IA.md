# A Palavra — Manual de continuidade para outra IA

**Última atualização:** 15 de outubro de 2026
**Branch de trabalho:** `main`
**Repositório:** https://github.com/topdream-maker/a-palavra-app-
**Último commit:** `2cbbd54` — separa os itens Sobre e Apoiar no menu

## Regra principal

Este projeto deve avançar de forma incremental. Não substituir o corpus bíblico, não inventar estudos temáticos e não declarar conteúdo como auditado sem fonte, revisão e registro. Antes de alterar o comportamento, ler `STATUS.md`, `TESTES.md` e este documento.

## Como abrir e validar

```bash
git clone https://github.com/topdream-maker/a-palavra-app-.git
cd a-palavra-app-
node --check app.js
node --check sw.js
node tests/validate-baseline.mjs
```

Para uma prévia local simples:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

A aplicação precisa ser servida por HTTP ou HTTPS. Abrir `index.html` diretamente com `file://` não representa o comportamento real do PWA e impede o service worker.

## O que existe hoje

O aplicativo é um PWA estático em HTML, CSS e JavaScript, sem framework e sem backend obrigatório. O conteúdo bíblico fica em JSON local. O estado do usuário fica em `localStorage`.

Já estão implementados: Bíblia Livre N4 completa, busca local, seleção de livro e capítulo, acesso rápido aos capítulos, salto para versículo, resultados de busca que apontam para versículo, favoritos de capítulo, progresso do plano de Marcos, anotações, exportação/importação de backup, preferências, navegação offline e identidade visual com imagens WebP.

O leitor também possui marcação colorida por versículo. As marcações usam a chave local `ap-bible-highlights-v1` e não são sincronizadas entre dispositivos.

## Estrutura dos arquivos

- `index.html`: shell do PWA, cabeçalho, navegação inferior e menu lateral.
- `app.js`: renderização das telas, navegação, leitor bíblico, busca e persistência local.
- `styles.css`: identidade visual, responsividade, leitor, cartões e marcações.
- `sw.js`: instalação, atualização e cache offline.
- `manifest.webmanifest`: metadados de instalação.
- `data/biblia-livre-n4.json`: corpus completo usado pelo leitor.
- `data/marcos-n4.json`: corpus usado no plano de leitura de Marcos.
- `data/biblia-livre-n4-origem.json`: manifesto de origem do corpus.
- `36_criterios_canonicos.json`: contrato dos 36 gates canônicos.
- `tests/validate-baseline.mjs`: validação determinística sem dependências externas.
- `.github/workflows/validate.yml`: validação automática no GitHub Actions.
- `docs/AVALIACAO_PROJETO_2026-10-15.md`: diagnóstico técnico e riscos.
- `docs/ANALISE_MUSICA_INSTRUMENTAL.md`: decisão de licenciamento do áudio.
- `docs/PLANO_REGRA_DOS_36_API_E_AUDITORIA.md`: modelo de geração, auditoria dupla e publicação estática direta após aprovação e validação.

## Estado editorial

Os estudos temáticos ainda estão em preparação; nenhum foi gerado ou aprovado pelas APIs nesta cópia de trabalho. O proprietário autorizou geração e definiu o fluxo de aprovação. Cada unidade de conteúdo só pode ser publicada após aprovação dos dois auditores fixos e validação determinística.

O modelo vigente, definido pelo proprietário, usa **exatamente duas APIs para auditoria: Gemini Flash e Groq `openai/gpt-oss-120b`**. Ambas precisam aprovar cada um dos 36 critérios. Não existe terceira API de auditoria, voto de desempate, maioria, substituto automático ou aprovação parcial. Cloudflare não participa deste fluxo. Se ambas aprovarem todos os gates e a validação de integridade passar, o conteúdo deve seguir diretamente à publicação no app conforme a instrução do proprietário; não inserir uma etapa adicional de aprovação manual. Qualquer fail, review, unknown, ausência de resposta, erro ou `429` bloqueia e mantém o item na fila.

A Bíblia Livre N4 deve continuar com seus créditos e licença conforme já documentado no aplicativo e no manifesto de origem. Não misturar texto bíblico, conteúdo autoral novo e referências editoriais sem deixar a origem clara.

## Estado visual

A tela inicial usa `assets/hero-paz-piloto.webp`. A tela de reflexão usa `assets/reflexao-paz-piloto.webp`. O apoio institucional usa `assets/quadro-institucional-piloto.webp`. Os cartões de temas reutilizam essas imagens com gradientes; não gerar novas imagens sem necessidade, pois a cota de geração foi limitada anteriormente.

## Música ambiente

Faixa incluída: `assets/audio/uniq-art-of-silence-v2.ogg`, “Art Of Silence V2”, de Uniq, CC BY 4.0. Créditos, URL, data de obtenção e hash SHA-256 estão em `docs/AUDIO_CREDITS.md`; análise em `docs/ANALISE_MUSICA_INSTRUMENTAL.md`.

O controle é opcional, começa desligado, não usa autoplay e limita volume a 30%. O service worker armazena a faixa offline. Testes reais de audição, instalação e uso offline no Android ainda estão pendentes.

## GitHub e publicação

Repositório remoto declarado: `https://github.com/topdream-maker/a-palavra-app-`, branch `main`. Esta pasta de trabalho veio de um ZIP, não tem `.git` e não foi enviada ao GitHub. A integração/credencial GitHub disponível nesta execução tem somente permissão de leitura (`viewerPermission: READ`); não afirmar que as mudanças locais já estão no remoto.

A prévia do sandbox é temporária:

https://8000-i3in7xqq4s50aal1hmxei-34172223.us4.manus.computer/?v=2cbbd54

Ela não deve ser tratada como endereço permanente de produção. GitHub Pages ainda não foi habilitado por falta do escopo necessário na integração utilizada anteriormente. A publicação permanente pode ser feita pelo proprietário no GitHub Pages ou em outro host estático.

## API: decisão para continuidade

O PWA de leitura permanece estático. O fluxo editorial planejado é externo ao navegador: Qwen no Kaggle gera rascunho; Gemini Flash e Groq `openai/gpt-oss-120b` auditam; um gate determinístico exige `pass` nas 36 regras por ambos e hash idêntico do conteúdo auditado; só então o material é publicado no PWA. Foi preparada uma entrada provisória para Marcos 1:1–3:15 (88 versículos) em `runs/piloto-marcos-1-1-3-15/generation-input.json`; ela ainda não foi submetida ao Qwen. As chaves não podem entrar no frontend nem no repositório.

O usuário informou ter preparado Gemini, Cloudflare e Groq. As variáveis `GEMINI_API_KEY`, `GROQ_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `KAGGLE_API_TOKEN` não estavam presentes no ambiente desta execução. Não foi possível chamar os provedores, inspecionar valores ou confirmar os Secrets no GitHub. Cloudflare permanece fora da auditoria. Não pedir chaves no chat; executar chamadas por Secrets do GitHub Actions depois de obter acesso de escrita/admin à configuração e implementar o workflow.

## Próximos passos recomendados

1. Obter acesso de escrita/admin ao repositório ou transferir esta cópia para um clone Git autorizado.
2. Implementar a pipeline segura Qwen/Kaggle → duas APIs fixas (Gemini e Groq) → validação dos 36 gates/hash → publicação no app após dupla aprovação; não chamar APIs antes de configurar Secrets.
3. Confirmar ou alterar com o proprietário o intervalo proposto Marcos 1:1–3:15 para o piloto de 88 versículos antes da execução real no Kaggle.
4. Medir tokens e cotas reais no piloto; `50–66 unidades/dia` é só estimativa Groq baseada em 3–4k tokens/unidade e 200k tokens/dia, não desempenho medido.
5. Testar a faixa CC BY 4.0, instalação/offline, controles de áudio e consumo de cache no Android.
6. Testar atualização do service worker em duas versões consecutivas e escolher hospedagem permanente.

## Critérios de aceite antes de declarar pronto

A nova versão deve passar `node --check app.js`, `node --check sw.js`, `node --check scripts/validate-audit-package.mjs`, `node --check scripts/prepare-study-generation.mjs`, `node tests/validate-baseline.mjs`, `node tests/validate-audit-policy.mjs` e `node tests/validate-generation-input.mjs`, além do workflow do GitHub. No navegador, validar leitura bíblica, busca, marcações, navegação, controle de áudio e reprodução sem autoplay.

No Android, deve ser possível instalar, abrir sem rede, ler o corpus, marcar versículos, salvar anotação, fechar e reabrir sem perda dos dados locais.

## O que não fazer

Não colocar chaves de API no frontend, no chat ou em commits. Não chamar Cloudflare como terceiro auditor. Não aprovar com um único pass, majority vote, resultado `unknown`, ou erro/indisponibilidade. Não publicar conteúdo cujo hash seja diferente do texto auditado pelas duas APIs. Não exibir rascunhos pendentes como estudos aprovados. Não substituir o corpus por uma tradução sem verificar licença. Não usar publicidade ou Pix dentro da tela Sobre. Não apagar dados locais do usuário em uma atualização.
