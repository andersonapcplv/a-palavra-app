# A Palavra — Aprendendo as Escrituras

Aplicativo gratuito de leitura e estudo bíblico, com a Bíblia Livre N4 e recursos offline.

Projeto em desenvolvimento.

## Instruções do pacote

Para usar o ZIP completo, comece por [`LEIA_PRIMEIRO.md`](LEIA_PRIMEIRO.md).

## Continuidade por outra IA

Para outra instância Manus ou outra IA assumir o projeto, leia primeiro [`docs/CONTINUIDADE_PARA_OUTRA_IA.md`](docs/CONTINUIDADE_PARA_OUTRA_IA.md), [`AGENTS.md`](AGENTS.md), [`STATUS.md`](STATUS.md) e [`TESTES.md`](TESTES.md). O manual registra arquitetura, estado do GitHub, decisões editoriais, regras de licença, comandos de validação e próximos passos.

## Baseline técnica importada

A branch `baseline-v0.6-import` contém a baseline técnica do PWA: leitura da Bíblia Livre N4 local, busca, progresso, favoritos, anotações, backup, manifesto PWA e service worker.

Consulte `docs/IMPORTACAO_BASELINE_V0.6.md`, `STATUS.md` e `TESTES.md` para o estado real. A implementação da Regra dos 36 e os estudos certificados ainda não fazem parte desta baseline.

## Validação automática

A branch `main` possui `36_criterios_canonicos.json`, um validador determinístico sem dependências externas e o workflow `.github/workflows/validate.yml`. Isso verifica a integridade básica da baseline e do contrato canônico; não significa que a auditoria editorial dos estudos já esteja implementada.

> O áudio ambiente foi removido da distribuição pública até que sua autorização de redistribuição seja comprovada.

> A aplicação funciona como PWA estático e offline. Uma API só deve ser adicionada quando houver uma função de backend definida e uma forma segura de guardar a credencial.
