# Dossiê de continuidade — A Palavra

**Data:** 15 de outubro de 2026
**Responsável pelo projeto:** Anderson Pereira Cabral
**Repositório indicado pelo proprietário:** https://github.com/topdream-maker/a-palavra-app-
**Cópia de trabalho desta sessão:** `/home/ubuntu/a_palavra` (extraída do ZIP recebido; não é clone Git)
**Estado deste dossiê:** fechamento factual da sessão; alterações locais não foram enviadas ao GitHub nem publicadas.

## 1. Instruções do proprietário — decisões vigentes

Estas decisões são explícitas e prevalecem sobre documentos antigos do pacote que digam algo diferente:

1. **Auditoria: exatamente duas APIs.** Gemini Flash e Groq usando `openai/gpt-oss-120b`.
2. **Aprovação unânime, sem votação:** ambas precisam aprovar todos os 36 critérios. Um `fail`, `review`, `unknown`, erro, resposta ausente/incompleta ou limite excedido bloqueia a unidade. Não aprovar com maioria, não usar terceiro auditor, não substituir automaticamente um dos dois.
3. **Cloudflare não é auditora** e não participa da auditoria. A chave pode existir para outra finalidade futura, mas não entra neste gate.
4. **Publicação direta:** quando os dois auditores aprovarem todos os gates e as validações determinísticas/integridade passarem, o conteúdo aprovado deve seguir diretamente para publicação no aplicativo. O fluxo padrão não deve inserir uma terceira aprovação humana obrigatória.
5. O proprietário informou que preparou as APIs Gemini, Cloudflare e Groq. **Isso não prova que os Secrets estejam configurados no GitHub nem os torna disponíveis nesta execução.** Nunca pedir ou expor valores de chaves em chat, frontend ou commits.
6. Música ambiente instrumental gratuita é desejada se a licença permitir distribuição dentro do aplicativo; atribuição é aceitável.

**Resposta à pergunta “concorda?”:** sim. A política deve aprovar somente com dois `pass` completos, validar que o conteúdo publicado é exatamente o conteúdo auditado e então publicar diretamente. Não há aprovação por 2 de 3 nem gate humano obrigatório.

## 2. Estado real do conteúdo e das APIs

