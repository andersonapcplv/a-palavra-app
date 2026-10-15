# A Palavra — Pacote completo com instruções

## O que é este pacote

Este ZIP contém o código-fonte atual do aplicativo **A Palavra — Aprendendo as Escrituras**, a Bíblia N4, imagens, testes, documentação e instruções para outra pessoa ou outra inteligência artificial continuar o projeto.

O projeto é um PWA estático. Não precisa de banco de dados, servidor de aplicação ou conta de API para funcionar na versão atual.

## Como usar rapidamente

### Opção 1 — Abrir a prévia já disponível

Use este endereço temporário:

https://8000-i3in7xqq4s50aal1hmxei-34172223.us4.manus.computer/?v=2cbbd54

A prévia depende do ambiente atual e não é um endereço permanente de produção.

### Opção 2 — Executar no computador

Instale o Node.js apenas se quiser executar os testes. Para visualizar o PWA, Python já é suficiente.

Entre na pasta que contém `index.html` e execute:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Depois abra no navegador:

```text
http://localhost:8000
```

Não abra o arquivo diretamente com `file://`, porque o service worker e o modo offline não funcionam corretamente dessa maneira.

### Opção 3 — Usar o GitHub

Repositório oficial:

https://github.com/topdream-maker/a-palavra-app-

Clone o projeto:

```bash
git clone https://github.com/topdream-maker/a-palavra-app-.git
cd a-palavra-app-
```

A branch principal é `main`.

## Como validar o projeto

Depois de clonar ou modificar os arquivos, execute:

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

O teste deve informar:

```text
OK: baseline válida — 66 livros, 1189 capítulos, 31102 versículos, 36 gates
```

O GitHub Actions também executa essa validação automaticamente após um push.

## Como usar o aplicativo

No aplicativo é possível:

- abrir os 66 livros da Bíblia;
- escolher livro e capítulo;
- usar os botões rápidos de capítulo;
- saltar diretamente para um versículo;
- pesquisar palavras e expressões;
- salvar capítulos favoritos;
- marcar versículos com destaque colorido;
- acompanhar o plano de Marcos;
- escrever anotações privadas;
- exportar e importar backup local;
- instalar como PWA, quando o navegador permitir;
- usar a leitura offline depois do carregamento inicial;
- ligar opcionalmente a música ambiente em Recursos e Preferências (desligada por padrão, sem autoplay).

As anotações, favoritos, progresso e marcações ficam no dispositivo. Não existe sincronização entre aparelhos nesta versão.

## Ordem recomendada para outra IA continuar

1. Ler `docs/CONTINUIDADE_PARA_OUTRA_IA.md`.
2. Ler `AGENTS.md`, `STATUS.md` e `TESTES.md`.
3. Executar os testes antes de modificar qualquer coisa.
4. Fazer uma alteração pequena e verificável.
5. Executar novamente os testes.
6. Atualizar a documentação quando uma decisão de produto ou licença mudar.
7. Fazer commit e push somente depois da validação.

## Cuidados importantes

Os estudos ainda não foram gerados pelas APIs nem auditados. O piloto provisório Marcos 1:1–3:15 (88 versículos) tem uma entrada de geração preparada, mas não contém um estudo aprovado. Não apresentar rascunhos como conteúdo aprovado.

Cada conteúdo deve passar exatamente por Gemini Flash e Groq `openai/gpt-oss-120b`; os dois precisam aprovar todos os 36 critérios. Se um falhar ou houver divergência, o conteúdo fica bloqueado; não existe terceiro auditor nem aprovação por maioria. Com dois passes e verificações determinísticas/hash, publicar diretamente no aplicativo conforme a instrução do proprietário.

Não substituir o corpus bíblico sem verificar licença, origem e integridade. Manter os créditos da Bíblia Livre conforme o aplicativo já informa.

O PWA inclui “Art Of Silence V2”, de Uniq, sob CC BY 4.0, com atribuição; consulte `docs/AUDIO_CREDITS.md`. Não substituir a faixa sem registrar licença, origem e autorização de redistribuição compatível.

Não colocar chaves, tokens ou senhas no código, ZIP público, chat ou JavaScript do navegador. O leitor PWA funciona sem API; chamadas de geração/auditoria devem rodar em backend/CI protegido, com Secrets do GitHub.

## Documentos principais

- `docs/CONTINUIDADE_PARA_OUTRA_IA.md`: manual técnico completo para continuidade.
- `AGENTS.md`: regras para agentes e IAs que trabalharem no código.
- `docs/AVALIACAO_PROJETO_2026-10-15.md`: avaliação técnica, riscos e prioridades.
- `docs/ANALISE_MUSICA_INSTRUMENTAL.md`: análise das opções de licenciamento de áudio.
- `docs/PLANO_REGRA_DOS_36_API_E_AUDITORIA.md`: regra dos 36 critérios e gate duplo.
- `docs/PLANO_OPERACIONAL_GERACAO_AUDITORIA_PUBLICACAO.md`: plano de geração, auditoria e publicação direta.
- `docs/DOSSIE_CONTINUIDADE_2026-10-15.md`: dossiê para a próxima IA.
- `content/queue/` e `runs/`: fila e entrada do piloto provisório preparado para Qwen.
- `STATUS.md`: estado atual resumido.
- `TESTES.md`: evidências e pendências de teste.
- `README.md`: apresentação do repositório.

## Estado conhecido

A aplicação está em condição de protótipo funcional avançado. A publicação permanente ainda depende da escolha e configuração de hospedagem. O teste físico em Android continua recomendado antes de declarar o produto pronto.
