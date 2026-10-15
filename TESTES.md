# Evidências de teste

## Passou

- Integridade do corpus: 66 livros, 1.189 capítulos e 31.102 versículos.
- SHA-256 dos 36 gates canônicos conforme contrato.
- `node --check app.js` e `node --check sw.js`.
- Validador determinístico `tests/validate-baseline.mjs`.
- `node tests/validate-audit-policy.mjs`: dupla Gemini/Groq, 36 gates, modelos fixos, hash e bloqueio sem terceiro.
- `node tests/validate-generation-input.mjs`: alvo Marcos 1:1–3:15 com 88 versículos e 36 critérios; estado não gerado/auditado/publicado.
- `node scripts/prepare-study-generation.mjs`: entrada local de geração criada sem chamadas de API.
- Licença CC BY 4.0 da faixa instrumental registrada em `docs/AUDIO_CREDITS.md`; hash SHA-256 conferido.
- Prévia HTTP responde com status 200.
- Imagens WebP da tela inicial, reflexão e quadro institucional respondem com status 200.
- Navegação visual verificada: tela inicial, temas, recursos, Sobre e Apoiar o projeto.
- Leitor bíblico atualizado com acesso rápido a capítulos, seletor de versículos e marcação colorida persistente.
- Cartões dos temas verificados com fundos visuais e texto legível na prévia.

## Pendente

- Instalação e uso offline em um Android físico.
- Verificação de atualização do service worker após nova versão.
- Publicação permanente em host estático.
- Geração real no Kaggle/Qwen e auditoria real por Gemini + Groq; nenhuma chamada foi feita nesta sessão.
- Teste de audição, controle de volume e uso offline da música em Android físico.
- Pipeline de publicação automática depois da aprovação dupla.

## Observação

A tentativa anterior de automatizar Chromium diretamente contra o servidor local recebeu `net::ERR_BLOCKED_BY_ADMINISTRATOR`; a prévia navegável do sandbox foi usada para inspeção visual manual assistida.