- **Não há estudos gerados nesta sessão.** Os estudos/explicações continuam ausentes do PWA.
- **Nenhuma chamada real a Gemini ou Groq foi executada** e nenhum conteúdo recebeu aprovação das APIs.
- Foi conferida apenas a presença das variáveis de ambiente (sem imprimir valores): `GEMINI_API_KEY`, `GROQ_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `KAGGLE_API_TOKEN` estavam **ausentes** nesta sandbox.
- A verificação local também encontrou o executável `kaggle` e `~/.kaggle/kaggle.json` **ausentes**; não há sessão Kaggle utilizável nesta execução.
- Portanto, o trabalho feito para auditoria é **o contrato/validador local e os testes**, não a geração, chamada de modelos, nem publicação automática.
- O plano de geração anteriormente recebido indica **Qwen executado no Kaggle**. O motor/integração Kaggle não está implementado nem executado nesta cópia.
- Foi preparada uma entrada provisória para **Marcos 1:1–3:15**, exatamente 88 versículos. Essa referência foi escolhida como hipótese operacional e ainda pode ser alterada pelo proprietário antes da geração real. Não há texto gerado por Qwen.
- A estimativa anterior de 50–66 unidades/dia para Groq é teórica, usando 200.000 tokens/dia e 3.000–4.000 tokens por unidade. Ainda não foi medida. Limites efetivos de ambos os provedores dependem das contas, modelos, uso e respostas reais. Ver `docs/SELECAO_APIS_GRATUITAS_GERACAO_AUDITORIA.md` e fontes oficiais ao final.

## 3. Contrato de auditoria implementado localmente

Arquivo principal: `scripts/validate-audit-package.mjs`.

O validador atual:

- Exige as propriedades de auditoria **exatamente** `gemini` e `groq`; terceiro auditor ou substituto bloqueia.
- Exige modelos identificados como família Gemini Flash e `openai/gpt-oss-120b` pela Groq.
- Exige `study_id`, referência bíblica, texto completo `content` e `content_sha256`.
- Calcula SHA-256 de `content` UTF-8 e bloqueia se não corresponder ao hash declarado. O pipeline futuro deve enviar aos dois auditores exatamente o mesmo `content` cujo hash será publicado.
- Exige os 36 IDs canônicos em cada auditoria, data válida, decisão e evidência para cada gate.
- Só retorna `approved_for_publication` se ambos tiverem `pass` em todos os 36 critérios e não houver erro/inconsistência. Qualquer outro resultado retorna `blocked`.

Testes: `tests/validate-audit-policy.mjs`. Cobrem dois passes, um fail, unknown, gate ausente, terceiro auditor, Cloudflare como substituto, modelos errados, evidência vazia e hash incorreto. A estrutura baseline ainda valida o corpus completo com 66 livros, 1.189 capítulos, 31.102 versículos e 36 gates.

**Limite importante:** este validador não chama APIs, não cria estudos, não envia pacotes ao PWA e não executa deploy. Ele é um gate local. A integração de geração, chamadas e publicação direta ainda precisa ser construída.

Estrutura do pacote que o pipeline deve construir (exemplo esquemático):

```json
{
  "study_id": "id-estavel",
  "reference": "referência bíblica do piloto",
  "content": "texto integral e imutável enviado aos dois auditores",
  "content_sha256": "sha256 hex calculado sobre content UTF-8",
  "audits": {
    "gemini": {
      "model": "gemini-...-flash",
      "completed_at": "ISO-8601",
      "gates": { "ID_CANONICO_1": { "decision": "pass", "evidence": "..." } }
    },
    "groq": {
      "model": "openai/gpt-oss-120b",
      "completed_at": "ISO-8601",
      "gates": { "ID_CANONICO_1": { "decision": "pass", "evidence": "..." } }
    }
  }
}
```

Na execução real, cada objeto `gates` deve conter os 36 IDs e evidências; o trecho acima foi encurtado apenas para demonstrar o formato.

## 4. Regra operacional desejada para publicação

Fluxo de produção que falta implementar:

`Qwen/Kaggle → conteúdo congelado + SHA-256 → chamada independente Gemini Flash e Groq GPT-OSS-120B → validação dos 36 gates/modelos/hash → publicar no PWA → registrar pacote e trilha de auditoria`.

Requisitos de implementação para a próxima instância:

- Chaves somente como GitHub Actions Secrets ou variáveis seguras de backend; nunca em JS cliente.
- Os dois auditores recebem a mesma referência, mesmo texto, mesma definição dos 36 critérios e evidências-fonte; não recebem a resposta/decisão do outro.
- Guardar o pacote imutável de auditoria associado ao `study_id`, versão do prompt/modelo e horário.
- Só escrever no conteúdo que o PWA serve após `approved_for_publication`; bloquear completamente parcial, mudança pós-auditoria ou hash divergente.
- Publicar conteúdo aprovado no app diretamente, conforme instrução do proprietário. O conteúdo e os relatórios devem continuar versionados e rastreáveis.
- Tratar 429, indisponibilidade, erro de JSON ou chamada perdida como **pendente/bloqueado**, nunca como aprovação.
- Gerar amostras/testes de CI com respostas falsas para provar os gates, sem consumir APIs.
- Aplicar limite de concorrência e registrar o consumo real de tokens e chamadas; reavaliar a estimativa de capacidade depois do piloto.

## 5. Música ambiente — faixa incorporada

Foi escolhida e adicionada ao PWA a faixa **“Art Of Silence V2”, de Uniq**, identificada como ambient/instrumental. A página individual no Wikimedia Commons indica licença **CC BY 4.0**, que permite compartilhar e adaptar, inclusive comercialmente, com crédito apropriado, link para a licença e indicação de alterações. O app credita autor, obra, origem e licença; o arquivo foi incluído sem edição. [1] [2]

- Arquivo: `assets/audio/uniq-art-of-silence-v2.ogg`
- Formato: Ogg Vorbis; duração aproximada: 4 min 13 s; tamanho: 2.124.894 bytes.
- SHA-256: `5d4d074a62d3d8ed33ab79808c242473ed21ac293fbab17dfe639a1544c9804f`
- Registro de créditos/licença: `docs/AUDIO_CREDITS.md`
- Análise/decisão: `docs/ANALISE_MUSICA_INSTRUMENTAL.md`
- Comportamento: música opcional, desligada por padrão, sem autoplay, ligada somente pelo usuário em Recursos e Preferências, loop e volume ajustável limitado a 30%.
- O arquivo está no cache offline do service worker (`a-palavra-v0.8.0`).
- **Falta teste físico no Chrome Android**: ouvir a faixa e confirmar adequação subjetiva, play/pausa/retomada, offline e ausência de autoplay. A seleção partiu da descrição de origem “ambient, dramatic and cinematic”; a audição de qualidade no dispositivo ainda está pendente.

## 6. Alterações locais feitas nesta sessão

Pasta: `/home/ubuntu/a_palavra`. É uma extração de pacote, não clone Git. Alterações não foram enviadas ao remoto.

- `app.js`: controle de reprodução/pausa e volume da música; crédito no aplicativo; comportamento sem autoplay.
- `index.html`: elemento de áudio persistente.
- `sw.js`: cache versionado para `a-palavra-v0.8.0` e faixa adicionada aos recursos offline.
- `assets/audio/uniq-art-of-silence-v2.ogg`: faixa licenciada.
- `docs/AUDIO_CREDITS.md`: atribuição, licença, fonte, hash e metadados.
- `docs/ANALISE_MUSICA_INSTRUMENTAL.md`: decisão de música atualizada.
- `scripts/validate-audit-package.mjs`: gate dos dois modelos, 36 gates, evidência e hash exato; status `approved_for_publication`.
- `tests/validate-audit-policy.mjs`: testes sem API, incluindo modelos corretos/errados e ausência de terceiro.
- `content/queue/piloto-marcos-1-1-3-15.json`, `prompts/GENERATE_STUDY_PILOT.md` e `scripts/prepare-study-generation.mjs`: fila, prompt e preparador offline do piloto.
- `runs/piloto-marcos-1-1-3-15/generation-input.json`: entrada com texto-fonte N4 e os 36 critérios, pronta para o Qwen, mas ainda não enviada ao gerador.
- `tests/validate-generation-input.mjs`: confirma 88 versículos, 36 critérios e status ainda não gerado/auditado/publicado.
- `tests/validate-baseline.mjs`: baseline exige arquivo/registro de áudio e nova versão do cache.
- `.github/workflows/validate.yml`: executa o teste offline de geração no CI, sem chamar APIs.
- `STATUS.md`, `docs/CONTINUIDADE_PARA_OUTRA_IA.md`, `docs/PLANO_REGRA_DOS_36_API_E_AUDITORIA.md`, `docs/SELECAO_APIS_GRATUITAS_GERACAO_AUDITORIA.md` e `docs/PLANO_OPERACIONAL_GERACAO_AUDITORIA_PUBLICACAO.md`: estados, regras e planejamento atualizados.

## 7. Validação realizada

Validação final executada após incluir os testes de modelos corretos/incorretos:

```text
node --check app.js                         PASS
node --check sw.js                          PASS
node --check scripts/validate-audit-package.mjs PASS
node --check tests/validate-audit-policy.mjs PASS
node --check scripts/prepare-study-generation.mjs PASS
node tests/validate-baseline.mjs            PASS — 66 livros, 1.189 capítulos, 31.102 versículos, 36 gates
node tests/validate-audit-policy.mjs        PASS — Gemini e Groq, sem terceiro auditor/aprovação parcial
node tests/validate-generation-input.mjs    PASS — Marcos 1:1–3:15, 88 versículos, 36 critérios; nenhuma API
sha256sum assets/audio/uniq-art-of-silence-v2.ogg
5d4d074a62d3d8ed33ab79808c242473ed21ac293fbab17dfe639a1544c9804f
```

Todos os comandos acima passaram. A validação não fez chamadas de API. Reexecutar o conjunto depois de qualquer alteração e antes de enviar/deploy.

## 8. Acesso, deploy e limites desta sessão

- O GitHub CLI disponível mostrou acesso de leitura ao repositório, não permissão de escrita/admin.
- A cópia de trabalho `/home/ubuntu/a_palavra` não contém `.git`; não é possível afirmar que algum arquivo local foi commitado, enviado ou publicado.
- Os Secrets do repositório não foram lidos; esta sessão não pode confirmar se existem. O arquivo `~/.kaggle/kaggle.json` e o executável `kaggle` também estão ausentes na sandbox.
- Não foi iniciado teste real de API; nenhuma chave foi pedida no chat.
- A prévia do sandbox é temporária, não endereço de produção. A publicação permanente deve ser feita depois de transferir as alterações para um clone autorizado e configurar deploy.
- Não declarar que existe publicação automática até que o workflow de geração/auditoria/deploy seja implementado e testado com credenciais autorizadas.

## 9. Próximas tarefas ordenadas

1. Reexecutar todos os testes, incluindo os novos casos de modelo incorreto e a preparação offline.
2. Obter clone Git com escrita/admin ou modo seguro de aplicar estas alterações ao remoto do proprietário; revisar diff e preservar os documentos/asset.
3. Confirmar ou alterar com o proprietário o alvo provisório Marcos 1:1–3:15 para o piloto de 88 versículos.
4. Implementar a geração Qwen/Kaggle e o cliente Gemini/Groq usando somente Secrets, respeitando a regra fixa de dois.
5. Provar o fluxo com fixtures sem API; depois executar um piloto real, registrar tokens/limites/erros e medir a cota efetiva de ambas APIs.
6. Após o gate duplo real e validação do hash, publicar diretamente os estudos aprovados no PWA conforme a instrução do proprietário.
7. Testar faixa e uso offline no Android; confirmar controles e adequação sonora.
8. Configurar hosting permanente e validar a atualização do service worker em duas versões.

## 10. Fontes e referências

[1]: https://commons.wikimedia.org/wiki/File:Uniq_-_Art_Of_Silence_V2.ogg "Arquivo individual: Art Of Silence V2, autor e licença CC BY 4.0"
[2]: https://creativecommons.org/licenses/by/4.0/deed.en "Creative Commons Attribution 4.0 International — permissões e atribuição"
[3]: https://console.groq.com/docs/rate-limits "Groq — rate limits; os valores efetivos variam por organização/modelo"
[4]: https://ai.google.dev/gemini-api/docs/rate-limits "Gemini API — limites por modelo/conta"
[5]: https://ai.google.dev/gemini-api/docs/pricing "Gemini Developer API — preços e tratamento dos dados por nível de serviço"
[6]: https://creativecommons.org/legalmusicforvideos/ "Creative Commons — conferir licença individual e atribuição de música"
